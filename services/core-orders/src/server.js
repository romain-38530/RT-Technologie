const http = global.http || require('http');
const https = global.http || require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../../../packages/notify-client/src/index.js');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, limitBodySize, rateLimiter } = require('../../../packages/security/src/index.js');
const { hasFeature, FEATURES } = require('../../../packages/entitlements/src/index.js');

// In-memory stores
const store = {
  orders: new Map(),
  carriers: [],
  vigilance: new Map(),
  dispatchPolicies: new Map(),
  dispatchState: new Map(), // orderId -> { idx, expiresAt, timers: {rem30, rem10, expiry} }
  vigCache: new Map(), // carrierId -> { status, expiresAt }
  invited: new Map(), // industryOrgId -> Set(carrierId)
  orgCache: new Map(), // orgId -> { org, expiresAt }
  origins: new Map(), // ownerOrgId -> [{ id, label, country, city }]
  grids: new Map(),   // ownerOrgId -> [{ origin, mode, lines: [...] }]
};

function loadJSON(p) {
  try {
    const data = fs.readFileSync(p, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load', p, e.message);
    return null;
  }
}

async function loadSeeds() {
  const base = path.resolve(process.cwd(), 'infra', 'seeds');
  if (process.env.MONGODB_URI) {
    try {
      const mongo = require('../../../packages/data-mongo/src/index.js');
      await mongo.connect();
      const db = await mongo.getDb();
      const [orders, carriers, vigs, policies, origins, grids, invit] = await Promise.all([
        db.collection('orders').find({}).toArray(),
        db.collection('carriers').find({}).toArray(),
        db.collection('vigilance').find({}).toArray(),
        db.collection('dispatch_policies').find({}).toArray(),
        db.collection('origins').find({}).toArray(),
        db.collection('grids').find({}).toArray(),
        db.collection('invitations').find({}).toArray(),
      ]);
      (orders||[]).forEach((o)=>store.orders.set(o.id, o));
      store.carriers = carriers || [];
      (vigs||[]).forEach((v)=>store.vigilance.set(v.carrierId, v.status || v.state || 'UNKNOWN'));
      (policies||[]).forEach((p)=>store.dispatchPolicies.set(p.orderId, p));
      (origins||[]).forEach((o)=>{ const arr = store.origins.get(o.ownerOrgId) || []; arr.push(o); store.origins.set(o.ownerOrgId, arr); });
      (grids||[]).forEach((g)=>{ const arr = store.grids.get(g.ownerOrgId) || []; arr.push(g); store.grids.set(g.ownerOrgId, arr); });
      (invit||[]).forEach((r)=>{ const set = new Set(r.invitedCarriers || []); store.invited.set(r.industryOrgId, set); });
      console.log(`[core-orders] Mongo chargés: ${store.orders.size} commandes, ${store.carriers.length} transporteurs.`);
      return;
    } catch (e) {
      console.warn('[core-orders] Mongo indisponible, fallback seeds:', e.message);
    }
  }
  const orders = loadJSON(path.join(base, 'orders.json')) || [];
  orders.forEach((o) => store.orders.set(o.id, o));
  store.carriers = loadJSON(path.join(base, 'carriers.json')) || [];
  const vig = loadJSON(path.join(base, 'vigilance.json')) || [];
  vig.forEach((v) => store.vigilance.set(v.carrierId, v.status));
  const policies = loadJSON(path.join(base, 'dispatch-policies.json')) || [];
  policies.forEach((p) => store.dispatchPolicies.set(p.orderId, p));
  const originsSeed = loadJSON(path.join(base, 'origins.json')) || [];
  originsSeed.forEach((o) => { const arr = store.origins.get(o.ownerOrgId) || []; arr.push(o); store.origins.set(o.ownerOrgId, arr); });
  const gridsSeed = loadJSON(path.join(base, 'grids.json')) || [];
  gridsSeed.forEach((g) => { const arr = store.grids.get(g.ownerOrgId) || []; arr.push(g); store.grids.set(g.ownerOrgId, arr); });
  const invit = loadJSON(path.join(base, 'invitations.json')) || [];
  invit.forEach((r) => {
    const set = new Set(r.invitedCarriers || []);
    store.invited.set(r.industryOrgId, set);
  });
  console.log(`[core-orders] Seeds chargées: ${store.orders.size} commandes, ${store.carriers.length} transporteurs.`);
}

function json(res, status, body) {
  const data = JSON.stringify(body);
  addSecurityHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

function notFound(res) { json(res, 404, { error: 'Not Found' }); }

const parseBody = limitBodySize(1024 * 1024);
const AFFRET_IA_URL = (process.env.AFFRET_IA_URL || '').replace(/\/$/, '');
const AFFRET_ALLOWED = (process.env.AFFRET_IA_ALLOWED_ORGS || '').split(',').map((s) => s.trim()).filter(Boolean);
const AFFRET_REQUIRE_ADDON = String(process.env.AFFRET_IA_REQUIRE_ADDON || 'true').toLowerCase() !== 'false';
const AUTHZ_URL = (process.env.AUTHZ_URL || '').replace(/\/$/, '');
const GEO_TRACKING_URL = (process.env.GEO_TRACKING_URL || 'http://localhost:3016').replace(/\/$/, '');

function vigilanceStatus(carrierId) {
  return store.vigilance.get(carrierId) || 'UNKNOWN';
}

function pickCarrier(orderId) {
  const policy = store.dispatchPolicies.get(orderId);
  const chain = policy?.chain || store.carriers.map((c) => c.id);
  for (const cid of chain) {
    const status = vigilanceStatus(cid);
    if (status !== 'BLOCKED') return cid;
  }
  return null;
}

function getPolicy(orderId) {
  const order = store.orders.get(orderId);
  const base = store.dispatchPolicies.get(orderId) || { chain: store.carriers.map((c) => c.id), slaAcceptHours: 2 };
  let chain = Array.from(base.chain || []);
  if (order && order.ownerOrgId) {
    const invited = store.invited && store.invited.get(order.ownerOrgId);
    if (invited && invited.size) {
      const invitedArr = Array.from(invited);
      const set = new Set();
      const merged = [];
      for (const cid of [...invitedArr, ...chain]) {
        if (!set.has(cid)) { set.add(cid); merged.push(cid); }
      }
      chain = merged;
    }
  }
  return { chain, slaAcceptHours: base.slaAcceptHours || 2 };
}

function clearTimers(state) {
  if (!state) return;
  const t = state.timers || {};
  for (const k of Object.keys(t)) {
    clearTimeout(t[k]);
  }
  state.timers = {};
}

async function notify(to, subject, text) {
  try {
    if (!to) return;
    await sendEmail({ to, subject, text: String(text || '') + (store.emailTrace ? `\ntraceId: ${store.emailTrace}` : '') });
  } catch (e) {
    console.warn('[notify] échec envoi:', e.message);
  }
}

function getEnv(name, def) { return process.env[name] ?? def; }

function httpGetJson(targetUrl, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(targetUrl);
    const isHttps = u.protocol === 'https:';
    const options = { hostname: u.hostname, port: u.port || (isHttps ? 443 : 80), path: u.pathname + (u.search || ''), method: 'GET', headers };
    const req = (isHttps ? https : http).request(options, (res) => {
      let buf = '';
      res.on('data', (d) => (buf += d));
      res.on('end', () => {
        try {
          const json = buf ? JSON.parse(buf) : null;
          if (res.statusCode >= 200 && res.statusCode < 300) return resolve(json);
          return reject(new Error(`HTTP ${res.statusCode}: ${buf}`));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function streamToString(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function parseCsvLines(text, mode, originFallback) {
  const lines = [];
  const rows = text.trim().split(/\r?\n/);
  if (!rows.length) return lines;
  const header = rows.shift().split(',').map((s) => s.trim().toLowerCase());
  const getIdx = (k) => header.indexOf(k);
  const idxOrigin = getIdx('origin');
  const idxTo = getIdx('to');
  const idxPrice = getIdx('price');
  const idxCurrency = getIdx('currency');
  const idxMin = getIdx('minpallets');
  const idxMax = getIdx('maxpallets');
  const idxPricePP = getIdx('priceperpallet');
  for (const row of rows) {
    if (!row.trim()) continue;
    const cols = row.split(',').map((s) => s.trim());
    const origin = idxOrigin >= 0 ? cols[idxOrigin] : originFallback;
    if (mode === 'FTL') {
      lines.push({
        origin,
        to: idxTo >= 0 ? cols[idxTo] : '',
        price: idxPrice >= 0 ? Number(cols[idxPrice] || 0) : 0,
        currency: idxCurrency >= 0 ? (cols[idxCurrency] || 'EUR') : 'EUR'
      });
    } else {
      lines.push({
        origin,
        to: idxTo >= 0 ? cols[idxTo] : '',
        minPallets: idxMin >= 0 ? Number(cols[idxMin] || 0) : 0,
        maxPallets: idxMax >= 0 ? Number(cols[idxMax] || 0) : 0,
        pricePerPallet: idxPricePP >= 0 ? Number(cols[idxPricePP] || 0) : 0,
        currency: idxCurrency >= 0 ? (cols[idxCurrency] || 'EUR') : 'EUR'
      });
    }
  }
  return lines;
}

async function checkVigilance(carrierId) {
  const ttlMs = Number(getEnv('VIGILANCE_TTL_MS', '300000')); // 5 minutes par défaut
  const cached = store.vigCache.get(carrierId);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.status;
  const base = getEnv('VIGILANCE_URL', '');
  let status = vigilanceStatus(carrierId); // fallback seed
  if (base) {
    try {
      const svcTok = process.env.INTERNAL_SERVICE_TOKEN;
      const out = await httpGetJson(`${base.replace(/\/$/, '')}/vigilance/status/${encodeURIComponent(carrierId)}?refresh=1`, svcTok ? { Authorization: `Bearer ${svcTok}` } : {});
      status = out?.status || status;
    } catch (e) {
      console.warn('[vigilance] fetch error:', e.message);
    }
  }
  store.vigCache.set(carrierId, { status, expiresAt: now + ttlMs });
  return status;
}

function currentCarrier(orderId, state) {
  const policy = getPolicy(orderId);
  const idx = state?.idx ?? 0;
  return policy.chain[idx] || null;
}

// Org lookup with cache + optional AUTHZ_URL (GET /auth/orgs/:id expected)
async function fetchOrg(orgId) {
  if (!orgId) return null;
  const cached = store.orgCache.get(orgId);
  if (cached && cached.expiresAt && cached.expiresAt > Date.now()) return cached.org;
  if (AUTHZ_URL) {
    try {
      const out = await httpGetJson(`${AUTHZ_URL}/auth/orgs/${encodeURIComponent(orgId)}`, {});
      const exp = Date.now() + 5 * 60 * 1000;
      store.orgCache.set(orgId, { org: out, expiresAt: exp });
      return out;
    } catch (e) {
      console.warn('[core-orders] authz org fetch failed:', e.message);
    }
  }
  return null;
}

function affretEligible(order) {
  if (!AFFRET_IA_URL) return false;
  if (AFFRET_ALLOWED.length === 0) return true; // pas de liste = ouvert
  return order && order.ownerOrgId && AFFRET_ALLOWED.includes(order.ownerOrgId);
}

async function affretAllowedByEntitlement(order) {
  if (!order || !order.ownerOrgId) return affretEligible(order);
  // if addon required, check org entitlements
  if (AFFRET_REQUIRE_ADDON) {
    const org = await fetchOrg(order.ownerOrgId);
    if (org) {
      if (!hasFeature(org, FEATURES.AFFRET_IA)) return false;
    } else {
      // no org data -> fallback to env allowlist
      if (!affretEligible(order)) return false;
    }
  } else {
    // addon not required -> rely on allowlist if provided
    if (!affretEligible(order)) return false;
  }
  return true;
}

async function affretDispatch(order, traceId) {
  if (!(await affretAllowedByEntitlement(order))) return { escalated: false, reason: 'affret_not_allowed' };
  try {
    const body = JSON.stringify({ orderId: order.id });
    const u = new URL(`${AFFRET_IA_URL}/affret-ia/dispatch`);
    const isHttps = u.protocol === 'https:';
    const opts = {
      hostname: u.hostname,
      port: u.port || (isHttps ? 443 : 80),
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-trace-id': traceId || ''
      }
    };
    const client = isHttps ? https : http;
    return await new Promise((resolve, reject) => {
      const req = client.request(opts, (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          try {
            const json = buf ? JSON.parse(buf) : null;
            resolve({ statusCode: res.statusCode, body: json });
          } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  } catch (e) {
    return { escalated: false, error: String(e.message || e) };
  }
}

// ============================================================================
// GEO-TRACKING INTEGRATION
// ============================================================================

/**
 * Notifier le service geo-tracking d'une nouvelle position GPS
 * @param {string} orderId - ID de la commande
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} timestamp - Timestamp ISO 8601
 * @returns {Promise<object>} Réponse du service geo-tracking
 */
async function notifyGPSPosition(orderId, lat, lng, timestamp) {
  if (!GEO_TRACKING_URL) {
    console.warn('[geo-tracking] URL non configurée, skip notification GPS');
    return { success: false, reason: 'geo_tracking_disabled' };
  }
  try {
    const body = JSON.stringify({
      orderId,
      latitude: lat,
      longitude: lng,
      timestamp: timestamp || new Date().toISOString(),
      accuracy: 10
    });
    const u = new URL(`${GEO_TRACKING_URL}/geo-tracking/positions`);
    const isHttps = u.protocol === 'https:';
    const svcTok = process.env.INTERNAL_SERVICE_TOKEN;
    const opts = {
      hostname: u.hostname,
      port: u.port || (isHttps ? 443 : 80),
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(svcTok ? { 'Authorization': `Bearer ${svcTok}` } : {})
      }
    };
    const client = isHttps ? https : http;
    return await new Promise((resolve, reject) => {
      const req = client.request(opts, (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          try {
            const json = buf ? JSON.parse(buf) : {};
            resolve({ success: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, data: json });
          } catch (e) { resolve({ success: false, error: e.message }); }
        });
      });
      req.on('error', (e) => resolve({ success: false, error: e.message }));
      req.write(body);
      req.end();
    });
  } catch (e) {
    console.warn('[geo-tracking] erreur notification GPS:', e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Récupérer l'ETA depuis le service geo-tracking
 * @param {string} orderId - ID de la commande
 * @param {number} currentLat - Latitude actuelle
 * @param {number} currentLng - Longitude actuelle
 * @param {number} destinationLat - Latitude destination
 * @param {number} destinationLng - Longitude destination
 * @returns {Promise<object>} ETA calculé avec TomTom Traffic API
 */
async function getETA(orderId, currentLat, currentLng, destinationLat, destinationLng) {
  if (!GEO_TRACKING_URL) {
    console.warn('[geo-tracking] URL non configurée, skip calcul ETA');
    return null;
  }
  try {
    const params = new URLSearchParams({
      currentLat: String(currentLat),
      currentLon: String(currentLng)
    });
    const svcTok = process.env.INTERNAL_SERVICE_TOKEN;
    const response = await httpGetJson(
      `${GEO_TRACKING_URL}/geo-tracking/eta/${encodeURIComponent(orderId)}?${params.toString()}`,
      svcTok ? { Authorization: `Bearer ${svcTok}` } : {}
    );
    return response;
  } catch (e) {
    console.warn('[geo-tracking] erreur récupération ETA:', e.message);
    return null;
  }
}

/**
 * Récupérer les événements de géofencing pour une commande
 * @param {string} orderId - ID de la commande
 * @returns {Promise<Array>} Liste des événements de géofencing
 */
async function getGeofenceEvents(orderId) {
  if (!GEO_TRACKING_URL) return [];
  try {
    const svcTok = process.env.INTERNAL_SERVICE_TOKEN;
    const response = await httpGetJson(
      `${GEO_TRACKING_URL}/geo-tracking/geofence/events/${encodeURIComponent(orderId)}`,
      svcTok ? { Authorization: `Bearer ${svcTok}` } : {}
    );
    return response?.events || [];
  } catch (e) {
    console.warn('[geo-tracking] erreur récupération événements géofencing:', e.message);
    return [];
  }
}

async function scheduleForCarrier(order, idx) {
  const policy = getPolicy(order.id);
  const chain = policy.chain;
  const carrierId = chain[idx];
  if (!carrierId) {
    // Escalade Affret.IA
    order.escalatedToAffretia = true;
    const __tid_state = (store.dispatchState.get(order.id) || {}).tid;
    console.log('[event] order.escalated.to.affretia', { orderId: order.id, traceId: __tid_state });
    if (__tid_state) store.emailTrace = __tid_state;
    notify(process.env.INDUSTRY_NOTIFY_TO || process.env.DISPATCH_NOTIFY_TO, `Escalade Affret.IA ${order.id}`, `Aucun transporteur n'a accepté pour ${order.id}`);
    const affret = await affretDispatch(order, __tid_state);
    if (affret && affret.statusCode >= 200 && affret.statusCode < 300 && affret.body) {
      const assigned = affret.body.assignedCarrierId || null;
      if (assigned) {
        order.assignedCarrierId = assigned;
        order.status = 'DISPATCHED';
      } else {
        order.status = 'ESCALATED_AFFRETIA';
      }
    } else {
      order.status = 'ESCALATED_AFFRETIA';
    }
    store.dispatchState.delete(order.id);
    return;
  }

  // Sauter si bloqué (Vigilance API + cache TTL)
  const vStatus = await checkVigilance(carrierId);
  if (vStatus === 'BLOCKED') {
    return scheduleForCarrier(order, idx + 1);
  }

  order.assignedCarrierId = carrierId;
  order.status = 'DISPATCHED';
  const now = Date.now();
  const expiresAt = now + (policy.slaAcceptHours || 2) * 3600 * 1000;
  const __prev = store.dispatchState.get(order.id);
  const state = { idx, expiresAt, timers: {}, tid: __prev && __prev.tid ? __prev.tid : undefined };
  store.dispatchState.set(order.id, state);
  console.log('[event] order.dispatched', { orderId: order.id, carrierId, traceId: state.tid });
  if (state.tid) store.emailTrace = state.tid;

  // Email ciblé transporteur
  const carrier = store.carriers.find(c => c.id === carrierId);
  const carrierEmail = carrier?.email || process.env.DISPATCH_NOTIFY_TO;
  notify(carrierEmail, `Mission à accepter ${order.id}`, `Bonjour ${carrier?.name || carrierId}, une mission vous est proposée pour ${order.id}. SLA ${(policy.slaAcceptHours || 2)}h.`);

  const rem30ms = expiresAt - 30 * 60 * 1000 - now;
  const rem10ms = expiresAt - 10 * 60 * 1000 - now;

  if (rem30ms > 0) state.timers.rem30 = setTimeout(() => {
    console.log('[reminder] T-30', { orderId: order.id, carrierId });
    if (state.tid) store.emailTrace = state.tid;
    notify(carrierEmail, `Rappel T-30 ${order.id}`, `Plus que 30 minutes pour accepter ${order.id}.`);
  }, rem30ms);

  if (rem10ms > 0) state.timers.rem10 = setTimeout(() => {
    console.log('[reminder] T-10', { orderId: order.id, carrierId });
    if (state.tid) store.emailTrace = state.tid;
    notify(carrierEmail, `Rappel T-10 ${order.id}`, `Plus que 10 minutes pour accepter ${order.id}.`);
  }, rem10ms);

  state.timers.expiry = setTimeout(() => {
    console.log('[timeout] SLA expiré', { orderId: order.id, carrierId });
    scheduleForCarrier(order, idx + 1);
  }, Math.max(0, expiresAt - now));
}

const limiter = rateLimiter({ windowMs: 60000, max: 240 });
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const method = req.method || 'GET';
  const pathname = parsed.pathname || '/';
  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  if (!limiter(req, res)) return;

  // Health
  if (method === 'GET' && pathname === '/health') {
    const mongo = !!process.env.MONGODB_URI;
    return json(res, 200, { status: 'ok', mongo });
  }

  // AuthN/Z (optional via SECURITY_ENFORCE=true)
  const publicRoutes = (
    (method === 'POST' && pathname === '/industry/orders/import') ? [] : []
  );
  const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
  if (authResult === null) return; // 401/403 already sent

  // GET /industry/orders/:id
  if (method === 'GET' && /^\/industry\/orders\/.+/.test(pathname)) {
    const id = pathname.split('/').pop();
    const order = id ? store.orders.get(id) : null;
    if (!order) return notFound(res);
    return json(res, 200, order);
  }

  // GET /carrier/orders?carrierId=B&status=pending
  if (method === 'GET' && pathname === '/carrier/orders') {
    const carrierId = parsed.query.carrierId;
    const status = (parsed.query.status || 'pending').toString().toLowerCase();
    if (!carrierId) return json(res, 400, { error: 'carrierId requis' });
    const list = [];
    for (const o of store.orders.values()) {
      const st = o.status;
      const assigned = o.assignedCarrierId;
      if (status === 'pending') {
        if (st === 'DISPATCHED' && assigned === carrierId) {
          const v = await checkVigilance(carrierId);
          if (v !== 'BLOCKED') list.push({ id: o.id, ref: o.ref, expiresAt: store.dispatchState.get(o.id)?.expiresAt || null });
        }
      } else if (status === 'accepted') {
        if (st === 'ACCEPTED' && assigned === carrierId) list.push({ id: o.id, ref: o.ref });
      }
    }
    return json(res, 200, { items: list });
  }

  // POST /industry/orders/import
  if (method === 'POST' && pathname === '/industry/orders/import') {
    try {
      const __tid_hdr = req.headers['x-trace-id'];
      const body = (await parseBody(req)) || {};
      const list = Array.isArray(body) ? body : [body];
      const imported = [];
      for (const o of list) {
        if (!o || !o.id) continue;
        const order = {
          id: o.id,
          ref: o.ref || o.id,
          ownerOrgId: o.ownerOrgId || 'IND-1',
          ship_from: o.ship_from,
          ship_to: o.ship_to,
          windows: o.windows,
          pallets: o.pallets || 0,
          weight: o.weight || 0,
          status: 'NEW',
        };
        store.orders.set(order.id, order);
        console.log('[event] order.created', { orderId: order.id, traceId: __tid });
        imported.push(order.id);
      }
      const __tid = Array.isArray(__tid_hdr) ? __tid_hdr[0] : __tid_hdr;
      return json(res, 202, { imported, traceId: __tid || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON' });
    }
  }

  // POST /industry/origins { ownerOrgId, id, label, country, city }
  if (method === 'POST' && pathname === '/industry/origins') {
    try {
      const body = (await parseBody(req)) || {};
      const ownerOrgId = body.ownerOrgId || 'IND-1';
      if (!body.id || !body.label) return json(res, 400, { error: 'id/label requis' });
      const origin = { ownerOrgId, id: body.id, label: body.label, country: body.country || null, city: body.city || null };
      const arr = store.origins.get(ownerOrgId) || [];
      const existingIdx = arr.findIndex((o) => o.id === origin.id);
      if (existingIdx >= 0) arr[existingIdx] = origin; else arr.push(origin);
      store.origins.set(ownerOrgId, arr);
      if (process.env.MONGODB_URI) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          await db.collection('origins').updateOne({ ownerOrgId, id: origin.id }, { $set: origin }, { upsert: true });
        } catch (e) { console.warn('[origins] save mongo failed', e.message); }
      }
      return json(res, 200, { ok: true, origin });
    } catch (e) { return json(res, 400, { error: 'Invalid JSON' }); }
  }

  // GET /industry/origins?ownerOrgId=IND-1
  if (method === 'GET' && pathname === '/industry/origins') {
    const ownerOrgId = parsed.query.ownerOrgId;
    if (ownerOrgId) return json(res, 200, { items: store.origins.get(ownerOrgId) || [] });
    const all = [];
    for (const [k,v] of store.origins.entries()) all.push(...v);
    return json(res, 200, { items: all });
  }

  // POST /industry/grids/upload?mode=FTL|LTL&origin=XXXX&ownerOrgId=...
  if (method === 'POST' && pathname === '/industry/grids/upload') {
    const mode = (parsed.query.mode || '').toUpperCase();
    const origin = parsed.query.origin || null;
    const ownerOrgId = parsed.query.ownerOrgId || 'IND-1';
    if (!mode || !origin) return json(res, 400, { error: 'mode/origin requis' });
    try {
      let lines = [];
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('text/csv')) {
        const buf = await streamToString(req);
        lines = parseCsvLines(buf, mode, origin);
      } else {
        const body = (await parseBody(req)) || {};
        lines = Array.isArray(body.lines) ? body.lines : [];
      }
      const grid = { ownerOrgId, origin, mode, lines };
      const arr = store.grids.get(ownerOrgId) || [];
      const idx = arr.findIndex((g) => g.origin === origin && g.mode === mode);
      if (idx >= 0) arr[idx] = grid; else arr.push(grid);
      store.grids.set(ownerOrgId, arr);
      if (process.env.MONGODB_URI) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          await db.collection('grids').updateOne({ ownerOrgId, origin, mode }, { $set: grid }, { upsert: true });
        } catch (e) { console.warn('[grids] save mongo failed', e.message); }
      }
      return json(res, 200, { ok: true, ownerOrgId, origin, mode, linesCount: lines.length });
    } catch (e) {
      return json(res, 400, { error: 'Invalid grid', detail: e.message });
    }
  }

  // GET /industry/grids?ownerOrgId=...&origin=...&mode=FTL|LTL
  if (method === 'GET' && pathname === '/industry/grids') {
    const ownerOrgId = parsed.query.ownerOrgId || 'IND-1';
    const origin = parsed.query.origin;
    const mode = parsed.query.mode ? parsed.query.mode.toUpperCase() : null;
    const arr = store.grids.get(ownerOrgId) || [];
    const filtered = arr.filter((g) => (!origin || g.origin === origin) && (!mode || g.mode === mode));
    return json(res, 200, { items: filtered });
  }

  // POST /industry/orders/:id/dispatch
  if (method === 'POST' && /^\/industry\/orders\/.+\/dispatch$/.test(pathname)) {
    const parts = pathname.split('/');
    const id = parts[3];
    const order = id ? store.orders.get(id) : null;
    if (!order) return notFound(res);
    clearTimers(store.dispatchState.get(order.id));
    const hdr = req.headers['x-trace-id'];
    const tid = Array.isArray(hdr) ? hdr[0] : hdr;
    const prev = store.dispatchState.get(order.id) || { idx: 0, expiresAt: 0, timers: {} };
    if (tid) prev.tid = tid;
    store.dispatchState.set(order.id, prev);
    // Entitlements (require industry.dispatch if auth provided)
    const authRes = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' }) || {};
    if (authRes.claims && authRes.claims.orgId) {
      const org = await fetchOrg(authRes.claims.orgId);
      if (org && !hasFeature(org, 'industry.dispatch')) {
        const _tid = (store.dispatchState.get(order.id) || {}).tid || null;
        return json(res, 402, { error: 'payment_required', detail: 'Feature industry.dispatch missing. Upgrade to PRO.', traceId: _tid });
      }
    }
    if (order.forceEscalation) {
      scheduleForCarrier(order, Number.MAX_SAFE_INTEGER); // force escalade
      const _tid = (store.dispatchState.get(order.id) || {}).tid || null;
      return json(res, 202, { escalated: true, status: order.status, traceId: _tid });
    }
    await scheduleForCarrier(order, 0);
    {
      const st = store.dispatchState.get(order.id);
      return json(res, 202, { dispatchedTo: order.assignedCarrierId, status: order.status, expiresAt: st?.expiresAt || null, traceId: st?.tid || null });
    }
  }

  // POST /carrier/orders/:id/accept  body: { carrierId }
  if (method === 'POST' && /^\/carrier\/orders\/.+\/accept$/.test(pathname)) {
    const id = pathname.split('/')[3];
    const order = id ? store.orders.get(id) : null;
    if (!order) return notFound(res);
    try {
      const body = (await parseBody(req)) || {};
      const carrierId = body.carrierId;
      const state = store.dispatchState.get(order.id);
      const current = currentCarrier(order.id, state);
      if (!carrierId || carrierId !== current) {
        return json(res, 400, { error: 'carrierId invalide ou non courant', current });
      }
      clearTimers(state);
      order.status = 'ACCEPTED';
      console.log('[event] order.accepted', { orderId: order.id, carrierId, traceId: (state && state.tid) });
      const carrier = store.carriers.find(c => c.id === carrierId);
      const carrierEmail = carrier?.email || process.env.DISPATCH_NOTIFY_TO;
      if (state && state.tid) store.emailTrace = state.tid;
      notify(process.env.INDUSTRY_NOTIFY_TO || process.env.DISPATCH_NOTIFY_TO, `Commande acceptée ${order.id}`, `Le transporteur ${carrier?.name || carrierId} a accepté la commande ${order.id}.`);
      notify(carrierEmail, `Confirmation d'acceptation ${order.id}`, `Merci, vous avez accepté la commande ${order.id}.`);
      return json(res, 200, { acceptedBy: carrierId, status: order.status, traceId: (state && state.tid) || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON' });
    }
  }

  // GET /industry/orders/:id/geofence-events
  if (method === 'GET' && /^\/industry\/orders\/.+\/geofence-events$/.test(pathname)) {
    const id = pathname.split('/')[3];
    const order = id ? store.orders.get(id) : null;
    if (!order) return notFound(res);
    try {
      const events = await getGeofenceEvents(order.id);
      return json(res, 200, { orderId: order.id, events });
    } catch (e) {
      return json(res, 500, { error: 'Failed to fetch geofence events', detail: e.message });
    }
  }

  // GET /industry/orders/:id/eta?currentLat=X&currentLng=Y
  if (method === 'GET' && /^\/industry\/orders\/.+\/eta$/.test(pathname)) {
    const id = pathname.split('/')[3];
    const order = id ? store.orders.get(id) : null;
    if (!order) return notFound(res);
    const currentLat = parsed.query.currentLat ? parseFloat(parsed.query.currentLat) : null;
    const currentLng = parsed.query.currentLng ? parseFloat(parsed.query.currentLng) : null;
    if (currentLat === null || currentLng === null) {
      return json(res, 400, { error: 'currentLat and currentLng required' });
    }
    try {
      const destinationLat = order.ship_to?.latitude || null;
      const destinationLng = order.ship_to?.longitude || null;
      if (!destinationLat || !destinationLng) {
        return json(res, 400, { error: 'Order missing destination coordinates' });
      }
      const eta = await getETA(order.id, currentLat, currentLng, destinationLat, destinationLng);
      return json(res, 200, { orderId: order.id, eta: eta || null });
    } catch (e) {
      return json(res, 500, { error: 'Failed to calculate ETA', detail: e.message });
    }
  }

  // POST /industry/orders/:id/gps-position body: { lat, lng, timestamp }
  if (method === 'POST' && /^\/industry\/orders\/.+\/gps-position$/.test(pathname)) {
    const id = pathname.split('/')[3];
    const order = id ? store.orders.get(id) : null;
    if (!order) return notFound(res);
    try {
      const body = (await parseBody(req)) || {};
      const { lat, lng, timestamp } = body;
      if (lat === undefined || lng === undefined) {
        return json(res, 400, { error: 'lat and lng required' });
      }
      const result = await notifyGPSPosition(order.id, lat, lng, timestamp);

      // Si événement géofencing détecté, mettre à jour statut commande
      if (result.success && result.data?.geofenceEvent) {
        const event = result.data.geofenceEvent;
        const statusMap = {
          'ARRIVAL_PICKUP': 'ARRIVED_PICKUP',
          'DEPARTURE_PICKUP': 'IN_TRANSIT',
          'ARRIVAL_DELIVERY': 'ARRIVED_DELIVERY'
        };
        if (statusMap[event.type]) {
          order.status = statusMap[event.type];
          console.log('[event] order.status.updated.geofence', { orderId: order.id, newStatus: order.status, eventType: event.type });
        }
      }

      return json(res, 200, { success: result.success, data: result.data || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON' });
    }
  }

  return notFound(res);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
loadSeeds();
server.listen(PORT, () => {
  console.log(`[core-orders] HTTP prêt sur :${PORT}`);
});

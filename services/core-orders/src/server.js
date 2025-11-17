const http = global.http || require('http');
const https = global.http || require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../../../packages/notify-client/src/index.js');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, limitBodySize, rateLimiter } = require('../../../packages/security/src/index.js');
const { hasFeature, FEATURES } = require('../../../packages/entitlements/src/index.js');
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
  grids: new Map(), // ownerOrgId -> [{from,to,mode,price,currency}]
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
      const [orders, carriers, vigs, policies, invit] = await Promise.all([
        db.collection('orders').find({}).toArray(),
        db.collection('carriers').find({}).toArray(),
        db.collection('vigilance').find({}).toArray(),
        db.collection('dispatch_policies').find({}).toArray(),
        db.collection('grids').find({}).toArray(),
        db.collection('invitations').find({}).toArray(),
      ]);
      (orders||[]).forEach((o)=>store.orders.set(o.id, o));
      store.carriers = carriers || [];
      (vigs||[]).forEach((v)=>store.vigilance.set(v.carrierId, v.status || v.state || 'UNKNOWN'));
      (policies||[]).forEach((p)=>store.dispatchPolicies.set(p.orderId, p));
      (grids||[]).forEach((g)=>store.grids.set(g.ownerOrgId, g.lines || []));
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
  const gridsSeed = loadJSON(path.join(base, 'grids.json')) || [];
  gridsSeed.forEach((g) => store.grids.set(g.ownerOrgId, g.lines || []));
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

  // POST /industry/lines/grids/import
  // body: { ownerOrgId, lines:[{from,to,mode,price,currency}] }
  if (method === 'POST' && pathname === '/industry/lines/grids/import') {
    try {
      const body = (await parseBody(req)) || {};
      const ownerOrgId = body.ownerOrgId || 'IND-1';
      const lines = Array.isArray(body.lines) ? body.lines : [];
      store.grids.set(ownerOrgId, lines);
      if (process.env.MONGODB_URI) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          await db.collection('grids').updateOne({ ownerOrgId }, { $set: { ownerOrgId, lines } }, { upsert: true });
        } catch (e) { console.warn('[grids] save mongo failed', e.message); }
      }
      return json(res, 200, { ok: true, ownerOrgId, linesCount: lines.length });
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON' });
    }
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

  return notFound(res);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
loadSeeds();
server.listen(PORT, () => {
  console.log(`[core-orders] HTTP prêt sur :${PORT}`);
});

const http = require('http');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { validateVAT } = require('../../../packages/vat-client/src/index.js');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, limitBodySize, rateLimiter } = require('../../../packages/security/src/index.js');

function json(res, status, body) {
  const data = JSON.stringify(body);
  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

const parseBody = limitBodySize(1024 * 1024);

// In-memory store
const store = {
  carriers: new Map(), // id -> {id, name, email, vat, ...}
  seedStatus: new Map(), // id -> 'OK'|'BLOCKED'
  vatCache: new Map(), // id -> { valid, checkedAt }
};

function loadSeeds() {
  try {
    const base = path.resolve(process.cwd(), 'infra', 'seeds');
    const carriers = JSON.parse(fs.readFileSync(path.join(base, 'carriers.json'), 'utf-8')) || [];
    carriers.forEach(c => store.carriers.set(c.id, c));
    const vig = JSON.parse(fs.readFileSync(path.join(base, 'vigilance.json'), 'utf-8')) || [];
    vig.forEach(v => store.seedStatus.set(v.carrierId, v.status));
    console.log(`[vigilance] Seeds: carriers=${store.carriers.size}, statuses=${store.seedStatus.size}`);
  } catch (e) { console.warn('[vigilance] Impossible de charger les seeds:', e.message); }
}

async function statusForCarrier(carrierId, { refreshVAT = false } = {}) {
  const reasons = [];
  const sources = {};
  const seed = store.seedStatus.get(carrierId) || 'UNKNOWN';
  sources.seedStatus = seed;
  let blocked = seed === 'BLOCKED';

  const carrier = store.carriers.get(carrierId);
  if (carrier?.vat) {
    let cached = store.vatCache.get(carrierId);
    if (refreshVAT || !cached) {
      try {
        const { valid } = await validateVAT({ vat: carrier.vat });
        cached = { valid, checkedAt: new Date().toISOString() };
        store.vatCache.set(carrierId, cached);
      } catch (e) {
        cached = { valid: false, checkedAt: new Date().toISOString(), error: e.message };
        store.vatCache.set(carrierId, cached);
      }
    }
    sources.vat = cached;
    if (cached && cached.valid === false) {
      blocked = true;
      reasons.push('VAT_INVALID');
    }
  } else {
    reasons.push('VAT_MISSING');
  }

  const status = blocked ? 'BLOCKED' : 'OK';
  return { carrierId, status, reasons, sources };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  addSecurityHeaders(res);
  const limiter = rateLimiter({ windowMs: 60000, max: 240 });
  if (!limiter(req, res)) return;
  const method = req.method || 'GET';
  const traceIdHdr = req.headers['x-trace-id'];
  const traceId = Array.isArray(traceIdHdr) ? traceIdHdr[0] : traceIdHdr;

  if (method === 'GET' && url.pathname === '/health') return json(res, 200, { status: 'ok', mongo: !!process.env.MONGODB_URI });

  // POST /vigilance/vat/check
  // body: { vat?: string, country?: string, number?: string }
  if (method === 'POST' && url.pathname === '/vigilance/vat/check') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const body = (await parseBody(req)) || {};
      const { vat, country, number } = body;
      const result = await validateVAT({ vat, country, number });
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, { valid: result.valid, provider: 'vatcheckapi.com', raw: result.raw, traceId: traceId || null });
    } catch (e) {
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 502, { error: e.message, traceId: traceId || null });
    }
  }

  // GET /vigilance/status/:carrierId
  if (method === 'GET' && /^\/vigilance\/status\/.+/.test(url.pathname)) {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    const carrierId = url.pathname.split('/').pop();
    const refresh = url.searchParams.get('refresh') === '1';
    try {
      if (process.env.MONGODB_URI && !refresh) {
        try {
          const mongo = require('../../../packages/data-mongo/src/index.js');
          const db = await mongo.getDb();
          const rec = await db.collection('vigilance').findOne({ carrierId });
          if (rec) {
            const out = { carrierId, status: rec.status || 'OK', reasons: [], sources: { seedStatus: rec.status, vat: null } };
            if (traceId) res.setHeader('x-trace-id', traceId);
            return json(res, 200, { ...out, traceId: traceId || null });
          }
        } catch (e) { /* ignore */ }
      }
      const out = await statusForCarrier(carrierId, { refreshVAT: refresh });
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, { ...out, traceId: traceId || null });
    } catch (e) {
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 502, { error: e.message, traceId: traceId || null });
    }
  }

  // POST /vigilance/revalidate/:carrierId → force un rafraîchissement de TVA
  if (method === 'POST' && /^\/vigilance\/revalidate\/.+/.test(url.pathname)) {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    const carrierId = url.pathname.split('/').pop();
    try {
      const out = await statusForCarrier(carrierId, { refreshVAT: true });
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, { ...out, traceId: traceId || null });
    } catch (e) {
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 502, { error: e.message, traceId: traceId || null });
    }
  }

  return json(res, 404, { error: 'Not Found' });
});

loadSeeds();
server.listen(Number(process.env.VIGILANCE_PORT || '3006'), () => console.log('[vigilance] HTTP prêt'));

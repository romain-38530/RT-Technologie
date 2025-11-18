const http = global.http || require('http');
const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../../../packages/notify-client/src/index.js');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, limitBodySize, rateLimiter } = require('../../../packages/security/src/index.js');

function env(name, def) {
  const v = process.env[name];
  return v == null ? def : v;
}

const PORT = Number(env('PLANNING_PORT', '3005'));

const store = {
  slots: [], // { dockId, start, end }
  bookings: new Set(), // key: dockId|start|end
  proposals: new Map(), // orderId -> { leg, proposedAt }
};

function loadSeeds() {
  try {
    const file = path.resolve(process.cwd(), 'infra', 'seeds', 'planning-slots.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    store.slots = data || [];
    console.log(`[planning] Slots chargés: ${store.slots.length}`);
  } catch (e) {
    console.warn('[planning] Impossible de charger les slots seed:', e.message);
  }
}

function json(res, status, body) {
  const data = JSON.stringify(body);
  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

const parseBody = limitBodySize(1024 * 1024);

function slotKey(s) { return `${s.dockId}|${s.start}|${s.end}`; }

async function notify(subject, text) {
  const to = process.env.PLANNING_NOTIFY_TO || process.env.DISPATCH_NOTIFY_TO;
  if (!to) return;
  try {
    const suffix = store.emailTrace ? `\ntraceId: ${store.emailTrace}` : '';
    await sendEmail({ to, subject, text: String(text || '') + suffix });
  } catch (e) {
    console.warn('[planning notify] erreur:', e.message);
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  addSecurityHeaders(res);
  const limiter = rateLimiter({ windowMs: 60000, max: 240 });
  if (!limiter(req, res)) return;
  const tidHdr = req.headers['x-trace-id'];
  store.emailTrace = Array.isArray(tidHdr) ? tidHdr[0] : tidHdr;
  const method = req.method || 'GET';

  if (method === 'GET' && url.pathname === '/health') return json(res, 200, { status: 'ok', mongo: !!process.env.MONGODB_URI });

  // GET /planning/slots?date=2025-01-10
  if (method === 'GET' && url.pathname === '/planning/slots') {
    const date = (url.searchParams.get('date') || '').slice(0, 10); // YYYY-MM-DD
    let items = store.slots;
    if (process.env.MONGODB_URI) {
      try {
        const mongo = require('../../../packages/data-mongo/src/index.js');
        const db = await mongo.getDb();
        const filter = date ? { start: { $regex: `^${date}` } } : {};
        items = await db.collection('planning_slots').find(filter).project({ _id: 0 }).toArray();
      } catch (e) { /* ignore and fallback to in-memory */ }
    }
    const enriched = items.map((s) => ({ ...s, booked: store.bookings.has(slotKey(s)) }));
    const __tid = Array.isArray(req.headers['x-trace-id']) ? req.headers['x-trace-id'][0] : req.headers['x-trace-id'];
    if (__tid) res.setHeader('x-trace-id', __tid);
    return json(res, 200, { items: enriched, traceId: __tid || null });
  }

  // POST /planning/rdv/propose { orderId, leg, proposedAt }
  if (method === 'POST' && url.pathname === '/planning/rdv/propose') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const body = (await parseBody(req)) || {};
      const { orderId, leg, proposedAt } = body;
      if (!orderId || !leg || !proposedAt) return json(res, 400, { error: 'orderId, leg, proposedAt requis' });
      store.proposals.set(orderId, { leg, proposedAt });
      await notify(`RDV proposé ${orderId}`, `Leg ${leg}, proposé à ${proposedAt}`);
      const __tid = Array.isArray(req.headers['x-trace-id']) ? req.headers['x-trace-id'][0] : req.headers['x-trace-id'];
      if (__tid) res.setHeader('x-trace-id', __tid);
      return json(res, 200, { proposed: true, traceId: __tid || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON' });
    }
  }

  // POST /planning/rdv/confirm { orderId, leg, slot: { start, end } }
  if (method === 'POST' && url.pathname === '/planning/rdv/confirm') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const body = (await parseBody(req)) || {};
      const { orderId, leg, slot } = body;
      if (!orderId || !leg || !slot || !slot.start || !slot.end) return json(res, 400, { error: 'orderId, leg, slot.start, slot.end requis' });
      // Trouver un slot existant correspondant aux dates
      const candidate = store.slots.find(s => s.start === slot.start && s.end === slot.end && !store.bookings.has(slotKey(s)));
      if (!candidate) return json(res, 409, { error: 'Créneau indisponible' });
      // Verrouillage léger
      const key = slotKey(candidate);
      if (store.bookings.has(key)) return json(res, 409, { error: 'Déjà réservé' });
      store.bookings.add(key);
      await notify(`RDV confirmé ${orderId}`, `Leg ${leg}, dock ${candidate.dockId}, ${candidate.start} → ${candidate.end}`);
      const __tid2 = Array.isArray(req.headers['x-trace-id']) ? req.headers['x-trace-id'][0] : req.headers['x-trace-id'];
      if (__tid2) res.setHeader('x-trace-id', __tid2);
      return json(res, 200, { confirmed: true, dockId: candidate.dockId, slot: { start: candidate.start, end: candidate.end }, traceId: __tid2 || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON' });
    }
  }

  return json(res, 404, { error: 'Not Found' });
});

loadSeeds();
server.listen(PORT, () => console.log(`[planning] HTTP prêt sur :${PORT}`));

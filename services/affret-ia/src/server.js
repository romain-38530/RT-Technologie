const http = global.http || require('http');
const fs = require('fs');
const path = require('path');
const { complete } = require('../../../packages/ai-client/src/index.js');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, rateLimiter, limitBodySize } = require('../../../packages/security/src/index.js');

const PORT = Number(process.env.AFFRET_IA_PORT || '3005');

const store = { orders: new Map(), carriers: [] };

function loadSeeds() {
  try {
    const base = path.resolve(process.cwd(), 'infra', 'seeds');
    const orders = JSON.parse(fs.readFileSync(path.join(base, 'orders.json'), 'utf-8')) || [];
    orders.forEach((o) => store.orders.set(o.id, o));
    store.carriers = JSON.parse(fs.readFileSync(path.join(base, 'carriers.json'), 'utf-8')) || [];
    console.log(`[affret-ia] Seeds chargées: ${store.orders.size} ordres, ${store.carriers.length} transporteurs`);
  } catch (e) { console.warn('[affret-ia] Seeds manquantes:', e.message); }
}

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

async function quoteWithAI(order) {
  const prompt = `Tu es affréteur. Propose un prix all-in (EUR) et 1-2 transporteurs id parmi: ${store.carriers.map(c=>c.id).join(', ')} pour l'ordre suivant. Réponds JSON: {"price": number, "currency":"EUR", "suggestedCarriers":["id"]}.
Order: id=${order.id}, from=${order.ship_from}, to=${order.ship_to}, pallets=${order.pallets}, weight=${order.weight}kg.`;
  const { content } = await complete(prompt, { max_tokens: 200 });
  try {
    const firstJson = content.match(/\{[\s\S]*\}/);
    if (firstJson) return JSON.parse(firstJson[0]);
  } catch {}
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method || 'GET';
  const traceIdHdr = req.headers['x-trace-id'];
  const traceId = Array.isArray(traceIdHdr) ? traceIdHdr[0] : traceIdHdr;
  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  const limiter = rateLimiter({ windowMs: 60000, max: 120 });
  if (!limiter(req, res)) return;

  if (method === 'GET' && url.pathname === '/health') return json(res, 200, { status: 'ok' });

  // GET /affret-ia/quote/:orderId
  if (method === 'GET' && /^\/affret-ia\/quote\/.+/.test(url.pathname)) {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    const orderId = url.pathname.split('/').pop();
    const order = store.orders.get(orderId);
    if (!order) return json(res, 404, { error: 'Order not found' });
    try {
      let q = null;
      if (process.env.OPENROUTER_API_KEY) {
        q = await quoteWithAI(order);
      }
      if (!q) {
        // Fallback mock
        const base = 1.1 * (order.weight || 1000) / 10 + (order.pallets || 1) * 5;
        q = { price: Math.round(base), currency: 'EUR', suggestedCarriers: store.carriers.filter(c=>!c.blocked).slice(0,2).map(c=>c.id) };
      }
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, { orderId, ...q, traceId: traceId || null });
    } catch (e) {
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 502, { error: e.message, traceId: traceId || null });
    }
  }

  // POST /affret-ia/dispatch { orderId }
  if (method === 'POST' && url.pathname === '/affret-ia/dispatch') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf-8')) : {};
      const order = store.orders.get(body.orderId);
      if (!order) return json(res, 404, { error: 'Order not found' });
      const quote = await (process.env.OPENROUTER_API_KEY ? quoteWithAI(order) : null);
      const chosen = (quote?.suggestedCarriers?.[0]) || (store.carriers.find(c=>!c.blocked)?.id) || null;
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 200, { assignedCarrierId: chosen, quote: quote || null, traceId: traceId || null });
    } catch (e) {
      if (traceId) res.setHeader('x-trace-id', traceId);
      return json(res, 400, { error: 'Invalid JSON', traceId: traceId || null });
    }
  }

  return json(res, 404, { error: 'Not Found' });
});

loadSeeds();
server.listen(PORT, () => console.log(`[affret-ia] HTTP prêt sur :${PORT}`));

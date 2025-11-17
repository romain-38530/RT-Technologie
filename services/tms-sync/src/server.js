const http = require('http');
const http = require('http');
const https = require('https');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, rateLimiter, limitBodySize } = require('../../../packages/security/src/index.js');

function env(name, def) {
  const v = process.env[name];
  return v == null ? def : v;
}

const PORT = Number(env('TMS_SYNC_PORT', '3003'));
const CORE_ORDERS_URL = env('CORE_ORDERS_URL', 'http://localhost:3001');

function json(res, status, body) {
  const data = JSON.stringify(body);
  addSecurityHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let buf = '';
    req.on('data', (c) => (buf += c));
    req.on('end', () => {
      if (!buf) return resolve(null);
      try { resolve(JSON.parse(buf)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function httpRequestJson(method, baseUrl, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const base = new URL(baseUrl);
    const isHttps = base.protocol === 'https:';
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: base.hostname,
      port: base.port || (isHttps ? 443 : 80),
      path,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);
    const req = (isHttps ? https : http).request(options, (res) => {
      let buf = '';
      res.on('data', (d) => (buf += d));
      res.on('end', () => {
        try {
          const json = buf ? JSON.parse(buf) : null;
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(new Error(`Upstream ${res.statusCode}: ${buf}`));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method || 'GET';
  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  const limiter = rateLimiter({ windowMs: 60000, max: 300 });
  if (!limiter(req, res)) return;

  if (method === 'GET' && url.pathname === '/health') return json(res, 200, { status: 'ok' });

  // GET /carrier/orders?status=pending&carrierId=B
  if (method === 'GET' && url.pathname === '/carrier/orders') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    const traceId = Math.random().toString(16).slice(2) + Date.now().toString(16);
    const carrierId = url.searchParams.get('carrierId');
    const status = url.searchParams.get('status') || 'pending';
    if (!carrierId) return json(res, 400, { error: 'carrierId requis' });
    try {
      const data = await httpRequestJson('GET', CORE_ORDERS_URL, `/carrier/orders?carrierId=${encodeURIComponent(carrierId)}&status=${encodeURIComponent(status)}`, null, { 'x-trace-id': traceId });
      res.setHeader('x-trace-id', traceId);
      return json(res, 200, { ...data, traceId });
    } catch (e) {
      res.setHeader('x-trace-id', traceId);
      return json(res, 502, { error: e.message, traceId });
    }
  }

  // POST /carrier/orders/:id/accept  body: { carrierId }
  if (method === 'POST' && /^\/carrier\/orders\/.+\/accept$/.test(url.pathname)) {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    const id = url.pathname.split('/')[3];
    const traceId = Math.random().toString(16).slice(2) + Date.now().toString(16);
    try {
      const body = (await parseBody(req)) || {};
      if (!body.carrierId) return json(res, 400, { error: 'carrierId requis' });
      const data = await httpRequestJson('POST', CORE_ORDERS_URL, `/carrier/orders/${encodeURIComponent(id)}/accept`, { carrierId: body.carrierId }, { 'x-trace-id': traceId });
      res.setHeader('x-trace-id', traceId);
      return json(res, 200, { ...data, traceId });
    } catch (e) {
      res.setHeader('x-trace-id', traceId);
      return json(res, 502, { error: e.message, traceId });
    }
  }

  return json(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => console.log(`[tms-sync] HTTP prêt sur :${PORT}, core-orders=${CORE_ORDERS_URL}`));

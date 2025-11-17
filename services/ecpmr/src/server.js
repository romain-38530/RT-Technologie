const http = global.http || require('http');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, rateLimiter, limitBodySize } = require('../../../packages/security/src/index.js');
const aws = require('../../../packages/cloud-aws/src/index.js');

const PORT = Number(process.env.ECPMR_PORT || '3009');
const BUCKET = process.env.AWS_S3_BUCKET || '';

function json(res, status, body) {
  const data = JSON.stringify(body);
  addSecurityHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

const parseBody = limitBodySize(2 * 1024 * 1024);
const limiter = rateLimiter({ windowMs: 60000, max: 120 });

async function recordEventToMongo(event) {
  if (!process.env.MONGODB_URI) return;
  try {
    const mongo = require('../../../packages/data-mongo/src/index.js');
    const db = await mongo.getDb();
    await db.collection('ecmr_events').insertOne({ ...event, createdAt: new Date().toISOString() });
  } catch (e) {
    console.warn('[ecpmr] mongo write failed:', e.message);
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method || 'GET';
  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  if (!limiter(req, res)) return;

  if (method === 'GET' && url.pathname === '/health') return json(res, 200, { status: 'ok', s3: !!BUCKET });

  if (method === 'POST' && (url.pathname === '/ecmr/sign-at-dock' || url.pathname === '/ecmr/sign-at-delivery')) {
    const auth = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (auth === null) return;
    if (!BUCKET) return json(res, 500, { error: 'S3 bucket not configured' });
    try {
      const body = (await parseBody(req)) || {};
      const orderId = body.orderId;
      const notes = body.notes || '';
      if (!orderId) return json(res, 400, { error: 'orderId requis' });
      const kind = url.pathname.endsWith('dock') ? 'dock' : 'delivery';
      const key = `orders/${orderId}/ecmr-${kind}-${Date.now()}.txt`;
      const content = `eCMR ${kind} for order ${orderId}\n${notes}\n`; // placeholder for PDF/A
      await aws.s3PutObject({ bucket: BUCKET, key, body: content, contentType: 'text/plain' });
      await recordEventToMongo({ orderId, kind, s3Key: key });
      return json(res, 200, { ok: true, orderId, kind, s3Key: key });
    } catch (e) {
      return json(res, 502, { error: e.message });
    }
  }

  return json(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => console.log(`[ecpmr] HTTP prêt sur :${PORT}`));

const crypto = require('crypto');

function getEnv(name, def) { return process.env[name] ?? def; }
function getEnvBool(name, def = false) {
  const v = process.env[name];
  if (v == null) return def;
  return /^(1|true|yes|on)$/i.test(String(v));
}

function addSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'geolocation=()');
  const origin = process.env.CORS_ALLOW_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-trace-id');
}

function handleCorsPreflight(req, res) {
  if (req.method && req.method.toUpperCase() === 'OPTIONS') {
    addSecurityHeaders(res);
    res.writeHead(204);
    res.end();
    return true;
  }
  return false;
}

function verifyJwtHS256(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const sig = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');
  if (sig !== s) return null;
  const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf-8'));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return null;
  return payload;
}

function parseAuthHeader(req) {
  const h = req.headers['authorization'];
  const v = Array.isArray(h) ? h[0] : h;
  if (!v) return null;
  const m = /^Bearer\s+(.+)$/i.exec(v);
  return m ? m[1] : null;
}

function requireAuth(req, res, opts = {}) {
  const { roles = null, optionalEnv = 'SECURITY_ENFORCE' } = opts;
  const enforce = getEnvBool(optionalEnv, false);
  if (!enforce) return { claims: null };
  const token = parseAuthHeader(req);
  const internal = getEnv('INTERNAL_SERVICE_TOKEN', '');
  if (token && internal && token === internal) {
    return { claims: { sub: 'service', roles: ['SERVICE'], orgId: 'internal' } };
  }
  const secret = getEnv('AUTHZ_JWT_SECRET', 'dev-secret');
  const claims = token ? verifyJwtHS256(token, secret) : null;
  if (!claims) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'unauthorized' }));
    return null;
  }
  if (roles && Array.isArray(roles) && roles.length > 0) {
    const has = (claims.roles || []).some((r) => roles.includes(r));
    if (!has) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'forbidden' }));
      return null;
    }
  }
  return { claims };
}

function limitBodySize(maxBytes = 1048576) { // 1MB default
  return async function parseLimited(req) {
    return new Promise((resolve, reject) => {
      let buf = Buffer.alloc(0);
      req.on('data', (c) => {
        buf = Buffer.concat([buf, c]);
        if (buf.length > maxBytes) {
          reject(new Error('payload too large'));
          try { req.destroy(); } catch {}
        }
      });
      req.on('end', () => {
        if (buf.length === 0) return resolve(null);
        try { resolve(JSON.parse(buf.toString('utf-8'))); } catch (e) { reject(e); }
      });
      req.on('error', reject);
    });
  };
}

// Very simple token bucket per IP
function rateLimiter({ windowMs = 60000, max = 120 } = {}) {
  const buckets = new Map();
  return function check(req, res) {
    const ip = (req.socket && req.socket.remoteAddress) || 'unknown';
    const now = Date.now();
    let b = buckets.get(ip);
    if (!b || now - b.start > windowMs) b = { start: now, count: 0 };
    b.count += 1;
    buckets.set(ip, b);
    if (b.count > max) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'rate_limited' }));
      return false;
    }
    return true;
  };
}

module.exports = { addSecurityHeaders, handleCorsPreflight, requireAuth, verifyJwtHS256, getEnv, getEnvBool, parseAuthHeader, limitBodySize, rateLimiter };

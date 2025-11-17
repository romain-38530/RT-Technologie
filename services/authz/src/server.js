const http = global.http || require('http');
const crypto = require('crypto');
const { sendEmail } = require('../../../packages/notify-client/src/index.js');
const { addSecurityHeaders, requireAuth, rateLimiter, limitBodySize } = require('../../../packages/security/src/index.js');

const PORT = Number(process.env.AUTHZ_PORT || '3007');
const JWT_SECRET = process.env.AUTHZ_JWT_SECRET || 'dev-secret';
const VERIFY_BASE = (process.env.AUTHZ_VERIFY_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

const store = {
  orgs: new Map(), // orgId -> { id, role, name, contactEmail, locale, status, plan, addons[] }
  users: new Map(), // userId -> { id, orgId, email, roles }
  tokens: new Map(), // token -> { orgId, email, exp }
};

function json(res, status, body, traceId) {
  const data = JSON.stringify(body);
  const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) };
  if (traceId) headers['x-trace-id'] = traceId;
  res.writeHead(status, headers);
  res.end(data);
}

function uid(prefix) { return `${prefix}-${crypto.randomBytes(6).toString('hex')}`; }

function signJWT(payload, expSec = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const full = { ...payload, iat, exp: iat + expSec };
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const data = `${b64(header)}.${b64(full)}`;
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

async function notify(to, subject, text, traceId) {
  try {
    await sendEmail({ to, subject, text: String(text || '') + (traceId ? `\ntraceId: ${traceId}` : '') });
  } catch (e) {
    console.warn('[authz notify] error', e.message);
  }
}

const parseJson = limitBodySize(512 * 1024);
const limiter = rateLimiter({ windowMs: 60000, max: 120 });
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method || 'GET';
  const tid = Array.isArray(req.headers['x-trace-id']) ? req.headers['x-trace-id'][0] : req.headers['x-trace-id'];
  addSecurityHeaders(res);
  if (!limiter(req, res)) return;

  if (method === 'GET' && url.pathname === '/health') return json(res, 200, { status: 'ok', traceId: tid || null }, tid);

  // Register
  if (method === 'POST' && url.pathname === '/auth/register') {
    try {
      const body = (await parseJson(req)) || {};
      const role = body.role;
      const orgName = body.orgName;
      const contactEmail = body.contactEmail;
      const locale = body.locale || 'fr';
      const plan = (body.plan || 'FREE').toUpperCase();
      const addons = Array.isArray(body.addons) ? body.addons : [];
      const allowed = ['INDUSTRY','TRANSPORTER','LOGISTICIAN','FORWARDER'];
      if (!role || !allowed.includes(role) || !orgName || !contactEmail) {
        return json(res, 400, { error: 'role/orgName/contactEmail requis', traceId: tid || null }, tid);
      }
      const orgId = uid('ORG');
      store.orgs.set(orgId, { id: orgId, role, name: orgName, contactEmail, locale, status: 'PENDING_VERIFICATION', plan, addons });
      const token = uid('VTK');
      const exp = Date.now() + 1000 * 60 * 60 * 24; // 24h
      store.tokens.set(token, { orgId, email: contactEmail, exp });
      const verifyLink = `${VERIFY_BASE}/auth/verify?token=${encodeURIComponent(token)}`;
      await notify(contactEmail, `Vérification de votre compte (${orgName})`, `Bonjour,\nMerci pour votre inscription (${role}). Cliquez pour vérifier: ${verifyLink}`, tid);
      return json(res, 201, { orgId, status: 'PENDING_VERIFICATION', traceId: tid || null }, tid);
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON', traceId: tid || null }, tid);
    }
  }

  // Verify (GET or POST)
  if ((method === 'GET' && url.pathname === '/auth/verify') || (method === 'POST' && url.pathname === '/auth/verify')) {
    try {
      const token = method === 'GET' ? url.searchParams.get('token') : ((await parseJson(req)) || {}).token;
      if (!token) return json(res, 400, { error: 'token requis', traceId: tid || null }, tid);
      const rec = store.tokens.get(token);
      if (!rec) return json(res, 404, { error: 'token inconnu', traceId: tid || null }, tid);
      if (Date.now() > rec.exp) return json(res, 410, { error: 'token expiré', traceId: tid || null }, tid);
      const org = store.orgs.get(rec.orgId);
      if (!org) return json(res, 404, { error: 'org inconnue', traceId: tid || null }, tid);
      org.status = 'VERIFIED';
      // create user
      const userId = uid('USR');
      const roles = [org.role === 'INDUSTRY' ? 'INDUSTRY' : org.role === 'TRANSPORTER' ? 'TRANSPORTER' : org.role === 'LOGISTICIAN' ? 'LOGISTICIAN' : 'FORWARDER'];
      store.users.set(userId, { id: userId, orgId: org.id, email: rec.email, roles });
      store.tokens.delete(token);
      return json(res, 200, { verified: true, orgId: org.id, userId, traceId: tid || null }, tid);
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON', traceId: tid || null }, tid);
    }
  }

  // Login
  if (method === 'POST' && url.pathname === '/auth/login') {
    try {
      const body = (await parseJson(req)) || {};
      const orgId = body.orgId;
      const email = body.email;
      if (!orgId || !email) return json(res, 400, { error: 'orgId/email requis', traceId: tid || null }, tid);
      const org = store.orgs.get(orgId);
      if (!org || org.status !== 'VERIFIED') return json(res, 403, { error: 'org non vérifiée', traceId: tid || null }, tid);
      const user = Array.from(store.users.values()).find(u => u.orgId === orgId && u.email === email);
      if (!user) return json(res, 404, { error: 'utilisateur inconnu', traceId: tid || null }, tid);
      const claims = { sub: user.id, roles: user.roles, orgId: orgId, locale: org.locale };
      const token = signJWT(claims, 3600);
      return json(res, 200, { token, claims, traceId: tid || null }, tid);
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON', traceId: tid || null }, tid);
    }
  }

  // Admin login (simple API key based, returns ADMIN role JWT)
  if (method === 'POST' && url.pathname === '/auth/admin/login') {
    try {
      const body = (await parseJson(req)) || {};
      const email = body.email;
      const adminKey = body.adminKey;
      if (!email || !adminKey) return json(res, 400, { error: 'email/adminKey requis', traceId: tid || null }, tid);
      if (adminKey !== (process.env.AUTHZ_ADMIN_API_KEY || '')) return json(res, 403, { error: 'forbidden', traceId: tid || null }, tid);
      const claims = { sub: email, roles: ['ADMIN'], orgId: 'admin', locale: 'fr' };
      const token = signJWT(claims, 3600);
      return json(res, 200, { token, claims, traceId: tid || null }, tid);
    } catch (e) { return json(res, 400, { error: 'Invalid JSON', traceId: tid || null }, tid); }
  }

  // Org detail
  if (method === 'GET' && /^\/auth\/orgs\/.+/.test(url.pathname)) {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    const id = url.pathname.split('/').pop();
    const org = id ? store.orgs.get(id) : null;
    if (!org) return json(res, 404, { error: 'Not Found', traceId: tid || null }, tid);
    return json(res, 200, { ...org, traceId: tid || null }, tid);
  }

  // List orgs (admin/backoffice selector)
  if (method === 'GET' && url.pathname === '/auth/orgs') {
    const q = (url.searchParams.get('query') || '').toLowerCase();
    const items = Array.from(store.orgs.values()).filter((o) => {
      if (!q) return true;
      return (
        (o.name || '').toLowerCase().includes(q) ||
        (o.contactEmail || '').toLowerCase().includes(q) ||
        (o.id || '').toLowerCase().includes(q)
      );
    }).map((o) => ({ id: o.id, name: o.name, role: o.role, status: o.status, plan: o.plan, addons: o.addons }));
    return json(res, 200, { items, traceId: tid || null }, tid);
  }

  // Public pricing catalog (base monthly placeholders)
  if (method === 'GET' && url.pathname === '/auth/plans') {
    try {
      const fs = require('fs');
      const path = require('path');
      const catalogPath = path.resolve(process.cwd(), 'packages', 'pricing', 'src', 'index.json');
      const data = fs.readFileSync(catalogPath, 'utf-8');
      const jsonData = JSON.parse(data);
      return json(res, 200, { ...jsonData, traceId: tid || null }, tid);
    } catch (e) {
      return json(res, 500, { error: 'pricing_unavailable', traceId: tid || null }, tid);
    }
  }

  // Upgrade/downgrade plan (admin/self-service)
  if (method === 'POST' && /^\/auth\/orgs\/.+\/plan$/.test(url.pathname)) {
    const id = url.pathname.split('/')[3];
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const body = (await parseJson(req)) || {};
      const plan = (body.plan || '').toUpperCase();
      if (!plan || !['FREE','PRO','ENTERPRISE'].includes(plan)) return json(res, 400, { error: 'plan invalide', traceId: tid || null }, tid);
      const addons = Array.isArray(body.addons) ? body.addons : [];
      const org = store.orgs.get(id);
      if (!org) return json(res, 404, { error: 'org inconnue', traceId: tid || null }, tid);
      org.plan = plan;
      org.addons = addons;
      return json(res, 200, { ok: true, plan, addons, traceId: tid || null }, tid);
    } catch (e) { return json(res, 400, { error: 'Invalid JSON', traceId: tid || null }, tid); }
  }

  return json(res, 404, { error: 'Not Found', traceId: tid || null }, tid);
});

server.listen(PORT, () => console.log(`[authz] HTTP prêt sur :${PORT}`));

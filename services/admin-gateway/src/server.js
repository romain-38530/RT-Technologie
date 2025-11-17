const http = require('http');
const fs = require('fs');
const path = require('path');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, rateLimiter, limitBodySize } = require('../../../packages/security/src/index.js');
const aws = require('../../../packages/cloud-aws/src/index.js');
const { featuresFor } = require('../../../packages/entitlements/src/index.js');
let mongo = null;

const PORT = Number(process.env.ADMIN_GATEWAY_PORT || '3008');
const AUTHZ_URL = (process.env.AUTHZ_URL || 'http://localhost:3007').replace(/\/$/, '');
const CORE_ORDERS_URL = (process.env.CORE_ORDERS_URL || 'http://localhost:3001').replace(/\/$/, '');
const PLANNING_URL = (process.env.PLANNING_URL || 'http://localhost:3004').replace(/\/$/, '');
const VIGILANCE_URL = (process.env.VIGILANCE_URL || 'http://localhost:3006').replace(/\/$/, '');
const NOTIFICATIONS_URL = (process.env.NOTIFICATIONS_URL || 'http://localhost:3002').replace(/\/$/, '');
const ECPMR_URL = (process.env.ECPMR_URL || 'http://localhost:3009').replace(/\/$/, '');

function json(res, status, body, traceId) {
  const data = JSON.stringify(body);
  addSecurityHeaders(res);
  const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) };
  if (traceId) headers['x-trace-id'] = traceId;
  res.writeHead(status, headers);
  res.end(data);
}

const parseBody = limitBodySize(512 * 1024);
const limiter = rateLimiter({ windowMs: 60000, max: 240 });

function httpRequestJson(method, baseUrl, p, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const base = new URL(baseUrl);
    const isHttps = base.protocol === 'https:';
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: base.hostname,
      port: base.port || (isHttps ? 443 : 80),
      path: p,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);
    const client = isHttps ? require('https') : require('http');
    const req = client.request(options, (res) => {
      let buf = '';
      res.on('data', (d) => (buf += d));
      res.on('end', () => {
        try {
          const json = buf ? JSON.parse(buf) : null;
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(new Error(`Upstream ${res.statusCode}: ${buf}`));
        } catch (e) { reject(e); }
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
  if (!limiter(req, res)) return;
  const tid = Array.isArray(req.headers['x-trace-id']) ? req.headers['x-trace-id'][0] : req.headers['x-trace-id'];

  if (method === 'GET' && url.pathname === '/admin/health') {
    let mongo = false; let awsOk = false;
    if (process.env.MONGODB_URI) {
      try { const m = require('../../../packages/data-mongo/src/index.js'); await m.connect(); mongo = true; } catch {}
    }
    if (process.env.AWS_REGION) {
      try { const id = await aws.getCallerIdentity(); awsOk = !!id?.Account; } catch {}
    }
    return json(res, 200, { status: 'ok', mongo, aws: awsOk, traceId: tid || null }, tid);
  }

  if (method === 'GET' && url.pathname === '/admin/health/full') {
    const targets = [
      { name: 'core-orders', url: `${CORE_ORDERS_URL}/health` },
      { name: 'planning', url: `${PLANNING_URL}/health` },
      { name: 'vigilance', url: `${VIGILANCE_URL}/health` },
      { name: 'notifications', url: `${NOTIFICATIONS_URL}/health` },
      { name: 'ecpmr', url: `${ECPMR_URL}/health` },
    ];
    const results = {};
    await Promise.all(targets.map(async (t) => {
      try {
        const out = await httpRequestJson('GET', t.url, '', null, {});
        results[t.name] = { ok: true, ...out };
      } catch (e) {
        results[t.name] = { ok: false, error: String(e.message || e) };
      }
    }));
    return json(res, 200, { services: results, traceId: tid || null }, tid);
  }

  if (method === 'GET' && url.pathname === '/admin/aws/identity') {
    try {
      const out = await aws.getCallerIdentity();
      return json(res, 200, { account: out.Account, arn: out.Arn, userId: out.UserId, traceId: tid || null }, tid);
    } catch (e) {
      return json(res, 502, { error: 'aws_identity_failed', detail: String(e.message || e), traceId: tid || null }, tid);
    }
  }

  // Require admin roles
  const auth = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE', roles: ['ADMIN', 'SUPERADMIN'] });
  if (auth === null) return;

  // Pricing
  if (method === 'GET' && url.pathname === '/admin/pricing') {
    try {
      const p = path.resolve(process.cwd(), 'packages', 'pricing', 'src', 'index.json');
      const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
      return json(res, 200, { ...data, traceId: tid || null }, tid);
    } catch (e) { return json(res, 500, { error: 'pricing_unavailable', traceId: tid || null }, tid); }
  }
  if (method === 'PUT' && url.pathname === '/admin/pricing') {
    try {
      const body = (await parseBody(req)) || {};
      const p = path.resolve(process.cwd(), 'packages', 'pricing', 'src', 'index.json');
      fs.writeFileSync(p, JSON.stringify(body, null, 2), 'utf-8');
      return json(res, 200, { ok: true, traceId: tid || null }, tid);
    } catch (e) { return json(res, 400, { error: 'invalid_pricing', traceId: tid || null }, tid); }
  }

  // Orgs proxy
  if (method === 'GET' && url.pathname === '/admin/orgs') {
    try {
      const q = url.searchParams.get('query') || '';
      const svcTok = process.env.INTERNAL_SERVICE_TOKEN;
      const out = await httpRequestJson('GET', AUTHZ_URL, `/auth/orgs?query=${encodeURIComponent(q)}`, null, svcTok ? { Authorization: `Bearer ${svcTok}`, 'x-trace-id': tid || '' } : {});
      return json(res, 200, { ...out, traceId: tid || null }, tid);
    } catch (e) { return json(res, 502, { error: e.message, traceId: tid || null }, tid); }
  }
  if (method === 'GET' && /^\/admin\/orgs\/.+/.test(url.pathname)) {
    const id = url.pathname.split('/').pop();
    try {
      const svcTok = process.env.INTERNAL_SERVICE_TOKEN;
      const out = await httpRequestJson('GET', AUTHZ_URL, `/auth/orgs/${encodeURIComponent(id)}`, null, svcTok ? { Authorization: `Bearer ${svcTok}`, 'x-trace-id': tid || '' } : {});
      return json(res, 200, { ...out, traceId: tid || null }, tid);
    } catch (e) { return json(res, 502, { error: e.message, traceId: tid || null }, tid); }
  }
  // Effective features for an org (no invited context)
  if (method === 'GET' && /^\/admin\/orgs\/.+\/features$/.test(url.pathname)) {
    const id = url.pathname.split('/')[3];
    try {
      const svcTok = process.env.INTERNAL_SERVICE_TOKEN;
      const org = await httpRequestJson('GET', AUTHZ_URL, `/auth/orgs/${encodeURIComponent(id)}`, null, svcTok ? { Authorization: `Bearer ${svcTok}`, 'x-trace-id': tid || '' } : {});
      const features = Array.from(featuresFor(org));
      return json(res, 200, { orgId: id, features, traceId: tid || null }, tid);
    } catch (e) { return json(res, 502, { error: e.message, traceId: tid || null }, tid); }
  }
  if (method === 'POST' && /^\/admin\/orgs\/.+\/plan$/.test(url.pathname)) {
    const id = url.pathname.split('/')[3];
    try {
      const body = (await parseBody(req)) || {};
      const svcTok = process.env.INTERNAL_SERVICE_TOKEN;
      const out = await httpRequestJson('POST', AUTHZ_URL, `/auth/orgs/${encodeURIComponent(id)}/plan`, body, svcTok ? { Authorization: `Bearer ${svcTok}`, 'x-trace-id': tid || '' } : {});
      return json(res, 200, { ...out, traceId: tid || null }, tid);
    } catch (e) { return json(res, 502, { error: e.message, traceId: tid || null }, tid); }
  }

  // Invitations per org (Mongo if available, else seeds)
  if (method === 'GET' && /^\/admin\/orgs\/.+\/invitations$/.test(url.pathname)) {
    const id = url.pathname.split('/')[3];
    try {
      if (process.env.MONGODB_URI) {
        if (!mongo) mongo = require('../../../packages/data-mongo/src/index.js');
        const db = await mongo.getDb();
        const rec = await db.collection('invitations').findOne({ industryOrgId: id });
        return json(res, 200, { industryOrgId: id, invitedCarriers: rec?.invitedCarriers || [], traceId: tid || null }, tid);
      } else {
        const p = path.resolve(process.cwd(), 'infra', 'seeds', 'invitations.json');
        let data = [];
        try { data = JSON.parse(fs.readFileSync(p, 'utf-8')); } catch {}
        const rec = data.find((r) => r.industryOrgId === id) || { industryOrgId: id, invitedCarriers: [] };
        return json(res, 200, { ...rec, traceId: tid || null }, tid);
      }
    } catch (e) { return json(res, 500, { error: 'invitations_unavailable', traceId: tid || null }, tid); }
  }
  if (method === 'POST' && /^\/admin\/orgs\/.+\/invitations$/.test(url.pathname)) {
    const id = url.pathname.split('/')[3];
    try {
      const body = (await parseBody(req)) || {};
      const invited = Array.isArray(body.invitedCarriers) ? body.invitedCarriers : [];
      if (process.env.MONGODB_URI) {
        if (!mongo) mongo = require('../../../packages/data-mongo/src/index.js');
        const db = await mongo.getDb();
        await db.collection('invitations').updateOne(
          { industryOrgId: id },
          { $set: { industryOrgId: id, invitedCarriers: invited } },
          { upsert: true }
        );
        return json(res, 200, { ok: true, industryOrgId: id, invitedCarriers: invited, traceId: tid || null }, tid);
      } else {
        const p = path.resolve(process.cwd(), 'infra', 'seeds', 'invitations.json');
        let data = [];
        try { data = JSON.parse(fs.readFileSync(p, 'utf-8')); } catch {}
        const idx = data.findIndex((r) => r.industryOrgId === id);
        if (idx >= 0) data[idx].invitedCarriers = invited; else data.push({ industryOrgId: id, invitedCarriers: invited });
        fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
        return json(res, 200, { ok: true, industryOrgId: id, invitedCarriers: invited, traceId: tid || null }, tid);
      }
    } catch (e) { return json(res, 400, { error: 'invalid_invitations', traceId: tid || null }, tid); }
  }

  // Apply invitations to existing flows (updates dispatch policies)
  if (method === 'POST' && /^\/admin\/orgs\/.+\/invitations\/apply$/.test(url.pathname)) {
    const id = url.pathname.split('/')[3];
    try {
      if (process.env.MONGODB_URI) {
        if (!mongo) mongo = require('../../../packages/data-mongo/src/index.js');
        const db = await mongo.getDb();
        const [carriers, invitRec, orders] = await Promise.all([
          db.collection('carriers').find({}).project({ id: 1 }).toArray(),
          db.collection('invitations').findOne({ industryOrgId: id }),
          db.collection('orders').find({ ownerOrgId: id }).project({ id: 1 }).toArray(),
        ]);
        const allCarrierIds = (carriers || []).map((c) => c.id);
        const invited = Array.isArray(invitRec?.invitedCarriers) ? invitRec.invitedCarriers : [];
        let updated = 0;
        for (const o of (orders || [])) {
          const seen = new Set();
          const chain = [];
          for (const cid of invited) { if (!seen.has(cid)) { seen.add(cid); chain.push(cid); } }
          for (const cid of allCarrierIds) { if (!seen.has(cid)) { seen.add(cid); chain.push(cid); } }
          await db.collection('dispatch_policies').updateOne(
            { orderId: o.id },
            { $set: { orderId: o.id, chain, slaAcceptHours: 2 } },
            { upsert: true }
          );
          updated += 1;
        }
        return json(res, 200, { ok: true, industryOrgId: id, updated, traceId: tid || null }, tid);
      } else {
        // Read seeds
        const base = path.resolve(process.cwd(), 'infra', 'seeds');
        const carriers = JSON.parse(fs.readFileSync(path.join(base, 'carriers.json'), 'utf-8'));
        const invitations = JSON.parse(fs.readFileSync(path.join(base, 'invitations.json'), 'utf-8'));
        const orders = JSON.parse(fs.readFileSync(path.join(base, 'orders.json'), 'utf-8'));
        let policies = [];
        try { policies = JSON.parse(fs.readFileSync(path.join(base, 'dispatch-policies.json'), 'utf-8')); } catch { policies = []; }

        const invitedRec = invitations.find((r) => r.industryOrgId === id);
        const invited = Array.isArray(invitedRec?.invitedCarriers) ? invitedRec.invitedCarriers : [];
        const allCarrierIds = carriers.map((c) => c.id);

        let updated = 0;
        const byOrder = new Map(policies.map((p) => [p.orderId, p]));
        for (const o of orders) {
          if (o.ownerOrgId !== id) continue;
          const chain = [];
          const seen = new Set();
          for (const cid of invited) { if (!seen.has(cid)) { seen.add(cid); chain.push(cid); } }
          for (const cid of allCarrierIds) { if (!seen.has(cid)) { seen.add(cid); chain.push(cid); } }
          const existing = byOrder.get(o.id);
          const next = { orderId: o.id, chain, slaAcceptHours: existing?.slaAcceptHours || 2 };
          byOrder.set(o.id, next);
          updated += 1;
        }
        const outPolicies = Array.from(byOrder.values());
        fs.writeFileSync(path.join(base, 'dispatch-policies.json'), JSON.stringify(outPolicies, null, 2), 'utf-8');
        return json(res, 200, { ok: true, industryOrgId: id, updated, traceId: tid || null }, tid);
      }
    } catch (e) { return json(res, 500, { error: 'apply_failed', detail: String(e.message || e), traceId: tid || null }, tid); }
  }

  // Carriers list (Mongo if available, else seeds)
  if (method === 'GET' && url.pathname === '/admin/carriers') {
    try {
      if (process.env.MONGODB_URI) {
        if (!mongo) mongo = require('../../../packages/data-mongo/src/index.js');
        const db = await mongo.getDb();
        const data = await db.collection('carriers').find({}).project({ _id: 0 }).toArray();
        const items = (data || []).map((c) => ({ id: c.id, name: c.name, email: c.email || null, blocked: !!c.blocked }));
        return json(res, 200, { items, traceId: tid || null }, tid);
      } else {
        const p = path.resolve(process.cwd(), 'infra', 'seeds', 'carriers.json');
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        const items = data.map((c) => ({ id: c.id, name: c.name, email: c.email || null, blocked: !!c.blocked }));
        return json(res, 200, { items, traceId: tid || null }, tid);
      }
    } catch (e) { return json(res, 500, { error: 'carriers_unavailable', traceId: tid || null }, tid); }
  }

  return json(res, 404, { error: 'Not Found', traceId: tid || null }, tid);
});

server.listen(PORT, () => console.log(`[admin-gateway] HTTP prêt sur :${PORT}`));

const http = require('http');
const http = require('http');
const https = require('https');
const querystring = require('querystring');
const { compose } = require('../../../packages/comm-templates/src/index.js');
const { complete } = require('../../../packages/ai-client/src/index.js');
const { addSecurityHeaders, handleCorsPreflight, requireAuth, limitBodySize, rateLimiter } = require('../../../packages/security/src/index.js');
const aws = require('../../../packages/cloud-aws/src/index.js');

function env(name, def) {
  const v = process.env[name];
  if (!v && def === undefined) throw new Error(`Missing env ${name}`);
  return v || def;
}

const PORT = Number(env('NOTIFICATIONS_PORT', '3002'));
const MAILGUN_DOMAIN = env('MAILGUN_DOMAIN', '');
const MAILGUN_API_KEY = env('MAILGUN_API_KEY', '');
const MAIL_FROM = env('MAIL_FROM', 'no-reply@example.com');
const SES_FROM = process.env.NOTIFICATIONS_SES_FROM || '';
const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL || process.env.SUPPORT_URL || 'https://www.rt-technologie.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@rt-technologie.com';

function json(res, status, body) {
  const data = JSON.stringify(body);
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

function sendMailgun({ to, subject, text, html }) {
  return new Promise((resolve, reject) => {
    if (!MAILGUN_DOMAIN || !MAILGUN_API_KEY) return reject(new Error('Mailgun not configured'));

    const payload = querystring.stringify({
      from: MAIL_FROM,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    });

    const options = {
      hostname: 'api.mailgun.net',
      path: `/v3/${MAILGUN_DOMAIN}/messages`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64'),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) return resolve({ status: res.statusCode, body });
        reject(new Error(`Mailgun error ${res.statusCode}: ${body}`));
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const parseBody = limitBodySize(256 * 1024);
const limiter = rateLimiter({ windowMs: 60000, max: 600 });
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  addSecurityHeaders(res);
  if (handleCorsPreflight(req, res)) return;
  if (!limiter(req, res)) return;
  const traceIdHdr = req.headers['x-trace-id'];
  const traceId = Array.isArray(traceIdHdr) ? traceIdHdr[0] : traceIdHdr;
  if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { status: 'ok', ses: !!SES_FROM, mailgun: !!(MAILGUN_DOMAIN && MAILGUN_API_KEY) });

  if (req.method === 'POST' && url.pathname === '/notifications/email') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const body = (await parseBody(req)) || {};
      const { to, subject, text, html } = body;
      if (!to || !subject || (!text && !html)) return json(res, 400, { error: 'to, subject et text|html requis' });
      const footer = `\n\nSupport: ${SUPPORT_URL} | ${SUPPORT_EMAIL}`;
      const textWithFooter = (text || html || '') + footer;
      let sent = false; let err = null;
      if (MAILGUN_DOMAIN && MAILGUN_API_KEY) {
        try { await sendMailgun({ to, subject, text: textWithFooter, html }); sent = true; } catch (e) { err = e; }
      }
      if (!sent && SES_FROM) {
        try { await aws.sesSendEmail({ from: SES_FROM, to, subject, text: textWithFooter }); sent = true; } catch (e2) { err = e2; }
      }
      if (!sent) return json(res, 502, { sent: false, error: err ? err.message : 'no provider configured' });
      if (traceId) console.log('[notifications] sent', { to, subject, traceId });
      return json(res, 200, { sent: true, traceId: traceId || null });
    } catch (e) {
      console.error('[notifications] error', e.message);
      return json(res, 502, { sent: false, error: e.message, traceId: traceId || null });
    }
  }

  // POST /notifications/email/from-template
  // body: { to, templateId, locale, variables, aiEnhance?: boolean }
  if (req.method === 'POST' && url.pathname === '/notifications/email/from-template') {
    const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
    if (authResult === null) return;
    try {
      const body = (await parseBody(req)) || {};
      const { to, templateId, locale, variables, aiEnhance } = body;
      if (!to || !templateId) return json(res, 400, { error: 'to et templateId requis' });
      let { subject, text } = compose(templateId, locale || 'fr', variables || {});
      if (aiEnhance && process.env.OPENROUTER_API_KEY) {
        try {
          const prompt = `Réécris cet email de manière claire et professionnelle en ${locale || 'fr'}, sans salutations superflues, et garde le sens: Sujet: ${subject}\nTexte: ${text}`;
          const out = await complete(prompt, { max_tokens: 200 });
          const m = out.content.match(/Sujet\s*:\s*(.*)\n[\s\S]*?Texte\s*:\s*([\s\S]*)/i);
          if (m) { subject = m[1].trim(); text = m[2].trim(); }
        } catch (e) { /* ignore enhancement errors */ }
      }
      const footer = `\n\nSupport: ${SUPPORT_URL} | ${SUPPORT_EMAIL}`;
      const textWithFooter = String(text || '') + footer;
      let sent = false; let err = null;
      if (MAILGUN_DOMAIN && MAILGUN_API_KEY) {
        try { await sendMailgun({ to, subject, text: textWithFooter }); sent = true; } catch (e) { err = e; }
      }
      if (!sent && SES_FROM) {
        try { await aws.sesSendEmail({ from: SES_FROM, to, subject, text: textWithFooter }); sent = true; } catch (e2) { err = e2; }
      }
      if (!sent) return json(res, 502, { sent: false, error: err ? err.message : 'no provider configured' });
      if (traceId) console.log('[notifications] sent', { to, templateId, subject, traceId });
      return json(res, 200, { sent: true, subject, traceId: traceId || null });
    } catch (e) {
      return json(res, 400, { error: 'Invalid JSON', traceId: traceId || null });
    }
  }

  return json(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`[notifications] HTTP prêt sur :${PORT}`);
});

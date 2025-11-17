const http = require('http');
const https = require('https');

function getBaseUrl() {
  return process.env.NOTIFICATIONS_URL || 'http://localhost:3002';
}

function sendEmail({ to, subject, text, html }) {
  return new Promise((resolve, reject) => {
    const base = new URL(getBaseUrl());
    const payload = JSON.stringify({ to, subject, text, html });
    const isHttps = base.protocol === 'https:';
    const options = {
      hostname: base.hostname,
      port: base.port || (isHttps ? 443 : 80),
      path: '/notifications/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const svcTok = process.env.INTERNAL_SERVICE_TOKEN;
    if (svcTok) options.headers['Authorization'] = `Bearer ${svcTok}`;
    const req = (isHttps ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve({ ok: true });
        return reject(new Error(`Notify error ${res.statusCode}: ${body}`));
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = { sendEmail };

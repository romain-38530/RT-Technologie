// Generate base secrets for RT Technologie (no external keys)
// - Outputs strong random values for: AUTHZ_JWT_SECRET, INTERNAL_SERVICE_TOKEN, AUTHZ_ADMIN_API_KEY
// - Creates/updates a local .env.local with these values (ignored by git)
// - Prints copy/paste blocks for Render and Vercel dashboards

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function randUrlSafe(bytes = 48) {
  return crypto.randomBytes(bytes).toString('base64url');
}

function upsertEnvLocal(kv) {
  const envPath = path.resolve(process.cwd(), '.env.local');
  let lines = [];
  if (fs.existsSync(envPath)) {
    lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  }
  const map = new Map();
  for (const l of lines) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(l.trim());
    if (m) map.set(m[1], m[2]);
  }
  for (const [k, v] of Object.entries(kv)) {
    map.set(k, typeof v === 'string' ? v : String(v));
  }
  const out = Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
  fs.writeFileSync(envPath, out, 'utf-8');
  return envPath;
}

function main() {
  const secrets = {
    AUTHZ_JWT_SECRET: randUrlSafe(64),
    INTERNAL_SERVICE_TOKEN: randUrlSafe(48),
    AUTHZ_ADMIN_API_KEY: randUrlSafe(32),
  };

  const p = upsertEnvLocal(secrets);

  console.log('Generated base secrets and wrote to:', p);
  console.log('\nLocal dev .env.local additions:');
  for (const [k, v] of Object.entries(secrets)) console.log(`${k}=${v}`);

  console.log('\nRender (services) — copy/paste these env vars where applicable:');
  console.log(`AUTHZ_JWT_SECRET=${secrets.AUTHZ_JWT_SECRET}`);
  console.log(`INTERNAL_SERVICE_TOKEN=${secrets.INTERNAL_SERVICE_TOKEN}`);
  console.log(`AUTHZ_ADMIN_API_KEY=${secrets.AUTHZ_ADMIN_API_KEY}`);
  console.log('CORS_ALLOW_ORIGIN=https://www.rt-technologie.com');
  console.log('SECURITY_ENFORCE=true');

  console.log('\nVercel (front) — set the following (already public):');
  console.log('NEXT_PUBLIC_ADMIN_GATEWAY_URL=https://admin-gateway.rt-technologie.com');
  console.log('NEXT_PUBLIC_AUTHZ_URL=https://authz.rt-technologie.com');
  console.log('NEXT_PUBLIC_SUPPORT_URL=https://www.rt-technologie.com');

  console.log('\nNote: External APIs (Mailgun, AWS, Mongo Atlas, OpenRouter, VAT) must be provided via their own dashboards.');
  console.log('For security, rotate any keys previously shared in chat and DO NOT commit real secrets.');
}

main();


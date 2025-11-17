const https = require('https');

function env(name, def) {
  const v = process.env[name];
  return v == null ? def : v;
}

const BASE = env('VATCHECK_BASE_URL', 'https://app.vatcheckapi.com');
const PATH = env('VATCHECK_PATH', '/api/validate');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => {
          try {
            const json = data ? JSON.parse(data) : null;
            if (res.statusCode >= 200 && res.statusCode < 300) return resolve(json);
            return reject(new Error(`VAT API ${res.statusCode}: ${data}`));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function validateVAT({ vat, country, number }) {
  const apiKey = process.env.VATCHECK_API_KEY;
  if (!apiKey) throw new Error('VATCHECK_API_KEY non configurée');
  let vat_number = vat;
  if (!vat_number && country && number) vat_number = `${country}${number}`;
  if (!vat_number) throw new Error('vat ou country+number requis');
  const url = new URL(PATH, BASE);
  url.searchParams.set('vat_number', vat_number);
  url.searchParams.set('api_key', apiKey);
  const raw = await httpGet(url.toString());
  // Normalisation du résultat
  const valid = Boolean(raw?.valid ?? raw?.is_valid ?? raw?.success ?? false);
  return { valid, raw };
}

module.exports = { validateVAT };

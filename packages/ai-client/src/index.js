const https = require('https');

function env(name, def) {
  const v = process.env[name];
  return v == null ? def : v;
}

const OPENROUTER_BASE_URL = env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1');
const OPENROUTER_MODEL = env('OPENROUTER_MODEL', 'openai/gpt-4o-mini');
const OPENROUTER_PROJECT = env('OPENROUTER_PROJECT', 'RT-Technologie');
const OPENROUTER_REFERER = env('OPENROUTER_REFERER', 'http://localhost');

function request(path, body) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return reject(new Error('OPENROUTER_API_KEY non configurée'));
    const url = new URL(path, OPENROUTER_BASE_URL);
    const payload = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + (url.search || ''),
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'HTTP-Referer': OPENROUTER_REFERER,
        'X-Title': OPENROUTER_PROJECT
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : null;
          if (res.statusCode >= 200 && res.statusCode < 300) return resolve(json);
          return reject(new Error(`OpenRouter ${res.statusCode}: ${data}`));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function chat(messages, opts = {}) {
  const model = opts.model || OPENROUTER_MODEL;
  const body = { model, messages, temperature: opts.temperature ?? 0.2, max_tokens: opts.max_tokens ?? 256 };
  const res = await request('/chat/completions', body);
  const content = res?.choices?.[0]?.message?.content || '';
  return { content, raw: res };
}

async function complete(prompt, opts = {}) {
  const messages = [{ role: 'user', content: prompt }];
  return chat(messages, opts);
}

module.exports = { chat, complete };

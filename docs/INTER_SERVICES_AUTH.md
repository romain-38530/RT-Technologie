# Authentification Inter-Services - RT-Technologie

Date de dernière mise à jour : 2025-11-18

## Vue d'ensemble

Ce document décrit le mécanisme d'authentification et d'autorisation pour les communications entre les services backend de RT-Technologie.

## Architecture de sécurité

### Principes de base

1. **Isolation des services** : Chaque service est autonome et peut être déployé indépendamment
2. **Authentification mutuelle** : Les services vérifient l'identité de l'appelant
3. **Token interne partagé** : Utilisation d'un secret partagé pour les appels inter-services
4. **Mode optionnel** : Possibilité de désactiver l'authentification en développement

## Token interne (INTERNAL_SERVICE_TOKEN)

### Configuration

Chaque service doit définir le même token dans son environnement :

```bash
INTERNAL_SERVICE_TOKEN=your-strong-shared-secret-change-in-production
```

**IMPORTANT** : Ce token doit être :
- Au moins 32 caractères
- Généré aléatoirement (ex: `openssl rand -hex 32`)
- Identique sur tous les services
- Différent entre les environnements (dev, staging, prod)

### Exemple de génération

```bash
# Générer un token sécurisé
openssl rand -hex 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Modes d'authentification

### Mode développement (SECURITY_ENFORCE=false)

```bash
# .env
SECURITY_ENFORCE=false
INTERNAL_SERVICE_TOKEN=dev-token-not-secure
```

Comportement :
- Les appels inter-services fonctionnent sans token
- Logs de warning si le token est manquant
- Permet un développement plus rapide

### Mode production (SECURITY_ENFORCE=true)

```bash
# .env
SECURITY_ENFORCE=true
INTERNAL_SERVICE_TOKEN=98a7c6f5e4d3b2a1098765432109876543210987654321098765432109876543
```

Comportement :
- Token obligatoire pour tous les appels
- Rejet immédiat (401) si token manquant
- Rejet (403) si token invalide

## Implémentation côté client (Appelant)

### Envoi du token

Deux méthodes supportées :

#### Méthode 1 : Header Authorization (recommandé)

```javascript
const axios = require('axios');

async function callService(serviceUrl, endpoint, data) {
  const token = process.env.INTERNAL_SERVICE_TOKEN;

  const response = await axios.post(`${serviceUrl}${endpoint}`, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-trace-id': generateTraceId() // Optionnel mais recommandé
    }
  });

  return response.data;
}

// Exemple d'utilisation
await callService(
  'http://localhost:3008',
  '/vigilance/status/CARRIER-001',
  {}
);
```

#### Méthode 2 : Header custom X-Internal-Service-Token

```javascript
async function callService(serviceUrl, endpoint, data) {
  const token = process.env.INTERNAL_SERVICE_TOKEN;

  const response = await axios.post(`${serviceUrl}${endpoint}`, data, {
    headers: {
      'X-Internal-Service-Token': token,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}
```

### Avec http natif Node.js

```javascript
const http = require('http');

function httpRequestJson(method, baseUrl, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl);
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let buf = '';
      res.on('data', (d) => (buf += d));
      res.on('end', () => {
        try {
          const json = buf ? JSON.parse(buf) : null;
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${buf}`));
          }
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

// Utilisation
const VIGILANCE_URL = process.env.VIGILANCE_URL || 'http://localhost:3008';
const token = process.env.INTERNAL_SERVICE_TOKEN;

const result = await httpRequestJson(
  'GET',
  VIGILANCE_URL,
  '/vigilance/status/CARRIER-001?refresh=1',
  null,
  token
);
```

## Implémentation côté serveur (Service appelé)

### Middleware d'authentification

Le package `@rt-technologie/security` fournit le middleware `requireAuth` :

```javascript
const { requireAuth } = require('../../../packages/security/src/index.js');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Routes publiques (health check)
  if (req.method === 'GET' && url.pathname === '/health') {
    return json(res, 200, { status: 'ok' });
  }

  // Authentification requise pour les autres routes
  const authResult = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });
  if (authResult === null) {
    // Le middleware a déjà envoyé la réponse 401/403
    return;
  }

  // Route protégée
  if (req.method === 'GET' && url.pathname === '/vigilance/status/:id') {
    // ... logique métier
  }
});
```

### Implémentation manuelle

Si vous ne pouvez pas utiliser le package security :

```javascript
function requireAuth(req, res, options = {}) {
  const optionalEnv = options.optionalEnv || 'SECURITY_ENFORCE';
  const enforceAuth = process.env[optionalEnv] === 'true';

  // Extraire le token
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-internal-service-token'];

  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (customHeader) {
    token = customHeader;
  }

  // Si l'authentification n'est pas enforced et pas de token, on continue
  if (!enforceAuth && !token) {
    console.warn('[auth] Token manquant mais SECURITY_ENFORCE=false');
    return { authenticated: false, optional: true };
  }

  // Si enforced et pas de token : rejet
  if (enforceAuth && !token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized: No token provided' }));
    return null; // Indique que la réponse a été envoyée
  }

  // Vérifier le token
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;

  if (token && token !== expectedToken) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Forbidden: Invalid token' }));
    return null;
  }

  // Token valide
  return {
    authenticated: true,
    token,
    claims: { type: 'service' }
  };
}
```

## Gestion des erreurs

### Codes HTTP

| Code | Signification | Action |
|------|---------------|--------|
| **401 Unauthorized** | Token manquant | Vérifier la configuration INTERNAL_SERVICE_TOKEN |
| **403 Forbidden** | Token invalide | Vérifier que le token est identique sur les deux services |
| **503 Service Unavailable** | Service appelé indisponible | Retry avec backoff exponentiel |
| **504 Gateway Timeout** | Timeout dépassé | Augmenter le timeout ou diagnostiquer le service |

### Retry et circuit breaker

```javascript
async function callServiceWithRetry(serviceUrl, endpoint, data, maxRetries = 3) {
  const token = process.env.INTERNAL_SERVICE_TOKEN;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(`${serviceUrl}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 secondes
      });

      return response.data;

    } catch (error) {
      lastError = error;

      // Ne pas retry si erreur d'authentification
      if (error.response && [401, 403].includes(error.response.status)) {
        throw error;
      }

      // Attendre avant retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`[retry] Tentative ${attempt + 2}/${maxRetries} après ${delay}ms`);
      }
    }
  }

  throw lastError;
}
```

## Traçabilité avec x-trace-id

### Génération du trace ID

```javascript
const crypto = require('crypto');

function generateTraceId() {
  return `trace-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
}
```

### Propagation du trace ID

```javascript
async function callService(serviceUrl, endpoint, data, traceId) {
  const token = process.env.INTERNAL_SERVICE_TOKEN;

  // Générer un nouveau trace ID si non fourni
  const tid = traceId || generateTraceId();

  const response = await axios.post(`${serviceUrl}${endpoint}`, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-trace-id': tid
    }
  });

  return {
    data: response.data,
    traceId: response.headers['x-trace-id'] || tid
  };
}
```

### Côté serveur

```javascript
const server = http.createServer(async (req, res) => {
  // Extraire le trace ID
  const traceIdHdr = req.headers['x-trace-id'];
  const traceId = Array.isArray(traceIdHdr) ? traceIdHdr[0] : traceIdHdr;

  // Logger avec trace ID
  console.log(`[${traceId}] ${req.method} ${req.url}`);

  // ... traitement

  // Renvoyer le trace ID dans la réponse
  if (traceId) {
    res.setHeader('x-trace-id', traceId);
  }

  res.end(JSON.stringify({ success: true, traceId }));
});
```

## Matrice des appels authentifiés

| Service appelant | Service appelé | Endpoint | Token requis |
|------------------|----------------|----------|--------------|
| core-orders | authz | GET /auth/orgs/:id | Oui |
| core-orders | vigilance | GET /vigilance/status/:id | Oui |
| core-orders | affret-ia | POST /affret-ia/dispatch | Oui |
| affret-ia | palette | POST /palette/match/site | Oui |
| affret-ia | core-orders | Lecture seeds/mongo | Non (indirect) |
| admin-gateway | authz | GET /auth/orgs | Oui |
| admin-gateway | core-orders | GET /health | Non |
| admin-gateway | vigilance | GET /health | Non |
| palette | notifications | POST /notifications/email | Oui |
| planning | notifications | POST /notifications/email | Oui |

## Configuration par environnement

### Développement local

```bash
# .env.development
SECURITY_ENFORCE=false
INTERNAL_SERVICE_TOKEN=dev-token-change-me

# Services URLs (localhost)
AUTHZ_URL=http://localhost:3002
VIGILANCE_URL=http://localhost:3008
AFFRET_IA_URL=http://localhost:3010
PALETTE_API_URL=http://localhost:3009
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  core-orders:
    environment:
      - SECURITY_ENFORCE=true
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
      - AUTHZ_URL=http://authz:3002
      - VIGILANCE_URL=http://vigilance:3008

  authz:
    environment:
      - SECURITY_ENFORCE=true
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}

  vigilance:
    environment:
      - SECURITY_ENFORCE=true
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
```

```bash
# .env (root du projet)
INTERNAL_SERVICE_TOKEN=docker-shared-secret-change-in-production
```

### Production (AWS/Azure)

```bash
# Via AWS Systems Manager Parameter Store
SECURITY_ENFORCE=true
INTERNAL_SERVICE_TOKEN={{ssm:/rt-technologie/prod/internal-service-token}}

# Ou Azure Key Vault
INTERNAL_SERVICE_TOKEN={{keyvault:rt-technologie-prod:internal-service-token}}

# Services URLs (internes au VPC)
AUTHZ_URL=http://authz.internal:3002
VIGILANCE_URL=http://vigilance.internal:3008
```

## Rotation du token

### Stratégie blue-green

1. **Phase 1 : Support de deux tokens**
   ```javascript
   const CURRENT_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;
   const NEXT_TOKEN = process.env.INTERNAL_SERVICE_TOKEN_NEXT;

   function isValidToken(token) {
     return token === CURRENT_TOKEN || (NEXT_TOKEN && token === NEXT_TOKEN);
   }
   ```

2. **Phase 2 : Déploiement progressif**
   - Déployer tous les services avec CURRENT_TOKEN + NEXT_TOKEN
   - Valider que tout fonctionne

3. **Phase 3 : Basculement**
   - Mettre à jour les clients pour utiliser NEXT_TOKEN
   - Déployer progressivement

4. **Phase 4 : Cleanup**
   - Retirer CURRENT_TOKEN
   - NEXT_TOKEN devient CURRENT_TOKEN

## Tests

### Test unitaire

```javascript
const assert = require('assert');

describe('Inter-service authentication', () => {
  it('should accept valid token', async () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'test-token-123';
    process.env.SECURITY_ENFORCE = 'true';

    const req = {
      headers: {
        'authorization': 'Bearer test-token-123'
      }
    };

    const res = {};
    const result = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });

    assert.ok(result !== null);
    assert.ok(result.authenticated);
  });

  it('should reject invalid token', async () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'test-token-123';
    process.env.SECURITY_ENFORCE = 'true';

    const req = {
      headers: {
        'authorization': 'Bearer wrong-token'
      }
    };

    let statusCode;
    const res = {
      writeHead: (code) => { statusCode = code; },
      end: () => {}
    };

    const result = requireAuth(req, res, { optionalEnv: 'SECURITY_ENFORCE' });

    assert.equal(result, null);
    assert.equal(statusCode, 403);
  });
});
```

### Test d'intégration

```javascript
const axios = require('axios');

describe('Service communication', () => {
  it('should call vigilance service successfully', async () => {
    const token = process.env.INTERNAL_SERVICE_TOKEN;
    const vigilanceUrl = process.env.VIGILANCE_URL;

    const response = await axios.get(
      `${vigilanceUrl}/vigilance/status/CARRIER-001`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    assert.equal(response.status, 200);
    assert.ok(response.data.status);
  });
});
```

## Monitoring et alertes

### Métriques à surveiller

1. **Taux d'échecs d'authentification** (401/403)
   - Alerte si > 5% des requêtes
   - Peut indiquer une mauvaise configuration

2. **Latence des appels inter-services**
   - P95 < 500ms
   - P99 < 1s

3. **Taux de timeout**
   - Alerte si > 1%

### Logs structurés

```javascript
console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  service: 'core-orders',
  traceId: traceId,
  event: 'service_call',
  target: 'vigilance',
  endpoint: '/vigilance/status/CARRIER-001',
  authenticated: true,
  duration_ms: 145,
  status: 200
}));
```

## FAQ

### Q: Puis-je utiliser des tokens différents par service ?
**R:** Non recommandé. Utilisez un token partagé unique pour simplifier la gestion. Si vous avez besoin de permissions granulaires, ajoutez des claims dans un JWT.

### Q: Le token doit-il être un JWT ?
**R:** Non. Un simple secret partagé suffit pour les communications inter-services internes. Les JWT sont plus adaptés pour les clients externes.

### Q: Comment tester en local sans authentification ?
**R:** Utilisez `SECURITY_ENFORCE=false` en développement.

### Q: Que faire si un token est compromis ?
**R:** Suivez la procédure de rotation immédiatement. Utilisez la stratégie blue-green décrite ci-dessus.

## Références

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [RFC 6750 - Bearer Token](https://tools.ietf.org/html/rfc6750)
- [Microservices Security Best Practices](https://www.nginx.com/blog/microservices-security-best-practices/)

## Changelog

- **2025-11-18** : Création du guide d'authentification inter-services
- **2025-11-18** : Ajout stratégie de rotation des tokens
- **2025-11-18** : Ajout examples de tests

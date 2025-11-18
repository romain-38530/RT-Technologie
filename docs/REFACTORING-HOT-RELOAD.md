# Guide de Refactorisation pour Hot Reload

## Problème

Lors de l'exécution des services dans Docker avec hot reload (nodemon, turbo watch, etc.), les erreurs suivantes apparaissent :
- `SyntaxError: Identifier 'X' has already been declared`
- `TypeError: Cannot redeclare function 'Y'`
- Le serveur HTTP ne redémarre pas correctement

## Solution : Pattern de Refactorisation

### 1. Pour les services HTTP natifs (ex: chatbot)

#### Imports et require()

**Avant :**
```javascript
const http = require('http');
const express = require('express');
const { AIEngine } = require('./ai-engine');
```

**Après :**
```javascript
// Protection contre les redéclarations
if (!global.__servicename_http) global.__servicename_http = require('http');
if (!global.__servicename_express) global.__servicename_express = require('express');
if (!global.__servicename_AIEngine) {
  global.__servicename_AIEngine = require('./ai-engine').AIEngine;
}

var http = global.__servicename_http;
var express = global.__servicename_express;
var AIEngine = global.__servicename_AIEngine;
```

#### Variables et constantes

**Avant :**
```javascript
const PORT = 3000;
const store = { users: new Map() };
```

**Après :**
```javascript
var PORT = 3000;

if (!global.__servicename_store) {
  global.__servicename_store = { users: new Map() };
}
var store = global.__servicename_store;
```

#### Fonctions

**Avant :**
```javascript
function processMessage(msg) {
  // ...
}

async function initializeEngines() {
  // ...
}
```

**Après :**
```javascript
var processMessage = function(msg) {
  // ...
};

var initializeEngines = async function() {
  // ...
};
```

#### Serveur HTTP

**Avant :**
```javascript
const server = http.createServer((req, res) => {
  // ...
});

server.listen(PORT, () => {
  console.log(`Server on :${PORT}`);
});
```

**Après :**
```javascript
// Fermer l'ancien serveur
if (global.__servicename_server) {
  try {
    global.__servicename_server.close();
  } catch (e) {
    // Ignore
  }
}

global.__servicename_server = http.createServer((req, res) => {
  // ...
});

var server = global.__servicename_server;

// Protection contre la réinitialisation
if (!global.__servicename_initialized) {
  global.__servicename_initialized = true;

  server.listen(PORT, () => {
    console.log(`Server on :${PORT}`);
  });
} else {
  console.log('[servicename] Server already initialized');
}
```

### 2. Pour les services Express (ex: geo-tracking, planning)

#### Template complet

```javascript
// Protection contre les redéclarations
if (!global.__servicename_modules) {
  global.__servicename_modules = {};
  require('dotenv').config();
}

// Helper pour require avec cache
function requireOnce(name, path) {
  if (!global.__servicename_modules[name]) {
    global.__servicename_modules[name] = require(path);
  }
  return global.__servicename_modules[name];
}

// Imports
var express = requireOnce('express', 'express');
var cors = requireOnce('cors', 'cors');
var helmet = requireOnce('helmet', 'helmet');

// Configuration
var PORT = process.env.PORT || 3016;

// Logger global
if (!global.__servicename_logger) {
  global.__servicename_logger = winston.createLogger({
    // config...
  });
}
var logger = global.__servicename_logger;

// App Express - Fermer l'ancienne instance
if (global.__servicename_server) {
  try {
    global.__servicename_server.close();
  } catch (e) {
    // Ignore
  }
}

if (!global.__servicename_app) {
  global.__servicename_app = express();
  global.__servicename_app.use(helmet());
  global.__servicename_app.use(cors());
  global.__servicename_app.use(express.json());
}
var app = global.__servicename_app;

// Connexion DB
if (!global.__servicename_db) {
  MongoClient.connect(MONGODB_URI)
    .then(client => {
      global.__servicename_db = client.db();
      logger.info('Connected to MongoDB');
    });
}
var db = global.__servicename_db;

// Middlewares et fonctions
var authMiddleware = function(req, res, next) {
  // ...
};

// Routes
app.get('/path', authMiddleware, async (req, res) => {
  // Utiliser 'var' pour toutes les variables locales
  var data = req.body;
  var result = await someFunction(data);
  res.json(result);
});

// Démarrage
if (!global.__servicename_initialized) {
  global.__servicename_initialized = true;

  global.__servicename_server = app.listen(PORT, () => {
    logger.info(`Server running on :${PORT}`);
  });
} else {
  logger.info('[servicename] Server already initialized');
}
```

## Services refactorisés

### ✅ Terminés
1. **services/chatbot/src/server.js** - Service HTTP natif avec WebSocket
2. **services/geo-tracking/src/server.js** - Service Express avec MongoDB

### 🔄 À faire
Les 12 services restants peuvent être refactorisés en suivant le même pattern :
- services/ecpmr/src/server.js
- services/tms-sync/src/server.js
- services/admin-gateway/src/server.js
- services/affret-ia/src/server.js
- services/authz/src/server.js
- services/core-orders/src/server.js
- services/notifications/src/server.js
- services/palette/src/server.js
- services/planning/src/server.js
- services/storage-market/src/server.js
- services/training/src/server.js
- services/vigilance/src/server.js

## Checklist de refactorisation

Pour chaque service :

- [ ] Remplacer TOUS les `const` par `var`
- [ ] Utiliser `global.__servicename_*` pour les modules
- [ ] Transformer `function name()` en `var name = function()`
- [ ] Protéger les stores en mémoire avec `global.__servicename_store`
- [ ] Fermer l'ancien serveur avant d'en créer un nouveau
- [ ] Utiliser un flag `global.__servicename_initialized`
- [ ] Dans les routes Express, utiliser `var` pour toutes les variables (pas de `const`)
- [ ] Tester que le service démarre correctement dans Docker

## Nommage des namespaces globaux

Convention : `__servicename_*` où servicename est le nom du dossier du service

Exemples :
- chatbot → `__chatbot_*`
- geo-tracking → `__geo_tracking_*`
- core-orders → `__core_orders_*`

## Avantages

1. **Pas d'erreurs de redéclaration** : Toutes les variables peuvent être réassignées
2. **Persistance des stores** : Les données en mémoire survivent au hot reload
3. **Pas de ports occupés** : L'ancien serveur est fermé avant recréation
4. **Hot reload fonctionnel** : Le code peut être rechargé sans redémarrer le conteneur

## Alternative : Utiliser Nodemon avec restart complet

Si la refactorisation est trop longue, vous pouvez aussi configurer nodemon pour faire un restart complet du processus :

```json
{
  "watch": ["src"],
  "ext": "js,json",
  "ignore": ["src/**/*.spec.js"],
  "exec": "node src/server.js",
  "restartable": "rs",
  "env": {
    "NODE_ENV": "development"
  },
  "delay": 1000
}
```

Cette approche tue complètement le processus et le redémarre, évitant tous les problèmes de redéclaration.

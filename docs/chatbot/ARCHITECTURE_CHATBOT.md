# Architecture Technique - Suite Chatbots RT Technologie

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture globale](#architecture-globale)
3. [Backend Service](#backend-service)
4. [Moteur IA](#moteur-ia)
5. [Base de connaissances](#base-de-connaissances)
6. [Système de priorisation](#système-de-priorisation)
7. [Diagnostics automatiques](#diagnostics-automatiques)
8. [Intégration Teams](#intégration-teams)
9. [Widget Frontend](#widget-frontend)
10. [Sécurité](#sécurité)
11. [Scalabilité](#scalabilité)
12. [Monitoring](#monitoring)

## Vue d'ensemble

La suite de chatbots RT Technologie est construite sur une architecture modulaire et scalable permettant :
- Support de 8 chatbots spécialisés + 1 support technique
- Traitement en temps réel via WebSocket
- Intégration IA hybride (GPT-4, Claude, modèle interne)
- Diagnostics automatiques cross-services
- Escalade intelligente vers techniciens humains

### Technologies utilisées

**Backend:**
- Node.js 20+
- WebSocket (ws)
- MongoDB (optionnel, fallback in-memory)
- OpenAI API
- Anthropic Claude API

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- WebSocket Client

## Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                     Applications Frontend                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Industry│ │Transport │ │Logistician│ │  Driver  │  + 5     │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │            │             │             │                 │
│       └────────────┴─────────────┴─────────────┘                │
│                          │                                       │
│                    Chatbot Widget                               │
│                     (WebSocket)                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Chatbot Service (Port 3019)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  HTTP Server + WebSocket Server                          │  │
│  │  - Session Management                                    │  │
│  │  - Message Routing                                       │  │
│  │  - Real-time Communication                               │  │
│  └────────────┬────────────────────┬──────────────┬─────────┘  │
│               │                    │              │             │
│  ┌────────────▼──────┐  ┌─────────▼────────┐  ┌─▼──────────┐  │
│  │   AI Engine       │  │  Prioritization  │  │ Diagnostics│  │
│  │  - GPT-4          │  │  Engine          │  │ Engine     │  │
│  │  - Claude         │  │  - Level 1-3     │  │ - API      │  │
│  │  - Internal Model │  │  - Auto-escalate │  │ - ERP/TMS  │  │
│  └───────────────────┘  └──────────────────┘  └────────────┘  │
│                                                                 │
│  ┌─────────────────────┐  ┌──────────────────┐                │
│  │  Knowledge Base     │  │  Teams           │                │
│  │  - FAQs             │  │  Integration     │                │
│  │  - Procedures       │  │  - Webhooks      │                │
│  │  - Tutorials        │  │  - Adaptive Cards│                │
│  └─────────────────────┘  └──────────────────┘                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              RT Technologie Services                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Orders  │ │ ERP Sync │ │ TMS Sync │ │Vigilance │  + 6     │
│  │  (3001)  │ │  (3004)  │ │  (3009)  │ │  (3012)  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Service

### Structure des dossiers

```
services/chatbot/
├── src/
│   ├── server.js                    # Point d'entrée
│   ├── ai-engine/
│   │   └── index.js                 # Moteur IA
│   ├── prioritization/
│   │   └── index.js                 # Système de priorisation
│   ├── diagnostics/
│   │   └── index.js                 # Diagnostics automatiques
│   ├── teams-integration/
│   │   └── index.js                 # Intégration Teams
│   ├── knowledge-base/
│   │   └── index.js                 # Base de connaissances
│   └── bots/
│       ├── helpbot.config.js        # Config RT HelpBot
│       ├── planif-ia.config.js      # Config Planif'IA
│       ├── routier.config.js        # Config Routier
│       └── ...                      # 5 autres configs
├── package.json
└── README.md
```

### Stores en mémoire

Le service utilise des Maps pour stocker les données en mémoire (avec fallback MongoDB):

```javascript
const store = {
  sessions: new Map(),      // sessionId -> Session
  tickets: new Map(),       // ticketId -> Ticket
  diagnostics: new Map(),   // sessionId -> DiagnosticsResults
  analytics: { ... }        // Métriques globales
};
```

**Optimisation future:** Migration vers Redis pour le partage entre instances.

### Gestion des sessions

**Cycle de vie d'une session:**

1. **Création**: `POST /chatbot/session`
   - Génération UUID unique
   - Association userId ↔ botType
   - Création contexte vide

2. **Activité**: WebSocket ou HTTP
   - Mise à jour lastActivity
   - Ajout messages à l'historique
   - Calcul métriques (temps réponse, etc.)

3. **Expiration**: TTL 30 minutes inactivité
   - Nettoyage automatique (à implémenter)
   - Archivage en MongoDB si configuré

## Moteur IA

### Architecture multi-providers

Le moteur IA utilise une stratégie de fallback :

```
1. Modèle interne RT (si configuré)
   ↓ (en cas d'échec)
2. OpenAI GPT-4
   ↓ (en cas d'échec)
3. Anthropic Claude
   ↓ (en cas d'échec)
4. Réponse rule-based (fallback)
```

### Processus de génération de réponse

```javascript
async generateResponse(userMessage, context, botConfig) {
  // 1. Construction du prompt système
  const systemPrompt = buildSystemPrompt(botConfig, context);

  // 2. Construction du prompt utilisateur avec contexte
  const userPrompt = buildUserPrompt(userMessage, {
    conversationHistory,
    knowledgeBase,
    diagnostics
  });

  // 3. Tentative providers
  let response = await tryInternalModel();
  if (!response) response = await tryOpenAI();
  if (!response) response = await tryAnthropic();
  if (!response) response = getFallbackResponse();

  // 4. Extraction actions suggérées
  const suggestedActions = extractSuggestedActions(response);

  return { content, confidence, suggestedActions, provider };
}
```

### Configuration des prompts

Chaque bot a un `systemPrompt` spécifique dans sa configuration :

```javascript
// Exemple: helpbot.config.js
systemPrompt: `Vous êtes RT HelpBot, l'assistant support 24/7...

VOTRE MISSION:
- Résoudre les problèmes techniques
- Diagnostiquer via API
- Escalader si nécessaire

RÈGLES D'ESCALADE:
- URGENT (Priorité 1): Transfert immédiat
- IMPORTANT (Priorité 2): Escalade après 2 tentatives
- STANDARD (Priorité 3): Escalade après 3 tentatives
...`
```

### Gestion du contexte

Le contexte envoyé à l'IA contient :

```javascript
{
  botType: 'helpbot',
  userName: 'Jean Dupont',
  role: 'industrial',
  conversationHistory: [...], // 10 derniers messages
  knowledgeBase: [...],        // Résultats recherche KB
  diagnostics: [...],          // Résultats diagnostics
  currentContext: {            // Données métier
    orderId: 'ORD-123',
    organizationId: 'IND-1'
  }
}
```

## Base de connaissances

### Collections

**FAQs:**
```javascript
{
  id: 'faq-001',
  question: 'Comment activer Affret.IA ?',
  answer: 'Pour activer Affret.IA: 1) ...',
  tags: ['affret-ia', 'activation'],
  botTypes: ['planif-ia', 'helpbot']
}
```

**Procedures:**
```javascript
{
  id: 'proc-001',
  title: 'Configurer l\'intégration ERP',
  summary: 'Guide complet...',
  steps: [
    { order: 1, title: '...', description: '...' },
    ...
  ],
  tags: ['erp', 'integration'],
  botTypes: ['planif-ia', 'helpbot']
}
```

**Tutorials:**
```javascript
{
  id: 'tut-001',
  title: 'Démo complète Planif\'IA',
  description: 'Vidéo de démonstration...',
  videoUrl: 'https://youtube.com/...',
  duration: '8:45',
  tags: ['planif-ia', 'demo'],
  botTypes: ['planif-ia', 'helpbot']
}
```

### Algorithme de recherche

```javascript
calculateRelevanceScore(query, item) {
  let score = 0;

  // 1. Correspondance exacte phrase
  if (searchableText.includes(query)) score += 1.0;

  // 2. Correspondance mots
  queryWords.forEach(word => {
    if (textWords.includes(word)) score += 0.3;
    else if (partialMatch(word)) score += 0.1;
  });

  // 3. Correspondance tags
  if (tag.includes(queryWord)) score += 0.5;

  return score;
}
```

Seuls les résultats avec `score > 0.3` sont retournés (top 5).

## Système de priorisation

### Algorithme de classification

```javascript
assessPriority(message, conversationHistory, diagnosticsResults) {
  // 1. Check mots-clés critiques
  if (hasCriticalKeyword(message)) return 1;

  // 2. Check exclamations multiples
  if (exclamationCount >= 3) return 1;

  // 3. Check diagnostics critiques
  if (hasCriticalDiagnosticFailure(diagnosticsResults)) return 1;

  // 4. Check durée conversation
  if (userMessagesLast15min >= 4) return 1;

  // 5. Check mots-clés importants
  if (hasImportantKeyword(message)) return 2;

  // 6. Check diagnostics warnings
  if (hasMultipleDiagnosticWarnings(diagnosticsResults)) return 2;

  // 7. Check impact business
  if (businessImpactScore >= 2) return 2;

  // Default: Standard
  return 3;
}
```

### Déclencheurs d'escalade

**Automatique:**
- Priorité 1 détectée → Transfert immédiat
- 3+ interactions sans résolution → Transfert
- Confiance IA < 50% → Suggestion transfert

**Manuel:**
- Utilisateur clique "Parler à un technicien"
- Utilisateur demande explicitement un humain

## Diagnostics automatiques

### Checks disponibles

| Check | Description | Severity | Services |
|-------|-------------|----------|----------|
| `api_health` | Santé tous services | critical/high/low | Tous |
| `erp_connection` | Connexion ERP | critical | erp-sync |
| `tms_connection` | Connexion TMS | high | tms-sync |
| `wms_connection` | Connexion WMS | high | wms-sync |
| `carrier_status` | Statut transporteur | critical/low | vigilance |
| `document_transmission` | Transmission POD/CMR | high | ecpmr |
| `order_status` | Statut commande | high/low | core-orders |
| `server_health` | Mémoire/CPU | critical/medium/low | Local |
| `file_format` | Validation format | high/low | Local |

### Sélection automatique des checks

Basée sur analyse de mots-clés dans le message :

```javascript
if (issue.includes('erp')) checksToRun.push('erp_connection');
if (issue.includes('transporteur')) checksToRun.push('carrier_status');
if (issue.includes('document')) checksToRun.push('document_transmission');
// ...
```

### Format résultat

```javascript
{
  check: 'erp_connection',
  status: 'error',           // ok | warning | error | skipped
  severity: 'critical',       // low | medium | high | critical
  message: 'Connexion ERP défaillante',
  details: { ... },
  timestamp: 1234567890
}
```

## Intégration Teams

### Adaptive Cards

Les tickets sont envoyés sous forme d'Adaptive Cards v1.4 :

**Structure:**
- **Header**: Priorité + Emoji + Titre ticket
- **FactSet**: Utilisateur, Rôle, Bot, Session, Raison, Date
- **Messages**: 5 derniers messages de la conversation
- **Diagnostics**: Résultats avec icônes de statut
- **Actions**: Voir dashboard, Prendre en charge, Résoudre

### Webhooks

**Création ticket:**
```
POST https://outlook.office.com/webhook/xxx
Content-Type: application/json

{
  "type": "message",
  "attachments": [{
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": { /* Adaptive Card */ }
  }]
}
```

### Bidirectionnel (Future)

Avec Bot Framework SDK :
- Technicien répond dans Teams
- Message envoyé au chatbot via webhook
- Utilisateur reçoit réponse en temps réel

## Widget Frontend

### Architecture React

```
packages/chatbot-widget/
├── ChatProvider           # Context + WebSocket
│   └── useChatContext    # Hook d'accès
├── ChatWidget            # Composant principal
├── components/
│   ├── MessageBubble     # Affichage messages
│   ├── QuickActions      # Actions suggérées
│   ├── StatusIndicator   # Statut connexion
│   ├── UrgencySelector   # Sélection priorité
│   └── FileUpload        # Upload fichiers
└── types.ts              # Types TypeScript
```

### Communication WebSocket

**Connexion:**
```javascript
const ws = new WebSocket(
  `ws://localhost:3019/chatbot/ws?sessionId=${sessionId}`
);
```

**Messages reçus:**
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'response') {
    // Nouvelle réponse bot
    setMessages(prev => [...prev, data.message]);
  } else if (data.type === 'escalated') {
    // Ticket créé
    showNotification(data.ticket);
  }
};
```

**Messages envoyés:**
```javascript
ws.send(JSON.stringify({
  type: 'message',
  message: 'Mon message',
  attachments: []
}));
```

### État local

```javascript
const [session, setSession] = useState(null);
const [messages, setMessages] = useState([]);
const [isConnected, setIsConnected] = useState(false);
const [isTyping, setIsTyping] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);
```

### Fallback HTTP

Si WebSocket déconnecté, utilise HTTP:

```javascript
if (wsRef.current?.readyState !== WebSocket.OPEN) {
  await fetch('/chatbot/message', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message })
  });
}
```

## Sécurité

### Authentification

**Optionnelle via `SECURITY_ENFORCE=true`:**

```javascript
const authResult = requireAuth(req, res, {
  optionalEnv: 'SECURITY_ENFORCE'
});

if (authResult === null) return; // 401/403
```

**Token JWT** dans header `Authorization: Bearer xxx`

### Cloisonnement données

- Chaque session liée à un `userId` unique
- Historique isolé par session
- Tickets associés à l'utilisateur créateur

### Protection CORS

```javascript
addSecurityHeaders(res);
// Ajoute:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 1; mode=block
// - Content-Security-Policy: ...

handleCorsPreflight(req, res);
// Gère OPTIONS avec CORS headers
```

### Rate Limiting

```javascript
const limiter = rateLimiter({
  windowMs: 60000,  // 1 minute
  max: 300          // 300 requêtes max
});
```

### Validation entrées

```javascript
const parseBody = limitBodySize(10 * 1024 * 1024); // 10MB max
```

### Chiffrement

- **TLS obligatoire** en production (HTTPS/WSS)
- Stockage MongoDB avec encryption at rest
- Clés API en variables d'environnement

## Scalabilité

### Stratégie de scaling

**Phase 1 - Single Instance (actuel):**
- 1 instance Node.js
- In-memory stores
- Supporte ~1000 sessions concurrentes

**Phase 2 - Horizontal Scaling:**
- Multiple instances derrière load balancer
- Redis pour sessions partagées
- Sticky sessions WebSocket (IP hash)

**Phase 3 - Microservices:**
- Séparation services (AI, Diagnostics, KB)
- Message queue (RabbitMQ/Kafka)
- Service mesh (Istio)

### Optimisations

**Caching:**
- Diagnostics Vigilance: TTL 5 minutes
- Organisations: TTL 5 minutes
- Base de connaissances: indexation full-text

**Connexions persistantes:**
- WebSocket pour chat temps réel
- HTTP Keep-Alive vers services internes

**Lazy Loading:**
- Historique chargé à la demande
- Base de connaissances chargée au boot

## Monitoring

### Métriques collectées

```javascript
analytics: {
  totalMessages: 0,
  totalSessions: 0,
  totalTickets: 0,
  resolutionRate: 0,        // % tickets résolus par bot
  averageResponseTime: 0,    // ms
  satisfactionScore: 0       // 1-5
}
```

### Logs structurés

```
[chatbot] HTTP server ready on :3019
[chatbot] WebSocket connected: sess-abc123
[AIEngine] Response generated via openai
[Prioritization] URGENT detected: keyword "bloqué"
[Diagnostics] Running diagnostics for issue: Problème ERP
[TeamsIntegration] Ticket TICKET-123 sent to Teams
```

### Alertes

**À implémenter:**
- Seuil erreurs IA > 10%
- Temps réponse > 5s
- Tickets priorité 1 non assignés > 15 min
- WebSocket disconnects > 20%

### Dashboard Admin

**À développer dans apps/backoffice-admin:**
- Graphiques temps réel
- Liste conversations actives
- Tickets ouverts
- Métriques par bot
- Logs et erreurs

---

**Version:** 1.0.0
**Dernière mise à jour:** 2024-11-18
**Auteurs:** RT Technologie Engineering Team

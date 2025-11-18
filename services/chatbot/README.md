# RT Technologie - Suite de Chatbots IA

Suite complète de 8 chatbots intelligents + 1 support technique pour assistance 24/7 sur toute la plateforme RT Technologie.

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Les 8 Chatbots](#les-8-chatbots)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Reference](#api-reference)
- [Base de connaissances](#base-de-connaissances)
- [Système de priorisation](#système-de-priorisation)
- [Diagnostics automatiques](#diagnostics-automatiques)
- [Intégration Teams](#intégration-teams)
- [Monitoring & Analytics](#monitoring--analytics)

## Vue d'ensemble

Le système de chatbots RT Technologie offre une assistance intelligente 24/7 pour tous les utilisateurs de la plateforme, avec des spécialisations par rôle et un support technique avancé.

### Caractéristiques principales

- **8 chatbots spécialisés** par type d'utilisateur
- **Support technique 24/7** (RT HelpBot) avec résolution autonome 80%
- **Moteur IA hybride** : GPT-4, Claude, modèle interne RT
- **Diagnostics automatiques** via API
- **Système de priorisation intelligent** (Standard, Important, Urgent)
- **Escalade automatique** vers techniciens
- **Intégration Microsoft Teams** pour tickets
- **Base de connaissances** enrichie (FAQs, procédures, tutoriels)
- **WebSocket temps réel** pour chat instantané

## Architecture

```
services/chatbot/
├── src/
│   ├── server.js                 # Serveur HTTP + WebSocket (port 3019)
│   ├── ai-engine/                # Moteur IA (GPT-4, Claude, interne)
│   │   └── index.js
│   ├── prioritization/           # Système de priorisation
│   │   └── index.js
│   ├── diagnostics/              # Diagnostics automatiques
│   │   └── index.js
│   ├── teams-integration/        # Intégration Microsoft Teams
│   │   └── index.js
│   ├── knowledge-base/           # Base de connaissances
│   │   └── index.js
│   └── bots/                     # Configurations des 8 chatbots
│       ├── helpbot.config.js
│       ├── planif-ia.config.js
│       ├── routier.config.js
│       ├── quai-wms.config.js
│       ├── livraisons.config.js
│       ├── expedition.config.js
│       ├── freight-ia.config.js
│       └── copilote-chauffeur.config.js
└── package.json

packages/chatbot-widget/          # Widget React réutilisable
├── src/
│   ├── ChatWidget.tsx            # Composant principal
│   ├── ChatContext.tsx           # Context React + WebSocket
│   ├── components/               # Composants UI
│   │   ├── MessageBubble.tsx
│   │   ├── QuickActions.tsx
│   │   ├── StatusIndicator.tsx
│   │   ├── UrgencySelector.tsx
│   │   └── FileUpload.tsx
│   ├── types.ts                  # TypeScript types
│   └── index.tsx
└── package.json
```

## Les 8 Chatbots

### 1. Assistant Planif'IA (Industriels)
**Bot Type:** `planif-ia`

**Fonctionnalités:**
- Intégration ERP (SAP, Oracle, Dynamics)
- Paramétrage transporteurs
- Gestion bourse de fret
- Activation et configuration Affret.IA
- Import grilles tarifaires
- Planification optimale

**Intégrations:** core-orders, erp-sync, bourse, affret-ia, pricing-grids

### 2. Assistant Routier (Transporteurs)
**Bot Type:** `routier`

**Fonctionnalités:**
- Import grilles tarifaires FTL/LTL
- Prise de RDV
- Gestion tracking IA
- Dépôt POD/CMR
- Signature électronique
- Module premium

**Intégrations:** core-orders, pricing-grids, planning, tracking-ia, ecpmr

### 3. Assistant Quai & WMS (Logisticiens)
**Bot Type:** `quai-wms`

**Fonctionnalités:**
- Gestion planning quai
- Configuration créneaux
- Portail chauffeur
- Intégration WMS
- Signature électronique POD

**Intégrations:** wms-sync, planning, ecpmr

### 4. Assistant Livraisons (Destinataires)
**Bot Type:** `livraisons`

**Fonctionnalités:**
- Gestion RDV livraison
- Consultation documents POD/CMR
- Suivi temps réel
- Validation transports
- Notifications automatiques

**Intégrations:** core-orders, tracking-ia, ecpmr, notifications

### 5. Assistant Expédition (Fournisseurs)
**Bot Type:** `expedition`

**Fonctionnalités:**
- Gestion expéditions
- Suivi prises en charge
- Communication transporteurs
- Préparation documents

**Intégrations:** core-orders, tracking-ia, notifications

### 6. Assistant Freight IA (Transitaires)
**Bot Type:** `freight-ia`

**Fonctionnalités:**
- Offres import/export
- Cotations internationales
- Gestion pré/post acheminement
- Intégration transporteurs routiers
- Tracking multimodal

**Intégrations:** core-orders, tracking-ia, bourse

### 7. Copilote Chauffeur (Conducteurs)
**Bot Type:** `copilote-chauffeur`

**Fonctionnalités:**
- Activation missions
- Gestion statuts/tracking temps réel
- Dépôt POD/CMR avec photos
- Signature électronique terrain
- Mode offline
- Navigation GPS

**Intégrations:** core-orders, tracking-ia, ecpmr

### 8. RT HelpBot (Support technique)
**Bot Type:** `helpbot`

**Fonctionnalités spéciales:**
- Résolution autonome 80% problèmes
- Disponibilité 24/7
- Diagnostics automatiques API/ERP/TMS/WMS
- Priorisation intelligente (3 niveaux)
- Transfert automatique vers technicien
- Intégration complète avec tous les modules

**Intégrations:** Tous les services (9 services)

## Installation

### Backend Service

```bash
cd services/chatbot
pnpm install
```

### Widget Frontend

```bash
cd packages/chatbot-widget
pnpm install
```

## Configuration

### Variables d'environnement (services/chatbot)

Créez un fichier `.env` :

```env
# Server
PORT=3019
NODE_ENV=development

# MongoDB (optionnel, fallback in-memory)
MONGODB_URI=mongodb://localhost:27017/rt-technologie

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Modèle interne RT (optionnel)
INTERNAL_AI_MODEL_URL=http://localhost:8080/ai/generate

# Microsoft Teams
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
TEAMS_BOT_TOKEN=...

# URLs des services
CORE_ORDERS_URL=http://localhost:3001
ERP_SYNC_URL=http://localhost:3004
TMS_SYNC_URL=http://localhost:3009
WMS_SYNC_URL=http://localhost:3005
TRACKING_IA_URL=http://localhost:3002
AFFRET_IA_URL=http://localhost:3011
VIGILANCE_URL=http://localhost:3012
NOTIFICATIONS_URL=http://localhost:3008
ECPMR_URL=http://localhost:3015

# Dashboard
DASHBOARD_URL=https://admin.rt-technologie.com

# Security
SECURITY_ENFORCE=false
INTERNAL_SERVICE_TOKEN=secret-token
```

## Utilisation

### Démarrer le service backend

```bash
cd services/chatbot
pnpm dev
```

Le service démarre sur `http://localhost:3019`

### Intégrer le widget dans une app

```tsx
import { ChatWidget, ChatProvider } from '@rt/chatbot-widget';

function MyApp() {
  return (
    <ChatProvider
      botType="planif-ia"
      userId={user.id}
      userName={user.name}
      role="industrial"
      apiUrl="http://localhost:3019"
    >
      <ChatWidget
        botType="planif-ia"
        userId={user.id}
        userName={user.name}
        role="industrial"
        onEscalation={(ticket) => {
          console.log('Ticket créé:', ticket);
        }}
      />
    </ChatProvider>
  );
}
```

## API Reference

### POST /chatbot/session
Créer ou récupérer une session de chat

**Request:**
```json
{
  "userId": "user-123",
  "userName": "Jean Dupont",
  "role": "industrial",
  "botType": "planif-ia"
}
```

**Response:**
```json
{
  "sessionId": "sess-abc123",
  "botType": "planif-ia",
  "userName": "Jean Dupont",
  "createdAt": 1234567890
}
```

### POST /chatbot/message
Envoyer un message

**Request:**
```json
{
  "sessionId": "sess-abc123",
  "message": "Comment activer Affret.IA ?",
  "attachments": []
}
```

**Response:**
```json
{
  "message": {
    "id": "msg-456",
    "role": "assistant",
    "content": "Pour activer Affret.IA: 1) Accédez à...",
    "confidence": 0.95,
    "suggestedActions": [],
    "timestamp": 1234567890
  },
  "escalationNeeded": false
}
```

### GET /chatbot/history/:sessionId
Récupérer l'historique de conversation

**Response:**
```json
{
  "sessionId": "sess-abc123",
  "messages": [...],
  "context": {},
  "createdAt": 1234567890,
  "lastActivity": 1234567890
}
```

### POST /chatbot/transfer-to-human
Transférer vers un technicien humain

**Request:**
```json
{
  "sessionId": "sess-abc123",
  "reason": "User requested"
}
```

**Response:**
```json
{
  "ticket": {
    "id": "TICKET-1234567890-ABC123",
    "priority": 2,
    "status": "open",
    "createdAt": 1234567890
  }
}
```

### POST /chatbot/diagnostics/run
Lancer des diagnostics manuels

**Request:**
```json
{
  "context": {
    "orderId": "ORD-123",
    "carrierId": "CARR-456"
  },
  "issue": "Problème connexion ERP"
}
```

**Response:**
```json
{
  "results": [
    {
      "check": "erp_connection",
      "status": "error",
      "severity": "critical",
      "message": "Connexion ERP défaillante",
      "timestamp": 1234567890
    }
  ]
}
```

### WebSocket /chatbot/ws?sessionId=xxx
Connexion WebSocket temps réel

**Messages reçus:**
```json
{
  "type": "response",
  "message": { /* ChatMessage */ }
}
```

```json
{
  "type": "escalated",
  "ticket": { /* Ticket */ }
}
```

**Messages envoyés:**
```json
{
  "type": "message",
  "message": "Mon message",
  "attachments": []
}
```

## Base de connaissances

La base de connaissances contient :

- **FAQs** : 50+ questions/réponses par module
- **Procédures** : Guides pas à pas
- **Tutoriels** : Liens vidéos

### Ajouter un FAQ

```javascript
await knowledgeBase.addFAQ({
  question: "Comment faire X ?",
  answer: "Pour faire X: 1) ..., 2) ...",
  tags: ['tag1', 'tag2'],
  botTypes: ['planif-ia', 'helpbot']
});
```

## Système de priorisation

### 3 niveaux de priorité

**Priorité 1 - URGENT/CRITIQUE:**
- Blocage total
- Perte de données
- Production down
- API down
- **Transfert immédiat vers technicien**
- Temps de réponse: < 15 minutes

**Priorité 2 - IMPORTANT:**
- Erreur impactante
- Fonction non disponible
- Problème Affret.IA, signature électronique, RDV
- **Escalade après 2 interactions sans résolution**
- Temps de réponse: < 1 heure

**Priorité 3 - STANDARD:**
- Questions d'utilisation
- Demandes d'information
- **Escalade après 3 interactions sans résolution**
- Temps de réponse: < 4 heures

### Détection automatique

Le système analyse :
- Mots-clés critiques
- Résultats de diagnostics
- Durée de conversation
- Nombre d'interactions
- Indicateurs de frustration

## Diagnostics automatiques

### Checks disponibles

- `api_health` : Santé de tous les services
- `erp_connection` : Connexion ERP
- `tms_connection` : Connexion TMS
- `wms_connection` : Connexion WMS
- `carrier_status` : Statut transporteur (Vigilance)
- `document_transmission` : Transmission POD/CMR
- `order_status` : Statut commande
- `server_health` : Santé serveurs (mémoire, CPU)
- `file_format` : Validation format fichiers

### Exemple d'utilisation

```javascript
const results = await diagnosticsEngine.runDiagnostics(
  { orderId: 'ORD-123', carrierId: 'CARR-456' },
  'Problème connexion ERP'
);

// results = [
//   {
//     check: 'erp_connection',
//     status: 'error',
//     severity: 'critical',
//     message: 'Connexion ERP défaillante',
//     timestamp: ...
//   }
// ]
```

## Intégration Teams

### Création de tickets

Les tickets sont envoyés automatiquement à Microsoft Teams avec :
- Carte adaptative
- Informations utilisateur
- Priorité et statut
- Derniers messages
- Résultats de diagnostics
- Actions rapides (Prendre en charge, Résoudre)

### Configuration

```env
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/xxx
TEAMS_BOT_TOKEN=xxx
```

## Monitoring & Analytics

### Métriques disponibles

```bash
GET /chatbot/analytics
```

**Response:**
```json
{
  "analytics": {
    "totalMessages": 1500,
    "totalSessions": 300,
    "totalTickets": 45,
    "resolutionRate": 0.82,
    "averageResponseTime": 850,
    "satisfactionScore": 4.5
  },
  "sessions": {
    "total": 300,
    "active": 12
  },
  "tickets": {
    "total": 45,
    "open": 8,
    "resolved": 37
  }
}
```

## Roadmap

### Phase 1 - Fondations (2 semaines) ✅
- Bot support v1
- Base de connaissances basique
- Widget embarqué opérationnel

### Phase 2 - Intelligence (3 semaines) 🚧
- Connexion diagnostics API
- Transfert automatique technicien
- Gestion priorités
- Ticketing intégré

### Phase 3 - Déploiement complet (2 semaines) 📅
- Chatbots multiservices tous espaces
- Personnalisation messages
- FAQ intelligente enrichie
- Formation IA finalisée

## Support

Pour toute question ou problème :
- Email: support@rt-technologie.com
- Documentation complète: https://docs.rt-technologie.com/chatbot
- Teams: Canal #chatbot-support

---

**Développé par RT Technologie** © 2024

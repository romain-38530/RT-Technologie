# Documentation Suite Chatbots RT Technologie

Bienvenue dans la documentation complète de la suite de chatbots RT Technologie.

## Documents disponibles

### 📚 [QUICK_START.md](./QUICK_START.md)
**Guide de démarrage rapide (10 minutes)**
- Installation pas-à-pas
- Configuration minimale
- Premier test
- Intégration dans une app
- Troubleshooting

👉 **Commencez par ici si vous découvrez le projet**

---

### 📖 [README principal](../../services/chatbot/README.md)
**Documentation utilisateur complète**
- Vue d'ensemble du système
- Les 8 chatbots en détail
- API Reference complète
- Base de connaissances
- Système de priorisation
- Diagnostics automatiques
- Intégration Teams
- Monitoring & Analytics

👉 **Documentation de référence pour utiliser le système**

---

### 🏗️ [ARCHITECTURE_CHATBOT.md](./ARCHITECTURE_CHATBOT.md)
**Architecture technique détaillée**
- Architecture globale avec diagrammes
- Backend Service en profondeur
- Moteur IA (algorithmes, prompts)
- Base de connaissances (recherche)
- Système de priorisation (détails)
- Diagnostics (tous les checks)
- Widget Frontend (React)
- Sécurité
- Scalabilité
- Monitoring

👉 **Pour les développeurs qui veulent comprendre l'architecture**

---

### 📊 [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md)
**Rapport d'implémentation complet**
- Résumé exécutif
- Liste complète des fichiers créés
- Statistiques du code (~7450 lignes)
- Fonctionnalités implémentées
- Endpoints API
- Roadmap (Phases 2 et 3)
- Notes techniques

👉 **Pour une vue d'ensemble du projet et son état d'avancement**

---

### 🔌 [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
**Guide d'intégration dans les applications frontend**
- Vue d'ensemble de l'architecture
- Intégration détaillée des 8 applications
- Configuration des variables d'environnement
- Patterns d'intégration (App Router vs Pages Router)
- Fonctionnalités contextuelles futures
- Troubleshooting

👉 **Pour intégrer le widget chatbot dans vos applications**

---

### 📋 [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)
**Résumé de l'intégration effectuée**
- Liste des 8 applications intégrées
- Fichiers créés et modifiés
- Patterns d'intégration utilisés
- Prochaines étapes
- Checklist de vérification

👉 **Pour un aperçu rapide des modifications effectuées**

---

## Navigation rapide

### Je veux...

**...démarrer rapidement le chatbot**
→ [QUICK_START.md](./QUICK_START.md)

**...intégrer le chatbot dans mon app**
→ [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

**...comprendre comment fonctionne le moteur IA**
→ [ARCHITECTURE_CHATBOT.md#moteur-ia](./ARCHITECTURE_CHATBOT.md#moteur-ia)

**...ajouter des FAQs à la base de connaissances**
→ [README principal](../../services/chatbot/README.md#base-de-connaissances)

**...configurer l'intégration Teams**
→ [README principal](../../services/chatbot/README.md#intégration-teams)

**...voir la liste complète des endpoints API**
→ [README principal](../../services/chatbot/README.md#api-reference)

**...savoir ce qui a été développé**
→ [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md) + [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)

**...contribuer au projet**
→ [ARCHITECTURE_CHATBOT.md](./ARCHITECTURE_CHATBOT.md) pour comprendre l'architecture

---

## Structure du projet

```
RT-Technologie/
├── services/chatbot/              # Service backend
│   ├── src/
│   │   ├── server.js              # Serveur HTTP + WebSocket
│   │   ├── ai-engine/             # Moteur IA
│   │   ├── prioritization/        # Système de priorisation
│   │   ├── diagnostics/           # Diagnostics automatiques
│   │   ├── teams-integration/     # Intégration Teams
│   │   ├── knowledge-base/        # Base de connaissances
│   │   └── bots/                  # 8 configs chatbots
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── packages/chatbot-widget/       # Widget React
│   ├── src/
│   │   ├── ChatWidget.tsx         # Composant principal
│   │   ├── ChatContext.tsx        # Context + WebSocket
│   │   ├── components/            # Composants UI
│   │   └── types.ts
│   └── package.json
│
├── apps/                          # Applications frontend
│   ├── web-industry/              # Exemple intégration
│   ├── web-transporter/
│   └── ...
│
└── docs/chatbot/                  # Documentation (vous êtes ici)
    ├── README.md                  # Ce fichier
    ├── QUICK_START.md             # Guide démarrage rapide
    ├── ARCHITECTURE_CHATBOT.md    # Architecture technique
    └── IMPLEMENTATION_REPORT.md   # Rapport implémentation
```

---

## Les 8 Chatbots

| Bot | Type | Utilisateurs | Rôle |
|-----|------|--------------|------|
| **RT HelpBot** | `helpbot` | Tous | Support technique 24/7 |
| **Assistant Planif'IA** | `planif-ia` | Industriels | Planification, ERP, Affret.IA |
| **Assistant Routier** | `routier` | Transporteurs | Grilles, RDV, Tracking, POD |
| **Assistant Quai & WMS** | `quai-wms` | Logisticiens | Planning quai, WMS |
| **Assistant Livraisons** | `livraisons` | Destinataires | RDV, suivi, documents |
| **Assistant Expédition** | `expedition` | Fournisseurs | Expéditions, communication |
| **Assistant Freight IA** | `freight-ia` | Transitaires | Import/export, cotations |
| **Copilote Chauffeur** | `copilote-chauffeur` | Conducteurs | Missions, POD, signature |

---

## Technologies

**Backend:**
- Node.js 20+
- WebSocket (ws)
- OpenAI GPT-4
- Anthropic Claude
- MongoDB (optionnel)

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- WebSocket Client

**Infrastructure:**
- Microsoft Teams (webhooks)
- RT Cloud
- Vercel (deployment apps)
- AWS (services backend)

---

## Support

- **Email:** support@rt-technologie.com
- **Documentation en ligne:** https://docs.rt-technologie.com/chatbot
- **Teams:** Canal #chatbot-support
- **Issues:** Système de tickets interne

---

## Changelog

### Version 1.0.0 (18 novembre 2024)
- ✅ Développement complet suite de chatbots
- ✅ 8 chatbots spécialisés + RT HelpBot
- ✅ Backend service avec API REST et WebSocket
- ✅ Moteur IA hybride (GPT-4, Claude, interne)
- ✅ Base de connaissances enrichie
- ✅ Système de priorisation intelligent
- ✅ Diagnostics automatiques
- ✅ Intégration Microsoft Teams
- ✅ Widget React réutilisable
- ✅ Documentation complète

---

**Développé par RT Technologie Engineering Team**
© 2024 RT Technologie. Tous droits réservés.

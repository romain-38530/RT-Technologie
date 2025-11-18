# Quick Start - Suite Chatbots RT Technologie

Guide de démarrage rapide pour mettre en place la suite de chatbots RT Technologie en 10 minutes.

## Prérequis

- Node.js 20+
- pnpm 8.15+
- MongoDB (optionnel)
- Clés API OpenAI ou Anthropic (optionnel)

## Installation

### 1. Installer les dépendances

```bash
# À la racine du monorepo
pnpm install
```

### 2. Configurer le service chatbot

```bash
cd services/chatbot

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env et configurer au minimum:
# - PORT=3019
# - OPENAI_API_KEY ou ANTHROPIC_API_KEY (optionnel)
```

**Configuration minimale (.env):**
```env
PORT=3019
NODE_ENV=development

# Au moins un provider IA (optionnel, fallback rule-based)
OPENAI_API_KEY=sk-...
# OU
ANTHROPIC_API_KEY=sk-ant-...

# URLs des services RT (par défaut localhost)
CORE_ORDERS_URL=http://localhost:3001
VIGILANCE_URL=http://localhost:3012
```

### 3. Démarrer le service

```bash
# Option 1: Démarrer uniquement le chatbot
cd services/chatbot
pnpm dev

# Option 2: Démarrer tous les services
cd ../../
pnpm agents
```

Le service démarre sur `http://localhost:3019`

### 4. Vérifier le fonctionnement

```bash
curl http://localhost:3019/health
```

**Réponse attendue:**
```json
{
  "status": "ok",
  "service": "chatbot",
  "mongo": false,
  "sessions": 0,
  "tickets": 0
}
```

## Intégration dans une application

### 1. Installer le package widget

Le package `@rt/chatbot-widget` est déjà dans le workspace.

### 2. Importer dans votre app

**Exemple pour Next.js (apps/web-industry):**

```tsx
// app/layout.tsx ou pages/_app.tsx
import { ChatWidget, ChatProvider } from '@rt/chatbot-widget';

export default function RootLayout({ children }) {
  // Récupérer les infos utilisateur (session, auth, etc.)
  const user = useUser(); // Votre hook d'auth

  return (
    <html>
      <body>
        {children}

        {/* Intégrer le chatbot */}
        {user && (
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
            />
          </ChatProvider>
        )}
      </body>
    </html>
  );
}
```

### 3. Mapping botTypes par application

| Application | botType | Assistant |
|------------|---------|-----------|
| `web-industry` | `planif-ia` | Assistant Planif'IA |
| `web-transporter` | `routier` | Assistant Routier |
| `web-logistician` | `quai-wms` | Assistant Quai & WMS |
| `web-recipient` | `livraisons` | Assistant Livraisons |
| `web-supplier` | `expedition` | Assistant Expédition |
| `web-forwarder` | `freight-ia` | Assistant Freight IA |
| `mobile-driver` | `copilote-chauffeur` | Copilote Chauffeur |
| `backoffice-admin` | `helpbot` | RT HelpBot |

## Test rapide

### Via HTTP

**1. Créer une session:**
```bash
curl -X POST http://localhost:3019/chatbot/session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "userName": "Jean Dupont",
    "role": "industrial",
    "botType": "planif-ia"
  }'
```

**Réponse:**
```json
{
  "sessionId": "abc-123-def",
  "botType": "planif-ia",
  "userName": "Jean Dupont",
  "createdAt": 1234567890
}
```

**2. Envoyer un message:**
```bash
curl -X POST http://localhost:3019/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc-123-def",
    "message": "Comment activer Affret.IA ?"
  }'
```

**Réponse:**
```json
{
  "message": {
    "id": "msg-456",
    "role": "assistant",
    "content": "Pour activer Affret.IA:\n\n1) Accédez à Paramètres > Modules\n2) Activez l'option \"Affret.IA\"\n3) Configurez vos préférences...",
    "confidence": 0.92,
    "suggestedActions": [],
    "timestamp": 1234567890
  },
  "escalationNeeded": false
}
```

### Via WebSocket (wscat)

```bash
# Installer wscat
npm install -g wscat

# Se connecter
wscat -c "ws://localhost:3019/chatbot/ws?sessionId=abc-123-def"

# Envoyer un message
> {"type":"message","message":"Bonjour"}

# Recevoir la réponse
< {"type":"response","message":{"id":"...","role":"assistant","content":"..."}}
```

## Configuration avancée

### MongoDB

Pour persister les données :

```env
MONGODB_URI=mongodb://localhost:27017/rt-technologie
```

Collections créées automatiquement :
- `chatbot_faqs`
- `chatbot_procedures`
- `chatbot_tutorials`
- (+ sessions, tickets si implémenté)

### Microsoft Teams

Pour recevoir les tickets dans Teams :

1. Créer un webhook entrant dans Teams
2. Configurer l'URL :

```env
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/xxx
```

### Diagnostics

Pour activer les diagnostics automatiques, configurer les URLs des services :

```env
CORE_ORDERS_URL=http://localhost:3001
ERP_SYNC_URL=http://localhost:3004
TMS_SYNC_URL=http://localhost:3009
WMS_SYNC_URL=http://localhost:3005
VIGILANCE_URL=http://localhost:3012
ECPMR_URL=http://localhost:3015
```

## Troubleshooting

### Le service ne démarre pas

**Erreur:** `Error: OPENAI_API_KEY not found`

**Solution:** Le moteur IA fonctionne en fallback rule-based si aucune clé n'est fournie. Vérifiez que le service démarre malgré l'avertissement.

### WebSocket ne se connecte pas

**Erreur:** `WebSocket connection failed`

**Solutions:**
1. Vérifier que le service est démarré
2. Vérifier le port (défaut: 3019)
3. Vérifier CORS si cross-origin
4. Fallback automatique sur HTTP

### Messages sans réponse IA

**Cause:** Aucun provider IA configuré

**Solution:** Le système utilise le fallback rule-based. Pour des réponses IA :
1. Configurer `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`
2. Ou configurer `INTERNAL_AI_MODEL_URL`

### Diagnostics ne fonctionnent pas

**Cause:** Services cibles non démarrés ou URLs incorrectes

**Solution:**
1. Démarrer les services nécessaires : `pnpm agents`
2. Vérifier les URLs dans `.env`
3. Les diagnostics échouent gracieusement si services indisponibles

## Next Steps

1. **Enrichir la base de connaissances** : Ajouter vos propres FAQs via l'API
2. **Configurer MongoDB** : Persister les données
3. **Intégrer Teams** : Recevoir les tickets dans Teams
4. **Personnaliser les bots** : Modifier les configs dans `src/bots/`
5. **Développer le dashboard admin** : Vue d'ensemble des tickets et analytics

## Documentation complète

- **README.md** : Documentation principale
- **ARCHITECTURE_CHATBOT.md** : Architecture technique
- **API_REFERENCE.md** : Documentation API détaillée (à créer)

## Support

- Email: support@rt-technologie.com
- Documentation: https://docs.rt-technologie.com/chatbot
- Issues: Utiliser le système de tickets interne

---

Prêt à l'emploi en 10 minutes ! 🚀

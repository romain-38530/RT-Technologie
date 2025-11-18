# Guide d'Integration du Chatbot Widget RT-Technologie

Ce guide explique comment le widget chatbot a ete integre dans les 9 applications frontend de RT-Technologie.

## Vue d'ensemble

Le widget chatbot est un composant React reutilisable (`@rt/chatbot-widget`) qui se connecte au service chatbot (port 3019) via WebSocket pour fournir une assistance contextuelle aux utilisateurs.

### Architecture

- **Package**: `packages/chatbot-widget/`
- **Service Backend**: `services/chatbot/` (port 3019)
- **Transport**: WebSocket (`ws://localhost:3019/chatbot/ws`)
- **API REST**: `http://localhost:3019`

---

## Applications Integrees

### 1. web-industry (Industriels)
- **Port**: 3010
- **Bot Type**: `planif-ia`
- **Role**: `industriel`
- **Router**: Next.js App Router
- **Integration**: Via `src/app/providers.tsx`

**Fichiers modifies**:
```
apps/web-industry/package.json
apps/web-industry/src/app/providers.tsx
apps/web-industry/.env.example
```

**Code d'integration**:
```tsx
// apps/web-industry/src/app/providers.tsx
import { ChatProvider, ChatWidget } from '@rt/chatbot-widget'

export function Providers({ children }: { children: React.ReactNode }) {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null

  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider
        botType="planif-ia"
        userId={userId || undefined}
        userName={userName || undefined}
        role="industriel"
      >
        {children}
        <ChatWidget
          botType="planif-ia"
          userId={userId || undefined}
          userName={userName || undefined}
          role="industriel"
        />
      </ChatProvider>
    </QueryClientProvider>
  )
}
```

---

### 2. web-transporter (Transporteurs)
- **Port**: 3100
- **Bot Type**: `routier`
- **Role**: `transporteur`
- **Router**: Next.js App Router
- **Integration**: Via `src/app/providers.tsx` (nouveau fichier)

**Fichiers modifies**:
```
apps/web-transporter/package.json
apps/web-transporter/src/app/layout.tsx
apps/web-transporter/src/app/providers.tsx (cree)
apps/web-transporter/.env.example
```

**Code d'integration**:
```tsx
// apps/web-transporter/src/app/providers.tsx
'use client'

import { ChatProvider, ChatWidget } from '@rt/chatbot-widget'

export function Providers({ children }: { children: React.ReactNode }) {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null

  return (
    <ChatProvider
      botType="routier"
      userId={userId || undefined}
      userName={userName || undefined}
      role="transporteur"
    >
      {children}
      <ChatWidget
        botType="routier"
        userId={userId || undefined}
        userName={userName || undefined}
        role="transporteur"
      />
    </ChatProvider>
  )
}
```

---

### 3. web-logistician (Logisticiens)
- **Port**: 3106
- **Bot Type**: `quai-wms`
- **Role**: `logisticien`
- **Router**: Next.js Pages Router
- **Integration**: Via `pages/_app.tsx`

**Fichiers modifies**:
```
apps/web-logistician/package.json
apps/web-logistician/pages/_app.tsx
apps/web-logistician/.env.example
```

**Code d'integration**:
```tsx
// apps/web-logistician/pages/_app.tsx
import { ChatProvider, ChatWidget } from '@rt/chatbot-widget';

export default function App({ Component, pageProps }: AppProps) {
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;
  const userName = typeof window !== 'undefined' ? window.localStorage.getItem('user_name') : null;

  return (
    <ChatProvider
      botType="quai-wms"
      userId={userId || undefined}
      userName={userName || undefined}
      role="logisticien"
    >
      <Head>...</Head>
      <div>
        {/* Header & Navigation */}
        <main>
          <Component {...pageProps} />
        </main>
      </div>
      <ChatWidget
        botType="quai-wms"
        userId={userId || undefined}
        userName={userName || undefined}
        role="logisticien"
      />
    </ChatProvider>
  );
}
```

---

### 4. web-recipient (Destinataires)
- **Port**: 3102
- **Bot Type**: `livraisons`
- **Role**: `destinataire`
- **Router**: Next.js App Router
- **Integration**: Via `src/app/providers.tsx`

**Fichiers modifies**:
```
apps/web-recipient/package.json
apps/web-recipient/src/app/providers.tsx
apps/web-recipient/.env.example
```

**Code d'integration**: Similaire a web-industry avec `botType="livraisons"` et `role="destinataire"`

---

### 5. web-supplier (Fournisseurs)
- **Port**: 3103
- **Bot Type**: `expedition`
- **Role**: `fournisseur`
- **Router**: Next.js App Router
- **Integration**: Via `src/app/providers.tsx`

**Fichiers modifies**:
```
apps/web-supplier/package.json
apps/web-supplier/src/app/providers.tsx
apps/web-supplier/.env.example
```

**Particularite**: Deja integre avec `<Toaster />` de Radix UI

```tsx
return (
  <QueryClientProvider client={queryClient}>
    <ChatProvider
      botType="expedition"
      userId={userId || undefined}
      userName={userName || undefined}
      role="fournisseur"
    >
      {children}
      <Toaster />
      <ChatWidget
        botType="expedition"
        userId={userId || undefined}
        userName={userName || undefined}
        role="fournisseur"
      />
    </ChatProvider>
  </QueryClientProvider>
)
```

---

### 6. web-forwarder (Transitaires)
- **Port**: 4002
- **Bot Type**: `freight-ia`
- **Role**: `transitaire`
- **Router**: Next.js Pages Router
- **Integration**: Via `pages/_app.tsx`

**Fichiers modifies**:
```
apps/web-forwarder/package.json
apps/web-forwarder/pages/_app.tsx
apps/web-forwarder/.env.example
```

**Code d'integration**: Similaire a web-logistician avec `botType="freight-ia"`

---

### 7. backoffice-admin (Administrateurs)
- **Port**: 3000 (default)
- **Bot Type**: `helpbot`
- **Role**: `admin`
- **Router**: Next.js Pages Router
- **Integration**: Via `pages/_app.tsx`

**Fichiers modifies**:
```
apps/backoffice-admin/package.json
apps/backoffice-admin/pages/_app.tsx
apps/backoffice-admin/.env.example
```

**Code d'integration**:
```tsx
// apps/backoffice-admin/pages/_app.tsx
import { ChatProvider, ChatWidget } from '@rt/chatbot-widget';

export default function App({ Component, pageProps }: AppProps) {
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;
  const userName = typeof window !== 'undefined' ? window.localStorage.getItem('user_name') : null;

  return (
    <ChatProvider
      botType="helpbot"
      userId={userId || undefined}
      userName={userName || undefined}
      role="admin"
    >
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
        <header>...</header>
        <Component {...pageProps} />
      </div>
      <ChatWidget
        botType="helpbot"
        userId={userId || undefined}
        userName={userName || undefined}
        role="admin"
      />
    </ChatProvider>
  );
}
```

---

### 8. mobile-driver/pwa (Conducteurs)
- **Port**: 3110
- **Bot Type**: `copilote-chauffeur`
- **Role**: `conducteur`
- **Router**: Next.js App Router
- **Integration**: Via `src/app/providers.tsx` (nouveau fichier)

**Fichiers modifies**:
```
apps/mobile-driver/pwa/package.json
apps/mobile-driver/pwa/src/app/layout.tsx
apps/mobile-driver/pwa/src/app/providers.tsx (cree)
apps/mobile-driver/pwa/.env.example
```

**Particularites Mobile**:
- PWA avec viewport optimise
- Touch targets de 48px minimum
- Widget responsive pour mobile
- Position adaptee (bas droite, pas sur navigation)

**Code d'integration**:
```tsx
// apps/mobile-driver/pwa/src/app/providers.tsx
'use client'

import { ChatProvider, ChatWidget } from '@rt/chatbot-widget'

export function Providers({ children }: { children: React.ReactNode }) {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null

  return (
    <ChatProvider
      botType="copilote-chauffeur"
      userId={userId || undefined}
      userName={userName || undefined}
      role="conducteur"
    >
      {children}
      <ChatWidget
        botType="copilote-chauffeur"
        userId={userId || undefined}
        userName={userName || undefined}
        role="conducteur"
      />
    </ChatProvider>
  )
}
```

---

## Configuration des Variables d'Environnement

Chaque application necessite les variables suivantes dans son fichier `.env.example` (et `.env.local` en local) :

```bash
# Chatbot Service
NEXT_PUBLIC_CHATBOT_WS_URL=ws://localhost:3019/chatbot/ws
NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:3019
```

### Production

En production, remplacer par les URLs de production :

```bash
NEXT_PUBLIC_CHATBOT_WS_URL=wss://chatbot.rt-technologie.com/chatbot/ws
NEXT_PUBLIC_CHATBOT_API_URL=https://chatbot.rt-technologie.com
```

---

## Tableau Recapitulatif

| Application | Port | Bot Type | Role | Router | Integration |
|-------------|------|----------|------|--------|-------------|
| web-industry | 3010 | planif-ia | industriel | App Router | providers.tsx |
| web-transporter | 3100 | routier | transporteur | App Router | providers.tsx |
| web-logistician | 3106 | quai-wms | logisticien | Pages Router | _app.tsx |
| web-recipient | 3102 | livraisons | destinataire | App Router | providers.tsx |
| web-supplier | 3103 | expedition | fournisseur | App Router | providers.tsx |
| web-forwarder | 4002 | freight-ia | transitaire | Pages Router | _app.tsx |
| backoffice-admin | 3000 | helpbot | admin | Pages Router | _app.tsx |
| mobile-driver/pwa | 3110 | copilote-chauffeur | conducteur | App Router | providers.tsx |

---

## Prochaines Etapes

### TODO: Gestion de l'Authentification

Actuellement, le widget utilise `localStorage` pour recuperer `user_id` et `user_name`. Il faut integrer avec le systeme d'authentification reel :

**Pour Next.js App Router** (web-industry, web-transporter, etc.):
```tsx
import { useSession } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  return (
    <ChatProvider
      botType="planif-ia"
      userId={session?.user?.id}
      userName={session?.user?.name}
      role="industriel"
    >
      {children}
      <ChatWidget
        botType="planif-ia"
        userId={session?.user?.id}
        userName={session?.user?.name}
        role="industriel"
      />
    </ChatProvider>
  )
}
```

**Pour Next.js Pages Router** (web-logistician, web-forwarder, backoffice-admin):
```tsx
import { useSession } from 'next-auth/react'

export default function App({ Component, pageProps }: AppProps) {
  const { data: session } = useSession()

  return (
    <ChatProvider
      botType="quai-wms"
      userId={session?.user?.id}
      userName={session?.user?.name}
      role="logisticien"
    >
      {/* ... */}
    </ChatProvider>
  )
}
```

---

## Fonctionnalites Contextuelles Futures

### Boutons d'Aide Contextuelle

Certaines pages beneficieraient de boutons d'aide contextuelle :

#### web-industry - Page Affret IA
```tsx
// apps/web-industry/src/app/affret/page.tsx
import { useChatContext } from '@rt/chatbot-widget'

export default function AffretPage() {
  const { openChat, sendMessage } = useChatContext()

  const handleAffretHelp = () => {
    openChat()
    sendMessage("J'ai besoin d'aide avec Affret.IA")
  }

  return (
    <div>
      <button onClick={handleAffretHelp}>
        Aide Affret.IA
      </button>
      {/* ... */}
    </div>
  )
}
```

#### web-logistician - Page Planning Quai
```tsx
// apps/web-logistician/pages/planning.tsx
import { useChatContext } from '@rt/chatbot-widget'

export default function PlanningPage() {
  const { openChat, sendMessage } = useChatContext()

  const handlePlanningHelp = () => {
    openChat()
    sendMessage("J'ai besoin d'aide avec le planning des quais")
  }

  return (
    <div>
      <button onClick={handlePlanningHelp}>
        Aide Planning Quai
      </button>
      {/* ... */}
    </div>
  )
}
```

---

## Installation et Demarrage

### 1. Installer les dependances

```bash
# A la racine du monorepo
pnpm install
```

### 2. Demarrer le service chatbot

```bash
cd services/chatbot
pnpm dev
# Le service demarre sur http://localhost:3019
```

### 3. Demarrer une application

```bash
# Exemple pour web-industry
cd apps/web-industry
pnpm dev
# L'app demarre sur http://localhost:3010
```

### 4. Tester le widget

1. Ouvrir l'application dans le navigateur
2. Chercher le bouton flottant du chatbot (coin bas droite)
3. Cliquer pour ouvrir le widget
4. Tester l'envoi de messages

---

## Troubleshooting

### Le widget ne s'affiche pas

1. Verifier que `@rt/chatbot-widget` est installe dans `package.json`
2. Verifier que le service chatbot tourne sur le port 3019
3. Ouvrir la console navigateur pour voir les erreurs

### WebSocket ne se connecte pas

1. Verifier `NEXT_PUBLIC_CHATBOT_WS_URL` dans `.env.local`
2. Verifier que le service chatbot accepte les connexions WebSocket
3. Verifier les logs du service chatbot

### Messages ne s'envoient pas

1. Verifier `NEXT_PUBLIC_CHATBOT_API_URL` dans `.env.local`
2. Verifier que l'API REST du chatbot fonctionne
3. Verifier les logs du service chatbot

---

## Support

Pour toute question sur l'integration du chatbot :
- Documentation du widget : `packages/chatbot-widget/README.md`
- Documentation du service : `services/chatbot/README.md`
- Contact : dev@rt-technologie.com

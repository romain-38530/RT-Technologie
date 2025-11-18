# Resume de l'Integration du Chatbot Widget

Date: 2025-11-18

## Modifications Effectuees

### 8 Applications Integrees

Note: L'application `marketing-site` mentionnee dans les specifications n'existe pas dans le projet.

#### 1. web-industry (Industriels)
- **Bot Type**: `planif-ia`
- **Fichiers modifies**:
  - `apps/web-industry/package.json` - Ajout dependance `@rt/chatbot-widget`
  - `apps/web-industry/src/app/providers.tsx` - Integration ChatProvider + ChatWidget
  - `apps/web-industry/.env.example` - Ajout variables chatbot

#### 2. web-transporter (Transporteurs)
- **Bot Type**: `routier`
- **Fichiers modifies**:
  - `apps/web-transporter/package.json` - Ajout dependance `@rt/chatbot-widget`
  - `apps/web-transporter/src/app/layout.tsx` - Import Providers
  - `apps/web-transporter/src/app/providers.tsx` - **CREE** - Integration ChatProvider + ChatWidget
  - `apps/web-transporter/.env.example` - Ajout variables chatbot

#### 3. web-logistician (Logisticiens)
- **Bot Type**: `quai-wms`
- **Fichiers modifies**:
  - `apps/web-logistician/package.json` - Ajout dependance `@rt/chatbot-widget`
  - `apps/web-logistician/pages/_app.tsx` - Integration ChatProvider + ChatWidget (Pages Router)
  - `apps/web-logistician/.env.example` - Ajout variables chatbot

#### 4. web-recipient (Destinataires)
- **Bot Type**: `livraisons`
- **Fichiers modifies**:
  - `apps/web-recipient/package.json` - Ajout dependance `@rt/chatbot-widget`
  - `apps/web-recipient/src/app/providers.tsx` - Integration ChatProvider + ChatWidget
  - `apps/web-recipient/.env.example` - Ajout variables chatbot

#### 5. web-supplier (Fournisseurs)
- **Bot Type**: `expedition`
- **Fichiers modifies**:
  - `apps/web-supplier/package.json` - Ajout dependance `@rt/chatbot-widget`
  - `apps/web-supplier/src/app/providers.tsx` - Integration ChatProvider + ChatWidget
  - `apps/web-supplier/.env.example` - Ajout variables chatbot

#### 6. web-forwarder (Transitaires)
- **Bot Type**: `freight-ia`
- **Fichiers modifies**:
  - `apps/web-forwarder/package.json` - Ajout dependance `@rt/chatbot-widget`
  - `apps/web-forwarder/pages/_app.tsx` - Integration ChatProvider + ChatWidget (Pages Router)
  - `apps/web-forwarder/.env.example` - **CREE** - Variables chatbot

#### 7. backoffice-admin (Administrateurs)
- **Bot Type**: `helpbot`
- **Fichiers modifies**:
  - `apps/backoffice-admin/package.json` - Ajout dependance `@rt/chatbot-widget`
  - `apps/backoffice-admin/pages/_app.tsx` - Integration ChatProvider + ChatWidget (Pages Router)
  - `apps/backoffice-admin/.env.example` - Ajout variables chatbot

#### 8. mobile-driver/pwa (Conducteurs)
- **Bot Type**: `copilote-chauffeur`
- **Fichiers modifies**:
  - `apps/mobile-driver/pwa/package.json` - Ajout dependance `@rt/chatbot-widget`
  - `apps/mobile-driver/pwa/src/app/layout.tsx` - Import Providers
  - `apps/mobile-driver/pwa/src/app/providers.tsx` - **CREE** - Integration ChatProvider + ChatWidget
  - `apps/mobile-driver/pwa/.env.example` - Ajout variables chatbot

---

## Fichiers Crees

1. `apps/web-transporter/src/app/providers.tsx`
2. `apps/mobile-driver/pwa/src/app/providers.tsx`
3. `apps/web-forwarder/.env.example`
4. `docs/chatbot/INTEGRATION_GUIDE.md`
5. `docs/chatbot/INTEGRATION_SUMMARY.md` (ce fichier)

---

## Variables d'Environnement Ajoutees

Dans tous les fichiers `.env.example` :

```bash
NEXT_PUBLIC_CHATBOT_WS_URL=ws://localhost:3019/chatbot/ws
NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:3019
```

---

## Patterns d'Integration

### App Router (Next.js 13+)
Applications: web-industry, web-transporter, web-recipient, web-supplier, mobile-driver/pwa

```tsx
// src/app/providers.tsx
'use client'

import { ChatProvider, ChatWidget } from '@rt/chatbot-widget'

export function Providers({ children }: { children: React.ReactNode }) {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null

  return (
    <ChatProvider
      botType="[BOT_TYPE]"
      userId={userId || undefined}
      userName={userName || undefined}
      role="[ROLE]"
    >
      {children}
      <ChatWidget
        botType="[BOT_TYPE]"
        userId={userId || undefined}
        userName={userName || undefined}
        role="[ROLE]"
      />
    </ChatProvider>
  )
}
```

### Pages Router (Next.js Legacy)
Applications: web-logistician, web-forwarder, backoffice-admin

```tsx
// pages/_app.tsx
import { ChatProvider, ChatWidget } from '@rt/chatbot-widget';

export default function App({ Component, pageProps }: AppProps) {
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;
  const userName = typeof window !== 'undefined' ? window.localStorage.getItem('user_name') : null;

  return (
    <ChatProvider
      botType="[BOT_TYPE]"
      userId={userId || undefined}
      userName={userName || undefined}
      role="[ROLE]"
    >
      {/* Contenu de l'app */}
      <Component {...pageProps} />
      <ChatWidget
        botType="[BOT_TYPE]"
        userId={userId || undefined}
        userName={userName || undefined}
        role="[ROLE]"
      />
    </ChatProvider>
  );
}
```

---

## Prochaines Etapes

### A Faire Immediatement

1. **Installer les dependances**
   ```bash
   pnpm install
   ```

2. **Creer les fichiers .env.local**
   Pour chaque application, copier `.env.example` vers `.env.local` :
   ```bash
   cp apps/web-industry/.env.example apps/web-industry/.env.local
   # Repeter pour chaque app
   ```

3. **Demarrer le service chatbot**
   ```bash
   cd services/chatbot
   pnpm dev
   ```

4. **Tester une application**
   ```bash
   cd apps/web-industry
   pnpm dev
   ```

### A Faire Prochainement

1. **Integrer avec le systeme d'authentification reel**
   - Remplacer `localStorage.getItem('user_id')` par la session reelle
   - Utiliser NextAuth ou votre systeme d'auth existant

2. **Ajouter des boutons contextuels**
   - web-industry: Bouton "Aide Affret.IA" sur `/affret`
   - web-logistician: Bouton "Aide Planning Quai" sur `/planning`
   - mobile-driver: Bouton flottant toujours visible (deja integre via widget)

3. **Optimiser le widget mobile**
   - Verifier le responsive sur mobile-driver/pwa
   - Ajuster les touch targets (min 48px)
   - Tester sur appareils mobiles reels

4. **Configuration production**
   - Remplacer `ws://localhost:3019` par `wss://chatbot.rt-technologie.com`
   - Configurer les variables d'environnement de production

---

## Notes Techniques

### Architecture du Widget

Le widget est compose de :
- `ChatProvider` : Context Provider pour partager l'etat du chat
- `ChatWidget` : Composant UI du widget (bouton + fenetre de chat)
- `useChatContext` : Hook pour acceder au contexte depuis n'importe quel composant

### Communication

- **WebSocket** : Pour les messages temps reel (bidirectionnel)
- **REST API** : Pour recuperer l'historique et les metadonnees

### Gestion de l'Etat

Le widget utilise React Context pour :
- Gerer la connexion WebSocket
- Stocker les messages
- Controler l'ouverture/fermeture du widget
- Partager userId, userName, botType, role

---

## Verification de l'Integration

### Checklist par Application

Pour chaque application, verifier :

- [ ] Dependance `@rt/chatbot-widget` dans `package.json`
- [ ] Import et integration de `ChatProvider` et `ChatWidget`
- [ ] Variables d'environnement `NEXT_PUBLIC_CHATBOT_*` configurees
- [ ] BotType et role corrects
- [ ] Widget visible dans l'interface (bouton flottant bas droite)
- [ ] Connexion WebSocket etablie (verifier console navigateur)
- [ ] Envoi/reception de messages fonctionnel

### Tests Manuels

1. Ouvrir l'application
2. Cliquer sur le bouton du chatbot
3. Envoyer un message de test
4. Verifier la reponse du bot
5. Fermer et rouvrir le widget (l'historique doit persister)
6. Tester sur mobile (pour mobile-driver/pwa)

---

## Contact

Pour toute question ou probleme :
- Documentation complete : `docs/chatbot/INTEGRATION_GUIDE.md`
- Service chatbot : `services/chatbot/README.md`
- Package widget : `packages/chatbot-widget/README.md`

# Standards Frontend - RT-Technologie

Ce document définit les standards appliqués à toutes les applications frontend du projet RT-Technologie, basés sur les configurations réussies de **backoffice-admin** et **marketing-site**.

## 📋 Table des matières

- [Structure des Applications](#structure-des-applications)
- [Interfaces TypeScript](#interfaces-typescript)
- [Conventions de Nommage](#conventions-de-nommage)
- [Dépendances](#dépendances)
- [Configuration](#configuration)

---

## Structure des Applications

### Applications déployées

| Application | Port | Router | Status |
|------------|------|--------|--------|
| marketing-site | 3000 | App Router | ✅ Déployé |
| backoffice-admin | 3020 | Pages Router | ✅ Déployé |
| web-industry | 3010 | App Router | ✅ Configuré |
| web-transporter | 3100 | App Router | ✅ Configuré |
| web-logistician | 3106 | Pages Router | ✅ Configuré |

### Structure des dossiers

#### App Router (web-industry, web-transporter, marketing-site)
```
apps/[app-name]/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── providers.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/
│   │       ├── button.tsx       # ⚠️ Minuscule
│   │       ├── card.tsx
│   │       └── badge.tsx
│   └── lib/
│       ├── api/
│       │   ├── client.ts
│       │   └── palettes.ts
│       └── utils.ts
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── vercel.json
```

#### Pages Router (backoffice-admin, web-logistician)
```
apps/[app-name]/
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   └── [...routes].tsx
├── components/
│   └── ui/
├── lib/
│   └── api/
├── styles/
│   └── globals.css
├── public/
└── [config files...]
```

---

## Interfaces TypeScript

### PalletCheque (Standard pour toutes les apps)

```typescript
export interface PalletCheque {
  id: string                    // ⚠️ Utiliser 'id', PAS 'chequeId'
  orderId: string
  fromCompanyId: string
  toSiteId: string
  quantity: number
  palletType: string
  transporterPlate: string
  qrCode: string
  status: 'EMIS' | 'DEPOSE' | 'RECU' | 'LITIGE'  // ⚠️ Standard FR
  createdAt: string
  depositedAt: string | null
  receivedAt: string | null
  signatures: {
    transporter: string | null
    receiver: string | null
  }
  photos: Array<{ type: string; url: string; at: string }>
  geolocations: {
    deposit: { lat: number; lng: number } | null
    receipt: { lat: number; lng: number } | null
  }
  cryptoSignature: string
  quantityReceived?: number
}
```

### Statuts Palettes - STANDARD FRANÇAIS

| Code | Label | Couleur | Usage |
|------|-------|---------|-------|
| `EMIS` | Émis | Orange (#f59e0b) | Chèque généré |
| `DEPOSE` | Déposé | Bleu (#3b82f6) | Palettes déposées |
| `RECU` | Reçu | Vert (#10b981) | Palettes réceptionnées |
| `LITIGE` | Litige | Rouge (#ef4444) | En litige |

**⚠️ IMPORTANT:** Ne JAMAIS utiliser `GENERATED`, `DEPOSITED`, `RECEIVED`, `DISPUTED` (anciens codes anglais).

### PalletSite

```typescript
export interface PalletSite {
  id: string
  companyId: string
  name: string
  address: string
  gps: { lat: number; lng: number }
  quotaDailyMax: number
  quotaConsumed: number
  openingHours: { start: string; end: string }
  availableDays: number[]  // 0=Dimanche, 1=Lundi, etc.
  priority: 'INTERNAL' | 'NETWORK' | 'EXTERNAL'
}
```

---

## Conventions de Nommage

### Fichiers de Composants UI

**⚠️ RÈGLE CRITIQUE:** Les composants UI utilisent la **casse minuscule** pour les noms de fichiers.

```
✅ CORRECT:
components/ui/button.tsx
components/ui/card.tsx
components/ui/badge.tsx
components/ui/select.tsx

❌ INCORRECT:
components/ui/Button.tsx
components/ui/Card.tsx
```

### Imports de Composants UI

```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// ❌ INCORRECT
import { Button } from '@/components/ui/Button'
```

### Composants Layout

Les composants de layout utilisent PascalCase :

```
✅ CORRECT:
components/layout/Header.tsx
components/layout/Sidebar.tsx
components/layout/Footer.tsx
```

### Accès aux propriétés

```typescript
// ✅ CORRECT
const chequeId = scannedCheque.id

// ❌ INCORRECT
const chequeId = scannedCheque.chequeId  // Cette propriété n'existe pas!
```

---

## Dépendances

### Package.json Standard

```json
{
  "name": "@rt/[app-name]",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p [PORT]",
    "build": "next build",
    "start": "next start -p [PORT]",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "tailwindcss": "^3.4.1",        // ⚠️ En dependencies
    "postcss": "^8.4.35",           // ⚠️ En dependencies
    "autoprefixer": "^10.4.18",     // ⚠️ En dependencies
    "@types/node": "^20.11.24",     // ⚠️ En dependencies pour Vercel
    "@types/react": "^18.2.61",
    "@types/react-dom": "^18.2.19",
    "typescript": "^5.4.0"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.5"
  }
}
```

### Dépendances Optionnelles (selon l'app)

```json
{
  "dependencies": {
    // UI Components & Styling
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.344.0",

    // Forms
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",

    // Data Fetching
    "@tanstack/react-query": "^5.28.0",

    // Utilities
    "date-fns": "^3.3.1",

    // PWA (web-logistician uniquement)
    "next-pwa": "^5.6.0"
  }
}
```

---

## Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]  // App Router
      // OU
      "@/*": ["./*"]      // Pages Router
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,  // ⚠️ Important pour Vercel
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_PALETTE_API_URL: process.env.NEXT_PUBLIC_PALETTE_API_URL || 'http://localhost:3011',
  },
}

module.exports = nextConfig
```

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... autres nuances
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install --include=dev",
  "outputDirectory": ".next",
  "regions": ["cdg1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "${NEXT_PUBLIC_API_URL}",
    "NEXT_PUBLIC_PALETTE_API_URL": "${NEXT_PUBLIC_PALETTE_API_URL}"
  }
}
```

---

## Composants UI Standards

### Button avec support asChild

```typescript
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  asChild?: boolean  // ⚠️ Important pour les liens
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2',
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'default',
            'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
            'border border-gray-300 bg-white hover:bg-gray-50': variant === 'outline',
            'hover:bg-gray-100': variant === 'ghost',
            'h-10 px-4 py-2': size === 'default',
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-8': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
export { Button }
```

### Utilisation avec asChild

```tsx
// Pour créer un bouton-lien
<Button asChild variant="outline">
  <a href="/documents" target="_blank">
    Voir le document
  </a>
</Button>
```

---

## Utilitaires Standard

### lib/utils.ts

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    EMIS: '#f59e0b',
    DEPOSE: '#3b82f6',
    RECU: '#10b981',
    LITIGE: '#ef4444',
  }
  return colors[status] || '#6b7280'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    EMIS: 'Émis',
    DEPOSE: 'Déposé',
    RECU: 'Reçu',
    LITIGE: 'Litige',
  }
  return labels[status] || status
}
```

---

## Checklist de Déploiement

Avant de déployer une application sur Vercel, vérifier :

- [ ] ✅ Les interfaces TypeScript utilisent `id` (pas `chequeId`)
- [ ] ✅ Les statuts palettes sont en français (EMIS/DEPOSE/RECU/LITIGE)
- [ ] ✅ Les imports UI utilisent la casse minuscule (`@/components/ui/button`)
- [ ] ✅ Tailwind/PostCSS/Autoprefixer sont dans `dependencies`
- [ ] ✅ Les types TypeScript sont dans `dependencies` pour Vercel
- [ ] ✅ `next.config.js` a `eslint.ignoreDuringBuilds: true`
- [ ] ✅ `vercel.json` existe avec les bonnes variables d'environnement
- [ ] ✅ `@radix-ui/react-slot` est installé si Button utilise `asChild`
- [ ] ✅ Le composant Button supporte la propriété `asChild`
- [ ] ✅ Tous les commentaires JSX utilisent `{/* */}` (pas `/* */`)

---

## Erreurs Courantes et Solutions

### 1. "Property 'chequeId' does not exist"

```typescript
// ❌ Incorrect
const id = cheque.chequeId

// ✅ Correct
const id = cheque.id
```

### 2. "Module not found: Can't resolve '@/components/ui/Button'"

```typescript
// ❌ Incorrect
import { Button } from '@/components/ui/Button'

// ✅ Correct
import { Button } from '@/components/ui/button'
```

### 3. "Property 'asChild' does not exist"

```bash
# Installer la dépendance manquante
npm install @radix-ui/react-slot
```

```typescript
// Ajouter le support dans Button.tsx
import { Slot } from '@radix-ui/react-slot'

const Button = ({ asChild = false, ...props }) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp {...props} />
}
```

### 4. "This comparison appears to be unintentional" (status)

```typescript
// ❌ Incorrect (anciens codes anglais)
if (cheque.status === 'DEPOSITED') { }

// ✅ Correct (codes français)
if (cheque.status === 'DEPOSE') { }
```

### 5. "Unexpected token div. Expected jsx identifier"

```tsx
// ❌ Incorrect
return (
  <div>
    <TrainingButton toolName="..." /> */  {/* Commentaire mal fermé */}
  </div>
)

// ✅ Correct
return (
  <div>
    {/* <TrainingButton toolName="..." /> */}
  </div>
)
```

---

## Ressources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query/latest)

---

**Dernière mise à jour:** 2025-11-20
**Maintenu par:** RT-Technologie DevOps Team

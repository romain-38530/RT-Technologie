# Guide de déploiement - Web Logistician

## Prérequis

- Node.js 18+ installé
- pnpm 8+ installé
- Accès aux services backend (Planning, E-CMR, Core Orders)
- Compte Vercel ou serveur de production

## Checklist avant déploiement

### 1. Vérifications code

- [ ] Tous les tests passent
- [ ] Pas d'erreurs TypeScript (`pnpm tsc --noEmit`)
- [ ] Pas d'erreurs ESLint
- [ ] Build réussit (`pnpm build`)

### 2. Configuration

- [ ] Variables d'environnement configurées
- [ ] URLs d'API pointent vers production
- [ ] Manifest PWA complété
- [ ] Icônes PWA générées (192x192 et 512x512)

### 3. Tests

- [ ] Tests manuels sur Chrome/Safari
- [ ] Tests sur tablette Android
- [ ] Tests sur iPad
- [ ] Tests mode hors-ligne
- [ ] Tests caméra/scanner

## Déploiement Vercel

### Option 1: Via CLI

```bash
# Installation Vercel CLI
npm i -g vercel

# Login
vercel login

# Premier déploiement (preview)
cd apps/web-logistician
vercel

# Déploiement production
vercel --prod
```

### Option 2: Via GitHub

1. Connecter le repo GitHub à Vercel
2. Configurer le projet :
   - Framework: Next.js
   - Root Directory: `apps/web-logistician`
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

3. Configurer les variables d'environnement :
   ```
   NEXT_PUBLIC_PLANNING_API=https://api.rt-technologie.com/planning
   NEXT_PUBLIC_ECMR_API=https://api.rt-technologie.com/ecmr
   NEXT_PUBLIC_ORDERS_API=https://api.rt-technologie.com/orders
   ```

4. Deploy automatique sur push main/master

## Déploiement Docker

### Dockerfile

Créer `apps/web-logistician/Dockerfile` :

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN corepack enable pnpm && pnpm build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3106

ENV PORT 3106

CMD ["node", "server.js"]
```

### Build et run

```bash
# Build image
docker build -t web-logistician .

# Run container
docker run -p 3106:3106 \
  -e NEXT_PUBLIC_PLANNING_API=https://api.rt-technologie.com/planning \
  -e NEXT_PUBLIC_ECMR_API=https://api.rt-technologie.com/ecmr \
  -e NEXT_PUBLIC_ORDERS_API=https://api.rt-technologie.com/orders \
  web-logistician
```

### Docker Compose

```yaml
version: '3.8'

services:
  web-logistician:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3106:3106"
    environment:
      - NEXT_PUBLIC_PLANNING_API=https://api.rt-technologie.com/planning
      - NEXT_PUBLIC_ECMR_API=https://api.rt-technologie.com/ecmr
      - NEXT_PUBLIC_ORDERS_API=https://api.rt-technologie.com/orders
    restart: unless-stopped
```

## Déploiement AWS

### Option 1: AWS Amplify

1. Connecter le repo GitHub
2. Configurer :
   - Framework: Next.js - SSR
   - Build settings: Auto-détecté
   - Environment variables: Ajouter les NEXT_PUBLIC_*

### Option 2: AWS EC2 + PM2

```bash
# Sur l'instance EC2
git clone <repo>
cd apps/web-logistician

# Installer dépendances
pnpm install

# Build
pnpm build

# Installer PM2
npm install -g pm2

# Lancer avec PM2
pm2 start npm --name "web-logistician" -- start

# Sauvegarder config PM2
pm2 save
pm2 startup
```

### Option 3: AWS ECS (Docker)

1. Push l'image Docker vers ECR
2. Créer une Task Definition
3. Créer un Service ECS
4. Configurer ALB pour HTTPS

## Déploiement nginx (reverse proxy)

Configuration nginx pour servir l'app :

```nginx
server {
    listen 80;
    server_name logistician.rt-technologie.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name logistician.rt-technologie.com;

    ssl_certificate /etc/letsencrypt/live/rt-technologie.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rt-technologie.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3106;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3106;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Configuration SSL

### Let's Encrypt avec Certbot

```bash
# Installer certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir certificat
sudo certbot --nginx -d logistician.rt-technologie.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

## Monitoring

### Health check endpoint

Créer `pages/api/health.ts` :

```typescript
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
}
```

### Uptime monitoring

Services recommandés :
- UptimeRobot : https://uptimerobot.com
- Pingdom : https://www.pingdom.com
- StatusCake : https://www.statuscake.com

Configuration :
- URL: https://logistician.rt-technologie.com/api/health
- Interval: 5 minutes
- Alert: Email + SMS si down

## Rollback

### Vercel

```bash
# Lister les déploiements
vercel ls

# Rollback vers un déploiement précédent
vercel rollback [deployment-url]
```

### Docker

```bash
# Lister les images
docker images

# Run version précédente
docker run -p 3106:3106 web-logistician:[tag-précédent]
```

### PM2

```bash
# Voir les logs
pm2 logs web-logistician

# Redémarrer
pm2 restart web-logistician

# Recharger le code
git pull
pnpm install
pnpm build
pm2 reload web-logistician
```

## Environnements

### Development
- URL: http://localhost:3106
- APIs: localhost
- PWA: Désactivé

### Staging
- URL: https://staging-logistician.rt-technologie.com
- APIs: https://staging-api.rt-technologie.com
- PWA: Activé
- Basic Auth: oui

### Production
- URL: https://logistician.rt-technologie.com
- APIs: https://api.rt-technologie.com
- PWA: Activé
- CDN: Oui (Vercel/CloudFront)
- Monitoring: Oui

## Backup

### Code
- Repository GitHub (source of truth)
- Vercel garde historique des déploiements

### Données utilisateur
- LocalStorage sauvegardé par navigateur
- Sync vers backend régulièrement

### Configuration
- Variables d'environnement dans Vercel/AWS
- Backup manuel dans 1Password/Vault

## Maintenance

### Mises à jour

```bash
# Mettre à jour Next.js
pnpm update next react react-dom

# Mettre à jour toutes les dépendances
pnpm update

# Vérifier les vulnérabilités
pnpm audit
```

### Nettoyage

```bash
# Nettoyer node_modules
rm -rf node_modules
pnpm install

# Nettoyer .next
rm -rf .next
pnpm build

# Nettoyer cache pnpm
pnpm store prune
```

## Troubleshooting

### Build échoue

```bash
# Vérifier la version de Node
node -v  # Doit être 18+

# Clean install
rm -rf node_modules .next
pnpm install
pnpm build
```

### App ne démarre pas

```bash
# Vérifier les logs
pm2 logs web-logistician

# Vérifier le port
lsof -i :3106

# Redémarrer
pm2 restart web-logistician
```

### Performance lente

1. Activer compression nginx (gzip)
2. Vérifier la latence API backend
3. Activer CDN pour assets statiques
4. Optimiser images (si ajoutées)

## Checklist post-déploiement

- [ ] App accessible publiquement
- [ ] HTTPS fonctionne
- [ ] PWA installable sur mobile
- [ ] Login fonctionne
- [ ] Toutes les pages chargent
- [ ] Caméra accessible (HTTPS requis)
- [ ] APIs backend répondent
- [ ] Mode hors-ligne fonctionne
- [ ] Monitoring configuré
- [ ] SSL certificate valide
- [ ] CDN activé (si applicable)
- [ ] DNS configuré correctement

## Support

Pour aide sur le déploiement :
- DevOps : devops@rt-technologie.com
- Documentation : https://docs.rt-technologie.com/deployment
- On-call : +33 X XX XX XX XX

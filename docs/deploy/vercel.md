# Déploiement Vercel — Backoffice Admin

Objectif: rendre l’UI de test accessible via une URL Vercel (Next.js),
avec configuration des APIs distantes et des règles CORS côté backend.

## Pré-requis
- Compte Vercel + Token API (fourni): `VERCEL_TOKEN`
- Repo connecté ou CLI locale
- Backends accessibles publiquement (admin-gateway & services) ou tunnel (ngrok)

## Étapes (CLI)
1) Installer CLI Vercel
```
npm i -g vercel
vercel login
# ou
export VERCEL_TOKEN="elWDyBlJ2vGjuRCR6eUQIGEC"
```

2) Se placer dans l’app
```
cd apps/backoffice-admin
```

3) Créer le projet sur Vercel (une fois)
```
vercel --token $VERCEL_TOKEN --yes
```

4) Définir les variables d’environnement (Vercel)
- Dans Vercel → Project → Settings → Environment Variables, ajouter:
  - `NEXT_PUBLIC_ADMIN_GATEWAY_URL` → URL publique de l’API Admin (ex: https://admin.example.com)
  - `NEXT_PUBLIC_AUTHZ_URL` → URL AuthZ (ex: https://authz.example.com)

5) Définir CORS côté backend
- Sur vos services (admin-gateway, core-orders, etc.), définir `CORS_ALLOW_ORIGIN` à l’URL Vercel
  - ex: `CORS_ALLOW_ORIGIN=https://<project>.vercel.app`

6) Déployer
```
vercel --token $VERCEL_TOKEN --prod
```

## Notes
- Ce projet n’est destiné qu’au front (Next.js). Les APIs (admin-gateway & services) doivent être
  déployées ailleurs (Railway/Render/Fly.io/EC2) ou exposées via un tunnel.
- Pour brancher admin-gateway sur Vercel Functions, il faut porter ses routes en `/api/*` et éviter
  l’écriture sur disque (utiliser Mongo). C’est faisable dans un sprint ultérieur.

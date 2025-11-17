% Vercel — Déploiement Backoffice (Next.js)

Pré-requis
- Projet: `apps/backoffice-admin`.
- Variables d'environnement publiques pour le front.

Étapes
- Créer un projet Vercel et sélectionner le répertoire `apps/backoffice-admin`.
- Définir les variables d'env:
  - `NEXT_PUBLIC_ADMIN_GATEWAY_URL=https://admin-gateway.rt-technologie.com`
  - `NEXT_PUBLIC_AUTHZ_URL=https://authz.rt-technologie.com`
  - `NEXT_PUBLIC_SUPPORT_URL=https://www.rt-technologie.com`
- Connecter un domaine si souhaité (ex: `https://admin.rt-technologie.com`).
- Option CI: GitHub Actions `.github/workflows/deploy-vercel.yml` (renseigner `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).

Vérifications
- `/` (landing commerciale) avec bouton « Se connecter à la démo ».
- `/health` (agrégat, via admin-gateway).
- `/pricing` (catalogue plans/addons).


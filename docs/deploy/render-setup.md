# Render — Déploiement des services

Pré-requis
- Repository connecté à Render (Blueprint via `render.yaml`).
- Secrets prêts (ne pas committer). Tournez/rotations des clés partagées dans le chat.

Étapes
- Importer le repo dans Render → Blueprint → `render.yaml`.
- Render crée les services web suivants: authz, admin-gateway, core-orders, planning, vigilance, notifications, ecpmr.
- Pour chaque service, renseigner les env vars marquées `sync:false` dans le dashboard Render:
  - Commun: `MONGODB_URI`, `MONGODB_DB=rt`, `SECURITY_ENFORCE=true`, `CORS_ALLOW_ORIGIN=https://www.rt-technologie.com`.
  - `authz`: `AUTHZ_JWT_SECRET` (fort), `AUTHZ_VERIFY_BASE_URL=https://authz.rt-technologie.com`.
  - `admin-gateway`: `INTERNAL_SERVICE_TOKEN` (fort). Les URLs des services sont déjà fixées dans `render.yaml`.
  - `notifications`: `MAILGUN_DOMAIN`, `MAILGUN_API_KEY` OU `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `NOTIFICATIONS_SES_FROM`.
  - `vigilance`: `VATCHECK_API_KEY`.
  - `ecpmr`: `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.

Domaines
- Associer: `https://authz.rt-technologie.com`, `https://admin-gateway.rt-technologie.com`, `https://core-orders.rt-technologie.com`, `https://planning.rt-technologie.com`, `https://vigilance.rt-technologie.com`, `https://notifications.rt-technologie.com`, `https://ecpmr.rt-technologie.com`.

Validation
- `GET https://admin-gateway.rt-technologie.com/admin/health`
- `GET https://admin-gateway.rt-technologie.com/admin/health/full`

Dépannage
- CORS: vérifier `CORS_ALLOW_ORIGIN` exact (front). 
- Mongo: vérifier `MONGODB_URI`/whitelist IP (Atlas). 
- Mails: si Mailgun absent, config SES (`NOTIFICATIONS_SES_FROM` + AWS credentials).


% Secrets & Variables d'environnement (Production)

Front (Vercel)
- `NEXT_PUBLIC_ADMIN_GATEWAY_URL` → URL de l'admin-gateway.
- `NEXT_PUBLIC_AUTHZ_URL` → URL du service authz.
- `NEXT_PUBLIC_SUPPORT_URL` → URL support public.
- Secrets Vercel CI: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

Services (Render)
- Commun: `MONGODB_URI`, `MONGODB_DB=rt`, `SECURITY_ENFORCE=true`, `CORS_ALLOW_ORIGIN=https://www.rt-technologie.com`.
- admin-gateway: `INTERNAL_SERVICE_TOKEN` (fort).
- authz: `AUTHZ_JWT_SECRET` (fort), `AUTHZ_VERIFY_BASE_URL`.
- notifications: `MAILGUN_DOMAIN`, `MAILGUN_API_KEY` ou `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `NOTIFICATIONS_SES_FROM`.
- vigilance: `VATCHECK_API_KEY` (contrôle TVA).
- ecpmr: `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.

Rotation & sécurité
- Ne jamais committer de clé. Utiliser les stores de secrets (Render/Vercel/GitHub).
- Après partage hors canal sécurisé, ROTATION obligatoire (Mailgun, AWS, Mongo, OpenRouter, Vercel).

Générer des secrets de base (local)
- Commande: `pnpm gen:secrets`
- Crée/ajoute dans `.env.local` des valeurs fortes pour:
  - AUTHZ_JWT_SECRET
  - INTERNAL_SERVICE_TOKEN
  - AUTHZ_ADMIN_API_KEY
- Affiche des blocs “copier/coller” pour Render et Vercel.
- Remarque: les clés externes (Mailgun, AWS, OpenRouter, VAT, Atlas) restent à saisir dans leurs dashboards.

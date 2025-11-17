# Notifications Service

Emails/SMS/Push avec templates multilingues.

Sécurité
- Activez `SECURITY_ENFORCE=true` et définissez `INTERNAL_SERVICE_TOKEN` dans `.env`.
- Les appels interne→Notifications doivent inclure `Authorization: Bearer ${INTERNAL_SERVICE_TOKEN}` (déjà géré par `@rt/notify-client`).

Configuration (Mailgun)
- Variables d’env: voir `.env.example` (ne pas committer vos secrets):
  - `MAILGUN_DOMAIN`, `MAILGUN_API_KEY`, `MAIL_FROM`, `NOTIFICATIONS_PORT`

Endpoints
- `POST /notifications/email`
  - body: `{ to: string, subject: string, text?: string, html?: string }`
  - 200 si envoyé, 502 si erreur provider
  - Propage/retourne `traceId` si en-tête `x-trace-id` présent (champ `traceId` + header transitif)
- `POST /notifications/email/from-template`
  - body: `{ to: string, templateId: string, locale?: string, variables?: object, aiEnhance?: boolean }`
  - Utilise `@rt/comm-templates`; si `aiEnhance=true` et OpenRouter configuré, améliore le libellé.
  - Propage/retourne `traceId` si en-tête `x-trace-id` présent

Démarrage
- `pnpm --filter @rt/service-notifications dev`
- Test local:
  `curl -X POST localhost:3002/notifications/email -H "content-type: application/json" -d '{"to":"dest@example.com","subject":"Test","text":"Bonjour"}'`
 - Template:
   `curl -X POST localhost:3002/notifications/email/from-template -H "content-type: application/json" -d '{"to":"dest@example.com","templateId":"dispatch_assign","locale":"fr","variables":{"orderId":"ORD-1","carrierName":"Carrier B","slaHours":2},"aiEnhance":false}'`

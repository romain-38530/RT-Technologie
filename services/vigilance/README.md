# Vigilance Service

Gestion documents légaux, statut conforme/non conforme, blocage dispatch.

Nouvel endpoint
- `POST /vigilance/vat/check` body `{ vat?: string, country?: string, number?: string }`
  - Utilise l’API VATCheck pour valider un numéro de TVA.
  - Réponse: `{ valid: boolean, provider: 'vatcheckapi.com', raw: {...} }`

Statut avec TVA
- `GET /vigilance/status/{carrierId}` → retourne le statut agrégé (seeds + TVA).
  - Ajoutez `?refresh=1` pour forcer une revalidation TVA via le provider.
- `POST /vigilance/revalidate/{carrierId}` → force un rafraîchissement de TVA et retourne le statut.

Configuration
- `.env` : `VATCHECK_API_KEY`, `VATCHECK_BASE_URL` (défaut `https://app.vatcheckapi.com`), `VATCHECK_PATH` (défaut `/api/validate`)
- `VIGILANCE_PORT` (défaut `3006`)

Démarrage
- `pnpm --filter @rt/service-vigilance dev`

Exemples
- `curl -X POST localhost:3006/vigilance/vat/check -H "content-type: application/json" -H "x-trace-id: demo-123" -d '{"vat":"FR12345678901"}'`
- `curl -X POST localhost:3006/vigilance/vat/check -H "content-type: application/json" -d '{"country":"FR","number":"12345678901"}'`
- `curl localhost:3006/vigilance/status/A -H "x-trace-id: demo-123"`
- `curl -X POST localhost:3006/vigilance/revalidate/B -H "x-trace-id: demo-123"`

Traçabilité
- Les réponses incluent `traceId` si l’en-tête `x-trace-id` est présent; l’en-tête est aussi recopié dans la réponse.

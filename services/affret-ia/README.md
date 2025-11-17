# Affret.IA Service

Sourcing express, scoring transporteurs, intégration dispatch fallback.

Serveur HTTP
- `GET /affret-ia/quote/:orderId` → génère un devis via OpenRouter si configuré, sinon mock.
- `POST /affret-ia/dispatch` body `{ orderId }` → renvoie un `assignedCarrierId` suggéré + quote.

Configuration OpenRouter
- Variables d’env (`.env`):
  - `OPENROUTER_API_KEY=sk-or-...`
  - `OPENROUTER_BASE_URL=https://openrouter.ai/api/v1`
  - `OPENROUTER_MODEL=openai/gpt-4o-mini`
  - `OPENROUTER_PROJECT=RT-Technologie`, `OPENROUTER_REFERER=http://localhost`

Démarrage
- `pnpm --filter @rt/service-affret-ia dev`

Exemples
- `curl localhost:3005/affret-ia/quote/ORD-Paris-Munich -H "x-trace-id: demo-123"`
- `curl -X POST localhost:3005/affret-ia/dispatch -H "content-type: application/json" -H "x-trace-id: demo-123" -d '{"orderId":"ORD-Paris-Munich"}'`

Traçabilité
- Les réponses incluent `traceId` si l’en-tête `x-trace-id` est fourni; l’en-tête est renvoyé tel quel dans la réponse.

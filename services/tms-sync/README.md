# TMS Sync Service

Connecteurs TMS (transporteurs) – mocks et webhooks.

Endpoints (Carrier)
- `GET /carrier/orders?status=pending&carrierId=B` → liste des missions à accepter.
- `POST /carrier/orders/:id/accept` body `{ carrierId }` → accepte la mission côté core-orders.

Config
- `CORE_ORDERS_URL` (défaut `http://localhost:3001`)
- `TMS_SYNC_PORT` (défaut `3003`)

Traçabilité
- `tms-sync` propage un en-tête `x-trace-id` vers `core-orders` pour corréler les requêtes.

Démarrage
- `pnpm --filter @rt/service-tms-sync dev`

Exemples
- Lister: `curl "localhost:3003/carrier/orders?status=pending&carrierId=B"`
- Accepter: `curl -X POST localhost:3003/carrier/orders/ORD-Paris-Munich/accept -H "content-type: application/json" -d '{"carrierId":"B"}'`

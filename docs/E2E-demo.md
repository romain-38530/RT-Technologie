# Démo E2E — Import → Dispatch → Accept → RDV

Pré-requis
- `.env` configuré (Notifications Mailgun + emails cibles: `DISPATCH_NOTIFY_TO`, `INDUSTRY_NOTIFY_TO`, `PLANNING_NOTIFY_TO`).
- Services démarrés:
  - Notifications: `pnpm --filter @rt/service-notifications dev`
  - Core Orders: `pnpm --filter @rt/service-core-orders dev`
  - Carrier (TMS Sync): `pnpm --filter @rt/service-tms-sync dev`
  - Planning: `pnpm --filter @rt/service-planning dev`

1) Importer une commande (ou utiliser seeds)
```
curl -X POST localhost:3001/industry/orders/import -H "content-type: application/json" -d '{
  "id":"ORD-DEMO-1","ref":"PO-9001","ship_from":"Paris","ship_to":"Berlin",
  "windows":{"start":"2025-01-10T08:00:00Z","end":"2025-01-10T16:00:00Z"},
  "pallets":6,"weight":3500
}'
```

2) Lancer le dispatch (email envoyé au transporteur courant)
```
curl -X POST localhost:3001/industry/orders/ORD-DEMO-1/dispatch
```

3) Côté transporteur, lister les missions en attente (ex: carrier B)
```
curl "localhost:3003/carrier/orders?status=pending&carrierId=B"
```

4) Accepter la mission (email confirmation industry + carrier)
```
curl -X POST localhost:3003/carrier/orders/ORD-DEMO-1/accept -H "content-type: application/json" -d '{"carrierId":"B"}'
```

5) Proposer un RDV pickup
```
curl -X POST localhost:3004/planning/rdv/propose -H "content-type: application/json" -d '{
  "orderId":"ORD-DEMO-1","leg":"PICKUP","proposedAt":"2025-01-10T08:00:00Z"
}'
```

6) Confirmer un créneau
```
curl -X POST localhost:3004/planning/rdv/confirm -H "content-type: application/json" -d '{
  "orderId":"ORD-DEMO-1","leg":"PICKUP",
  "slot":{"start":"2025-01-10T08:00:00Z","end":"2025-01-10T08:30:00Z"}
}'
```

Résultats attendus
- Emails: dispatch, rappels (si SLA proche), acceptation, confirmation RDV.
- Statuts: `order.dispatched`, `order.accepted`; slot réservé (booked=true après confirmation).

Notes
- Les timers SLA et rappels se basent sur `dispatch-policies.json` (par défaut 2h).
- Les emails transporteurs utilisent `infra/seeds/carriers.json` (champ `email`), sinon fallback `DISPATCH_NOTIFY_TO`.

## Traçabilité (traceId)

- Pour suivre un scénario E2E, ajoutez l’en-tête `x-trace-id` à vos requêtes cURL, par exemple `-H "x-trace-id: demo-123"`.
- Les services renvoient ce `traceId` dans les réponses JSON et, lorsque pertinent, dans l’en-tête `x-trace-id` de la réponse.
- Les emails émis (dispatch, rappels, escalade, RDV propose/confirm) incluent automatiquement une ligne `traceId: ...` pour faciliter la corrélation.
- Exemples rapides avec traceId:
  - Dispatch: `curl -H "x-trace-id: demo-123" -X POST localhost:3001/industry/orders/ORD-DEMO-1/dispatch`
  - Acceptation: `curl -H "x-trace-id: demo-123" -X POST localhost:3003/carrier/orders/ORD-DEMO-1/accept -H "content-type: application/json" -d '{"carrierId":"B"}'`
  - RDV propose: `curl -H "x-trace-id: demo-123" -X POST localhost:3004/planning/rdv/propose -H "content-type: application/json" -d '{"orderId":"ORD-DEMO-1","leg":"PICKUP","proposedAt":"2025-01-10T08:00:00Z"}'`
  - RDV confirm: `curl -H "x-trace-id: demo-123" -X POST localhost:3004/planning/rdv/confirm -H "content-type: application/json" -d '{"orderId":"ORD-DEMO-1","leg":"PICKUP","slot":{"start":"2025-01-10T08:00:00Z","end":"2025-01-10T08:30:00Z"}}'`

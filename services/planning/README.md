# Planning Service

Endpoints: propose/confirm RDV. V2: slotting temps réel.

Serveur HTTP (V1)
- `GET /planning/slots?date=YYYY-MM-DD` → liste des créneaux (depuis `infra/seeds/planning-slots.json`), indicateur `booked`.
- `POST /planning/rdv/propose` body `{ orderId, leg, proposedAt }` → enregistre la proposition + envoi email (optionnel).
- `POST /planning/rdv/confirm` body `{ orderId, leg, slot:{ start, end } }` → confirme si le créneau existe et n’est pas réservé, verrou léger en mémoire + email.

Config
- `PLANNING_PORT` (défaut `3004`)
- Pour emails, configurez `PLANNING_NOTIFY_TO` (ou fallback `DISPATCH_NOTIFY_TO`) + service Notifications.
- Si présent, l’en-tête `x-trace-id` est propagé et inclus dans le corps des emails (proposition/confirmation).

Démarrage
- `pnpm --filter @rt/service-planning dev`

Exemples cURL
- Lister slots (jour):
  `curl "localhost:3004/planning/slots?date=2025-01-10"`
- Proposer RDV:
  `curl -X POST localhost:3004/planning/rdv/propose -H "content-type: application/json" -d '{"orderId":"ORD-Paris-Munich","leg":"PICKUP","proposedAt":"2025-01-10T08:00:00Z"}'`
- Confirmer RDV:
  `curl -X POST localhost:3004/planning/rdv/confirm -H "content-type: application/json" -d '{"orderId":"ORD-Paris-Munich","leg":"PICKUP","slot":{"start":"2025-01-10T08:00:00Z","end":"2025-01-10T08:30:00Z"}}'`

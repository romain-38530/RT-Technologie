# Agent‑Industry (Core Orders)

Mandat
- Import commandes ERP (`POST /industry/orders/import`).
- Dispatch auto (chaîne A→B→C) avec SLA et relances.
- Événements: `order.created|dispatched|accepted|refused|escalated.to.affretia`.

Contrats
- OpenAPI: `services/core-orders/openapi.yaml:1`.
- Events: `packages/contracts/src/events/order.created.ts:1` (+ à compléter).

Démarrage local
- Script: `pnpm --filter @rt/service-core-orders dev`.

DoD
- Import <30s, timers SLA OK, escalade Affret.IA si nécessaire.

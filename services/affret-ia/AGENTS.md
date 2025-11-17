# Agent‑Affret.IA

Mandat
- Fallback dispatch (sourcing express, mock).
- API: `/affret-ia/dispatch`, `/affret-ia/quote/:orderId`.
- Events: `order.escalated.to.affretia`, `affretia.carrier.assigned`.

Démarrage local
- Script: `pnpm --filter @rt/service-affret-ia dev`.

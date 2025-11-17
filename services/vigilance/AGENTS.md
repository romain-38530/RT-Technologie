# Agent‑Vigilance

Mandat
- Statut conformité transporteurs, blocage dispatch.
- API: `GET /vigilance/status/:carrierId`, `POST /vigilance/docs/upload`.
- Events: `vigilance.carrier.blocked|unblocked`.

Démarrage local
- Script: `pnpm --filter @rt/service-vigilance dev`.

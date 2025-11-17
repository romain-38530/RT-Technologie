# Agent‑Tracking IA

Mandat
- PWA conducteur: start/position/stop.
- ETA (TomTom mock) + alertes retards.

Contrats
- OpenAPI: `services/tracking-ia/openapi.yaml:1`.
- Events: `tracking.eta.updated`, `tracking.delay.alert`.

Démarrage local
- Script: `pnpm --filter @rt/service-tracking-ia dev`.

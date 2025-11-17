# RT Technologie Monorepo

Ce dépôt contient la plateforme modulable multi-agents (Industry, Carrier, Logi, Supplier, Recipient, Forwarder, Shared).

Structure principale:
- docs/
- packages/ (contrats, authz, i18n, utils)
- services/ (APIs par domaine)
- apps/ (fronts web + PWA)
- infra/ (seeds, IaC, pipelines)

Voir `docs/` pour les spécifications et les schémas.

Outils:
- Node 20 + TypeScript
- pnpm workspaces + Turborepo
- NATS (Pub/Sub), Redis (timers), Postgres, S3-like
- OpenAPI par service, JSON Schema pour événements

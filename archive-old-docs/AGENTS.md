# Multi‑Agents — RT Technologie

Ce dépôt est opéré par plusieurs agents, chacun responsable d’un espace (service/app). Les agents travaillent en parallèle et valident leurs contrats avant implémentation.

Principes
- Contrats d’abord: OpenAPI (REST) et JSON Schema (événements) dans `packages/contracts`.
- Sécurité: JWT (roles: INDUSTRY, TRANSPORTER, LOGISTICIAN, SUPPLIER, RECIPIENT, FORWARDER, ADMIN).
- Événements: sujets `order.*`, `planning.*`, `vigilance.*`, `ecmr.*`, `carrier.*`, `supplier.*`, `recipient.*`, `affretia.*`.
- Observabilité: chaque agent joint `traceId`/`spanId` aux logs/events.

Orchestration
- Lancement simultané: `pnpm agents` (via Turborepo, exécute `dev` dans chaque service).
- Seeds de dev: `infra/seeds/*.json` (transporteurs A/B/C, vigilance, commandes, slots, etc.).

Rôles d’agents (extrait)
- Agent‑Industry (services/core-orders): import ERP, dispatch chain + SLA, KPI.
- Agent‑Carrier (services/tms-sync + apps/web-transporter): acceptation, RDV, docs.
- Agent‑Logi (services/wms-sync + services/ecpmr + apps/web-logistician): webhook WMS, e‑CMR quai.
- Agent‑Supplier (apps/web-supplier): RDV pickup, dépôt docs, i18n.
- Agent‑Recipient (apps/web-recipient): signature QR, réserves/photos, export.
- Agent‑Forwarder (services/affret-ia + apps/web-forwarder): tender + pre/post.
- Agent‑Shared (services/vigilance, services/notifications, services/tracking-ia): conformité, notifications, ETA.

Définitions de prêt/terminé
- DoR: OpenAPI/Schema validés, seeds prêtes, RBAC défini.
- DoD: endpoints testés, events conformes schema, logs/trace, README mis à jour.


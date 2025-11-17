# Core Orders Service

Noyau commandes & événements: import, dispatch, SLA timers.

Endpoints exposés (stub HTTP)
- `POST /industry/orders/import` → accepte 1 commande ou une liste.
- `GET /industry/orders/:id` → retourne la commande.
- `POST /industry/orders/:id/dispatch` → assigne le transporteur courant, démarre la fenêtre SLA et programme les rappels T‑30/T‑10 min, puis bascule au suivant ou escalade.
- `POST /carrier/orders/:id/accept` (body `{ carrierId }`) → accepte la commande pour le transporteur courant.

Démarrage
- Infra locale (optionnel): `docker compose -f docker-compose.dev.yml up -d`
- Service: `pnpm --filter @rt/service-core-orders dev`

Seeds chargées au démarrage
- `infra/seeds/orders.json`, `carriers.json`, `vigilance.json`, `dispatch-policies.json`

Notifications
- Configurez `NOTIFICATIONS_URL` et `DISPATCH_NOTIFY_TO` dans `.env` pour recevoir les mails (le service Notifications doit être lancé et configuré Mailgun).
- Les emails (dispatch, rappels, escalade, acceptation) incluent automatiquement `traceId` si fourni via l’en-tête `x-trace-id` ou généré lors du dispatch.
 - Les réponses JSON incluent `traceId` quand disponible pour faciliter le débogage.

Vigilance (TVA)
- Avant chaque assignation, le service interroge `VIGILANCE_URL` (`GET /vigilance/status/:carrierId?refresh=1`) avec mini‑cache TTL (par défaut 5 min via `VIGILANCE_TTL_MS`).
- Si statut `BLOCKED` (ex: TVA invalide), l’assignation saute automatiquement au transporteur suivant.

## Tarification et droits (MVP)

Industriel (INDUSTRY)
- 499€/mois (plan `INDUSTRY_BASE`) inclut:
  - Vigilance (documents légaux, blocage)
  - Ajout de transporteurs (invitation)
  - Planification automatisée (RDV V1 + automatisations)
  - Gestion des grilles transporteurs
- Option Affret.IA: +200€/mois (addon `AFFRET_IA`)

Transporteur (TRANSPORTER)
- Invité par un industriel: gratuit sur les flux de cet industriel (les droits de l’industriel s’appliquent sur les commandes qui lui appartiennent).
- Self‑service avec mêmes fonctions qu’un industriel: 499€/mois (plan `TRANSPORTER_BASE`).
- Option Affret.IA: +200€/mois (addon `AFFRET_IA`).
- Accès aux offres des industriels utilisant Affret.IA (Premium marketplace): +200€/mois (addon `PREMIUM_MARKETPLACE`).

Implémentation
- `@rt/entitlements`
  - Plans: `INDUSTRY_BASE`, `TRANSPORTER_BASE`
  - Addons: `AFFRET_IA`, `PREMIUM_MARKETPLACE`
  - Features clés: `vigilance.module`, `carrier.add`, `planning.automation`, `pricing.grids`, `affretia.integration`, `marketplace.access`
  - Fonction contexte: `hasFeatureWithContext(actorOrg, feature, { ownerOrg, actorRelation })` appliquant les droits de l’industriel à un transporteur invité sur ses flux.
- `AuthZ`
  - Les organisations portent `plan` et `addons[]`.
  - Endpoint d’upgrade/downgrade: `POST /auth/orgs/:id/plan`.
- `Core Orders`
  - Les `orders` comportent `ownerOrgId`.
  - Les invitations industry→carrier sont chargées depuis `infra/seeds/invitations.json`.

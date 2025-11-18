# Module Palettes - Admin & Affret.IA - Guide rapide

## Démarrage rapide

### 1. Lancer les services

```bash
# Service Palette (port 3011)
cd services/palette
node src/server.js

# Service Affret.IA (port 3005)
cd services/affret-ia
node src/server.js

# Backoffice Admin (port 3000)
cd apps/backoffice-admin
pnpm dev
```

### 2. Accéder à l'interface admin

```
URL: http://localhost:3000/palettes
```

### 3. Tester les endpoints

```bash
# Optimiser une route
curl -X POST http://localhost:3005/affret/optimize-pallet-routes \
  -H "Content-Type: application/json" \
  -d '{"deliveries": [{"orderId": "ORD-001", "location": {"lat": 48.8566, "lng": 2.3522}, "pallets": 33, "address": "Paris", "companyId": "IND-1"}]}'

# Obtenir les alertes
curl http://localhost:3005/affret/pallet-alerts

# Devis avec palettes
curl http://localhost:3005/affret-ia/quote/ORD-123
```

---

## Nouveaux endpoints Affret.IA

### POST /affret/optimize-pallet-routes
Optimise l'ordre des livraisons avec retours palettes

### GET /affret/pallet-alerts
Détecte les sites saturés et entreprises avec dettes élevées

### GET /affret-ia/quote/:orderId (modifié)
Inclut maintenant le coût de retour palettes dans le devis

---

## Interface Backoffice Admin

### Onglets disponibles
1. **Dashboard** - KPIs et tops balances
2. **Chèques** - Liste des chèques (à venir)
3. **Ledgers** - Soldes entreprises + export CSV
4. **Sites** - Gestion quotas + export CSV
5. **Disputes** - Litiges
6. **Analytics** - Graphiques

---

## Documentation complète

- **Documentation technique** : `docs/MODULE_PALETTES_ADMIN_AFFRET.md`
- **Guide de tests** : `docs/TESTS_PALETTES_AFFRET.md`
- **Rapport final** : `docs/RAPPORT_FINAL_PALETTES.md`

---

## Support

Pour toute question : consulter la documentation complète dans `docs/`

# Module Bourse de Stockage - Documentation Complète

## Vue d'ensemble

Le **Module Bourse de Stockage** est un marché structuré et transparent qui connecte l'offre de capacités de stockage avec la demande des industriels. Il digitalise et accélère l'ensemble du processus, de la publication du besoin jusqu'à la contractualisation et au suivi opérationnel.

## Vision

Créer un **marché fluide et efficace** où :
- Les industriels trouvent rapidement des solutions de stockage adaptées
- Les logisticiens maximisent l'utilisation de leurs capacités
- L'IA optimise la mise en relation et le classement des offres
- Le suivi temps réel via WMS garantit la transparence opérationnelle

## Architecture Technique

### Service Backend

**Port**: 3013
**Technologies**: Node.js, HTTP natif
**Localisation**: `services/storage-market/src/server.js`

Le service gère :
- Publication et gestion des besoins de stockage
- Réception et classement intelligent des offres
- Contractualisation et suivi des missions
- Intégration WMS pour le suivi temps réel
- Administration et analytics

### Applications Web

#### web-industry (Next.js / App Router)
Interface pour les industriels donneurs d'ordre.

**Pages créées** :
- `/storage` - Dashboard principal
- `/storage/needs` - Liste des besoins publiés
- `/storage/needs/new` - Formulaire de publication
- `/storage/needs/[id]` - Détails d'un besoin
- `/storage/needs/[id]/offers` - Comparaison des offres avec IA ranking
- `/storage/contracts` - Liste des contrats actifs
- `/storage/contracts/[id]` - Suivi temps réel via WMS
- `/storage/analytics` - Statistiques et rapports

#### web-logistician (Next.js / Pages Router)
Interface pour les logisticiens abonnés et invités.

**Pages créées** :
- `/storage-market` - Vue bourse avec annonces
- `/storage-market/need/[id]` - Détails d'une annonce
- `/storage-market/offer-form/[id]` - Formulaire de soumission d'offre
- `/my-sites` - Gestion des sites logistiques
- `/my-sites/new` - Ajouter un site
- `/my-sites/[id]/edit` - Modifier les capacités
- `/my-contracts` - Missions de stockage actives
- `/my-contracts/[id]` - Détails + connexion WMS

#### backoffice-admin (Next.js / Pages Router)
Interface d'administration et supervision.

**Pages créées** :
- `/storage-market` - Dashboard admin global
- `/storage-market/needs` - Tous les besoins publiés
- `/storage-market/logisticians` - Gestion des abonnements
- `/storage-market/contracts` - Tous les contrats
- `/storage-market/analytics` - Analytics globaux

## Les 4 Acteurs de l'Écosystème

### 1. Industriel Donneur d'Ordre

**Rôle** : Publie ses besoins de stockage et sélectionne le meilleur prestataire

**Fonctionnalités** :
- Publication de besoins avec 3 modes (Bourse Globale, Référencés, Mixte)
- Réception automatique des offres
- Classement intelligent par IA des offres reçues
- Comparaison multicritère (prix, proximité, fiabilité, réactivité)
- Acceptation d'offre et contractualisation
- Suivi opérationnel temps réel via WMS
- Alertes intelligentes (fin de contrat, incidents, rupture de stock)
- Reporting automatisé

**Critères de publication** :
- Type : long terme, temporaire, picking, cross-dock, douane
- Volume : palettes, m², m³, mètres linéaires
- Durée : dates, flexibilité, reconduction
- Localisation : région, département, rayon km
- Contraintes : température, ADR, sécurité, certifications
- Infrastructure : quais, levage, matériel
- Budget indicatif

### 2. Logisticien Abonné

**Rôle** : Participe au marché global, reçoit les appels d'offres correspondants

**Fonctionnalités** :
- Vue bourse avec filtres avancés (distance, type, volume, budget)
- Déclaration des capacités logistiques par site
- Mise à jour dynamique des disponibilités
- Construction d'offres commerciales structurées
- Gestion des tarifs (mensuel, par mouvement, frais de mise en service)
- Suivi des missions actives
- Connexion API WMS pour synchronisation
- Facturation et rapports

**Informations site** :
- Adresse exacte et géolocalisation
- Capacité totale et disponible (m², palettes, m³)
- Types de stockage possibles
- Températures gérées
- Certifications (ISO 9001, IFS, ADR, douane)
- Infrastructure (hauteur, quais, équipements)
- Système WMS et API

### 3. Logisticien Invité

**Rôle** : Partenaire référencé d'un industriel spécifique

**Caractéristiques** :
- Visible uniquement pour les besoins de l'industriel partenaire
- Ne participe pas au marché ouvert
- Reçoit directement les demandes de son client
- Processus simplifié de réponse

### 4. Administrateur RT

**Rôle** : Supervise l'ensemble du marché et garantit le bon fonctionnement

**Fonctionnalités** :
- Validation des abonnements des nouveaux logisticiens
- Surveillance du respect des règles du marché
- Gestion des litiges
- Tableaux de bord analytiques globaux
- Statistiques : taux de conversion, prix moyens, zones actives
- Export de rapports

## Intelligence Artificielle - Classement des Offres

### Algorithme de Ranking

L'IA classe automatiquement les offres selon 4 critères pondérés (total 100 points) :

#### 1. Prix Total (40 points)
- Comparaison du coût global incluant tous les frais
- Pénalité si > 20% de la moyenne du marché
- Bonus si < moyenne

**Formule** :
```javascript
if (priceRatio <= 0.8) {
  score += 40 // Prix très compétitif
} else if (priceRatio <= 1.0) {
  score += 40 * (1.2 - priceRatio) / 0.2 // Prix avantageux
} else if (priceRatio <= 1.2) {
  score += 40 * (1.2 - priceRatio) / 0.2 // Dans la moyenne
}
```

#### 2. Proximité (25 points)
- Distance au site industriel via formule Haversine
- Score maximal si < 50km
- Dégressif jusqu'à 200km

**Formule Haversine** :
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
```

#### 3. Fiabilité (20 points)
- Score basé sur l'historique du logisticien
- Nombre de missions réussies
- Taux de litiges
- Évaluations clients

**Calcul** :
```javascript
score += (reliabilityScore / 100) * 20
```

#### 4. Réactivité (15 points)
- Rapidité de réponse à l'appel d'offres
- Disponibilité immédiate
- Flexibilité sur les dates

**Formule** :
```javascript
if (responseTimeHours <= 2) {
  score += 15 // Ultra-rapide
} else if (responseTimeHours <= 6) {
  score += 15 * (6 - responseTimeHours) / 4 // Rapide
}
```

### Recommandation IA

- **Top 3** offres mises en avant automatiquement
- Texte explicatif pour chaque recommandation
- Alerte si aucune offre satisfaisante
- Suggestions d'optimisation

## Intégration WMS

### Connexion API

Le module permet la connexion au système WMS du logisticien pour un suivi temps réel.

**Endpoints WMS** :
```
POST /storage-market/wms/connect
GET  /storage-market/wms/inventory/:contractId
GET  /storage-market/wms/movements/:contractId
```

### Données synchronisées

**Inventaire** :
- SKU et quantités
- Emplacements précis
- Dernière mise à jour

**Mouvements** :
- Entrées et sorties en temps réel
- Références des bons de livraison
- Horodatage précis

**Alertes** :
- Stock critique ou rupture imminente
- Avaries ou incidents qualité
- Dépassement de capacité planifiée
- Fin de contrat approchant

## Sécurité et Conformité

### Authentification et Autorisation

- Authentification par rôle (Industriel, Logisticien, Admin)
- Gestion fine des permissions via package `@rt/security`
- Isolation stricte des données par organisation

### Chiffrement

- **TLS 1.3** pour toutes les communications API
- Protection maximale des données sensibles
- Tokens JWT pour l'authentification

### RGPD Compliant

- Stockage sécurisé des données personnelles
- Traçabilité complète des accès
- Droit à l'oubli implémenté
- Consentement explicite pour le traitement

### Rate Limiting

- 240 requêtes par minute par IP
- Protection contre les abus
- Limites spécifiques par endpoint

## Roadmap de Déploiement

### Phase 1 : Fondations (3 semaines)
- [x] Service backend complet (port 3013)
- [x] Publication des besoins de stockage
- [x] Interface de bourse simplifiée
- [x] Réponses manuelles des logisticiens
- [x] Seeds de données

### Phase 2 : Intelligence (4 semaines)
- [x] Déclaration des capacités logistiques
- [x] Classement automatique par IA
- [x] Matching intelligent des offres
- [x] Top 3 recommandations

### Phase 3 : Intégration (3 semaines)
- [x] Connexion WMS via API
- [x] Suivi en temps réel avancé
- [x] Notifications intelligentes
- [ ] Alertes automatiques (à finaliser)

### Phase 4 : Production (2 semaines)
- [ ] Tests de charge
- [ ] Migration MongoDB
- [ ] Déploiement infrastructure
- [ ] Formation utilisateurs

**Total** : 12 semaines

## Métriques de Succès

### KPIs Opérationnels

- **Taux de conversion** : % de besoins aboutissant à un contrat (objectif > 50%)
- **Temps moyen de réponse** : Délai entre publication et première offre (objectif < 4h)
- **Nombre d'offres/besoin** : Indicateur d'attractivité (objectif > 3)
- **Taux d'occupation** : % d'utilisation des capacités déclarées (objectif > 75%)

### KPIs Financiers

- **Volume de transactions** : Montant total des contrats conclus
- **Prix moyen/m²** : Indicateur de marché par région
- **Économies générées** : Via l'optimisation IA

### KPIs Qualité

- **Score de satisfaction** : Évaluations industriels et logisticiens
- **Taux d'incidents** : Problèmes signalés / contrats actifs (objectif < 5%)
- **Renouvellement** : % de contrats renouvelés (objectif > 60%)

## Support et Maintenance

### Logs et Monitoring

Le service génère des logs structurés pour tous les événements :
- `[event] order.created` - Nouveau besoin publié
- `[event] offer.submitted` - Offre soumise
- `[event] contract.created` - Contrat créé
- `[storage-market] Mongo loaded` - Données chargées

### Troubleshooting

**Le service ne démarre pas** :
- Vérifier le port 3013 est libre
- Vérifier les variables d'environnement
- Consulter les logs de démarrage

**Les offres ne s'affichent pas** :
- Vérifier la connexion à MongoDB
- Vérifier les seeds sont chargées
- Consulter les logs du navigateur

**WMS non connecté** :
- Vérifier l'URL du WMS logisticien
- Vérifier les credentials API
- Tester la connectivité réseau

## Conclusion

Le Module Bourse de Stockage transforme radicalement la façon dont les industriels et logisticiens collaborent. En digitalisant l'ensemble du processus et en y ajoutant l'intelligence artificielle, il :

- **Réduit les délais** de recherche et contractualisation
- **Optimise les coûts** via la mise en concurrence transparente
- **Améliore la qualité** grâce au suivi temps réel
- **Maximise l'utilisation** des capacités logistiques disponibles

C'est un **win-win** pour tous les acteurs de l'écosystème logistique.

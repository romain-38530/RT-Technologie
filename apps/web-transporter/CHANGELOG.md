# Changelog - Web Transporter

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [0.1.0] - 2025-11-17

### Ajouté

#### Pages principales
- Page d'accueil avec dashboard et statistiques
- Page de connexion avec sélection de transporteur (mode démo)
- Page missions en attente avec countdown SLA
- Page missions acceptées avec actions RDV
- Page planning avec vue calendrier hebdomadaire
- Page documents avec upload CMR/Photos/POD
- Page profil avec infos transporteur et stats

#### Composants UI
- Layout responsive avec navigation desktop/mobile
- MissionCard avec timer temps réel et badges de statut
- Composants réutilisables (Button, Card, Badge)
- Navigation adaptative (sidebar desktop, bottom nav mobile)

#### Services & API
- Client API pour core-orders, planning, ecpmr
- Gestion authentification JWT avec localStorage
- Fonctions utilitaires (formatage dates, calcul SLA)
- Rewrites Next.js pour proxy API

#### Configuration
- Next.js 14 avec App Router
- TypeScript avec configuration stricte
- TailwindCSS avec design system
- Variables d'environnement pour URLs backend

#### Documentation
- README complet avec guide d'utilisation
- DEVELOPMENT.md pour les développeurs
- API.md avec documentation des endpoints
- Exemples de code et cURL

### Fonctionnalités

#### Gestion des missions
- Visualisation missions en attente avec SLA
- Acceptation/refus de missions
- Rafraîchissement automatique toutes les 30s
- Affichage détails (origine, destination, palettes, poids)

#### Planning
- Vue calendrier sur 7 jours
- Créneaux RDV disponibles/occupés
- Navigation semaines précédente/suivante
- Proposition de créneaux pour missions acceptées

#### Documents
- Upload CMR (PDF ou image)
- Upload photos de livraison
- Upload preuve de livraison (POD)
- Liste des documents par mission
- Stockage S3 via service ecpmr

#### Profil & Stats
- Informations transporteur
- Statut vigilance avec badge coloré
- Statistiques de performance (missions, taux acceptation, scoring)
- Historique récent des missions

#### Mobile-first
- Navigation responsive
- Touch-friendly buttons
- Optimisation tailles polices
- Grille adaptative
- Planning scrollable horizontalement

### Technique

#### Architecture
- Monorepo structure (apps/web-transporter)
- TypeScript strict mode
- App Router Next.js 14
- Components modulaires et réutilisables

#### Performance
- Code splitting automatique
- Tree shaking
- CSS purging
- Image optimization ready

#### Sécurité
- JWT authentication
- Token expiration check
- Secure headers ready
- Rate limiting backend

### Notes
- Version initiale de l'application
- Mode démo avec JWT factice côté client
- À connecter avec l'API d'authentification réelle en production
- Services backend doivent être lancés séparément

### À venir (v0.2.0)
- [ ] Notifications push pour nouvelles missions
- [ ] Mode offline avec cache
- [ ] Tests unitaires et E2E
- [ ] Signature électronique CMR
- [ ] Chat avec industriel
- [ ] Géolocalisation temps réel

---

## Format des versions

- **MAJOR** : Changements incompatibles de l'API
- **MINOR** : Ajout de fonctionnalités rétro-compatibles
- **PATCH** : Corrections de bugs rétro-compatibles

## Types de changements

- `Ajouté` : nouvelles fonctionnalités
- `Modifié` : changements de fonctionnalités existantes
- `Déprécié` : fonctionnalités bientôt supprimées
- `Supprimé` : fonctionnalités supprimées
- `Corrigé` : corrections de bugs
- `Sécurité` : vulnérabilités corrigées

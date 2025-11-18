# Quick Start - RT Driver

Guide rapide pour démarrer avec l'application RT Driver en 5 minutes.

## Pour les développeurs

### 1. Démarrer la PWA (2 minutes)

```bash
# Naviguer vers le projet PWA
cd apps/mobile-driver/pwa

# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Lancer le serveur de développement
pnpm dev
```

L'application sera disponible sur : **http://localhost:3110**

### 2. Tester l'application

#### Option A : Conducteur Salarié

1. Ouvrir http://localhost:3110
2. Cliquer sur "Se connecter"
3. Entrer n'importe quel email et mot de passe (mode dev)
4. Accéder au tableau de bord

#### Option B : Conducteur Sous-traitant

1. Ouvrir http://localhost:3110
2. Cliquer sur "Scanner un code QR mission"
3. Cliquer sur "Saisir le code manuellement"
4. Entrer : `TEST-123-ABC`
5. Remplir les informations et démarrer

### 3. Tester les fonctionnalités

| Fonctionnalité | URL |
|----------------|-----|
| Login | http://localhost:3110/auth/login |
| QR Scan | http://localhost:3110/auth/qr-scan |
| Dashboard | http://localhost:3110/mission/dashboard |
| Tracking GPS | http://localhost:3110/mission/tracking |
| Signature | http://localhost:3110/mission/signature |
| Documents | http://localhost:3110/mission/documents |

### 4. Simuler le GPS

Ouvrir Chrome DevTools :
1. Appuyer sur `F12`
2. Aller dans "Console"
3. Cliquer sur les 3 points `⋮` > More tools > Sensors
4. Activer "Location" et choisir une ville ou coordonnées custom

### 5. Tester le mode offline

1. Ouvrir Chrome DevTools (`F12`)
2. Onglet "Network"
3. Cocher "Offline"
4. Continuer à utiliser l'app normalement
5. Les données seront synchronisées au retour du réseau

## Pour les testeurs

### Installer la PWA sur mobile

#### Android (Chrome)

1. Ouvrir https://driver.rt.com (une fois déployé)
2. Menu `⋮` > "Installer l'application"
3. Accepter
4. L'icône apparaît sur l'écran d'accueil

#### iOS (Safari)

1. Ouvrir https://driver.rt.com
2. Partager > "Sur l'écran d'accueil"
3. Ajouter
4. L'icône apparaît sur l'écran d'accueil

### Premier lancement

1. **Autoriser la localisation** : Toujours autoriser pour le tracking background
2. **Autoriser les notifications** : Recommandé pour les alertes
3. **Autoriser la caméra** : Nécessaire pour QR scan et photos

### Scénario de test complet

1. **Scanner le QR code** fourni par le logisticien
   - OU entrer le code mission manuellement

2. **Remplir vos informations**
   - Nom complet
   - Téléphone
   - Immatriculation véhicule
   - Immatriculation remorque (optionnel)

3. **Démarrer la mission**
   - Le GPS se lance automatiquement
   - L'ETA est calculé

4. **Suivre la navigation**
   - Cliquer "Ouvrir navigation"
   - Choisir Google Maps ou Waze

5. **À l'arrivée au chargement**
   - L'app détecte automatiquement (200m)
   - Statut passe à "Arrivé au chargement"

6. **Signer au chargement**
   - Cliquer "Signature chargement"
   - Entrer le nom du responsable
   - Demander la signature tactile
   - Valider

7. **Marquer comme chargé**
   - Cliquer "Marquer comme chargé"
   - Départ automatique vers la livraison

8. **En route vers la livraison**
   - Le GPS continue
   - L'ETA se met à jour

9. **À l'arrivée livraison**
   - Détection automatique
   - Cliquer "Signature livraison"
   - Présenter le QR code au destinataire
   - OU faire signer directement

10. **Prendre des photos**
    - Cliquer "Documents"
    - Choisir le type (BL, CMR, etc.)
    - Photographier
    - Valider

11. **Marquer comme livré**
    - Cliquer "Marquer comme livré"
    - Mission terminée !

## Pour les admins système

### Variables d'environnement production

```bash
# .env.production
NEXT_PUBLIC_CORE_ORDERS_API=https://api.rt.com/orders
NEXT_PUBLIC_PLANNING_API=https://api.rt.com/planning
NEXT_PUBLIC_ECMR_API=https://api.rt.com/ecmr
NEXT_PUBLIC_NOTIFICATIONS_API=https://api.rt.com/notifications
NEXT_PUBLIC_TOMTOM_API_KEY=your_production_key
```

### Déploiement Vercel (1 commande)

```bash
# Depuis le dossier pwa/
vercel --prod
```

### Monitoring

- **Logs** : https://vercel.com/rt-technologie/rt-driver/logs
- **Analytics** : https://vercel.com/rt-technologie/rt-driver/analytics
- **Performance** : https://pagespeed.web.dev/

## Codes de test

Pour les tests en développement :

```
Codes mission :
- TEST-123-ABC
- DEV-456-XYZ
- DEMO-789-QRS

Login salarié (dev) :
- Email : n'importe quel email
- Password : n'importe quel mot de passe
```

## Raccourcis clavier (PWA sur desktop)

| Raccourci | Action |
|-----------|--------|
| `G` puis `D` | Aller au Dashboard |
| `G` puis `T` | Aller au Tracking |
| `G` puis `S` | Aller aux Signatures |
| `G` puis `C` | Aller aux Documents |
| `?` | Aide |
| `Échap` | Retour |

## FAQ Rapide

**Q: L'app ne détecte pas ma position GPS**
A: Vérifier les permissions de localisation dans les paramètres du téléphone

**Q: Le mode offline ne fonctionne pas**
A: Vérifier que le Service Worker est activé (DevTools > Application > Service Workers)

**Q: Les photos sont floues**
A: Nettoyer l'objectif, assurer un bon éclairage, tenir le téléphone stable

**Q: Le QR code ne se scanne pas**
A: Vérifier les permissions caméra, assurer un bon éclairage, cadrer correctement

**Q: Comment se déconnecter ?**
A: Dashboard > Icône de déconnexion en haut à droite

## Liens utiles

- **Documentation complète** : `/docs/`
- **Architecture** : `/docs/ARCHITECTURE_MOBILE.md`
- **Guide utilisateur** : `/docs/USER_GUIDE_DRIVER.md`
- **API** : `/docs/API_INTEGRATION.md`
- **Déploiement** : `/docs/DEPLOYMENT.md`
- **Rapport final** : `/RAPPORT_FINAL_MOBILE_DRIVER.md`

## Support

- **Email** : support@rt-technologie.fr
- **Téléphone** : +33 1 23 45 67 89
- **Horaires** : 7h - 20h, 7j/7

## Checklist avant production

- [ ] Backend API configurée
- [ ] TomTom API key production
- [ ] SSL/HTTPS activé
- [ ] Variables d'environnement production
- [ ] Tests end-to-end passés
- [ ] Beta testing effectué
- [ ] Monitoring configuré (Sentry)
- [ ] Analytics activées
- [ ] Documentation à jour
- [ ] Formation conducteurs planifiée

---

**C'est tout ! Vous êtes prêt à utiliser RT Driver.**

Pour aller plus loin, consultez la documentation complète dans `/docs/`.

# 🔄 Comparaison : Développement Local vs Docker

## Tableau comparatif

| Critère | 💻 Développement Local<br>(`pnpm dev`) | 🐳 Docker<br>(`./docker-run.sh`) |
|---------|----------------------------------------|----------------------------------|
| **Ce qui démarre** | ✅ Apps frontend UNIQUEMENT<br>(backoffice-admin, web-industry, etc.) | ✅ TOUT<br>Frontend + Backend + Services |
| **Services backend** | ❌ Non démarrés | ✅ Tous démarrés (3002-3020) |
| **Appels API** | ❌ Échouent (backend absent) | ✅ Fonctionnent |
| **MongoDB requis** | ❌ Non | ✅ Oui (via URI dans .env) |
| **Installation** | ⚡ `pnpm install` (2-3 min) | 🐌 Build Docker (10-15 min) |
| **Temps de démarrage** | ⚡ 5-10 secondes | 🐌 30-60 secondes |
| **Utilisation RAM** | 💚 Faible (500MB-1GB) | 🔴 Élevée (2-4GB) |
| **Hot reload** | ⚡ Instantané | 🐌 Plus lent |
| **Modification code** | ✅ Immédiate | ⚠️ Peut nécessiter rebuild |
| **Idéal pour** | 🎨 Dev UI/UX, corrections visuelles | 🔧 Tests complets, intégration |
| **Problèmes ports** | ⚠️ Possibles (si service local actif) | ⚠️ Possibles (même raison) |
| **Complexité** | ✅ Simple | ⚠️ Plus complexe |

## 📋 Qu'est-ce que Docker va démarrer ?

Le script `docker-run.sh` lance **TOUT** dans un seul conteneur :

### Frontend (Apps Next.js)
```
Port 3000 → backoffice-admin
Port 3001 → web-industry
Port 3010 → web-transporter
Port 3020 → web-logistician
Port 3030 → web-forwarder
Port 3040 → web-recipient
Port 3050 → web-supplier
```

### Backend (Services)
```
Port 3002 → service-notifications
Port 3004 → service-planning
Port 3007 → service-authz (authentification)
Port 3008 → service-admin-gateway
Port 3011 → service-palette
Port 3013 → service-storage-market
... et tous les autres services
```

### Commande Docker
Le Dockerfile exécute : `pnpm dev`

Cela lance **TOUS** les services et apps définis dans `turbo.json` simultanément.

## ⚠️ Problème que vous avez rencontré

```
Error: listen EADDRINUSE: address already in use :::3008
```

**Cause** : Un processus utilisait déjà le port 3008.

**Même problème avec Docker ?**
🔴 **OUI** - Le problème sera IDENTIQUE si :
- Un service tourne déjà en local sur le port 3008
- Un ancien conteneur Docker n'a pas été arrêté
- Un autre processus écoute sur ce port

## ✅ Quand utiliser CHAQUE approche ?

### 💻 Développement Local (Recommandé pour vous)

**À utiliser si vous voulez :**
- ✅ Développer l'interface rapidement
- ✅ Corriger des bugs visuels
- ✅ Tester les composants UI
- ✅ Modifier les styles CSS
- ✅ Travailler sur une seule app à la fois
- ✅ Éviter la complexité Docker

**Commande :**
```bash
cd apps/backoffice-admin
pnpm dev
```

**Avantages :**
- ⚡ Très rapide
- 💚 Léger en ressources
- 🔄 Hot reload instantané
- 🎯 Focus sur une app

### 🐳 Docker (Pour tests complets)

**À utiliser si vous voulez :**
- ✅ Tester les appels API
- ✅ Tester l'intégration complète
- ✅ Simuler la production
- ✅ Tester plusieurs services ensemble
- ✅ Vérifier l'authentification
- ✅ Tester avec MongoDB

**Commande :**
```bash
./docker-run.sh
```

**Prérequis :**
- ✅ Docker installé et démarré
- ✅ MongoDB configuré (URI dans .env)
- ✅ Tous les services configurés
- ✅ Ports 3000-3020 libres

## 🔧 Solution pour Docker si port occupé

Si vous voulez utiliser Docker malgré tout :

### 1. Arrêter tous les processus qui utilisent les ports

**Windows PowerShell (Administrateur) :**
```powershell
# Trouver et tuer tous les processus Node.js
taskkill /IM node.exe /F

# Ou pour un port spécifique
netstat -ano | findstr :3008
taskkill /PID <PID> /F
```

### 2. Arrêter les anciens conteneurs Docker

```bash
# Arrêter tous les conteneurs
docker stop $(docker ps -aq)

# Supprimer tous les conteneurs arrêtés
docker rm $(docker ps -aq)

# Ou juste celui de RT-Technologie
docker stop rt-technologie-container
docker rm rt-technologie-container
```

### 3. Relancer Docker

```bash
./docker-run.sh
```

## 💡 Ma Recommandation

Pour **visualiser vos apps frontend** comme vous l'avez demandé :

### ✅ Utilisez le Développement Local

**Pourquoi ?**
1. ⚡ **Plus rapide** - Démarrage en 5 secondes
2. 🎯 **Plus simple** - Pas besoin de Docker/MongoDB
3. 💚 **Plus léger** - Consomme moins de RAM
4. 🎨 **Parfait pour l'UI** - Vous verrez tout l'interface
5. 🔄 **Hot reload** - Modifications instantanées

**Comment ?**
```bash
# 1. Installer (une seule fois)
pnpm install

# 2. Démarrer l'app
cd apps/backoffice-admin
pnpm dev

# 3. Ouvrir
http://localhost:3000
```

### ⚠️ Utilisez Docker SEULEMENT si :

- Vous avez besoin de tester les API
- Vous voulez tester l'authentification
- Vous développez sur les services backend
- Vous voulez une démo complète

## 🎯 Réponse à votre question

> "Si je veux la même chose en exécutant docker-run, vais-je avoir le même résultat ?"

**Non, pas le même résultat :**

| Aspect | Dev Local | Docker |
|--------|-----------|--------|
| Interface visible | ✅ Oui | ✅ Oui |
| API fonctionnelles | ❌ Non | ✅ Oui |
| Authentification | ❌ Non | ✅ Oui |
| Base de données | ❌ Non | ✅ Oui |
| Rapidité | ⚡⚡⚡ | 🐌 |
| Complexité | Simple | Complexe |

**Mais le problème de port sera LE MÊME** si un processus utilise déjà le port 3008 !

## 📝 Conclusion

Pour **visualiser vos apps frontend** :
👉 **Utilisez le développement local** (`pnpm dev`)

C'est :
- Plus rapide ⚡
- Plus simple 🎯
- Suffisant pour le dev UI 🎨
- Ce que je vous ai configuré ✅

---

**Besoin d'aide pour démarrer ?**
Consultez `INSTRUCTIONS_DEMARRAGE.txt` ! 🚀

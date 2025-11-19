# 🔧 Résolution des Problèmes de Ports pour Docker

## ❌ Erreur rencontrée

```
Error: listen EADDRINUSE: address already in use :::3008
```

Cette erreur signifie que le **port 3008 est déjà utilisé** par un autre processus.

## 🎯 Solutions par ordre de simplicité

### Solution 1 : Arrêter tous les processus Node.js (Recommandé)

**Windows PowerShell (Administrateur) :**

```powershell
# Arrêter tous les processus Node.js
taskkill /IM node.exe /F
```

✅ **Avantage** : Simple, rapide, nettoie tout
⚠️ **Inconvénient** : Ferme TOUS les processus Node.js (VSCode, etc.)

---

### Solution 2 : Arrêter seulement le port 3008

**Windows PowerShell (Administrateur) :**

```powershell
# 1. Trouver le PID du processus sur le port 3008
netstat -ano | findstr :3008

# Résultat attendu :
# TCP    0.0.0.0:3008    0.0.0.0:0    LISTENING    12345
#                                                    ^^^^^ (c'est le PID)

# 2. Tuer le processus
taskkill /PID 12345 /F
```

✅ **Avantage** : Ne touche qu'au port problématique
⚠️ **Inconvénient** : À répéter pour chaque port occupé

---

### Solution 3 : Arrêter TOUS les ports utilisés (3000-3020)

**Script PowerShell automatique :**

Créez un fichier `kill-ports.ps1` :

```powershell
# Script pour libérer tous les ports RT-Technologie
$ports = 3000..3020

Write-Host "Liberation des ports 3000-3020..." -ForegroundColor Cyan

foreach ($port in $ports) {
    $connections = netstat -ano | findstr ":$port"
    if ($connections) {
        Write-Host "Port $port occupe, liberation..." -ForegroundColor Yellow
        $connections | ForEach-Object {
            $pid = $_.Split(' ')[-1]
            if ($pid -match '^\d+$') {
                try {
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "  - Process $pid arrete" -ForegroundColor Green
                } catch {
                    Write-Host "  - Impossible d'arreter $pid" -ForegroundColor Red
                }
            }
        }
    }
}

Write-Host "Termine!" -ForegroundColor Green
```

**Exécution :**
```powershell
# En PowerShell (Administrateur)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\kill-ports.ps1
```

---

### Solution 4 : Nettoyer Docker

**Arrêter et supprimer tous les conteneurs Docker :**

```bash
# Arrêter tous les conteneurs
docker stop $(docker ps -aq)

# Supprimer tous les conteneurs
docker rm $(docker ps -aq)

# Ou spécifiquement RT-Technologie
docker stop rt-technologie-container
docker rm rt-technologie-container
```

---

### Solution 5 : Modifier les ports Docker

Si vous voulez éviter les conflits, modifiez `docker-run.sh` :

**Avant :**
```bash
-p 3008:3008 \
```

**Après :**
```bash
-p 4008:3008 \  # Port externe 4008 → interne 3008
```

Puis dans `.env` :
```env
NEXT_PUBLIC_ADMIN_GATEWAY_URL=http://localhost:4008
```

⚠️ **Inconvénient** : Vous devrez changer tous les ports utilisés

---

## 🚀 Procédure Complète pour Démarrer Docker

### Étape 1 : Nettoyer l'environnement

```powershell
# PowerShell (Administrateur)

# A. Arrêter tous les Node.js
taskkill /IM node.exe /F

# B. Arrêter les conteneurs Docker
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
```

### Étape 2 : Vérifier que les ports sont libres

```powershell
# Vérifier que le port 3008 est libre
netstat -ano | findstr :3008

# Si rien ne s'affiche → OK ✅
# Si quelque chose s'affiche → Refaire l'étape 1
```

### Étape 3 : Vérifier le fichier .env

```bash
# Le fichier .env DOIT exister
cat .env

# Il doit contenir au minimum :
# MONGODB_URI=mongodb+srv://...
# AUTHZ_JWT_SECRET=...
# INTERNAL_SERVICE_TOKEN=...
```

### Étape 4 : Lancer Docker

**Sur Windows Git Bash :**
```bash
bash docker-run.sh
```

**Sur Linux/Mac :**
```bash
./docker-run.sh
```

### Étape 5 : Vérifier les logs

```bash
# Voir les logs en temps réel
docker logs -f rt-technologie-container

# Vérifier que tous les services démarrent
# Vous devriez voir des messages comme :
# [admin-gateway] HTTP prêt sur :3008
# [authz] HTTP prêt sur :3007
# etc.
```

### Étape 6 : Tester

Ouvrez dans le navigateur :
- http://localhost:3000 → Backoffice Admin
- http://localhost:3001 → Web Industry
- http://localhost:3010 → Web Transporter

---

## 🆘 Dépannage

### Problème : "Cannot connect to MongoDB"

**Cause :** MongoDB URI incorrect dans `.env`

**Solution :**
```env
# .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

---

### Problème : "Unauthorized" ou "JWT invalid"

**Cause :** Secrets manquants

**Solution :**
```env
# .env
AUTHZ_JWT_SECRET=mon-secret-super-fort-123
INTERNAL_SERVICE_TOKEN=mon-token-interne-456
```

---

### Problème : Docker build échoue

**Cause :** Cache Docker corrompu

**Solution :**
```bash
# Rebuild complet sans cache
docker build --no-cache -t rt-technologie:latest .
```

---

### Problème : Services ne démarrent pas tous

**Cause :** Erreurs dans le code ou dépendances manquantes

**Solution :**
```bash
# Entrer dans le conteneur
docker exec -it rt-technologie-container bash

# Vérifier les erreurs
cd services/admin-gateway
node src/server.js

# Installer les dépendances manquantes si besoin
pnpm install
```

---

## 💡 Mon Conseil Final

Si vous voulez juste **visualiser les apps frontend** :

👉 **N'utilisez PAS Docker** - C'est trop complexe pour votre besoin

👉 **Utilisez le dev local** :
```bash
pnpm install
cd apps/backoffice-admin
pnpm dev
```

C'est :
- ✅ 10x plus rapide
- ✅ 100x plus simple
- ✅ Suffisant pour voir l'interface

**Docker est utile pour :**
- ✅ Tester l'authentification
- ✅ Tester les API
- ✅ Faire une démo complète
- ✅ Simuler la production

Mais **PAS** pour juste visualiser l'interface ! 🎯

---

**Consultez :** `COMPARAISON_DEV_DOCKER.md` pour plus de détails.

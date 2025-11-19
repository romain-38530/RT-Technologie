# 🚀 Démarrage Rapide - Mode Développement

Guide simplifié pour démarrer vos applications frontend en **5 minutes** sans Docker.

## ✅ Étape 1 : Vérifier les prérequis

Ouvrez un terminal et vérifiez :

```bash
node --version
# Doit afficher v18.x.x ou supérieur
```

Si Node.js n'est pas installé :
👉 **Téléchargez-le sur : https://nodejs.org/**

## ✅ Étape 2 : Installer pnpm (si nécessaire)

```bash
npm install -g pnpm
```

## ✅ Étape 3 : Installer les dépendances

À la **racine du projet** (là où se trouve ce fichier) :

```bash
pnpm install
```

⏱️ Cette commande peut prendre 2-3 minutes la première fois.

## ✅ Étape 4 : Démarrer l'application

### 🎯 Option A : Script automatique (Windows)

Double-cliquez sur le fichier **`start-dev.bat`** et choisissez l'application à démarrer.

### 🎯 Option B : Ligne de commande

#### Pour le backoffice-admin :

```bash
cd apps/backoffice-admin
pnpm dev
```

Puis ouvrez : **http://localhost:3000**

#### Pour Web Industry :

```bash
cd apps/web-industry
pnpm dev
```

Puis ouvrez : **http://localhost:3001**

#### Pour Web Transporter :

```bash
cd apps/web-transporter
pnpm dev
```

Puis ouvrez : **http://localhost:3010**

## 📱 Applications disponibles

| Application | Commande | URL |
|-------------|----------|-----|
| **Backoffice Admin** | `cd apps/backoffice-admin && pnpm dev` | http://localhost:3000 |
| **Web Industry** | `cd apps/web-industry && pnpm dev` | http://localhost:3001 |
| **Web Transporter** | `cd apps/web-transporter && pnpm dev` | http://localhost:3010 |
| **Web Logistician** | `cd apps/web-logistician && pnpm dev` | http://localhost:3020 |
| **Web Forwarder** | `cd apps/web-forwarder && pnpm dev` | http://localhost:3030 |
| **Web Recipient** | `cd apps/web-recipient && pnpm dev` | http://localhost:3040 |
| **Web Supplier** | `cd apps/web-supplier && pnpm dev` | http://localhost:3050 |

## ⚠️ Note importante

Les applications frontend démarreront **SANS les services backend**. Cela signifie :

✅ **Vous verrez** :
- L'interface complète
- Les composants UI
- La navigation entre pages
- Le design et les styles

❌ **Les appels API échoueront** :
- Pas de connexion/authentification
- Pas de données depuis MongoDB
- Les formulaires ne sauvegarderont pas

C'est **parfait pour** :
- Développer l'interface
- Tester le design
- Corriger les bugs UI
- Visualiser les pages

## 🔧 Problèmes courants

### "Port déjà utilisé"

**Windows PowerShell (Administrateur)** :
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Module not found"

```bash
# Supprimer et réinstaller
rm -rf node_modules
pnpm install
```

### Erreur de compilation

```bash
# Vérifier les erreurs TypeScript
cd apps/backoffice-admin
pnpm tsc --noEmit
```

## 🎓 Pour aller plus loin

📖 Consultez **`SETUP_DEV_LOCAL.md`** pour :
- Configuration complète avec backend
- Démarrage des services
- Configuration MongoDB
- Mode production

## 📞 Besoin d'aide ?

1. Vérifiez les fichiers de logs dans le terminal
2. Consultez la documentation dans `/docs`
3. Contactez l'équipe de développement

---

**Bon développement ! 🚀**

# Guide : Récupérer les identifiants MongoDB Atlas

## 🔍 Où trouver votre Username et Password MongoDB Atlas

### Option 1 : Si vous avez déjà créé un utilisateur de base de données

1. **Connectez-vous à MongoDB Atlas** : https://cloud.mongodb.com
2. **Sélectionnez votre projet** (en haut à gauche)
3. **Cliquez sur "Database Access"** (dans le menu de gauche, section SECURITY)
4. Vous verrez la liste de vos utilisateurs de base de données
5. Le **username** est visible dans la colonne "Username"
6. Le **password** n'est PAS visible (pour des raisons de sécurité)

#### Si vous avez oublié le password :
- Cliquez sur **"EDIT"** à côté de l'utilisateur
- Cliquez sur **"Edit Password"**
- Générez un nouveau mot de passe ou entrez-en un manuellement
- **IMPORTANT** : Copiez et sauvegardez ce mot de passe immédiatement !

---

### Option 2 : Si vous n'avez PAS encore créé d'utilisateur de base de données

#### Créer un nouvel utilisateur :

1. **Allez dans "Database Access"** (menu de gauche, section SECURITY)
2. Cliquez sur **"+ ADD NEW DATABASE USER"** (bouton vert en haut à droite)
3. Choisissez **"Password"** comme méthode d'authentification
4. **Entrez un Username** (exemple : `rt_app_user`)
5. **Entrez un Password** (ou cliquez sur "Autogenerate Secure Password")
   - ⚠️ **IMPORTANT** : Sauvegardez ce mot de passe immédiatement !
   - Évitez les caractères spéciaux comme `@`, `:`, `/` qui peuvent poser problème dans l'URI
6. **Database User Privileges** : Sélectionnez **"Read and write to any database"**
7. Cliquez sur **"Add User"**

---

## 🌐 Configurer l'accès réseau (IMPORTANT)

MongoDB Atlas bloque tous les accès par défaut. Vous devez autoriser votre IP :

1. **Allez dans "Network Access"** (menu de gauche, section SECURITY)
2. Cliquez sur **"+ ADD IP ADDRESS"**
3. Deux options :
   - **"Add Current IP Address"** : Autoriser uniquement votre IP actuelle
   - **"Allow Access from Anywhere"** : `0.0.0.0/0` (pratique pour dev, mais moins sécurisé)
4. Cliquez sur **"Confirm"**
5. Attendez quelques secondes que les règles soient appliquées

---

## 🔗 Récupérer votre URI de connexion

Une fois l'utilisateur créé et l'accès réseau configuré :

1. **Retournez dans "Database"** (menu de gauche)
2. Cliquez sur **"Connect"** sur votre cluster
3. Choisissez **"Connect your application"**
4. Sélectionnez :
   - **Driver** : Node.js
   - **Version** : 5.5 or later
5. **Copiez l'URI de connexion** :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Remplacez** :
   - `<username>` par votre username
   - `<password>` par votre mot de passe
   - Ajoutez `/rt-technologie` après `.net` pour spécifier la base de données

**Exemple final :**
```
mongodb+srv://rt_app_user:MonMotDePasse123@cluster0.abcd1.mongodb.net/rt-technologie?retryWrites=true&w=majority
```

---

## ⚠️ Points importants

### Caractères spéciaux dans le mot de passe
Si votre mot de passe contient des caractères spéciaux, vous devez les encoder :
- `@` devient `%40`
- `:` devient `%3A`
- `/` devient `%2F`
- `#` devient `%23`

**Outil en ligne** : https://www.urlencoder.org/

### Vérifier la version MongoDB
Assurez-vous que votre cluster MongoDB Atlas est en version 5.0+ (idéalement 7.0+)

---

## 📝 Checklist avant de continuer

- ✅ Utilisateur de base de données créé avec username et password
- ✅ Accès réseau configuré (IP autorisée)
- ✅ URI de connexion copiée et modifiée avec vos identifiants
- ✅ Nom de la base de données ajouté à l'URI (`/rt-technologie`)

---

## 🚀 Prochaine étape

Une fois que vous avez votre URI complète, revenez dans le chat et fournissez-la moi.

**Format attendu :**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rt-technologie?retryWrites=true&w=majority
```

Je pourrai alors :
1. Créer votre fichier `.env`
2. Exécuter les scripts de migration
3. Charger les données initiales
4. Vérifier que tout fonctionne

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :
- Vérifiez que l'accès réseau est bien configuré
- Vérifiez que le username/password sont corrects
- Vérifiez que le mot de passe ne contient pas de caractères spéciaux non encodés
- Assurez-vous que le cluster est bien démarré (pas en pause)

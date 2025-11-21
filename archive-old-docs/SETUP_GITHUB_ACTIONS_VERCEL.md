# 🎨 Configuration GitHub Actions - Gestion Vercel Autonome

Cette configuration permet à GitHub Actions de gérer **automatiquement et en permanence** vos déploiements Vercel.

---

## ✅ **Ce que ça permet**

Une fois configuré, GitHub Actions pourra **automatiquement** :
- ✅ Détecter les applications modifiées dans `apps/**`
- ✅ Builder les applications avec PNPM (monorepo)
- ✅ Déployer automatiquement sur Vercel en production
- ✅ Redéployer toutes les apps si `packages/**` est modifié
- ✅ Déployer manuellement une app spécifique
- ✅ **Tout gérer sans votre intervention**

---

## 📋 **Configuration (10 minutes)**

### **Étape 1 : Obtenir le Token Vercel**

1. Connectez-vous sur Vercel : https://vercel.com/account/tokens

2. Cliquez sur **"Create Token"**

3. Donnez un nom au token : `github-actions-deployer`

4. Sélectionnez le scope : **Full Account**

5. Cliquez sur **"Create"**

6. **⚠️ IMPORTANT : Copiez le token immédiatement !** (vous ne pourrez plus le voir après)

---

### **Étape 2 : Obtenir l'Organization ID**

1. Allez sur votre dashboard Vercel : https://vercel.com/dashboard

2. Cliquez sur **Settings** (en haut à droite)

3. Dans la section **"General"**, copiez l'**Organization ID** (ou **Team ID**)

   Exemple : `team_xxxxxxxxxxxxxxxxxxxxxxxx`

---

### **Étape 3 : Lier les Projets Vercel (optionnel mais recommandé)**

Pour chaque application, créez un projet Vercel si ce n'est pas déjà fait :

```bash
# Dans votre terminal local, pour chaque application :

cd apps/web-industry
vercel --prod
# Suivez les instructions pour créer le projet

cd ../web-transporter
vercel --prod

cd ../web-logistician
vercel --prod

cd ../web-recipient
vercel --prod

cd ../web-supplier
vercel --prod

cd ../web-forwarder
vercel --prod

cd ../backoffice-admin
vercel --prod

cd ../marketing-site
vercel --prod
```

**Note :** Le workflow GitHub Actions peut aussi créer automatiquement les projets si vous utilisez `--yes` (déjà configuré).

---

### **Étape 4 : Ajouter les Secrets dans GitHub**

1. Allez sur GitHub : https://github.com/romain-38530/RT-Technologie/settings/secrets/actions

2. Cliquez sur **"New repository secret"**

3. Ajoutez ces secrets :

   **Secret 1 :**
   - Name: `VERCEL_TOKEN`
   - Value: `[Le token créé à l'étape 1]`

   **Secret 2 :**
   - Name: `VERCEL_ORG_ID`
   - Value: `[L'Organization ID de l'étape 2]`

   **Secret 3 (si besoin pour backoffice-admin) :**
   - Name: `NEXT_PUBLIC_ADMIN_GATEWAY_URL`
   - Value: `https://[IP-ADMIN-GATEWAY]:3008` (ou votre URL)

   **Secret 4 :**
   - Name: `NEXT_PUBLIC_AUTHZ_URL`
   - Value: `https://[IP-AUTHZ]:3007` (ou votre URL)

   **Secret 5 :**
   - Name: `NEXT_PUBLIC_SUPPORT_URL`
   - Value: `https://support.rt-technologie.com` (ou votre URL)

---

### **Étape 5 : Commit et Push le Workflow**

```bash
# Dans votre terminal local :
cd "c:\\Users\\rtard\\OneDrive - RT LOGISTIQUE\\RT Technologie\\RT-Technologie"

git add .github/workflows/deploy-vercel.yml SETUP_GITHUB_ACTIONS_VERCEL.md
git commit -m "feat: Add GitHub Actions automated Vercel deployment workflow"
git push origin main
```

---

## 🚀 **Utilisation**

### **Déploiement Automatique**

Chaque fois que vous faites un `git push` sur `main` ou `dockerfile` avec des modifications dans `apps/**` ou `packages/**`, GitHub Actions va **automatiquement** :
1. Détecter les applications modifiées
2. Installer les dépendances avec PNPM
3. Builder chaque application
4. Les déployer sur Vercel en production
5. Vous donner les URLs de déploiement

### **Déploiement Manuel**

Allez sur GitHub Actions et cliquez sur "Run workflow" :
https://github.com/romain-38530/RT-Technologie/actions/workflows/deploy-vercel.yml

Choisissez l'application :
- `all` : Toutes les applications
- `web-industry` : Juste l'app industrielle
- `web-transporter` : Juste l'app transporteur
- `web-logistician` : Juste l'app logisticien
- `web-recipient` : Juste l'app destinataire
- `web-supplier` : Juste l'app fournisseur
- `web-forwarder` : Juste l'app transitaire
- `backoffice-admin` : Juste le backoffice admin
- `marketing-site` : Juste le site marketing

---

## 📊 **Avantages**

✅ **Autonomie totale** - Plus besoin de Vercel CLI manuel
✅ **Mises à jour automatiques** - Push du code = déploiement automatique
✅ **Détection intelligente** - Seules les apps modifiées sont redéployées
✅ **Monorepo optimisé** - Si `packages/**` modifié, toutes les apps sont redéployées
✅ **Monitoring intégré** - Logs et statut visibles dans GitHub Actions
✅ **Rollback facile** - Revert un commit = redéploiement de l'ancienne version
✅ **Traçabilité** - Historique complet de tous les déploiements

---

## 🔄 **Flux de Travail Futur**

### Scénario 1 : Mise à jour d'une app

```bash
# Vous modifiez le code
vim apps/web-industry/src/pages/index.tsx

# Vous committez
git add .
git commit -m "feat: Update industry dashboard"
git push

# GitHub Actions fait automatiquement :
# 1. Détecte que web-industry a changé
# 2. Installe les dépendances
# 3. Build de web-industry
# 4. Déploiement sur Vercel
# 5. Vous recevez l'URL de déploiement
```

### Scénario 2 : Modification d'un package partagé

```bash
# Vous modifiez un package
vim packages/ui/src/Button.tsx

# Vous committez
git add .
git commit -m "feat: Update Button component"
git push

# GitHub Actions détecte packages/** et redéploie TOUTES les apps
# Car toutes les apps utilisent ce package partagé
```

---

## 🛠️ **Monitoring et Debug**

### Voir les logs d'un déploiement

1. Allez sur : https://github.com/romain-38530/RT-Technologie/actions
2. Cliquez sur le workflow en cours
3. Consultez les logs en temps réel

### Vérifier les URLs de déploiement

Les URLs de déploiement sont affichées dans les logs GitHub Actions et sur votre dashboard Vercel.

---

## 🔐 **Sécurité**

✅ Le token Vercel est stocké en **secret chiffré** dans GitHub
✅ Pas de credentials en clair dans le code
✅ Les variables d'environnement sont injectées au build
✅ Déploiements en production uniquement avec `--prod`

---

## 📞 **Support**

Si un déploiement échoue :
1. Consultez les logs GitHub Actions
2. Vérifiez que le token Vercel est valide
3. Vérifiez que les projets Vercel existent
4. Contactez-moi avec le lien du workflow échoué

---

## 🎯 **Prochaines Étapes**

Une fois configuré, vous pouvez :
1. ✅ Déployer simplement avec `git push`
2. ✅ Ajouter des environnements (staging, preview)
3. ✅ Intégrer des tests automatiques avant déploiement
4. ✅ Configurer des notifications Slack/Discord
5. ✅ Synchroniser les déploiements backend AWS + frontend Vercel

---

## 📋 **Liste des Applications Déployées**

Voici les 8 applications qui seront déployées automatiquement :

1. **web-industry** 🏭 - Interface pour les industriels
2. **web-transporter** 🚚 - Interface pour les transporteurs
3. **web-logistician** 📦 - Interface pour les logisticiens
4. **web-recipient** 📥 - Interface pour les destinataires
5. **web-supplier** 🏪 - Interface pour les fournisseurs
6. **web-forwarder** ✈️ - Interface pour les transitaires
7. **backoffice-admin** ⚙️ - Backoffice administrateur
8. **marketing-site** 🌐 - Site marketing/vitrine

---

**Une fois les secrets ajoutés dans GitHub, le workflow Vercel sera 100% autonome !** 🚀

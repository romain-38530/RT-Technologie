# Guide de Configuration AWS Amplify avec Git

## 🎯 Objectif

Ce guide vous accompagne pour configurer AWS Amplify pour déployer automatiquement vos frontends (backoffice-admin et marketing-site) depuis votre repository Git.

## 📋 Prérequis

### 1. AWS CLI configuré

```bash
aws configure
# Région: eu-central-1
# Credentials: Votre Access Key et Secret Key
```

### 2. Repository Git accessible

Assurez-vous que votre code est poussé sur:
- GitHub
- GitLab
- Bitbucket
- AWS CodeCommit

### 3. Token d'accès Git (Important !)

#### GitHub - Créer un Personal Access Token

1. Allez sur https://github.com/settings/tokens
2. Cliquez sur "Generate new token" → "Generate new token (classic)"
3. Donnez un nom: `AWS Amplify - RT Technologie`
4. Sélectionnez les scopes:
   - ✅ `repo` (Full control of private repositories)
5. Cliquez sur "Generate token"
6. **⚠️ IMPORTANT:** Copiez le token immédiatement (vous ne pourrez plus le voir)

#### GitLab - Créer un Personal Access Token

1. Allez sur https://gitlab.com/-/profile/personal_access_tokens
2. Créez un nouveau token
3. Sélectionnez les scopes:
   - ✅ `api`
   - ✅ `read_repository`
   - ✅ `write_repository`
4. Copiez le token

#### Bitbucket - Créer un App Password

1. Allez sur https://bitbucket.org/account/settings/app-passwords/
2. Créez un nouveau App password
3. Sélectionnez les permissions:
   - ✅ Repositories: Read
   - ✅ Repositories: Write
4. Copiez le password

## 🚀 Lancement du script

### Étape 1 : Valider la configuration AWS

```bash
cd infra
./validate-aws-setup.sh
```

Vérifiez que tout est ✅ vert.

### Étape 2 : Lancer la configuration Amplify

```bash
./setup-amplify-with-git.sh
```

### Étape 3 : Suivre les instructions interactives

Le script va vous demander:

1. **Repository Git**
   - Il détecte automatiquement votre repo si vous êtes dans le projet
   - Ou vous pouvez entrer manuellement l'URL

2. **Branche Git**
   - Par défaut: `main`
   - Ou spécifiez votre branche de déploiement

3. **Token Git**
   - Collez le token créé précédemment
   - Il est masqué pour la sécurité

Le script va ensuite:
- ✅ Créer les applications Amplify
- ✅ Récupérer les IPs des services backend
- ✅ Configurer les variables d'environnement
- ✅ Connecter Git (si token fourni)
- ✅ Créer les branches de déploiement

## 📱 Résultat attendu

À la fin du script, vous obtiendrez:

```
✅ Application 'rt-backoffice-admin' créée
   • App ID: d1234abcd5678
   • URL: https://main.d1234abcd5678.amplifyapp.com
   • Console: https://eu-central-1.console.aws.amazon.com/amplify/...

✅ Application 'rt-marketing-site' créée
   • App ID: d9876efgh5432
   • URL: https://main.d9876efgh5432.amplifyapp.com
   • Console: https://eu-central-1.console.aws.amazon.com/amplify/...
```

## 🔄 Déploiement automatique

### Avec token Git (Recommandé)

Si vous avez fourni un token Git, les déploiements sont automatiques:

```bash
# Faites vos modifications
git add .
git commit -m "Update frontend"
git push origin main

# AWS Amplify détecte le push et build automatiquement !
```

### Sans token Git (Configuration manuelle)

Si vous n'avez pas fourni de token, suivez ces étapes dans la console AWS:

1. Ouvrez la console AWS Amplify: https://console.aws.amazon.com/amplify/
2. Sélectionnez votre région: `eu-central-1`
3. Cliquez sur votre application
4. Cliquez sur "Connect repository"
5. Choisissez votre provider (GitHub/GitLab/Bitbucket)
6. Autorisez AWS Amplify
7. Sélectionnez le repository et la branche
8. Les variables d'environnement sont déjà configurées ✅
9. Lancez le build

## 📊 Suivi du déploiement

### Via la console AWS

1. Ouvrez https://console.aws.amazon.com/amplify/
2. Sélectionnez votre application
3. Cliquez sur la branche `main`
4. Vous verrez les étapes:
   - 🔄 Provision
   - 🔨 Build
   - 🚀 Deploy
   - ✅ Complete

### Via la CLI

```bash
# Lister les builds
aws amplify list-jobs \
  --app-id <APP_ID> \
  --branch-name main \
  --region eu-central-1

# Voir les détails d'un build
aws amplify get-job \
  --app-id <APP_ID> \
  --branch-name main \
  --job-id <JOB_ID> \
  --region eu-central-1
```

## ⏱️ Temps de déploiement

- **Premier build:** 10-15 minutes (installation des dépendances)
- **Builds suivants:** 5-10 minutes (avec cache)
- **Propagation CDN:** 2-5 minutes supplémentaires

## 🔧 Configuration avancée

### Ajouter un domaine personnalisé

```bash
# Via la console AWS Amplify
1. Ouvrez votre application
2. Cliquez sur "Domain management"
3. Cliquez sur "Add domain"
4. Entrez votre domaine: rt-technologie.com
5. Configurez les subdomains:
   - backoffice.rt-technologie.com → backoffice-admin
   - marketing.rt-technologie.com → marketing-site
6. AWS Amplify créera automatiquement le certificat SSL
```

Ou via CLI:

```bash
aws amplify create-domain-association \
  --app-id <APP_ID> \
  --domain-name rt-technologie.com \
  --sub-domain-settings prefix=backoffice,branchName=main \
  --region eu-central-1
```

### Configurer des environnements multiples

```bash
# Créer une branche staging
aws amplify create-branch \
  --app-id <APP_ID> \
  --branch-name staging \
  --enable-auto-build true \
  --region eu-central-1

# L'URL sera: https://staging.d1234abcd5678.amplifyapp.com
```

### Modifier les variables d'environnement

```bash
# Via la console
1. Ouvrez votre application
2. Aller dans "Environment variables"
3. Ajoutez/modifiez les variables
4. Redéployez

# Via CLI
aws amplify update-app \
  --app-id <APP_ID> \
  --environment-variables '{"NEXT_PUBLIC_API_URL":"http://new-ip:3000"}' \
  --region eu-central-1
```

## 🐛 Dépannage

### Build échoue

```bash
# Voir les logs complets
aws amplify get-job \
  --app-id <APP_ID> \
  --branch-name main \
  --job-id <JOB_ID> \
  --region eu-central-1

# Erreurs courantes:
# 1. Dépendances manquantes → Vérifier package.json
# 2. Variables d'env incorrectes → Vérifier la console Amplify
# 3. Erreurs de build Next.js → Tester localement: npm run build
```

### Git non connecté

Si le token Git n'a pas fonctionné:

1. Allez dans la console Amplify
2. Cliquez sur "Connect repository"
3. Suivez le workflow OAuth

### Variables d'environnement non prises en compte

```bash
# Mettre à jour les variables
aws amplify update-app \
  --app-id <APP_ID> \
  --environment-variables file://env-vars.json \
  --region eu-central-1

# Puis redéployer
aws amplify start-job \
  --app-id <APP_ID> \
  --branch-name main \
  --job-type RELEASE \
  --region eu-central-1
```

## 📚 Ressources

### Documentation
- [Guide complet AWS Frontend](../docs/DEPLOYMENT_AWS_FRONTEND.md)
- [Troubleshooting complet](TROUBLESHOOTING_AWS.md)
- [AWS Amplify Docs](https://docs.aws.amazon.com/amplify/)

### Support
- Console AWS Amplify: https://console.aws.amazon.com/amplify/
- AWS Support: https://console.aws.amazon.com/support/

## ✅ Checklist finale

Après avoir lancé le script, vérifiez:

- [ ] Les 2 applications Amplify sont créées
- [ ] Git est connecté (ou connexion manuelle effectuée)
- [ ] Le premier build est lancé
- [ ] Les URLs Amplify sont accessibles
- [ ] Les variables d'environnement sont correctes
- [ ] Les appels API backend fonctionnent
- [ ] Domaines personnalisés configurés (optionnel)

## 🎉 C'est fait !

Vos applications sont maintenant déployées automatiquement sur AWS Amplify !

**Workflow de travail:**

```bash
# 1. Développer localement
npm run dev

# 2. Tester le build
npm run build

# 3. Commiter et pousser
git add .
git commit -m "Feature: New functionality"
git push origin main

# 4. AWS Amplify build et déploie automatiquement ! 🚀
```

## 💰 Coûts estimés

- **Build minutes:** 0.01€/minute (100 minutes gratuites/mois)
- **Hosting:** 0.15€/GB de transfert (15GB gratuits/mois)
- **Stockage:** 0.023€/GB/mois (5GB gratuits/mois)

**Estimation pour 2 apps:** ~10-20€/mois après les quotas gratuits

---

**Date de création:** 2025-01-21
**Version:** 1.0.0
**Statut:** ✅ Prêt à l'emploi

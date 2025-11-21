# 🚀 Déploiement AWS Frontend - COMMENCEZ ICI

## Option recommandée : AWS Amplify avec Git

### ⚡ Setup rapide (10 minutes)

```bash
# 1. Aller dans le dossier infra
cd infra

# 2. Valider la configuration
./validate-aws-setup.sh

# 3. Configurer Amplify
./setup-amplify-with-git.sh
```

### 📝 Ce que le script fait

Le script va vous guider pour :

1. **Connecter votre repository Git**
   - Détection automatique de votre repo
   - Support GitHub, GitLab, Bitbucket

2. **Créer vos apps AWS Amplify**
   - backoffice-admin
   - marketing-site

3. **Configurer les variables d'environnement**
   - Récupération automatique des IPs backend
   - Injection dans Amplify

4. **Activer le déploiement automatique**
   - Chaque `git push` déploie automatiquement
   - Build + déploiement en 5-10 minutes

### 🎯 Résultat attendu

```
✅ rt-backoffice-admin
   URL: https://main.d123456.amplifyapp.com

✅ rt-marketing-site
   URL: https://main.d789012.amplifyapp.com
```

## 🔑 Important : Token Git

Avant de lancer le script, créez un token Git :

### GitHub
https://github.com/settings/tokens
→ New token (classic)
→ Cochez: `repo`

### GitLab
https://gitlab.com/-/profile/personal_access_tokens
→ Scopes: `api`, `read_repository`, `write_repository`

### Bitbucket
https://bitbucket.org/account/settings/app-passwords/
→ Permissions: Repositories (Read, Write)

## 📚 Documentation complète

- **Guide Amplify détaillé** : [GUIDE_AMPLIFY_SETUP.md](GUIDE_AMPLIFY_SETUP.md)
- **Guide complet AWS** : [../docs/DEPLOYMENT_AWS_FRONTEND.md](../docs/DEPLOYMENT_AWS_FRONTEND.md)
- **Dépannage** : [TROUBLESHOOTING_AWS.md](TROUBLESHOOTING_AWS.md)

## 🆘 Besoin d'aide ?

```bash
# Afficher le résumé
cat DEPLOIEMENT_AWS_RESUME.txt

# Voir le guide Amplify
cat GUIDE_AMPLIFY_SETUP.md
```

---

**Prêt ?** Lancez : `./setup-amplify-with-git.sh`

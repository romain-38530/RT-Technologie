# 🤖 Configuration GitHub Actions - Gestion AWS Autonome

Cette configuration permet à GitHub Actions de gérer **automatiquement et en permanence** votre infrastructure AWS.

---

## ✅ **Ce que ça permet**

Une fois configuré, GitHub Actions pourra **automatiquement** :
- ✅ Builder et pusher les images Docker sur ECR
- ✅ Déployer les services sur ECS Fargate
- ✅ Mettre à jour les services lors de chaque push
- ✅ Récupérer les IPs publiques
- ✅ Vérifier le statut de l'infrastructure
- ✅ **Tout gérer sans votre intervention**

---

## 📋 **Configuration (5 minutes)**

### **Étape 1 : Créer un utilisateur IAM pour GitHub Actions**

Dans la console AWS :

```bash
# Dans CloudShell, exécutez ces commandes:

# 1. Créer l'utilisateur IAM
aws iam create-user --user-name github-actions-deployer

# 2. Créer la policy avec toutes les permissions nécessaires
cat > /tmp/github-actions-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:*",
        "ecs:*",
        "ec2:DescribeNetworkInterfaces",
        "ssm:SendCommand",
        "ssm:GetCommandInvocation",
        "logs:CreateLogGroup",
        "logs:DescribeLogGroups",
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name GitHubActionsDeployPolicy \
  --policy-document file:///tmp/github-actions-policy.json

# 3. Attacher la policy à l'utilisateur
aws iam attach-user-policy \
  --user-name github-actions-deployer \
  --policy-arn arn:aws:iam::004843574253:policy/GitHubActionsDeployPolicy

# 4. Créer les clés d'accès
aws iam create-access-key --user-name github-actions-deployer
```

**⚠️ IMPORTANT : Notez les `AccessKeyId` et `SecretAccessKey` affichés !**

---

### **Étape 2 : Ajouter les secrets dans GitHub**

1. Allez sur GitHub : https://github.com/romain-38530/RT-Technologie/settings/secrets/actions

2. Cliquez sur **"New repository secret"**

3. Ajoutez ces 2 secrets :

   **Secret 1 :**
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: `AKIA...` (la clé obtenue à l'étape 1)

   **Secret 2 :**
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: `wJalrXUtn...` (la clé secrète obtenue à l'étape 1)

---

### **Étape 3 : Commit et Push le workflow**

```bash
# Dans votre terminal local:
cd "c:\Users\rtard\OneDrive - RT LOGISTIQUE\RT Technologie\RT-Technologie"

git add .github/workflows/deploy-auto.yml
git commit -m "feat: Add GitHub Actions automated deployment workflow"
git push origin main
```

---

## 🚀 **Utilisation**

### **Déploiement Automatique**

Chaque fois que vous faites un `git push` sur `main` ou `dockerfile`, GitHub Actions va **automatiquement** :
1. Builder toutes les images Docker
2. Les pusher sur ECR
3. Les déployer sur ECS
4. Vous donner les IPs publiques

### **Déploiement Manuel**

Allez sur GitHub Actions et cliquez sur "Run workflow" :
https://github.com/romain-38530/RT-Technologie/actions/workflows/deploy-auto.yml

Choisissez l'action :
- `deploy-all` : Build + Deploy complet
- `build-only` : Juste le build Docker
- `deploy-ecs-only` : Juste le déploiement ECS
- `get-ips` : Récupérer les IPs publiques
- `check-status` : Vérifier le statut

---

## 📊 **Avantages**

✅ **Autonomie totale** - Plus besoin de CloudShell ou de moi pour déployer
✅ **Mises à jour automatiques** - Push du code = déploiement automatique
✅ **Monitoring intégré** - Logs et statut visibles dans GitHub Actions
✅ **Rollback facile** - Revert un commit = redéploiement de l'ancienne version
✅ **Traçabilité** - Historique complet de tous les déploiements

---

## 🔄 **Flux de Travail Futur**

### Scénario 1 : Mise à jour d'un service

```bash
# Vous modifiez le code
vim services/notifications/src/server.js

# Vous committez
git add .
git commit -m "fix: Correction notification email"
git push

# GitHub Actions fait automatiquement:
# 1. Build de l'image notifications
# 2. Push sur ECR
# 3. Déploiement sur ECS
# 4. Vous recevez une notification GitHub (succès/échec)
```

### Scénario 2 : Ajouter un nouveau service

```bash
# Vous créez le service
mkdir services/new-service
# ... créez le code ...

# Vous committez
git add .
git commit -m "feat: Add new-service"
git push

# GitHub Actions détecte automatiquement le nouveau service et le déploie
```

---

## 🛠️ **Monitoring et Debug**

### Voir les logs d'un déploiement

1. Allez sur : https://github.com/romain-38530/RT-Technologie/actions
2. Cliquez sur le workflow en cours
3. Consultez les logs en temps réel

### Vérifier le statut

Exécutez le workflow avec l'action `check-status`

---

## 🔐 **Sécurité**

✅ Les credentials AWS sont stockés en **secrets chiffrés** dans GitHub
✅ L'utilisateur IAM a **uniquement** les permissions nécessaires
✅ Pas de credentials en clair dans le code
✅ Audit trail complet dans CloudTrail

---

## 📞 **Support**

Si un déploiement échoue :
1. Consultez les logs GitHub Actions
2. Vérifiez les permissions IAM
3. Contactez-moi avec le lien du workflow échoué

---

## 🎯 **Prochaines Étapes**

Une fois configuré, vous pouvez :
1. ✅ Déployer simplement avec `git push`
2. ✅ Ajouter des environnements (staging, production)
3. ✅ Intégrer des tests automatiques
4. ✅ Configurer des notifications Slack/Discord
5. ✅ Ajouter le déploiement des frontends Vercel

---

**Une fois les secrets ajoutés dans GitHub, le workflow sera 100% autonome !** 🚀

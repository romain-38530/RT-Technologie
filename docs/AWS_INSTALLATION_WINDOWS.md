# Installation AWS CLI sur Windows

**Date** : 18 Novembre 2025
**Système** : Windows
**Utilisateur** : rtard

---

## 📥 Installation AWS CLI

### Méthode 1 : Installateur MSI (Recommandé)

1. **Télécharger AWS CLI v2 pour Windows**
   - URL : https://awscli.amazonaws.com/AWSCLIV2.msi
   - Ou directement : https://aws.amazon.com/cli/

2. **Exécuter l'installateur**
   - Double-cliquer sur `AWSCLIV2.msi`
   - Suivre les instructions à l'écran
   - Accepter les paramètres par défaut

3. **Vérifier l'installation**
   ```powershell
   # Ouvrir un nouveau PowerShell/CMD
   aws --version

   # Résultat attendu :
   # aws-cli/2.x.x Python/3.x.x Windows/10 exe/AMD64
   ```

### Méthode 2 : Chocolatey (Si déjà installé)

```powershell
# Ouvrir PowerShell en Administrateur
choco install awscli

# Vérifier
aws --version
```

### Méthode 3 : winget (Windows 11)

```powershell
winget install Amazon.AWSCLI
```

---

## ⚙️ Configuration AWS CLI

### Étape 1 : Configuration Interactive

```powershell
aws configure
```

**Entrez les informations suivantes :**

```
AWS Access Key ID [None]: AKIAQCIFTCPW7JIPVWDG
AWS Secret Access Key [None]: 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
Default region name [None]: eu-west-1
Default output format [None]: json
```

### Étape 2 : Vérification

```powershell
# Vérifier l'identité
aws sts get-caller-identity

# Résultat attendu :
{
  "UserId": "AIDAXXXXXXXXXXXXXXXXX",
  "Account": "004843574253",
  "Arn": "arn:aws:iam::004843574253:user/RT_OFFICE"
}
```

---

## 📦 Installation Docker Desktop (Pour ECS)

### Téléchargement

- URL : https://www.docker.com/products/docker-desktop/
- Télécharger : Docker Desktop for Windows

### Installation

1. Exécuter `Docker Desktop Installer.exe`
2. Suivre les instructions
3. Redémarrer si nécessaire
4. Lancer Docker Desktop

### Vérification

```powershell
docker --version
# Résultat : Docker version 24.x.x

docker ps
# Doit fonctionner sans erreur
```

---

## 🚀 Déploiement AWS - Étapes Complètes

### Prérequis Vérifiés

```powershell
# 1. AWS CLI installé
aws --version

# 2. Docker installé
docker --version

# 3. Credentials configurés
aws sts get-caller-identity

# 4. Région correcte
aws configure get region
# Doit afficher : eu-west-1
```

### Étape 1 : Configuration Infrastructure

```bash
# Utiliser Git Bash ou WSL
cd "c:\Users\rtard\OneDrive - RT LOGISTIQUE\RT Technologie\RT-Technologie"

bash scripts/setup-aws-infrastructure.sh
```

**Ce script crée :**
- Repository ECR : `rt-client-onboarding`
- Cluster ECS : `rt-production`
- CloudWatch Logs : `/ecs/rt-client-onboarding`
- Rôles IAM : `ecsTaskExecutionRole`, `ecsTaskRole`
- Security Group

**Durée estimée** : 2-3 minutes

### Étape 2 : Configuration Secrets

```bash
bash scripts/setup-aws-secrets.sh
```

**Ce script migre :**
- MongoDB URI
- JWT Secret
- Session Secret
- SMTP Mailgun (4 secrets)

**Durée estimée** : 1 minute

### Étape 3 : Build et Déploiement

```bash
bash scripts/deploy-aws-ecs.sh
```

**Ce script effectue :**
1. Build de l'image Docker
2. Tag de l'image
3. Login à ECR
4. Push vers ECR
5. Enregistrement task definition
6. Déploiement sur ECS Fargate
7. Attente de stabilisation

**Durée estimée** : 5-10 minutes

---

## 🔍 Vérification du Déploiement

### Vérifier le Service ECS

```powershell
aws ecs describe-services `
  --cluster rt-production `
  --services client-onboarding `
  --region eu-west-1
```

### Voir les Logs

```powershell
# Installer CloudWatch Logs Insights CLI
aws logs tail /ecs/rt-client-onboarding --follow --region eu-west-1
```

### Récupérer l'IP Publique

```powershell
# Lister les tasks
aws ecs list-tasks --cluster rt-production --region eu-west-1

# Décrire la task pour obtenir l'ENI
aws ecs describe-tasks `
  --cluster rt-production `
  --tasks <TASK_ARN> `
  --region eu-west-1
```

---

## 🛠️ Dépannage

### AWS CLI ne fonctionne pas

```powershell
# Vérifier le PATH
$env:PATH

# Réinstaller AWS CLI
# Télécharger : https://awscli.amazonaws.com/AWSCLIV2.msi
```

### Docker ne démarre pas

```powershell
# Vérifier que WSL2 est installé
wsl --list --verbose

# Installer WSL2 si nécessaire
wsl --install
```

### Erreur "No credentials"

```powershell
# Vérifier les credentials
aws configure list

# Reconfigurer
aws configure
```

### Erreur de permissions AWS

```powershell
# Vérifier les permissions IAM
aws iam get-user

# Ajouter les permissions nécessaires dans la console AWS :
# - AmazonECS_FullAccess
# - AmazonEC2ContainerRegistryFullAccess
# - CloudWatchLogsFullAccess
# - SecretsManagerReadWrite
```

---

## 📋 Checklist Complète

### Installation

- [ ] AWS CLI installé (`aws --version`)
- [ ] Docker Desktop installé (`docker --version`)
- [ ] Git Bash ou WSL installé
- [ ] Credentials AWS configurés
- [ ] Région eu-west-1 configurée

### Déploiement

- [ ] Infrastructure créée (script 1)
- [ ] Secrets migrés (script 2)
- [ ] Service déployé (script 3)
- [ ] Service ECS en status RUNNING
- [ ] Health check accessible

### Vérification

- [ ] `aws sts get-caller-identity` retourne Account: 004843574253
- [ ] ECR repository existe
- [ ] ECS cluster existe
- [ ] Logs CloudWatch actifs
- [ ] Service répond sur le port 3020

---

## 🌐 Accès au Service

### Via IP Publique (Temporaire)

```powershell
# Récupérer l'IP de la task ECS
# Puis tester
curl http://<IP_PUBLIQUE>:3020/health
```

### Via Application Load Balancer (Production)

Voir le guide : [AWS_QUICK_DEPLOY.md](AWS_QUICK_DEPLOY.md) section "Configuration Load Balancer"

---

## 💰 Estimation des Coûts

| Service | Coût Mensuel |
|---------|--------------|
| ECS Fargate (0.5 vCPU, 1GB) | ~15€ |
| ECR (1GB images) | ~0.10€ |
| CloudWatch Logs (5GB) | ~2.50€ |
| Secrets Manager (8 secrets) | ~3.20€ |
| **Total** | **~21€/mois** |

---

## 📞 Support

**Documentation AWS** : https://docs.aws.amazon.com/cli/
**Support AWS** : https://console.aws.amazon.com/support/
**Guide Déploiement** : [AWS_QUICK_DEPLOY.md](AWS_QUICK_DEPLOY.md)

---

**Prêt pour le déploiement AWS ! 🚀**

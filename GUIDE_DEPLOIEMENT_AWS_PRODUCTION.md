# Deploiement AWS ECS - Production RT-Technologie

## Prerequis

Vous avez deja :
- Account ID AWS : `004843574253`
- Access Key ID : (fourni precedemment)
- Secret Access Key : (fourni precedemment)
- Region : `eu-west-1`

## Etape 1 : Installer AWS CLI (5 minutes)

### Option A : Script Automatique

```powershell
.\install-aws-cli.ps1
```

### Option B : Installation Manuelle

1. Telecharger : https://awscli.amazonaws.com/AWSCLIV2.msi
2. Executer le MSI
3. Suivre l'assistant d'installation
4. Fermer et rouvrir PowerShell

### Verification

```powershell
aws --version
```

Resultat attendu : `aws-cli/2.x.x Python/3.x.x Windows/...`

## Etape 2 : Configurer AWS CLI (2 minutes)

```powershell
aws configure
```

Entrer :
```
AWS Access Key ID: VOTRE_ACCESS_KEY
AWS Secret Access Key: VOTRE_SECRET_KEY
Default region name: eu-west-1
Default output format: json
```

### Verification

```powershell
aws sts get-caller-identity
```

Resultat attendu :
```json
{
  "UserId": "...",
  "Account": "004843574253",
  "Arn": "arn:aws:iam::004843574253:user/..."
}
```

## Etape 3 : Creer l'Infrastructure AWS (10 minutes)

### 3.1 Executer le Script de Setup

```bash
cd "c:\Users\rtard\OneDrive - RT LOGISTIQUE\RT Technologie\RT-Technologie"
bash scripts/setup-aws-infrastructure.sh
```

Ce script va creer :
- ECR Repository pour les images Docker
- ECS Cluster `rt-production`
- CloudWatch Log Group
- IAM Roles necessaires
- Security Groups

### 3.2 Migrer les Secrets

```bash
bash scripts/setup-aws-secrets.sh
```

Ce script va :
- Lire .env.production
- Creer les secrets dans AWS Secrets Manager
- Afficher les ARNs des secrets

## Etape 4 : Builder et Deployer (15 minutes)

### 4.1 Verifier Docker

```powershell
docker --version
```

### 4.2 Executer le Deploiement

```bash
bash scripts/deploy-aws-ecs.sh
```

Ce script va :
1. Builder l'image Docker
2. Se connecter a ECR
3. Pousser l'image vers ECR
4. Creer/mettre a jour la task definition
5. Creer/mettre a jour le service ECS
6. Attendre que le service soit stable

### 4.3 Resultat Attendu

```
Deploiement termine!

Service URL: http://<IP_PUBLIQUE>:3020
Health Check: http://<IP_PUBLIQUE>:3020/health

Commandes utiles:
- Logs: aws logs tail /ecs/rt-client-onboarding --follow
- Status: aws ecs describe-services --cluster rt-production --services client-onboarding
```

## Etape 5 : Verifier le Deploiement (2 minutes)

### 5.1 Obtenir l'IP Publique

```bash
aws ecs describe-tasks \
  --cluster rt-production \
  --tasks $(aws ecs list-tasks --cluster rt-production --service-name client-onboarding --query 'taskArns[0]' --output text) \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text | xargs -I {} aws ec2 describe-network-interfaces \
  --network-interface-ids {} \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text
```

### 5.2 Tester le Health Check

```powershell
curl http://<IP_PUBLIQUE>:3020/health
```

Resultat attendu :
```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

### 5.3 Tester la Verification TVA

```powershell
curl -X POST http://<IP_PUBLIQUE>:3020/api/onboarding/verify-vat `
  -H "Content-Type: application/json" `
  -d '{\"vatNumber\": \"BE0477472701\"}'
```

## Etape 6 : Deployer le Frontend sur Vercel (5 minutes)

### 6.1 Aller sur Vercel

URL : https://vercel.com/new

### 6.2 Importer le Projet

1. Se connecter avec GitHub
2. Chercher : RT-Technologie
3. Cliquer : Import

### 6.3 Configuration

```
Project Name: rt-technologie-onboarding
Framework: Next.js (auto-detecte)
Root Directory: apps/marketing-site
```

### 6.4 Variable d'Environnement

Cliquer "Environment Variables"

```
Name: NEXT_PUBLIC_API_URL
Value: http://<IP_PUBLIQUE_AWS>:3020
Environment: Production
```

Cliquer "Add"

### 6.5 Deployer

1. Cliquer "Deploy"
2. Attendre 2-3 minutes
3. Copier l'URL Vercel affichee

## Etape 7 : Tester le Systeme Complet (2 minutes)

### 7.1 Ouvrir le Site Vercel

```
https://rt-technologie-xxxxx.vercel.app
```

### 7.2 Tester la Verification TVA

1. Sur la page, dans "Numero de TVA"
2. Entrer : `BE0477472701`
3. Cliquer : "Verifier et continuer"

Resultat attendu :
- Raison sociale : SA ODOO
- Adresse : Chaussee de Namur 40, 1367 Ramillies

## Architecture Finale

```
Internet
    |
    v
Frontend Vercel (CDN Global)
    |
    v
Backend AWS ECS Fargate (eu-west-1)
    |
    v
MongoDB Atlas (Database)
```

## URLs Finales

| Service | URL |
|---------|-----|
| Frontend | https://rt-technologie-xxxxx.vercel.app |
| Backend | http://<IP_AWS>:3020 |
| Health Check | http://<IP_AWS>:3020/health |
| CloudWatch Logs | Console AWS |

## Monitoring

### Logs en Temps Reel

```bash
aws logs tail /ecs/rt-client-onboarding --follow
```

### Status du Service

```bash
aws ecs describe-services \
  --cluster rt-production \
  --services client-onboarding \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'
```

### Metrics CloudWatch

Console AWS : CloudWatch > Metrics > ECS

## Commandes Utiles

### Redemarrer le Service

```bash
aws ecs update-service \
  --cluster rt-production \
  --service client-onboarding \
  --force-new-deployment
```

### Scaler le Service

```bash
# Augmenter a 2 instances
aws ecs update-service \
  --cluster rt-production \
  --service client-onboarding \
  --desired-count 2
```

### Voir les Tasks

```bash
aws ecs list-tasks --cluster rt-production --service-name client-onboarding
```

### Arreter le Service

```bash
aws ecs update-service \
  --cluster rt-production \
  --service client-onboarding \
  --desired-count 0
```

## Couts Estimes

### ECS Fargate
- vCPU : 0.5 vCPU x $0.04048/heure = $0.02024/heure
- Memory : 1 GB x $0.004445/GB/heure = $0.004445/heure
- Total : ~$0.025/heure = $18/mois (1 instance)

### Autres Services
- ECR : $0.10/GB/mois (images stockees)
- CloudWatch Logs : $0.50/GB ingere
- Secrets Manager : $0.40/secret/mois (~$3.20/mois)

**Total estime** : ~$25-30/mois

## Securite

### Activer HTTPS (Optionnel - Recommande)

#### Option 1 : Application Load Balancer + ACM

1. Creer un ALB
2. Demander un certificat SSL (ACM)
3. Configurer le target group vers ECS
4. Mettre a jour Vercel avec URL HTTPS

#### Option 2 : CloudFront + ACM

1. Creer une distribution CloudFront
2. Origine : ALB ou IP publique
3. Certificat SSL via ACM
4. Mettre a jour Vercel

### Securiser l'Acces

#### Option 1 : Security Group

Limiter l'acces au backend uniquement depuis Vercel IPs

#### Option 2 : API Gateway

Ajouter API Gateway devant ECS pour :
- Rate limiting
- API keys
- Logs detailles

## Depannage

### Service ne demarre pas

```bash
# Voir les logs
aws logs tail /ecs/rt-client-onboarding --follow

# Verifier les secrets
aws secretsmanager list-secrets --query 'SecretList[?starts_with(Name, `rt/client-onboarding`)].Name'

# Verifier la task definition
aws ecs describe-task-definition --task-definition rt-client-onboarding
```

### Erreur de connexion MongoDB

Verifier que l'IP du service ECS est autorisee dans MongoDB Atlas :
1. Aller sur MongoDB Atlas
2. Network Access
3. Ajouter l'IP publique du service ECS

### Build Docker echoue

```bash
# Tester localement
cd services/client-onboarding
docker build -t test-build .
docker run -p 3020:3020 --env-file .env.production test-build
```

## Prochaines Etapes

1. **Installer AWS CLI** : `.\install-aws-cli.ps1`
2. **Configurer credentials** : `aws configure`
3. **Creer infrastructure** : `bash scripts/setup-aws-infrastructure.sh`
4. **Deployer** : `bash scripts/deploy-aws-ecs.sh`
5. **Deployer Vercel** : https://vercel.com/new

---

**Temps total** : 30-45 minutes
**Resultat** : Infrastructure production complete sur AWS

---

**Derniere mise a jour** : 18 Novembre 2025

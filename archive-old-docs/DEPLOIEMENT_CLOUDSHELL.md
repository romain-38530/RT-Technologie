# 🚀 Commandes pour AWS CloudShell

Copiez-collez ces commandes dans AWS CloudShell (région eu-central-1) :

## Étape 1 : Récupérer le code depuis GitHub

```bash
# Cloner le repository
cd ~
git clone https://github.com/romain-38530/RT-Technologie.git
cd RT-Technologie
git checkout dockerfile

# Vérifier que les fichiers sont présents
ls -la infra/*.sh
ls -la services/*/Dockerfile
```

## Étape 2 : Rendre les scripts exécutables

```bash
chmod +x infra/deploy-all-services-aws.sh
chmod +x infra/get-service-ips.sh
chmod +x infra/deploy-frontends-vercel.sh
```

## Étape 3 : Déployer tous les services backend

```bash
./infra/deploy-all-services-aws.sh
```

Ce script va :
- ✅ Créer les repositories ECR
- ✅ Builder les images Docker
- ✅ Pusher vers ECR
- ✅ Créer/mettre à jour les services ECS
- ✅ Afficher les IPs publiques

**Durée estimée** : 15-20 minutes

## Étape 4 : Récupérer les IPs (si besoin)

```bash
./infra/get-service-ips.sh
```

## Services qui seront déployés

| Service | Port | Description |
|---------|------|-------------|
| client-onboarding | 3020 | ✅ Déjà déployé (3.79.182.74) |
| core-orders | 3030 | Gestion des commandes |
| affret-ia | 3010 | IA optimisation affretement |
| vigilance | 3040 | Scoring transporteurs |

## En cas de problème

Si le script échoue, vérifiez :

1. **Région correcte** : Vous devez être dans **eu-central-1**
2. **Secrets Manager** : Les secrets doivent exister
3. **Permissions IAM** : Votre compte doit avoir les permissions ECS/ECR

### Vérifier les secrets :
```bash
aws secretsmanager list-secrets --region eu-central-1 | grep rt/
```

### Vérifier la région :
```bash
aws configure get region
# Si vide ou incorrect, définir :
export AWS_REGION=eu-central-1
```

## Après le déploiement

Une fois les services déployés, notez les IPs et mettez à jour Vercel :

```bash
# Obtenir les IPs
./infra/get-service-ips.sh

# Exemple de sortie :
# ✓ client-onboarding: http://3.79.182.74:3020
# ✓ core-orders: http://X.X.X.X:3030
# ✓ affret-ia: http://X.X.X.X:3010
# ✓ vigilance: http://X.X.X.X:3040
```

Ensuite, déployez les frontends Vercel avec ces IPs.

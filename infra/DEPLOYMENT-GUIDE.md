# Guide de déploiement RT-Technologie sur AWS ECS

## Vue d'ensemble

Toute la plateforme RT-Technologie (backends + frontends) est maintenant déployée sur **AWS ECS Fargate**.

## Architecture

- **20 microservices backend** (Node.js/Express)
- **8 applications frontend** (Next.js)
- Déployés sur AWS ECS Fargate (région: eu-central-1)
- IPs publiques + ports spécifiques par service

## Services déjà déployés

### Backends (12/20)
```
✅ client-onboarding    http://3.72.37.6:3020
✅ affret-ia            http://3.75.218.131:3010
✅ tms-sync             (port 3050)
✅ authz                (port 3060)
✅ tracking-ia          (port 3070)
✅ notifications        (port 3080)
✅ training             (port 3090)
✅ palette              (port 3100)
✅ planning             (port 3110)
✅ geo-tracking         (port 3120)
✅ storage-market       (port 3130)
✅ erp-sync             (port 3140)
✅ admin-gateway        (port 3150)
```

### Backends restants à déployer (8/20)
```
⏳ core-orders          (port 3030)
⏳ vigilance            (port 3040)
⏳ analytics            (port 3160)
⏳ webhooks             (port 3170)
⏳ cron-scheduler       (port 3180)
⏳ pdf-generator        (port 3190)
⏳ email-service        (port 3200)
⏳ sms-service          (port 3210)
```

## Déploiement des frontends prioritaires

### Étape 1: Ouvrir AWS CloudShell

1. Se connecter à AWS Console
2. Région: **eu-central-1** (Francfort)
3. Cliquer sur l'icône CloudShell (en haut à droite)

### Étape 2: Cloner le repository

```bash
git clone https://github.com/romain-38530/RT-Technologie.git
cd RT-Technologie
git checkout dockerfile
```

### Étape 3: Lancer le déploiement

```bash
chmod +x infra/deploy-frontends-aws.sh
./infra/deploy-frontends-aws.sh
```

**Durée estimée:** 15-20 minutes

Le script va:
1. ✅ Créer les repos ECR si nécessaire
2. ✅ Builder les images Docker (marketing-site + web-forwarder)
3. ✅ Pusher vers ECR
4. ✅ Créer les task definitions ECS
5. ✅ Déployer les services sur Fargate
6. ✅ Afficher les IPs publiques

## Variables d'environnement

### marketing-site
```bash
NEXT_PUBLIC_API_URL=http://3.72.37.6:3020
```

### web-forwarder
```bash
NEXT_PUBLIC_AFFRET_IA_URL=http://3.75.218.131:3010
```

## Scripts disponibles

### Déploiement groupé
- `infra/deploy-frontends-aws.sh` - Déploie marketing-site + web-forwarder

### Déploiement individuel
- `infra/build-marketing-site.sh` - Déploie uniquement marketing-site
- `infra/build-web-forwarder.sh` - Déploie uniquement web-forwarder
- `infra/build-affret-ia.sh` - Déploie uniquement affret-ia (déjà fait)

### Utilitaires
- `infra/get-ecs-ips-cloudshell.sh` - Récupère les IPs des services
- `infra/deploy-all-services-simple.sh` - Déploie tous les backends (déjà fait)

## Vérification du déploiement

### Lister les services
```bash
aws ecs list-services --cluster rt-technologie-cluster --region eu-central-1
```

### Voir les logs
```bash
# marketing-site
aws logs tail /ecs/rt-marketing-site --follow --region eu-central-1

# web-forwarder
aws logs tail /ecs/rt-web-forwarder --follow --region eu-central-1
```

### Récupérer les IPs
```bash
chmod +x infra/get-ecs-ips-cloudshell.sh
./infra/get-ecs-ips-cloudshell.sh
```

## Troubleshooting

### Le service ne démarre pas
```bash
# Vérifier les logs
aws logs tail /ecs/rt-SERVICE-NAME --region eu-central-1

# Vérifier l'état du service
aws ecs describe-services \
  --cluster rt-technologie-cluster \
  --services rt-SERVICE-NAME-service \
  --region eu-central-1
```

### Build Docker échoue
- Vérifier que le Dockerfile est correct
- S'assurer que toutes les dépendances sont dans package.json
- Vérifier que le mode standalone est activé dans next.config.js

### Service créé mais pas d'IP
Attendre 2-3 minutes puis:
```bash
./infra/get-ecs-ips-cloudshell.sh
```

## Coûts AWS

### Par service ECS Fargate (256 CPU / 512 MB RAM)
- ~$13/mois si running 24/7
- ~$0.018/heure

### Total estimé pour 14 services
- ~$182/mois (24/7)
- Optimisation possible: arrêt des services de dev la nuit

## Prochaines étapes

1. ✅ Déployer marketing-site et web-forwarder
2. ⏳ Tester les URLs publiques
3. ⏳ Configurer un Load Balancer (optionnel)
4. ⏳ Configurer un nom de domaine (optionnel)
5. ⏳ Déployer les 8 backends restants
6. ⏳ Déployer les 6 autres frontends

## Support

En cas de problème:
1. Vérifier les logs CloudShell
2. Vérifier les logs ECS
3. Vérifier la task definition
4. Vérifier les security groups et subnets

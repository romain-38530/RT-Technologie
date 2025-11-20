# Configuration des Secrets Vercel

## Services AWS à récupérer

Vous avez besoin des IPs publiques de ces services ECS:

1. **client-onboarding** (port 3020) - Pour l'API principale
2. **affret-ia** (port 3010) - Pour le service d'affrètement IA

## Comment récupérer les IPs depuis AWS Console

### Méthode 1: Console AWS ECS

1. Allez sur: https://eu-central-1.console.aws.amazon.com/ecs/v2/clusters/rt-technologie-cluster/services
2. Pour chaque service:
   - Cliquez sur `rt-client-onboarding-service`
   - Onglet "Tasks"
   - Cliquez sur la tâche en cours d'exécution
   - Dans "Network", notez l'**IP publique**
   - Répétez pour `rt-affret-ia-service`

### Méthode 2: AWS CLI (si installé)

```bash
# Pour client-onboarding
TASK_ARN=$(aws ecs list-tasks --cluster rt-technologie-cluster --service-name rt-client-onboarding-service --region eu-central-1 --query 'taskArns[0]' --output text)
ENI_ID=$(aws ecs describe-tasks --cluster rt-technologie-cluster --tasks $TASK_ARN --region eu-central-1 --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
CLIENT_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --region eu-central-1 --query 'NetworkInterfaces[0].Association.PublicIp' --output text)
echo "Client Onboarding IP: $CLIENT_IP"

# Pour affret-ia
TASK_ARN=$(aws ecs list-tasks --cluster rt-technologie-cluster --service-name rt-affret-ia-service --region eu-central-1 --query 'taskArns[0]' --output text)
ENI_ID=$(aws ecs describe-tasks --cluster rt-technologie-cluster --tasks $TASK_ARN --region eu-central-1 --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
AFFRET_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --region eu-central-1 --query 'NetworkInterfaces[0].Association.PublicIp' --output text)
echo "Affret IA IP: $AFFRET_IP"
```

## Configuration des Secrets dans Vercel

Une fois les IPs récupérées, créez les variables d'environnement dans Vercel:

### Pour le projet `web-forwarder`

1. Allez sur: https://vercel.com/rt-technologie/web-forwarder/settings/environment-variables
2. Créez une nouvelle variable:
   - **Name**: `NEXT_PUBLIC_AFFRET_IA_URL`
   - **Value**: `http://[IP_AFFRET_IA]:3010` (remplacez [IP_AFFRET_IA] par l'IP réelle)
   - **Environments**: Production, Preview, Development
3. Cliquez sur "Save"

### Pour le projet `marketing-site`

1. Allez sur: https://vercel.com/rt-technologie/marketing-site/settings/environment-variables
2. Créez une nouvelle variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `http://[IP_CLIENT_ONBOARDING]:3020` (remplacez [IP_CLIENT_ONBOARDING] par l'IP réelle)
   - **Environments**: Production, Preview, Development
3. Cliquez sur "Save"

## Re-déploiement

Après avoir configuré les secrets:

### Option 1: Via l'interface Vercel
- Allez sur chaque projet
- Onglet "Deployments"
- Cliquez sur "Redeploy" sur le dernier déploiement

### Option 2: Via GitHub
- Faites un commit vide pour déclencher le workflow:
```bash
git commit --allow-empty -m "chore: Trigger redeployment after Vercel secrets configuration"
git push origin dockerfile
```

## Vérification

Une fois redéployé, vérifiez que les applications fonctionnent:
- https://web-forwarder.vercel.app (ou votre URL Vercel)
- https://marketing-site.vercel.app (ou votre URL Vercel)

## Notes

- Les IPs AWS ECS peuvent changer si les tâches sont redémarrées
- Pour une solution production, utilisez:
  - AWS Application Load Balancer (ALB) avec DNS fixe
  - API Gateway avec nom de domaine personnalisé
  - Ou configurez les secrets comme variables GitHub et utilisez-les dans le workflow

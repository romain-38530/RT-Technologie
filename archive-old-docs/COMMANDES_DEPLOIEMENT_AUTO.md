# 🚀 Déploiement Automatique - Commandes de Gestion

Instance EC2: `i-0ece63fb077366323`
IP: `3.68.183.33`
Région: `eu-central-1`

---

## 📋 Étape 1: Correction et Lancement du Déploiement

Exécutez cette commande dans **AWS CloudShell** :

```bash
# Corriger et lancer le déploiement
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo '\''🔧 Correction du script...'\''",
    "sudo su - ec2-user -c '\''mkdir -p /home/ec2-user/workspace'\''",
    "sudo su - ec2-user -c '\''pkill -f deploy-full.sh || true'\''",
    "sudo su - ec2-user -c '\''sed -i \"15i mkdir -p /home/ec2-user/workspace\" /home/ec2-user/deploy-full.sh'\''",
    "echo '\''🚀 Lancement du déploiement...'\''",
    "sudo su - ec2-user -c '\''nohup /home/ec2-user/deploy-full.sh > /home/ec2-user/deploy.log 2>&1 &'\''",
    "sleep 10",
    "echo '\''📊 Vérification du démarrage...'\''",
    "sudo su - ec2-user -c '\''ps aux | grep deploy-full'\''",
    "echo '\'''\''",
    "echo '\''📝 Premières lignes du log:'\''",
    "sudo su - ec2-user -c '\''head -30 /home/ec2-user/deploy.log'\''"
  ]' \
  --region eu-central-1 \
  --output json \
  --query 'Command.CommandId' \
  --output text > /tmp/deploy_cmd_id.txt

echo ""
echo "✅ Commande envoyée !"
echo "Command ID: $(cat /tmp/deploy_cmd_id.txt)"
echo ""
echo "⏳ Attente de l'exécution (10s)..."
sleep 10

# Afficher le résultat
COMMAND_ID=$(cat /tmp/deploy_cmd_id.txt)
aws ssm get-command-invocation \
  --command-id $COMMAND_ID \
  --instance-id i-0ece63fb077366323 \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

---

## 📊 Étape 2: Monitoring Continu

### Option A: Monitoring manuel (exécution unique)

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["sudo su - ec2-user -c \"tail -100 /home/ec2-user/deploy.log\""]' \
  --region eu-central-1 \
  --output json \
  --query 'Command.CommandId' \
  --output text > /tmp/monitor_cmd_id.txt

sleep 5

COMMAND_ID=$(cat /tmp/monitor_cmd_id.txt)
aws ssm get-command-invocation \
  --command-id $COMMAND_ID \
  --instance-id i-0ece63fb077366323 \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

### Option B: Monitoring automatique (toutes les 3 minutes)

```bash
cat > ~/monitor-deployment.sh << 'EOF'
#!/bin/bash

while true; do
  clear
  echo "════════════════════════════════════════════════════════════════"
  echo "📊 MONITORING DÉPLOIEMENT RT-TECHNOLOGIE - $(date '+%H:%M:%S')"
  echo "════════════════════════════════════════════════════════════════"
  echo ""

  # Envoyer la commande
  CMD_ID=$(aws ssm send-command \
    --instance-ids i-0ece63fb077366323 \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=["sudo su - ec2-user -c \"tail -80 /home/ec2-user/deploy.log\""]' \
    --region eu-central-1 \
    --output text \
    --query 'Command.CommandId')

  # Attendre l'exécution
  sleep 8

  # Récupérer le résultat
  aws ssm get-command-invocation \
    --command-id $CMD_ID \
    --instance-id i-0ece63fb077366323 \
    --region eu-central-1 \
    --query 'StandardOutputContent' \
    --output text 2>/dev/null || echo "⏳ En attente..."

  echo ""
  echo "════════════════════════════════════════════════════════════════"
  echo "⏳ Prochaine mise à jour dans 3 minutes... (Ctrl+C pour arrêter)"
  echo "════════════════════════════════════════════════════════════════"

  sleep 180
done
EOF

chmod +x ~/monitor-deployment.sh

# Lancer le monitoring
~/monitor-deployment.sh
```

---

## 🔍 Étape 3: Vérifications Ponctuelles

### Vérifier que le processus tourne

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["ps aux | grep deploy-full | grep -v grep"]' \
  --region eu-central-1 \
  --output json \
  --query 'Command.CommandId' \
  --output text > /tmp/check_cmd_id.txt

sleep 5

COMMAND_ID=$(cat /tmp/check_cmd_id.txt)
aws ssm get-command-invocation \
  --command-id $COMMAND_ID \
  --instance-id i-0ece63fb077366323 \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

### Voir les derniers builds en cours

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo '\''Processus Docker actifs:'\''",
    "ps aux | grep docker | grep -v grep",
    "echo '\'''\''",
    "echo '\''Logs de build récents:'\''",
    "ls -lh /tmp/build-*.log 2>/dev/null | tail -5"
  ]' \
  --region eu-central-1 \
  --output json \
  --query 'Command.CommandId' \
  --output text > /tmp/build_cmd_id.txt

sleep 5

COMMAND_ID=$(cat /tmp/build_cmd_id.txt)
aws ssm get-command-invocation \
  --command-id $COMMAND_ID \
  --instance-id i-0ece63fb077366323 \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

### Voir l'état des services ECS déployés

```bash
aws ecs list-services \
  --cluster rt-technologie-cluster \
  --region eu-central-1 \
  --query 'serviceArns' \
  --output table
```

---

## 🎯 Étape 4: Récupération des IPs Finales

Une fois le déploiement terminé (après ~60-90 min) :

```bash
cat > ~/get-all-service-ips.sh << 'EOF'
#!/bin/bash

REGION="eu-central-1"
CLUSTER="rt-technologie-cluster"

declare -A SERVICES=(
  ["notifications"]="3050"
  ["authz"]="3007"
  ["admin-gateway"]="3008"
  ["pricing-grids"]="3060"
  ["planning"]="3070"
  ["bourse"]="3080"
  ["palette"]="3090"
  ["wms-sync"]="3100"
  ["erp-sync"]="3110"
  ["tms-sync"]="3120"
  ["tracking-ia"]="3130"
  ["chatbot"]="3140"
  ["geo-tracking"]="3150"
  ["ecpmr"]="3160"
  ["storage-market"]="3170"
  ["training"]="3180"
)

echo "════════════════════════════════════════════════════════════════"
echo "🌐 SERVICES RT-TECHNOLOGIE DÉPLOYÉS"
echo "════════════════════════════════════════════════════════════════"
echo ""

RUNNING=0
TOTAL=${#SERVICES[@]}

for s in "${!SERVICES[@]}"; do
  P="${SERVICES[$s]}"

  T=$(aws ecs list-tasks \
    --cluster $CLUSTER \
    --service-name "rt-$s-service" \
    --region $REGION \
    --query 'taskArns[0]' \
    --output text 2>/dev/null)

  if [ -n "$T" ] && [ "$T" != "None" ]; then
    ENI=$(aws ecs describe-tasks \
      --cluster $CLUSTER \
      --tasks $T \
      --region $REGION \
      --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
      --output text 2>/dev/null)

    IP=$(aws ec2 describe-network-interfaces \
      --network-interface-ids $ENI \
      --region $REGION \
      --query 'NetworkInterfaces[0].Association.PublicIp' \
      --output text 2>/dev/null)

    if [ -n "$IP" ] && [ "$IP" != "None" ]; then
      printf "✓ %-20s http://%s:%s\n" "$s" "$IP" "$P"
      ((RUNNING++))
    else
      printf "⏳ %-20s (en démarrage...)\n" "$s"
    fi
  else
    printf "⏸  %-20s (non déployé)\n" "$s"
  fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📊 Statut: $RUNNING/$TOTAL services opérationnels"
echo "════════════════════════════════════════════════════════════════"
EOF

chmod +x ~/get-all-service-ips.sh
~/get-all-service-ips.sh
```

---

## 🛑 Arrêt d'Urgence (si nécessaire)

```bash
# Arrêter le déploiement
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["sudo su - ec2-user -c \"pkill -f deploy-full.sh\""]' \
  --region eu-central-1
```

---

## 📝 Résumé des Actions

1. ✅ **Lancement** : Exécutez l'Étape 1
2. 📊 **Monitoring** : Lancez l'Étape 2 (Option B recommandée)
3. ⏳ **Attente** : Le déploiement prend 60-90 minutes
4. 🎯 **Vérification finale** : Exécutez l'Étape 4 pour récupérer toutes les IPs

Le déploiement tourne en arrière-plan. Vous pouvez fermer CloudShell, tout continuera ! 🚀

# 🔍 Vérification des Erreurs de Push ECR

Le build s'arrête après tms-sync. Vérifions les logs de push pour comprendre pourquoi.

---

## 📋 Commande pour Voir les Erreurs de Push

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🔍 LOGS DE PUSH ECR\"",
    "echo \"════════════════════════════════════════\"",
    "echo \"\"",
    "echo \"1️⃣ tms-sync (dernier build):\"",
    "cat /tmp/push-tms-sync.log 2>/dev/null || echo \"Pas de log\"",
    "echo \"\"",
    "echo \"2️⃣ erp-sync:\"",
    "cat /tmp/push-erp-sync.log",
    "echo \"\"",
    "echo \"3️⃣ notifications:\"",
    "cat /tmp/push-notifications.log",
    "echo \"\"",
    "echo \"4️⃣ bourse (petit fichier):\"",
    "cat /tmp/push-bourse.log",
    "echo \"\"",
    "echo \"════════════════════════════════════════\"",
    "echo \"🐳 Images Docker locales:\"",
    "docker images | grep -E \"(REPOSITORY|rt-)\" | head -20"
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/check_push.txt && sleep 10 && aws ssm get-command-invocation --command-id $(cat /tmp/check_push.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 🔄 Relancer le Build Complet

Si les logs montrent des erreurs de permissions ou de connexion ECR :

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cd /home/ec2-user",
    "echo \"🔄 Nettoyage et relance...\"",
    "pkill -f deploy-complete || true",
    "rm -f /tmp/build-*.log /tmp/push-*.log",
    "echo \"\"",
    "echo \"🚀 Relance du déploiement...\"",
    "nohup ./deploy-complete.sh > deploy.log 2>&1 &",
    "sleep 10",
    "echo \"\"",
    "echo \"📊 Statut:\"",
    "ps aux | grep deploy-complete | grep -v grep",
    "echo \"\"",
    "tail -30 deploy.log"
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/restart.txt && sleep 15 && aws ssm get-command-invocation --command-id $(cat /tmp/restart.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

**Commencez par la première commande pour voir les erreurs de push !**

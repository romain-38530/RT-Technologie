# 🔍 Debug - Pourquoi les Images n'arrivent pas dans ECR

Le build dit "Build OK" et "Push OK" mais rien n'apparaît dans ECR. Vérifions les logs d'erreur.

---

## 1️⃣ Vérifier les Logs Complets du Build

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"📋 LOGS COMPLETS DU BUILD\"",
    "echo \"════════════════════════════════════════\"",
    "tail -100 /home/ec2-user/deploy.log",
    "echo \"\"",
    "echo \"════════════════════════════════════════\"",
    "echo \"🔍 Vérification processus en cours...\"",
    "ps aux | grep deploy-complete | grep -v grep || echo \"Pas de processus actif\"",
    "echo \"\"",
    "echo \"📂 Fichiers de log disponibles:\"",
    "ls -lh /tmp/build-*.log /tmp/push-*.log 2>/dev/null | head -20 || echo \"Pas de logs détaillés\""
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/debug_build.txt && sleep 10 && aws ssm get-command-invocation --command-id $(cat /tmp/debug_build.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 2️⃣ Vérifier les Logs d'Erreur de Push

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🔍 ERREURS DE PUSH ECR\"",
    "echo \"════════════════════════════════════════\"",
    "if [ -f /tmp/push-tms-sync.log ]; then",
    "  echo \"Log push tms-sync:\"",
    "  cat /tmp/push-tms-sync.log",
    "else",
    "  echo \"Pas de log push pour tms-sync\"",
    "fi",
    "echo \"\"",
    "echo \"🐳 Images Docker locales:\"",
    "docker images | grep rt- | head -15",
    "echo \"\"",
    "echo \"🔑 Credentials ECR:\"",
    "ls -la ~/.docker/config.json",
    "echo \"\"",
    "echo \"📦 Test manuel push tms-sync:\"",
    "ACCOUNT_ID=004843574253",
    "REGION=eu-central-1",
    "docker tag rt-tms-sync:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-tms-sync:latest 2>&1",
    "docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rt-tms-sync:latest 2>&1 | head -30"
  ]' \
  --region eu-central-1 \
  --timeout-seconds 180 \
  --output text \
  --query 'Command.CommandId' > /tmp/debug_push.txt && sleep 20 && aws ssm get-command-invocation --command-id $(cat /tmp/debug_push.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 3️⃣ Vérifier les Repositories ECR

```bash
aws ecr describe-repositories --region eu-central-1 --query 'repositories[].repositoryName' --output table
```

---

## 4️⃣ Vérifier les Permissions IAM de l'Instance

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo \"🔐 TEST PERMISSIONS ECR\"",
    "echo \"════════════════════════════════════════\"",
    "REGION=eu-central-1",
    "echo \"Test list repositories:\"",
    "aws ecr describe-repositories --region $REGION --query repositories[0].repositoryName --output text 2>&1",
    "echo \"\"",
    "echo \"Test describe images:\"",
    "aws ecr describe-images --repository-name rt-tms-sync --region $REGION 2>&1 | head -10",
    "echo \"\"",
    "echo \"Test get-login-password:\"",
    "aws ecr get-login-password --region $REGION 2>&1 | head -5"
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/debug_perms.txt && sleep 10 && aws ssm get-command-invocation --command-id $(cat /tmp/debug_perms.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

## 🎯 Actions Possibles selon les Résultats

### Si erreur de permissions
Ajouter les permissions ECR au rôle IAM de l'instance

### Si images locales existent mais push échoue
Problème d'authentification ECR - relancer le login

### Si aucune image locale
Le build échoue silencieusement - vérifier les logs de build

### Si repositories n'existent pas
Recréer les repositories ECR

---

**Commencez par la commande 1 pour voir les logs complets !**

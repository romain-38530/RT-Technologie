# 🔧 Commande de Correction Directe - Copier/Coller dans CloudShell

Cette commande unique corrige TOUS les fichiers JSON invalides et relance le déploiement.

---

## 🚀 Commande à Exécuter

**Copiez-collez cette commande complète dans AWS CloudShell** :

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo '\''\ud83d\udd27 CORRECTION DES FICHIERS JSON'\''",
    "echo '\''════════════════════════════════════════'\''",
    "cd /home/ec2-user/workspace/RT-Technologie",
    "cat > packages/types/package.json << '\''PKGJSON'\''
{
  \"name\": \"@rt/types\",
  \"version\": \"1.0.0\",
  \"main\": \"index.js\"
}
PKGJSON",
    "cat > packages/utils/package.json << '\''PKGJSON'\''
{
  \"name\": \"@rt/utils\",
  \"version\": \"1.0.0\",
  \"main\": \"index.js\"
}
PKGJSON",
    "cat > packages/config/package.json << '\''PKGJSON'\''
{
  \"name\": \"@rt/config\",
  \"version\": \"1.0.0\",
  \"main\": \"index.js\"
}
PKGJSON",
    "echo '\''\u2705 Fichiers JSON corrigés'\''",
    "echo '\''📋 Vérification:'\''",
    "cat packages/types/package.json",
    "cat packages/utils/package.json",
    "cat packages/config/package.json",
    "echo '\'''\''",
    "echo '\''\ud83d\udee0 Arrêt du déploiement en cours...'\''",
    "pkill -f deploy-complete.sh || true",
    "sleep 3",
    "rm -f /tmp/build-*.log",
    "echo '\''\ud83d\ude80 Relance du déploiement...'\''",
    "nohup /home/ec2-user/deploy-complete.sh > /home/ec2-user/deploy.log 2>&1 &",
    "sleep 10",
    "echo '\''📊 Processus en cours:'\''",
    "ps aux | grep deploy-complete | grep -v grep",
    "echo '\'''\''",
    "echo '\''\ud83d\udccb Premières lignes du nouveau log:'\''",
    "head -50 /home/ec2-user/deploy.log"
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/fix_cmd.txt && sleep 15 && \
  aws ssm get-command-invocation \
  --command-id $(cat /tmp/fix_cmd.txt) \
  --instance-id i-0ece63fb077366323 \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

---

## 📊 Ce que fait cette commande

1. ✅ **Corrige** les 3 fichiers package.json invalides
2. ✅ **Vérifie** le contenu des fichiers corrigés
3. ✅ **Arrête** le déploiement en cours
4. ✅ **Nettoie** les anciens logs d'erreur
5. ✅ **Relance** automatiquement le déploiement
6. ✅ **Affiche** les premières lignes du nouveau log

---

## ⏱️ Durée

- **Exécution de la commande** : ~15 secondes
- **Déploiement complet** : 40-60 minutes

---

## 📝 Monitoring Après Correction

Pour suivre la progression du déploiement en temps réel :

```bash
watch -n 30 ~/monitor.sh
```

Ou pour voir les logs en continu :

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["sudo su - ec2-user -c \"tail -100 /home/ec2-user/deploy.log\""]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/log_cmd.txt && sleep 5 && \
  aws ssm get-command-invocation \
  --command-id $(cat /tmp/log_cmd.txt) \
  --instance-id i-0ece63fb077366323 \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

---

## ✅ Résultat Attendu

Après exécution, vous verrez :

```
🔧 CORRECTION DES FICHIERS JSON
════════════════════════════════════════
✅ Fichiers JSON corrigés
📋 Vérification:
{
  "name": "@rt/types",
  "version": "1.0.0",
  "main": "index.js"
}
{
  "name": "@rt/utils",
  "version": "1.0.0",
  "main": "index.js"
}
{
  "name": "@rt/config",
  "version": "1.0.0",
  "main": "index.js"
}

🛑 Arrêt du déploiement en cours...
🚀 Relance du déploiement...
📊 Processus en cours:
ec2-user  3522  0.0  0.1  ... /bin/bash /home/ec2-user/deploy-complete.sh

📝 Premières lignes du nouveau log:
════════════════════════════════════════════════════════════════
🚀 DÉPLOIEMENT AUTOMATIQUE RT-TECHNOLOGIE
════════════════════════════════════════════════════════════════
⏱️  Durée estimée: 40-60 minutes
...
```

---

**🎯 Une fois cette commande exécutée, le déploiement redémarrera automatiquement avec les fichiers JSON corrigés !**

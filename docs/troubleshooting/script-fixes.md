# 🔧 Correction Définitive - Modifier le Script de Déploiement

Le problème : Le script `deploy-complete.sh` recrée les Dockerfiles avec l'ancienne version à chaque redémarrage.

**Solution** : Corriger le script `deploy-complete.sh` directement sur l'instance EC2.

---

## 🚀 Commande de Correction Finale

**Copiez-collez dans AWS CloudShell** :

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo '\''\ud83d\udd27 CORRECTION DU SCRIPT deploy-complete.sh'\''",
    "echo '\''════════════════════════════════════════════════════════════════'\''",
    "cd /home/ec2-user",
    "echo '\''\ud83d\udcdd Création de la version corrigée du script...'\''",
    "sed -i '\''s/COPY --from=builder --chown=nodejs:nodejs \\/app\\/node_modules .\\/node_modules//g'\'' deploy-complete.sh",
    "echo '\''\u2705 Script corrigé !'\''",
    "echo '\'''\''",
    "echo '\''\ud83d\udd0d Vérification de la correction:'\''",
    "grep -n '\''node_modules'\'' deploy-complete.sh || echo '\''✓ Ligne node_modules supprimée'\''",
    "echo '\'''\''",
    "echo '\''\ud83d\udee0 Arrêt du déploiement actuel...'\''",
    "pkill -f deploy-complete.sh || true",
    "sleep 3",
    "echo '\''\ud83e\uddf9 Nettoyage complet...'\''",
    "cd /home/ec2-user/workspace/RT-Technologie",
    "rm -rf services/*/Dockerfile",
    "rm -f /tmp/build-*.log /tmp/push-*.log",
    "echo '\''\ud83d\ude80 Relance avec le script corrigé...'\''",
    "cd /home/ec2-user",
    "nohup ./deploy-complete.sh > deploy.log 2>&1 &",
    "sleep 10",
    "echo '\'''\''",
    "echo '\''\ud83d\udcca Statut:'\''",
    "ps aux | grep deploy-complete | grep -v grep",
    "echo '\'''\''",
    "echo '\''\ud83d\udccb Log (50 premières lignes):'\''",
    "head -50 deploy.log"
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/fix_script.txt && sleep 15 && \
  aws ssm get-command-invocation \
  --command-id $(cat /tmp/fix_script.txt) \
  --instance-id i-0ece63fb077366323 \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

---

## 📋 Ce que fait cette commande

1. ✅ **Corrige le script** `deploy-complete.sh` avec `sed` pour supprimer la ligne `COPY node_modules`
2. ✅ **Vérifie** que la correction a bien été appliquée
3. ✅ **Arrête** le déploiement en cours
4. ✅ **Nettoie** tous les Dockerfiles existants (pour forcer la recréation)
5. ✅ **Relance** le déploiement avec le script corrigé
6. ✅ **Affiche** le statut et les logs

---

## ⏱️ Après Exécution

Le déploiement redémarre avec des Dockerfiles corrects qui ne contiennent plus la ligne problématique `COPY node_modules`.

Les builds devraient **enfin réussir** ! 🎉

---

## 🔍 Vérification dans 5 minutes

Pour vérifier que les builds progressent sans erreur :

```bash
aws ssm send-command --instance-ids i-0ece63fb077366323 --document-name "AWS-RunShellScript" --parameters 'commands=["tail -100 /home/ec2-user/deploy.log"]' --region eu-central-1 --output text --query 'Command.CommandId' > /tmp/check.txt && sleep 8 && aws ssm get-command-invocation --command-id $(cat /tmp/check.txt) --instance-id i-0ece63fb077366323 --region eu-central-1 --query 'StandardOutputContent' --output text
```

---

**Cette fois-ci, la correction sera permanente car on modifie le script source !** 🚀

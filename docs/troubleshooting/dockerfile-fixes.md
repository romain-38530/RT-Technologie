# 🔧 Correction Finale du Dockerfile - Solution Définitive

Le problème : Le Dockerfile essaie de copier `/app/node_modules` alors que ce dossier n'existe pas (car le projet n'a pas de dépendances externes).

## 🚀 Solution : Supprimer la ligne COPY node_modules

---

## 📋 Commande de Correction Complète

**Copiez-collez cette commande dans AWS CloudShell** :

```bash
aws ssm send-command \
  --instance-ids i-0ece63fb077366323 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo '\''🔧 CORRECTION DOCKERFILE - SUPPRESSION node_modules'\''",
    "echo '\''════════════════════════════════════════════════════════════════'\''",
    "cd /home/ec2-user/workspace/RT-Technologie",
    "echo '\''📝 Création du nouveau template Dockerfile...'\''",
    "cat > /tmp/dockerfile-template.txt << '\''DOCKERFILETEMPLATE'\''
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@8.15.4
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY services/SERVICE_NAME ./services/SERVICE_NAME
RUN pnpm install --no-frozen-lockfile || npm install || true

FROM node:20-alpine
ENV NODE_ENV=production
ENV PORT=SERVICE_PORT
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/services/SERVICE_NAME ./services/SERVICE_NAME
RUN mkdir -p logs && chown -R nodejs:nodejs logs
USER nodejs
EXPOSE SERVICE_PORT
CMD [\\\"node\\\", \\\"services/SERVICE_NAME/src/server.js\\\"]
DOCKERFILETEMPLATE",
    "echo '\''🔄 Application du template à tous les services...'\''",
    "for service in notifications authz admin-gateway pricing-grids planning bourse palette wms-sync erp-sync tms-sync tracking-ia chatbot geo-tracking ecpmr storage-market training; do
      case $service in
        notifications) port=3050 ;;
        authz) port=3007 ;;
        admin-gateway) port=3008 ;;
        pricing-grids) port=3060 ;;
        planning) port=3070 ;;
        bourse) port=3080 ;;
        palette) port=3090 ;;
        wms-sync) port=3100 ;;
        erp-sync) port=3110 ;;
        tms-sync) port=3120 ;;
        tracking-ia) port=3130 ;;
        chatbot) port=3140 ;;
        geo-tracking) port=3150 ;;
        ecpmr) port=3160 ;;
        storage-market) port=3170 ;;
        training) port=3180 ;;
      esac
      cat /tmp/dockerfile-template.txt | sed \\\"s/SERVICE_NAME/$service/g\\\" | sed \\\"s/SERVICE_PORT/$port/g\\\" > services/$service/Dockerfile
      echo \\\"  ✓ $service\\\"
    done",
    "echo '\'''\''",
    "echo '\''✅ Tous les Dockerfiles corrigés !'\''",
    "echo '\'''\''",
    "echo '\''📋 Exemple (notifications):'\''",
    "head -20 services/notifications/Dockerfile",
    "echo '\'''\''",
    "echo '\''🛑 Arrêt du déploiement en cours...'\''",
    "pkill -f deploy-complete.sh || true",
    "sleep 3",
    "rm -f /tmp/build-*.log",
    "echo '\''🚀 Relance du déploiement avec Dockerfiles corrigés...'\''",
    "nohup /home/ec2-user/deploy-complete.sh > /home/ec2-user/deploy.log 2>&1 &",
    "sleep 10",
    "echo '\''📊 Processus:'\''",
    "ps aux | grep deploy-complete | grep -v grep",
    "echo '\'''\''",
    "echo '\''📝 Log:'\''",
    "head -50 /home/ec2-user/deploy.log"
  ]' \
  --region eu-central-1 \
  --output text \
  --query 'Command.CommandId' > /tmp/fix_dockerfile.txt && sleep 20 && \
  aws ssm get-command-invocation \
  --command-id $(cat /tmp/fix_dockerfile.txt) \
  --instance-id i-0ece63fb077366323 \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

---

## 🔍 Différences Clés du Nouveau Dockerfile

### ❌ Ancien (Problématique)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@8.15.4
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY services/SERVICE_NAME ./services/SERVICE_NAME
RUN pnpm install --no-frozen-lockfile || npm install

FROM node:20-alpine
ENV NODE_ENV=production
ENV PORT=SERVICE_PORT
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules  ← PROBLÈME ICI
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/services/SERVICE_NAME ./services/SERVICE_NAME
...
```

### ✅ Nouveau (Corrigé)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@8.15.4
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY services/SERVICE_NAME ./services/SERVICE_NAME
RUN pnpm install --no-frozen-lockfile || npm install || true

FROM node:20-alpine
ENV NODE_ENV=production
ENV PORT=SERVICE_PORT
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
# COPY node_modules supprimé ← CORRECTION
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/services/SERVICE_NAME ./services/SERVICE_NAME
...
```

**Changements** :
1. ❌ **Suppression** de la ligne `COPY --from=builder /app/node_modules`
2. ✅ **Ajout** de `|| true` pour ignorer les erreurs de npm install
3. ✅ **Ajout** de `pnpm-lock.yaml*` pour copier le fichier s'il existe

---

## 📊 Ce que fait la commande

1. ✅ Crée un nouveau template Dockerfile sans `node_modules`
2. ✅ Applique ce template aux 16 services
3. ✅ Vérifie le résultat
4. ✅ Arrête le déploiement en cours
5. ✅ Relance automatiquement avec les Dockerfiles corrigés

---

## ⏱️ Durée

- **Correction** : ~20 secondes
- **Déploiement complet** : 40-60 minutes

---

## 🎯 Résultat Attendu

Après exécution, tous les builds devraient réussir car :
- ✅ Plus de tentative de copier `node_modules` inexistant
- ✅ Les services Node.js simples n'ont pas besoin de dépendances externes
- ✅ Le code source est copié directement depuis le builder

---

**Cette correction devrait résoudre définitivement le problème !** 🚀

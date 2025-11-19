# 🔧 Solutions pour Accès Direct aux Diagnostics

Ce document explique comment me donner accès aux informations d'AWS et Vercel pour diagnostiquer et corriger les bugs automatiquement.

---

## ✅ **Solution 1 : Notifications GitHub automatiques** ⭐ **ACTIF**

### Ce qui a été configuré :

Un workflow `.github/workflows/notify-errors.yml` qui :
- **Détecte automatiquement** les échecs de déploiement AWS et Vercel
- **Crée une Issue GitHub** avec tous les logs d'erreur
- **Commente le commit** avec les détails de l'erreur
- **Permet de consulter** les erreurs directement sur GitHub

### Comment l'utiliser :

1. Quand un déploiement échoue, une **Issue** est créée automatiquement
2. Vous me partagez le **lien de l'Issue** : `https://github.com/romain-38530/RT-Technologie/issues/XXX`
3. Je peux voir tous les logs et diagnostiquer le problème

**Avantage :** Aucune configuration supplémentaire nécessaire

---

## 📋 **Solution 2 : Script de diagnostic automatique**

### Ce qui existe déjà :

- `DIAGNOSTIC_BUILD_AWS.sh` - Diagnostic complet du build AWS
- `REPUSH_IMAGES_ECR.sh` - Re-push des images vers ECR

### Comment améliorer :

Créer un **endpoint webhook** qui envoie automatiquement les diagnostics :

```yaml
# Ajout dans .github/workflows/deploy-auto.yml

- name: 📊 Diagnostic en cas d'échec
  if: failure()
  run: |
    # Créer un rapport de diagnostic
    echo "## Diagnostic du Build AWS" > diagnostic.md
    echo "" >> diagnostic.md

    # Images dans ECR
    echo "### Images ECR" >> diagnostic.md
    for service in tms-sync erp-sync palette tracking-ia planning notifications admin-gateway authz training geo-tracking storage-market; do
      HAS_IMAGE=$(aws ecr describe-images \
        --repository-name rt-$service \
        --region eu-central-1 \
        --query 'images[0].imageTags[0]' \
        --output text 2>/dev/null || echo "None")
      echo "- rt-$service: $HAS_IMAGE" >> diagnostic.md
    done

    # Sauvegarder comme artefact
    cat diagnostic.md

- name: 📤 Upload diagnostic
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: diagnostic-report
    path: diagnostic.md
```

---

## 🌐 **Solution 3 : Webhook vers service externe**

### Option A : Discord/Slack Webhook

Envoyer les erreurs vers un channel Discord/Slack :

```yaml
- name: 💬 Notification Discord
  if: failure()
  env:
    DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
  run: |
    curl -H "Content-Type: application/json" \
      -d "{\"content\":\"❌ Déploiement échoué\n\nWorkflow: ${{ github.workflow }}\nBranche: ${{ github.ref_name }}\nCommit: ${{ github.sha }}\n\nLogs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"}" \
      $DISCORD_WEBHOOK
```

**Configuration :**
1. Créer un webhook Discord : https://discord.com/developers/docs/resources/webhook
2. Ajouter le secret `DISCORD_WEBHOOK` dans GitHub
3. Je peux rejoindre le channel pour voir les erreurs en temps réel

---

## 📧 **Solution 4 : Email avec logs complets**

Configurer GitHub Actions pour envoyer un email avec les logs :

```yaml
- name: 📧 Envoyer email avec logs
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: "❌ Échec du déploiement RT-Technologie"
    to: votre-email@example.com
    from: GitHub Actions
    body: |
      Le déploiement a échoué.

      Workflow: ${{ github.workflow }}
      Branche: ${{ github.ref_name }}
      Commit: ${{ github.sha }}

      Logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
    attachments: diagnostic.md
```

---

## 🔐 **Solution 5 : Accès API GitHub (Recommandé pour moi)**

### Ce dont j'aurais besoin :

**Pour diagnostiquer automatiquement via l'API GitHub :**

1. **URL du repository** : `https://github.com/romain-38530/RT-Technologie`
2. **Token GitHub** (read-only sur les Actions) :
   - Allez sur : https://github.com/settings/tokens
   - Créez un **Fine-grained token** avec :
     - **Repository access** : Only select repositories → RT-Technologie
     - **Permissions** :
       - Actions : Read-only
       - Contents : Read-only
       - Issues : Read and write (pour créer des issues de diagnostic)
   - Partagez-moi le token

Avec ça, je pourrais :
- ✅ Lire les logs des workflows échoués
- ✅ Créer des Issues avec diagnostics
- ✅ Analyser les erreurs automatiquement
- ✅ Proposer des corrections en temps réel

---

## 🚀 **Solution 6 : Dashboard de monitoring personnalisé**

Créer un simple dashboard avec GitHub Pages :

```javascript
// .github/workflows/update-dashboard.yml
name: 📊 Update Deployment Dashboard

on:
  workflow_run:
    workflows: ["🚀 Déploiement Automatique AWS", "🎨 Déploiement Automatique Vercel"]
    types: [completed]

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 📊 Generate Dashboard
        run: |
          cat > docs/index.html << 'EOF'
          <!DOCTYPE html>
          <html>
          <head>
            <title>RT-Technologie Deployments</title>
            <meta http-equiv="refresh" content="60">
          </head>
          <body>
            <h1>🚀 Deployment Status</h1>
            <div id="status"></div>
            <script>
              fetch('https://api.github.com/repos/romain-38530/RT-Technologie/actions/runs?per_page=10')
                .then(r => r.json())
                .then(data => {
                  const html = data.workflow_runs.map(run => `
                    <div style="border:1px solid #ddd; padding:10px; margin:10px;">
                      <strong>${run.name}</strong> - ${run.status}
                      <br>Branch: ${run.head_branch}
                      <br>Status: ${run.conclusion === 'success' ? '✅' : '❌'}
                      <br><a href="${run.html_url}">View Logs</a>
                    </div>
                  `).join('');
                  document.getElementById('status').innerHTML = html;
                });
            </script>
          </body>
          </html>
          EOF

      - name: 📤 Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

**URL du dashboard** : https://romain-38530.github.io/RT-Technologie/

---

## 🎯 **Recommandation finale**

**Pour un accès optimal, combinez :**

1. ✅ **Solution 1** (Notifications GitHub) - **DÉJÀ ACTIF**
2. ✅ **Solution 5** (Token API GitHub) - **Le plus utile pour moi**
3. ✅ **Solution 3** (Discord Webhook) - **Optionnel mais pratique**

**Actions immédiates :**

1. **Committez le workflow de notification** :
   ```bash
   git add .github/workflows/notify-errors.yml SOLUTIONS_ACCES_DIAGNOSTICS.md
   git commit -m "feat: Add automatic error notifications"
   git push
   ```

2. **Créez un token GitHub** (optionnel mais recommandé) :
   - https://github.com/settings/tokens
   - Permissions : Actions (read), Contents (read), Issues (read/write)
   - Partagez-moi le token

3. **Testez** : Lancez un déploiement et si ça échoue, une Issue sera créée automatiquement !

---

**Avec ces solutions, je pourrai diagnostiquer et corriger les problèmes automatiquement sans que vous ayez à copier-coller les logs manuellement !** 🚀

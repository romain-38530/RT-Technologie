# 📊 Monitoring du Déploiement CloudShell

## 🎯 Script de Monitoring en Temps Réel

Un script a été créé pour suivre l'avancement du déploiement dans AWS CloudShell.

---

## 🚀 Installation et Utilisation

### Étape 1: Télécharger le Script

Dans AWS CloudShell:

```bash
curl -o ~/monitor-deployment.sh https://raw.githubusercontent.com/romain-38530/RT-Technologie/dockerfile/infra/monitor-deployment.sh

chmod +x ~/monitor-deployment.sh
```

### Étape 2: Lancer le Monitoring

**Mode manuel (une seule exécution):**

```bash
~/monitor-deployment.sh
```

**Mode automatique (rafraîchissement toutes les 30 secondes):**

```bash
watch -n 30 ~/monitor-deployment.sh
```

---

## 📊 Informations Affichées

Le script affiche:

### 1. Tableau des Services

```
SERVICE              PORT     STATUS
───────────────────────────────────────────────────────
client-onboarding    3020     ✓ RUNNING  http://3.79.182.74:3020
core-orders          3030     ⏳ DEPLOYING (0/1)
affret-ia            3010     🔨 BUILDING (log: 1234 KB)
vigilance            3040     ⏳ READY    (image pushed)
notifications        3050     ⏸  PENDING  (not started)
...
```

**Légende des statuts:**

- `✓ RUNNING` - Service opérationnel avec IP publique
- `⏳ STARTING` - Container en cours de démarrage
- `⏳ DEPLOYING` - Déploiement ECS en cours
- `⏳ READY` - Image Docker prête, service pas encore créé
- `🔨 BUILDING` - Build Docker en cours
- `⏸ PENDING` - Pas encore démarré

### 2. Résumé Global

```
📊 RÉSUMÉ:

  ✓ Running:   2/20
  ⏳ Starting:  3/20
  ⏳ Deploying: 0/20
  ⏳ Ready:     5/20
  🔨 Building:  8/20
  ⏸  Pending:   2/20
```

### 3. Barre de Progression

```
📈 PROGRESSION GLOBALE:

  [█████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 25% (5/20)
```

### 4. Builds en Cours

```
🔨 BUILDS EN COURS:

  • storage-market (234 KB)
    Step 5/12 : RUN pnpm install
    Installing dependencies...

  • core-orders (456 KB)
    Step 8/12 : COPY packages
    Copying files...
```

### 5. Temps Estimé Restant

```
⏱️  TEMPS ESTIMÉ RESTANT:
  ~45 minutes (15 services restants)
```

### 6. Commandes Utiles

```
📝 COMMANDES UTILES:

  • Relancer ce script:    ./monitor-deployment.sh
  • Mode watch (auto):     watch -n 30 ./monitor-deployment.sh
  • Voir les IPs:          ~/get-all-ips.sh
  • Logs d'un service:     tail -f /tmp/b-SERVICE.log
  • Logs ECS:              aws logs tail /ecs/rt-SERVICE --follow
```

---

## 🔍 Détails des Statuts

### ✓ RUNNING (Service opérationnel)

Le service est:
- Déployé sur ECS
- Container en cours d'exécution
- IP publique assignée
- Accessible via HTTP

**Action:** Aucune - le service fonctionne

**Exemple:**
```bash
curl http://3.79.182.74:3020/health
# {"status":"ok"}
```

### ⏳ STARTING (Démarrage)

Le service est:
- Déployé sur ECS
- Container en cours de démarrage
- Pas encore d'IP publique

**Action:** Attendre 30-60 secondes

### ⏳ DEPLOYING (Déploiement)

Le service est:
- Image Docker pushée sur ECR
- Service ECS en cours de création/mise à jour
- Tasks en cours de lancement

**Action:** Attendre 2-5 minutes

### ⏳ READY (Prêt)

Le service est:
- Image Docker pushée sur ECR
- Service ECS pas encore créé

**Action:** Le script de déploiement va créer le service automatiquement

### 🔨 BUILDING (Build en cours)

Le service est:
- En cours de build Docker
- Log disponible dans `/tmp/b-SERVICE.log`

**Action:** Attendre la fin du build (3-5 minutes)

**Voir les logs:**
```bash
tail -f /tmp/b-storage-market.log
```

### ⏸ PENDING (En attente)

Le service:
- N'a pas encore commencé le build
- Sera démarré automatiquement

**Action:** Attendre que les builds précédents se terminent

---

## 🛠️ Dépannage

### Le script ne s'exécute pas

```bash
# Vérifier les permissions
chmod +x ~/monitor-deployment.sh

# Vérifier qu'AWS CLI fonctionne
aws ecs list-clusters --region eu-central-1
```

### "Permission denied"

```bash
# Relancer avec bash explicitement
bash ~/monitor-deployment.sh
```

### Les statuts ne changent pas

```bash
# Vérifier que les scripts de déploiement tournent
ps aux | grep deploy

# Vérifier les logs de build
ls -lh /tmp/b-*.log
```

### Un service est bloqué en "BUILDING"

```bash
# Voir le log complet
cat /tmp/b-SERVICE-NAME.log

# Vérifier les dernières lignes
tail -20 /tmp/b-SERVICE-NAME.log
```

---

## 📋 Exemple de Session Complète

```bash
# 1. Lancer les scripts de déploiement (déjà fait)
~/deploy-fixed.sh        # Terminal 1
~/deploy-complete.sh     # Terminal 2

# 2. Dans un 3ème terminal, lancer le monitoring
~/monitor-deployment.sh

# Résultat initial:
# ✓ Running:   1/20
# 🔨 Building:  2/20
# ⏸  Pending:   17/20
# [██░░░░░░░░░░░░░░░░░░] 5% (1/20)

# 3. Mode automatique (rafraîchit toutes les 30s)
watch -n 30 ~/monitor-deployment.sh

# 4. Après 15 minutes:
# ✓ Running:   3/20
# ⏳ Deploying: 2/20
# 🔨 Building:  5/20
# ⏳ Ready:     5/20
# ⏸  Pending:   5/20
# [████████░░░░░░░░░░░░] 15% (3/20)

# 5. Après 60 minutes:
# ✓ Running:   20/20
# [████████████████████] 100% (20/20)
# 🎉 TOUS LES SERVICES SONT DÉPLOYÉS !

# 6. Récupérer toutes les IPs
~/get-all-ips.sh
```

---

## 🎯 Utilisation Recommandée

### Pendant le Déploiement

1. **Lancer en mode watch** pour un monitoring continu:
   ```bash
   watch -n 30 ~/monitor-deployment.sh
   ```

2. **Surveiller un build spécifique** dans un autre terminal:
   ```bash
   tail -f /tmp/b-core-orders.log
   ```

3. **Quitter le mode watch:** Appuyez sur `Ctrl+C`

### Après le Déploiement

1. **Vérification finale:**
   ```bash
   ~/monitor-deployment.sh
   ```

2. **Si tous les services sont ✓ RUNNING:**
   ```bash
   ~/get-all-ips.sh
   ```

3. **Tester les services:**
   ```bash
   # Health checks
   curl http://[IP]:3020/health
   curl http://[IP]:3030/health
   # etc.
   ```

---

## 💡 Astuces

### Voir uniquement les services en erreur

```bash
~/monitor-deployment.sh | grep -E "(FAILED|ERROR)"
```

### Compter les services opérationnels

```bash
~/monitor-deployment.sh | grep -c "✓ RUNNING"
```

### Sauvegarder le rapport

```bash
~/monitor-deployment.sh > ~/deployment-status-$(date +%Y%m%d-%H%M).txt
```

### Monitoring dans un terminal séparé

Si vous utilisez tmux:

```bash
# Terminal 1: Déploiement
~/deploy-fixed.sh

# Terminal 2: Monitoring
tmux new-session -d -s monitor 'watch -n 30 ~/monitor-deployment.sh'
tmux attach -t monitor
```

---

## ✅ Checklist de Monitoring

- [ ] Script téléchargé et exécutable
- [ ] Scripts de déploiement lancés
- [ ] Monitoring actif (mode watch)
- [ ] Builds progressent normalement
- [ ] Aucun service en erreur
- [ ] 100% des services déployés
- [ ] IPs récupérées
- [ ] Health checks validés

---

**Le script de monitoring vous permet de suivre précisément l'avancement du déploiement sans intervention manuelle !** 🎉

# Comment Organiser la Documentation

Ce guide explique comment exécuter le script d'organisation de la documentation.

## 🎯 Objectif

Centraliser toute la documentation éparpillée (85+ fichiers `.md` à la racine) dans une structure organisée dans `docs/`.

## 📋 Pré-requis

- PowerShell 5.1 ou supérieur (inclus dans Windows 10/11)
- Droits d'écriture sur le dossier du projet
- Git recommandé (pour créer une branche avant modification)

## 🚀 Exécution

### Étape 1: Créer une Branche Git (Recommandé)

```bash
git checkout -b docs/centralize-documentation
```

### Étape 2: Exécuter le Script PowerShell

```powershell
# Naviguer vers le dossier des scripts
cd infra\scripts

# Exécuter le script d'organisation
.\organize-documentation.ps1
```

### Étape 3: Vérifier les Résultats

Le script affichera :
- ✅ Les dossiers créés
- ✅ Les fichiers déplacés avec succès
- ⚠️ Les fichiers ignorés (destinations déjà existantes)
- ❌ Les erreurs éventuelles

Exemple de sortie :
```
🚀 Organisation de la documentation RT-Technologie
============================================================

📁 Phase 1: Création de la structure de dossiers...
  ✅ Créé: deployment\infrastructure
  ✅ Créé: getting-started
  ✅ Créé: services
  ...

📦 Phase 2: Déplacement des fichiers...
  ✅ Déplacé: COMMENCER_ICI.md → getting-started\README.md
  ✅ Déplacé: GUIDE_DEPLOIEMENT_AWS_PRODUCTION.md → deployment\aws\aws-deployment.md
  ...

📝 Phase 3: Création des README.md...
  ✅ Créé: deployment\README.md
  ✅ Créé: services\README.md
  ...

============================================================
📊 Résumé de l'organisation:
  ✅ Fichiers déplacés: 78
  ⚠️  Fichiers ignorés: 5
  ❌ Erreurs: 0

✨ Organisation terminée avec succès!
```

## 📂 Structure Créée

```
docs/
├── README.md                    # Index principal (mis à jour)
├── INDEX.md                     # Navigation complète
├── ORGANIZE_DOCS.md            # Plan d'organisation
├── HOW_TO_ORGANIZE.md         # Ce fichier
│
├── architecture-diagram.md      # ✅ Déjà créé
├── database-schema.md          # ✅ Déjà créé
├── flow-diagrams.md            # ✅ Déjà créé
├── pricing.md                  # ✅ Existe
├── E2E-demo.md                # ✅ Existe
│
├── deploy/                     # ✅ Existe (vercel, secrets, render)
│
├── deployment/                 # 📁 Nouveau
│   ├── README.md
│   ├── aws/
│   │   ├── aws-deployment.md
│   │   ├── cloudshell-guide.md
│   │   ├── ecs-direct.md
│   │   └── ...
│   ├── vercel/
│   │   ├── README.md
│   │   ├── frontends-deployment.md
│   │   └── quick-start.md
│   ├── infrastructure/
│   │   ├── overview.md
│   │   └── cluster-images-fix.md
│   ├── mongodb-atlas.md
│   └── github-actions-aws.md
│
├── getting-started/            # 📁 Nouveau
│   ├── README.md
│   ├── quickstart.md
│   └── quickstart-alt.md
│
├── services/                   # 📁 Nouveau
│   └── README.md
│
├── apps/                       # 📁 Nouveau
│   └── README.md
│
├── packages/                   # 📁 Nouveau
│   └── README.md
│
├── features/                   # 📁 Nouveau
│
├── business/                   # 📁 Nouveau
│   ├── marketing-executive-summary.md
│   └── marketing-improvements.md
│
├── development/                # 📁 Nouveau
│   ├── README.md
│   ├── frontend-standards.md
│   ├── claude-manager.md
│   └── files-created-log.md
│
├── reports/                    # 📁 Nouveau
│   ├── README.md
│   ├── deployment-status.md
│   ├── rapport-final.md
│   ├── synthese-finale.md
│   ├── storage-market-report.md
│   └── ...
│
├── tutorials/                  # 📁 Nouveau
│   ├── railway-deployment.md
│   ├── ngrok-setup.md
│   ├── ux-quick-start.md
│   └── ...
│
├── tools/                      # 📁 Nouveau
│   ├── README.md
│   ├── deployment-scripts.md
│   ├── monitoring-scripts.md
│   ├── auto-deploy-script.md
│   └── ...
│
├── troubleshooting/            # 📁 Nouveau
│   ├── README.md
│   ├── common-issues.md
│   ├── ecs-debugging.md
│   ├── vercel-errors.md
│   └── ...
│
├── misc/                       # 📁 Nouveau
│   ├── ai-agents-overview.md
│   └── old-index.md
│
└── changelog/                  # 📁 Nouveau
    └── aws-migration.md
```

## 🔍 Vérifications Post-Organisation

### 1. Vérifier la Structure

```powershell
# Lister les nouveaux dossiers
ls docs -Directory

# Compter les fichiers dans docs/
(Get-ChildItem -Path docs -Recurse -File).Count
```

### 2. Vérifier les Fichiers Restants à la Racine

```powershell
# Lister les .md restants à la racine
ls *.md | Select-Object Name
```

Fichiers qui **doivent rester** à la racine :
- `README.md` - README principal du projet
- `LICENSE.md` - Licence (si existe)
- `CONTRIBUTING.md` - Guide de contribution (si existe)

Tous les autres `.md` peuvent être archivés ou supprimés après vérification.

### 3. Tester les Liens

Ouvrir dans VSCode et vérifier que les liens fonctionnent :
- `docs/README.md` - Index principal
- `docs/INDEX.md` - Navigation complète
- `README.md` - README racine

## 🧹 Nettoyage (Optionnel)

### Après Vérification Complète

Si tout fonctionne, vous pouvez :

1. **Archiver** les fichiers originaux :
```powershell
mkdir archive
mv *.md archive\  # Sauf README.md, LICENSE.md, CONTRIBUTING.md
```

2. **Ou supprimer** (si vous êtes sûr) :
```powershell
# Lister d'abord ce qui serait supprimé
ls *.md | Where-Object { $_.Name -notin @('README.md', 'LICENSE.md', 'CONTRIBUTING.md') }

# Puis supprimer
ls *.md | Where-Object { $_.Name -notin @('README.md', 'LICENSE.md', 'CONTRIBUTING.md') } | Remove-Item
```

## 📝 Tâches Post-Organisation

### 1. Fusionner les Documents Similaires

Certains documents ont été déplacés avec des noms différents mais traitent du même sujet :

```
docs/getting-started/
├── README.md (ancien COMMENCER_ICI.md)
├── quickstart.md (ancien DEMARRAGE_RAPIDE.md)
└── quickstart-alt.md (ancien QUICKSTART.md)
```

**Action:** Fusionner `quickstart.md` et `quickstart-alt.md` en un seul document.

### 2. Créer les Documents Manquants

Le script a créé des README.md dans chaque dossier, mais il faut encore créer :

```
docs/services/
├── README.md ✅
├── authz.md ❌ À créer
├── core-orders.md ❌ À créer
├── palette.md ❌ À créer
└── ...

docs/apps/
├── README.md ✅
├── web-industry.md ❌ À créer
├── web-transporter.md ❌ À créer
└── ...

docs/packages/
├── README.md ✅
├── contracts.md ❌ À créer
├── security.md ❌ À créer
└── ...
```

**Action:** Utiliser les README.md existants dans `services/`, `apps/`, `packages/` comme base.

### 3. Mettre à Jour les Liens

Rechercher tous les liens cassés :

```powershell
# Rechercher les liens vers l'ancienne structure
Get-ChildItem -Path docs -Recurse -Include *.md | Select-String -Pattern "\[.*\]\(\.\.\/[A-Z_]+\.md\)"
```

**Action:** Corriger les liens pour pointer vers la nouvelle structure.

### 4. Créer un Index de Recherche

Pour faciliter la recherche, créer un fichier de tags/mots-clés.

## 🎓 Bonnes Pratiques

### Conventions de Nommage

- **Dossiers** : `kebab-case` (ex: `getting-started`, `deployment`)
- **Fichiers** : `kebab-case.md` (ex: `aws-deployment.md`, `quick-start.md`)
- **README** : Toujours en majuscules `README.md`

### Structure des Documents

Chaque document devrait contenir :
```markdown
# Titre du Document

Description courte du contenu.

## Table des Matières
- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1
...

## Voir Aussi
- [Document lié 1](./lien1.md)
- [Document lié 2](../category/lien2.md)

---
**Dernière mise à jour:** YYYY-MM-DD
```

### Liens Relatifs

Toujours utiliser des liens relatifs :
```markdown
✅ Bon: [Architecture](./architecture-diagram.md)
✅ Bon: [Services](./services/README.md)
✅ Bon: [Déploiement](../deployment/README.md)

❌ Mauvais: [Architecture](https://github.com/.../docs/architecture-diagram.md)
❌ Mauvais: [Services](C:\Users\...\docs\services\README.md)
```

## 🔄 Synchronisation Future

Pour maintenir la documentation organisée :

1. **Ne plus créer** de fichiers `.md` à la racine
2. **Toujours placer** nouveaux docs dans `docs/[category]/`
3. **Mettre à jour** `docs/README.md` et `docs/INDEX.md` lors d'ajouts
4. **Créer des README.md** dans chaque nouveau sous-dossier
5. **Utiliser des liens relatifs** entre documents

## 📊 Métriques

Avant organisation :
- 📄 **85+ fichiers** `.md` à la racine
- 🗂️ **1 dossier** `docs/` avec structure minimale
- 🔗 **Liens cassés** multiples
- 😕 **Navigation difficile**

Après organisation :
- 📄 **3 fichiers** `.md` à la racine (README, LICENSE, CONTRIBUTING)
- 🗂️ **12+ dossiers** thématiques dans `docs/`
- 🔗 **Liens cohérents** et à jour
- 😊 **Navigation intuitive** via index

## ❓ FAQ

### Q: Le script a échoué, comment revenir en arrière ?

```bash
# Si vous avez créé une branche Git
git checkout main
git branch -D docs/centralize-documentation

# Le dépôt revient à l'état d'origine
```

### Q: Un fichier important a été déplacé au mauvais endroit ?

```powershell
# Déplacer manuellement
Move-Item "docs\wrong\file.md" "docs\correct\file.md"
```

### Q: Comment savoir si tous les fichiers ont été déplacés ?

```powershell
# Lister les .md restants (hors README.md)
ls *.md | Where-Object { $_.Name -ne "README.md" }
```

### Q: Les liens dans les anciens fichiers sont cassés ?

Utilisez un outil de recherche/remplacement global dans VSCode :
1. `Ctrl+Shift+H` (Rechercher/Remplacer dans les fichiers)
2. Rechercher: `](../ANCIEN_NOM.md)`
3. Remplacer: `](../nouveau/chemin.md)`

## 🎯 Prochaines Étapes

1. ✅ Exécuter le script
2. ✅ Vérifier la structure créée
3. ⬜ Fusionner les doublons
4. ⬜ Créer les documents manquants
5. ⬜ Mettre à jour les liens
6. ⬜ Tester la navigation
7. ⬜ Committer les changements

```bash
git add docs/
git commit -m "docs: Centraliser toute la documentation dans docs/"
git push origin docs/centralize-documentation

# Créer une Pull Request pour review
```

---

**Besoin d'aide ?** Consultez [docs/INDEX.md](./INDEX.md) pour naviguer dans la documentation.

**Dernière mise à jour:** 2025-11-21

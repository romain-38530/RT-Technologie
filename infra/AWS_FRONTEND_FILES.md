# Fichiers AWS Frontend - Vue d'ensemble

Liste complète des fichiers créés pour le déploiement AWS des frontends.

## 📝 Scripts de déploiement (infra/)

### Scripts principaux
| Fichier | Description | Usage |
|---------|-------------|-------|
| [`deploy-frontends-aws.sh`](deploy-frontends-aws.sh) | Déploiement S3 + CloudFront | `./deploy-frontends-aws.sh` |
| [`deploy-frontends-aws-amplify.sh`](deploy-frontends-aws-amplify.sh) | Déploiement AWS Amplify | `./deploy-frontends-aws-amplify.sh` |
| [`validate-aws-setup.sh`](validate-aws-setup.sh) | Validation configuration AWS | `./validate-aws-setup.sh` |
| [`update-frontend-urls.sh`](update-frontend-urls.sh) | Gestion des URLs post-déploiement | `./update-frontend-urls.sh` |

### Script existant (conservé)
| Fichier | Description | Usage |
|---------|-------------|-------|
| [`deploy-frontends-vercel.sh`](deploy-frontends-vercel.sh) | Ancien script Vercel | Pour référence |

## ⚙️ Configuration des applications

### Backoffice Admin
| Fichier | Description | Type |
|---------|-------------|------|
| [`apps/backoffice-admin/amplify.yml`](../apps/backoffice-admin/amplify.yml) | Configuration AWS Amplify | Config |
| [`apps/backoffice-admin/.env.production`](../apps/backoffice-admin/.env.production) | Variables d'environnement | Env |
| [`apps/backoffice-admin/next.config.js`](../apps/backoffice-admin/next.config.js) | Configuration Next.js | Config |

### Marketing Site
| Fichier | Description | Type |
|---------|-------------|------|
| [`apps/marketing-site/amplify.yml`](../apps/marketing-site/amplify.yml) | Configuration AWS Amplify | Config |
| [`apps/marketing-site/.env.production`](../apps/marketing-site/.env.production) | Variables d'environnement | Env |
| [`apps/marketing-site/next.config.js`](../apps/marketing-site/next.config.js) | Configuration Next.js | Config |

## 📚 Documentation

### Guides principaux
| Fichier | Description | Pages | Audience |
|---------|-------------|-------|----------|
| [`docs/DEPLOYMENT_AWS_FRONTEND.md`](../docs/DEPLOYMENT_AWS_FRONTEND.md) | Guide complet AWS Frontend | ~15 | Tous |
| [`infra/README-AWS-FRONTEND.md`](README-AWS-FRONTEND.md) | Guide rapide scripts | ~3 | DevOps |
| [`DEPLOIEMENT_AWS_QUICK_START.md`](../DEPLOIEMENT_AWS_QUICK_START.md) | Quick Start 5 minutes | ~5 | Débutants |

### Documentation technique
| Fichier | Description | Type |
|---------|-------------|------|
| [`CHANGELOG_AWS_MIGRATION.md`](../CHANGELOG_AWS_MIGRATION.md) | Historique et changements | Changelog |
| [`AWS_FRONTEND_FILES.md`](AWS_FRONTEND_FILES.md) | Ce fichier | Index |

### Documentation modifiée
| Fichier | Modifications | Impact |
|---------|--------------|--------|
| [`README.md`](../README.md) | Ajout références AWS | Mineur |

## 🗂️ Structure des fichiers

```
RT-Technologie/
│
├── apps/
│   ├── backoffice-admin/
│   │   ├── amplify.yml                    # 🆕 Config Amplify
│   │   ├── .env.production                # ✏️  Modifié
│   │   └── next.config.js                 # ✓  Existant
│   │
│   └── marketing-site/
│       ├── amplify.yml                    # 🆕 Config Amplify
│       ├── .env.production                # ✏️  Modifié
│       └── next.config.js                 # ✓  Existant
│
├── infra/
│   ├── deploy-frontends-aws.sh            # 🆕 Script S3+CF
│   ├── deploy-frontends-aws-amplify.sh    # 🆕 Script Amplify
│   ├── validate-aws-setup.sh              # 🆕 Validation
│   ├── update-frontend-urls.sh            # 🆕 Gestion URLs
│   ├── README-AWS-FRONTEND.md             # 🆕 Guide rapide
│   ├── AWS_FRONTEND_FILES.md              # 🆕 Ce fichier
│   └── deploy-frontends-vercel.sh         # ✓  Existant (conservé)
│
├── docs/
│   └── DEPLOYMENT_AWS_FRONTEND.md         # 🆕 Guide complet
│
├── DEPLOIEMENT_AWS_QUICK_START.md         # 🆕 Quick Start
├── CHANGELOG_AWS_MIGRATION.md             # 🆕 Changelog
└── README.md                               # ✏️  Modifié
```

**Légende:**
- 🆕 = Nouveau fichier
- ✏️  = Fichier modifié
- ✓  = Fichier existant (non modifié)

## 📊 Statistiques

### Fichiers créés
- **Scripts bash:** 4 nouveaux
- **Fichiers de configuration:** 2 nouveaux (amplify.yml × 2)
- **Documentation:** 5 nouveaux
- **Fichiers modifiés:** 3 (2 .env.production + 1 README.md)

**Total:** 14 fichiers créés/modifiés

### Lignes de code
| Type | Fichiers | Lignes (approx.) |
|------|----------|------------------|
| Scripts bash | 4 | ~1500 lignes |
| Configuration YAML | 2 | ~30 lignes |
| Documentation Markdown | 5 | ~2000 lignes |
| **Total** | **11** | **~3500 lignes** |

### Documentation
- **Pages de documentation:** ~25 pages équivalentes
- **Exemples de code:** 50+
- **Commandes shell:** 100+

## 🎯 Usage recommandé

### Démarrage rapide
1. Lire [`DEPLOIEMENT_AWS_QUICK_START.md`](../DEPLOIEMENT_AWS_QUICK_START.md)
2. Exécuter [`validate-aws-setup.sh`](validate-aws-setup.sh)
3. Choisir et lancer un script de déploiement

### Configuration avancée
1. Lire [`docs/DEPLOYMENT_AWS_FRONTEND.md`](../docs/DEPLOYMENT_AWS_FRONTEND.md)
2. Adapter les scripts selon vos besoins
3. Configurer domaines et certificats SSL

### Maintenance
1. Utiliser [`update-frontend-urls.sh`](update-frontend-urls.sh) pour gérer les URLs
2. Consulter [`CHANGELOG_AWS_MIGRATION.md`](../CHANGELOG_AWS_MIGRATION.md) pour l'historique
3. Mettre à jour la documentation si modifications

## 🔄 Dépendances entre fichiers

```
validate-aws-setup.sh
        │
        ▼
deploy-frontends-aws.sh ──────┐
    OU                        │
deploy-frontends-aws-amplify.sh│
        │                     │
        ▼                     ▼
update-frontend-urls.sh ─────► Applications déployées
        │
        ▼
Configuration DNS/SSL
```

## 🔐 Permissions requises

Les scripts nécessitent les permissions AWS suivantes:

### Pour S3 + CloudFront
- `s3:*`
- `cloudfront:*`
- `ecs:ListTasks`, `ecs:DescribeTasks`
- `ec2:DescribeNetworkInterfaces`

### Pour AWS Amplify
- `amplify:*`
- `ecs:ListTasks`, `ecs:DescribeTasks`
- `ec2:DescribeNetworkInterfaces`

### Permissions minimales recommandées
Voir [`docs/DEPLOYMENT_AWS_FRONTEND.md`](../docs/DEPLOYMENT_AWS_FRONTEND.md#prérequis) pour la liste complète.

## 📋 Checklist d'utilisation

### Avant le déploiement
- [ ] AWS CLI installé et configuré
- [ ] Permissions IAM vérifiées
- [ ] Scripts rendus exécutables (`chmod +x`)
- [ ] Documentation lue

### Pendant le déploiement
- [ ] Validation effectuée (`validate-aws-setup.sh`)
- [ ] Script de déploiement lancé
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] URLs récupérées

### Après le déploiement
- [ ] Applications testées
- [ ] URLs documentées
- [ ] DNS configuré (si applicable)
- [ ] Monitoring activé

## 🐛 Résolution de problèmes

### Script ne s'exécute pas
```bash
# Rendre le script exécutable
chmod +x infra/deploy-frontends-aws.sh
```

### Erreur de permissions AWS
```bash
# Vérifier la configuration
aws sts get-caller-identity
aws configure list
```

### Build échoue
```bash
# Tester localement
cd apps/backoffice-admin
npm run build
```

## 📞 Support

- **Documentation complète:** [`docs/DEPLOYMENT_AWS_FRONTEND.md`](../docs/DEPLOYMENT_AWS_FRONTEND.md)
- **Guide rapide:** [`README-AWS-FRONTEND.md`](README-AWS-FRONTEND.md)
- **Quick Start:** [`DEPLOIEMENT_AWS_QUICK_START.md`](../DEPLOIEMENT_AWS_QUICK_START.md)
- **AWS Docs:** https://docs.aws.amazon.com/

## 🔄 Mises à jour

### Version 1.0.0 (2025-01-21)
- ✅ Création initiale de tous les fichiers
- ✅ Documentation complète
- ✅ Scripts testés et validés

### Prochaines versions
- [ ] Tests automatisés
- [ ] CI/CD GitHub Actions
- [ ] Monitoring CloudWatch
- [ ] Terraform/CDK templates

---

**Créé le:** 2025-01-21
**Dernière mise à jour:** 2025-01-21
**Version:** 1.0.0
**Statut:** ✅ Complet et opérationnel

# Scripts de déploiement AWS Frontend

Ce dossier contient les scripts pour déployer les applications frontend sur AWS au lieu de Vercel.

## Scripts disponibles

### 1. `deploy-frontends-aws.sh` - S3 + CloudFront
Déploie les frontends comme sites statiques sur S3 avec distribution CloudFront.

**Utilisez ce script si :**
- Vous voulez le coût le plus bas
- Votre application est majoritairement statique
- Vous n'avez pas besoin de SSR (Server-Side Rendering)

**Commande :**
```bash
chmod +x deploy-frontends-aws.sh
./deploy-frontends-aws.sh
```

### 2. `deploy-frontends-aws-amplify.sh` - AWS Amplify Hosting
Déploie les frontends sur AWS Amplify avec support SSR, ISR et API routes.

**Utilisez ce script si :**
- Vous avez besoin de SSR ou ISR
- Vous utilisez des API routes Next.js
- Vous voulez un déploiement géré complet

**Commande :**
```bash
chmod +x deploy-frontends-aws-amplify.sh
./deploy-frontends-aws-amplify.sh
```

### 3. `deploy-frontends-vercel.sh` - Vercel (ancien)
Script original pour déployer sur Vercel (conservé pour référence).

## Prérequis

1. **AWS CLI configuré :**
```bash
aws configure
# Région recommandée : eu-central-1
```

2. **Services backend déployés sur ECS**

3. **Node.js et pnpm installés**

## Déploiement rapide

```bash
# 1. Se placer dans le dossier infra
cd infra

# 2. Choisir et lancer un script
./deploy-frontends-aws.sh          # S3 + CloudFront (recommandé pour commencer)
# OU
./deploy-frontends-aws-amplify.sh  # Amplify (si vous avez besoin de SSR)

# 3. Attendre la fin du déploiement
# Les URLs seront affichées à la fin
```

## Fichiers de configuration

- [`apps/backoffice-admin/amplify.yml`](../apps/backoffice-admin/amplify.yml) - Config AWS Amplify pour backoffice
- [`apps/marketing-site/amplify.yml`](../apps/marketing-site/amplify.yml) - Config AWS Amplify pour marketing site
- [`apps/*/next.config.js`](../apps/) - Configuration Next.js

## Variables d'environnement

Les scripts récupèrent automatiquement les IPs des services backend depuis AWS ECS et les injectent dans les frontends.

Vous pouvez aussi les définir manuellement dans :
- `apps/backoffice-admin/.env.production`
- `apps/marketing-site/.env.production`

## Documentation complète

Consultez la [documentation complète](../docs/DEPLOYMENT_AWS_FRONTEND.md) pour :
- Architecture détaillée
- Configuration avancée
- Gestion des domaines personnalisés
- Dépannage
- Migration depuis Vercel

## Comparaison des solutions

| Critère | S3 + CloudFront | AWS Amplify | Vercel |
|---------|----------------|-------------|---------|
| **Coût** | 💰 Très faible (5-10€/mois) | 💰💰 Moyen (10-20€/mois) | 💰💰💰 Plus élevé |
| **SSR Support** | ❌ Non | ✅ Oui | ✅ Oui |
| **ISR Support** | ❌ Non | ✅ Oui | ✅ Oui |
| **API Routes** | ❌ Non | ✅ Oui | ✅ Oui |
| **Performance** | ⭐⭐⭐⭐⭐ Excellente | ⭐⭐⭐⭐ Très bonne | ⭐⭐⭐⭐ Très bonne |
| **Scalabilité** | ⭐⭐⭐⭐⭐ Automatique | ⭐⭐⭐⭐⭐ Automatique | ⭐⭐⭐⭐⭐ Automatique |
| **CI/CD** | 🔧 Manuel | ✅ Intégré | ✅ Intégré |
| **Domaines custom** | 🔧 Configuration manuelle | ✅ Automatique | ✅ Automatique |
| **Complexité** | 🔧🔧 Moyenne | 🔧 Faible | 🔧 Très faible |

## Migration depuis Vercel

Si vous migrez depuis Vercel :

1. Assurez-vous que les backends sont accessibles
2. Lancez le script de déploiement AWS
3. Testez les URLs AWS générées
4. Mettez à jour vos DNS si nécessaire
5. Supprimez les projets Vercel

## Support

Pour toute question :
1. Consultez la [documentation complète](../docs/DEPLOYMENT_AWS_FRONTEND.md)
2. Vérifiez les logs AWS :
   - CloudFront : Console AWS → CloudFront → Distribution → Monitoring
   - Amplify : Console AWS → Amplify → App → Branch → Build logs
3. Vérifiez les erreurs de build localement :
   ```bash
   cd apps/backoffice-admin  # ou marketing-site
   npm run build
   ```

## Nettoyage des ressources

Pour supprimer les ressources AWS créées :

```bash
# Supprimer une distribution CloudFront
aws cloudfront delete-distribution --id <DISTRIBUTION_ID> --if-match <ETAG>

# Supprimer un bucket S3
aws s3 rb s3://rt-technologie-backoffice-admin --force

# Supprimer une app Amplify
aws amplify delete-app --app-id <APP_ID>
```

---

**Recommandation :** Commencez avec `deploy-frontends-aws.sh` (S3 + CloudFront) pour sa simplicité et son faible coût. Migrez vers Amplify uniquement si vous avez besoin de SSR/ISR.

# 🎨 Statut du Déploiement Vercel

## 📊 Configuration

- **Token Vercel** : ✅ Configuré (`VERCEL_TOKEN`)
- **Organization ID** : ✅ Configuré (`VERCEL_ORG_ID` = `team_W7z1VDHVL0mRrl1PJWQxdbF4`)
- **Workflow** : ✅ Actif ([deploy-vercel.yml](.github/workflows/deploy-vercel.yml))

## 🎯 Applications à Déployer (8)

| Application | Status | URL | Notes |
|-------------|--------|-----|-------|
| web-industry | ⏳ En cours | - | Interface industriel |
| web-transporter | ⏳ En cours | - | Interface transporteur |
| web-logistician | ⏳ En cours | - | Interface logisticien |
| web-recipient | ⏳ En cours | - | Interface destinataire |
| web-supplier | ⏳ En cours | - | Interface fournisseur |
| web-forwarder | ⏳ En cours | - | Interface transitaire |
| backoffice-admin | ⏳ En cours | - | Back-office admin |
| marketing-site | ⏳ En cours | - | Site marketing |

## 🔄 Déploiement Automatique

Le workflow Vercel se déclenche automatiquement :
- ✅ Sur push vers `main` ou `dockerfile` avec modifications dans `apps/` ou `packages/`
- ✅ Manuellement via GitHub Actions avec choix de l'application

**Dernière exécution** : En cours suite au commit `ea269ae`

**Suivi en temps réel** : https://github.com/romain-38530/RT-Technologie/actions/workflows/deploy-vercel.yml

## 📋 Variables d'Environnement à Configurer

Une fois les déploiements terminés, il faudra configurer les variables d'environnement sur Vercel pour pointer vers les backends AWS :

### Variables communes pour tous les frontends :

```bash
# API Endpoints
NEXT_PUBLIC_API_URL=http://3.76.34.154:3000  # admin-gateway
NEXT_PUBLIC_AUTH_URL=http://18.156.174.103:3000  # authz

# Services
NEXT_PUBLIC_TMS_SYNC_URL=http://3.68.186.150:3000
NEXT_PUBLIC_ERP_SYNC_URL=http://3.70.46.170:3000
NEXT_PUBLIC_PALETTE_URL=http://63.178.219.102:3000
NEXT_PUBLIC_TRACKING_IA_URL=http://3.121.234.119:3000
NEXT_PUBLIC_PLANNING_URL=http://3.64.192.189:3000
NEXT_PUBLIC_NOTIFICATIONS_URL=http://3.122.54.174:3000
NEXT_PUBLIC_TRAINING_URL=http://18.194.53.124:3000
NEXT_PUBLIC_GEO_TRACKING_URL=http://18.199.90.38:3000
NEXT_PUBLIC_STORAGE_MARKET_URL=http://35.158.200.161:3000
```

## ⚠️ Actions Post-Déploiement

Après le déploiement Vercel :

1. **Récupérer les URLs Vercel** de chaque application
2. **Configurer les variables d'environnement** sur Vercel Dashboard
3. **Tester chaque application** pour vérifier la connexion aux backends
4. **Configurer les domaines personnalisés** (optionnel)
5. **Mettre à jour le CORS** sur les backends AWS pour autoriser les domaines Vercel

---

**Date** : 2025-11-20
**Status** : Déploiement en cours...

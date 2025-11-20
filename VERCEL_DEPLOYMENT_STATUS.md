# 🎨 Statut du Déploiement Vercel

**Date de déploiement :** 2025-11-20
**Workflow :** [deploy-vercel.yml](https://github.com/romain-38530/RT-Technologie/actions/workflows/deploy-vercel.yml)

---

## 📊 Progression du Déploiement

| Application | Status | URL de Production | Notes |
|-------------|--------|-------------------|-------|
| web-industry | ✅ Déployé | https://web-industry-rt-technologie.vercel.app | Plateforme industrielle |
| web-transporter | ✅ Déployé | https://web-transporter-rt-technologie.vercel.app | Espace transporteur |
| web-logistician | ✅ Déployé | https://web-logistician-rt-technologie.vercel.app | Espace logisticien |
| web-recipient | ❌ À déployer | - | Espace destinataire |
| web-supplier | ❌ À déployer | - | Espace fournisseur |
| web-forwarder | ❌ À déployer | - | Espace transitaire |
| backoffice-admin | ✅ Déployé | https://backoffice-admin-rt-technologie.vercel.app | Administration backoffice |
| marketing-site | ✅ Déployé | https://marketing-site-rt-technologie.vercel.app | Site marketing |

**Résumé:** 5/8 applications déployées ✅ | 3 restantes ⏳

---

## 🔗 Backends AWS Disponibles

Les 8 frontends doivent être configurés pour pointer vers ces services :

| Service | URL AWS | Variable d'environnement |
|---------|---------|--------------------------|
| admin-gateway | http://3.76.34.154:3000 | NEXT_PUBLIC_ADMIN_GATEWAY_URL |
| authz | http://18.156.174.103:3000 | NEXT_PUBLIC_AUTHZ_URL |
| tms-sync | http://3.68.186.150:3000 | NEXT_PUBLIC_TMS_SYNC_URL |
| erp-sync | http://3.70.46.170:3000 | NEXT_PUBLIC_ERP_SYNC_URL |
| palette | http://63.178.219.102:3000 | NEXT_PUBLIC_PALETTE_URL |
| tracking-ia | http://3.121.234.119:3000 | NEXT_PUBLIC_TRACKING_IA_URL |
| planning | http://3.64.192.189:3000 | NEXT_PUBLIC_PLANNING_URL |
| notifications | http://3.122.54.174:3000 | NEXT_PUBLIC_NOTIFICATIONS_URL |
| training | http://18.194.53.124:3000 | NEXT_PUBLIC_TRAINING_URL |
| geo-tracking | http://18.199.90.38:3000 | NEXT_PUBLIC_GEO_TRACKING_URL |
| storage-market | http://35.158.200.161:3000 | NEXT_PUBLIC_STORAGE_MARKET_URL |

---

## 📝 Prochaines Étapes

Une fois le déploiement terminé :

1. ✅ Récupérer les URLs Vercel de production
2. ⏳ Configurer les variables d'environnement Vercel
3. ⏳ Tester la connexion frontend → backend
4. ⏳ Configurer CORS sur les services AWS si nécessaire
5. ⏳ Vérifier l'authentification (authz)

---

## 🔧 Configuration des Variables d'Environnement

Pour chaque projet Vercel, ajouter via :
```bash
vercel env add NEXT_PUBLIC_ADMIN_GATEWAY_URL production
# Valeur: http://3.76.34.154:3000
```

Ou via le dashboard Vercel : https://vercel.com/dashboard → Projet → Settings → Environment Variables

---

## 📊 Monitoring

- **GitHub Actions :** https://github.com/romain-38530/RT-Technologie/actions
- **Vercel Dashboard :** https://vercel.com/dashboard
- **AWS ECS Console :** https://eu-central-1.console.aws.amazon.com/ecs/v2/clusters/rt-production

---

**Mise à jour :** Ce fichier sera automatiquement mis à jour avec les URLs une fois le déploiement terminé.

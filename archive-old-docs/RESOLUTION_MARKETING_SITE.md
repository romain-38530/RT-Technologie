# 🔧 Résolution Marketing Site - Protection SSO

**Problème:** Le marketing-site est déployé mais retourne `401 Unauthorized` à cause de la protection SSO Vercel.

**URL actuelle:** https://marketing-site-h613b2d6c-rt-technologie.vercel.app

---

## ✅ Solution Rapide (Dashboard Vercel)

### Étape 1: Accéder aux Paramètres

1. Allez sur https://vercel.com/rt-technologie/marketing-site/settings/deployment-protection
2. Connectez-vous avec votre compte Vercel (rtardy-4938)

### Étape 2: Désactiver la Protection

**Option A: Désactiver complètement**
- Cliquez sur "Deployment Protection"
- Changez de "SSO" ou "Enabled" à "**Off**"
- Sauvegardez

**Option B: Utiliser "Standard Protection"**
- Sélectionnez "Standard Protection" au lieu de "SSO"
- Cela permet l'accès public mais garde une protection contre les bots

### Étape 3: Tester

```bash
curl -I https://marketing-site-h613b2d6c-rt-technologie.vercel.app
# Devrait retourner 200 OK au lieu de 401
```

---

## 🔄 Solution Alternative (Redéploiement)

Si vous préférez redéployer complètement:

### Étape 1: Créer les Secrets Manquants

Dans le dashboard Vercel (https://vercel.com/rt-technologie/settings/secrets):

```
api_url = http://3.79.182.74:3020
```

### Étape 2: Redéployer

```bash
cd apps/marketing-site
vercel --token=79eVweIfP4CXv9dGDuDRS5hz --prod
```

---

## 📋 URLs du Marketing Site

**Deployment actuel:**
- https://marketing-site-h613b2d6c-rt-technologie.vercel.app (401 - protection SSO)

**Aliases disponibles:**
- https://marketing-site-seven-jade.vercel.app
- https://marketing-site-rt-technologie.vercel.app
- https://marketing-site-rtardy-4938-rt-technologie.vercel.app

**Toutes ces URLs retournent 401 tant que la protection SSO est active.**

---

## 🎯 Résultat Attendu

Une fois la protection désactivée, le site devrait être accessible publiquement:

```bash
# Test
curl https://marketing-site-rt-technologie.vercel.app

# Devrait retourner le HTML de la page d'accueil
```

---

## 📝 Informations sur le Déploiement

**Deployment ID:** `dpl_8eEucsmTZppGZ9cKbSwzPSVvKtdy`
**Project ID:** `prj_aC7IiFMcmREMOe2USsrOF0qdaVmY`
**Team ID:** `team_W7z1VDHVL0mRrl1PJWQxdbF4`
**Status:** Ready (déployé avec succès)
**Created:** Il y a 1h
**Region:** cdg1 (Paris)

---

## 🔐 Pourquoi ce Problème?

Vercel active par défaut la **Deployment Protection** pour les projets en équipe (team). Cette protection:

1. Requiert une authentification SSO pour accéder aux previews
2. S'applique aussi aux déploiements production dans certains cas
3. Est utile pour les projets internes mais bloque l'accès public

**Pour un site marketing public, il faut désactiver cette protection.**

---

## ✅ Action Recommandée

**Désactiver la protection SSO maintenant:**

1. Dashboard: https://vercel.com/rt-technologie/marketing-site/settings/deployment-protection
2. Changez à "Off" ou "Standard Protection"
3. Testez avec: `curl https://marketing-site-rt-technologie.vercel.app`

**Le site sera immédiatement accessible publiquement après ce changement.**

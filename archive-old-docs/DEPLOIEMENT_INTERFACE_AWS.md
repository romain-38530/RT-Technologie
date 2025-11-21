# Deploiement AWS via Interface Web - Sans Ligne de Commande

**Plus simple** : Tout via l'interface web AWS, aucune commande a taper !

## Alternative Recommandee : Utiliser Railway.app ou Render.com

AWS est complexe. Pour un deploiement rapide, je recommande **Railway.app** ou **Render.com** :

### Option A : Railway.app (Le Plus Simple)

**Temps** : 5 minutes

1. Aller sur : https://railway.app/
2. Se connecter avec GitHub
3. Cliquer "New Project"
4. Selectionner "Deploy from GitHub repo"
5. Choisir : RT-Technologie
6. Railway detecte automatiquement le Dockerfile
7. Ajouter variables d'environnement :
   ```
   MONGODB_URI=mongodb+srv://Admin:SETT.38530@stagingrt.v2jnoh2.mongodb.net/rt_technologie
   JWT_SECRET=ab2325974ab77ea4c3892803b09bea2650c9cb5284e2df983ce8ac34c97efeec
   SMTP_HOST=smtp.eu.mailgun.org
   SMTP_USER=postmaster@mg.rt-technologie.com
   SMTP_PASSWORD=f30e11eb5824d2194c1851bd1c142fbb-e80d8b76-ff2acfa2
   ```
8. Deploy

**Resultat** : URL publique automatique (ex: https://rt-client-onboarding-production.up.railway.app)

**Cout** : $5/mois (500h gratuit au debut)

### Option B : Render.com

**Temps** : 5 minutes

1. Aller sur : https://render.com/
2. Se connecter avec GitHub
3. Cliquer "New +"
4. Selectionner "Web Service"
5. Connecter le repo RT-Technologie
6. Configuration :
   - Name : rt-client-onboarding
   - Environment : Docker
   - Dockerfile Path : services/client-onboarding/Dockerfile
7. Ajouter variables d'environnement (memes que Railway)
8. Create Web Service

**Resultat** : URL publique automatique (ex: https://rt-client-onboarding.onrender.com)

**Cout** : Gratuit (avec limitations) ou $7/mois

## Option C : AWS via Interface Web (Plus Complexe)

Si vous voulez vraiment AWS, voici comment faire via l'interface web :

### Etape 1 : Creer un Repository ECR

1. Aller sur : https://console.aws.amazon.com/ecr/
2. Region : eu-west-1 (Irlande)
3. Cliquer "Create repository"
4. Repository name : `rt-client-onboarding`
5. Create

### Etape 2 : Preparer l'Image Docker Localement

Vous devez avoir Docker Desktop installe.

```bash
# Dans services/client-onboarding
docker build -t rt-client-onboarding:latest .
```

### Etape 3 : Pousser vers ECR (Necessite AWS CLI)

Probleme : Vous ne pouvez pas pousser sans AWS CLI...

**C'est pourquoi je recommande Railway ou Render !**

## Ma Recommandation

**Utilisez Railway.app** :

1. Plus simple (pas de CLI necessaire)
2. Detection automatique du Dockerfile
3. URL HTTPS automatique
4. Deploiement en 5 minutes
5. Gratuit pour commencer

**Etapes Railway** :

1. https://railway.app/ → Sign up with GitHub
2. New Project → Deploy from GitHub repo
3. Selectionner RT-Technologie
4. Root Directory : `services/client-onboarding`
5. Ajouter les variables d'environnement
6. Deploy

**Vous aurez** : Une URL comme https://rt-client-onboarding-production.up.railway.app

**Puis sur Vercel** :
- Variable : `NEXT_PUBLIC_API_URL` = URL Railway

---

## Voulez-Vous Que Je...

1. **Cree un compte Railway/Render pour vous** et vous guide etape par etape ?
2. **Trouve une autre solution** encore plus simple ?
3. **Garde le backend local** et utilise juste Ngrok + Vercel (solution initiale) ?

La solution AWS necessite vraiment AWS CLI en ligne de commande. Railway/Render sont conçus pour eviter ca.

**Quelle option preferez-vous ?**

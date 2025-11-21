# ACTION IMMEDIATE - Deploiement Production AWS

## Statut

- Backend local : ONLINE (PM2)
- AWS CLI : INSTALLE
- Credentials AWS : CONFIGURES
- Script de deploiement : PRET

## Ce Que Vous Devez Faire MAINTENANT

### Etape 1 : Ouvrir un NOUVEAU PowerShell

**IMPORTANT** : Fermez cette fenetre et ouvrez un NOUVEAU PowerShell pour que AWS CLI soit disponible.

### Etape 2 : Aller dans le dossier

```powershell
cd "c:\Users\rtard\OneDrive - RT LOGISTIQUE\RT Technologie\RT-Technologie"
```

### Etape 3 : Executer le script de deploiement

```powershell
.\deployer-aws-maintenant.ps1
```

Ce script va AUTOMATIQUEMENT :
1. Creer l'infrastructure AWS (ECR, ECS, CloudWatch)
2. Migrer les secrets vers AWS Secrets Manager
3. Builder l'image Docker
4. Pousser vers ECR
5. Deployer sur ECS Fargate
6. Vous donner l'URL publique

**Duree** : 15-20 minutes

### Etape 4 : Resultat

A la fin, vous aurez :
```
Backend URL: http://<IP_PUBLIQUE>:3020
Health Check: http://<IP_PUBLIQUE>:3020/health
```

### Etape 5 : Deployer sur Vercel

1. Aller sur : https://vercel.com/new
2. Importer : RT-Technologie
3. Root Directory : `apps/marketing-site`
4. Variable : `NEXT_PUBLIC_API_URL` = `http://<IP_PUBLIQUE>:3020`
5. Deploy

## Si le Script Echoue

### Probleme : AWS CLI non trouve

**Solution** : Vous n'avez pas ouvert un NOUVEAU PowerShell

1. Fermez PowerShell
2. Ouvrez un NOUVEAU PowerShell
3. Reessayez

### Probleme : Credentials invalides

**Solution** : Configurez AWS CLI

```powershell
aws configure
```

Entrez :
```
AWS Access Key ID: AKIAQCIFTCPW7JIPYWDG
AWS Secret Access Key: 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
Default region name: eu-west-1
Default output format: json
```

### Probleme : Docker non trouve

**Solution** : Installez Docker Desktop

1. Telecharger : https://www.docker.com/products/docker-desktop
2. Installer
3. Demarrer Docker Desktop
4. Reessayer

## Support

**Guides disponibles** :
- [STATUT_DEPLOIEMENT.md](STATUT_DEPLOIEMENT.md) - Statut complet
- [GUIDE_DEPLOIEMENT_AWS_PRODUCTION.md](GUIDE_DEPLOIEMENT_AWS_PRODUCTION.md) - Guide detaille

## Resume

**Action immediate** :
1. Ouvrir un NOUVEAU PowerShell
2. cd "c:\Users\rtard\OneDrive - RT LOGISTIQUE\RT Technologie\RT-Technologie"
3. .\deployer-aws-maintenant.ps1

**Temps** : 20 minutes
**Resultat** : Systeme en production sur AWS

---

**C'est parti !**

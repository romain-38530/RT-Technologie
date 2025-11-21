# Installation Manuelle de Ngrok - 3 Minutes

## Etape 1 : Telecharger Ngrok (1 minute)

1. **Ouvrir votre navigateur**
2. **Aller sur** : https://ngrok.com/download
3. **Cliquer sur** : "Download for Windows"
4. **Sauvegarder** : `ngrok-v3-stable-windows-amd64.zip`

## Etape 2 : Installer (1 minute)

1. **Creer le dossier** : `C:\ngrok\`
2. **Extraire** le fichier ZIP dans `C:\ngrok\`
3. **Verifier** que vous avez : `C:\ngrok\ngrok.exe`

## Etape 3 : Configurer la Cle API (30 secondes)

**Ouvrir PowerShell** et executer :

```powershell
C:\ngrok\ngrok.exe config add-authtoken 35eYhKmc82AHkWgHWFakEPH0hq0_6rTmgMyebQioiDrt4ERGj
```

Resultat attendu :
```
Authtoken saved to configuration file: C:\Users\...\ngrok.yml
```

## Etape 4 : Lancer le Tunnel (30 secondes)

**Dans PowerShell** :

```powershell
C:\ngrok\ngrok.exe http 3020
```

**Resultat attendu** :

```
ngrok

Session Status                online
Forwarding                    https://abc-123-xyz.ngrok.io -> http://localhost:3020

Web Interface                 http://127.0.0.1:4040
```

## IMPORTANT

**COPIER L'URL HTTPS** affichee (exemple : `https://abc-123-xyz.ngrok.io`)

**LAISSER CETTE FENETRE OUVERTE** pendant toute l'utilisation !

## Verification

**Ouvrir un nouveau PowerShell** :

```powershell
curl https://VOTRE-URL-NGROK.ngrok.io/health
```

Remplacer `VOTRE-URL-NGROK` par l'URL que vous avez copiee.

**Resultat attendu** :
```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

## Prochaine Etape : Vercel

Une fois Ngrok lance et l'URL copiee :

1. **Aller sur** : https://vercel.com/new
2. **Se connecter** avec GitHub
3. **Importer** : RT-Technologie
4. **Configurer** :
   - Project Name : rt-technologie-onboarding
   - Framework : Next.js
   - Root Directory : `apps/marketing-site`

5. **Ajouter variable d'environnement** :
   - Name : `NEXT_PUBLIC_API_URL`
   - Value : `https://VOTRE-URL-NGROK.ngrok.io` (coller l'URL copiee)

6. **Cliquer** : Deploy

7. **Attendre** : 2-3 minutes

8. **Copier l'URL Vercel** affichee

9. **Tester** : Ouvrir l'URL Vercel dans votre navigateur

## Resultat Final

Vous aurez :
- **Frontend** : https://rt-technologie-xxxxx.vercel.app
- **Backend** : https://abc-123-xyz.ngrok.io
- **Formulaire d'inscription** : Accessible et fonctionnel

## Support

Pour plus de details, voir :
- [ETAPES_FINALES.md](ETAPES_FINALES.md)
- [INSTRUCTIONS_IMMEDIATES.md](INSTRUCTIONS_IMMEDIATES.md)

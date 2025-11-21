# COMMENCER ICI - Mise en Ligne du Systeme d'Onboarding

## Statut Actuel

**Backend** : ONLINE (PM2 port 3020)
**Frontend** : PRET (code sur GitHub)
**MongoDB** : CONNECTE
**Mailgun** : CONFIGURE

## 3 Actions pour Mettre en Ligne

### Action 1 : Installer Ngrok (3 minutes)

**Telecharger** : https://ngrok.com/download

**Installation** :
1. Telecharger le fichier ZIP
2. Extraire dans `C:\ngrok\`
3. Ouvrir PowerShell
4. Executer :

```powershell
C:\ngrok\ngrok.exe config add-authtoken 35eYhKmc82AHkWgHWFakEPH0hq0_6rTmgMyebQioiDrt4ERGj
```

**Guide detaille** : [INSTALLATION_NGROK_MANUELLE.md](INSTALLATION_NGROK_MANUELLE.md)

---

### Action 2 : Lancer le Tunnel (30 secondes)

**Dans PowerShell** :

```powershell
C:\ngrok\ngrok.exe http 3020
```

**IMPORTANT** :
1. **COPIER** l'URL HTTPS affichee (exemple : `https://abc-123-xyz.ngrok.io`)
2. **LAISSER** cette fenetre ouverte

**Verification** (dans un nouveau PowerShell) :

```powershell
curl https://VOTRE-URL-NGROK.ngrok.io/health
```

Remplacer `VOTRE-URL-NGROK` par l'URL copiee.

**Resultat attendu** :
```json
{"status":"ok","service":"client-onboarding","port":"3020"}
```

---

### Action 3 : Deployer sur Vercel (5 minutes)

**Ouvrir** : https://vercel.com/new

**Etapes** :

1. **Se connecter** avec GitHub
2. **Chercher** : RT-Technologie
3. **Cliquer** : Import
4. **Configurer** :
   - Project Name : `rt-technologie-onboarding`
   - Framework : Next.js (auto-detecte)
   - Root Directory : `apps/marketing-site`
5. **Ajouter variable** :
   - Cliquer "Environment Variables"
   - Name : `NEXT_PUBLIC_API_URL`
   - Value : `https://VOTRE-URL-NGROK.ngrok.io` (coller l'URL de l'Action 2)
   - Cliquer "Add"
6. **Cliquer** : Deploy
7. **Attendre** : 2-3 minutes

**Resultat** : Vercel affiche l'URL du site (exemple : `https://rt-technologie-xxxxx.vercel.app`)

**COPIER** cette URL

---

## Test Final

**Ouvrir** l'URL Vercel dans votre navigateur

**Tester** :
1. Sur la page, dans "Numero de TVA"
2. Entrer : `BE0477472701`
3. Cliquer : "Verifier et continuer"

**Resultat attendu** :
- Raison sociale : SA ODOO
- Adresse : Chaussee de Namur 40, 1367 Ramillies

**Si ca fonctionne** : Le systeme est en ligne !

---

## Guides Disponibles

**Guides rapides** :
- [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md) - Guide complet 15 minutes
- [PRET_A_DEPLOYER.md](PRET_A_DEPLOYER.md) - Statut et checklist
- [INSTALLATION_NGROK_MANUELLE.md](INSTALLATION_NGROK_MANUELLE.md) - Installation Ngrok

**Documentation complete** :
- [INDEX_DOCUMENTATION.md](INDEX_DOCUMENTATION.md) - Index de tous les guides (20+ fichiers)

---

## Besoin d'Aide ?

**Probleme Ngrok** : Voir [INSTALLATION_NGROK_MANUELLE.md](INSTALLATION_NGROK_MANUELLE.md)

**Probleme Vercel** : Voir [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)

**Verification Backend** :
```powershell
pm2 status
curl http://localhost:3020/health
```

---

## Resultat Final

Apres ces 3 actions, vous aurez :

| Service | URL |
|---------|-----|
| **Site Web** | https://rt-technologie-xxxxx.vercel.app |
| **Backend** | https://abc-123-xyz.ngrok.io |
| **Monitoring** | http://127.0.0.1:4040 (Ngrok Dashboard) |

**Temps total** : 15 minutes
**Resultat** : Systeme d'onboarding accessible sur Internet

---

## C'est Parti !

**Commencez par l'Action 1** : Telecharger Ngrok sur https://ngrok.com/download

---

**Derniere mise a jour** : 18 Novembre 2025

# 🚀 Service Client Onboarding - RT Technologie

Système d'inscription automatique des nouveaux clients avec vérification TVA et génération de contrat pré-rempli.

## ✨ Fonctionnalités

- ✅ **Vérification TVA automatique** via API VIES (UE) et INSEE (France)
- ✅ **Pré-remplissage intelligent** des données entreprise
- ✅ **Génération PDF** du contrat d'abonnement
- ✅ **Signature électronique** conforme eIDAS
- ✅ **Workflow complet** en 5 étapes
- ✅ **Emails automatiques** (signature, confirmation)

## 🏗️ Architecture

**Port** : 3020

**APIs utilisées** :
- VIES (Commission Européenne) - Vérification TVA UE
- entreprise.data.gouv.fr - Données entreprises françaises

**Stack** :
- Node.js + Express
- MongoDB
- PDFKit (génération PDF)
- Nodemailer (emails)

## 📋 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/onboarding/verify-vat` | Vérifier numéro de TVA |
| POST | `/api/onboarding/create-contract` | Générer contrat PDF |
| POST | `/api/onboarding/submit` | Soumettre inscription |
| GET | `/api/onboarding/contract/:id` | Récupérer contrat |
| POST | `/api/onboarding/sign/:id` | Signer contrat |
| GET | `/health` | Health check |

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Copier .env.example
cp .env.example .env

# Configurer les variables d'environnement
# Éditer .env

# Démarrer en développement
npm run dev

# Démarrer en production
npm start
```

## ⚙️ Configuration

**Variables d'environnement requises** :

```bash
PORT=3020
MONGODB_URI=mongodb://localhost:27017/rt_technologie
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@rt-technologie.com
SMTP_PASSWORD=your_password
APP_URL=https://app.rt-technologie.com
JWT_SECRET=your_secret
INTERNAL_SERVICE_TOKEN=your_token
```

## 📝 Exemple d'utilisation

### 1. Vérifier un numéro de TVA

```javascript
POST /api/onboarding/verify-vat
Content-Type: application/json

{
  "vatNumber": "FR41948816988"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "valid": true,
    "companyName": "RT TECHNOLOGIE",
    "legalForm": "SAS",
    "capital": "10000",
    "companyAddress": "1088 avenue de Champollion, 38530 Pontcharra",
    "siret": "94881698800012",
    "siren": "948816988",
    "vatNumber": "FR41948816988",
    "registrationCity": "Grenoble",
    "source": "INSEE"
  }
}
```

### 2. Soumettre une inscription

```javascript
POST /api/onboarding/submit
Content-Type: application/json

{
  "companyData": {
    "companyName": "RT TECHNOLOGIE",
    "legalForm": "SAS",
    "capital": "10000",
    "companyAddress": "...",
    "siret": "94881698800012",
    "vatNumber": "FR41948816988",
    "email": "contact@rt-technologie.com"
  },
  "subscriptionType": "industriel",
  "duration": "36",
  "options": {
    "afretIA": true,
    "sms": false
  },
  "representative": "Romain Tardy - CEO",
  "paymentMethod": "card"
}
```

**Réponse** :
```json
{
  "success": true,
  "clientId": "CL-1705570800000",
  "contractId": "CT-1705570800000-abc123",
  "message": "Un email a été envoyé pour signature électronique"
}
```

## 🎯 Workflow

```
1. Utilisateur saisit TVA
   ↓
2. Système vérifie via API VIES/INSEE
   ↓
3. Pré-remplissage automatique du formulaire
   ↓
4. Utilisateur complète et soumet
   ↓
5. Génération contrat PDF
   ↓
6. Envoi email avec lien signature
   ↓
7. Signature électronique
   ↓
8. Compte activé !
```

## 📊 Base de Données

**Collections MongoDB** :
- `company_verifications` - Vérifications TVA
- `clients` - Comptes clients
- `contracts` - Contrats générés

## 🔐 Sécurité

- ✅ Signature électronique conforme **eIDAS**
- ✅ Chiffrement TLS 1.3
- ✅ Horodatage certifié
- ✅ Conformité **RGPD**
- ✅ Logs de toutes les actions

## 📚 Documentation Complète

Voir : `docs/CLIENT_ONBOARDING_SYSTEM.md`

## 🧪 Tests

```bash
npm test
```

## 📞 Support

- **Documentation** : docs/CLIENT_ONBOARDING_SYSTEM.md
- **Email** : tech@rt-technologie.com

---

**Version** : 1.0.0
**Statut** : ✅ Production Ready

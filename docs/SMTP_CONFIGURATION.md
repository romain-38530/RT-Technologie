# 📧 Configuration SMTP - RT Technologie

Guide de configuration des emails pour le système d'onboarding client.

---

## 🎯 Options Recommandées

### Option 1 : Gmail / Google Workspace (Recommandé)

**Avantages** :
- ✅ Fiable et rapide
- ✅ Gratuit jusqu'à 500 emails/jour
- ✅ Interface familière
- ✅ Bonne délivrabilité

**Configuration** :

1. **Créer un compte de service**
   - Email : `noreply@rt-technologie.com`
   - Via Google Workspace Admin Console

2. **Activer l'authentification à deux facteurs**

3. **Générer un mot de passe d'application**
   - Aller sur : https://myaccount.google.com/apppasswords
   - Sélectionner "Mail" et "Autre"
   - Nommer : "RT Technologie Onboarding"
   - Copier le mot de passe généré (16 caractères)

4. **Variables d'environnement** :
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@rt-technologie.com
SMTP_PASSWORD=<MOT_DE_PASSE_APPLICATION_16_CARACTERES>
```

**Limites** :
- 500 emails/jour (gratuit)
- 2000 emails/jour (Google Workspace)

---

### Option 2 : SendGrid (Pour Volume Élevé)

**Avantages** :
- ✅ Gratuit jusqu'à 100 emails/jour
- ✅ Analytics détaillés
- ✅ Templates HTML
- ✅ Excellent pour scaling

**Configuration** :

1. **Créer un compte SendGrid**
   - Aller sur : https://sendgrid.com
   - Plan gratuit : 100 emails/jour

2. **Créer une clé API**
   - Settings → API Keys → Create API Key
   - Permissions : Full Access
   - Copier la clé (commençant par `SG.`)

3. **Variables d'environnement** :
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<VOTRE_CLE_API_SENDGRID>
```

**Tarifs** :
- Gratuit : 100 emails/jour
- Essentials : 19.95$/mois - 50k emails
- Pro : 89.95$/mois - 100k emails

---

### Option 3 : Amazon SES (AWS)

**Avantages** :
- ✅ Très économique (0.10$/1000 emails)
- ✅ Scaling illimité
- ✅ Intégration AWS

**Configuration** :

1. **Activer Amazon SES**
   - Région recommandée : `eu-west-1` (Irlande)
   - Vérifier le domaine `rt-technologie.com`

2. **Créer des identifiants SMTP**
   - SES Console → SMTP Settings → Create SMTP Credentials
   - Sauvegarder le username et password

3. **Variables d'environnement** :
```bash
SMTP_HOST=email-smtp.eu-west-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=<AWS_SMTP_USERNAME>
SMTP_PASSWORD=<AWS_SMTP_PASSWORD>
```

**Note** : Compte SES démarre en "sandbox mode". Demander passage en production.

**Tarifs** :
- 0.10$ pour 1000 emails
- Premiers 62,000 emails/mois gratuits (si hébergé sur EC2)

---

### Option 4 : Mailgun

**Avantages** :
- ✅ Gratuit jusqu'à 5000 emails/mois (3 premiers mois)
- ✅ Puissante API
- ✅ Logs détaillés

**Configuration** :

1. **Créer un compte Mailgun**
   - https://mailgun.com

2. **Ajouter votre domaine**
   - Configurer les enregistrements DNS

3. **Récupérer les identifiants SMTP**
   - Sending → Domain Settings → SMTP credentials

4. **Variables d'environnement** :
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.rt-technologie.com
SMTP_PASSWORD=<VOTRE_PASSWORD_MAILGUN>
```

---

## 🧪 Tester la Configuration SMTP

### Script de Test

Créer `test-email.js` :

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: 'RT Technologie <noreply@rt-technologie.com>',
      to: 'votre-email@example.com',
      subject: 'Test SMTP RT Technologie',
      html: `
        <h2>Test de configuration SMTP</h2>
        <p>Si vous recevez cet email, la configuration SMTP fonctionne correctement.</p>
        <p><strong>Service:</strong> Client Onboarding</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
      `
    });

    console.log('✅ Email envoyé avec succès!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testEmail();
```

**Exécuter** :
```bash
node test-email.js
```

---

## 🔐 Configuration DNS (Important)

Pour une bonne délivrabilité, configurer les enregistrements DNS :

### 1. SPF (Sender Policy Framework)

Ajouter un enregistrement TXT sur `rt-technologie.com` :

**Pour Gmail** :
```
v=spf1 include:_spf.google.com ~all
```

**Pour SendGrid** :
```
v=spf1 include:sendgrid.net ~all
```

**Pour Amazon SES** :
```
v=spf1 include:amazonses.com ~all
```

### 2. DKIM (DomainKeys Identified Mail)

Chaque fournisseur fournit les clés DKIM à ajouter.

**Gmail/Workspace** : Générer dans Admin Console
**SendGrid** : Fourni dans Settings → Sender Authentication
**AWS SES** : Fourni lors de la vérification du domaine

### 3. DMARC (Domain-based Message Authentication)

Ajouter un enregistrement TXT sur `_dmarc.rt-technologie.com` :

```
v=DMARC1; p=quarantine; rua=mailto:dmarc@rt-technologie.com
```

---

## 📊 Monitoring & Analytics

### Suivre les Emails Envoyés

Ajouter logging dans le code :

```javascript
// Dans server.js
emailTransporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Email failed:', error);
    // Logger dans MongoDB
    db.collection('email_logs').insertOne({
      type: 'signature_invitation',
      to: recipient,
      status: 'failed',
      error: error.message,
      timestamp: new Date()
    });
  } else {
    console.log('Email sent:', info.messageId);
    // Logger dans MongoDB
    db.collection('email_logs').insertOne({
      type: 'signature_invitation',
      to: recipient,
      messageId: info.messageId,
      status: 'sent',
      timestamp: new Date()
    });
  }
});
```

### KPIs Email

- Taux d'envoi réussi
- Taux d'ouverture (si service le fournit)
- Taux de clic sur lien signature
- Délai moyen email → signature

---

## ⚠️ Problèmes Courants

### Problème 1 : "Authentication failed"

**Cause** : Identifiants incorrects
**Solution** :
- Vérifier SMTP_USER et SMTP_PASSWORD
- Gmail : Utiliser mot de passe d'application (pas le mot de passe compte)
- Vérifier que 2FA est activé (Gmail)

### Problème 2 : "Connection timeout"

**Cause** : Port bloqué ou firewall
**Solution** :
- Essayer port 465 (SSL) au lieu de 587 (TLS)
- Vérifier firewall serveur
- Vérifier que le port n'est pas bloqué par l'hébergeur

### Problème 3 : Emails en spam

**Cause** : Mauvaise réputation ou configuration DNS
**Solution** :
- Configurer SPF, DKIM, DMARC
- Utiliser un domaine vérifié
- Éviter mots-clés spam dans sujet
- Tester sur https://mail-tester.com

### Problème 4 : "Daily sending limit exceeded"

**Cause** : Quota journalier dépassé
**Solution** :
- Gmail gratuit : 500/jour
- Passer à Google Workspace (2000/jour)
- Ou utiliser SendGrid/SES pour volume plus élevé

---

## 🚀 Recommandation pour RT Technologie

### Phase 1 : Démarrage (0-100 clients/mois)

**Solution** : Gmail / Google Workspace
- Gratuit ou peu coûteux
- Simple à configurer
- Suffisant pour démarrer

### Phase 2 : Croissance (100-1000 clients/mois)

**Solution** : SendGrid Essentials
- 19.95$/mois pour 50k emails
- Analytics inclus
- Templates HTML

### Phase 3 : Scale (1000+ clients/mois)

**Solution** : Amazon SES
- Très économique (0.10$/1000)
- Scaling automatique
- Intégration AWS

---

## ✅ Checklist de Configuration

- [ ] Compte SMTP créé
- [ ] Variables d'environnement configurées
- [ ] Test d'envoi réussi
- [ ] Enregistrements DNS configurés (SPF, DKIM, DMARC)
- [ ] Domaine vérifié par le fournisseur
- [ ] Emails de test reçus (non en spam)
- [ ] Logging des emails activé
- [ ] Templates HTML testés
- [ ] Limites quotidiennes vérifiées

---

## 📞 Support

**Gmail/Workspace** : https://support.google.com/a
**SendGrid** : https://support.sendgrid.com
**Amazon SES** : https://aws.amazon.com/ses/
**Mailgun** : https://help.mailgun.com

---

**Version** : 1.0.0
**Date** : 18 janvier 2025

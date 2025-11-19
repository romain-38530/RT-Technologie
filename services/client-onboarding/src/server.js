/**
 * RT-Technologie - Service d'Onboarding Client
 *
 * Fonctionnalités :
 * - Vérification TVA via API VIES (UE) et API entreprise.data.gouv.fr (FR)
 * - Récupération automatique des données entreprise
 * - Génération de contrat PDF pré-rempli
 * - Signature électronique
 * - Workflow d'onboarding complet
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3020;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rt_technologie';

MongoClient.connect(MONGODB_URI)
  .then(client => {
    db = client.db();
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// ============================================================================
// API de Vérification TVA
// ============================================================================

/**
 * Vérifie un numéro de TVA européen via VIES
 */
async function verifyVATVIES(vatNumber) {
  try {
    // Extraire le code pays et le numéro
    const countryCode = vatNumber.substring(0, 2);
    const vatNum = vatNumber.substring(2);

    // API VIES (Commission Européenne)
    const response = await axios.get(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNum}`,
      { timeout: 10000 }
    );

    if (response.data && response.data.isValid) {
      return {
        valid: true,
        countryCode: response.data.countryCode,
        vatNumber: response.data.vatNumber,
        companyName: response.data.name,
        companyAddress: response.data.address,
        source: 'VIES'
      };
    }

    return { valid: false, error: 'Numéro de TVA invalide' };
  } catch (error) {
    console.error('Erreur VIES API:', error.message);
    return { valid: false, error: error.message };
  }
}

/**
 * Vérifie un numéro de TVA français via API Entreprise
 */
async function verifyVATFrance(vatNumber) {
  try {
    // Extraire le numéro SIREN (9 chiffres après FR + 2 chiffres clé)
    const siren = vatNumber.replace('FR', '').substring(2);

    // Méthode 1 : API recherche-entreprises.api.gouv.fr (plus fiable)
    try {
      const searchResponse = await axios.get(
        `https://recherche-entreprises.api.gouv.fr/search?q=${siren}`,
        {
          timeout: 10000,
          headers: { 'Accept': 'application/json' }
        }
      );

      if (searchResponse.data && searchResponse.data.results && searchResponse.data.results.length > 0) {
        const company = searchResponse.data.results[0];

        return {
          valid: true,
          countryCode: 'FR',
          vatNumber: vatNumber,
          siren: company.siren,
          siret: company.siege?.siret || company.siren,
          companyName: company.nom_complet || company.nom_raison_sociale,
          legalForm: company.nature_juridique || '',
          companyAddress: company.siege ? formatAddressFromSiege(company.siege) : '',
          registrationCity: company.siege?.commune || '',
          source: 'API Entreprise (recherche-entreprises)'
        };
      }
    } catch (searchError) {
      console.warn('⚠️ API recherche-entreprises failed, trying fallback:', searchError.message);
    }

    // Méthode 2 : Fallback vers annuaire-entreprises.data.gouv.fr
    try {
      const annuaireResponse = await axios.get(
        `https://annuaire-entreprises.data.gouv.fr/api/siren/${siren}`,
        {
          timeout: 10000,
          headers: { 'Accept': 'application/json' }
        }
      );

      if (annuaireResponse.data) {
        const data = annuaireResponse.data;

        return {
          valid: true,
          countryCode: 'FR',
          vatNumber: vatNumber,
          siren: siren,
          siret: data.siege?.siret || siren,
          companyName: data.nom_complet || data.nom_raison_sociale,
          legalForm: data.nature_juridique || '',
          companyAddress: data.siege ? formatAddressFromSiege(data.siege) : '',
          registrationCity: data.siege?.commune || '',
          source: 'Annuaire Entreprises'
        };
      }
    } catch (annuaireError) {
      console.warn('⚠️ Annuaire entreprises failed, trying VIES:', annuaireError.message);
    }

    // Méthode 3 : Fallback vers VIES EU
    return await verifyVATVIES(vatNumber);

  } catch (error) {
    console.error('Erreur vérification TVA France:', error.message);
    return { valid: false, error: error.message };
  }
}

/**
 * Formate l'adresse depuis les données de siège (nouvelle API)
 */
function formatAddressFromSiege(siege) {
  const parts = [];

  if (siege.numero_voie) parts.push(siege.numero_voie);
  if (siege.type_voie) parts.push(siege.type_voie);
  if (siege.libelle_voie) parts.push(siege.libelle_voie);

  const street = parts.join(' ');
  const city = `${siege.code_postal || ''} ${siege.commune || ''}`.trim();

  return street ? `${street}, ${city}` : city;
}

/**
 * Formate l'adresse depuis les données INSEE
 */
function formatAddress(etablissement) {
  const parts = [];

  if (etablissement.numero_voie) parts.push(etablissement.numero_voie);
  if (etablissement.type_voie) parts.push(etablissement.type_voie);
  if (etablissement.libelle_voie) parts.push(etablissement.libelle_voie);

  const street = parts.join(' ');
  const city = `${etablissement.code_postal || ''} ${etablissement.libelle_commune || ''}`.trim();

  return `${street}, ${city}`;
}

// ============================================================================
// Routes API
// ============================================================================

/**
 * POST /api/onboarding/verify-vat
 * Vérifie un numéro de TVA et retourne les données de l'entreprise
 */
app.post('/api/onboarding/verify-vat', async (req, res) => {
  try {
    const { vatNumber } = req.body;

    if (!vatNumber) {
      return res.status(400).json({ error: 'Numéro de TVA requis' });
    }

    // Nettoyer le numéro de TVA
    const cleanVAT = vatNumber.replace(/\s/g, '').toUpperCase();

    let result;

    // Déterminer le pays et appeler l'API appropriée
    if (cleanVAT.startsWith('FR')) {
      result = await verifyVATFrance(cleanVAT);
      // Fallback vers VIES si l'API française ne fonctionne pas
      if (!result.valid && result.error && result.error.includes('ECONNREFUSED')) {
        console.log('⚠️  API française inaccessible, fallback vers VIES');
        result = await verifyVATVIES(cleanVAT);
      }
    } else {
      result = await verifyVATVIES(cleanVAT);
    }

    if (result.valid) {
      // Enregistrer dans la base de données (si MongoDB est connecté)
      if (db) {
        try {
          await db.collection('company_verifications').insertOne({
            vatNumber: cleanVAT,
            companyData: result,
            verifiedAt: new Date(),
            status: 'verified'
          });
        } catch (dbError) {
          console.warn('⚠️  MongoDB not available, skipping storage:', dbError.message);
        }
      }

      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error || 'Numéro de TVA invalide'
      });
    }
  } catch (error) {
    console.error('Erreur vérification TVA:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/onboarding/create-contract
 * Génère un contrat PDF pré-rempli
 */
app.post('/api/onboarding/create-contract', async (req, res) => {
  try {
    const {
      companyData,
      subscriptionType,
      duration,
      options,
      representative
    } = req.body;

    // Générer le contrat PDF
    const pdfBuffer = await generateContractPDF({
      companyData,
      subscriptionType,
      duration,
      options,
      representative
    });

    // Sauvegarder dans MongoDB
    const contractId = await saveContract({
      companyData,
      subscriptionType,
      duration,
      options,
      representative,
      pdfBuffer,
      status: 'draft'
    });

    // Renvoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrat_${contractId}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erreur génération contrat:', error);
    res.status(500).json({ error: 'Erreur génération contrat' });
  }
});

/**
 * POST /api/onboarding/submit
 * Soumet le formulaire d'onboarding complet
 */
app.post('/api/onboarding/submit', async (req, res) => {
  try {
    const {
      companyData,
      subscriptionType,
      duration,
      options,
      representative,
      paymentMethod
    } = req.body;

    // Créer l'enregistrement client
    const clientId = await createClient({
      companyData,
      subscriptionType,
      duration,
      options,
      representative,
      paymentMethod,
      status: 'pending_signature',
      createdAt: new Date()
    });

    // Générer le contrat
    const pdfBuffer = await generateContractPDF({
      companyData,
      subscriptionType,
      duration,
      options,
      representative
    });

    // Sauvegarder le contrat
    const contractId = await saveContract({
      clientId,
      companyData,
      subscriptionType,
      duration,
      options,
      representative,
      pdfBuffer,
      status: 'pending_signature'
    });

    // Envoyer email avec lien de signature
    await sendSignatureEmail({
      clientId,
      contractId,
      companyData,
      representative
    });

    res.json({
      success: true,
      clientId,
      contractId,
      message: 'Un email a été envoyé pour signature électronique'
    });

  } catch (error) {
    console.error('Erreur soumission onboarding:', error);
    res.status(500).json({ error: 'Erreur soumission' });
  }
});

/**
 * GET /api/onboarding/contract/:contractId
 * Récupère un contrat par ID
 */
app.get('/api/onboarding/contract/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = await db.collection('contracts').findOne({ contractId });

    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.send(contract.pdfBuffer.buffer);

  } catch (error) {
    console.error('Erreur récupération contrat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/onboarding/sign/:contractId
 * Signe électroniquement un contrat
 */
app.post('/api/onboarding/sign/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { signature, signedBy, signedAt } = req.body;

    // Mettre à jour le contrat
    await db.collection('contracts').updateOne(
      { contractId },
      {
        $set: {
          signature,
          signedBy,
          signedAt: new Date(signedAt),
          status: 'signed'
        }
      }
    );

    // Activer le compte client
    const contract = await db.collection('contracts').findOne({ contractId });
    await db.collection('clients').updateOne(
      { _id: contract.clientId },
      {
        $set: {
          status: 'active',
          activatedAt: new Date()
        }
      }
    );

    // Envoyer email de confirmation
    await sendActivationEmail(contract);

    res.json({
      success: true,
      message: 'Contrat signé avec succès'
    });

  } catch (error) {
    console.error('Erreur signature contrat:', error);
    res.status(500).json({ error: 'Erreur signature' });
  }
});

// ============================================================================
// Fonctions Utilitaires
// ============================================================================

/**
 * Génère un PDF de contrat pré-rempli
 */
async function generateContractPDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // En-tête
    doc.fontSize(18).font('Helvetica-Bold').text('CONTRAT D\'ABONNEMENT', { align: 'center' });
    doc.moveDown(2);

    // ENTRE
    doc.fontSize(12).font('Helvetica-Bold').text('ENTRE :');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica')
      .text('RT Technologie, société SAS, au capital de 10 000€, dont le siège social est situé 1088 avenue de Champollion 38530 Pontcharra, immatriculée au Registre du Commerce et des Sociétés de Grenoble sous le numéro 948816988, numéro de TVA FR41948816988, représentée par Romain Tardy, ci-après dénommée "RT Technologie" ou le "Fournisseur",');

    doc.moveDown(1.5);

    // ET
    doc.fontSize(12).font('Helvetica-Bold').text('ET :');
    doc.moveDown(0.5);

    const { companyData, representative } = data;
    doc.fontSize(10).font('Helvetica')
      .text(`${companyData.companyName}, société ${companyData.legalForm || '[forme juridique]'}, au capital de ${companyData.capital || '[montant du capital]'}, dont le siège social est situé ${companyData.companyAddress}, immatriculée au Registre du Commerce et des Sociétés de ${companyData.registrationCity || '[ville]'} sous le numéro ${companyData.siret || '[numéro SIRET]'}, numéro de TVA ${companyData.vatNumber}, représentée par ${representative || '[nom et qualité du représentant légal]'}, ci-après dénommée le "Client".`);

    doc.moveDown(1.5);

    // IL A ÉTÉ CONVENU CE QUI SUIT
    doc.fontSize(12).font('Helvetica-Bold').text('IL A ÉTÉ CONVENU CE QUI SUIT :');
    doc.moveDown(1);

    // Reste du contrat (articles 1-19)...
    // (Je vais créer une fonction séparée pour ça)
    addContractArticles(doc, data);

    // Finaliser
    doc.end();
  });
}

/**
 * Ajoute tous les articles du contrat
 */
function addContractArticles(doc, data) {
  const { subscriptionType, duration, options } = data;

  // Article 1
  addArticle(doc, 1, 'OBJET DU CONTRAT',
    'Le présent contrat a pour objet de définir les conditions dans lesquelles RT Technologie fournit au Client un accès et un droit d\'utilisation de son outil Control Tower, ainsi que les services associés.'
  );

  // Article 2
  addArticle(doc, 2, 'DESCRIPTION DES SERVICES',
    getSubscriptionDescription(subscriptionType)
  );

  // Articles 3-19 (identiques au modèle)
  addStandardArticles(doc, data);

  // Signatures
  addSignatureSection(doc, data);
}

function addArticle(doc, number, title, content) {
  doc.addPage();
  doc.fontSize(12).font('Helvetica-Bold')
    .text(`ARTICLE ${number}. ${title}`);
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica')
    .text(content, { align: 'justify' });
  doc.moveDown(1);
}

function getSubscriptionDescription(subscriptionType) {
  const descriptions = {
    industriel: 'Industriel : Fonction principale : Gestion automatisée des flux, intégration des transporteurs, planification et Afret IA sur périmètre interne. Tarif mensuel : 499 € / mois.',
    transporteur_premium: 'Transporteur Premium : Fonction principale : Accès à la bourse Afret IA + prospection client + visibilité élargie. Tarif mensuel : 299 € / mois.',
    transporteur_pro: 'Transporteur Pro : Utilisation complète de l\'application. Tarif mensuel : 499 € / mois.',
    logisticien_premium: 'Logisticien Premium : Accès aux appels d\'offres de l\'ensemble des industriels. Tarif mensuel : 499 € / mois.',
    transitaire_premium: 'Transitaire Premium : Accès aux appels d\'offres de l\'ensemble des industriels. Tarif mensuel : 299 € / mois.'
  };

  return descriptions[subscriptionType] || 'Type d\'abonnement non spécifié';
}

function addStandardArticles(doc, data) {
  // Articles standards 3-19 du contrat
  // (Copier le contenu du PDF original)
}

function addSignatureSection(doc, data) {
  doc.addPage();
  doc.moveDown(2);
  doc.fontSize(10).font('Helvetica')
    .text(`Fait en deux exemplaires originaux, à Pontcharra, le ${new Date().toLocaleDateString('fr-FR')}`);

  doc.moveDown(2);

  // Signatures
  doc.text('Pour RT Technologie', 50, doc.y);
  doc.text('Pour le Client', 350, doc.y);

  doc.moveDown(1);
  doc.text('Romain Tardy', 50, doc.y);
  doc.text(data.representative || '', 350, doc.y);

  doc.moveDown(1);
  doc.text('[Signature]', 50, doc.y);
  doc.text('[Signature]', 350, doc.y);
}

/**
 * Sauvegarde un contrat dans MongoDB
 */
async function saveContract(data) {
  const contractId = `CT-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  if (db) {
    try {
      await db.collection('contracts').insertOne({
        contractId,
        ...data,
        createdAt: new Date()
      });
    } catch (dbError) {
      console.warn('⚠️  MongoDB not available, skipping contract storage:', dbError.message);
    }
  }

  return contractId;
}

/**
 * Crée un client dans MongoDB
 */
async function createClient(data) {
  const clientId = `CL-${Date.now()}`;

  if (db) {
    try {
      const result = await db.collection('clients').insertOne({
        ...data,
        clientId,
        createdAt: new Date()
      });
      return result.insertedId;
    } catch (dbError) {
      console.warn('⚠️  MongoDB not available, skipping client storage:', dbError.message);
    }
  }

  return clientId;
}

/**
 * Envoie un email avec lien de signature
 */
async function sendSignatureEmail({ clientId, contractId, companyData, representative }) {
  const signatureLink = `${process.env.APP_URL}/sign-contract/${contractId}`;

  await emailTransporter.sendMail({
    from: process.env.SMTP_USER,
    to: companyData.email || representative.email,
    subject: 'RT Technologie - Signature de votre contrat',
    html: `
      <h2>Bienvenue chez RT Technologie !</h2>
      <p>Bonjour,</p>
      <p>Votre contrat d'abonnement est prêt à être signé.</p>
      <p><strong>Entreprise :</strong> ${companyData.companyName}</p>
      <p><strong>Numéro de TVA :</strong> ${companyData.vatNumber}</p>
      <p><a href="${signatureLink}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Signer le contrat</a></p>
      <p>Cordialement,<br/>L'équipe RT Technologie</p>
    `
  });
}

/**
 * Envoie un email de confirmation d'activation
 */
async function sendActivationEmail(contract) {
  await emailTransporter.sendMail({
    from: process.env.SMTP_USER,
    to: contract.companyData.email,
    subject: 'RT Technologie - Compte activé !',
    html: `
      <h2>Votre compte est maintenant actif !</h2>
      <p>Bonjour,</p>
      <p>Votre contrat a été signé avec succès et votre compte RT Technologie est maintenant activé.</p>
      <p><a href="${process.env.APP_URL}/login">Se connecter</a></p>
      <p>Cordialement,<br/>L'équipe RT Technologie</p>
    `
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'client-onboarding', port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RT-Technologie Client Onboarding Service running on port ${PORT}`);
});

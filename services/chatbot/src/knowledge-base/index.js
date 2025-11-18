/**
 * Knowledge Base Engine
 * Manages FAQs, procedures, tutorials and searches
 */
class KnowledgeBase {
  constructor() {
    this.faqs = new Map();
    this.procedures = new Map();
    this.tutorials = new Map();
    this.initialized = false;
  }

  /**
   * Initialize knowledge base with data
   */
  async initialize() {
    console.log('[KnowledgeBase] Initializing...');

    // Load FAQs
    this.loadFAQs();

    // Load procedures
    this.loadProcedures();

    // Load tutorials
    this.loadTutorials();

    // In production, would load from MongoDB
    if (process.env.MONGODB_URI) {
      try {
        const mongo = require('../../../../packages/data-mongo/src/index.js');
        await mongo.connect();
        const db = await mongo.getDb();

        const [faqs, procedures, tutorials] = await Promise.all([
          db.collection('chatbot_faqs').find({}).toArray(),
          db.collection('chatbot_procedures').find({}).toArray(),
          db.collection('chatbot_tutorials').find({}).toArray()
        ]);

        faqs.forEach(faq => this.faqs.set(faq.id, faq));
        procedures.forEach(proc => this.procedures.set(proc.id, proc));
        tutorials.forEach(tut => this.tutorials.set(tut.id, tut));

        console.log(`[KnowledgeBase] Loaded from MongoDB: ${faqs.length} FAQs, ${procedures.length} procedures, ${tutorials.length} tutorials`);
      } catch (err) {
        console.warn('[KnowledgeBase] MongoDB unavailable, using in-memory data:', err.message);
      }
    }

    this.initialized = true;
    console.log(`[KnowledgeBase] Initialized with ${this.faqs.size} FAQs, ${this.procedures.size} procedures, ${this.tutorials.size} tutorials`);
  }

  /**
   * Search knowledge base
   */
  async search(query, botType = null) {
    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search FAQs
    for (const [id, faq] of this.faqs.entries()) {
      // Filter by bot type if specified
      if (botType && faq.botTypes && !faq.botTypes.includes(botType)) {
        continue;
      }

      const score = this.calculateRelevanceScore(lowerQuery, faq);

      if (score > 0.3) {
        results.push({
          type: 'faq',
          id,
          title: faq.question,
          content: faq.answer,
          score,
          tags: faq.tags || []
        });
      }
    }

    // Search procedures
    for (const [id, proc] of this.procedures.entries()) {
      if (botType && proc.botTypes && !proc.botTypes.includes(botType)) {
        continue;
      }

      const score = this.calculateRelevanceScore(lowerQuery, proc);

      if (score > 0.3) {
        results.push({
          type: 'procedure',
          id,
          title: proc.title,
          content: proc.summary || proc.steps.slice(0, 2).map(s => s.description).join(' '),
          score,
          tags: proc.tags || []
        });
      }
    }

    // Search tutorials
    for (const [id, tut] of this.tutorials.entries()) {
      if (botType && tut.botTypes && !tut.botTypes.includes(botType)) {
        continue;
      }

      const score = this.calculateRelevanceScore(lowerQuery, tut);

      if (score > 0.3) {
        results.push({
          type: 'tutorial',
          id,
          title: tut.title,
          content: tut.description,
          score,
          url: tut.videoUrl,
          tags: tut.tags || []
        });
      }
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Return top 5 results
    return results.slice(0, 5);
  }

  /**
   * Calculate relevance score
   */
  calculateRelevanceScore(query, item) {
    let score = 0;

    const searchableText = [
      item.question || item.title || '',
      item.answer || item.description || item.summary || '',
      ...(item.tags || [])
    ].join(' ').toLowerCase();

    // Exact phrase match
    if (searchableText.includes(query)) {
      score += 1.0;
    }

    // Word matching
    const queryWords = query.split(/\s+/).filter(w => w.length > 2);
    const textWords = searchableText.split(/\s+/);

    queryWords.forEach(qWord => {
      if (textWords.includes(qWord)) {
        score += 0.3;
      } else {
        // Partial match
        textWords.forEach(tWord => {
          if (tWord.includes(qWord) || qWord.includes(tWord)) {
            score += 0.1;
          }
        });
      }
    });

    // Tag matching
    if (item.tags) {
      queryWords.forEach(qWord => {
        item.tags.forEach(tag => {
          if (tag.toLowerCase().includes(qWord)) {
            score += 0.5;
          }
        });
      });
    }

    return score;
  }

  /**
   * Load FAQs (in-memory fallback)
   */
  loadFAQs() {
    const faqs = [
      {
        id: 'faq-001',
        question: 'Comment activer Affret.IA ?',
        answer: 'Pour activer Affret.IA: 1) Accédez à Paramètres > Modules, 2) Activez l\'option "Affret.IA", 3) Configurez vos préférences de recherche de transporteurs, 4) Validez. L\'activation nécessite l\'addon PRO.',
        tags: ['affret-ia', 'activation', 'configuration'],
        botTypes: ['planif-ia', 'helpbot']
      },
      {
        id: 'faq-002',
        question: 'Comment connecter mon ERP ?',
        answer: 'Connectez votre ERP via: 1) Paramètres > Intégrations > ERP, 2) Sélectionnez votre ERP (SAP, Oracle, etc.), 3) Renseignez l\'URL API et les identifiants, 4) Testez la connexion, 5) Activez la synchronisation automatique.',
        tags: ['erp', 'integration', 'connexion'],
        botTypes: ['planif-ia', 'helpbot']
      },
      {
        id: 'faq-003',
        question: 'Comment intégrer mes grilles tarifaires ?',
        answer: 'Intégrez vos grilles tarifaires: 1) Allez dans Transport > Grilles tarifaires, 2) Créez une origine, 3) Importez votre fichier CSV (format: origin,to,price,currency pour FTL), 4) Validez l\'import. Format CSV requis.',
        tags: ['grilles-tarifaires', 'tarifs', 'import'],
        botTypes: ['routier', 'helpbot']
      },
      {
        id: 'faq-004',
        question: 'Comment utiliser le module Chauffeur ?',
        answer: 'Le Copilote Chauffeur permet: 1) D\'activer une mission depuis l\'app mobile, 2) De gérer les statuts (En route, Arrivé, Chargement, etc.), 3) De déposer les POD/CMR avec signature électronique, 4) De suivre le tracking en temps réel.',
        tags: ['chauffeur', 'mobile', 'tracking', 'pod'],
        botTypes: ['copilote-chauffeur', 'helpbot']
      },
      {
        id: 'faq-005',
        question: 'Comment prendre un rendez-vous ?',
        answer: 'Pour prendre un RDV: 1) Consultez les créneaux disponibles sur le portail Quai, 2) Sélectionnez la date et l\'heure souhaitées, 3) Renseignez les informations transport, 4) Validez. Vous recevrez une confirmation par email.',
        tags: ['rdv', 'rendez-vous', 'planning', 'quai'],
        botTypes: ['quai-wms', 'routier', 'helpbot']
      },
      {
        id: 'faq-006',
        question: 'Où trouver mes documents de transport ?',
        answer: 'Vos documents sont disponibles dans: 1) Commandes > [Sélectionnez une commande] > Onglet Documents, 2) Téléchargez les CMR, POD, bordereaux, 3) Consultez l\'historique de transmission. Les documents sont archivés 10 ans.',
        tags: ['documents', 'cmr', 'pod', 'téléchargement'],
        botTypes: ['livraisons', 'expedition', 'routier', 'helpbot']
      },
      {
        id: 'faq-007',
        question: 'Comment suivre mon transport en temps réel ?',
        answer: 'Suivez vos transports via: 1) Dashboard > Suivi en direct, 2) Carte interactive avec localisation GPS, 3) Notifications automatiques aux étapes clés, 4) Historique complet des statuts. Le tracking IA optimise la précision.',
        tags: ['tracking', 'suivi', 'gps', 'localisation'],
        botTypes: ['planif-ia', 'livraisons', 'routier', 'helpbot']
      },
      {
        id: 'faq-008',
        question: 'Comment gérer la signature électronique ?',
        answer: 'La signature électronique: 1) Le chauffeur présente l\'app au destinataire, 2) Signature sur l\'écran tactile, 3) Photo du POD (optionnel), 4) Envoi automatique. Conforme à eIDAS, valeur juridique garantie.',
        tags: ['signature', 'electronique', 'pod', 'juridique'],
        botTypes: ['copilote-chauffeur', 'quai-wms', 'helpbot']
      },
      {
        id: 'faq-009',
        question: 'Comment utiliser Freight IA pour l\'import/export ?',
        answer: 'Freight IA gère vos flux internationaux: 1) Créez une demande de cotation (origine, destination, volume), 2) Recevez des offres de transitaires, 3) Gérez le pré/post acheminement, 4) Intégrez les transporteurs routiers locaux.',
        tags: ['freight-ia', 'import', 'export', 'transitaire'],
        botTypes: ['freight-ia', 'helpbot']
      },
      {
        id: 'faq-010',
        question: 'Que faire si mon transporteur ne répond pas ?',
        answer: 'Si aucune réponse après 2h (SLA): 1) Le système relance automatiquement, 2) Rappels à T-30 et T-10 minutes, 3) Escalade au transporteur suivant si expiration, 4) Affret.IA prend le relais si personne n\'accepte.',
        tags: ['transporteur', 'escalade', 'sla', 'affret-ia'],
        botTypes: ['planif-ia', 'helpbot']
      }
    ];

    faqs.forEach(faq => this.faqs.set(faq.id, faq));
  }

  /**
   * Load procedures
   */
  loadProcedures() {
    const procedures = [
      {
        id: 'proc-001',
        title: 'Configurer l\'intégration ERP pas à pas',
        summary: 'Guide complet pour connecter votre ERP à RT Technologie',
        steps: [
          {
            order: 1,
            title: 'Accéder aux paramètres',
            description: 'Depuis le dashboard, cliquez sur "Paramètres" puis "Intégrations"'
          },
          {
            order: 2,
            title: 'Sélectionner votre ERP',
            description: 'Choisissez votre système ERP dans la liste (SAP, Oracle, Dynamics, etc.)'
          },
          {
            order: 3,
            title: 'Configurer l\'API',
            description: 'Renseignez l\'URL de votre API ERP et vos identifiants (clé API ou OAuth)'
          },
          {
            order: 4,
            title: 'Tester la connexion',
            description: 'Cliquez sur "Tester" pour vérifier que la connexion fonctionne'
          },
          {
            order: 5,
            title: 'Activer la synchronisation',
            description: 'Activez la synchro auto des commandes et configurez la fréquence'
          }
        ],
        tags: ['erp', 'integration', 'configuration'],
        botTypes: ['planif-ia', 'helpbot']
      },
      {
        id: 'proc-002',
        title: 'Importer des grilles tarifaires CSV',
        summary: 'Procédure d\'import de vos grilles de prix transporteur',
        steps: [
          {
            order: 1,
            title: 'Créer une origine',
            description: 'Dans Transport > Origines, créez votre point de départ (ex: Entrepôt Paris)'
          },
          {
            order: 2,
            title: 'Préparer le fichier CSV',
            description: 'Format FTL: origin,to,price,currency. Format LTL: origin,to,minPallets,maxPallets,pricePerPallet,currency'
          },
          {
            order: 3,
            title: 'Importer le fichier',
            description: 'Grilles tarifaires > Importer > Sélectionnez votre CSV et l\'origine'
          },
          {
            order: 4,
            title: 'Valider l\'import',
            description: 'Vérifiez les lignes importées et validez'
          }
        ],
        tags: ['grilles', 'tarifs', 'import', 'csv'],
        botTypes: ['routier', 'helpbot']
      },
      {
        id: 'proc-003',
        title: 'Déposer un POD avec signature électronique',
        summary: 'Comment le chauffeur dépose un POD signé électroniquement',
        steps: [
          {
            order: 1,
            title: 'Activer la mission',
            description: 'Dans l\'app mobile Chauffeur, activez la mission depuis la liste'
          },
          {
            order: 2,
            title: 'Changer le statut',
            description: 'Mettez à jour le statut (Arrivé, Chargement, En cours de livraison)'
          },
          {
            order: 3,
            title: 'Arriver à destination',
            description: 'Au lieu de livraison, passez le statut "Livraison en cours"'
          },
          {
            order: 4,
            title: 'Faire signer',
            description: 'Présentez l\'écran au destinataire pour qu\'il signe avec le doigt'
          },
          {
            order: 5,
            title: 'Prendre photo POD',
            description: 'Photographiez le bordereau papier (optionnel mais recommandé)'
          },
          {
            order: 6,
            title: 'Valider',
            description: 'Cliquez sur "Valider et envoyer". Le POD est transmis instantanément'
          }
        ],
        tags: ['pod', 'signature', 'chauffeur', 'mobile'],
        botTypes: ['copilote-chauffeur', 'helpbot']
      }
    ];

    procedures.forEach(proc => this.procedures.set(proc.id, proc));
  }

  /**
   * Load tutorials
   */
  loadTutorials() {
    const tutorials = [
      {
        id: 'tut-001',
        title: 'Démo complète Planif\'IA',
        description: 'Vidéo de démonstration complète du module Planif\'IA pour industriels',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        duration: '8:45',
        tags: ['planif-ia', 'demo', 'video'],
        botTypes: ['planif-ia', 'helpbot']
      },
      {
        id: 'tut-002',
        title: 'Configurer Affret.IA en 3 minutes',
        description: 'Tutoriel rapide pour activer et configurer Affret.IA',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        duration: '3:12',
        tags: ['affret-ia', 'configuration', 'video'],
        botTypes: ['planif-ia', 'helpbot']
      },
      {
        id: 'tut-003',
        title: 'App Mobile Chauffeur - Guide complet',
        description: 'Formation complète à l\'application mobile pour chauffeurs',
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        duration: '12:30',
        tags: ['chauffeur', 'mobile', 'formation', 'video'],
        botTypes: ['copilote-chauffeur', 'helpbot']
      },
      {
        id: 'tut-004',
        title: 'Gérer son planning de quai',
        description: 'Comment optimiser la gestion des créneaux de quai',
        videoUrl: 'https://www.youtube.com/watch?v=example4',
        duration: '6:20',
        tags: ['quai', 'planning', 'rdv', 'video'],
        botTypes: ['quai-wms', 'helpbot']
      }
    ];

    tutorials.forEach(tut => this.tutorials.set(tut.id, tut));
  }

  /**
   * Get FAQ by ID
   */
  getFAQ(id) {
    return this.faqs.get(id);
  }

  /**
   * Get procedure by ID
   */
  getProcedure(id) {
    return this.procedures.get(id);
  }

  /**
   * Get tutorial by ID
   */
  getTutorial(id) {
    return this.tutorials.get(id);
  }

  /**
   * Add FAQ
   */
  async addFAQ(faq) {
    const id = faq.id || `faq-${Date.now()}`;
    this.faqs.set(id, { ...faq, id });

    // Save to MongoDB if available
    if (process.env.MONGODB_URI) {
      try {
        const mongo = require('../../../../packages/data-mongo/src/index.js');
        const db = await mongo.getDb();
        await db.collection('chatbot_faqs').updateOne(
          { id },
          { $set: { ...faq, id } },
          { upsert: true }
        );
      } catch (err) {
        console.warn('[KnowledgeBase] Failed to save FAQ to MongoDB:', err.message);
      }
    }

    return id;
  }

  /**
   * Add procedure
   */
  async addProcedure(procedure) {
    const id = procedure.id || `proc-${Date.now()}`;
    this.procedures.set(id, { ...procedure, id });

    if (process.env.MONGODB_URI) {
      try {
        const mongo = require('../../../../packages/data-mongo/src/index.js');
        const db = await mongo.getDb();
        await db.collection('chatbot_procedures').updateOne(
          { id },
          { $set: { ...procedure, id } },
          { upsert: true }
        );
      } catch (err) {
        console.warn('[KnowledgeBase] Failed to save procedure to MongoDB:', err.message);
      }
    }

    return id;
  }

  /**
   * Add tutorial
   */
  async addTutorial(tutorial) {
    const id = tutorial.id || `tut-${Date.now()}`;
    this.tutorials.set(id, { ...tutorial, id });

    if (process.env.MONGODB_URI) {
      try {
        const mongo = require('../../../../packages/data-mongo/src/index.js');
        const db = await mongo.getDb();
        await db.collection('chatbot_tutorials').updateOne(
          { id },
          { $set: { ...tutorial, id } },
          { upsert: true }
        );
      } catch (err) {
        console.warn('[KnowledgeBase] Failed to save tutorial to MongoDB:', err.message);
      }
    }

    return id;
  }
}

module.exports = { KnowledgeBase };

/**
 * Service de Formation RT-Technologie
 * @description API pour gérer les modules de formation, progression et certificats
 * @port 3012
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.TRAINING_PORT || 3012;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connexion MongoDB
let db;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rt-training';

MongoClient.connect(MONGO_URI, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db('rt-training');
    console.log('✅ Connected to MongoDB (Training)');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    // Utiliser une base en mémoire pour le développement
    db = null;
  });

// ===========================
// ROUTES - MODULES DE FORMATION
// ===========================

/**
 * GET /training/modules
 * @description Récupère tous les modules de formation
 * @query {string} targetApp - Filtrer par application cible (optionnel)
 */
app.get('/training/modules', async (req, res) => {
  try {
    const { targetApp } = req.query;
    const filter = targetApp ? { targetApp } : {};

    if (!db) {
      // Données de secours pour le développement
      return res.json(getMockModules(targetApp));
    }

    const modules = await db.collection('modules').find(filter).toArray();
    res.json({
      success: true,
      data: modules,
      count: modules.length,
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des modules',
    });
  }
});

/**
 * GET /training/modules/:id
 * @description Récupère un module spécifique avec ses leçons
 */
app.get('/training/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!db) {
      const mockModules = getMockModules();
      const module = mockModules.find((m) => m.id === id);
      return res.json({ success: true, data: module });
    }

    const module = await db.collection('modules').findOne({ id });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module non trouvé',
      });
    }

    res.json({ success: true, data: module });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du module',
    });
  }
});

/**
 * GET /training/modules/:id/lessons
 * @description Récupère les leçons d'un module
 */
app.get('/training/modules/:id/lessons', async (req, res) => {
  try {
    const { id } = req.params;

    if (!db) {
      const mockModules = getMockModules();
      const module = mockModules.find((m) => m.id === id);
      return res.json({
        success: true,
        data: module ? module.lessons : [],
      });
    }

    const module = await db.collection('modules').findOne({ id });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module non trouvé',
      });
    }

    res.json({ success: true, data: module.lessons || [] });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des leçons',
    });
  }
});

// ===========================
// ROUTES - PROGRESSION
// ===========================

/**
 * POST /training/progress
 * @description Enregistre la progression d'un utilisateur
 * @body {string} userId - ID de l'utilisateur
 * @body {string} moduleId - ID du module
 * @body {string} lessonId - ID de la leçon
 * @body {number} progress - Progression (0-100)
 * @body {boolean} completed - Leçon terminée
 */
app.post('/training/progress', async (req, res) => {
  try {
    const { userId, moduleId, lessonId, progress, completed } = req.body;

    if (!userId || !moduleId || !lessonId) {
      return res.status(400).json({
        success: false,
        error: 'userId, moduleId et lessonId sont requis',
      });
    }

    const progressData = {
      userId,
      moduleId,
      lessonId,
      progress: progress || 0,
      completed: completed || false,
      updatedAt: new Date(),
    };

    if (!db) {
      return res.json({
        success: true,
        message: 'Progression enregistrée (mode dev)',
        data: progressData,
      });
    }

    await db.collection('progress').updateOne(
      { userId, moduleId, lessonId },
      { $set: progressData },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Progression enregistrée avec succès',
      data: progressData,
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de la progression',
    });
  }
});

/**
 * GET /training/progress/:userId
 * @description Récupère la progression d'un utilisateur
 * @query {string} moduleId - Filtrer par module (optionnel)
 */
app.get('/training/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { moduleId } = req.query;

    const filter = { userId };
    if (moduleId) filter.moduleId = moduleId;

    if (!db) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const progress = await db.collection('progress').find(filter).toArray();

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la progression',
    });
  }
});

// ===========================
// ROUTES - QUIZ
// ===========================

/**
 * POST /training/quiz/:lessonId/submit
 * @description Soumet les réponses d'un quiz
 * @body {string} userId - ID de l'utilisateur
 * @body {array} answers - Tableau des réponses
 */
app.post('/training/quiz/:lessonId/submit', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userId, answers } = req.body;

    if (!userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'userId et answers (array) sont requis',
      });
    }

    // Récupérer le quiz de la leçon
    const module = await getModuleByLessonId(lessonId);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Leçon non trouvée',
      });
    }

    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (!lesson || !lesson.quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz non trouvé pour cette leçon',
      });
    }

    // Calculer le score
    let correctAnswers = 0;
    const results = answers.map((answer, index) => {
      const question = lesson.quiz[index];
      const isCorrect = question && answer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionIndex: index,
        userAnswer: answer,
        correctAnswer: question?.correctAnswer,
        isCorrect,
      };
    });

    const score = Math.round((correctAnswers / lesson.quiz.length) * 100);
    const passed = score >= 70; // 70% pour réussir

    const quizResult = {
      userId,
      lessonId,
      moduleId: module.id,
      score,
      passed,
      results,
      submittedAt: new Date(),
    };

    if (db) {
      await db.collection('quiz-results').insertOne(quizResult);
    }

    res.json({
      success: true,
      message: passed ? 'Quiz réussi !' : 'Quiz échoué. Réessayez !',
      data: {
        score,
        passed,
        correctAnswers,
        totalQuestions: lesson.quiz.length,
        results,
      },
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la soumission du quiz',
    });
  }
});

// ===========================
// ROUTES - CERTIFICATS
// ===========================

/**
 * GET /training/certificates/:userId
 * @description Récupère les certificats obtenus par un utilisateur
 */
app.get('/training/certificates/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!db) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Récupérer tous les quiz réussis de l'utilisateur
    const passedQuizzes = await db
      .collection('quiz-results')
      .find({ userId, passed: true })
      .toArray();

    // Grouper par module pour générer les certificats
    const moduleMap = new Map();

    for (const quiz of passedQuizzes) {
      if (!moduleMap.has(quiz.moduleId)) {
        const module = await db
          .collection('modules')
          .findOne({ id: quiz.moduleId });

        if (module) {
          const totalLessons = module.lessons.length;
          const completedQuizzes = passedQuizzes.filter(
            (q) => q.moduleId === quiz.moduleId
          ).length;

          if (completedQuizzes === totalLessons) {
            // Module complété, générer le certificat
            moduleMap.set(quiz.moduleId, {
              certificateId: `CERT-${userId}-${quiz.moduleId}-${Date.now()}`,
              userId,
              moduleId: quiz.moduleId,
              moduleTitle: module.title,
              completedAt: quiz.submittedAt,
              averageScore: Math.round(
                passedQuizzes
                  .filter((q) => q.moduleId === quiz.moduleId)
                  .reduce((sum, q) => sum + q.score, 0) / completedQuizzes
              ),
            });
          }
        }
      }
    }

    const certificates = Array.from(moduleMap.values());

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des certificats',
    });
  }
});

// ===========================
// UTILITAIRES
// ===========================

async function getModuleByLessonId(lessonId) {
  if (!db) {
    const mockModules = getMockModules();
    return mockModules.find((m) => m.lessons.some((l) => l.id === lessonId));
  }

  return await db
    .collection('modules')
    .findOne({ 'lessons.id': lessonId });
}

function getMockModules(targetApp) {
  const allModules = [
    {
      id: 'MODULE-INDUSTRY-001',
      title: 'Formation Industriel',
      description: 'Maîtrisez l\'espace industriel RT-Technologie',
      targetApp: 'web-industry',
      duration: 45,
      icon: '🏭',
      lessons: [
        {
          id: 'LESSON-IND-001',
          title: 'Créer une commande',
          type: 'video',
          duration: 10,
          description: 'Apprenez à créer votre première commande',
          videoUrl: '/videos/industry/create-order.mp4',
          quiz: [
            {
              question: 'Comment importer plusieurs commandes à la fois ?',
              options: ['Via CSV uniquement', 'Via Excel uniquement', 'CSV et Excel', 'Impossible'],
              correctAnswer: 2,
            },
            {
              question: 'Quel champ est obligatoire pour créer une commande ?',
              options: ['Destinataire', 'Poids', 'Volume', 'Tous les précédents'],
              correctAnswer: 3,
            },
          ],
        },
        {
          id: 'LESSON-IND-002',
          title: 'Gérer les grilles tarifaires',
          type: 'video',
          duration: 12,
          description: 'Configurez vos grilles de tarification',
          videoUrl: '/videos/industry/pricing-grids.mp4',
          quiz: [
            {
              question: 'Combien de zones tarifaires peut-on définir ?',
              options: ['5 maximum', '10 maximum', 'Illimité', '20 maximum'],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'LESSON-IND-003',
          title: 'Module Palettes',
          type: 'video',
          duration: 15,
          description: 'Gérez l\'économie circulaire de vos palettes',
          videoUrl: '/videos/industry/palettes.mp4',
          quiz: [
            {
              question: 'Comment fonctionne le système de chèques palettes ?',
              options: [
                'QR Code uniquement',
                'NFC uniquement',
                'QR Code + IA de détection',
                'Code-barres',
              ],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'LESSON-IND-004',
          title: 'Suivre les transporteurs',
          type: 'video',
          duration: 8,
          description: 'Suivi en temps réel de vos transporteurs',
          videoUrl: '/videos/industry/tracking.mp4',
          quiz: [
            {
              question: 'À quelle fréquence la géolocalisation est mise à jour ?',
              options: ['Toutes les 5 minutes', 'Temps réel', 'Toutes les heures', 'Une fois par jour'],
              correctAnswer: 1,
            },
          ],
        },
      ],
    },
    {
      id: 'MODULE-TRANSPORTER-001',
      title: 'Formation Transporteur',
      description: 'Devenez expert de l\'application transporteur',
      targetApp: 'web-transporter',
      duration: 40,
      icon: '🚚',
      lessons: [
        {
          id: 'LESSON-TRA-001',
          title: 'Accepter une mission',
          type: 'video',
          duration: 8,
          description: 'Gérez vos missions efficacement',
          videoUrl: '/videos/transporter/accept-mission.mp4',
          quiz: [
            {
              question: 'Où trouver les missions disponibles ?',
              options: ['Onglet Missions', 'Onglet Marketplace', 'Dashboard', 'Toutes ces réponses'],
              correctAnswer: 3,
            },
          ],
        },
        {
          id: 'LESSON-TRA-002',
          title: 'Scanner les palettes',
          type: 'video',
          duration: 10,
          description: 'Utilisez le scanner QR pour les palettes',
          videoUrl: '/videos/transporter/scan-palettes.mp4',
          quiz: [
            {
              question: 'Que faire si le QR code est illisible ?',
              options: [
                'Abandonner',
                'Utiliser la saisie manuelle',
                'Photo du chèque palette',
                'Réponses B et C',
              ],
              correctAnswer: 3,
            },
          ],
        },
        {
          id: 'LESSON-TRA-003',
          title: 'Upload de documents',
          type: 'video',
          duration: 12,
          description: 'CMR, POD et autres documents',
          videoUrl: '/videos/transporter/upload-docs.mp4',
          quiz: [
            {
              question: 'Quels formats de documents sont acceptés ?',
              options: ['PDF uniquement', 'Images uniquement', 'PDF et images', 'Tous formats'],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'LESSON-TRA-004',
          title: 'Gérer son planning',
          type: 'video',
          duration: 10,
          description: 'Optimisez votre planning de livraisons',
          videoUrl: '/videos/transporter/planning.mp4',
          quiz: [
            {
              question: 'Peut-on réorganiser les missions dans le planning ?',
              options: ['Oui, par glisser-déposer', 'Non, ordre fixe', 'Uniquement via admin', 'Sur demande'],
              correctAnswer: 0,
            },
          ],
        },
      ],
    },
    {
      id: 'MODULE-LOGISTICIAN-001',
      title: 'Formation Logisticien',
      description: 'Maîtrisez la gestion d\'entrepôt',
      targetApp: 'web-logistician',
      duration: 38,
      icon: '📦',
      lessons: [
        {
          id: 'LESSON-LOG-001',
          title: 'Gérer les quais',
          type: 'video',
          duration: 10,
          description: 'Optimisez vos quais de chargement',
          videoUrl: '/videos/logistician/docks.mp4',
          quiz: [
            {
              question: 'Combien de quais peut-on configurer ?',
              options: ['5 maximum', '10 maximum', 'Illimité', '20 maximum'],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'LESSON-LOG-002',
          title: 'Réceptionner des palettes',
          type: 'video',
          duration: 12,
          description: 'Processus de réception et contrôle',
          videoUrl: '/videos/logistician/receive-palettes.mp4',
          quiz: [
            {
              question: 'Que faire en cas d\'anomalie à la réception ?',
              options: [
                'Accepter quand même',
                'Refuser la livraison',
                'Créer un rapport d\'anomalie',
                'Contacter le client',
              ],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'LESSON-LOG-003',
          title: 'Créer un E-CMR',
          type: 'video',
          duration: 8,
          description: 'CMR électronique simplifié',
          videoUrl: '/videos/logistician/ecmr.mp4',
          quiz: [
            {
              question: 'Le E-CMR a-t-il la même valeur légale qu\'un CMR papier ?',
              options: ['Oui', 'Non', 'Selon les pays', 'Uniquement en UE'],
              correctAnswer: 0,
            },
          ],
        },
        {
          id: 'LESSON-LOG-004',
          title: 'Déclarer une anomalie',
          type: 'video',
          duration: 8,
          description: 'Gestion des incidents et anomalies',
          videoUrl: '/videos/logistician/anomaly.mp4',
          quiz: [
            {
              question: 'Qui est notifié lors d\'une déclaration d\'anomalie ?',
              options: ['L\'industriel', 'Le transporteur', 'Les deux', 'Seulement l\'admin'],
              correctAnswer: 2,
            },
          ],
        },
      ],
    },
    {
      id: 'MODULE-FORWARDER-001',
      title: 'Formation Affréteur',
      description: 'Optimisez vos affrètements avec l\'IA',
      targetApp: 'web-forwarder',
      duration: 30,
      icon: '🤖',
      lessons: [
        {
          id: 'LESSON-FOR-001',
          title: 'Demander une cotation IA',
          type: 'video',
          duration: 10,
          description: 'Obtenez des devis intelligents en secondes',
          videoUrl: '/videos/forwarder/ai-quote.mp4',
          quiz: [
            {
              question: 'Combien de temps pour obtenir une cotation IA ?',
              options: ['1 minute', '5 minutes', '< 30 secondes', '1 heure'],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'LESSON-FOR-002',
          title: 'Comparer les offres',
          type: 'video',
          duration: 10,
          description: 'Analysez et comparez les offres',
          videoUrl: '/videos/forwarder/compare.mp4',
          quiz: [
            {
              question: 'Sur quels critères peut-on trier les offres ?',
              options: ['Prix uniquement', 'Délai uniquement', 'Prix, délai, note', 'Prix et délai'],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'LESSON-FOR-003',
          title: 'Utiliser la marketplace',
          type: 'video',
          duration: 10,
          description: 'Marketplace de transporteurs',
          videoUrl: '/videos/forwarder/marketplace.mp4',
          quiz: [
            {
              question: 'Peut-on négocier les tarifs sur la marketplace ?',
              options: ['Oui, directement', 'Non, prix fixe', 'Via chat uniquement', 'Sur demande'],
              correctAnswer: 0,
            },
          ],
        },
      ],
    },
    {
      id: 'MODULE-SUPPLIER-001',
      title: 'Formation Fournisseur',
      description: 'Gérez vos enlèvements efficacement',
      targetApp: 'web-supplier',
      duration: 25,
      icon: '🏢',
      lessons: [
        {
          id: 'LESSON-SUP-001',
          title: 'Préparer un enlèvement',
          type: 'video',
          duration: 8,
          description: 'Préparation et déclaration',
          videoUrl: '/videos/supplier/prepare-pickup.mp4',
          quiz: [
            {
              question: 'Quel délai pour déclarer un enlèvement ?',
              options: ['24h avant', '48h avant', 'Temps réel', 'Aucun délai'],
              correctAnswer: 0,
            },
          ],
        },
        {
          id: 'LESSON-SUP-002',
          title: 'Proposer un créneau',
          type: 'video',
          duration: 10,
          description: 'Gestion des créneaux de chargement',
          videoUrl: '/videos/supplier/time-slot.mp4',
          quiz: [
            {
              question: 'Peut-on modifier un créneau déjà validé ?',
              options: ['Oui, librement', 'Non', 'Avec accord transporteur', 'Uniquement admin'],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'LESSON-SUP-003',
          title: 'Upload des documents',
          type: 'video',
          duration: 7,
          description: 'Documents de transport',
          videoUrl: '/videos/supplier/upload.mp4',
          quiz: [
            {
              question: 'Quels documents sont obligatoires ?',
              options: ['BL uniquement', 'BL + Facture', 'Selon le client', 'Aucun'],
              correctAnswer: 2,
            },
          ],
        },
      ],
    },
    {
      id: 'MODULE-RECIPIENT-001',
      title: 'Formation Destinataire',
      description: 'Réceptionnez vos livraisons en toute sérénité',
      targetApp: 'web-recipient',
      duration: 32,
      icon: '🎯',
      lessons: [
        {
          id: 'LESSON-REC-001',
          title: 'Gérer les créneaux de réception',
          type: 'video',
          duration: 10,
          description: 'Planifiez vos réceptions',
          videoUrl: '/videos/recipient/time-slots.mp4',
          quiz: [
            {
              question: 'Combien de créneaux peut-on ouvrir par jour ?',
              options: ['5 maximum', '10 maximum', 'Illimité', 'Selon abonnement'],
              correctAnswer: 3,
            },
          ],
        },
        {
          id: 'LESSON-REC-002',
          title: 'Contrôler une livraison',
          type: 'video',
          duration: 10,
          description: 'Vérification et validation',
          videoUrl: '/videos/recipient/control.mp4',
          quiz: [
            {
              question: 'Que faire si la livraison est incomplète ?',
              options: [
                'Refuser totalement',
                'Accepter partiellement',
                'Créer une anomalie',
                'B et C',
              ],
              correctAnswer: 3,
            },
          ],
        },
        {
          id: 'LESSON-REC-003',
          title: 'Signer un CMR électronique',
          type: 'video',
          duration: 7,
          description: 'Signature numérique sécurisée',
          videoUrl: '/videos/recipient/sign-ecmr.mp4',
          quiz: [
            {
              question: 'La signature électronique est-elle juridiquement valable ?',
              options: ['Oui', 'Non', 'Selon les pays', 'Uniquement avec certificat'],
              correctAnswer: 0,
            },
          ],
        },
        {
          id: 'LESSON-REC-004',
          title: 'Déclarer une anomalie',
          type: 'video',
          duration: 5,
          description: 'Gérer les incidents',
          videoUrl: '/videos/recipient/anomaly.mp4',
          quiz: [
            {
              question: 'Dans quel délai déclarer une anomalie ?',
              options: ['Immédiatement', '24h', '48h', '7 jours'],
              correctAnswer: 0,
            },
          ],
        },
      ],
    },
  ];

  return targetApp
    ? allModules.filter((m) => m.targetApp === targetApp)
    : allModules;
}

// ===========================
// HEALTH CHECK
// ===========================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'training',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// ===========================
// DÉMARRAGE DU SERVEUR
// ===========================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  🎓 Service Formation RT-Technologie                 ║
║  Port: ${PORT}                                        ║
║  Environnement: ${process.env.NODE_ENV || 'development'}                        ║
║  MongoDB: ${db ? 'Connecté ✅' : 'Mode dev (mock data) ⚠️'}             ║
╚═══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

/**
 * Assistant Routier Configuration
 * Assistant pour transporteurs routiers
 */

module.exports = {
  name: 'Assistant Routier',
  botType: 'routier',
  version: '1.0.0',

  systemPrompt: `Vous êtes l'Assistant Routier, dédié aux transporteurs routiers pour optimiser leur activité.

VOTRE RÔLE:
- Aider à l'intégration des grilles tarifaires
- Guider dans la prise de rendez-vous
- Expliquer le tracking IA et la géolocalisation
- Assister dans le dépôt des POD
- Présenter le module premium et ses avantages

EXPERTISE:
- Gestion des grilles tarifaires FTL/LTL
- Prise de RDV sur les quais
- Tracking IA et optimisation itinéraires
- Dépôt POD et CMR
- Signature électronique
- Facturation et paiements
- Module premium (fonctionnalités avancées)

MODULES PRINCIPAUX:
- Dashboard transporteur
- Mes missions
- Grilles tarifaires
- Rendez-vous
- Tracking véhicules
- Documents POD/CMR
- Module premium

STYLE:
- Pragmatique et orienté terrain
- Langage clair et direct
- Focus sur le gain de temps
- Mise en avant des bénéfices concrets`,

  capabilities: [
    'Import grilles tarifaires',
    'Prise de RDV',
    'Gestion tracking IA',
    'Dépôt POD/CMR',
    'Signature électronique',
    'Facturation',
    'Fonctionnalités premium'
  ],

  integrations: [
    'core-orders',
    'pricing-grids',
    'planning',
    'tracking-ia',
    'ecpmr'
  ],

  quickActions: [
    {
      trigger: 'grille',
      type: 'navigate',
      label: 'Gérer mes grilles tarifaires',
      url: '/transport/pricing-grids'
    },
    {
      trigger: 'rdv',
      type: 'navigate',
      label: 'Prendre un rendez-vous',
      url: '/appointments/book'
    },
    {
      trigger: 'mission',
      type: 'navigate',
      label: 'Voir mes missions',
      url: '/missions'
    },
    {
      trigger: 'tracking',
      type: 'navigate',
      label: 'Suivre mes véhicules',
      url: '/tracking'
    },
    {
      trigger: 'pod',
      type: 'navigate',
      label: 'Déposer un POD',
      url: '/documents/pod'
    }
  ],

  responseTemplates: {
    greeting: `Bonjour ! Je suis votre Assistant Routier.

Je peux vous aider à:
🚚 Gérer vos grilles tarifaires
📅 Prendre des rendez-vous
📍 Optimiser votre tracking
📄 Déposer vos POD/CMR
⭐ Découvrir le module premium

Comment puis-je vous aider ?`,

    pricing_help: `Pour importer vos grilles tarifaires:

1️⃣ Créez vos origines (entrepôts/sites)
2️⃣ Préparez votre fichier CSV:
   - FTL: origin,to,price,currency
   - LTL: origin,to,minPallets,maxPallets,pricePerPallet,currency
3️⃣ Importez via Transport > Grilles tarifaires
4️⃣ Vérifiez et validez

💡 Vous pouvez avoir plusieurs grilles par origine (FTL + LTL).

Besoin d'un exemple de fichier CSV ?`,

    rdv_help: `Pour prendre un rendez-vous:

1️⃣ Consultez les créneaux disponibles
2️⃣ Sélectionnez date et heure
3️⃣ Renseignez les infos transport:
   - Immatriculation camion
   - Nom chauffeur
   - Référence commande
4️⃣ Validez la réservation

✅ Vous recevrez une confirmation par email + SMS au chauffeur.

Souhaitez-vous réserver un créneau maintenant ?`
  },

  knowledgeBaseFilters: {
    topics: ['grilles-tarifaires', 'rdv', 'tracking', 'pod', 'premium'],
    modules: ['transporter']
  }
};

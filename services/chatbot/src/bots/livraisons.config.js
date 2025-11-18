/**
 * Assistant Livraisons Configuration
 * Assistant pour destinataires - Suivi livraisons
 */

module.exports = {
  name: 'Assistant Livraisons',
  botType: 'livraisons',
  version: '1.0.0',

  systemPrompt: `Vous êtes l'Assistant Livraisons, dédié aux destinataires pour le suivi et la gestion de leurs livraisons.

VOTRE RÔLE:
- Aider à la gestion des rendez-vous de livraison
- Faciliter la consultation des documents
- Fournir le suivi en temps réel
- Assister dans la validation des transports

EXPERTISE:
- Prise et modification de RDV
- Consultation POD/CMR
- Tracking temps réel
- Notifications automatiques
- Validation réception marchandises

STYLE:
- Simple et accessible
- Focus sur la visibilité
- Proactif sur les alertes`,

  capabilities: [
    'Gestion RDV livraison',
    'Consultation documents',
    'Suivi temps réel',
    'Validation transports',
    'Notifications'
  ],

  integrations: ['core-orders', 'tracking-ia', 'ecpmr', 'notifications'],

  quickActions: [
    { trigger: 'rdv', type: 'navigate', label: 'Mes rendez-vous', url: '/deliveries/appointments' },
    { trigger: 'suivi', type: 'navigate', label: 'Suivre mes livraisons', url: '/deliveries/tracking' },
    { trigger: 'document', type: 'navigate', label: 'Mes documents', url: '/deliveries/documents' }
  ],

  responseTemplates: {
    greeting: `Bonjour ! Je suis votre Assistant Livraisons.\n\nJe peux vous aider avec vos rendez-vous, le suivi de vos livraisons et vos documents.\n\nQue puis-je faire pour vous ?`
  },

  knowledgeBaseFilters: {
    topics: ['livraison', 'rdv', 'tracking', 'documents'],
    modules: ['recipient']
  }
};

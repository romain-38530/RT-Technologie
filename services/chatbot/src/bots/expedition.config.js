/**
 * Assistant Expédition Configuration
 * Assistant pour fournisseurs - Gestion expéditions
 */

module.exports = {
  name: 'Assistant Expédition',
  botType: 'expedition',
  version: '1.0.0',

  systemPrompt: `Vous êtes l'Assistant Expédition, spécialisé dans l'aide aux fournisseurs pour gérer leurs expéditions.

VOTRE RÔLE:
- Aider à la gestion des expéditions
- Suivre les prises en charge
- Faciliter la communication avec les transporteurs
- Assister dans la préparation des documents

EXPERTISE:
- Création et suivi expéditions
- Statuts de prise en charge
- Communication transporteurs
- Préparation documents transport
- Notifications automatiques

STYLE:
- Orienté service client
- Focus sur la fiabilité
- Communication proactive`,

  capabilities: [
    'Gestion expéditions',
    'Suivi prises en charge',
    'Communication transporteurs',
    'Documents transport',
    'Notifications'
  ],

  integrations: ['core-orders', 'tracking-ia', 'notifications'],

  quickActions: [
    { trigger: 'expédition', type: 'navigate', label: 'Mes expéditions', url: '/shipments' },
    { trigger: 'transporteur', type: 'navigate', label: 'Contacter transporteur', url: '/shipments/contact' },
    { trigger: 'document', type: 'navigate', label: 'Préparer documents', url: '/shipments/documents' }
  ],

  responseTemplates: {
    greeting: `Bonjour ! Je suis votre Assistant Expédition.\n\nJe peux vous aider à gérer vos expéditions et communiquer avec les transporteurs.\n\nComment puis-je vous aider ?`
  },

  knowledgeBaseFilters: {
    topics: ['expedition', 'transporteur', 'documents'],
    modules: ['supplier']
  }
};

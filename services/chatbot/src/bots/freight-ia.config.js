/**
 * Assistant Freight IA Configuration
 * Assistant pour transitaires - Gestion import/export
 */

module.exports = {
  name: 'Assistant Freight IA',
  botType: 'freight-ia',
  version: '1.0.0',

  systemPrompt: `Vous êtes l'Assistant Freight IA, expert en transport international et transit pour les transitaires.

VOTRE RÔLE:
- Aider à la gestion des offres import/export
- Gérer le pré et post acheminement
- Intégrer les transporteurs routiers
- Optimiser les flux internationaux

EXPERTISE:
- Cotations import/export
- Gestion transitaires
- Pré/post acheminement
- Intégration transporteurs routiers locaux
- Douanes et réglementations
- Tracking multimodal

STYLE:
- International et multilingue
- Focus sur la complexité logistique
- Expertise réglementaire`,

  capabilities: [
    'Offres import/export',
    'Gestion pré/post acheminement',
    'Intégration transporteurs',
    'Cotations internationales',
    'Tracking multimodal'
  ],

  integrations: ['core-orders', 'tracking-ia', 'bourse'],

  quickActions: [
    { trigger: 'cotation', type: 'navigate', label: 'Demander cotation', url: '/freight/quote' },
    { trigger: 'acheminement', type: 'navigate', label: 'Gérer acheminements', url: '/freight/routing' },
    { trigger: 'transporteur', type: 'navigate', label: 'Transporteurs locaux', url: '/freight/carriers' }
  ],

  responseTemplates: {
    greeting: `Bonjour ! Je suis votre Assistant Freight IA.\n\nJe peux vous aider avec vos flux internationaux, cotations et acheminements.\n\nComment puis-je vous assister ?`
  },

  knowledgeBaseFilters: {
    topics: ['freight', 'import', 'export', 'transitaire'],
    modules: ['forwarder']
  }
};

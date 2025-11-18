/**
 * RT HelpBot Configuration
 * Support technique 24/7 - Résolution autonome 80% des problèmes
 */

module.exports = {
  name: 'RT HelpBot',
  botType: 'helpbot',
  version: '1.0.0',

  systemPrompt: `Vous êtes RT HelpBot, l'assistant de support technique 24/7 de la plateforme RT Technologie.

VOTRE MISSION:
- Résoudre les problèmes techniques de manière autonome
- Diagnostiquer les dysfonctionnements via les API
- Guider les utilisateurs pas à pas
- Escalader vers un technicien humain si nécessaire

CAPACITÉS SPÉCIALES:
- Accès aux diagnostics automatiques (API, ERP, TMS, WMS, etc.)
- Base de connaissances exhaustive (FAQs, procédures, tutoriels)
- Système de priorisation intelligent (Standard, Important, Urgent)
- Transfert automatique vers technicien pour problèmes critiques

RÈGLES D'ESCALADE:
- URGENT (Priorité 1): Transfert immédiat pour blocages critiques, pertes de données, production down
- IMPORTANT (Priorité 2): Escalade après 2 tentatives sans résolution
- STANDARD (Priorité 3): Escalade après 3 tentatives sans résolution

STYLE DE COMMUNICATION:
- Professionnel et empathique
- Réponses claires et structurées
- Actions concrètes avec étapes numérotées
- Proposer systématiquement des diagnostics pour problèmes techniques
- Rassurer l'utilisateur et donner un temps estimé

Si vous ne pouvez pas résoudre le problème, PROPOSEZ TOUJOURS le transfert vers un technicien.`,

  capabilities: [
    'Support technique multiservice',
    'Diagnostics automatiques API/ERP/TMS/WMS',
    'Recherche base de connaissances',
    'Priorisation intelligente des tickets',
    'Escalade automatique vers technicien',
    'Suivi de tickets en temps réel'
  ],

  integrations: [
    'core-orders',
    'erp-sync',
    'tms-sync',
    'wms-sync',
    'tracking-ia',
    'affret-ia',
    'vigilance',
    'notifications',
    'ecpmr'
  ],

  quickActions: [
    {
      trigger: 'erp',
      type: 'diagnostic',
      label: 'Vérifier connexion ERP',
      action: 'run_diagnostics',
      params: { checks: ['erp_connection'] }
    },
    {
      trigger: 'transporteur',
      type: 'diagnostic',
      label: 'Vérifier statut transporteur',
      action: 'run_diagnostics',
      params: { checks: ['carrier_status'] }
    },
    {
      trigger: 'document',
      type: 'diagnostic',
      label: 'Vérifier transmission documents',
      action: 'run_diagnostics',
      params: { checks: ['document_transmission'] }
    },
    {
      trigger: 'lent',
      type: 'diagnostic',
      label: 'Vérifier santé serveurs',
      action: 'run_diagnostics',
      params: { checks: ['server_health', 'api_health'] }
    },
    {
      trigger: 'technicien',
      type: 'escalate',
      label: 'Parler à un technicien',
      action: 'transfer_to_human'
    }
  ],

  responseTemplates: {
    greeting: `Bonjour ! Je suis RT HelpBot, votre assistant support 24/7.

Comment puis-je vous aider aujourd'hui ?

💡 Je peux:
- Diagnostiquer des problèmes techniques
- Vous guider dans l'utilisation de la plateforme
- Répondre à vos questions
- Vous mettre en contact avec un technicien si nécessaire`,

    escalation_urgent: `🚨 URGENCE DÉTECTÉE

Votre problème nécessite une intervention immédiate. Je transfère votre demande à un technicien prioritaire.

⏱️ Un technicien va vous contacter dans les 15 minutes.

Je reste à votre disposition pour toute question.`,

    escalation_standard: `Je vais transférer votre demande à un technicien pour un traitement personnalisé.

📋 Ticket créé: {ticketId}
⏱️ Temps de réponse estimé: {estimatedTime}

Un technicien reviendra vers vous rapidement avec une solution.`,

    diagnostics_running: `Je lance des diagnostics automatiques pour identifier le problème...

🔍 Vérifications en cours:
{checks}

Un instant...`,

    diagnostics_complete: `✅ Diagnostics terminés

Résultats:
{results}

{recommendation}`,

    problem_resolved: `Super ! Je suis heureux d'avoir pu résoudre votre problème.

N'hésitez pas à me recontacter si vous avez d'autres questions !

💡 Astuce: Vous pouvez consulter notre base de connaissances pour plus d'informations.`,

    fallback_to_human: `Je ne suis pas certain de pouvoir résoudre ce problème de manière optimale.

Je vous recommande de parler à un technicien qui pourra vous aider plus efficacement.

Souhaitez-vous que je transfère votre demande ?`
  },

  priorityRules: {
    // Keywords that trigger immediate escalation
    urgentKeywords: [
      'bloqué', 'blocage', 'impossible', 'urgent', 'critique',
      'production down', 'perte de données', 'crash'
    ],

    // Keywords that indicate important issues
    importantKeywords: [
      'erreur', 'bug', 'ne fonctionne pas', 'problème',
      'affret ia', 'signature électronique'
    ],

    // Max interactions before auto-escalation
    maxInteractionsBeforeEscalation: 3,

    // Time window for interaction counting (ms)
    interactionTimeWindow: 30 * 60 * 1000 // 30 minutes
  },

  knowledgeBaseFilters: {
    // All topics available for helpbot
    topics: ['all'],
    modules: ['all']
  }
};

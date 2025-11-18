/**
 * Copilote Chauffeur Configuration
 * Assistant pour conducteurs - Gestion missions terrain
 */

module.exports = {
  name: 'Copilote Chauffeur',
  botType: 'copilote-chauffeur',
  version: '1.0.0',

  systemPrompt: `Vous êtes le Copilote Chauffeur, l'assistant mobile des conducteurs sur le terrain.

VOTRE RÔLE:
- Aider à l'activation des missions
- Guider dans la gestion des statuts et tracking
- Assister pour le dépôt de documents
- Former à la signature électronique terrain

EXPERTISE:
- Activation et suivi de missions
- Gestion statuts temps réel (En route, Arrivé, Chargement, Livraison, Terminé)
- Tracking GPS automatique
- Dépôt POD/CMR avec photos
- Signature électronique sur tablette/smartphone
- Mode offline (synchronisation ultérieure)

MODULES MOBILES:
- Mes missions du jour
- Activation mission
- Changement statuts
- Dépôt POD/CMR
- Signature électronique
- Navigation GPS
- Communication dispatcher

STYLE:
- Très simple et intuitif
- Adapté à l'utilisation mobile
- Guidance vocale possible
- Instructions visuelles`,

  capabilities: [
    'Activation mission',
    'Gestion statuts/tracking',
    'Dépôt documents',
    'Signature électronique',
    'Mode offline',
    'Navigation GPS'
  ],

  integrations: ['core-orders', 'tracking-ia', 'ecpmr'],

  quickActions: [
    { trigger: 'mission', type: 'action', label: 'Activer ma mission', action: 'activate_mission' },
    { trigger: 'statut', type: 'action', label: 'Changer statut', action: 'update_status' },
    { trigger: 'pod', type: 'action', label: 'Déposer POD', action: 'upload_pod' },
    { trigger: 'signature', type: 'action', label: 'Faire signer', action: 'e_signature' },
    { trigger: 'navigation', type: 'action', label: 'Naviguer', action: 'start_navigation' }
  ],

  responseTemplates: {
    greeting: `Bonjour ! Je suis votre Copilote Chauffeur.\n\n🚚 Je suis là pour vous assister dans vos missions.\n\nQue souhaitez-vous faire ?\n\n- Activer une mission\n- Changer un statut\n- Déposer un POD\n- Besoin d'aide ?`,

    mission_help: `Pour activer votre mission:\n\n1️⃣ Ouvrez "Mes missions"\n2️⃣ Touchez la mission à activer\n3️⃣ Appuyez sur "Démarrer"\n4️⃣ Le tracking GPS démarre automatiquement\n\n✅ Votre dispatcher sera notifié.`,

    pod_help: `Pour déposer votre POD:\n\n1️⃣ Changez le statut en "Livraison terminée"\n2️⃣ Faites signer le destinataire sur l'écran\n3️⃣ Prenez une photo du bordereau papier\n4️⃣ Validez et envoyez\n\n✅ Le POD est transmis instantanément.`,

    offline_help: `Mode hors ligne activé 📡\n\nVous pouvez continuer à travailler:\n- Changements de statuts sauvegardés localement\n- Signatures enregistrées\n- Photos stockées\n\nTout sera synchronisé dès que vous aurez du réseau.`
  },

  knowledgeBaseFilters: {
    topics: ['chauffeur', 'mission', 'pod', 'signature', 'mobile'],
    modules: ['driver']
  }
};

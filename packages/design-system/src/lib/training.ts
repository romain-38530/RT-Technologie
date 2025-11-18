/**
 * Training Service - Centralise toutes les ressources de formation
 * @module training
 */

export interface TrainingResource {
  /** Nom de l'outil/module */
  toolName: string;
  /** URL du guide de formation principal (Markdown ou PDF) */
  guideUrl: string;
  /** URL de la vidéo tutorielle (YouTube, Vimeo, etc.) */
  videoUrl?: string;
  /** Durée estimée de lecture du guide (minutes) */
  estimatedDuration: number;
  /** Niveau de difficulté */
  level: 'beginner' | 'intermediate' | 'advanced';
  /** Tags pour catégorisation */
  tags: string[];
  /** Langue disponible */
  languages: ('fr' | 'en' | 'es' | 'de' | 'it')[];
  /** Date de dernière mise à jour */
  lastUpdated: string;
}

/**
 * Catalogue complet des ressources de formation
 * Toutes les URLs pointent vers docs/formations/ pour l'instant
 * En production, remplacer par https://docs.rt-technologie.com/formations/
 */
export const TRAINING_CATALOG: Record<string, TrainingResource> = {
  'Palettes': {
    toolName: 'Palettes',
    guideUrl: '/docs/formations/GUIDE_PALETTES.md',
    videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_PALETTES',
    estimatedDuration: 15,
    level: 'beginner',
    tags: ['palettes', 'économie-circulaire', 'qr-code', 'logistique'],
    languages: ['fr', 'en'],
    lastUpdated: '2025-01-18'
  },

  'Bourse de Stockage': {
    toolName: 'Bourse de Stockage',
    guideUrl: '/docs/formations/GUIDE_BOURSE_STOCKAGE.md',
    videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_STORAGE',
    estimatedDuration: 25,
    level: 'intermediate',
    tags: ['stockage', 'marketplace', 'ia', 'offres', 'contrats'],
    languages: ['fr', 'en'],
    lastUpdated: '2025-01-18'
  },

  'Application Conducteur': {
    toolName: 'Application Conducteur',
    guideUrl: '/docs/formations/GUIDE_APP_CONDUCTEUR.md',
    videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_DRIVER',
    estimatedDuration: 30,
    level: 'beginner',
    tags: ['mobile', 'conducteur', 'gps', 'signature', 'scan'],
    languages: ['fr', 'en', 'es'],
    lastUpdated: '2025-01-18'
  },

  'Industrie': {
    toolName: 'Industrie',
    guideUrl: '/docs/formations/GUIDE_INDUSTRIE.md',
    estimatedDuration: 20,
    level: 'intermediate',
    tags: ['industrie', 'commandes', 'vigilance', 'affret-ia'],
    languages: ['fr'],
    lastUpdated: '2025-01-18'
  },

  'Transporteur': {
    toolName: 'Transporteur',
    guideUrl: '/docs/formations/GUIDE_TRANSPORTEUR.md',
    estimatedDuration: 18,
    level: 'beginner',
    tags: ['transporteur', 'missions', 'planning', 'documents'],
    languages: ['fr', 'en'],
    lastUpdated: '2025-01-18'
  },

  'Logisticien': {
    toolName: 'Logisticien',
    guideUrl: '/docs/formations/GUIDE_LOGISTICIEN.md',
    estimatedDuration: 22,
    level: 'intermediate',
    tags: ['logisticien', 'quais', 'réceptions', 'expéditions'],
    languages: ['fr'],
    lastUpdated: '2025-01-18'
  },

  'Backoffice Admin': {
    toolName: 'Backoffice Admin',
    guideUrl: '/docs/formations/GUIDE_BACKOFFICE.md',
    estimatedDuration: 35,
    level: 'advanced',
    tags: ['admin', 'supervision', 'analytics', 'configuration'],
    languages: ['fr', 'en'],
    lastUpdated: '2025-01-18'
  },

  'E-CMR': {
    toolName: 'E-CMR',
    guideUrl: '/docs/formations/GUIDE_ECMR.md',
    videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_ECMR',
    estimatedDuration: 12,
    level: 'beginner',
    tags: ['ecmr', 'signature', 'documents', 'conformité'],
    languages: ['fr', 'en', 'de'],
    lastUpdated: '2025-01-18'
  },

  'Affret.IA': {
    toolName: 'Affret.IA',
    guideUrl: '/docs/formations/GUIDE_AFFRET_IA.md',
    videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_AFFRET',
    estimatedDuration: 28,
    level: 'advanced',
    tags: ['ia', 'affretement', 'matching', 'optimisation'],
    languages: ['fr', 'en'],
    lastUpdated: '2025-01-18'
  }
};

/**
 * Récupère les ressources de formation pour un outil donné
 * @param toolName - Nom de l'outil
 * @returns Ressource de formation ou undefined si non trouvé
 */
export function getTrainingResource(toolName: string): TrainingResource | undefined {
  return TRAINING_CATALOG[toolName];
}

/**
 * Récupère l'URL du guide de formation pour un outil
 * @param toolName - Nom de l'outil
 * @returns URL du guide ou string vide si non trouvé
 */
export function getTrainingUrl(toolName: string): string {
  const resource = getTrainingResource(toolName);
  return resource?.guideUrl || '';
}

/**
 * Récupère toutes les ressources de formation par tag
 * @param tag - Tag à filtrer
 * @returns Liste des ressources correspondantes
 */
export function getTrainingByTag(tag: string): TrainingResource[] {
  return Object.values(TRAINING_CATALOG).filter(resource =>
    resource.tags.includes(tag)
  );
}

/**
 * Récupère toutes les ressources de formation par niveau
 * @param level - Niveau de difficulté
 * @returns Liste des ressources correspondantes
 */
export function getTrainingByLevel(
  level: 'beginner' | 'intermediate' | 'advanced'
): TrainingResource[] {
  return Object.values(TRAINING_CATALOG).filter(
    resource => resource.level === level
  );
}

/**
 * Récupère toutes les ressources de formation disponibles dans une langue
 * @param language - Code langue (ISO 639-1)
 * @returns Liste des ressources correspondantes
 */
export function getTrainingByLanguage(
  language: 'fr' | 'en' | 'es' | 'de' | 'it'
): TrainingResource[] {
  return Object.values(TRAINING_CATALOG).filter(resource =>
    resource.languages.includes(language)
  );
}

/**
 * Événement de tracking pour analytics
 */
export interface TrainingClickEvent {
  /** Nom de l'outil */
  toolName: string;
  /** URL de la formation cliquée */
  trainingUrl: string;
  /** Timestamp du clic */
  timestamp: string;
  /** ID de l'utilisateur (si disponible) */
  userId?: string;
  /** Page d'origine du clic */
  sourcePage?: string;
  /** Type de ressource (guide, video) */
  resourceType: 'guide' | 'video';
}

/**
 * Enregistre un clic sur un bouton de formation
 * @param event - Données de l'événement
 */
export function trackTrainingClick(event: TrainingClickEvent): void {
  // Pour l'instant, log en console
  // En production : envoyer à Google Analytics, Mixpanel, etc.
  console.log('[Training Analytics]', event);

  // Exemple d'intégration future avec Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'training_click', {
      event_category: 'Training',
      event_label: event.toolName,
      value: event.resourceType === 'video' ? 2 : 1, // Poids différent pour vidéo
    });
  }

  // Exemple d'intégration future avec un backend analytics custom
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(err => console.error('Failed to track training click:', err));
  }
}

/**
 * Ouvre une ressource de formation et track l'événement
 * @param toolName - Nom de l'outil
 * @param resourceType - Type de ressource (guide ou video)
 * @param userId - ID de l'utilisateur (optionnel)
 * @param sourcePage - Page d'origine (optionnel)
 */
export function openTrainingResource(
  toolName: string,
  resourceType: 'guide' | 'video' = 'guide',
  userId?: string,
  sourcePage?: string
): void {
  const resource = getTrainingResource(toolName);

  if (!resource) {
    console.warn(`No training resource found for: ${toolName}`);
    alert(`Formation pour ${toolName} : Documentation à venir`);
    return;
  }

  const url = resourceType === 'video' && resource.videoUrl
    ? resource.videoUrl
    : resource.guideUrl;

  // Track l'événement
  trackTrainingClick({
    toolName,
    trainingUrl: url,
    timestamp: new Date().toISOString(),
    userId,
    sourcePage,
    resourceType
  });

  // Ouvre la ressource
  if (url.startsWith('http')) {
    // URL externe (YouTube, docs externes)
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    // URL interne (fichiers locaux)
    // En dev: ouvre le markdown
    // En prod: rediriger vers docs.rt-technologie.com
    const prodUrl = url.replace('/docs/', 'https://docs.rt-technologie.com/');
    window.open(prodUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Récupère les statistiques d'utilisation des formations
 * (Fonction stub pour future implémentation)
 */
export interface TrainingStats {
  totalViews: number;
  averageDuration: number;
  completionRate: number;
  topResources: Array<{ toolName: string; views: number }>;
}

/**
 * Récupère les statistiques globales de formation
 * @returns Promesse avec les statistiques
 */
export async function getTrainingStats(): Promise<TrainingStats> {
  // Future implémentation avec API backend
  return {
    totalViews: 0,
    averageDuration: 0,
    completionRate: 0,
    topResources: []
  };
}

export default {
  TRAINING_CATALOG,
  getTrainingResource,
  getTrainingUrl,
  getTrainingByTag,
  getTrainingByLevel,
  getTrainingByLanguage,
  trackTrainingClick,
  openTrainingResource,
  getTrainingStats
};

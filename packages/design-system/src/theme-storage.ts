/**
 * RT-Technologie Design System - Thème Bourse de Stockage
 * @description Configuration spécifique pour le module Bourse de Stockage
 */

export const storageTheme = {
  // Couleurs spécifiques bourse
  colors: {
    need: {
      open: '#3b82f6', // Bleu - Besoin ouvert
      closed: '#6b7280', // Gris - Besoin fermé
      assigned: '#10b981', // Vert - Besoin attribué
      expired: '#ef4444', // Rouge - Besoin expiré
    },
    offer: {
      pending: '#f59e0b', // Orange - Offre en attente
      accepted: '#10b981', // Vert - Offre acceptée
      rejected: '#ef4444', // Rouge - Offre rejetée
      negotiating: '#8b5cf6', // Violet - En négociation
    },
    aiRanking: {
      top1: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', // Or
      top2: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)', // Argent
      top3: 'linear-gradient(135deg, #fdba74 0%, #fb923c 100%)', // Bronze
    },
    capacity: {
      low: '#10b981', // Vert - Capacité basse (disponible)
      medium: '#f59e0b', // Orange - Capacité moyenne
      high: '#ef4444', // Rouge - Capacité haute (presque plein)
    },
  },

  // Badges et statuts
  badges: {
    temperature: {
      ambient: 'Ambiant',
      refrigerated: 'Frigo (+2/+8°C)',
      frozen: 'Congelé (-18°C)',
      controlled: 'Température contrôlée',
    },
    adr: {
      class1: 'ADR Classe 1',
      class2: 'ADR Classe 2',
      class3: 'ADR Classe 3',
      multiclass: 'ADR Multi-classes',
    },
    services: {
      crossdock: 'Cross-docking',
      picking: 'Préparation de commandes',
      labeling: 'Étiquetage',
      packaging: 'Conditionnement',
      transport: 'Transport inclus',
      insurance: 'Assurance marchandise',
    },
  },

  // Grilles et layouts
  layouts: {
    cardGrid: {
      mobile: 'grid-cols-1',
      tablet: 'md:grid-cols-2',
      desktop: 'lg:grid-cols-3',
      wide: 'xl:grid-cols-4',
    },
    sidebar: {
      width: '280px',
      widthCollapsed: '64px',
    },
    comparator: {
      maxColumns: 4,
      minColumnWidth: '200px',
    },
  },

  // Tableaux
  tables: {
    header: {
      bg: 'bg-gray-100',
      text: 'text-gray-700 font-semibold uppercase tracking-wide text-xs',
      padding: 'px-4 py-3',
    },
    cell: {
      padding: 'px-4 py-3',
      text: 'text-gray-900 text-sm',
    },
    row: {
      hover: 'hover:bg-gray-50',
      selected: 'bg-blue-50 border-l-4 border-l-blue-600',
    },
  },

  // Filtres
  filters: {
    sidebar: {
      width: '280px',
      padding: 'p-6',
      gap: 'space-y-6',
    },
    chip: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      removable: 'hover:bg-blue-200 cursor-pointer',
    },
  },

  // Cartes interactives
  maps: {
    defaultHeight: '400px',
    fullHeight: '600px',
    marker: {
      size: '32px',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    },
  },

  // Analytics et graphiques
  analytics: {
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: '#6b7280',
    },
    chart: {
      height: '300px',
      heightLarge: '400px',
      padding: '16px',
    },
  },

  // Modales et panels
  modals: {
    sizes: {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full',
    },
    backdrop: 'bg-gray-900 bg-opacity-50',
  },

  // WMS Integration
  wms: {
    connected: {
      border: 'border-green-300',
      bg: 'bg-green-50',
      indicator: 'bg-green-500',
    },
    disconnected: {
      border: 'border-gray-300',
      bg: 'bg-gray-50',
      indicator: 'bg-gray-400',
    },
    syncing: {
      border: 'border-blue-300',
      bg: 'bg-blue-50',
      indicator: 'bg-blue-500 animate-pulse',
    },
  },

  // Comparateur d'offres
  comparator: {
    highlight: {
      best: 'bg-green-50 font-semibold text-green-700',
      worst: 'bg-red-50 text-red-700',
      neutral: '',
    },
    aiRanking: {
      top1: 'bg-gradient-to-b from-yellow-100 to-yellow-50',
      top2: 'bg-gradient-to-b from-gray-100 to-gray-50',
      top3: 'bg-gradient-to-b from-orange-100 to-orange-50',
    },
  },
} as const;

/**
 * Classes utilitaires bourse
 */
export const storageClasses = {
  pageContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  sectionTitle: 'text-2xl font-bold text-gray-900 mb-6',
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  filterSidebar: 'w-72 bg-white border-r border-gray-200 p-6 space-y-6',
  mainContent: 'flex-1 p-6',
  dashboardKPI:
    'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg',
  tableContainer: 'overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200',
  badge:
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
  chip: 'inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium',
} as const;

export default storageTheme;

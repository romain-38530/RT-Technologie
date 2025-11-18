/**
 * RT-Technologie Design System - Thème Mobile
 * @description Configuration spécifique pour l'app mobile conducteur
 */

export const mobileTheme = {
  // Tailles minimales pour l'interaction tactile (WCAG 2.1 AA)
  touchTargets: {
    minimum: '44px', // iOS/WCAG minimum
    recommended: '48px', // Android/Material Design minimum
    comfortable: '56px', // Taille confortable pour les gants
  },

  // Espacements optimisés mobile
  spacing: {
    screen: {
      padding: '16px',
      paddingLarge: '24px',
    },
    component: {
      gap: '12px',
      gapLarge: '16px',
    },
    section: {
      gap: '24px',
      gapLarge: '32px',
    },
  },

  // Typographie mobile (tailles légèrement plus grandes)
  typography: {
    heading: {
      h1: '2rem', // 32px (au lieu de 48px sur desktop)
      h2: '1.75rem', // 28px
      h3: '1.5rem', // 24px
      h4: '1.25rem', // 20px
    },
    body: {
      large: '1.125rem', // 18px
      regular: '1rem', // 16px
      small: '0.875rem', // 14px
      tiny: '0.75rem', // 12px
    },
    button: {
      large: '1.125rem', // 18px
      regular: '1rem', // 16px
      small: '0.875rem', // 14px
    },
  },

  // Couleurs spécifiques mobile (code couleur intuitif)
  colors: {
    mission: {
      enRoute: '#3b82f6', // Bleu - En route
      waiting: '#f59e0b', // Orange - Attente
      completed: '#10b981', // Vert - Terminé
      error: '#ef4444', // Rouge - Erreur/Retard
      disabled: '#6b7280', // Gris - Inactif
    },
    status: {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: '#6b7280',
    },
  },

  // Breakpoints mobile
  breakpoints: {
    mobile: '375px', // iPhone SE
    mobileLarge: '414px', // iPhone Pro
    tablet: '768px', // iPad
    desktop: '1024px', // Desktop (pas utilisé en PWA normalement)
  },

  // Animations optimisées mobile (plus rapides)
  animations: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Ombres pour mobile (plus subtiles)
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Rayons de bordure
  borderRadius: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    full: '9999px',
  },

  // Hauteurs de navigation
  navigation: {
    bottomNav: '64px',
    topBar: '56px',
  },

  // Zones de sécurité (safe areas)
  safeAreas: {
    top: 'env(safe-area-inset-top)',
    right: 'env(safe-area-inset-right)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
  },

  // Gestes tactiles
  gestures: {
    swipeThreshold: '50px',
    longPressDelay: '500ms',
  },
} as const;

/**
 * Classes utilitaires mobiles
 */
export const mobileClasses = {
  touchTarget: 'min-h-[48px] min-w-[48px]',
  touchTargetLarge: 'min-h-[56px] min-w-[56px]',
  screenPadding: 'px-4',
  sectionGap: 'space-y-6',
  componentGap: 'space-y-3',
  buttonPrimary:
    'min-h-[48px] px-6 rounded-lg bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 active:bg-blue-800 transition-colors',
  buttonSecondary:
    'min-h-[48px] px-6 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-semibold text-base hover:bg-gray-50 active:bg-gray-100 transition-colors',
  card: 'rounded-lg border border-gray-200 bg-white shadow-sm p-6',
  input:
    'min-h-[48px] px-4 rounded-lg border-2 border-gray-300 bg-white text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all',
  badge:
    'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
} as const;

export default mobileTheme;

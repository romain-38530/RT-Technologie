/**
 * RT-Technologie Design System - Système d'espacement
 * @description Système d'espacement basé sur une échelle de 4pt
 */

export const spacing = {
  // Échelle de base (multiples de 4px)
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px

  // Espacements sémantiques
  semantic: {
    // Espacement interne des composants
    componentPadding: {
      xs: '0.5rem',     // 8px
      sm: '0.75rem',    // 12px
      md: '1rem',       // 16px
      lg: '1.5rem',     // 24px
      xl: '2rem',       // 32px
    },

    // Espacement entre les sections
    sectionGap: {
      xs: '1rem',       // 16px
      sm: '1.5rem',     // 24px
      md: '2rem',       // 32px
      lg: '3rem',       // 48px
      xl: '4rem',       // 64px
    },

    // Espacement entre les éléments
    itemGap: {
      xs: '0.25rem',    // 4px
      sm: '0.5rem',     // 8px
      md: '0.75rem',    // 12px
      lg: '1rem',       // 16px
      xl: '1.5rem',     // 24px
    },

    // Marges de page
    pageMargin: {
      mobile: '1rem',   // 16px
      tablet: '1.5rem', // 24px
      desktop: '2rem',  // 32px
    },

    // Padding de carte
    cardPadding: {
      sm: '1rem',       // 16px
      md: '1.5rem',     // 24px
      lg: '2rem',       // 32px
    },
  },

  // Layout
  layout: {
    containerMaxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    containerPadding: '1rem', // 16px
  },

  // Grilles
  grid: {
    gap: {
      xs: '0.5rem',     // 8px
      sm: '1rem',       // 16px
      md: '1.5rem',     // 24px
      lg: '2rem',       // 32px
      xl: '3rem',       // 48px
    },
  },
} as const;

/**
 * Breakpoints responsive
 */
export const breakpoints = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1536px',
} as const;

/**
 * Classes utilitaires pour les espacements
 */
export const spacingClasses = {
  // Padding
  padding: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
  paddingX: {
    xs: 'px-2',
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-6',
    xl: 'px-8',
  },
  paddingY: {
    xs: 'py-2',
    sm: 'py-3',
    md: 'py-4',
    lg: 'py-6',
    xl: 'py-8',
  },

  // Margin
  margin: {
    xs: 'm-2',
    sm: 'm-3',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
  },
  marginX: {
    xs: 'mx-2',
    sm: 'mx-3',
    md: 'mx-4',
    lg: 'mx-6',
    xl: 'mx-8',
  },
  marginY: {
    xs: 'my-2',
    sm: 'my-3',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  },

  // Gap
  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },

  // Space between
  space: {
    xs: 'space-y-2',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
} as const;

export default spacing;

/**
 * RT-Technologie Design System - Typographie
 * @description Système typographique cohérent avec hiérarchie claire
 */

export const typography = {
  // Familles de polices
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },

  // Tailles de police
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },

  // Poids de police
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Hauteur de ligne
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },

  // Espacement des lettres
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Styles de texte prédéfinis
  heading: {
    h1: {
      fontSize: '3rem',      // 48px
      fontWeight: '700',
      lineHeight: '1.25',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem',   // 36px
      fontWeight: '700',
      lineHeight: '1.25',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem',  // 30px
      fontWeight: '600',
      lineHeight: '1.25',
      letterSpacing: '0',
    },
    h4: {
      fontSize: '1.5rem',    // 24px
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    h5: {
      fontSize: '1.25rem',   // 20px
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    h6: {
      fontSize: '1.125rem',  // 18px
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
  },

  // Corps de texte
  body: {
    large: {
      fontSize: '1.125rem',  // 18px
      fontWeight: '400',
      lineHeight: '1.75',
    },
    regular: {
      fontSize: '1rem',      // 16px
      fontWeight: '400',
      lineHeight: '1.5',
    },
    small: {
      fontSize: '0.875rem',  // 14px
      fontWeight: '400',
      lineHeight: '1.5',
    },
    tiny: {
      fontSize: '0.75rem',   // 12px
      fontWeight: '400',
      lineHeight: '1.5',
    },
  },

  // Labels et métadonnées
  label: {
    large: {
      fontSize: '0.875rem',  // 14px
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0.025em',
      textTransform: 'uppercase' as const,
    },
    regular: {
      fontSize: '0.75rem',   // 12px
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    small: {
      fontSize: '0.625rem',  // 10px
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
  },

  // Code
  code: {
    inline: {
      fontSize: '0.875em',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      backgroundColor: '#f3f4f6',
      padding: '0.125rem 0.25rem',
      borderRadius: '0.25rem',
    },
    block: {
      fontSize: '0.875rem',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      lineHeight: '1.75',
    },
  },
} as const;

/**
 * Classes CSS Tailwind pour la typographie
 */
export const typographyClasses = {
  h1: 'text-5xl font-bold leading-tight tracking-tight',
  h2: 'text-4xl font-bold leading-tight tracking-tight',
  h3: 'text-3xl font-semibold leading-tight',
  h4: 'text-2xl font-semibold leading-normal',
  h5: 'text-xl font-semibold leading-normal',
  h6: 'text-lg font-semibold leading-normal',
  bodyLarge: 'text-lg font-normal leading-relaxed',
  body: 'text-base font-normal leading-normal',
  bodySmall: 'text-sm font-normal leading-normal',
  bodyTiny: 'text-xs font-normal leading-normal',
  labelLarge: 'text-sm font-semibold uppercase tracking-wide',
  label: 'text-xs font-semibold uppercase tracking-wider',
  labelSmall: 'text-[10px] font-semibold uppercase tracking-wider',
} as const;

export default typography;

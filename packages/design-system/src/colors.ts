/**
 * RT-Technologie Design System - Palette de couleurs
 * @description Système de couleurs cohérent pour toutes les applications RT
 */

export const colors = {
  // Couleurs principales
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Bleu RT principal
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Succès
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#10b981', // Vert principal
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Avertissement
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Orange principal
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Erreur
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Rouge principal
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutre
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280', // Gris principal
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Couleurs spécifiques RT
  rt: {
    blue: '#3b82f6',
    darkBlue: '#1e40af',
    lightBlue: '#60a5fa',
    accent: '#f59e0b',
  },

  // Couleurs sémantiques
  semantic: {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    pending: '#f59e0b',
    completed: '#10b981',
    cancelled: '#6b7280',
  },

  // Statuts de commande
  orderStatus: {
    draft: '#9ca3af',
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    inProgress: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  },

  // Backgrounds
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    dark: '#111827',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Bordures
  border: {
    light: '#e5e7eb',
    default: '#d1d5db',
    dark: '#9ca3af',
  },

  // Texte
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    disabled: '#d1d5db',
  },
} as const;

export type ColorKey = keyof typeof colors;
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/**
 * Fonction utilitaire pour obtenir une couleur
 * @example getColor('primary', 500) => '#3b82f6'
 */
export const getColor = (colorKey: ColorKey, shade?: ColorShade | string): string => {
  const colorGroup = colors[colorKey];

  if (typeof colorGroup === 'string') {
    return colorGroup;
  }

  if (typeof colorGroup === 'object' && shade) {
    return (colorGroup as any)[shade] || '';
  }

  return '';
};

export default colors;

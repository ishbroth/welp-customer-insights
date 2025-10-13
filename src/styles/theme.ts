/**
 * Central theme configuration for Welp application
 * All colors, typography, spacing, and design tokens defined here
 *
 * DO NOT hardcode these values in components - import from this file
 */

export const theme = {
  colors: {
    // Primary brand colors (Welp purple/blue)
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#9b87f5',  // Main Welp primary
      600: '#7E69AB',  // Welp secondary
      700: '#6E59A5',  // Welp tertiary
      800: '#5b21b6',
      900: '#4c1d95',
    },

    // Neutral/gray colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },

    // Blue colors (for info/links)
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },

    // Semantic colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',  // Main success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
    },

    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',  // Main error
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
    },

    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',  // Main warning
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
    },

    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#06b6d4',  // Main info
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
    },

    // Green colors (for positive/success states)
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
    },

    // Red colors (for errors/destructive actions)
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
    },

    // Yellow colors (for warnings)
    yellow: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
    },
  },

  typography: {
    // Font families
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['Monaco', 'Courier New', 'monospace'],
    },

    // Font sizes with line heights
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    },

    // Font weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  spacing: {
    // Standard spacing scale (used for padding, margin, gap, etc.)
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',   // Circular
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '2rem',      // 32px
        md: '2.5rem',    // 40px
        lg: '3rem',      // 48px
      },
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
      },
    },
    input: {
      height: '2.5rem',  // 40px
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
    },
    card: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    },
  },
} as const;

// Helper function to get color value
export const getColor = (path: string): string => {
  const parts = path.split('.');
  let value: any = theme.colors;

  for (const part of parts) {
    value = value[part];
    if (!value) return '';
  }

  return value;
};

// Type exports for TypeScript
export type ThemeColors = typeof theme.colors;
export type ThemeTypography = typeof theme.typography;
export type ThemeSpacing = typeof theme.spacing;

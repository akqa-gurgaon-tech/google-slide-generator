// Pre-defined themes similar to Google Slides
import { DesignTokens } from './tokens.js';

// Theme structure definition
export const ThemeStructure = {
  id: 'string',
  name: 'string',
  description: 'string',
  category: 'string', // 'simple', 'modern', 'creative', 'professional', 'custom'
  isDefault: 'boolean',
  isCustom: 'boolean',
  colors: {
    // Background colors for slides
    background: {
      primary: 'string',    // Main slide background
      secondary: 'string',  // Alternate background
      accent: 'string',     // Accent background for emphasis
    },
    
    // Text colors
    text: {
      primary: 'string',    // Main text color
      secondary: 'string',  // Secondary text color
      accent: 'string',     // Accent text color
      inverse: 'string',    // Text on dark backgrounds
    },
    
    // Theme accent colors
    accents: {
      primary: 'string',    // Primary theme color
      secondary: 'string',  // Secondary theme color
      tertiary: 'string',   // Tertiary theme color
      quaternary: 'string', // Fourth accent color
    },
    
    // Interactive elements
    interactive: {
      primary: 'string',
      hover: 'string',
      active: 'string',
      disabled: 'string',
    },
    
    // Borders and dividers
    border: {
      primary: 'string',
      secondary: 'string',
      accent: 'string',
    },
  },
  
  typography: {
    // Font families
    fontFamily: {
      primary: 'array',     // Main font stack
      secondary: 'array',   // Secondary font stack
      accent: 'array',      // Accent font stack
    },
    
    // Text styles for different slide elements
    styles: {
      slideTitle: {
        fontSize: 'string',
        fontWeight: 'string',
        lineHeight: 'string',
        letterSpacing: 'string',
      },
      slideSubtitle: {
        fontSize: 'string',
        fontWeight: 'string',
        lineHeight: 'string',
        letterSpacing: 'string',
      },
      bodyText: {
        fontSize: 'string',
        fontWeight: 'string',
        lineHeight: 'string',
        letterSpacing: 'string',
      },
      caption: {
        fontSize: 'string',
        fontWeight: 'string',
        lineHeight: 'string',
        letterSpacing: 'string',
      },
    },
  },
  
  spacing: {
    slideMargin: 'string',
    elementSpacing: 'string',
    sectionSpacing: 'string',
  },
  
  effects: {
    borderRadius: 'string',
    shadow: 'string',
    transition: 'string',
  },
};

// Google Slides inspired default themes
export const DefaultThemes = {
  // Simple Theme (Google Slides default)
  simple: {
    id: 'simple',
    name: 'Simple Light',
    description: 'Clean and minimal design with classic typography',
    category: 'simple',
    isDefault: true,
    isCustom: false,
    colors: {
      background: {
        primary: DesignTokens.colors.white,
        secondary: DesignTokens.colors.neutral[50],
        accent: DesignTokens.colors.neutral[100],
      },
      text: {
        primary: DesignTokens.colors.neutral[900],
        secondary: DesignTokens.colors.neutral[700],
        accent: DesignTokens.colors.primary[600],
        inverse: DesignTokens.colors.white,
      },
      accents: {
        primary: DesignTokens.colors.primary[500],
        secondary: DesignTokens.colors.secondary[500],
        tertiary: DesignTokens.colors.success[500],
        quaternary: DesignTokens.colors.warning[500],
      },
      interactive: {
        primary: DesignTokens.colors.primary[500],
        hover: DesignTokens.colors.primary[600],
        active: DesignTokens.colors.primary[700],
        disabled: DesignTokens.colors.neutral[300],
      },
      border: {
        primary: DesignTokens.colors.neutral[200],
        secondary: DesignTokens.colors.neutral[300],
        accent: DesignTokens.colors.primary[200],
      },
    },
    typography: {
      fontFamily: {
        primary: DesignTokens.typography.fontFamily.primary,
        secondary: DesignTokens.typography.fontFamily.secondary,
        accent: DesignTokens.typography.fontFamily.primary,
      },
      styles: {
        slideTitle: {
          fontSize: DesignTokens.typography.fontSize['4xl'],
          fontWeight: DesignTokens.typography.fontWeight.bold,
          lineHeight: DesignTokens.typography.lineHeight.tight,
          letterSpacing: DesignTokens.typography.letterSpacing.tight,
        },
        slideSubtitle: {
          fontSize: DesignTokens.typography.fontSize['2xl'],
          fontWeight: DesignTokens.typography.fontWeight.medium,
          lineHeight: DesignTokens.typography.lineHeight.normal,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
        },
        bodyText: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.normal,
          lineHeight: DesignTokens.typography.lineHeight.relaxed,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
        },
        caption: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          lineHeight: DesignTokens.typography.lineHeight.normal,
          letterSpacing: DesignTokens.typography.letterSpacing.wide,
        },
      },
    },
    spacing: {
      slideMargin: DesignTokens.spacing[8],
      elementSpacing: DesignTokens.spacing[4],
      sectionSpacing: DesignTokens.spacing[6],
    },
    effects: {
      borderRadius: DesignTokens.borderRadius.lg,
      shadow: DesignTokens.boxShadow.sm,
      transition: DesignTokens.transition.default,
    },
  },

  // Modern Blue Theme
  modernBlue: {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Professional blue theme with modern typography',
    category: 'modern',
    isDefault: false,
    isCustom: false,
    colors: {
      background: {
        primary: '#f8fafc',
        secondary: '#e2e8f0',
        accent: '#cbd5e1',
      },
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        accent: '#0f172a',
        inverse: '#ffffff',
      },
      accents: {
        primary: '#3b82f6',
        secondary: '#06b6d4',
        tertiary: '#8b5cf6',
        quaternary: '#f59e0b',
      },
      interactive: {
        primary: '#3b82f6',
        hover: '#2563eb',
        active: '#1d4ed8',
        disabled: '#94a3b8',
      },
      border: {
        primary: '#e2e8f0',
        secondary: '#cbd5e1',
        accent: '#3b82f6',
      },
    },
    typography: {
      fontFamily: {
        primary: DesignTokens.typography.fontFamily.primary,
        secondary: DesignTokens.typography.fontFamily.secondary,
        accent: DesignTokens.typography.fontFamily.primary,
      },
      styles: {
        slideTitle: {
          fontSize: DesignTokens.typography.fontSize['5xl'],
          fontWeight: DesignTokens.typography.fontWeight.bold,
          lineHeight: DesignTokens.typography.lineHeight.tight,
          letterSpacing: DesignTokens.typography.letterSpacing.tight,
        },
        slideSubtitle: {
          fontSize: DesignTokens.typography.fontSize['2xl'],
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          lineHeight: DesignTokens.typography.lineHeight.snug,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
        },
        bodyText: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.normal,
          lineHeight: DesignTokens.typography.lineHeight.relaxed,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
        },
        caption: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          lineHeight: DesignTokens.typography.lineHeight.normal,
          letterSpacing: DesignTokens.typography.letterSpacing.wide,
        },
      },
    },
    spacing: {
      slideMargin: DesignTokens.spacing[10],
      elementSpacing: DesignTokens.spacing[5],
      sectionSpacing: DesignTokens.spacing[8],
    },
    effects: {
      borderRadius: DesignTokens.borderRadius.xl,
      shadow: DesignTokens.boxShadow.md,
      transition: DesignTokens.transition.default,
    },
  },

  // Dark Professional Theme
  darkProfessional: {
    id: 'dark-professional',
    name: 'Dark Professional',
    description: 'Sophisticated dark theme for professional presentations',
    category: 'professional',
    isDefault: false,
    isCustom: false,
    colors: {
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#334155',
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        accent: '#94a3b8',
        inverse: '#0f172a',
      },
      accents: {
        primary: '#60a5fa',
        secondary: '#34d399',
        tertiary: '#fbbf24',
        quaternary: '#f87171',
      },
      interactive: {
        primary: '#60a5fa',
        hover: '#3b82f6',
        active: '#2563eb',
        disabled: '#475569',
      },
      border: {
        primary: '#334155',
        secondary: '#475569',
        accent: '#60a5fa',
      },
    },
    typography: {
      fontFamily: {
        primary: DesignTokens.typography.fontFamily.primary,
        secondary: DesignTokens.typography.fontFamily.secondary,
        accent: DesignTokens.typography.fontFamily.primary,
      },
      styles: {
        slideTitle: {
          fontSize: DesignTokens.typography.fontSize['4xl'],
          fontWeight: DesignTokens.typography.fontWeight.bold,
          lineHeight: DesignTokens.typography.lineHeight.tight,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
        },
        slideSubtitle: {
          fontSize: DesignTokens.typography.fontSize['2xl'],
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          lineHeight: DesignTokens.typography.lineHeight.snug,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
        },
        bodyText: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.normal,
          lineHeight: DesignTokens.typography.lineHeight.relaxed,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
        },
        caption: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          lineHeight: DesignTokens.typography.lineHeight.normal,
          letterSpacing: DesignTokens.typography.letterSpacing.wide,
        },
      },
    },
    spacing: {
      slideMargin: DesignTokens.spacing[8],
      elementSpacing: DesignTokens.spacing[4],
      sectionSpacing: DesignTokens.spacing[6],
    },
    effects: {
      borderRadius: DesignTokens.borderRadius.lg,
      shadow: DesignTokens.boxShadow.lg,
      transition: DesignTokens.transition.default,
    },
  },

  // Creative Gradient Theme
  creativeGradient: {
    id: 'creative-gradient',
    name: 'Creative Gradient',
    description: 'Vibrant gradient theme for creative presentations',
    category: 'creative',
    isDefault: false,
    isCustom: false,
    colors: {
      background: {
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      text: {
        primary: '#ffffff',
        secondary: '#f1f5f9',
        accent: '#e2e8f0',
        inverse: '#1e293b',
      },
      accents: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        tertiary: '#45b7d1',
        quaternary: '#f9ca24',
      },
      interactive: {
        primary: '#ff6b6b',
        hover: '#ee5a52',
        active: '#d63447',
        disabled: '#94a3b8',
      },
      border: {
        primary: 'rgba(255, 255, 255, 0.2)',
        secondary: 'rgba(255, 255, 255, 0.3)',
        accent: '#ff6b6b',
      },
    },
    typography: {
      fontFamily: {
        primary: DesignTokens.typography.fontFamily.primary,
        secondary: DesignTokens.typography.fontFamily.secondary,
        accent: DesignTokens.typography.fontFamily.primary,
      },
      styles: {
        slideTitle: {
          fontSize: DesignTokens.typography.fontSize['5xl'],
          fontWeight: DesignTokens.typography.fontWeight.extrabold,
          lineHeight: DesignTokens.typography.lineHeight.tight,
          letterSpacing: DesignTokens.typography.letterSpacing.tight,
        },
        slideSubtitle: {
          fontSize: DesignTokens.typography.fontSize['2xl'],
          fontWeight: DesignTokens.typography.fontWeight.bold,
          lineHeight: DesignTokens.typography.lineHeight.snug,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
        },
        bodyText: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          lineHeight: DesignTokens.typography.lineHeight.relaxed,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
        },
        caption: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          lineHeight: DesignTokens.typography.lineHeight.normal,
          letterSpacing: DesignTokens.typography.letterSpacing.wide,
        },
      },
    },
    spacing: {
      slideMargin: DesignTokens.spacing[12],
      elementSpacing: DesignTokens.spacing[6],
      sectionSpacing: DesignTokens.spacing[10],
    },
    effects: {
      borderRadius: DesignTokens.borderRadius['2xl'],
      shadow: DesignTokens.boxShadow.xl,
      transition: DesignTokens.transition.default,
    },
  },

  // Minimalist Theme
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Ultra-clean minimalist design with maximum whitespace',
    category: 'simple',
    isDefault: false,
    isCustom: false,
    colors: {
      background: {
        primary: '#ffffff',
        secondary: '#fafafa',
        accent: '#f5f5f5',
      },
      text: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#333333',
        inverse: '#ffffff',
      },
      accents: {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#999999',
        quaternary: '#cccccc',
      },
      interactive: {
        primary: '#000000',
        hover: '#333333',
        active: '#666666',
        disabled: '#cccccc',
      },
      border: {
        primary: '#e5e5e5',
        secondary: '#d4d4d4',
        accent: '#000000',
      },
    },
    typography: {
      fontFamily: {
        primary: DesignTokens.typography.fontFamily.primary,
        secondary: DesignTokens.typography.fontFamily.secondary,
        accent: DesignTokens.typography.fontFamily.primary,
      },
      styles: {
        slideTitle: {
          fontSize: DesignTokens.typography.fontSize['6xl'],
          fontWeight: DesignTokens.typography.fontWeight.light,
          lineHeight: DesignTokens.typography.lineHeight.tight,
          letterSpacing: DesignTokens.typography.letterSpacing.tighter,
        },
        slideSubtitle: {
          fontSize: DesignTokens.typography.fontSize['3xl'],
          fontWeight: DesignTokens.typography.fontWeight.light,
          lineHeight: DesignTokens.typography.lineHeight.snug,
          letterSpacing: DesignTokens.typography.letterSpacing.tight,
        },
        bodyText: {
          fontSize: DesignTokens.typography.fontSize.xl,
          fontWeight: DesignTokens.typography.fontWeight.normal,
          lineHeight: DesignTokens.typography.lineHeight.loose,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
        },
        caption: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: DesignTokens.typography.fontWeight.light,
          lineHeight: DesignTokens.typography.lineHeight.relaxed,
          letterSpacing: DesignTokens.typography.letterSpacing.wider,
        },
      },
    },
    spacing: {
      slideMargin: DesignTokens.spacing[16],
      elementSpacing: DesignTokens.spacing[8],
      sectionSpacing: DesignTokens.spacing[12],
    },
    effects: {
      borderRadius: DesignTokens.borderRadius.none,
      shadow: DesignTokens.boxShadow.none,
      transition: DesignTokens.transition.default,
    },
  },
};

// Helper function to get all available themes
export const getAllThemes = () => {
  return Object.values(DefaultThemes);
};

// Helper function to get theme by ID
export const getThemeById = (themeId) => {
  return DefaultThemes[themeId] || DefaultThemes.simple;
};

// Helper function to get themes by category
export const getThemesByCategory = (category) => {
  return Object.values(DefaultThemes).filter(theme => theme.category === category);
};

// Theme categories
export const ThemeCategories = {
  simple: 'Simple',
  modern: 'Modern',
  professional: 'Professional',
  creative: 'Creative',
  custom: 'Custom',
};

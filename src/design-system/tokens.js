// Design Tokens for Google Slides-like themes
// These tokens define the atomic design elements that can be customized

export const DesignTokens = {
  // Color palette tokens
  colors: {
    // Primary brand colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',  // Primary blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Secondary colors
    secondary: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
    },
    
    // Semantic colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Neutral colors
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    
    // Special colors
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },
  
  // Typography tokens
  typography: {
    fontFamily: {
      primary: ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
      secondary: ['Roboto', 'Arial', 'sans-serif'],
      mono: ['Roboto Mono', 'Monaco', 'monospace'],
      // Google Fonts compatible font stacks
      serif: ['Playfair Display', 'Georgia', 'serif'],
      sansSerif: ['Open Sans', 'Arial', 'sans-serif'],
      display: ['Montserrat', 'Arial Black', 'sans-serif'],
      script: ['Dancing Script', 'cursive'],
      modern: ['Inter', 'system-ui', 'sans-serif'],
    },
    
    // Available font options for user selection
    fontOptions: {
      'google-sans': {
        name: 'Google Sans',
        stack: ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
        category: 'sans-serif',
        description: 'Clean, modern Google font'
      },
      'roboto': {
        name: 'Roboto',
        stack: ['Roboto', 'Arial', 'sans-serif'],
        category: 'sans-serif',
        description: 'Versatile, readable sans-serif'
      },
      'open-sans': {
        name: 'Open Sans',
        stack: ['Open Sans', 'Arial', 'sans-serif'],
        category: 'sans-serif',
        description: 'Friendly, open sans-serif'
      },
      'inter': {
        name: 'Inter',
        stack: ['Inter', 'system-ui', 'sans-serif'],
        category: 'sans-serif',
        description: 'Modern, digital-first font'
      },
      'montserrat': {
        name: 'Montserrat',
        stack: ['Montserrat', 'Arial Black', 'sans-serif'],
        category: 'display',
        description: 'Strong, geometric display font'
      },
      'playfair-display': {
        name: 'Playfair Display',
        stack: ['Playfair Display', 'Georgia', 'serif'],
        category: 'serif',
        description: 'Elegant, high-contrast serif'
      },
      'source-serif-pro': {
        name: 'Source Serif Pro',
        stack: ['Source Serif Pro', 'Georgia', 'serif'],
        category: 'serif',
        description: 'Modern, readable serif'
      },
      'lato': {
        name: 'Lato',
        stack: ['Lato', 'Arial', 'sans-serif'],
        category: 'sans-serif',
        description: 'Warm, humanist sans-serif'
      },
      'poppins': {
        name: 'Poppins',
        stack: ['Poppins', 'Arial', 'sans-serif'],
        category: 'sans-serif',
        description: 'Geometric, friendly sans-serif'
      },
      'merriweather': {
        name: 'Merriweather',
        stack: ['Merriweather', 'Georgia', 'serif'],
        category: 'serif',
        description: 'Readable serif for body text'
      },
      'dancing-script': {
        name: 'Dancing Script',
        stack: ['Dancing Script', 'cursive'],
        category: 'script',
        description: 'Casual, handwritten style'
      },
      'arial': {
        name: 'Arial',
        stack: ['Arial', 'sans-serif'],
        category: 'sans-serif',
        description: 'Classic, widely supported'
      },
      'times-new-roman': {
        name: 'Times New Roman',
        stack: ['Times New Roman', 'serif'],
        category: 'serif',
        description: 'Traditional serif typeface'
      },
      'helvetica': {
        name: 'Helvetica',
        stack: ['Helvetica', 'Arial', 'sans-serif'],
        category: 'sans-serif',
        description: 'Clean, Swiss-style sans-serif'
      },
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
      '7xl': '4.5rem',  // 72px
      '8xl': '6rem',    // 96px
      '9xl': '8rem',    // 128px
    },
    
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // Spacing tokens
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },
  
  // Border radius tokens
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadow tokens
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },
  
  // Transition tokens
  transition: {
    none: 'none',
    all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    default: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Z-index tokens
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
  },
};

// Default theme semantic mappings
export const DefaultThemeSemantics = {
  // Background colors
  background: {
    primary: DesignTokens.colors.white,
    secondary: DesignTokens.colors.neutral[50],
    tertiary: DesignTokens.colors.neutral[100],
  },
  
  // Text colors
  text: {
    primary: DesignTokens.colors.neutral[900],
    secondary: DesignTokens.colors.neutral[600],
    tertiary: DesignTokens.colors.neutral[400],
    inverse: DesignTokens.colors.white,
  },
  
  // Border colors
  border: {
    primary: DesignTokens.colors.neutral[200],
    secondary: DesignTokens.colors.neutral[300],
    focus: DesignTokens.colors.primary[500],
  },
  
  // Surface colors
  surface: {
    primary: DesignTokens.colors.white,
    secondary: DesignTokens.colors.neutral[50],
    elevated: DesignTokens.colors.white,
  },
  
  // Interactive colors
  interactive: {
    primary: DesignTokens.colors.primary[500],
    primaryHover: DesignTokens.colors.primary[600],
    secondary: DesignTokens.colors.neutral[100],
    secondaryHover: DesignTokens.colors.neutral[200],
  },
};

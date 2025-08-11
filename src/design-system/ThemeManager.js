// Theme Management Service
import { DefaultThemes, getAllThemes, getThemeById } from './themes.js';
import { DesignTokens } from './tokens.js';

class ThemeManager {
  constructor() {
    this.customThemes = {}; // Will be loaded from database
    this.activeTheme = this.loadActiveTheme();
    this.slideThemeOverrides = new Map(); // Map of slideId -> themeId for individual slide themes
    this.isLoading = false;
  }

  // Load custom themes from database
  async loadCustomThemes() {
    if (this.isLoading) {
      return this.customThemes;
    }
    
    this.isLoading = true;
    try {
      const response = await fetch('http://localhost:5000/api/themes', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.customThemes = {};
        
        // Convert database themes to our theme format
        data.themes.forEach(dbTheme => {
          this.customThemes[dbTheme.theme_id] = this.convertDbThemeToTheme(dbTheme);
        });
      } else if (response.status !== 401) {
        console.error('Failed to load themes from database');
      }
    } catch (error) {
      console.error('Error loading custom themes:', error);
    } finally {
      this.isLoading = false;
    }
    
    return this.customThemes;
  }

  // Convert database theme format to our theme format
  convertDbThemeToTheme(dbTheme) {
    return {
      id: dbTheme.theme_id,
      name: dbTheme.schema_str.name,
      description: dbTheme.theme_desc || dbTheme.schema_str.description,
      category: 'custom',
      isDefault: false,
      isCustom: true,
      ...dbTheme.schema_str,
      dbId: dbTheme.id,
      createdBy: dbTheme.created_by,
      createdAt: dbTheme.created_at
    };
  }

  // Convert our theme format to database format
  convertThemeToDbFormat(theme) {
    const { dbId, createdBy, createdAt, isCustom, isDefault, ...themeData } = theme;
    return {
      theme_id: theme.id,
      theme_desc: theme.description,
      schema_str: themeData
    };
  }

  // Load active theme from localStorage
  loadActiveTheme() {
    try {
      const stored = localStorage.getItem('activeTheme');
      return stored || 'simple';
    } catch (error) {
      console.error('Error loading active theme:', error);
      return 'simple';
    }
  }

  // Save active theme to localStorage
  saveActiveTheme(themeId) {
    try {
      localStorage.setItem('activeTheme', themeId);
      this.activeTheme = themeId;
    } catch (error) {
      console.error('Error saving active theme:', error);
    }
  }

  // Get all available themes (default + custom)
  async getAllAvailableThemes() {
    const defaultThemes = getAllThemes();
    await this.loadCustomThemes(); // Ensure custom themes are loaded
    const customThemes = Object.values(this.customThemes);
    return [...defaultThemes, ...customThemes];
  }

  // Get theme by ID (checks both default and custom themes)
  getTheme(themeId) {
    // First check default themes
    const defaultTheme = getThemeById(themeId);
    if (defaultTheme && defaultTheme.id === themeId) {
      return defaultTheme;
    }

    // Then check custom themes
    return this.customThemes[themeId] || DefaultThemes.simple;
  }

  // Get current active theme
  getActiveTheme() {
    return this.getTheme(this.activeTheme);
  }

  // Set presentation-level theme
  setPresentationTheme(themeId) {
    this.saveActiveTheme(themeId);
    this.applyThemeToDocument(themeId);
    // Trigger theme change event
    this.notifyThemeChange('presentation', themeId);
  }

  // Set slide-level theme override
  setSlideTheme(slideId, themeId) {
    // Ensure slideId is consistently handled as string
    const slideIdStr = slideId.toString();
    
    if (themeId === null || themeId === this.activeTheme) {
      // Remove override if setting to null or same as presentation theme
      this.slideThemeOverrides.delete(slideIdStr);
    } else {
      this.slideThemeOverrides.set(slideIdStr, themeId);
    }
    
    this.saveSlideThemeOverrides();
    
    // Apply theme to specific slide elements
    this.applyThemeToSpecificSlide(slideIdStr);
    
    // Trigger theme change event
    this.notifyThemeChange('slide', themeId, slideIdStr);
  }

  // Apply theme to a specific slide by ID
  applyThemeToSpecificSlide(slideId) {
    const slideElements = document.querySelectorAll(`[data-slide-id="${slideId}"]`);
    slideElements.forEach(slideElement => {
      this.applyThemeToSlideElement(slideElement, slideId);
    });
  }

  // Notify components about theme changes
  notifyThemeChange(type, themeId, slideId = null) {
    const event = new CustomEvent('themeChanged', {
      detail: { type, themeId, slideId }
    });
    document.dispatchEvent(event);
  }

  // Get theme for a specific slide (with fallback to presentation theme)
  getSlideTheme(slideId) {
    const slideIdStr = slideId.toString();
    const overrideThemeId = this.slideThemeOverrides.get(slideIdStr);
    return overrideThemeId ? this.getTheme(overrideThemeId) : this.getActiveTheme();
  }

  // Save slide theme overrides to localStorage
  saveSlideThemeOverrides() {
    try {
      const overrides = Object.fromEntries(this.slideThemeOverrides);
      localStorage.setItem('slideThemeOverrides', JSON.stringify(overrides));
    } catch (error) {
      console.error('Error saving slide theme overrides:', error);
    }
  }

  // Load slide theme overrides from localStorage
  loadSlideThemeOverrides() {
    try {
      const stored = localStorage.getItem('slideThemeOverrides');
      if (stored) {
        const overrides = JSON.parse(stored);
        this.slideThemeOverrides = new Map(Object.entries(overrides));
      }
    } catch (error) {
      console.error('Error loading slide theme overrides:', error);
    }
  }

  // Create a new custom theme
  async createCustomTheme(themeData) {
    const themeId = `custom-${Date.now()}`;
    const customTheme = {
      ...themeData,
      id: themeId,
      isCustom: true,
      isDefault: false,
      category: 'custom',
    };

    try {
      const dbThemeData = this.convertThemeToDbFormat(customTheme);
      
      const response = await fetch('http://localhost:5000/api/themes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbThemeData)
      });

      if (response.ok) {
        const result = await response.json();
        const savedTheme = this.convertDbThemeToTheme(result.theme);
        this.customThemes[savedTheme.id] = savedTheme;
        return savedTheme;
      } else {
        let errorMessage = 'Failed to create theme';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating custom theme:', error);
      throw error;
    }
  }

  // Update existing custom theme
  async updateCustomTheme(themeId, themeData) {
    if (!this.customThemes[themeId]) {
      throw new Error(`Custom theme ${themeId} not found`);
    }

    const updatedTheme = {
      ...this.customThemes[themeId],
      ...themeData,
      id: themeId,
      isCustom: true,
    };

    try {
      const dbThemeData = this.convertThemeToDbFormat(updatedTheme);
      
      const response = await fetch(`http://localhost:5000/api/themes/${themeId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme_desc: dbThemeData.theme_desc,
          schema_str: dbThemeData.schema_str
        })
      });

      if (response.ok) {
        const result = await response.json();
        const savedTheme = this.convertDbThemeToTheme(result.theme);
        this.customThemes[themeId] = savedTheme;
        return savedTheme;
      } else {
        let errorMessage = 'Failed to update theme';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating custom theme:', error);
      throw error;
    }
  }

  // Delete custom theme
  async deleteCustomTheme(themeId) {
    if (!this.customThemes[themeId]) {
      return false;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/themes/${themeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        delete this.customThemes[themeId];
        
        // If this was the active theme, switch to default
        if (this.activeTheme === themeId) {
          this.setPresentationTheme('simple');
        }
        
        // Remove any slide overrides using this theme
        for (const [slideId, overrideThemeId] of this.slideThemeOverrides) {
          if (overrideThemeId === themeId) {
            this.slideThemeOverrides.delete(slideId);
          }
        }
        this.saveSlideThemeOverrides();
        
        return true;
      } else {
        let errorMessage = 'Failed to delete theme';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting custom theme:', error);
      throw error;
    }
  }

  // Duplicate theme (create custom copy)
  async duplicateTheme(sourceThemeId, newName) {
    const sourceTheme = this.getTheme(sourceThemeId);
    const duplicatedTheme = {
      ...sourceTheme,
      name: newName || `${sourceTheme.name} Copy`,
      description: `Copy of ${sourceTheme.name}`,
    };
    
    return await this.createCustomTheme(duplicatedTheme);
  }

  // Apply theme to document (CSS custom properties)
  applyThemeToDocument(themeId) {
    const theme = this.getTheme(themeId);
    const root = document.documentElement;
    
    // Clear any existing theme styles
    this.clearThemeStyles();

    // Apply color tokens
    root.style.setProperty('--theme-bg-primary', theme.colors.background.primary);
    root.style.setProperty('--theme-bg-secondary', theme.colors.background.secondary);
    root.style.setProperty('--theme-bg-accent', theme.colors.background.accent);
    
    root.style.setProperty('--theme-text-primary', theme.colors.text.primary);
    root.style.setProperty('--theme-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--theme-text-accent', theme.colors.text.accent);
    root.style.setProperty('--theme-text-inverse', theme.colors.text.inverse);
    
    root.style.setProperty('--theme-accent-primary', theme.colors.accents.primary);
    root.style.setProperty('--theme-accent-secondary', theme.colors.accents.secondary);
    root.style.setProperty('--theme-accent-tertiary', theme.colors.accents.tertiary);
    root.style.setProperty('--theme-accent-quaternary', theme.colors.accents.quaternary);
    
    root.style.setProperty('--theme-interactive-primary', theme.colors.interactive.primary);
    root.style.setProperty('--theme-interactive-hover', theme.colors.interactive.hover);
    root.style.setProperty('--theme-interactive-active', theme.colors.interactive.active);
    root.style.setProperty('--theme-interactive-disabled', theme.colors.interactive.disabled);
    
    root.style.setProperty('--theme-border-primary', theme.colors.border.primary);
    root.style.setProperty('--theme-border-secondary', theme.colors.border.secondary);
    root.style.setProperty('--theme-border-accent', theme.colors.border.accent);

    // Apply typography tokens
    root.style.setProperty('--theme-font-primary', theme.typography.fontFamily.primary.join(', '));
    root.style.setProperty('--theme-font-secondary', theme.typography.fontFamily.secondary.join(', '));
    
    // Apply typography styles
    root.style.setProperty('--theme-title-size', theme.typography.styles.slideTitle.fontSize);
    root.style.setProperty('--theme-title-weight', theme.typography.styles.slideTitle.fontWeight);
    root.style.setProperty('--theme-title-line-height', theme.typography.styles.slideTitle.lineHeight);
    root.style.setProperty('--theme-title-letter-spacing', theme.typography.styles.slideTitle.letterSpacing);
    
    root.style.setProperty('--theme-subtitle-size', theme.typography.styles.slideSubtitle.fontSize);
    root.style.setProperty('--theme-subtitle-weight', theme.typography.styles.slideSubtitle.fontWeight);
    root.style.setProperty('--theme-subtitle-line-height', theme.typography.styles.slideSubtitle.lineHeight);
    root.style.setProperty('--theme-subtitle-letter-spacing', theme.typography.styles.slideSubtitle.letterSpacing);
    
    root.style.setProperty('--theme-body-size', theme.typography.styles.bodyText.fontSize);
    root.style.setProperty('--theme-body-weight', theme.typography.styles.bodyText.fontWeight);
    root.style.setProperty('--theme-body-line-height', theme.typography.styles.bodyText.lineHeight);
    root.style.setProperty('--theme-body-letter-spacing', theme.typography.styles.bodyText.letterSpacing);
    
    root.style.setProperty('--theme-caption-size', theme.typography.styles.caption.fontSize);
    root.style.setProperty('--theme-caption-weight', theme.typography.styles.caption.fontWeight);
    root.style.setProperty('--theme-caption-line-height', theme.typography.styles.caption.lineHeight);
    root.style.setProperty('--theme-caption-letter-spacing', theme.typography.styles.caption.letterSpacing);

    // Apply spacing tokens
    root.style.setProperty('--theme-slide-margin', theme.spacing.slideMargin);
    root.style.setProperty('--theme-element-spacing', theme.spacing.elementSpacing);
    root.style.setProperty('--theme-section-spacing', theme.spacing.sectionSpacing);

    // Apply effect tokens
    root.style.setProperty('--theme-border-radius', theme.effects.borderRadius);
    root.style.setProperty('--theme-shadow', theme.effects.shadow);
    root.style.setProperty('--theme-transition', theme.effects.transition);
    
    // Apply theme to all slides
    this.applyThemeToAllSlides();
  }

  // Clear existing theme styles
  clearThemeStyles() {
    // Remove any existing slide-specific theme styles
    const existingStyles = document.querySelectorAll('style[data-theme-id]');
    existingStyles.forEach(style => style.remove());
  }

  // Apply theme to all slides in the presentation
  applyThemeToAllSlides() {
    // Get all slide elements
    const slideElements = document.querySelectorAll('.slide-content, .slide-thumbnail, .slide-preview');
    
    slideElements.forEach(slideElement => {
      const slideId = slideElement.getAttribute('data-slide-id');
      if (slideId) {
        this.applyThemeToSlideElement(slideElement, slideId);
      }
    });
  }

  // Apply theme to a specific slide element
  applyThemeToSlideElement(slideElement, slideId) {
    const theme = this.getSlideTheme(slideId);
    
    // Apply theme CSS variables to the slide element
    if (slideElement) {
      slideElement.style.setProperty('--slide-bg-primary', theme.colors.background.primary);
      slideElement.style.setProperty('--slide-bg-secondary', theme.colors.background.secondary);
      slideElement.style.setProperty('--slide-bg-accent', theme.colors.background.accent);
      
      slideElement.style.setProperty('--slide-text-primary', theme.colors.text.primary);
      slideElement.style.setProperty('--slide-text-secondary', theme.colors.text.secondary);
      slideElement.style.setProperty('--slide-text-accent', theme.colors.text.accent);
      slideElement.style.setProperty('--slide-text-inverse', theme.colors.text.inverse);
      
      slideElement.style.setProperty('--slide-accent-primary', theme.colors.accents.primary);
      slideElement.style.setProperty('--slide-accent-secondary', theme.colors.accents.secondary);
      slideElement.style.setProperty('--slide-accent-tertiary', theme.colors.accents.tertiary);
      slideElement.style.setProperty('--slide-accent-quaternary', theme.colors.accents.quaternary);
      
      slideElement.style.setProperty('--slide-font-primary', theme.typography.fontFamily.primary.join(', '));
      slideElement.style.setProperty('--slide-font-secondary', theme.typography.fontFamily.secondary.join(', '));
      
      slideElement.style.setProperty('--slide-title-size', theme.typography.styles.slideTitle.fontSize);
      slideElement.style.setProperty('--slide-title-weight', theme.typography.styles.slideTitle.fontWeight);
      slideElement.style.setProperty('--slide-title-line-height', theme.typography.styles.slideTitle.lineHeight);
      slideElement.style.setProperty('--slide-title-letter-spacing', theme.typography.styles.slideTitle.letterSpacing);
      
      slideElement.style.setProperty('--slide-subtitle-size', theme.typography.styles.slideSubtitle.fontSize);
      slideElement.style.setProperty('--slide-subtitle-weight', theme.typography.styles.slideSubtitle.fontWeight);
      slideElement.style.setProperty('--slide-subtitle-line-height', theme.typography.styles.slideSubtitle.lineHeight);
      slideElement.style.setProperty('--slide-subtitle-letter-spacing', theme.typography.styles.slideSubtitle.letterSpacing);
      
      slideElement.style.setProperty('--slide-body-size', theme.typography.styles.bodyText.fontSize);
      slideElement.style.setProperty('--slide-body-weight', theme.typography.styles.bodyText.fontWeight);
      slideElement.style.setProperty('--slide-body-line-height', theme.typography.styles.bodyText.lineHeight);
      slideElement.style.setProperty('--slide-body-letter-spacing', theme.typography.styles.bodyText.letterSpacing);
      
      slideElement.style.setProperty('--slide-spacing-margin', theme.spacing.slideMargin);
      slideElement.style.setProperty('--slide-spacing-element', theme.spacing.elementSpacing);
      slideElement.style.setProperty('--slide-spacing-section', theme.spacing.sectionSpacing);
      
      slideElement.style.setProperty('--slide-border-radius', theme.effects.borderRadius);
      slideElement.style.setProperty('--slide-shadow', theme.effects.shadow);
      slideElement.style.setProperty('--slide-transition', theme.effects.transition);
      
      // Add theme class for additional styling
      slideElement.classList.remove(...Array.from(slideElement.classList).filter(cls => cls.startsWith('theme-')));
      slideElement.classList.add(`theme-${theme.id}`, `theme-category-${theme.category}`);
    }
  }

  // Generate CSS styles for a specific slide theme
  generateSlideThemeCSS(slideId, themeId) {
    const theme = themeId ? this.getTheme(themeId) : this.getSlideTheme(slideId);
    
    return `
      .slide[data-slide-id="${slideId}"] {
        background: ${theme.colors.background.primary};
        color: ${theme.colors.text.primary};
        font-family: ${theme.typography.fontFamily.primary.join(', ')};
        border-radius: ${theme.effects.borderRadius};
        box-shadow: ${theme.effects.shadow};
        transition: ${theme.effects.transition};
        padding: ${theme.spacing.slideMargin};
      }
      
      .slide[data-slide-id="${slideId}"] .slide-title {
        color: ${theme.colors.text.primary};
        font-size: ${theme.typography.styles.slideTitle.fontSize};
        font-weight: ${theme.typography.styles.slideTitle.fontWeight};
        line-height: ${theme.typography.styles.slideTitle.lineHeight};
        letter-spacing: ${theme.typography.styles.slideTitle.letterSpacing};
        margin-bottom: ${theme.spacing.elementSpacing};
      }
      
      .slide[data-slide-id="${slideId}"] .slide-subtitle {
        color: ${theme.colors.text.secondary};
        font-size: ${theme.typography.styles.slideSubtitle.fontSize};
        font-weight: ${theme.typography.styles.slideSubtitle.fontWeight};
        line-height: ${theme.typography.styles.slideSubtitle.lineHeight};
        letter-spacing: ${theme.typography.styles.slideSubtitle.letterSpacing};
        margin-bottom: ${theme.spacing.elementSpacing};
      }
      
      .slide[data-slide-id="${slideId}"] .slide-body {
        color: ${theme.colors.text.primary};
        font-size: ${theme.typography.styles.bodyText.fontSize};
        font-weight: ${theme.typography.styles.bodyText.fontWeight};
        line-height: ${theme.typography.styles.bodyText.lineHeight};
        letter-spacing: ${theme.typography.styles.bodyText.letterSpacing};
        margin-bottom: ${theme.spacing.sectionSpacing};
      }
      
      .slide[data-slide-id="${slideId}"] .slide-caption {
        color: ${theme.colors.text.secondary};
        font-size: ${theme.typography.styles.caption.fontSize};
        font-weight: ${theme.typography.styles.caption.fontWeight};
        line-height: ${theme.typography.styles.caption.lineHeight};
        letter-spacing: ${theme.typography.styles.caption.letterSpacing};
      }
    `;
  }

  // Export presentation themes for backend processing
  exportPresentationThemes() {
    const presentationTheme = this.getActiveTheme();
    const slideOverrides = {};
    
    for (const [slideId, themeId] of this.slideThemeOverrides) {
      const theme = this.getTheme(themeId);
      slideOverrides[slideId] = theme;
    }
    
    return {
      presentationTheme,
      slideOverrides,
      customThemes: this.customThemes,
    };
  }

  // Import presentation themes (for loading saved presentations)
  importPresentationThemes(themesData) {
    if (themesData.presentationTheme) {
      this.setPresentationTheme(themesData.presentationTheme.id);
    }
    
    if (themesData.slideOverrides) {
      for (const [slideId, theme] of Object.entries(themesData.slideOverrides)) {
        this.setSlideTheme(slideId, theme.id);
      }
    }
    
    if (themesData.customThemes) {
      this.customThemes = { ...this.customThemes, ...themesData.customThemes };
      this.saveCustomThemes();
    }
  }

  // Initialize theme manager
  async initialize() {
    this.loadSlideThemeOverrides();
    await this.loadCustomThemes(); // Load themes from database
    this.applyThemeToDocument(this.activeTheme);
  }

  // Get theme preview colors (for theme selector)
  getThemePreview(themeId) {
    const theme = this.getTheme(themeId);
    return {
      primary: theme.colors.background.primary,
      secondary: theme.colors.background.secondary,
      accent: theme.colors.accents.primary,
      text: theme.colors.text.primary,
    };
  }

  // Validate theme structure
  validateTheme(themeData) {
    const requiredProperties = [
      'name',
      'colors.background.primary',
      'colors.text.primary',
      'colors.accents.primary',
      'typography.fontFamily.primary',
      'typography.styles.slideTitle.fontSize',
      'spacing.slideMargin',
      'effects.borderRadius',
    ];

    for (const prop of requiredProperties) {
      const value = this.getNestedProperty(themeData, prop);
      if (value === undefined || value === null) {
        throw new Error(`Missing required property: ${prop}`);
      }
    }

    return true;
  }

  // Helper to get nested object property
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Test backend connectivity
  async testBackendConnection() {
    try {
      const response = await fetch('http://localhost:5000/auth/status', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend connection test successful:', data);
        return { success: true, data };
      } else {
        console.error('Backend connection test failed:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      console.error('Backend connection test error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const themeManager = new ThemeManager();

export { themeManager, ThemeManager };

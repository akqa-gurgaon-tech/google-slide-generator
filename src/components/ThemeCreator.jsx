import React, { useState, useEffect } from 'react';
import { themeManager } from '../design-system/ThemeManager.js';
import { DesignTokens } from '../design-system/tokens.js';
import { 
  Palette, 
  Type, 
  Layout, 
  Eye, 
  Save, 
  X, 
  Copy, 
  RotateCcw,
  Sliders 
} from 'lucide-react';
import './ThemeCreator.css';

const ThemeCreator = ({ isOpen, onClose, editingTheme = null, onSave }) => {
  const [activeTab, setActiveTab] = useState('colors');
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [previewText, setPreviewText] = useState({
    title: 'Sample Slide Title',
    subtitle: 'Sample subtitle text',
    body: 'This is sample body text to demonstrate how your theme will look in actual slides.',
    caption: 'Sample caption'
  });

  // Theme data state
  const [themeData, setThemeData] = useState({
    colors: {
      background: {
        primary: '#ffffff',
        secondary: '#f5f5f5',
        accent: '#e5e5e5',
      },
      text: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#333333',
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
        primary: '#e5e5e5',
        secondary: '#d4d4d4',
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
          fontSize: DesignTokens.typography.fontSize['4xl'],
          fontWeight: DesignTokens.typography.fontWeight.bold,
          lineHeight: DesignTokens.typography.lineHeight.tight,
          letterSpacing: DesignTokens.typography.letterSpacing.normal,
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
  });

  // Load editing theme data
  useEffect(() => {
    if (editingTheme) {
      setThemeName(editingTheme.name);
      setThemeDescription(editingTheme.description || '');
      setThemeData(editingTheme);
    } else {
      // Reset to default when creating new theme
      setThemeName('');
      setThemeDescription('');
      // themeData is already set to default in useState
    }
  }, [editingTheme, isOpen]);

  const updateThemeData = (path, value) => {
    setThemeData(prevData => {
      const newData = { ...prevData };
      const pathArray = path.split('.');
      let current = newData;
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]];
      }
      
      current[pathArray[pathArray.length - 1]] = value;
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      const finalThemeData = {
        name: themeName,
        description: themeDescription,
        ...themeData,
      };

      themeManager.validateTheme(finalThemeData);

      let savedTheme;
      if (editingTheme && editingTheme.isCustom) {
        savedTheme = await themeManager.updateCustomTheme(editingTheme.id, finalThemeData);
      } else {
        savedTheme = await themeManager.createCustomTheme(finalThemeData);
      }

      onSave && onSave(savedTheme);
      onClose();
    } catch (error) {
      console.error('Error saving theme:', error);
      alert(`Error saving theme: ${error.message}`);
    }
  };

  const handleDuplicate = async () => {
    if (editingTheme) {
      try {
        const duplicated = await themeManager.duplicateTheme(editingTheme.id, `${editingTheme.name} Copy`);
        onSave && onSave(duplicated);
        onClose();
      } catch (error) {
        console.error('Error duplicating theme:', error);
        alert(`Error duplicating theme: ${error.message}`);
      }
    }
  };

  const resetToDefault = () => {
    const defaultTheme = themeManager.getTheme('simple');
    setThemeData({
      colors: defaultTheme.colors,
      typography: defaultTheme.typography,
      spacing: defaultTheme.spacing,
      effects: defaultTheme.effects,
    });
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'spacing', label: 'Spacing & Effects', icon: Layout },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  return (
    <div className="theme-creator-overlay">
      <div className="theme-creator">
        <div className="theme-creator-header">
          <div className="header-left">
            <h2>{editingTheme ? 'Edit Theme' : 'Create New Theme'}</h2>
            <p>Customize your presentation design</p>
          </div>
          <div className="header-actions">
            {editingTheme && editingTheme.isCustom && (
              <button className="btn-secondary" onClick={handleDuplicate}>
                <Copy size={16} />
                Duplicate
              </button>
            )}
            <button className="btn-secondary" onClick={resetToDefault}>
              <RotateCcw size={16} />
              Reset
            </button>
            <button className="btn-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="theme-creator-content">
          {/* Basic Info */}
          <div className="theme-basic-info">
            <div className="form-group">
              <label>Theme Name</label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="Enter theme name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={themeDescription}
                onChange={(e) => setThemeDescription(e.target.value)}
                placeholder="Brief description of your theme"
                className="form-input"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="theme-creator-tabs">
            <div className="tab-list">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div className="colors-panel">
                  <div className="color-section">
                    <h3>Background Colors</h3>
                    <div className="color-inputs">
                      <ColorInput
                        label="Primary Background"
                        value={themeData.colors.background.primary}
                        onChange={(value) => updateThemeData('colors.background.primary', value)}
                      />
                      <ColorInput
                        label="Secondary Background"
                        value={themeData.colors.background.secondary}
                        onChange={(value) => updateThemeData('colors.background.secondary', value)}
                      />
                      <ColorInput
                        label="Accent Background"
                        value={themeData.colors.background.accent}
                        onChange={(value) => updateThemeData('colors.background.accent', value)}
                      />
                    </div>
                  </div>

                  <div className="color-section">
                    <h3>Text Colors</h3>
                    <div className="color-inputs">
                      <ColorInput
                        label="Primary Text"
                        value={themeData.colors.text.primary}
                        onChange={(value) => updateThemeData('colors.text.primary', value)}
                      />
                      <ColorInput
                        label="Secondary Text"
                        value={themeData.colors.text.secondary}
                        onChange={(value) => updateThemeData('colors.text.secondary', value)}
                      />
                      <ColorInput
                        label="Accent Text"
                        value={themeData.colors.text.accent}
                        onChange={(value) => updateThemeData('colors.text.accent', value)}
                      />
                      <ColorInput
                        label="Inverse Text"
                        value={themeData.colors.text.inverse}
                        onChange={(value) => updateThemeData('colors.text.inverse', value)}
                      />
                    </div>
                  </div>

                  <div className="color-section">
                    <h3>Accent Colors</h3>
                    <div className="color-inputs">
                      <ColorInput
                        label="Primary Accent"
                        value={themeData.colors.accents.primary}
                        onChange={(value) => updateThemeData('colors.accents.primary', value)}
                      />
                      <ColorInput
                        label="Secondary Accent"
                        value={themeData.colors.accents.secondary}
                        onChange={(value) => updateThemeData('colors.accents.secondary', value)}
                      />
                      <ColorInput
                        label="Tertiary Accent"
                        value={themeData.colors.accents.tertiary}
                        onChange={(value) => updateThemeData('colors.accents.tertiary', value)}
                      />
                      <ColorInput
                        label="Quaternary Accent"
                        value={themeData.colors.accents.quaternary}
                        onChange={(value) => updateThemeData('colors.accents.quaternary', value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Typography Tab */}
              {activeTab === 'typography' && (
                <div className="typography-panel">
                  {/* Font Family Selection */}
                  <div className="typo-section">
                    <h3>Font Families</h3>
                    <div className="typo-controls">
                      <FontFamilySelectInput
                        label="Primary Font (Titles)"
                        value={themeData.typography.fontFamily.primary}
                        onChange={(value) => updateThemeData('typography.fontFamily.primary', value)}
                      />
                      <FontFamilySelectInput
                        label="Secondary Font (Body Text)"
                        value={themeData.typography.fontFamily.secondary}
                        onChange={(value) => updateThemeData('typography.fontFamily.secondary', value)}
                      />
                    </div>
                  </div>

                  <div className="typo-section">
                    <h3>Slide Title</h3>
                    <div className="typo-controls">
                      <SelectInput
                        label="Font Size"
                        value={themeData.typography.styles.slideTitle.fontSize}
                        onChange={(value) => updateThemeData('typography.styles.slideTitle.fontSize', value)}
                        options={Object.entries(DesignTokens.typography.fontSize).map(([key, value]) => ({ value, label: `${key} (${value})` }))}
                      />
                      <SelectInput
                        label="Font Weight"
                        value={themeData.typography.styles.slideTitle.fontWeight}
                        onChange={(value) => updateThemeData('typography.styles.slideTitle.fontWeight', value)}
                        options={Object.entries(DesignTokens.typography.fontWeight).map(([key, value]) => ({ value, label: key }))}
                      />
                      <SelectInput
                        label="Line Height"
                        value={themeData.typography.styles.slideTitle.lineHeight}
                        onChange={(value) => updateThemeData('typography.styles.slideTitle.lineHeight', value)}
                        options={Object.entries(DesignTokens.typography.lineHeight).map(([key, value]) => ({ value, label: key }))}
                      />
                    </div>
                  </div>

                  <div className="typo-section">
                    <h3>Slide Subtitle</h3>
                    <div className="typo-controls">
                      <SelectInput
                        label="Font Size"
                        value={themeData.typography.styles.slideSubtitle.fontSize}
                        onChange={(value) => updateThemeData('typography.styles.slideSubtitle.fontSize', value)}
                        options={Object.entries(DesignTokens.typography.fontSize).map(([key, value]) => ({ value, label: `${key} (${value})` }))}
                      />
                      <SelectInput
                        label="Font Weight"
                        value={themeData.typography.styles.slideSubtitle.fontWeight}
                        onChange={(value) => updateThemeData('typography.styles.slideSubtitle.fontWeight', value)}
                        options={Object.entries(DesignTokens.typography.fontWeight).map(([key, value]) => ({ value, label: key }))}
                      />
                      <SelectInput
                        label="Line Height"
                        value={themeData.typography.styles.slideSubtitle.lineHeight}
                        onChange={(value) => updateThemeData('typography.styles.slideSubtitle.lineHeight', value)}
                        options={Object.entries(DesignTokens.typography.lineHeight).map(([key, value]) => ({ value, label: key }))}
                      />
                    </div>
                  </div>

                  <div className="typo-section">
                    <h3>Body Text</h3>
                    <div className="typo-controls">
                      <SelectInput
                        label="Font Size"
                        value={themeData.typography.styles.bodyText.fontSize}
                        onChange={(value) => updateThemeData('typography.styles.bodyText.fontSize', value)}
                        options={Object.entries(DesignTokens.typography.fontSize).map(([key, value]) => ({ value, label: `${key} (${value})` }))}
                      />
                      <SelectInput
                        label="Font Weight"
                        value={themeData.typography.styles.bodyText.fontWeight}
                        onChange={(value) => updateThemeData('typography.styles.bodyText.fontWeight', value)}
                        options={Object.entries(DesignTokens.typography.fontWeight).map(([key, value]) => ({ value, label: key }))}
                      />
                      <SelectInput
                        label="Line Height"
                        value={themeData.typography.styles.bodyText.lineHeight}
                        onChange={(value) => updateThemeData('typography.styles.bodyText.lineHeight', value)}
                        options={Object.entries(DesignTokens.typography.lineHeight).map(([key, value]) => ({ value, label: key }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Spacing & Effects Tab */}
              {activeTab === 'spacing' && (
                <div className="spacing-panel">
                  <div className="spacing-section">
                    <h3>Spacing</h3>
                    <div className="spacing-controls">
                      <SelectInput
                        label="Slide Margin"
                        value={themeData.spacing.slideMargin}
                        onChange={(value) => updateThemeData('spacing.slideMargin', value)}
                        options={Object.entries(DesignTokens.spacing).map(([key, value]) => ({ value, label: `${key} (${value})` }))}
                      />
                      <SelectInput
                        label="Element Spacing"
                        value={themeData.spacing.elementSpacing}
                        onChange={(value) => updateThemeData('spacing.elementSpacing', value)}
                        options={Object.entries(DesignTokens.spacing).map(([key, value]) => ({ value, label: `${key} (${value})` }))}
                      />
                      <SelectInput
                        label="Section Spacing"
                        value={themeData.spacing.sectionSpacing}
                        onChange={(value) => updateThemeData('spacing.sectionSpacing', value)}
                        options={Object.entries(DesignTokens.spacing).map(([key, value]) => ({ value, label: `${key} (${value})` }))}
                      />
                    </div>
                  </div>

                  <div className="effects-section">
                    <h3>Visual Effects</h3>
                    <div className="effects-controls">
                      <SelectInput
                        label="Border Radius"
                        value={themeData.effects.borderRadius}
                        onChange={(value) => updateThemeData('effects.borderRadius', value)}
                        options={Object.entries(DesignTokens.borderRadius).map(([key, value]) => ({ value, label: `${key} (${value})` }))}
                      />
                      <SelectInput
                        label="Shadow"
                        value={themeData.effects.shadow}
                        onChange={(value) => updateThemeData('effects.shadow', value)}
                        options={Object.entries(DesignTokens.boxShadow).map(([key, value]) => ({ value, label: key }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="preview-panel">
                  <div className="preview-controls">
                    <h3>Preview Content</h3>
                    <div className="preview-inputs">
                      <input
                        type="text"
                        value={previewText.title}
                        onChange={(e) => setPreviewText({...previewText, title: e.target.value})}
                        placeholder="Title text"
                        className="preview-input"
                      />
                      <input
                        type="text"
                        value={previewText.subtitle}
                        onChange={(e) => setPreviewText({...previewText, subtitle: e.target.value})}
                        placeholder="Subtitle text"
                        className="preview-input"
                      />
                      <textarea
                        value={previewText.body}
                        onChange={(e) => setPreviewText({...previewText, body: e.target.value})}
                        placeholder="Body text"
                        className="preview-textarea"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="theme-preview">
                    <div 
                      className="slide-preview"
                      style={{
                        background: themeData.colors.background.primary,
                        padding: themeData.spacing.slideMargin,
                        borderRadius: themeData.effects.borderRadius,
                        boxShadow: themeData.effects.shadow,
                        fontFamily: themeData.typography.fontFamily.primary.join(', '),
                      }}
                    >
                      <h1 
                        className="preview-title"
                        style={{
                          color: themeData.colors.text.primary,
                          fontSize: themeData.typography.styles.slideTitle.fontSize,
                          fontWeight: themeData.typography.styles.slideTitle.fontWeight,
                          lineHeight: themeData.typography.styles.slideTitle.lineHeight,
                          letterSpacing: themeData.typography.styles.slideTitle.letterSpacing,
                          marginBottom: themeData.spacing.elementSpacing,
                        }}
                      >
                        {previewText.title}
                      </h1>
                      
                      <h2 
                        className="preview-subtitle"
                        style={{
                          color: themeData.colors.text.secondary,
                          fontSize: themeData.typography.styles.slideSubtitle.fontSize,
                          fontWeight: themeData.typography.styles.slideSubtitle.fontWeight,
                          lineHeight: themeData.typography.styles.slideSubtitle.lineHeight,
                          letterSpacing: themeData.typography.styles.slideSubtitle.letterSpacing,
                          marginBottom: themeData.spacing.sectionSpacing,
                        }}
                      >
                        {previewText.subtitle}
                      </h2>
                      
                      <p 
                        className="preview-body"
                        style={{
                          color: themeData.colors.text.primary,
                          fontSize: themeData.typography.styles.bodyText.fontSize,
                          fontWeight: themeData.typography.styles.bodyText.fontWeight,
                          lineHeight: themeData.typography.styles.bodyText.lineHeight,
                          letterSpacing: themeData.typography.styles.bodyText.letterSpacing,
                          marginBottom: themeData.spacing.sectionSpacing,
                        }}
                      >
                        {previewText.body}
                      </p>

                      <div className="preview-accents" style={{ display: 'flex', gap: themeData.spacing.elementSpacing }}>
                        <div 
                          className="accent-color" 
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            backgroundColor: themeData.colors.accents.primary,
                            borderRadius: themeData.effects.borderRadius,
                          }}
                        />
                        <div 
                          className="accent-color" 
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            backgroundColor: themeData.colors.accents.secondary,
                            borderRadius: themeData.effects.borderRadius,
                          }}
                        />
                        <div 
                          className="accent-color" 
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            backgroundColor: themeData.colors.accents.tertiary,
                            borderRadius: themeData.effects.borderRadius,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="theme-creator-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={!themeName.trim()}
          >
            <Save size={16} />
            {editingTheme ? 'Save Changes' : 'Create Theme'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const ColorInput = ({ label, value, onChange }) => (
  <div className="color-input-group">
    <label>{label}</label>
    <div className="color-input-wrapper">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="color-input"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="color-text-input"
        placeholder="#ffffff"
      />
    </div>
  </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
  <div className="select-input-group">
    <label>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="select-input"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const FontFamilySelectInput = ({ label, value, onChange }) => {
  // Find current font option based on the font stack array
  const currentFontKey = Object.entries(DesignTokens.typography.fontOptions).find(([key, option]) => 
    JSON.stringify(option.stack) === JSON.stringify(value)
  )?.[0] || 'google-sans';
  
  const handleChange = (fontKey) => {
    const selectedFont = DesignTokens.typography.fontOptions[fontKey];
    if (selectedFont) {
      onChange(selectedFont.stack);
    }
  };

  return (
    <div className="font-family-select-group">
      <label>{label}</label>
      <div className="font-family-preview">
        <select
          value={currentFontKey}
          onChange={(e) => handleChange(e.target.value)}
          className="font-family-select"
        >
          {Object.entries(DesignTokens.typography.fontOptions).map(([key, option]) => (
            <option key={key} value={key}>
              {option.name} - {option.description}
            </option>
          ))}
        </select>
        <div 
          className="font-preview-text"
          style={{ 
            fontFamily: value.join(', '),
            fontSize: '14px',
            color: '#666',
            marginTop: '4px',
            fontWeight: '500'
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>
    </div>
  );
};

export default ThemeCreator;

import React, { useState, useEffect } from 'react';
import { themeManager } from '../design-system/ThemeManager.js';
import { ThemeCategories } from '../design-system/themes.js';
import { 
  Palette, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Check,
  X,
  Filter
} from 'lucide-react';
import './ThemeSelector.css';

const ThemeSelector = ({ 
  isOpen, 
  onClose, 
  onThemeSelect, 
  onCreateTheme, 
  currentThemeId = null,
  slideId = null, // If provided, this is for slide-level theme selection
  showCreateButton = true 
}) => {
  const [themes, setThemes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadThemes();
    }
  }, [isOpen]);

  const loadThemes = async () => {
    try {
      const allThemes = await themeManager.getAllAvailableThemes();
      setThemes(allThemes);
    } catch (error) {
      console.error('Error loading themes:', error);
      // Show error notification to user
      alert('Failed to load themes. Please try again.');
    }
  };

  const filteredThemes = themes.filter(theme => {
    const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theme.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleThemeSelect = (theme) => {
    onThemeSelect && onThemeSelect(theme);
    onClose();
  };

  const handleCreateNew = () => {
    onCreateTheme && onCreateTheme();
    onClose();
  };

  const handleEditTheme = (theme, e) => {
    e.stopPropagation();
    if (theme.isCustom) {
      onCreateTheme && onCreateTheme(theme);
      onClose();
    }
  };

  const handleDuplicateTheme = async (theme, e) => {
    e.stopPropagation();
    try {
      const duplicated = await themeManager.duplicateTheme(theme.id, `${theme.name} Copy`);
      await loadThemes();
    } catch (error) {
      console.error('Error duplicating theme:', error);
      alert('Failed to duplicate theme. Please try again.');
    }
  };

  const handleDeleteTheme = async (theme, e) => {
    e.stopPropagation();
    if (theme.isCustom && confirm(`Are you sure you want to delete "${theme.name}"?`)) {
      try {
        await themeManager.deleteCustomTheme(theme.id);
        await loadThemes();
      } catch (error) {
        console.error('Error deleting theme:', error);
        alert('Failed to delete theme. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Themes' },
    ...Object.entries(ThemeCategories).map(([id, label]) => ({ id, label }))
  ];

  return (
    <div className="theme-selector-overlay">
      <div className="theme-selector">
        <div className="theme-selector-header">
          <div className="header-left">
            <h2>
              {slideId ? 'Choose Slide Theme' : 'Choose Presentation Theme'}
            </h2>
            <p>
              {slideId 
                ? 'Select a theme for this slide or inherit from presentation' 
                : 'Select a theme for your entire presentation'
              }
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="theme-selector-controls">
          <div className="search-filter-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search themes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="category-filter">
              <Filter size={16} />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {showCreateButton && (
              <button className="btn-create-theme" onClick={handleCreateNew}>
                <Plus size={16} />
                Create New
              </button>
            )}
          </div>
        </div>

        <div className="theme-selector-content">
          {slideId && (
            <div className="inherit-option">
              <ThemeCard
                theme={{
                  id: null,
                  name: 'Inherit from Presentation',
                  description: 'Use the presentation theme for this slide',
                  category: 'inherit'
                }}
                isSelected={currentThemeId === null}
                onSelect={() => handleThemeSelect({ id: null })}
                isInherit={true}
              />
            </div>
          )}

          <div className="themes-grid">
            {filteredThemes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={currentThemeId === theme.id}
                onSelect={() => handleThemeSelect(theme)}
                onEdit={(e) => handleEditTheme(theme, e)}
                onDuplicate={(e) => handleDuplicateTheme(theme, e)}
                onDelete={(e) => handleDeleteTheme(theme, e)}
              />
            ))}
          </div>

          {filteredThemes.length === 0 && (
            <div className="no-themes">
              <Palette size={48} className="no-themes-icon" />
              <h3>No themes found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ThemeCard = ({ 
  theme, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDuplicate, 
  onDelete,
  isInherit = false 
}) => {
  const preview = isInherit ? null : themeManager.getThemePreview(theme.id);

  return (
    <div 
      className={`theme-card ${isSelected ? 'selected' : ''} ${isInherit ? 'inherit' : ''}`}
      onClick={onSelect}
    >
      <div className="theme-preview">
        {isInherit ? (
          <div className="inherit-preview">
            <div className="inherit-icon">
              <Palette size={24} />
            </div>
          </div>
        ) : (
          <>
            <div 
              className="preview-background"
              style={{ backgroundColor: preview.primary }}
            >
              <div 
                className="preview-header"
                style={{ backgroundColor: preview.secondary }}
              />
              <div className="preview-content">
                <div 
                  className="preview-title"
                  style={{ backgroundColor: preview.text }}
                />
                <div 
                  className="preview-text"
                  style={{ backgroundColor: preview.text, opacity: 0.6 }}
                />
                <div 
                  className="preview-accent"
                  style={{ backgroundColor: preview.accent }}
                />
              </div>
            </div>
            
            {isSelected && (
              <div className="selected-indicator">
                <Check size={16} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="theme-info">
        <h4 className="theme-name">{theme.name}</h4>
        <p className="theme-description">{theme.description}</p>
        
        <div className="theme-meta">
          <span className={`theme-category ${theme.category}`}>
            {ThemeCategories[theme.category] || theme.category}
          </span>
          {theme.isDefault && <span className="theme-badge default">Default</span>}
          {theme.isCustom && <span className="theme-badge custom">Custom</span>}
        </div>
      </div>

      {!isInherit && (
        <div className="theme-actions">
          {theme.isCustom && onEdit && (
            <button 
              className="theme-action-btn edit"
              onClick={onEdit}
              title="Edit theme"
            >
              <Edit3 size={14} />
            </button>
          )}
          
          {onDuplicate && (
            <button 
              className="theme-action-btn duplicate"
              onClick={onDuplicate}
              title="Duplicate theme"
            >
              <Copy size={14} />
            </button>
          )}
          
          {theme.isCustom && onDelete && (
            <button 
              className="theme-action-btn delete"
              onClick={onDelete}
              title="Delete theme"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;

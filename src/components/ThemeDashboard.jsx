import React, { useState, useEffect } from 'react';
import { themeManager } from '../design-system/ThemeManager.js';
import { ThemeCategories } from '../design-system/themes.js';
import ThemeCreator from './ThemeCreator.jsx';
import ThemeSelector from './ThemeSelector.jsx';
import { 
  Palette, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Filter,
  Search,
  Eye,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import './ThemeDashboard.css';

const ThemeDashboard = ({ isOpen, onClose }) => {
  const [themes, setThemes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTheme, setActiveTheme] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadThemes();
      setActiveTheme(themeManager.getActiveTheme());
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

  const handleCreateNew = () => {
    setEditingTheme(null);
    setShowCreator(true);
  };

  const handleEditTheme = (theme) => {
    if (theme.isCustom) {
      setEditingTheme(theme);
      setShowCreator(true);
    }
  };

  const handleDuplicateTheme = async (theme) => {
    try {
      const duplicated = await themeManager.duplicateTheme(theme.id, `${theme.name} Copy`);
      await loadThemes();
    } catch (error) {
      console.error('Error duplicating theme:', error);
      alert('Failed to duplicate theme. Please try again.');
    }
  };

  const handleDeleteTheme = async (theme) => {
    if (theme.isCustom && confirm(`Are you sure you want to delete "${theme.name}"?`)) {
      try {
        await themeManager.deleteCustomTheme(theme.id);
        await loadThemes();
        
        // Update active theme if it was deleted
        if (activeTheme?.id === theme.id) {
          setActiveTheme(themeManager.getActiveTheme());
        }
      } catch (error) {
        console.error('Error deleting theme:', error);
        alert('Failed to delete theme. Please try again.');
      }
    }
  };

  const handleThemeSaved = async (savedTheme) => {
    await loadThemes();
    setShowCreator(false);
    setEditingTheme(null);
  };

  const handleSetAsDefault = (theme) => {
    themeManager.setPresentationTheme(theme.id);
    setActiveTheme(theme);
  };

  const handlePreviewTheme = (theme) => {
    // Temporarily apply theme for preview
    themeManager.applyThemeToDocument(theme.id);
  };

  const handleExportTheme = (theme) => {
    const themeData = {
      ...theme,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target.result);
        
        // Validate and clean theme data
        delete themeData.id;
        delete themeData.isDefault;
        themeData.isCustom = true;
        themeData.name = themeData.name + ' (Imported)';
        
        themeManager.createCustomTheme(themeData);
        loadThemes();
      } catch (error) {
        alert('Error importing theme: Invalid file format');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const categories = [
    { id: 'all', label: 'All Themes' },
    ...Object.entries(ThemeCategories).map(([id, label]) => ({ id, label }))
  ];

  const stats = {
    total: themes.length,
    custom: themes.filter(t => t.isCustom).length,
    default: themes.filter(t => t.isDefault).length,
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="theme-dashboard-overlay">
        <div className="theme-dashboard">
          <div className="theme-dashboard-header">
            <div className="header-left">
              <h1>Design System</h1>
              <p>Manage your presentation themes and design tokens</p>
            </div>
            <button className="btn-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="theme-dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Themes</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.custom}</div>
              <div className="stat-label">Custom Themes</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.default}</div>
              <div className="stat-label">Default Themes</div>
            </div>
            <div className="stat-card active-theme">
              <div className="stat-label">Active Theme</div>
              <div className="active-theme-name">{activeTheme?.name || 'None'}</div>
            </div>
          </div>

          <div className="theme-dashboard-controls">
            <div className="controls-left">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search themes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-box">
                <Filter size={16} />
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="controls-right">
              <input
                type="file"
                accept=".json"
                onChange={handleImportTheme}
                className="file-input"
                id="import-theme"
              />
              <label htmlFor="import-theme" className="btn-secondary">
                <Upload size={16} />
                Import
              </label>
              
              <button className="btn-secondary" onClick={() => setShowSelector(true)}>
                <Settings size={16} />
                Set Default
              </button>
              
              <button className="btn-primary" onClick={handleCreateNew}>
                <Plus size={16} />
                Create Theme
              </button>
            </div>
          </div>

          <div className="theme-dashboard-content">
            <div className="themes-grid">
              {filteredThemes.map(theme => (
                <ThemeManagementCard
                  key={theme.id}
                  theme={theme}
                  isActive={activeTheme?.id === theme.id}
                  onEdit={() => handleEditTheme(theme)}
                  onDuplicate={() => handleDuplicateTheme(theme)}
                  onDelete={() => handleDeleteTheme(theme)}
                  onSetAsDefault={() => handleSetAsDefault(theme)}
                  onPreview={() => handlePreviewTheme(theme)}
                  onExport={() => handleExportTheme(theme)}
                />
              ))}
            </div>

            {filteredThemes.length === 0 && (
              <div className="no-themes">
                <Palette size={64} className="no-themes-icon" />
                <h3>No themes found</h3>
                <p>Try adjusting your search or filter criteria, or create a new theme</p>
                <button className="btn-primary" onClick={handleCreateNew}>
                  <Plus size={16} />
                  Create Your First Theme
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreator && (
        <ThemeCreator
          isOpen={showCreator}
          onClose={() => {
            setShowCreator(false);
            setEditingTheme(null);
          }}
          editingTheme={editingTheme}
          onSave={handleThemeSaved}
        />
      )}

      {showSelector && (
        <ThemeSelector
          isOpen={showSelector}
          onClose={() => setShowSelector(false)}
          onThemeSelect={handleSetAsDefault}
          currentThemeId={activeTheme?.id}
          showCreateButton={false}
        />
      )}
    </>
  );
};

const ThemeManagementCard = ({
  theme,
  isActive,
  onEdit,
  onDuplicate,
  onDelete,
  onSetAsDefault,
  onPreview,
  onExport
}) => {
  const preview = themeManager.getThemePreview(theme.id);

  return (
    <div className={`theme-management-card ${isActive ? 'active' : ''}`}>
      <div className="theme-preview-large">
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
        
        {isActive && (
          <div className="active-indicator">
            <span>Active</span>
          </div>
        )}
        
        <div className="preview-actions">
          <button className="preview-action-btn" onClick={onPreview} title="Preview">
            <Eye size={14} />
          </button>
        </div>
      </div>

      <div className="theme-management-info">
        <div className="theme-header">
          <h4 className="theme-name">{theme.name}</h4>
          <div className="theme-badges">
            {theme.isDefault && <span className="theme-badge default">Default</span>}
            {theme.isCustom && <span className="theme-badge custom">Custom</span>}
          </div>
        </div>
        
        <p className="theme-description">{theme.description}</p>
        
        <div className="theme-meta">
          <span className={`theme-category ${theme.category}`}>
            {ThemeCategories[theme.category] || theme.category}
          </span>
        </div>

        <div className="theme-management-actions">
          <button 
            className="action-btn set-default"
            onClick={onSetAsDefault}
            disabled={isActive}
            title={isActive ? 'Already active' : 'Set as default theme'}
          >
            <Settings size={14} />
            {isActive ? 'Active' : 'Set Default'}
          </button>
          
          <div className="action-menu">
            {theme.isCustom && (
              <button className="action-btn edit" onClick={onEdit} title="Edit theme">
                <Edit3 size={14} />
              </button>
            )}
            
            <button className="action-btn duplicate" onClick={onDuplicate} title="Duplicate theme">
              <Copy size={14} />
            </button>
            
            <button className="action-btn export" onClick={onExport} title="Export theme">
              <Download size={14} />
            </button>
            
            {theme.isCustom && (
              <button className="action-btn delete" onClick={onDelete} title="Delete theme">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDashboard;

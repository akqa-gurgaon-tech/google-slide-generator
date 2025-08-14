import React, { useEffect, useRef } from "react";
import { themeManager } from "../design-system/ThemeManager.js";

const SlideEditor = ({ slide, onUpdateLayout, onUpdateInput, onSlideThemeSelect, currentSlideTheme }) => {
  const slidePreviewRef = useRef(null);
  const editorContainerRef = useRef(null);
  const layouts = {
    TITLE: ["TITLE"],
    TITLE_AND_BODY: ["TITLE", "BODY"],
    TITLE_AND_TWO_COLUMNS: ["TITLE", "LEFT_COLUMN", "RIGHT_COLUMN"],
    TITLE_ONLY: ["TITLE"],
    CENTERED_TITLE: ["CENTERED_TITLE"],
    SUBTITLE: ["SUBTITLE"],
  };

  const layoutOptions = [
    { value: "TITLE", label: "Title Slide", icon: "📝" },
    { value: "TITLE_AND_BODY", label: "Title and Content", icon: "📄" },
    { value: "TITLE_AND_TWO_COLUMNS", label: "Two Columns", icon: "📊" },
    { value: "TITLE_ONLY", label: "Title Only", icon: "🎯" },
    { value: "CENTERED_TITLE", label: "Centered Title", icon: "🎨" },
    { value: "SUBTITLE", label: "Subtitle", icon: "📋" },
  ];

  // Helper function to get CSS class for field type
  const getFieldClassName = (field) => {
    const fieldMap = {
      'TITLE': 'slide-title',
      'SUBTITLE': 'slide-subtitle', 
      'BODY': 'slide-body',
      'LEFT_COLUMN': 'slide-body',
      'RIGHT_COLUMN': 'slide-body',
      'CENTERED_TITLE': 'slide-title'
    };
    return fieldMap[field] || 'slide-body';
  };

  // Apply theme to content inputs when slide changes or theme changes
  useEffect(() => {
    if (slide && editorContainerRef.current) {
      // Apply theme only to the content editor section
      const contentEditor = editorContainerRef.current.querySelector('.content-editor');
      if (contentEditor) {
        contentEditor.setAttribute('data-slide-id', slide.slideId);
        themeManager.applyThemeToSlideElement(contentEditor, slide.slideId);
      }
    }
  }, [slide, currentSlideTheme]);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event) => {
      if (slide && editorContainerRef.current && 
          (event.detail.type === 'presentation' || 
           (event.detail.type === 'slide' && event.detail.slideId === slide.slideId))) {
        // Apply theme only to the content editor section
        const contentEditor = editorContainerRef.current.querySelector('.content-editor');
        if (contentEditor) {
          contentEditor.setAttribute('data-slide-id', slide.slideId);
          themeManager.applyThemeToSlideElement(contentEditor, slide.slideId);
        }
      }
    };

    document.addEventListener('themeChanged', handleThemeChange);
    return () => document.removeEventListener('themeChanged', handleThemeChange);
  }, [slide]);

  if (!slide) {
    return (
      <div className="slide-editor-empty">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Slide Selected</h3>
          <p>Select a slide from the left panel to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-editor" ref={editorContainerRef}>
      <div className="editor-header">
        <h2>Slide Content</h2>
        <div className="slide-actions">
          <div className="slide-info">
            <span className="slide-number">Slide {slide.slideId}</span>
          </div>
          {onSlideThemeSelect && (
            <button
              className="slide-theme-btn"
              onClick={onSlideThemeSelect}
              title={`Current theme: ${currentSlideTheme?.name || 'Inherited'}`}
            >
              🎨 Theme
            </button>
          )}
        </div>
      </div>

      <div className="layout-selector">
        <label className="section-label">Layout</label>
        <div className="layout-dropdown-wrapper">
          <select
            className="layout-dropdown"
            value={slide.layout}
            onChange={(e) => onUpdateLayout(e.target.value)}
          >
            <option value="">Select a layout...</option>
            {layoutOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {slide.layout && (
        <div className="content-editor">
          <label className="section-label">Content</label>
          {layouts[slide.layout].map((field) => (
            <div key={field} className="input-group">
              <label className="input-label">{field.replace("_", " ")}</label>
              <textarea
                className="content-input slide-input"
                value={slide.inputs[field] || ""}
                onChange={(e) => onUpdateInput(field, e.target.value)}
                placeholder={`Enter ${field
                  .toLowerCase()
                  .replace("_", " ")}...`}
                rows={field === "BODY" ? 6 : 2}
              />
            </div>
          ))}
        </div>
      )}

      {/* {slide.layout && (
        <div className="slide-preview-section">
          <label className="section-label">Live Preview</label>
          <div className="slide-preview-container">
            <div 
              ref={slidePreviewRef}
              className={`slide-preview slide-content layout-${slide.layout.toLowerCase()}`}
              data-slide-id={slide.slideId}
            >
              {layouts[slide.layout]?.map((field) => {
                const fieldClass = getFieldClassName(field);
                const content = slide.inputs[field] || `Enter ${field.toLowerCase().replace('_', ' ')}`;
                
                return (
                  <div key={field} className={`preview-${field.toLowerCase()} ${fieldClass}`}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )} */}

      {/* OLD COMMENTED PREVIEW: {slide.layout && (
        <div className="slide-preview-panel">
          <label className="section-label">Preview</label>
          <div className="slide-preview">
            <div className="preview-slide">
              {slide.layout === "TITLE" && (
                <div className="title-layout">
                  <h1 className="preview-title-main">
                    {slide.inputs.TITLE || "Click to add title"}
                  </h1>
                </div>
              )}

              {slide.layout === "TITLE_AND_BODY" && (
                <div className="title-body-layout">
                  <h1 className="preview-title-main">
                    {slide.inputs.TITLE || "Click to add title"}
                  </h1>
                  <div className="preview-body-content">
                    {slide.inputs.BODY || "Click to add content"}
                  </div>
                </div>
              )}

              {slide.layout === "TITLE_AND_TWO_COLUMNS" && (
                <div className="title-two-columns-layout">
                  <h1 className="preview-title-main">
                    {slide.inputs.TITLE || "Click to add title"}
                  </h1>
                  <div className="two-columns-content">
                    <div className="column-left">
                      {slide.inputs.LEFT_COLUMN || "Click to add content"}
                    </div>
                    <div className="column-right">
                      {slide.inputs.RIGHT_COLUMN || "Click to add content"}
                    </div>
                  </div>
                </div>
              )}

              {slide.layout === "TITLE_ONLY" && (
                <div className="title-only-layout">
                  <h1 className="preview-title-large">
                    {slide.inputs.TITLE || "Click to add title"}
                  </h1>
                </div>
              )}

              {slide.layout === "CENTERED_TITLE" && (
                <div className="centered-title-layout">
                  <h1 className="preview-title-centered">
                    {slide.inputs.CENTERED_TITLE || "Click to add title"}
                  </h1>
                </div>
              )}

              {slide.layout === "SUBTITLE" && (
                <div className="subtitle-layout">
                  <h2 className="preview-subtitle">
                    {slide.inputs.SUBTITLE || "Click to add subtitle"}
                  </h2>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default SlideEditor;

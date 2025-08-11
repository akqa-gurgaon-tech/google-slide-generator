import React, { useEffect, useRef } from "react";
import { themeManager } from "../design-system/ThemeManager.js";

const SlideThumbnail = ({ slide, index, isActive, onClick, onDelete }) => {
  const thumbnailRef = useRef(null);
  const getSlidePreview = () => {
    if (!slide.layout) {
      return (
        <div className="slide-preview-empty">
          <div className="slide-number">{index + 1}</div>
          <div className="slide-placeholder">Select Layout</div>
        </div>
      );
    }

    const layoutFields = {
      TITLE: ["TITLE"],
      TITLE_AND_BODY: ["TITLE", "BODY"],
      TITLE_AND_TWO_COLUMNS: ["TITLE", "LEFT_COLUMN", "RIGHT_COLUMN"],
      TITLE_ONLY: ["TITLE"],
      CENTERED_TITLE: ["CENTERED_TITLE"],
      SUBTITLE: ["SUBTITLE"],
    };

    const fields = layoutFields[slide.layout] || [];

    // Helper function to get CSS class for field type
    const getFieldClassName = (field) => {
      const fieldMap = {
        'TITLE': 'thumbnail-title',
        'SUBTITLE': 'thumbnail-body', 
        'BODY': 'thumbnail-body',
        'LEFT_COLUMN': 'thumbnail-body',
        'RIGHT_COLUMN': 'thumbnail-body',
        'CENTERED_TITLE': 'thumbnail-title'
      };
      return fieldMap[field] || 'thumbnail-body';
    };

    return (
      <div className="slide-preview-content thumbnail-content">
        <div className="slide-number">{index + 1}</div>
        {fields.map((field, fieldIndex) => (
          <div
            key={fieldIndex}
            className={`preview-field preview-${field.toLowerCase()} ${getFieldClassName(field)}`}
          >
            {slide.inputs[field] || field}
          </div>
        ))}
      </div>
    );
  };

  // Apply theme when slide changes or theme changes
  useEffect(() => {
    if (slide && thumbnailRef.current) {
      thumbnailRef.current.setAttribute('data-slide-id', slide.id);
      themeManager.applyThemeToSlideElement(thumbnailRef.current, slide.id);
    }
  }, [slide]);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event) => {
      if (slide && thumbnailRef.current && 
          (event.detail.type === 'presentation' || 
           (event.detail.type === 'slide' && event.detail.slideId === slide.id))) {
        themeManager.applyThemeToSlideElement(thumbnailRef.current, slide.id);
      }
    };

    document.addEventListener('themeChanged', handleThemeChange);
    return () => document.removeEventListener('themeChanged', handleThemeChange);
  }, [slide]);

  return (
    <div
      ref={thumbnailRef}
      className={`slide-thumbnail ${isActive ? "active" : ""}`}
      onClick={() => onClick(index)}
      data-slide-id={slide.id}
    >
      {getSlidePreview()}
      <button
        className="delete-slide-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
      >
        ×
      </button>
    </div>
  );
};

export default SlideThumbnail;

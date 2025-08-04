import React from "react";

const SlideThumbnail = ({ slide, index, isActive, onClick, onDelete }) => {
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

    return (
      <div className="slide-preview-content">
        <div className="slide-number">{index + 1}</div>
        {fields.map((field, fieldIndex) => (
          <div
            key={fieldIndex}
            className={`preview-field preview-${field.toLowerCase()}`}
          >
            {slide.inputs[field] || field}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`slide-thumbnail ${isActive ? "active" : ""}`}
      onClick={() => onClick(index)}
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

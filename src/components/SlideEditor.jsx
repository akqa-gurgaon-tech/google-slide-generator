import React from "react";

const SlideEditor = ({ slide, onUpdateLayout, onUpdateInput }) => {
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
    <div className="slide-editor">
      <div className="editor-header">
        <h2>Slide Content</h2>
        <div className="slide-info">
          <span className="slide-number">Slide {slide.id}</span>
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
                className="content-input"
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

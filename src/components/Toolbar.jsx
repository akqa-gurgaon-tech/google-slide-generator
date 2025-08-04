import React from "react";

const Toolbar = ({
  onAddSlide,
  onCreatePresentation,
  presentationUrl,
  isCreating,
  onBack,
  onLogout,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        {onBack && (
          <button
            className="toolbar-btn secondary"
            onClick={onBack}
            title="Back to presentations"
          >
            <span className="btn-icon">←</span>
            <span className="btn-text">Back</span>
          </button>
        )}
        <button
          className="toolbar-btn primary"
          onClick={onAddSlide}
          title="Add new slide"
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">Add Slide</span>
        </button>
      </div>

      <div className="toolbar-center">
        <div className="presentation-title">
          <h1>Google Slides Generator</h1>
        </div>
      </div>

      <div className="toolbar-right">
        {presentationUrl && (
          <a
            href={presentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="toolbar-btn secondary"
          >
            <span className="btn-icon">🔗</span>
            <span className="btn-text">Open Presentation</span>
          </a>
        )}

        <button
          className={`toolbar-btn primary ${isCreating ? "loading" : ""}`}
          onClick={onCreatePresentation}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <span className="btn-icon spinning">⏳</span>
              <span className="btn-text">Creating...</span>
            </>
          ) : (
            <>
              <span className="btn-icon">📊</span>
              <span className="btn-text">Generate Slides</span>
            </>
          )}
        </button>

        {onLogout && (
          <button
            className="toolbar-btn secondary"
            onClick={onLogout}
            title="Sign out"
          >
            <span className="btn-icon">🚪</span>
            <span className="btn-text">Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;

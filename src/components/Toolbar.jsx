import React, { useState, useEffect, useRef } from "react";

const Toolbar = ({
  onAddSlide,
  onCreatePresentation,
  presentationUrl,
  isCreating,
  onBack,
  onLogout,
  presentationTitle,
  onTitleChange,
  isEditable = false,
  onPresentationThemeSelect,
  currentTheme,
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
        
        {onPresentationThemeSelect && (
          <button
            className="toolbar-btn theme"
            onClick={onPresentationThemeSelect}
            title={`Current theme: ${currentTheme?.name || 'Default'}`}
          >
            <span className="btn-icon">🎨</span>
            <span className="btn-text">Theme</span>
          </button>
        )}
      </div>

      <div className="toolbar-center">
        {isEditable ? (
          <EditableTitle
            title={presentationTitle || "Untitled presentation"}
            onTitleChange={onTitleChange}
          />
        ) : (
          <div className="presentation-title">
            <h1>{presentationTitle || "Google Slides Generator"}</h1>
          </div>
        )}
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

// Editable Title Component with debouncing
const EditableTitle = ({ title, onTitleChange }) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      if (newTitle.trim() !== title && newTitle.trim() !== "") {
        setIsSaving(true);
        onTitleChange(newTitle.trim()).finally(() => {
          setIsSaving(false);
        });
      }
    }, 1000); // 1 second debounce
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFinishEditing();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setLocalTitle(title);
      setIsEditing(false);
    }
  };

  const handleFinishEditing = () => {
    setIsEditing(false);

    // Clear debounce and immediately save if there are changes
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (localTitle.trim() !== title && localTitle.trim() !== "") {
      setIsSaving(true);
      onTitleChange(localTitle.trim()).finally(() => {
        setIsSaving(false);
      });
    } else if (localTitle.trim() === "") {
      setLocalTitle(title); // Reset to original if empty
    }
  };

  return (
    <div className="editable-title">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={localTitle}
          onChange={handleTitleChange}
          onBlur={handleFinishEditing}
          onKeyDown={handleKeyDown}
          className="title-input"
          maxLength={100}
        />
      ) : (
        <h1
          onClick={() => setIsEditing(true)}
          className="title-display"
          title="Click to edit title"
        >
          {localTitle}
          {isSaving && <span className="saving-indicator">💾</span>}
        </h1>
      )}
    </div>
  );
};

export default Toolbar;

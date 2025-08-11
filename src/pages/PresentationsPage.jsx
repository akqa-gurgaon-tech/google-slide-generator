import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PresentationSelector from "../components/PresentationSelector";

const PresentationsPage = ({ onLogout, userInfo }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [showPresentationSelector, setShowPresentationSelector] =
    useState(false);
  const [presentationTitle, setPresentationTitle] = useState("");
  const navigate = useNavigate();

  const handleCreateNew = () => {
    setShowTitleDialog(true);
  };

  const handleCreateWithTitle = async () => {
    setIsCreating(true);

    setShowTitleDialog(false);

    try {
      // Call the API to create a new presentation
      const response = await fetch(
        "http://localhost:5000/api/create-presentation",
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presentationTitle:
              presentationTitle.trim() || "Untitled presentation",
          }),
        }
      );

      const data = await response.json();

      if (data.presentationId) {
        // Store presentation data in localStorage
        const presentationData = {
          presentationId: data.presentationId,
          title: data.title,
          url: data.url,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(
          "currentPresentation",
          JSON.stringify(presentationData)
        );
        localStorage.removeItem("slides"); // Clear any existing slides

        console.log("New presentation created:", data);
        navigate("/editor");
      } else {
        alert("Failed to create presentation. Please try again.");
      }
    } catch (error) {
      console.error("Error creating presentation:", error);
      alert(
        "Error creating presentation. Please check your connection and try again."
      );
    } finally {
      setIsCreating(false);
      setPresentationTitle("");
    }
  };

  const handleCancelDialog = () => {
    setShowTitleDialog(false);
    setPresentationTitle("");
  };

  const handleOpenExisting = () => {
    setShowPresentationSelector(true);
  };

  const handleSelectPresentation = (presentation) => {
    // Store the selected presentation data in localStorage
    const presentationData = {
      presentationId: presentation.presentationId,
      title: presentation.title,
      url: `https://docs.google.com/presentation/d/${presentation.presentationId}/edit`,
      createdAt: presentation.createdAt,
    };

    localStorage.setItem(
      "currentPresentation",
      JSON.stringify(presentationData)
    );
    console.log("presentation in handleSelectPresentation", presentation);
    localStorage.setItem(
      "slides",
      JSON.stringify(presentation.slidesJson.slides || [])
    );

    console.log("Selected presentation:", presentation);

    // Navigate to editor page
    navigate("/editor");
  };

  const handleClosePresentationSelector = () => {
    setShowPresentationSelector(false);
  };

  return (
    <div className="presentations-page">
      {/* Title Dialog Modal */}
      {showTitleDialog && (
        <div className="modal-overlay">
          <div className="title-dialog">
            <h3>Create New Presentation</h3>
            <p>Enter a title for your presentation (optional):</p>
            <input
              type="text"
              className="title-input"
              placeholder="Untitled presentation"
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
              maxLength={100}
              autoFocus
            />
            <div className="dialog-buttons">
              <button
                className="dialog-button secondary"
                onClick={handleCancelDialog}
              >
                Cancel
              </button>
              <button
                className="dialog-button primary"
                onClick={handleCreateWithTitle}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="presentations-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon">📊</span>
            <h1>Google Slides Generator</h1>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">👤 {userInfo?.name || "User"}</span>
            <button className="logout-button" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="presentations-content">
        <div className="welcome-section">
          <h2>Welcome to Google Slides Generator</h2>
          <p>Create beautiful presentations with AI-powered layouts</p>
        </div>

        <div className="action-cards">
          <div className="action-card create-new">
            <div className="card-icon">✨</div>
            <h3>Create New Presentation</h3>
            <p>Start fresh with a blank presentation</p>
            <button
              className={`action-button primary ${isCreating ? "loading" : ""}`}
              onClick={handleCreateNew}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="button-icon">+</span>
                  Create New
                </>
              )}
            </button>
          </div>

          <div className="action-card open-existing">
            <div className="card-icon">📂</div>
            <h3>Open Existing</h3>
            <p>Continue working on saved presentations</p>
            <button
              className="action-button secondary"
              onClick={handleOpenExisting}
            >
              <span className="button-icon">📁</span>
              Open Existing
            </button>
            <div className="coming-soon">Coming Soon</div>
          </div>
        </div>

        <div className="recent-section">
          <h3>Recent Presentations</h3>
          <div className="recent-list">
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <p>No recent presentations</p>
              <p className="empty-hint">
                Your recent presentations will appear here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Presentation Selector Modal */}
      <PresentationSelector
        isOpen={showPresentationSelector}
        onClose={handleClosePresentationSelector}
        onSelectPresentation={handleSelectPresentation}
      />
    </div>
  );
};

export default PresentationsPage;

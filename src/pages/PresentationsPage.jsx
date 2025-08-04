import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PresentationsPage = ({ onLogout }) => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateNew = async () => {
    setIsCreating(true);

    // Simulate creating new presentation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Clear any existing slides from localStorage for new presentation
    localStorage.removeItem("slides");

    navigate("/editor");
    setIsCreating(false);
  };

  const handleOpenExisting = () => {
    // TODO: Implement in the future - load from database
    alert(
      "Open existing presentations feature will be implemented in the future!"
    );
  };

  return (
    <div className="presentations-page">
      <div className="presentations-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon">📊</span>
            <h1>Google Slides Generator</h1>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">👤 Admin</span>
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
    </div>
  );
};

export default PresentationsPage;

import React, { useState, useEffect } from "react";
import "./PresentationSelector.css";

// Dummy data simulating presentations from database
const DUMMY_PRESENTATIONS = [
  {
    id: "1",
    presentationId: "1bxPqyZrI5E8m4KqJz_r3w8EyFnNkG8H7pLsX9Q2V",
    title: "Company Q4 Results",
    description: "Quarterly business review and financial overview",
    thumbnail: null,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
    createdBy: "John Doe",
    slides: [
      {
        id: 1,
        layout: "TITLE",
        inputs: { TITLE: "Q4 2024 Results" },
      },
      {
        id: 2,
        layout: "TITLE_AND_BODY",
        inputs: {
          TITLE: "Executive Summary",
          BODY: "Revenue increased by 25% compared to Q3",
        },
      },
    ],
  },
  {
    id: "2",
    presentationId: "2cxRqzZrJ6F9n5LrKa_s4x9FzGoOlH9I8qMtY0R3W",
    title: "Product Launch Strategy",
    description: "New product go-to-market strategy and timeline",
    thumbnail: null,
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-18T16:20:00Z",
    createdBy: "Jane Smith",
    slides: [
      {
        id: 1,
        layout: "TITLE",
        inputs: { TITLE: "Product Launch 2024" },
      },
      {
        id: 2,
        layout: "TITLE_AND_TWO_COLUMNS",
        inputs: {
          TITLE: "Market Analysis",
          LEFT_COLUMN: "Target Market: Young professionals aged 25-35",
          RIGHT_COLUMN: "Competition: 3 major players with 60% market share",
        },
      },
    ],
  },
  {
    id: "3",
    presentationId: "3dxSrzZsK7G0o6MsLb_t5y0GaHpPmI0J9rNuZ1S4X",
    title: "Team Training Materials",
    description: "Onboarding and skill development presentations",
    thumbnail: null,
    createdAt: "2024-01-05T13:45:00Z",
    updatedAt: "2024-01-12T11:30:00Z",
    createdBy: "Jaden Rancourt",
    slides: [
      {
        id: 1,
        layout: "TITLE",
        inputs: { TITLE: "Welcome to Our Team" },
      },
      {
        id: 2,
        layout: "TITLE_AND_BODY",
        inputs: {
          TITLE: "Company Values",
          BODY: "Innovation, Collaboration, Excellence, Integrity",
        },
      },
    ],
  },
  {
    id: "4",
    presentationId: "4exTsaZtL8H1p7NtMc_u6z1HbIqQnJ1K0sOvA2T5Y",
    title: "Marketing Campaign Review",
    description: "Analysis of recent marketing initiatives and ROI",
    thumbnail: null,
    createdAt: "2024-01-02T08:00:00Z",
    updatedAt: "2024-01-08T17:15:00Z",
    createdBy: "Alice Johnson",
    slides: [
      {
        id: 1,
        layout: "TITLE",
        inputs: { TITLE: "Marketing Campaign Performance" },
      },
      {
        id: 2,
        layout: "TITLE_AND_BODY",
        inputs: {
          TITLE: "Key Metrics",
          BODY: "CTR: 3.2%, Conversion Rate: 8.5%, ROI: 320%",
        },
      },
    ],
  },
  {
    id: "5",
    presentationId: "5fyUubaVuM9I2q8OuNd_v7a2IcJrRoK2L1tPwB3U6Z",
    title: "Budget Planning 2024",
    description: "Annual budget allocation and financial projections",
    thumbnail: null,
    createdAt: "2023-12-28T14:20:00Z",
    updatedAt: "2024-01-03T10:45:00Z",
    createdBy: "Michael Brown",
    slides: [
      {
        id: 1,
        layout: "TITLE",
        inputs: { TITLE: "2024 Budget Overview" },
      },
      {
        id: 2,
        layout: "TITLE_AND_TWO_COLUMNS",
        inputs: {
          TITLE: "Budget Allocation",
          LEFT_COLUMN: "Operations: 45%\nMarketing: 25%\nR&D: 20%",
          RIGHT_COLUMN: "Admin: 7%\nContingency: 3%",
        },
      },
    ],
  },
];

const PresentationSelector = ({ isOpen, onClose, onSelectPresentation }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [presentations, setPresentations] = useState([]);

  useEffect(() => {
    // const fetchPresentations = async () => {
    console.log("fetching presentations");
    // const response = await fetch("http://localhost:5000/ppt/get");
    // const data = await response.json();
    fetchSlidesData();

    // console.log("presentations", data.test);
    // };
    // fetchPresentations();
  }, []);

  const fetchSlidesData = async () => {
    try {
      const response = await fetch("http://localhost:5000/ppt/get", {
        credentials: "include",
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setPresentations(data);
      // console.log("data", JSON.stringify(data, null, 2));

      // if (data.success) {
      //   console.log("Slides data updated successfully");
      // } else {
      //   console.log("Failed to save slides data!");
      // }
    } catch (error) {
      console.error("Error creating presentation:", error);
      alert(
        "Error fetching presentation. Please check your connection and try again."
      );
    }
  };

  if (!isOpen) return null;

  // Filter presentations based on search term
  const filteredPresentations = presentations.filter(
    (presentation) =>
      presentation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presentation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPresentation = (presentation) => {
    setSelectedPresentation(presentation);
  };

  const handleConfirmSelection = () => {
    if (selectedPresentation) {
      onSelectPresentation(selectedPresentation);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedPresentation(null);
    onClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="presentation-selector-overlay" onClick={handleClose}>
      <div
        className="presentation-selector-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="presentation-selector-header">
          <h2>Select a Presentation</h2>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* <div className="presentation-selector-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search presentations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}

        <div className="presentation-selector-content">
          <div className="presentations-list">
            {filteredPresentations.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No presentations found</h3>
                <p>Try adjusting your search terms</p>
              </div>
            ) : (
              filteredPresentations.map((presentation) => (
                <div
                  key={presentation.presentationId}
                  className={`presentation-item ${
                    selectedPresentation?.presentationId ===
                    presentation.presentationId
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleSelectPresentation(presentation)}
                >
                  {/* <div className="presentation-thumbnail">
                    <div className="thumbnail-placeholder">📊</div>
                  </div> */}

                  <div className="presentation-info">
                    <h3 className="presentation-title">{presentation.title}</h3>
                    {/* <p className="presentation-description">
                      {presentation.description}
                    </p> */}
                    <div className="presentation-meta">
                      {/* <span className="slide-count">
                        {presentation.slides.length} slides
                      </span> */}
                      {/* <span className="separator">•</span> */}
                      <span className="update-date">
                        Created by: {presentation.createdBy}
                      </span>
                      <span className="update-date">
                        Created {formatDate(presentation.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* <div className="presentation-actions">
                    {selectedPresentation?.id === presentation.id && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </div> */}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="presentation-selector-footer">
          <button className="footer-button secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            className={`footer-button primary ${
              !selectedPresentation ? "disabled" : ""
            }`}
            onClick={handleConfirmSelection}
            disabled={!selectedPresentation}
          >
            Open Presentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentationSelector;

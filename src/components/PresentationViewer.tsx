import { useState, useRef, useEffect } from "react";

import {
  ExternalLink,
  FileText,
  Play,
  Eye,
  Maximize,
  Loader2,
} from "lucide-react";
import React from "react";
import "./PresentationViewer.css";

interface PresentationViewerProps {
  url: string;
  presentationId: string;
  className?: string;
  showControls?: boolean;
  autoStart?: boolean;
  loop?: boolean;
}

export function PresentationViewer({
  url,
  presentationId,
  className = "",
  showControls = true,
  autoStart = false,
  loop = false,
}: PresentationViewerProps) {
  const [slideshowMode, setSlideshowMode] = useState(autoStart);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  console.log("presentationId: ", presentationId);

  // Prevent unwanted scrolling behavior when navigating presentation
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      // Prevent automatic scrolling when iframe gets focus
      if (e.target && (e.target as Element).tagName === "IFRAME") {
        e.preventDefault();
      }
    };

    const handleScroll = (e: Event) => {
      // If the scroll is triggered by iframe interaction, prevent it
      if (
        containerRef.current &&
        containerRef.current.contains(e.target as Node)
      ) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        // If container is already in view, prevent additional scrolling
        if (rect.top >= -100 && rect.top <= window.innerHeight / 2) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener("focus", handleFocus, true);
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  if (!presentationId) {
    return (
      <div className={`presentation-empty-state ${className}`}>
        <div className="presentation-empty-content">
          <div className="presentation-empty-icon">
            <FileText />
          </div>
          <h3 className="presentation-empty-title">
            No presentation available
          </h3>
          <p className="presentation-empty-description">
            Create your first slide to see a preview of your presentation here.
          </p>
        </div>
      </div>
    );
  }

  if (presentationId) {
    const embedUrl = slideshowMode
      ? `https://docs.google.com/presentation/d/${presentationId}/embed?start=true&loop=false&delayms=5000`
      : `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=5000`;

    return (
      <div
        ref={containerRef}
        className={`presentation-viewer ${className}`}
        style={{ scrollBehavior: "smooth" }}
      >
        {showControls && (
          <div className="presentation-controls">
            <div className="presentation-controls-content">
              <div className="presentation-controls-left">
                <button
                  onClick={() => setSlideshowMode(!slideshowMode)}
                  className={`presentation-control-btn presentation-toggle-btn ${
                    slideshowMode ? "active" : ""
                  }`}
                  title={
                    slideshowMode
                      ? "Exit slideshow mode"
                      : "Enter slideshow mode"
                  }
                >
                  {slideshowMode ? <Eye /> : <Play />}
                  {slideshowMode ? "View Mode" : "Slideshow"}
                </button>
              </div>

              <div className="presentation-controls-right">
                <a
                  href={`https://docs.google.com/presentation/d/${presentationId}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="presentation-control-btn presentation-action-btn open"
                  title="Open in Google Slides"
                >
                  <ExternalLink />
                  Open
                </a>
                <a
                  href={`https://docs.google.com/presentation/d/${presentationId}/present`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="presentation-control-btn presentation-action-btn fullscreen"
                  title="Open slideshow in new window"
                >
                  <Maximize />
                  Fullscreen
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="presentation-iframe-container">
          {isLoading && (
            <div className="presentation-loading">
              <div className="presentation-loading-content">
                <Loader2 className="presentation-loading-spinner" />
                <p className="presentation-loading-text">
                  Loading presentation...
                </p>
              </div>
            </div>
          )}

          {hasError && (
            <div className="presentation-error">
              <div className="presentation-error-content">
                <FileText className="presentation-error-icon" />
                <h3 className="presentation-error-title">
                  Failed to load presentation
                </h3>
                <p className="presentation-error-description">
                  Please try refreshing the page or check your connection.
                </p>
              </div>
            </div>
          )}

          <iframe
            src={embedUrl}
            className="presentation-iframe"
            allowFullScreen
            title="Google Slides Presentation"
            style={{
              pointerEvents: "auto",
              touchAction: "auto",
            }}
            onLoad={(e) => {
              setIsLoading(false);
              setHasError(false);
              const iframe = e.target as HTMLIFrameElement;
              iframe.style.scrollBehavior = "auto";
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </div>
      </div>
    );
  }
}

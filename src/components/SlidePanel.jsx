import React from "react";
import SlideThumbnail from "./SlideThumbnail";

const SlidePanel = ({ slides, activeIndex, onSlideSelect, onSlideDelete }) => {
  return (
    <div className="slide-panel">
      <div className="panel-header">
        <h3>Slides</h3>
        <span className="slide-count">
          {slides.length} slide{slides.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="slide-thumbnails">
        {slides.length === 0 ? (
          <div className="empty-slides">
            <div className="empty-icon">📝</div>
            <p>No slides yet</p>
            <p className="empty-hint">Click "Add Slide" to get started</p>
          </div>
        ) : (
          slides.map((slide, index) => (
            <SlideThumbnail
              key={slide.slideId}
              slide={slide}
              index={index}
              isActive={index === activeIndex}
              onClick={onSlideSelect}
              onDelete={onSlideDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SlidePanel;

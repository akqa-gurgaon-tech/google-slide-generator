import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import SlidePanel from "../components/SlidePanel";
import SlideEditor from "../components/SlideEditor";

function EditorPage({ onLogout }) {
  const [slides, setSlides] = useState(() => {
    return JSON.parse(localStorage.getItem("slides")) || [];
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [presentationUrl, setPresentationUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("slides", JSON.stringify(slides));
  }, [slides]);

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      layout: "",
      inputs: {},
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveIndex(slides.length);
  };

  const updateSlideLayout = (layout) => {
    setSlides((prev) =>
      prev.map((slide, index) =>
        index === activeIndex ? { ...slide, layout, inputs: {} } : slide
      )
    );
  };

  const updateInput = (field, value) => {
    setSlides((prev) =>
      prev.map((slide, index) =>
        index === activeIndex
          ? {
              ...slide,
              inputs: { ...slide.inputs, [field]: value },
            }
          : slide
      )
    );
  };

  const handleSlideSelect = (index) => {
    setActiveIndex(index);
  };

  const handleSlideDelete = (index) => {
    const updatedSlides = slides.filter((_, sIdx) => sIdx !== index);
    setSlides(updatedSlides);

    if (activeIndex >= updatedSlides.length) {
      setActiveIndex(Math.max(0, updatedSlides.length - 1));
    } else if (index === activeIndex) {
      setActiveIndex(0);
    }
  };

  const handleCreatePresentation = async () => {
    if (slides.length === 0) {
      alert("Please add at least one slide before creating a presentation.");
      return;
    }

    setIsCreating(true);
    try {
      console.log("Submitting slides:", slides);
      const response = await fetch("http://localhost:5000/api/create-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });

      const data = await response.json();
      if (data.url) {
        setPresentationUrl(data.url);
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
    }
  };

  const handleBackToPresentations = () => {
    navigate("/presentations");
  };

  const currentSlide = slides[activeIndex];

  return (
    <div className="app">
      <Toolbar
        onAddSlide={addSlide}
        onCreatePresentation={handleCreatePresentation}
        presentationUrl={presentationUrl}
        isCreating={isCreating}
        onBack={handleBackToPresentations}
        onLogout={onLogout}
      />

      <div className="main-content">
        <SlidePanel
          slides={slides}
          activeIndex={activeIndex}
          onSlideSelect={handleSlideSelect}
          onSlideDelete={handleSlideDelete}
        />

        <SlideEditor
          slide={currentSlide}
          onUpdateLayout={updateSlideLayout}
          onUpdateInput={updateInput}
        />
      </div>
    </div>
  );
}

export default EditorPage;

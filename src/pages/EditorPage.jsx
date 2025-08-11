import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import SlidePanel from "../components/SlidePanel";
import SlideEditor from "../components/SlideEditor";
import { PresentationViewer } from "../components/PresentationViewer";
import { TabContainer, TabPanel } from "../components/TabContainer";
import ThemeSelector from "../components/ThemeSelector.jsx";
import ThemeCreator from "../components/ThemeCreator.jsx";
import { themeManager } from "../design-system/ThemeManager.js";

function EditorPage({ onLogout, userInfo }) {
  const [slides, setSlides] = useState(() => {
    return JSON.parse(localStorage.getItem("slides")) || [];
  });

  const [currentPresentation, setCurrentPresentation] = useState(() => {
    return JSON.parse(localStorage.getItem("currentPresentation")) || null;
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [presentationUrl, setPresentationUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showThemeCreator, setShowThemeCreator] = useState(false);
  const [themeSelectorMode, setThemeSelectorMode] = useState('presentation'); // 'presentation' or 'slide'
  const [currentTheme, setCurrentTheme] = useState(null);
  const navigate = useNavigate();
  const tabContainerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("slides", JSON.stringify(slides));
  }, [slides]);

  const prevSlidesRef = useRef(slides);
  useEffect(() => {
    if (prevSlidesRef.current.length === 0) {
      prevSlidesRef.current = slides;
      return;
    }

    const timer = setTimeout(() => {
      // Compare by id
      const changedSlide = slides.filter((slide) => {
        const prevSlide = prevSlidesRef.current.find(
          (s) => s.slideId === slide.slideId
        );
        return (
          !prevSlide || JSON.stringify(prevSlide) !== JSON.stringify(slide)
        );
      });

      if (changedSlide.length > 0) {
        updateSlidesData(currentPresentation, changedSlide);
        // console.log("changedSlide slides:", changedSlide);
      }
      // Update previous ref
      prevSlidesRef.current = slides;
    }, 5000);

    return () => clearTimeout(timer); // cleanup if slides changes before 5s
  }, [slides]);

  // useEffect(() => {
  //   if (!slides || slides.length === 0) return; // no slides, skip

  //   const timer = setTimeout(() => {
  //     updateSlidesData();
  //   }, 5000);

  //   return () => clearTimeout(timer); // cleanup if slides changes before 5s
  // }, [slides]);

  const updateSlidesData = async (curre, changedSlide) => {
    try {
      const response = await fetch("http://localhost:5000/ppt/update", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pptJson: currentPresentation,
          slidesArr: changedSlide,
        }),
      });
      const data = await response.json();

      if (data.success) {
        console.log("Slides data updated successfully");
      } else {
        console.log("Failed to save slides data!");
      }
    } catch (error) {
      console.error("Error creating presentation:", error);
      alert(
        "Error fetching presentation. Please check your connection and try again."
      );
    }
  };
  // Initialize theme manager and load current theme
  useEffect(() => {
    const initializeThemes = async () => {
      try {
        await themeManager.initialize();
        setCurrentTheme(themeManager.getActiveTheme());
      } catch (error) {
        console.error('Error initializing themes:', error);
      }
    };
    
    initializeThemes();
  }, []);

  const addSlide = () => {
    const newSlide = {
      slideId: Date.now(),
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
    const upda = slides.filter((_, sIdx) => sIdx !== index);
    setSlides(upda);

    if (activeIndex >= upda.length) {
      setActiveIndex(Math.max(0, upda.length - 1));
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
      // Get theme data from theme manager
      const themeData = themeManager.exportPresentationThemes();
      
      const response = await fetch(
        "http://localhost:5000/presentation/create",
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slides,
            presentationId: currentPresentation.presentationId,
            themes: themeData,
          }),
        }
      );
      const data = await response.json();
      if (data.url) {
        setPresentationUrl(data.url);

        // Update the current presentation with the new URL
        if (currentPresentation) {
          const updatedPresentation = {
            ...currentPresentation,
            url: data.url,
            lastGenerated: new Date().toISOString(),
          };
          setCurrentPresentation(updatedPresentation);
          localStorage.setItem(
            "currentPresentation",
            JSON.stringify(updatedPresentation)
          );
        }

        // Automatically switch to the preview tab to show the generated presentation
        if (tabContainerRef.current) {
          setTimeout(() => {
            tabContainerRef.current.switchToTab(1); // Switch to preview tab
          }, 500); // Small delay to ensure URL is set
        }
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

  const handleTitleChange = async (newTitle) => {
    if (!currentPresentation) return Promise.resolve();

    try {
      // Update localStorage immediately
      const updatedPresentation = {
        ...currentPresentation,
        title: newTitle,
      };
      setCurrentPresentation(updatedPresentation);
      localStorage.setItem(
        "currentPresentation",
        JSON.stringify(updatedPresentation)
      );

      // Update Google Drive if we have a presentation ID
      if (currentPresentation.presentationId) {
        const response = await fetch(
          "http://localhost:5000/api/update-presentation-title",
          {
            credentials: "include",
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              presentationId: currentPresentation.presentationId,
              title: newTitle,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update title in Google Drive");
        }

        console.log("Presentation title updated successfully");
      }
    } catch (error) {
      console.error("Error updating presentation title:", error);
      throw error;
    }
  };

  // Theme management functions
  const handlePresentationThemeSelect = () => {
    setThemeSelectorMode('presentation');
    setShowThemeSelector(true);
  };

  const handleSlideThemeSelect = () => {
    if (slides[activeIndex]) {
      setThemeSelectorMode('slide');
      setShowThemeSelector(true);
    }
  };

  const handleThemeSelect = (theme) => {
    if (themeSelectorMode === 'presentation') {
      themeManager.setPresentationTheme(theme.id);
      setCurrentTheme(theme);
      // Force re-render of all slides with new theme
      setTimeout(() => {
        themeManager.applyThemeToAllSlides();
      }, 100);
    } else if (themeSelectorMode === 'slide' && slides[activeIndex]) {
      themeManager.setSlideTheme(slides[activeIndex].id, theme.id);
      // Force re-render of specific slide
      setTimeout(() => {
        themeManager.applyThemeToSpecificSlide(slides[activeIndex].id);
      }, 100);
    }
    setShowThemeSelector(false);
  };

  const handleCreateTheme = (editingTheme = null) => {
    setShowThemeCreator(true);
    // editingTheme parameter can be used to edit existing themes
  };

  const handleThemeSaved = (savedTheme) => {
    setShowThemeCreator(false);
    // Optionally set as active theme
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  };

  const getCurrentSlideTheme = () => {
    if (slides[activeIndex]) {
      return themeManager.getSlideTheme(slides[activeIndex].id);
    }
    return currentTheme;
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
        userInfo={userInfo}
        presentationTitle={currentPresentation?.title}
        onTitleChange={handleTitleChange}
        isEditable={!!currentPresentation}
        onPresentationThemeSelect={handlePresentationThemeSelect}
        currentTheme={currentTheme}
      />

      <div className="main-content">
        <SlidePanel
          slides={slides}
          activeIndex={activeIndex}
          onSlideSelect={handleSlideSelect}
          onSlideDelete={handleSlideDelete}
        />

        <div className="editor-content">
          <TabContainer ref={tabContainerRef} defaultTab={0}>
            <TabPanel label="Slide Content">
              <SlideEditor
                slide={currentSlide}
                onUpdateLayout={updateSlideLayout}
                onUpdateInput={updateInput}
                onSlideThemeSelect={handleSlideThemeSelect}
                currentSlideTheme={getCurrentSlideTheme()}
              />
            </TabPanel>
            <TabPanel label="Presentation Preview">
              <div className="preview-container">
                <div className="preview-header">
                  {presentationUrl ? (
                    <p className="preview-subtitle">
                      Preview updates automatically when you generate slides
                    </p>
                  ) : (
                    <p className="preview-subtitle">
                      Click "Generate Slides" to see your presentation preview
                    </p>
                  )}
                </div>
                {presentationUrl || currentPresentation.presentationId ? (
                  <PresentationViewer
                    url={presentationUrl}
                    presentationId={currentPresentation.presentationId}
                    key={presentationUrl} // Force re-render when URL changes
                  />
                ) : (
                  <div className="preview-empty">
                    <div className="preview-empty-icon">📊</div>
                    <h4>No Presentation Generated Yet</h4>
                    <p>
                      Add some slides and click "Generate Slides" to see your
                      presentation preview here.
                    </p>
                  </div>
                )}
              </div>
            </TabPanel>
          </TabContainer>
        </div>
      </div>

      {/* Theme Selection Modal */}
      {showThemeSelector && (
        <ThemeSelector
          isOpen={showThemeSelector}
          onClose={() => setShowThemeSelector(false)}
          onThemeSelect={handleThemeSelect}
          onCreateTheme={handleCreateTheme}
          currentThemeId={
            themeSelectorMode === 'presentation' 
              ? currentTheme?.id 
              : themeManager.slideThemeOverrides.get(slides[activeIndex]?.id)
          }
          slideId={themeSelectorMode === 'slide' ? slides[activeIndex]?.id : null}
        />
      )}

      {/* Theme Creator Modal */}
      {showThemeCreator && (
        <ThemeCreator
          isOpen={showThemeCreator}
          onClose={() => setShowThemeCreator(false)}
          onSave={handleThemeSaved}
        />
      )}
    </div>
  );
}

export default EditorPage;

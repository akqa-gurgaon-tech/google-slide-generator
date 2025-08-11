import React, { useState, useImperativeHandle, forwardRef } from "react";

const TabContainer = forwardRef(
  ({ children, defaultTab = 0, onTabChange }, ref) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    useImperativeHandle(ref, () => ({
      switchToTab: (tabIndex) => {
        setActiveTab(tabIndex);
        if (onTabChange) onTabChange(tabIndex);
      },
      getActiveTab: () => activeTab,
    }));

    const handleTabClick = (index) => {
      setActiveTab(index);
      if (onTabChange) onTabChange(index);
    };

    const tabs = React.Children.toArray(children);

    return (
      <div className="tab-container">
        <div className="tab-header">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab-button ${activeTab === index ? "active" : ""}`}
              onClick={() => handleTabClick(index)}
            >
              {tab.props.label}
            </button>
          ))}
        </div>
        <div className="tab-content">{tabs[activeTab]}</div>
      </div>
    );
  }
);

const TabPanel = ({ label, children }) => {
  return <div className="tab-panel">{children}</div>;
};

export { TabContainer, TabPanel };

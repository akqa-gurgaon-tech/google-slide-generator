import { useState } from "react";

const layouts = {
  TITLE: ["CENTERED_TITLE", "SUBTITLE"],
  TITLE_AND_BODY: ["TITLE", "BODY"],
  TITLE_AND_TWO_COLUMNS: ["TITLE", "LEFT_COLUMN", "RIGHT_COLUMN"],
  TITLE_ONLY: ["TITLE"],
};

function App() {
  const [selectedLayout, setSelectedLayout] = useState("");
  const [formData, setFormData] = useState({});
  const [slideUrl, setSlideUrl] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:5000/api/create-slide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        layout: selectedLayout,
        inputs: formData,
      }),
    });

    const data = await response.json();
    if (data.url) setSlideUrl(data.url);
  };

  return (
    <div className="container">
      <h1>Create Google Slide</h1>
      <select
        value={selectedLayout}
        onChange={(e) => {
          setSelectedLayout(e.target.value);
          setFormData({});
          setSlideUrl("");
        }}
      >
        <option value="">Select Layout</option>
        {Object.keys(layouts).map((layout) => (
          <option key={layout} value={layout}>
            {layout}
          </option>
        ))}
      </select>

      {selectedLayout &&
        layouts[selectedLayout].map((field) => (
          <div key={field}>
            <label>{field}</label>
            <input
              type="text"
              value={formData[field] || ""}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          </div>
        ))}

      <button onClick={handleSubmit}>Create Slide</button>

      {slideUrl && (
        <p>
          <a href={slideUrl} target="_blank" rel="noopener noreferrer">
            Open Presentation
          </a>
        </p>
      )}
    </div>
  );
}

export default App;

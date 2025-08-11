import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));


    onLogin();
    // navigate("/presentations");

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="google-slides-logo">
            <div className="logo-icon">📊</div>
            <h1>Google Slides Generator</h1>
          </div>
          <p className="login-subtitle">
            Sign in to create amazing presentations
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
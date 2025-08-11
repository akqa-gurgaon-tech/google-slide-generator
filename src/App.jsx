import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PresentationsPage from "./pages/PresentationsPage";
import EditorPage from "./pages/EditorPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [userInfo, setUserInfo] = useState(() => {
    const stored = localStorage.getItem("userInfo");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
  }, [isAuthenticated]);

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      localStorage.removeItem("userInfo");
    }
  }, [userInfo]);

  useEffect(() => {
    const verifySession = async () => {
      const result = await checkLoginStatus();
      setIsAuthenticated(result.isLoggedIn);
      if (result.userInfo) {
        setUserInfo(result.userInfo);
      }
    };

    verifySession();
  }, []);

  // const handleLogin = async () => {
  //   console.log("handle-new-login");
  //   const response = await fetch("http://localhost:5000/auth", {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //   });
  //   console.log("hi");
  //   const data = await response.json();
  //   console.log(data);
  //   window.location.href = data.url;
  // };

  const handleLogin = async () => {
    const result = await checkLoginStatus();
    if (result.isLoggedIn) {
      setIsAuthenticated(true);
      if (result.userInfo) {
        setUserInfo(result.userInfo);
      }
    } else {
      window.location.href = "http://localhost:5000/auth";
    }
  };

  const checkLoginStatus = async () => {
    const response = await fetch("http://localhost:5000/auth/status", {
      credentials: "include", // important to send session cookie
    });
    const data = await response.json();
    return {
      isLoggedIn: data.loggedIn,
      userInfo: data.userInfo || null,
    };
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("slides");
    localStorage.removeItem("currentPresentation");
    const response = await fetch("http://localhost:5000/logout", {
      credentials: "include", // important to send session cookie
    });
    const data = await response.json();
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/presentations" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/presentations" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />

          <Route
            path="/presentations"
            element={
              isAuthenticated ? (
                <PresentationsPage
                  onLogout={handleLogout}
                  userInfo={userInfo}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/editor"
            element={
              isAuthenticated ? (
                <EditorPage onLogout={handleLogout} userInfo={userInfo} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

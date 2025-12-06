import React, { useState, useEffect } from "react";
import SettingsDrawer from "./SettingsDrawer";

export default function PageHeader({ onRefresh }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const storedName = localStorage.getItem("kino_username");
    if (storedName) {
      setUsername(storedName);
    }
  }, []);

  const handleRefreshClick = () => {
    setIsSpinning(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsSpinning(false), 1000);
  };

  return (
    <>
      <div className="page-header">
        <div className="greeting">
          {/* Left Side: Avatar & Text */}
          <div className="greeting-group">
            <div className="greeting-icon">
              <svg className="icon-svg" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="header-text">
              <span className="user-name">Hi {username}</span>
              <span className="welcome-message">Welcome back to Kino</span>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
            {/* Refresh Button */}
            <button
              className={`refresh-button ${isSpinning ? "spinning" : ""}`}
              onClick={handleRefreshClick}
              aria-label="Refresh Recommendations"
            >
              <svg className="refresh-icon" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
            </button>

            {/* Settings Button (Updated Icon) */}
            <button
              className="refresh-button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Settings"
            >
              <svg className="refresh-icon" viewBox="0 0 24 24">
                <path d="M21 13v-2a1 1 0 0 0-1-1h-1.42a8 8 0 0 0-1.28-3.09l1-1a1 1 0 0 0 0-1.42l-1.42-1.42a1 1 0 0 0-1.42 0l-1 1A8 8 0 0 0 11.42 3H10a1 1 0 0 0-1 1v2a8 8 0 0 0-3.09 1.28l-1-1a1 1 0 0 0-1.42 0L2.07 7.7a1 1 0 0 0 0 1.42l1 1A8 8 0 0 0 1.79 13.2H3a1 1 0 0 0 1 1v2a8 8 0 0 0 1.28 3.09l-1 1a1 1 0 0 0 0 1.42l1.42 1.42a1 1 0 0 0 1.42 0l1-1a8 8 0 0 0 3.09 1.28v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1.42a8 8 0 0 0 3.09-1.28l1 1a1 1 0 0 0 1.42 0l1.42-1.42a1 1 0 0 0 0-1.42l-1-1A8 8 0 0 0 19.58 13.2H21a1 1 0 0 0 0-2zm-9 3a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <SettingsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}
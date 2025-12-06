import React, { useState, useEffect } from "react";
import SettingsDrawer from "./SettingsDrawer";

export default function PageHeader({ onRefresh }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [username, setUsername] = useState("User");

  useEffect(() => {
    // Retrieve username from local storage
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
            <button
              className={`refresh-button ${isSpinning ? "spinning" : ""}`}
              onClick={handleRefreshClick}
              aria-label="Refresh Recommendations"
            >
              <svg className="refresh-icon" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
            </button>

            <button
              className="refresh-button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Settings"
            >
              <svg className="refresh-icon" viewBox="0 0 24 24">
                 <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0.43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
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
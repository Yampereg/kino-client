import React, { useState, useEffect, useCallback } from "react";
import SettingsDrawer from "./SettingsDrawer";
// Note: Assuming you are using local storage for username, 
// as indicated by the useEffect hook in your provided code block.

export default function PageHeader({ onRefresh }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [username, setUsername] = useState("User"); // Using useState/useEffect for username based on your provided code

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
  
  // Use useCallback to memoize the onClose handler. 
  // This prevents SettingsDrawer from re-rendering just because this function reference changes.
  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="greeting">
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

            {/* Settings Button */}
            <button
              className="refresh-button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Settings"
            >
              <svg className="refresh-icon" viewBox="0 0 24 24">
                {/* Corrected Settings Icon Path */}
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.97l-.38-2.65c-.04-.26-.25-.44-.5-.44h-4c-.25 0-.46.18-.5.44l-.38 2.65c-.63.24-1.17.58-1.69.97l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.06.73 1.69.97l.38 2.65c.04.26.25.44.5.44h4c.25 0 .46-.18.5-.44l.38-2.65c.63-.24 1.17-.58 1.69-.97l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* SettingsDrawer component is now rendered */}
      <SettingsDrawer 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDrawer} // <-- Using the memoized handler
      />
    </>
  );
}
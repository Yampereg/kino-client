import React, { useState } from "react";
// Assuming you have a custom hook to get user data
import { useAuth } from "../context/AuthContext"; 

export default function PageHeader({ onRefresh }) {
  const [isSpinning, setIsSpinning] = useState(false);
  // Get username from context
  const { userName } = useAuth(); 
  
  const greetingName = userName || 'User';

  const handleRefreshClick = () => {
    setIsSpinning(true);
    if (onRefresh) onRefresh();
    
    // Stop spinning after animation (matches CSS duration)
    setTimeout(() => setIsSpinning(false), 1000);
  };

  return (
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
            {/* Displaying dynamic username */}
            <span className="user-name">Hi {greetingName}</span>
            <span className="welcome-message">Welcome back to Kino</span>
          </div>
        </div>

        {/* Right Side: Refresh Button */}
        <button 
          className={`refresh-button ${isSpinning ? "spinning" : ""}`} 
          onClick={handleRefreshClick}
          aria-label="Refresh Recommendations"
        >
          <svg className="refresh-icon" viewBox="0 0 24 24">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
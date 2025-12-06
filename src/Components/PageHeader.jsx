import React from "react";
// Assuming you have a custom hook to get user data
import { useAuth } from "../context/AuthContext"; 

export default function PageHeader() {
  // Get username from context
  const { userName } = useAuth(); 
  
  const greetingName = userName || 'User';

  // Note: onRefresh prop and all state/handlers related to buttons are removed.
  // Note: SettingsDrawer import and usage are removed.

  return (
    <div className="page-header">
      <div className="greeting">
        {/* Left Side: Avatar & Text */}
        <div className="greeting-group">
          {/* ICON REMOVED */}
          <div className="greeting-icon">
            <span role="img" aria-label="user icon">👤</span>
          </div>
          <div className="header-text">
            {/* Displaying dynamic username */}
            <span className="user-name">Hi {greetingName}</span>
            <span className="welcome-message">Welcome back to Kino</span>
          </div>
        </div>

        {/* Right Side: Actions (REMOVED) */}
        {/* No refresh or settings buttons */}
      </div>
    </div>
  );
}
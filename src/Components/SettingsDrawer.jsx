/* SettingsDrawer.jsx */
import React, { useEffect } from "react";
import "./SettingsDrawer.css";

export default function SettingsDrawer({ isOpen, onClose, userName, onLogout }) {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Use the userName prop for the avatar and greeting
  const displayedName = userName || "User";

  return (
    <>
      {/* Dark Overlay (Click to close) */}
      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`drawer-panel ${isOpen ? "open" : ""}`}>

        {/* Header Section */}
        <div className="drawer-header">
          <button className="drawer-close-btn" onClick={onClose}>
            ✕
          </button>
          <div className="drawer-user-info">
            <div className="drawer-avatar">
              {displayedName.charAt(0).toUpperCase()}
            </div>
            <div className="drawer-greeting">
              <span className="greeting-label">Signed in as</span>
              <span className="username-text">{displayedName}</span>
            </div>
          </div>
        </div>

        {/* Navigation Links (Expandable for future) */}
        <div className="drawer-body">
          <div className="nav-item active">Home</div>
          <div className="nav-item">Profile</div>
          <div className="nav-item">Settings</div>
        </div>

        {/* Footer / Logout */}
        <div className="drawer-footer">
          <button className="logout-btn" onClick={onLogout}>
            <img src="/logout-icon.svg" alt="" className="btn-icon" /> {/* Optional icon */}
            <span>Log Out</span>
          </button>
          <div className="app-version">Kino v1.0</div>
        </div>
      </div>
    </>
  );
}
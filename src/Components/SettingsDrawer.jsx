import React, { useEffect } from "react";
import "./SettingsDrawer.css";

export default function SettingsDrawer({ isOpen, onClose, userName, onLogout }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const displayedName = userName || "User";

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div className={`drawer-panel ${isOpen ? "open" : ""}`}>
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

        <div className="drawer-body">
          <div className="nav-item active">Home</div>
          <div className="nav-item">Profile</div>
          <div className="nav-item">Settings</div>
        </div>

        <div className="drawer-footer">
          <button className="logout-btn" onClick={onLogout}>
            <img src="/logout-icon.svg" alt="" className="btn-icon" />
            <span>Log Out</span>
          </button>
          <div className="app-version">Kino v1.0</div>
        </div>
      </div>
    </>
  );
}
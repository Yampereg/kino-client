import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingsDrawer.css";

export default function SettingsDrawer({ isOpen, onClose, userName, onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const displayedName = userName || "User";

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

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
          <div className="nav-item active" onClick={() => handleNavigation("/")}>
            Home
          </div>
          <div className="nav-item">Profile</div>
          <div className="nav-item">Settings</div>

          <hr className="drawer-divider" style={{ opacity: 0.1, margin: "15px 0" }} />

          <div className="nav-item" onClick={() => handleNavigation("/liked")}>
            Liked Films
          </div>
          <div className="nav-item" onClick={() => handleNavigation("/disliked")}>
            Disliked Films
          </div>
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
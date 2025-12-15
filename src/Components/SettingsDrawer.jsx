/* src/Components/SettingsDrawer.jsx */
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingsDrawer.css";

export default function SettingsDrawer({ isOpen, onClose, userName, onLogout, onShowLiked }) {
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

  const handleLikedClick = (type) => {
    // FIXED: Removed navigation fallback. 
    // We only want to open the modal via the parent callback.
    if (onShowLiked) {
      onShowLiked(type);
    }
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
          <div className="nav-item active" onClick={() => handleNavigation("/recommendations")}>
            For You
          </div>
          <div className="nav-item" onClick={() => handleLikedClick("liked")}>
            Liked Films
          </div>
          <div className="nav-item" onClick={() => handleLikedClick("disliked")}>
            Disliked Films
          </div>
        </div>

        <div className="drawer-footer">
          <button className="logout-btn" onClick={onLogout}>
            <img src="/logout-icon.svg" alt="" className="btn-icon" />
            <span>Log Out</span>
          </button>
          <div className="app-version">Kino v1.1</div>
        </div>
      </div>
    </>
  );
}
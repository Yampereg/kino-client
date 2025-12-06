import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./SettingsDrawer.css";

export default function SettingsDrawer({ isOpen, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`drawer-overlay ${isOpen ? "open" : ""}`}>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Drawer Panel */}
      <div className={`drawer-panel ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="drawer-header">
          <h2>Settings</h2>
          <button onClick={onClose} className="close-btn">
            <svg viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="drawer-content">
          <div className="settings-group">
            <h3>Account</h3>
            <p>Manage your profile and preferences here.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button onClick={handleLogout} className="logout-btn">
            <svg viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
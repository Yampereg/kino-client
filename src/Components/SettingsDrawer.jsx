// SettingsDrawer.js
import React from 'react';

export default function SettingsDrawer({ isOpen, onClose }) {
  if (!isOpen) {
    return null; // Don't render anything if closed
  }

  // This is the absolute minimum safe content. 
  // It only contains basic JSX and should not freeze.
  return (
    <div className="settings-drawer-overlay" onClick={onClose}>
      <div 
        className="settings-drawer-content" 
        onClick={(e) => e.stopPropagation()} // Stop clicks inside from closing it
      >
        <h2>Test Drawer</h2>
        <p>If you see this, the parent component is fixed.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
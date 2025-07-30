import React from "react";
import "./Error-popup.css"; // We'll define simple styles for popup/modal

export default function ErrorPopup({ message, onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{message || "An error occurred."}</p>
        <button className="popup-close-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

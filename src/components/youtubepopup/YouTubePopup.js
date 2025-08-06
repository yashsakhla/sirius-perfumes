import React from "react";
import "./YouTubePopup.css";

export default function YouTubePopup({ open, onClose, videoId }) {
  if (!open) return null;
  return (
    <div className="yt-popup-overlay" onClick={onClose}>
      <div className="yt-popup-content" onClick={e => e.stopPropagation()}>
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube video"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
        <button className="yt-popup-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

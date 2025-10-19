import React from "react";
import "./scrollingtextbar.css";

const messages = [
  "Bold. Elegant. Unforgettable.",
  "Not just perfume — personality.",
  "Born to stand out, not blend in.",
  "Your vibe, bottled."
];

export default function ScrollingTextBar() {
  return (
    <div className="scrolling-bar-outer">
      <div className="scrolling-bar-inner">
        <div className="scrolling-bar-track">
          {messages.map((msg, idx) => (
            <span className="scrolling-bar-msg" key={idx}>{msg}</span>
          ))}
          {/* Repeat for seamless scroll */}
          {messages.map((msg, idx) => (
            <span className="scrolling-bar-msg" key={idx + messages.length}>{msg}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

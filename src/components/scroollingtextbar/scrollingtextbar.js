import React from "react";
import "./scrollingtextbar.css";

const messages = [
  "Free shipping above ₹1000",
  "Buying first time? Get 50% off upto ₹75",
  "Buy 3 perfumes and get 1 free",
  "Special festival offers live now!"
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

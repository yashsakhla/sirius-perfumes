import React from "react";
import "./loader.css";

export default function Loader() {
  return (
    <div className="perfume-loader-overlay">
      <div className="perfume-bottle">
        <div className="bottle-body" />
        <div className="bottle-cap" />
        <div className="bottle-spray">
          <span className="spray-particle" />
          <span className="spray-particle" />
          <span className="spray-particle" />
          <span className="spray-particle" />
          <span className="spray-particle" />
        </div>
      </div>
      <div className="loader-text"></div>
    </div>
  );
}

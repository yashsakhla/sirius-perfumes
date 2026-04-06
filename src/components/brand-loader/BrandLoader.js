import React from "react";
import "./BrandLoader.css";

/**
 * Full-screen branded wait state (account bootstrap, checkout / payment, etc.)
 */
export function BrandPageLoader({
  title = "Sirius",
  titleAccent = "Perfumes",
  message = "Please wait…",
  ariaLabel = "Loading",
}) {
  return (
    <div
      className="brand-loader-full"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div className="brand-loader-full__wash" aria-hidden />
      <div className="brand-loader-full__card">
        <div className="brand-loader-full__rings" aria-hidden>
          <span className="brand-loader-full__ring brand-loader-full__ring--outer" />
          <span className="brand-loader-full__ring brand-loader-full__ring--inner" />
          <span className="brand-loader-full__core">{title.charAt(0)}</span>
        </div>
        <div className="brand-loader-full__titles">
          <span className="brand-loader-full__title">{title}</span>
          <span className="brand-loader-full__title-muted">{titleAccent}</span>
        </div>
        <div className="brand-loader-full__bar" aria-hidden>
          <span className="brand-loader-full__bar-fill" />
        </div>
        <p className="brand-loader-full__message">{message}</p>
      </div>
    </div>
  );
}

/**
 * Top progress bar + optional pill (saving profile, light operations)
 */
export function BrandSavingOverlay({
  label = "Working…",
  showChip = true,
  ariaLabel = "In progress",
}) {
  return (
    <div
      className="brand-saving"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div className="brand-saving__track" aria-hidden>
        <span className="brand-saving__track-fill" />
      </div>
      {showChip && (
        <div className="brand-saving__chip">
          <span className="brand-saving__chip-icon" aria-hidden />
          <span className="brand-saving__chip-text">{label}</span>
        </div>
      )}
    </div>
  );
}

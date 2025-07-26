import React, { useEffect, useState } from 'react';
import './popup.css';

export default function OfferPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not previously shown
    if (!localStorage.getItem('offerPopupShown')) {
      setVisible(true);
      localStorage.setItem('offerPopupShown', 'true');
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="offer-popup-overlay" onClick={() => setVisible(false)}>
      <div className="offer-popup" onClick={e => e.stopPropagation()}>
        <button
          className="offer-popup-close"
          onClick={() => setVisible(false)}
          aria-label="Close offer popup"
        >
          ×
        </button>
        <h2>Special Offer!</h2>
        <p>Buy 3 perfumes and get 1 free on this</p>
      </div>
    </div>
  );
}

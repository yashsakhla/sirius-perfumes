import React, { useEffect, useState } from 'react';
import './popup.css';

export default function OfferPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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
        <div className="offer-popup-content">
          {/* Left side - Image */}
          <div className="offer-popup-image">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
              alt="Special Offer"
            />
          </div>

          {/* Right side - Text */}
          <div className="offer-popup-text">
            <h2>Membership Surprise!</h2>
            <p>Unlock access to exclusive perfumes!</p>
    <p className="offer-popup-message">
      Shop now—lucky customers get a membership coupon for discounts.
    </p>
    <button
      className="shop-button"
      onClick={() => window.location.href = '/shop'}
    >
      Shop Now
    </button>
          </div>
        </div>
      </div>
    </div>
  );
}

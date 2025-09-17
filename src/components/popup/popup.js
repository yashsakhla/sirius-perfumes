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
              src={require(`../../images/sirius-5.jpg`)}
              alt="Special Offer"
            />
          </div>

          {/* Right side - Text */}
          <div className="offer-popup-text">
  <h2>Surprise Sale!</h2>
  <p>Buy the best perfumes—crafted to captivate your senses.</p>
  <p className="offer-popup-message">
    Shop now and experience luxurious fragrances at special prices. Don’t miss out—exclusive deals for a limited time!
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

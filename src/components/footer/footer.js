import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLocationArrow,
} from "react-icons/fa6";
import "./footer.css";

const Footer = () => (
  <footer className="main-footer">
    <div className="footer-section footer-social">
      <div className="footer-title">We are at Social Media</div>
      <div className="footer-social-icons">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
          <FaInstagram />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
          <FaFacebookF />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
          <FaWhatsapp />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
          <FaYoutube />
        </a>
      </div>
    </div>
    <div className="footer-divider"></div>
    <div className="footer-section footer-logo">
      <span className="footer-logo-text">
        <span className="footer-logo-bold">sirius</span>
      </span>
      <div className="footer-copyright">
        &copy; {new Date().getFullYear()} Sirius. All rights reserved.
      </div>
    </div>
    <div className="footer-divider"></div>
<div className="footer-section footer-contact">
  <div className="footer-title">Contact Details</div>
  <div className="footer-contact-row">
    <a
      href="https://wa.me/919876543210"
      target="_blank"
      rel="noopener noreferrer"
      className="footer-contact-icon"
      aria-label="WhatsApp"
    >
      <FaWhatsapp />
    </a>
  </div>
  <div className="footer-contact-row">
    <a
      href="tel:+911234567890"
      className="footer-contact-icon"
      aria-label="Phone"
    >
      <FaPhone />
    </a>
  </div>
  <div className="footer-contact-row">
    <a
      href="mailto:info@sirius.com"
      className="footer-contact-icon"
      aria-label="Email"
    >
      <FaEnvelope />
    </a>
  </div>
  <div className="footer-contact-row">
    <a
      href="https://www.google.com/maps/search/?api=1&query=123+Main+Street+Mumbai+India"
      target="_blank"
      rel="noopener noreferrer"
      className="footer-contact-icon"
      aria-label="Location"
    >
      <FaLocationArrow />
    </a>
  </div>
</div>
  </footer>
);

export default Footer;

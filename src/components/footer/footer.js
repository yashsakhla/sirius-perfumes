import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaLocationArrow
} from "react-icons/fa6";
import { BsChatDotsFill } from "react-icons/bs";
import "./footer.css";

const Footer = () => (
  <footer className="main-footer">
    <div className="footer-section footer-social">
      <div className="footer-title">We are at Social Media</div>
      <div className="footer-social-icons">
        <a href="https://www.instagram.com/siriusperfumes.official?igsh=MW56ZWtobzZqcmw0cw==" target="_blank" rel="noopener noreferrer" className="footer-icon">
          <FaInstagram />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
          <FaFacebookF />
        </a>
        <a href="https://wa.me/+919370917752" target="_blank" rel="noopener noreferrer" className="footer-icon">
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
        <img src={require("../../images/logo.png")} alt="" />
      </span>
      <div className="footer-copyright">
        &copy; {new Date().getFullYear()} Sirius. All rights reserved.
      </div>
    </div>
    <div className="footer-divider"></div>
<div className="footer-section footer-contact">
  <div className="footer-title">Contact Details</div>
<div className="footer-contact-rows">
  <a
    href="https://wa.me/+919370917752"
    target="_blank"
    rel="noopener noreferrer"
    className="footer-contact-row"
    aria-label="Chat with us on WhatsApp"
    title="Chat with us on WhatsApp"
  >
    <span className="footer-contact-row-icon"><FaWhatsapp size={22} /></span>
    <span className="footer-contact-row-content">
      <span className="footer-contact-row-title">Chat Us Anytime</span>
      <span className="footer-contact-row-value">+91 93709 17752</span>
    </span>
  </a>
  <a
    href="tel:+919370917752"
    className="footer-contact-row"
    aria-label="Call Us"
    title="Call us"
  >
    <span className="footer-contact-row-icon"><FaPhone size={22} /></span>
    <span className="footer-contact-row-content">
      <span className="footer-contact-row-title">Call Us</span>
      <span className="footer-contact-row-value">+91 93709 17752</span>
    </span>
  </a>
  <a
    href="mailto:siriusperfumes24@gmail.com"
    className="footer-contact-row"
    aria-label="Email"
    title="Email us"
  >
    <span className="footer-contact-row-icon"><FaEnvelope size={22} /></span>
    <span className="footer-contact-row-content">
      <span className="footer-contact-row-title">Mail Us</span>
      <span className="footer-contact-row-value">siriusperfumes24@gmail.com</span>
    </span>
  </a>
  <a
    href="https://www.google.com/maps/search/?api=1&query=123+Main+Street+Mumbai+India"
    target="_blank"
    rel="noopener noreferrer"
    className="footer-contact-row"
    aria-label="Find us on map"
    title="Find us on map"
  >
    <span className="footer-contact-row-icon"><FaLocationArrow size={22} /></span>
    <span className="footer-contact-row-content">
      <span className="footer-contact-row-title">Find Us</span>
      <span className="footer-contact-row-value">301,3rd floor royal tulip apartment,Nagpur,Maharashtra</span>
    </span>
  </a>
</div>
</div>
  </footer>
);

export default Footer;

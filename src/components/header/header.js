import React, { useEffect, useState } from "react";
import { FaShoppingBag, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../../services/cartContext"; // <-- import
import "./header.css";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { cart } = useCart(); // <-- use cart context

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
  }, [sidebarOpen]);

  // Calculate total items in cart
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
        <span className="logo">
          <img src={require("../../images/logo.png")} alt="" />
        </span>
        <nav className="header-nav">
          <div className="nav-row">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            {/* <Link to="/members">Exculsive Members</Link> */}
          </div>
          <div className="nav-row">
            <Link to="/cart" className="icon-link" aria-label="Bags">
              <FaShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <Link
              to="/login"
              className="icon-link"
              aria-label="Account"
              onClick={() => setSidebarOpen(false)}
            >
              <FaUser size={20} />
            </Link>
          </div>
        </nav>
        <button
          className="menu-toggle"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars size={24} />
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button
          className="close-btn"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        >
          <FaTimes size={24} />
        </button>
        <nav className="sidebar-nav">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            Home
          </Link>
          <Link to="/shop" onClick={() => setSidebarOpen(false)}>
            Shop
          </Link>
          {/* <Link to="/members" onClick={() => setSidebarOpen(false)}>
            Exculsive Members
          </Link> */}
          <Link
            to="/cart"
            className="icon-link"
            aria-label="Bags"
            onClick={() => setSidebarOpen(false)}
          >
             Bag
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <Link
            to="/login"
            className="icon-link"
            aria-label="Account"
            onClick={() => setSidebarOpen(false)}
          >
             Account
          </Link>
        </nav>
      </aside>
    </>
  );
}

export default Header;

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FaLeaf,
  FaFlask,
  FaCheck,
  FaInstagram,
  FaShippingFast,
  FaHeadset,
  FaBoxOpen
} from "react-icons/fa";
import { useCart } from "../../services/cartContext";
import Popup from "../popup/popup";
import Scrolltextbar from "../scroollingtextbar/scrollingtextbar";
import ProductCard from "../product-card/product-card";
import { getGroupedProducts } from "../../services/api";

import cat1 from "../../images/cat-1.jpg";
import cat2 from "../../images/cat-2.jpg";
import cat3 from "../../images/cat-3.jpg";
import cat4 from "../../images/cat-4.jpg";
import cat5 from "../../images/cat-5.jpg";
import "./home.css";
import Loader from "../loader/loader";
import { Link } from "react-router-dom";

import ShiningLoader from "../shiningLoader/ShiningLoader";


// 🎞️ Animation Variants
const bannerContentVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      when: "beforeChildren",
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      when: "beforeChildren",
      staggerChildren: 0.18,
    },
  },
};

const categoryCardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
};

const columnVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.18,
      duration: 0.7,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
};

// ✨ Static Categories for Grid
const categories = [
  { label: "Premium", title: "Floral", best: "Best For: Daytime, Spring", img: cat1 },
  { label: "Premium", title: "Woody", best: "Best For: Evening, Autumn", img: cat2 },
  { label: "Premium", title: "Fresh", best: "Best For: Summer, Everyday", img: cat3 },
  { label: "Premium", title: "Oriental", best: "Best For: Night, Winter", img: cat4 },
  { label: "Premium", title: "Citrus", best: "Best For: Sport, Morning", img: cat5 },
];

function Home() {
  const { addToCart, removeFromCart, cart } = useCart();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showShineLoader, setShowShineLoader] = useState(false);   // <-- New state
  const [showErrorPopup, setShowErrorPopup] = useState(false);     // <-- For popup

  const leftCategories = [categories[0], categories[1]];
  const centerCategory = categories[2];
  const rightCategories = [categories[3], categories[4]];

  useEffect(() => {
    setShowShineLoader(true);
    const fetchData = async () => {
      try {
        const data = await getGroupedProducts();
        setPerfumes(data);
        setShowShineLoader(false); // Hide popup if successful
      } catch (error) {
        setPerfumes([]);
        setShowErrorPopup(true);  // Show popup
      } finally {
        setShowShineLoader(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main>
      <Popup />
      <Scrolltextbar />

      {/* 🪄 Banner */}
      <motion.section
        className="banner-home"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div className="banner-content" variants={bannerContentVariants}>
          <motion.span className="banner-label" variants={itemVariants}>
            PERFUME COLLECTION
          </motion.span>
          <motion.h1 className="banner-header" variants={itemVariants}>
            Discover Your Signature Scent
          </motion.h1>
          <motion.p className="banner-desc" variants={itemVariants}>
            Elegant. Timeless. Unforgettable.
          </motion.p>
          <motion.div className="banner-buttons" variants={itemVariants}>
            <button className="btn-explore">EXPLORE NOW</button>
            <div className="btn-play-group">
              <span className="btn-play-text">PLAY VIDEO</span>
              <span className="btn-play-line"></span>
              <button className="btn-play">
                <span className="btn-play-wave"></span>
                <svg width="60" height="60" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="9" fill="#F7F3EF" />
                  <polygon points="7,5 13,9 7,13" fill="#000" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 🚚 Feature Bar */}
      <motion.div
        className="feature-bar-outer"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="feature-bar-line" />
        <div className="feature-bar-inner">
          <div className="feature-bar-item">
            <FaShippingFast className="feature-bar-icon" />
            <div>
              <div className="feature-bar-label">SHIPPING</div>
              <div>
                <span className="feature-bar-bold">Free Shipping Worldwide</span>
              </div>
            </div>
          </div>
          <div className="feature-bar-separator" />
          <div className="feature-bar-item">
            <FaHeadset className="feature-bar-icon" />
            <div>
              <div className="feature-bar-label">HASSLE FREE</div>
              <div>
                <span className="feature-bar-bold">24×7 Customer Support</span>
              </div>
            </div>
          </div>
          <div className="feature-bar-separator" />
          <div className="feature-bar-item">
            <FaBoxOpen className="feature-bar-icon" />
            <div>
              <div className="feature-bar-label">SECURE</div>
              <div>
                <span className="feature-bar-bold">Safe Packaging</span>
              </div>
            </div>
          </div>
        </div>
        <div className="feature-bar-line" />
      </motion.div>

      {/* 🧴 Perfume Product Categories (From API) */}
      <motion.section
        className="perfume-section"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        style={{ position: "relative" }} // needed for loader overlay positioning
      >
        {showShineLoader && (
          <div className="shining-loader-overlay">
            <ShiningLoader />
          </div>
        )}

        {!showShineLoader  && perfumes.map((group, i) => (
          <motion.div
            className="container"
            key={i}
            variants={columnVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={i}
          >
            <h2>{group.category}</h2>
            <div className="card-row">
              {group.products.map((product, j) => {
                const cartItem = cart.find((item) => item._id === product._id);
                const qty = cartItem ? cartItem.qty : 0;
                return (
                  <ProductCard
                    key={product._id}
                    product={product}
                    qty={qty}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    className="visible"
                    index={j}
                  />
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* 🎨 Perfume Categories Grid */}
      <motion.section
        className="perfume-categories"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="categories-grid">
          {/* Left column */}
          <div className="category-col">
            {leftCategories.map((cat, i) => (
              <motion.div
                key={cat.title}
                className="category-card"
                style={{ backgroundImage: `url('${cat.img}')` }}
                variants={categoryCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={i}
              >
                <div className="category-overlay">
                  <span className="category-label">{cat.label}</span>
                  <h3 className="category-title">{cat.title}</h3>
                  <p className="category-best">{cat.best}</p>
                  <Link to="/shop" className="category-btn">
  View Categories
</Link>
                </div>
                <span className="shine" />
              </motion.div>
            ))}
          </div>

          {/* Center column */}
          <div className="category-col center-col">
            <motion.div
              className="category-card center-card"
              style={{ backgroundImage: `url('${centerCategory.img}')` }}
              variants={categoryCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={2}
            >
              <div className="category-overlay">
                <span className="category-label">{centerCategory.label}</span>
                <h3 className="category-title">{centerCategory.title}</h3>
                <p className="category-best">{centerCategory.best}</p>
                <Link to="/shop" className="category-btn">
  View Categories
</Link>
              </div>
              <span className="shine" />
            </motion.div>
          </div>

          {/* Right column */}
          <div className="category-col">
            {rightCategories.map((cat, i) => (
              <motion.div
                key={cat.title}
                className="category-card"
                style={{ backgroundImage: `url('${cat.img}')` }}
                variants={categoryCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={3 + i}
              >
                <div className="category-overlay">
                  <span className="category-label">{cat.label}</span>
                  <h3 className="category-title">{cat.title}</h3>
                  <p className="category-best">{cat.best}</p>
                  <Link to="/shop" className="category-btn">
  View Categories
</Link>
                </div>
                <span className="shine" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Market Stats */}
      <motion.section
        className="market-stats"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="market-bg"></div>
        <div className="market-content">
          <span className="market-label">BEST IN MARKET</span>
          <h2 className="market-title">Healthiest Cosmetics</h2>
          <div className="market-stats-row">
            <div className="market-stat">
              <span className="market-stat-value">
                4300<span className="market-stat-unit">K</span>
              </span>
              <div className="market-stat-label">Products Sold</div>
            </div>
            <div className="market-divider"></div>
            <div className="market-stat">
              <span className="market-stat-value">
                99.99<span className="market-stat-unit">%</span>
              </span>
              <div className="market-stat-label">Satisfaction Guranteed</div>
            </div>
            <div className="market-divider"></div>
            <div className="market-stat">
              <span className="market-stat-value">
                42<span className="market-stat-unit">K</span>
              </span>
              <div className="market-stat-label">Customers Satisfied</div>
            </div>
            <div className="market-divider"></div>
            <div className="market-stat">
              <span className="market-stat-value">
                0.01<span className="market-stat-unit">%</span>
              </span>
              <div className="market-stat-label">Defective Returns</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Instagram Section */}
      <motion.section
        className="insta-section"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="insta-img insta-img-left">
          <div className="insta-hover">
            <FaInstagram className="insta-icon" size={20} />
          </div>
          <img src={require("../../images/insta-1.jpg")} alt="" />
        </div>
        <div className="insta-img insta-img-left">
          <div className="insta-hover">
            <FaInstagram className="insta-icon" size={20} />
          </div>
          <img src={require("../../images/insta-2.jpg")} alt="" />
        </div>
        <div className="insta-content">
          <span className="insta-label">INSTA SHOP</span>
          <h2 className="insta-title">Tag Us on Instagram</h2>
          <p className="insta-desc">
            Praesent in nunc vel urna consequat mattis eget vel libero.
            Phasellus pellentesque Proin tempus tempor diam.
          </p>
        </div>
        <div className="insta-img insta-img-right">
          <div className="insta-hover">
            <FaInstagram className="insta-icon" size={20} />
          </div>
          <img src={require("../../images/insta-3.jpg")} alt="" />
        </div>
        <div className="insta-img insta-img-right">
          <div className="insta-hover">
            <FaInstagram className="insta-icon" size={20} />
          </div>
          <img src={require("../../images/insta-4.jpg")} alt="" />
        </div>
      </motion.section>
    </main>
  );
}

export default Home;

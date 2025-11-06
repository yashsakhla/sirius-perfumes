import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";
import "./product-card.css";

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
};

function ProductCard({
  product,
  qty,
  addToCart,
  removeFromCart,
  className,
  index = 0,
}) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const isSoldOut = product.active === false; // Adjust this logic based on your API flag

  return (
    <motion.div
      className={`product-card ${className} ${isSoldOut ? "sold-out" : ""}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      {/* Image with overlays */}
      <div className="image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className={`product-image ${isSoldOut ? "dimmed" : ""}`}
        />

        {/* Top-left "SOLD OUT" */}
        {isSoldOut && (
          <motion.div
            className="sold-out-top"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            SOLD OUT
          </motion.div>
        )}

        {/* Bottom overlay message */}
        {isSoldOut && (
          <motion.div
            className="sold-out-bottom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            New stock arriving soon. Stay tuned!
          </motion.div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-detail-row">
        <div className="left">
          <h3>{product.name}</h3>
          <p>{product.size} Bottle</p>
          <div className="price-row">
            {product.basicPrice &&
            product.discountedPrice &&
            product.basicPrice !== product.discountedPrice ? (
              <>
                <div className="actual-price">
                  ₹{Number(product.basicPrice).toFixed(2)}
                </div>
                <div className="discounted-price">
                  ₹{Number(product.discountedPrice).toFixed(2)}
                </div>
              </>
            ) : (
              <div className="discounted-price">
                ₹{Number(product.discountedPrice ?? product.price).toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Cart Actions */}
        <div className="cart-actions">
          {qty === 0 ? (
            <button
              className="add-button"
              onClick={() => addToCart(product)}
              disabled={isSoldOut}
            >
              ADD <FaArrowUp size={15} className="arrow-icon" />
            </button>
          ) : (
            <div className="add-remove-group">
              <button
                className="remove-button"
                onClick={() => removeFromCart(product)}
                disabled={isSoldOut}
              >
                -
              </button>
              <span className="product-qty">{qty}</span>
              <button
                className="add-more-button"
                onClick={() => addToCart(product)}
                disabled={isSoldOut}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div
        className={`product-desc${showFullDesc ? " expanded" : ""}`}
        onClick={() => setShowFullDesc(!showFullDesc)}
        title={showFullDesc ? "Click to collapse" : "Click to expand"}
      >
        {product.description || "No description available."}
      </div>
    </motion.div>
  );
}

export default ProductCard;

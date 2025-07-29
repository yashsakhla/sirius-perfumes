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
      ease: [0.23, 1, 0.32, 1]
    }
  }),
};

function ProductCard({ product, qty, addToCart, removeFromCart, className, index = 0 }) {
  return (
    <motion.div
      className={`product-card ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <img src={require(`../../images/product-2.webp`)} alt={product.name} />
      <div className="product-detail-row">
        <div className="left">
          <h3>{product.name}</h3>
          <p>{product.size} Bottle</p>
          <p className="price">₹ {product.price}</p>
        </div>
        <div className="cart-actions">
          {console.log(qty)}
          {qty === 0 ? (
            <button className="add-button" onClick={() => addToCart(product)}>
              ADD <FaArrowUp size={15} className="arrow-icon"/>
            </button>
          ) : (
            <div className="add-remove-group">
              <button className="remove-button" onClick={() => removeFromCart(product)}>
                -
              </button>
              <span className="product-qty">{qty}</span>
              <button className="add-more-button" onClick={() => addToCart(product)}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowUp, FaStar, FaGift } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../services/cartContext";
import {
  normalizeSizeEntries,
  getPriceForSize,
  resolveSizeLabel,
} from "../../utils/productSizes";
import { isGiftProduct } from "../../utils/giftProduct";
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
  qty: _qtyProp,
  addToCart,
  removeFromCart,
  className,
  index = 0,
}) {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const isSoldOut = product.active === false; // Adjust this logic based on your API flag
  const isGift = isGiftProduct(product);

  const imageUrls = useMemo(() => {
    const urls =
      Array.isArray(product?.images) && product.images.length
        ? product.images
        : product?.image
        ? [product.image]
        : [];
    // ensure strings and remove empties
    return urls.filter((u) => typeof u === "string" && u.trim());
  }, [product?._id, product?.images, product?.image]);

  const sizeEntries = normalizeSizeEntries(product);
  const firstSize = sizeEntries[0]?.size ?? "";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(firstSize);
  const carouselRef = useRef(null);
  const pauseUntilRef = useRef(0);

  const location = useLocation();
  const averageRating =
    product?.averageRating ?? product?.avgRating ?? product?.rating ?? null;
  const totalReviews =
    product?.totalReviews ?? product?.reviewCount ?? product?.reviewsCount ?? null;

  useEffect(() => {
    const next = normalizeSizeEntries(product);
    const keys = next.map((e) => e.size);
    setSelectedSize((prev) => {
      if (prev && keys.includes(prev)) return prev;
      return keys[0] || "";
    });
    setCurrentImageIndex(0);
  }, [product]);

  useEffect(() => {
    if (imageUrls.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now < pauseUntilRef.current) return;

      const nextIndex = (currentImageIndex + 1) % imageUrls.length;
      const el = carouselRef.current;
      if (!el) return;
      const slideWidth = el.clientWidth || 0;
      el.scrollTo({ left: nextIndex * slideWidth, behavior: "smooth" });
    }, 2500);

    return () => clearInterval(intervalId);
  }, [product?._id, imageUrls.length, currentImageIndex]);

  const effectiveSize = selectedSize || firstSize;
  const displayPrice = getPriceForSize(product, effectiveSize);
  const cartItem = cart.find(
    (item) =>
      item._id === product._id &&
      String(item.size ?? "").trim() === String(effectiveSize ?? "").trim()
  );
  const qty = cartItem ? cartItem.qty : 0;

  const cartLine = { _id: product._id, size: effectiveSize };

  const handleCarouselUserIntent = () => {
    // pause auto-scroll briefly after user interaction
    pauseUntilRef.current = Date.now() + 4000;
  };

  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const slideWidth = el.clientWidth || 1;
    const idx = Math.round(el.scrollLeft / slideWidth);
    const nextIdx = Math.min(Math.max(idx, 0), Math.max(imageUrls.length - 1, 0));
    if (nextIdx !== currentImageIndex) setCurrentImageIndex(nextIdx);
  };

  const handleOpenDetail = () => {
    if (!product?._id) return;
    navigate(`/product/${product._id}`, {
      state: { product, from: location.pathname },
    });
  };

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const goCustomizeGift = (e) => {
    e.stopPropagation();
    if (!product?._id) return;
    navigate(`/product/${product._id}`, {
      state: { product, from: location.pathname, focusCustomize: true },
    });
  };

  return (
    <motion.div
      className={`product-card ${className} ${isSoldOut ? "sold-out" : ""}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="product-card-surface">
      {/* Image with overlays */}
      <div className="image-wrapper" onClick={handleOpenDetail}>
        <div
          className="product-card-carousel"
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          onPointerDown={handleCarouselUserIntent}
          onWheel={handleCarouselUserIntent}
          aria-label={`${product.name} images`}
        >
          {imageUrls.length > 0 ? (
            imageUrls.map((url, idx) => (
              <div className="product-card-slide" key={`${url}-${idx}`}>
                <img
                  src={url}
                  alt={`${product.name} - ${idx + 1}`}
                  className={`product-image ${isSoldOut ? "dimmed" : ""}`}
                  draggable="false"
                  loading="lazy"
                />
              </div>
            ))
          ) : (
            <div className="product-card-slide">
              {typeof product?.image === "string" && product.image.trim() ? (
                <img
                  src={product.image.trim()}
                  alt={product.name}
                  className={`product-image ${isSoldOut ? "dimmed" : ""}`}
                  draggable="false"
                />
              ) : (
                <div
                  className={`product-image product-image--empty ${isSoldOut ? "dimmed" : ""}`}
                  role="img"
                  aria-label={`${product.name} — no image`}
                />
              )}
            </div>
          )}
        </div>

        {/* Top-right rating badge */}
        {typeof averageRating === "number" && averageRating > 0 && (
          <div className="product-rating-badge">
            <FaStar className="product-rating-badge-icon" />
            <span className="product-rating-badge-value">
              {averageRating.toFixed(1)}
            </span>
            {typeof totalReviews === "number" && totalReviews > 0 && (
              <span className="product-rating-badge-count">
                ({totalReviews})
              </span>
            )}
          </div>
        )}

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
        {isGift && !isSoldOut && (
          <button
            type="button"
            className="product-card-customize-chip"
            onClick={goCustomizeGift}
          >
            <FaGift size={12} aria-hidden />
            Customize
          </button>
        )}

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
        <div className="left" onClick={handleOpenDetail}>
          <h3>{product.name}</h3>
          {sizeEntries.length > 0 && (
            <div
              className="product-card-size-row"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span className="product-card-size-label">Size</span>
              <select
                className="product-card-size-select"
                value={effectiveSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                aria-label="Choose bottle size"
              >
                {sizeEntries.map((entry, idx) => {
                  const optValue = resolveSizeLabel(entry.size);
                  if (!optValue) return null;
                  return (
                    <option key={`${optValue}-${idx}`} value={optValue}>
                      {optValue}
                    </option>
                  );
                })}
              </select>
              <span className="product-card-size-suffix">Bottle</span>
            </div>
          )}
          {/* <div className="price-row">
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
          </div> */}
          <div
            className="discounted-price"
            aria-live="polite"
            aria-atomic="true"
          >
            ₹{displayPrice.toFixed(2)}
          </div>
        </div>

        <div className="product-desc-wrap">
          <div className="product-desc-label">About</div>
          <div
            className={`product-desc${showFullDesc ? " expanded" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowFullDesc(!showFullDesc);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowFullDesc(!showFullDesc);
              }
            }}
            title={showFullDesc ? "Click to collapse" : "Click to expand full text"}
          >
            {product.description || "No description available."}
          </div>
        </div>

        {/* Cart Actions */}
        <div className="cart-actions" onClick={(e) => e.stopPropagation()}>
          {isGift ? (
            <button
              type="button"
              className="add-button product-card-customize-cta"
              onClick={goCustomizeGift}
              disabled={isSoldOut}
            >
              <span className="add-button-text">Customize gift</span>
              <FaGift size={16} className="add-button-icon" aria-hidden />
            </button>
          ) : qty === 0 ? (
            <button
              className="add-button"
              onClick={() => addToCart(product, effectiveSize)}
              disabled={isSoldOut}
            >
              <span className="add-button-text">Add to bag</span>
              <FaArrowUp size={15} className="add-button-icon arrow-icon" aria-hidden />
            </button>
          ) : (
            <div className="add-remove-group">
              <button
                className="remove-button"
                onClick={() => removeFromCart(cartLine)}
                disabled={isSoldOut}
              >
                -
              </button>
              <span className="product-qty">{qty}</span>
              <button
                className="add-more-button"
                onClick={() => addToCart(product, effectiveSize)}
                disabled={isSoldOut}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
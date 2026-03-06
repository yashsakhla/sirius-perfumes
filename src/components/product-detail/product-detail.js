import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaShoppingBag,
  FaCreditCard,
  FaWhatsapp,
  FaStar,
  FaArrowLeft,
  FaPaperPlane,
  FaCrown,
} from "react-icons/fa";
import { useCart } from "../../services/cartContext";
import { useUser } from "../../services/userContext";
import { getAllProducts, getProductReviews, submitProductReview } from "../../services/api";
import ShiningLoader from "../shiningLoader/ShiningLoader";
import "./product-detail.css";

const pageVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

const WHATSAPP_NUMBER = "919370917752";
const REVIEWS_PER_PAGE = 6;

function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart } = useCart();
  const { user } = useUser();

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(location.state?.product?.size || "");

  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [ratingInput, setRatingInput] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);

  useEffect(() => {
    if (product || !id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const allProducts = await getAllProducts();
        const found = allProducts.find((p) => p._id === id);
        if (!found) {
          setError("Product not found.");
        } else {
          setProduct(found);
          setSelectedSize(found.size || "");
        }
      } catch (err) {
        console.error("Failed to load product", err);
        setError("Unable to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, product]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!product?._id) return;
      try {
        setReviewsLoading(true);
        setReviewsError(null);
        const data = await getProductReviews(product._id);
        setReviewSummary(data);
        setCurrentReviewPage(1);
      } catch (err) {
        setReviewsError("Unable to load reviews right now.");
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [product]);

  const cartItem = cart.find((item) => item._id === product?._id);
  const qty = cartItem ? cartItem.qty : 0;
  const isSoldOut = product?.active === false;
  const isLoggedIn = Boolean(user);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product);
    navigate("/cart");
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const sizeLabel = selectedSize || product.size || "";
    const priceText = isNaN(finalPrice) ? "" : `Price: ₹${finalPrice.toFixed(2)}\n`;
    const message = encodeURIComponent(
      `Hi, I would like to know more about this perfume:\n${product.name}${
        sizeLabel ? ` (${sizeLabel})` : ""
      }\n${priceText}Link: ${window.location.href}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }
    if (!ratingInput || ratingInput < 1 || ratingInput > 5) {
      return;
    }
    if (!reviewText.trim()) {
      return;
    }
    try {
      setSubmittingReview(true);
      const payload = {
        rating: ratingInput,
        comment: reviewText.trim(),
        size: selectedSize || product.size || null,
      };
      await submitProductReview(product._id, payload);

      // Refresh reviews so the newly submitted one appears with others
      try {
        const fresh = await getProductReviews(product._id);
        setReviewSummary(fresh);
        setCurrentReviewPage(1);
      } catch {
        // If refresh fails, keep previous reviews but don't break the page
      }

      setRatingInput(0);
      setReviewText("");
    } catch (err) {
      setReviewsError("Unable to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <main className="product-detail-page loading">
        <ShiningLoader />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-page">
        <div className="product-detail-container">
          <p className="product-detail-error">{error || "Product not found."}</p>
          <button className="product-detail-back-btn" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const basePrice =
    product.basicPrice && product.discountedPrice
      ? Number(product.basicPrice)
      : Number(product.discountedPrice ?? product.price ?? 0);

  const finalPrice = Number(product.discountedPrice ?? product.price ?? 0);

  const sizeOptions =
    Array.isArray(product.sizes) && product.sizes.length
      ? product.sizes
      : [product.size].filter(Boolean);

  const totalReviews = reviewSummary?.reviews?.length || 0;
  const totalReviewPages = totalReviews ? Math.ceil(totalReviews / REVIEWS_PER_PAGE) : 1;
  const safeCurrentPage =
    currentReviewPage > totalReviewPages ? totalReviewPages : currentReviewPage;
  const reviewStartIndex = (safeCurrentPage - 1) * REVIEWS_PER_PAGE;
  const currentPageReviews =
    reviewSummary?.reviews?.slice(
      reviewStartIndex,
      reviewStartIndex + REVIEWS_PER_PAGE
    ) || [];

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-detail-breadcrumb">
          <Link to="/home" className="product-detail-crumb">
            Home
          </Link>
          <span className="product-detail-crumb-sep">/</span>
          <Link to="/shop" className="product-detail-crumb">
            Shop
          </Link>
          <span className="product-detail-crumb-sep">/</span>
          <span className="product-detail-crumb current">{product.name}</span>
        </div>

        <motion.div
          className="product-detail-content"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="product-detail-left"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="product-detail-image-wrapper">
              <img
                src={product.image}
                alt={product.name}
                className="product-detail-image"
              />
              {isSoldOut && <div className="product-detail-sold-out">SOLD OUT</div>}
            </div>
          </motion.div>

          <div className="product-detail-right">
            <span className="product-detail-label">
              {product.category || "SIRIUS PERFUMES"}
            </span>
            <h1 className="product-detail-title">{product.name}</h1>
            {product.size && (
              <p className="product-detail-subtitle">{product.size} Bottle</p>
            )}

            {sizeOptions.length > 0 && (
              <div className="product-detail-size-row">
                <label className="product-detail-size-label" htmlFor="size-select">
                  Size
                </label>
                <select
                  id="size-select"
                  className="product-detail-size-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {sizeOptions.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="product-detail-price-row">
              {product.basicPrice &&
              product.discountedPrice &&
              product.basicPrice !== product.discountedPrice ? (
                <>
                  <span className="product-detail-price-actual">
                    ₹{basePrice.toFixed(2)}
                  </span>
                  <span className="product-detail-price-final">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="product-detail-price-final">
                  ₹{finalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="product-detail-tax-note">Inclusive of all taxes</p>

            <div className="product-detail-actions">
              {qty === 0 ? (
                <button
                  className="product-detail-add-btn"
                  onClick={() => addToCart(product)}
                  disabled={isSoldOut}
                >
                  <FaShoppingBag className="product-detail-btn-icon" aria-hidden />
                  Add to Bag
                </button>
              ) : (
                <div className="product-detail-qty-group">
                  <button
                    className="qty-btn"
                    onClick={() => removeFromCart(product)}
                    disabled={isSoldOut}
                  >
                    -
                  </button>
                  <span className="qty-value">{qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => addToCart(product)}
                    disabled={isSoldOut}
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <div className="product-detail-secondary-actions">
              <button
                className="product-detail-buy-btn"
                onClick={handleBuyNow}
                disabled={isSoldOut}
              >
                <FaCreditCard className="product-detail-btn-icon" aria-hidden />
                Buy Now
              </button>
              <button
                className="product-detail-whatsapp-btn"
                type="button"
                onClick={handleWhatsApp}
              >
                <FaWhatsapp className="product-detail-btn-icon" aria-hidden />
                Shop on WhatsApp
              </button>
            </div>

            <div className="product-detail-description-block">
              <h2 className="product-detail-section-title">Description</h2>
              <p className="product-detail-description">
                {product.description ||
                  "Experience a long-lasting, premium fragrance crafted to elevate your everyday moments."}
              </p>
            </div>

            <div className="product-detail-meta-row">
              {product.category && (
                <div className="product-detail-meta-item">
                  <span className="meta-label">Category</span>
                  <span className="meta-value">{product.category}</span>
                </div>
              )}
              {product.size && (
                <div className="product-detail-meta-item">
                  <span className="meta-label">Size</span>
                  <span className="meta-value">{product.size}</span>
                </div>
              )}
            </div>

            <div className="product-detail-reviews">
              <h2 className="product-detail-section-title">Reviews & Ratings</h2>
              {reviewsLoading && <p className="product-detail-reviews-text">Loading reviews...</p>}
              {reviewsError && (
                <p className="product-detail-reviews-error">{reviewsError}</p>
              )}
              {reviewSummary && (
                <div className="product-detail-reviews-summary">
                  <div className="reviews-average">
                    <span className="reviews-score">
                      {Number(reviewSummary.averageRating || 0).toFixed(1)}
                    </span>
                    <span className="reviews-stars">
                      {"★".repeat(Math.round(reviewSummary.averageRating || 0)).padEnd(
                        5,
                        "☆"
                      )}
                    </span>
                  </div>
                  <div className="reviews-count">
                    {reviewSummary.ratingCount || 0} reviews
                  </div>
                </div>
              )}

              {reviewSummary?.reviews?.length > 0 && (
                <>
                  <div className="product-detail-reviews-list">
                    {currentPageReviews.map((rev) => {
                      const name = rev.user.name || "";
                      const initials = name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join("");
                      return (
                        <div className="review-card" key={rev._id || rev.id}>
                          <div className="review-header">
                            <div className="review-header-left">
                              {rev.userImage ? (
                                <img
                                  src={rev.userImage}
                                  alt={name}
                                  className="review-avatar"
                                />
                              ) : (
                                <div className="review-avatar fallback">
                                  {initials || "U"}
                                </div>
                              )}
                              <div className="review-user-meta">
                                <span className="review-user-name">
                                  {name}
                                  {rev.isPremiumUser && (
                                    <FaCrown
                                      className="review-premium-icon"
                                      aria-label="Premium user"
                                    />
                                  )}
                                </span>
                              </div>
                            </div>
                            <span className="review-rating">
                              {"★".repeat(rev.rating || 0).padEnd(5, "☆")}
                            </span>
                          </div>
                          {rev.comment && (
                            <p className="review-comment">{rev.comment}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {totalReviewPages > 1 && (
                    <div className="reviews-pagination">
                      <button
                        type="button"
                        className="reviews-page-btn prev-next"
                        disabled={safeCurrentPage === 1}
                        onClick={() =>
                          setCurrentReviewPage((page) => Math.max(1, page - 1))
                        }
                      >
                        Prev
                      </button>
                      {Array.from({ length: totalReviewPages }, (_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            className={`reviews-page-btn${
                              pageNum === safeCurrentPage ? " active" : ""
                            }`}
                            onClick={() => setCurrentReviewPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        className="reviews-page-btn prev-next"
                        disabled={safeCurrentPage === totalReviewPages}
                        onClick={() =>
                          setCurrentReviewPage((page) =>
                            Math.min(totalReviewPages, page + 1)
                          )
                        }
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}

              {isLoggedIn ? (
                <form className="product-detail-review-form" onSubmit={handleSubmitReview}>
                  <div className="review-form-row">
                    <span className="review-form-label">Your Rating</span>
                    <div
                      className="review-star-rating"
                      role="group"
                      aria-label="Rate 1 to 5 stars"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || ratingInput) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            className="review-star-btn"
                            onClick={() => setRatingInput(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setRatingInput(star);
                              }
                            }}
                            aria-label={`${star} star${star > 1 ? "s" : ""}`}
                            aria-pressed={ratingInput >= star}
                          >
                            <FaStar
                              className={`review-star-icon ${active ? "filled" : "empty"}`}
                              aria-hidden
                            />
                          </button>
                        );
                      })}
                    </div>
                    {ratingInput > 0 && (
                      <span className="review-star-label">
                        {ratingInput === 5 && "Excellent"}
                        {ratingInput === 4 && "Good"}
                        {ratingInput === 3 && "Average"}
                        {ratingInput === 2 && "Below average"}
                        {ratingInput === 1 && "Poor"}
                      </span>
                    )}
                  </div>
                  <div className="review-form-row">
                    <label htmlFor="review-text" className="review-form-label">
                      Your Review
                    </label>
                    <textarea
                      id="review-text"
                      className="review-textarea"
                      rows={4}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience with this fragrance..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="review-submit-btn"
                    disabled={submittingReview || ratingInput < 1}
                  >
                    <FaPaperPlane className="product-detail-btn-icon" aria-hidden />
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="product-detail-reviews-login">
                  <p>You need to be logged in to write a review.</p>
                  <Link to="/login" className="product-detail-login-link">
                    Login to review
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <button className="product-detail-back-link" onClick={handleBack}>
          <FaArrowLeft className="product-detail-btn-icon" aria-hidden />
          Back
        </button>
      </div>
    </main>
  );
}

export default ProductDetail;


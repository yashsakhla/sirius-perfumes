import React, { useEffect, useState } from "react";
import { FaShoppingBag, FaTrashAlt, FaShoppingCart, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import { useCart } from "../../services/cartContext";
import { getCartPrice, submitOrder } from "../../services/api";
import { indianStatesAndCities } from "../../constants/location";
import { updateAccountDetails } from "../../services/api"; 
import { Link } from "react-router-dom";
import "./cart.css";

const bannerContentVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, when: "beforeChildren", staggerChildren: 0.15 }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  // inside your component
const [loading, setLoading] = useState(false);
// Assuming you have user and account state, else get from context or props
const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("googleUser")) || {});
const [account, setAccount] = useState(() => JSON.parse(localStorage.getItem("accountDetails")) || {});

  // Coupon, discount, payment
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedOfferCode, setAppliedOfferCode] = useState(null);


  // Address
  const [address, setAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    line1: "",
    line2: "",
    state: "",
    city: "",
    pincode: ""
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryAllowed, setDeliveryAllowed] = useState(true);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Price Summary
  const [priceSummary, setPriceSummary] = useState({
    subtotal: 0,
    tax: 0,
    deliveryCharges: 0,
    total: 0
  });

  // Login
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load account address and login status from localStorage
  useEffect(() => {
    const googleUser = localStorage.getItem("googleUser");
    const account = JSON.parse(localStorage.getItem("accountDetails") || "{}");
    setIsLoggedIn(!!googleUser && !!account);
    if (account?.address) {
      setAddress(account.address);
      setAddressForm(account.address);
    }
  }, []);

  // Update price from backend whenever cart or coupon changes  
useEffect(() => {
  const fetchPrice = async () => {
    try {
      if (!cart.length) {
        setPriceSummary({ subtotal: 0, tax: 0, deliveryCharges: 0, total: 0 });
        setDiscount(0);
        setCouponApplied(false);
        setAppliedOfferCode(null);
        return;
      }
      const res = await getCartPrice({
        products: cart.map(item => ({ productId: item._id, qty: item.qty })),
        couponCode: couponApplied ? coupon : ""
      });

      setPriceSummary({
        subtotal: res.subtotal,
        tax: res.tax || 0,
        deliveryCharges: res.deliveryCharges || 0,
        total: res.total
      });
      setDiscount(res.discount || 0);
      setAppliedOfferCode(res.couponApplied || null);

      if (couponApplied && (!res.discount || res.discount === 0)) {
        setCouponApplied(false);
        setDiscount(0);
        setAppliedOfferCode(null);
        alert("Coupon is invalid or expired");
      }
    } catch (e) {
      setDiscount(0);
      setCouponApplied(false);
      setAppliedOfferCode(null);
    }
  };

  fetchPrice();
}, [cart, couponApplied, coupon]);

  // Apply coupon by setting couponApplied flag to true (triggers price update)
  const handleApplyCoupon = () => {
    if (!coupon) {
      alert("Please enter a coupon code");
      return;
    }
    setCouponApplied(true);
  };

  const handleRemoveCoupon = () => {
    setCoupon("");
    setCouponApplied(false);
    setDiscount(0);
  };

  const handleSubmitOrder = async () => {
    // Added check for valid city and pincode
    if (
      cart.length === 0 ||
      !address ||
      !address.city ||
      !address.pincode ||
      !deliveryAllowed
    ) {
      alert(
        "⚠ Please add products to your cart and provide a valid shipping address."
      );
      return;
    }

    try {
      const orderPayload = {
        products: cart.map((item) => `${item.name} (x${item.qty})`),
        coupon: couponApplied ? coupon : "",
        offer: "",
        totalPrice: priceSummary.total,
        paymentMode: paymentMethod === "COD" ? "Cash" : paymentMethod
      };

      await submitOrder(orderPayload);
      alert("🎉 Your product has been ordered successfully!");
      clearCart();

      setCoupon("");
      setCouponApplied(false);
      setDiscount(0);
      setAddress(null);
    } catch (error) {
      console.error("❌ Error submitting order:", error);
      alert("❌ Failed to place order. Please try again later.");
    }
  };

  // Save address, check deliverability
const handleAddressSave = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {
    // Call your API to update the address with current form data
    const updated = await updateAccountDetails({ address: addressForm });

    // Update local states
    setAddress(updated.address);
    setAddressForm(updated.address);

    // Update account and user states if applicable
    setAccount((prev) => ({ ...prev, address: updated.address }));
    setUser((prev) => ({ ...prev, address: updated.address }));

    // Update localStorage copies
    localStorage.setItem("googleUser", JSON.stringify({ ...user, address: updated.address }));
    localStorage.setItem("accountDetails", JSON.stringify({ ...account, address: updated.address }));

    // Close the edit address form
    setShowAddressForm(false);  // or if using setEditAddress, use that
  } catch (error) {
    alert("Failed to update address");
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  const canCheckout =
    cart.length > 0 &&
    address &&
    address.city &&
    address.pincode &&
    deliveryAllowed;

  return (
    <div className="cart-page">
      {/* Banner */}
      <section className="banner">
        <motion.div
          className="banner-content"
          variants={bannerContentVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="banner-label" variants={itemVariants}>
            SIRIUS PERFUMES
          </motion.span>
          <motion.h1 className="banner-header" variants={itemVariants}>
            CART <FaShoppingBag size={40} />
          </motion.h1>
          <motion.p className="banner-desc" variants={itemVariants}>
            YOUR SELECTED FRAGRANCES
          </motion.p>
        </motion.div>
      </section>

      {/* Main Content */}
      <div className="cart-content">
        <section className="cart-products">
          <h2 className="cart-section-title">Your Cart</h2>

          {cart.length === 0 ? (
            <div className="cart-empty-full">
              <FaShoppingCart size={80} className="cart-empty-icon" />
              <div>Your cart is empty.</div>
            </div>
          ) : (
            <div
              className="cart-products-list-wrapper"
              style={{ position: "relative" }}
            >
              <div
                className="cart-products-list"
                style={{
                  filter: isLoggedIn ? "none" : "blur(2px)",
                  pointerEvents: isLoggedIn ? "auto" : "none"
                }}
              >
                {cart.map((item) => (
                  <div className="product-cart-card" key={item._id}>
                    <img
                      src={require(`../../images/product-2.webp`)}
                      alt={item.name}
                      className="product-cart-img"
                    />
                    <div className="product-cart-title-row">
                      <div className="product-cart-title">{item.name}</div>
                      <button
                        className="product-cart-delete"
                        onClick={() => isLoggedIn && removeFromCart(item)}
                        aria-label="Remove from cart"
                        disabled={!isLoggedIn}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                    <div className="product-cart-divider" />
                    <div className="product-cart-row-2col">
                      <div className="product-cart-price-col">
                        <div className="product-cart-label">Price</div>
                        <div className="product-cart-price">₹ {item.price}</div>
                      </div>
                      <div className="product-cart-qty-col">
                        <div className="product-cart-label">Quantity</div>
                        <div className="product-cart-qty">
                          <button
                            onClick={() => isLoggedIn && removeFromCart(item)}
                            disabled={!isLoggedIn}
                          >
                            -
                          </button>
                          <span>{item.qty}</span>
                          <button
                            onClick={() => isLoggedIn && addToCart(item)}
                            disabled={!isLoggedIn}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="product-cart-total-row">
                      <span className="product-cart-label">Total</span>
                      <span className="product-cart-subtotal">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {!isLoggedIn && (
                <div className="cart-lock-overlay">
                  <FaLock size={48} />
                  <p>Please login to access your cart.</p>
                  <Link to="/login" className="cart-login-btn">
                    Login
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Show coupon, address, payment and cart summary only if cart not empty */}
          {cart.length > 0 && isLoggedIn && (
            <>
              {/* Coupon Block */}
              <div className="cart-coupon-block">
                <input
                  className="cart-coupon-input"
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    if (couponApplied) {
                      setCouponApplied(false);
                      setDiscount(0);
                    }
                  }}
                  disabled={couponApplied}
                />
                <button
                  className="cart-coupon-btn"
                  onClick={handleApplyCoupon}
                  disabled={couponApplied || !coupon}
                >
                  {couponApplied ? "Applied" : "Apply"}
                </button>
                {couponApplied && (
                  <button
                    className="cart-coupon-remove-btn"
                    onClick={handleRemoveCoupon}
                    type="button"
                    aria-label="Remove coupon"
                  >
                    Remove
                  </button>
                )}
                {couponApplied && discount > 0 && (
                  <div className="cart-coupon-success">
                    Coupon applied: -₹{discount.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Address Block */}
              <div className="cart-address-block">
                <div className="cart-address-title">Shipping Address</div>
                {address && !showAddressForm ? (
                  <div className="cart-address-view">
                    <div>{address.line1}</div>
                    <div>{address.line2}</div>
                    <div>
                      {address.city}, {address.state} - {address.pincode}
                    </div>
                    {!deliveryAllowed && (
                      <div className="not-deliverable">
                        ❌ We can't deliver here
                      </div>
                    )}
                    <button
                      className="cart-address-edit-btn"
                      onClick={() => setShowAddressForm(true)}
                    >
                      Edit Address
                    </button>
                  </div>
                ) : (
                  <form
                    className="cart-address-form"
                    onSubmit={handleAddressSave}
                  >
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={addressForm.line1}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, line1: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={addressForm.line2}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, line2: e.target.value })
                      }
                    />
                    <select
                      required
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          state: e.target.value,
                          city: ""
                        })
                      }
                    >
                      <option value="">-- Select State --</option>
                      {indianStatesAndCities.map((s) => (
                        <option key={s.state} value={s.state}>
                          {s.state}
                        </option>
                      ))}
                    </select>
                    <select
                      required
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                    >
                      <option value="">-- Select City --</option>
                      {(
                        indianStatesAndCities.find(
                          (s) => s.state === addressForm.state
                        )?.cities || []
                      ).map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={addressForm.pincode}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, pincode: e.target.value })
                      }
                      required
                    />
                    <button type="submit" className="cart-address-save-btn">
                      Save Address
                    </button>
                  </form>
                )}
              </div>

              {/* Payment Method Block */}
              <div className="cart-payment-block">
                <div className="cart-payment-title">Choose Payment Option</div>
                <label className="payment-option-label">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  Cash on Delivery (COD)
                </label>
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Subtotal</span>
                  <span className="cart-summary-value">
                    ₹{priceSummary.subtotal?.toFixed(2) ?? "0.00"}
                  </span>
                </div>

                <div className="cart-summary-row">
                  <span className="cart-summary-label">Tax (2%)</span>
                  <span className="cart-summary-value">
                    ₹{priceSummary.tax?.toFixed(2) ?? "0.00"}
                  </span>
                </div>

                <div className="cart-summary-row">
                  <span className="cart-summary-label">Delivery Charges</span>
                  <span className="cart-summary-value">
                    ₹{priceSummary.deliveryCharges?.toFixed(2) ?? "0.00"}
                  </span>
                </div>

                {couponApplied && (
                  <div className="cart-summary-row discount-row">
                    <span className="cart-summary-label">Coupon Discount</span>
                    <span className="cart-summary-value discount-value">
                      -₹{discount?.toFixed(2) ?? "0.00"}
                    </span>
                  </div>
                )}

                {appliedOfferCode && (
  <div className="cart-summary-row coupon-applied-row">
    <span className="cart-summary-label">Coupon Applied</span>
    <span className="cart-summary-value coupon-code">{appliedOfferCode}</span>
  </div>
)}


                <div className="cart-summary-row cart-grand-total-final">
                  <span className="cart-summary-label">Cart Total</span>
                  <span className="cart-summary-value total-value">
                    ₹{priceSummary.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="cart-buy-btn"
                disabled={!canCheckout}
                onClick={handleSubmitOrder}
              >
                Buy Now
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default CartPage;

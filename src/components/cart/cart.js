import React, { useEffect, useState } from "react";
import { FaShoppingBag, FaTrashAlt, FaShoppingCart, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import { useCart } from "../../services/cartContext";
import {
  getCartPrice,
  submitOrder,
  fetchAccountDetails,
  fetchUserOrders,
  updateAccountDetails
} from "../../services/api";
import { indianStatesAndCities } from "../../constants/location";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../loader/loader";
import ErrorPopup from "../error-popup/Error-popup";
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
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("googleUser")) || {});
  const [account, setAccount] = useState(() => JSON.parse(localStorage.getItem("accountDetails")) || {});

  // Coupon, discount, payment
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedOfferCode, setAppliedOfferCode] = useState(null);

  const [orders, setOrders] = useState([]);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: "" });

  // Address and phone state
  const [address, setAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    line1: "",
    line2: "",
    state: "",
    city: "",
    pincode: "",
  });
  const [phone, setPhone] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryAllowed, setDeliveryAllowed] = useState(true);

  // Validation states
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [debouncedPincode, setDebouncedPincode] = useState("");
  const [isPincodeValid, setIsPincodeValid] = useState(null); // null=unknown, true=valid, false=invalid
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Price Summary
  const [priceSummary, setPriceSummary] = useState({
    basicSubtotal: 0,
    discountedSubtotal: 0,
    tax: 0,
    deliveryCharges: 0,
    total: 0,
  });

  const isLoggedIn = Boolean(user && account);

  // Load user, account, address, and phone on mount or user change
  useEffect(() => {
    async function fetchUserData() {
      try {
        const storedUser = localStorage.getItem("googleUser");
        const storedAccount = localStorage.getItem("accountDetails");

        if (!user && !storedUser) {
          navigate("/login");
          return;
        }
        if (!user && storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (!account && storedAccount) {
          const acc = JSON.parse(storedAccount);
          setAccount(acc);
          setAddress(acc.address || null);
          setPhone(acc.phone || "");
          setAddressForm(acc.address || {
            line1: "",
            line2: "",
            city: "",
            state: "",
            pincode: "",
          });
        }

        if (user) {
          setLoading(true);
          const [freshAccount, userOrders] = await Promise.all([
            fetchAccountDetails(),
            fetchUserOrders(user.id),
          ]);
          setAccount(freshAccount);
          setAddress(freshAccount.address || null);
          setPhone(freshAccount.phone || "");
          setAddressForm(freshAccount.address || {
            line1: "",
            line2: "",
            city: "",
            state: "",
            pincode: "",
          });
          setOrders(userOrders);

          localStorage.setItem("googleUser", JSON.stringify(user));
          localStorage.setItem("accountDetails", JSON.stringify(freshAccount));
        }
      } catch (error) {
        console.error(error);
        setErrorPopup({ show: true, message: "We are currently facing difficulty. Sorry for the inconvenience." });
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [user, navigate]);

  // Debounce pincode input for API call
  useEffect(() => {
    const handler = setTimeout(() => {
      if (addressForm.pincode) {
        setDebouncedPincode(addressForm.pincode);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [addressForm.pincode]);

  // Validate pincode with city/state match against API
  useEffect(() => {
    if (debouncedPincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${debouncedPincode}`)
        .then(res => res.json())
        .then(data => {
          if (data[0].Status === "Success") {
            const postOffices = data[0].PostOffice || [];

            const match = postOffices.some(po =>
              po.District.toLowerCase() === (addressForm.city || "").toLowerCase() &&
              po.State.toLowerCase() === (addressForm.state || "").toLowerCase()
            );

            setPincodeInfo(postOffices);
            setIsPincodeValid(match);
          } else {
            setPincodeInfo(null);
            setIsPincodeValid(false);
          }
        })
        .catch(err => {
          console.error("API error:", err);
          setPincodeInfo(null);
          setIsPincodeValid(false);
        });
    } else {
      setIsPincodeValid(null);
      setPincodeInfo(null);
    }
  }, [debouncedPincode, addressForm.city, addressForm.state]);

  // Simple phone validation: 10 digits only
  useEffect(() => {
    const phoneRegex = /^\d{10}$/;
    setIsPhoneValid(phoneRegex.test(phone));
  }, [phone]);

  // Fetch price on cart or coupon changes
  useEffect(() => {
    async function fetchPrice() {
      try {
        if (!cart.length) {
          setPriceSummary({
            basicSubtotal: 0,
            discountedSubtotal: 0,
            tax: 0,
            deliveryCharges: 0,
            total: 0,
          });
          setDiscount(0);
          setCouponApplied(false);
          setAppliedOfferCode(null);
          return;
        }
        const res = await getCartPrice({
          products: cart.map(item => ({ productId: item._id, qty: item.qty })),
          couponCode: couponApplied ? coupon : "",
        });
        setPriceSummary({
          basicSubtotal: res.basicSubtotal,
          discountedSubtotal: res.discountedSubtotal,
          tax: res.tax || 0,
          deliveryCharges: res.deliveryCharges || 0,
          total: res.total,
        });
        setDiscount(res.discount || 0);
        setAppliedOfferCode(res.couponApplied || null);
        if (couponApplied && (!res.discount || res.discount === 0)) {
          setCouponApplied(false);
          setDiscount(0);
          setAppliedOfferCode(null);
          alert("Coupon is invalid or expired");
        }
        setLoading(false);
      } catch (e) {
        setDiscount(0);
        setLoading(false);
        setCouponApplied(false);
        setAppliedOfferCode(null);
      }
    }
    fetchPrice();
  }, [cart, couponApplied, coupon]);

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
    if (
      cart.length === 0 ||
      !address ||
      !address.city ||
      !address.pincode ||
      !phone ||
      !isPhoneValid ||
      !isPincodeValid ||
      !deliveryAllowed
    ) {
      alert(
        "⚠ Please add products to your cart and provide a valid shipping address with phone number."
      );
      return;
    }
    setLoading(true);
    try {
      const orderPayload = {
        products: cart.map(item => `${item.name} (x${item.qty})`),
        coupon: couponApplied ? coupon : "",
        offer: "",
        totalPrice: priceSummary.total,
        paymentMode: paymentMethod === "COD" ? "Cash" : paymentMethod,
      };
      await submitOrder(orderPayload);
      alert("🎉 Your product has been ordered successfully!");
      clearCart();
      setCoupon("");
      setCouponApplied(false);
      setDiscount(0);
      setAddress(null);
      setPhone("");
    } catch (error) {
      console.error("❌ Error submitting order:", error);
      setLoading(false);
      setErrorPopup({ show: true, message: "We are facing technical issues!" });
    }
  };

  // Save address and phone number
  const handleAddressSave = async (e) => {
    e.preventDefault();

    if (!addressForm.city || !addressForm.state || !addressForm.pincode || !phone) {
      alert("Please fill all required address fields and phone number.");
      return;
    }
    if (!isPincodeValid) {
      alert("Pincode, City, and State do not match or invalid. Please correct.");
      return;
    }
    if (!isPhoneValid) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const updated = await updateAccountDetails({
        address: addressForm,
        phone,
      });
      setAddress(updated.address);
      setAddressForm(updated.address);
      setPhone(updated.phone || phone);
      setAccount(prev => ({ ...prev, address: updated.address, phone: updated.phone || phone }));
      setUser(prev => ({ ...prev, address: updated.address, phone: updated.phone || phone }));

      localStorage.setItem("googleUser", JSON.stringify({ ...user, address: updated.address, phone: updated.phone || phone }));
      localStorage.setItem("accountDetails", JSON.stringify({ ...account, address: updated.address, phone: updated.phone || phone }));

      setShowAddressForm(false);
    } catch (error) {
      alert("Failed to update address or phone number");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const closeErrorPopup = () => setErrorPopup({ show: false, message: "" });

  const canCheckout =
    cart.length > 0 &&
    address &&
    address.city &&
    address.pincode &&
    phone &&
    isPhoneValid &&
    isPincodeValid &&
    deliveryAllowed;

  return (
    <div className="cart-page">
      {loading && <Loader />}
      {errorPopup.show && <ErrorPopup message={errorPopup.message} onClose={closeErrorPopup} />}
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
            <div className="cart-products-list-wrapper" style={{ position: "relative" }}>
              <div
                className="cart-products-list"
                style={{ filter: isLoggedIn ? "none" : "blur(2px)", pointerEvents: isLoggedIn ? "auto" : "none" }}
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
                        <div className="product-cart-price">
                          {item.basicPrice && item.discountedPrice && item.basicPrice !== item.discountedPrice ? (
                            <>
                              <div className="actual-price">
                                ₹{Number(item.basicPrice).toFixed(2)}
                              </div>
                              <div className="discounted-price">
                                ₹{Number(item.discountedPrice).toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <div className="discounted-price">
                              ₹{Number(item.discountedPrice ?? item.price).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="product-cart-qty-col">
                        <div className="product-cart-label">Quantity</div>
                        <div className="product-cart-qty">
                          <button onClick={() => isLoggedIn && removeFromCart(item)} disabled={!isLoggedIn}>-</button>
                          <span>{item.qty}</span>
                          <button onClick={() => isLoggedIn && addToCart(item)} disabled={!isLoggedIn}>+</button>
                        </div>
                      </div>
                    </div>
                    <div className="product-cart-total-row">
                      <span className="product-cart-label">Total</span>
                      <span className="product-cart-subtotal">
                        ₹{(item.discountedPrice * item.qty).toFixed(2)}
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
                <button className="cart-coupon-btn" onClick={handleApplyCoupon} disabled={couponApplied || !coupon}>
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
                    <div>{address.city}, {address.state} - {address.pincode}</div>
                    <div>Phone: {phone || "N/A"}</div>
                    {!deliveryAllowed && <div className="not-deliverable">❌ We can't deliver here</div>}
                    <button className="cart-address-edit-btn" onClick={() => setShowAddressForm(true)}>
                      Edit Address
                    </button>
                  </div>
                ) : (
                  <form className="cart-address-form" onSubmit={handleAddressSave}>
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={addressForm.line1}
                      onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={addressForm.line2}
                      onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                    />
                    <input
                  className="edit-input"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  required
                />
                <input
                  className="edit-input"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  required
                />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    {/* Validation messages */}
                    {isPincodeValid === true && <div style={{ color: "green", marginTop: 4 }}>✅ We will deliver here</div>}
                    {isPincodeValid === false && <div style={{ color: "red", marginTop: 4 }}>❌ Wrong pincode or city/state mismatch</div>}
                    {!/^\d{10}$/.test(phone) && phone.length > 0 && (
                      <div style={{ color: "red", marginTop: 4 }}>❌ Enter a valid 10-digit phone number</div>
                    )}
                    <button
                      type="submit"
                      className="cart-address-save-btn"
                      disabled={!isPincodeValid || !/^\d{10}$/.test(phone)}
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="cart-address-cancel-btn"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>

              {/* Payment Block */}
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
                  <span className="cart-summary-value" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    {typeof priceSummary.basicSubtotal === "number" && priceSummary.basicSubtotal > priceSummary.discountedSubtotal ? (
                      <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.99rem", fontWeight: 400 }}>
                        ₹{Number(priceSummary.basicSubtotal).toFixed(2)}
                      </span>
                    ) : null}
                    <span style={{ color: "#28a745", fontSize: "1.04rem", fontWeight: 600 }}>
                      ₹{Number(priceSummary.discountedSubtotal ?? priceSummary.subtotal).toFixed(2)}
                    </span>
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
                  {priceSummary.deliveryCharges > 0 ? (
                    <span className="cart-summary-value">{`₹${priceSummary.deliveryCharges?.toFixed(2) ?? "0.00"}`}</span>
                  ) : (
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span className="cart-summary-value" style={{ textDecoration: "line-through" }}>
                        ₹{(priceSummary.deliveryCharges + 75).toFixed(2)}
                      </span>
                      <span className="cart-summary-value">Free</span>
                    </span>
                  )}
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

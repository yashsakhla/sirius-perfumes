import React, { useEffect, useMemo, useState } from "react";
import {
  FaShoppingBag,
  FaTrashAlt,
  FaShoppingCart,
  FaLock,
  FaMobileAlt,
  FaTruck,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useCart } from "../../services/cartContext";
import {
  getCartPrice,
  submitOrder,
  fetchAccountDetails,
  fetchUserOrders,
  updateAccountDetails,
  getToken,
  updateOrderStatus,
} from "../../services/api";
import { Link, useNavigate, createSearchParams } from "react-router-dom";
import { BrandPageLoader } from "../brand-loader/BrandLoader";
import ErrorPopup from "../error-popup/Error-popup";
import "./cart.css";
import { url } from "../../env.config";
import axios from "axios";
import PromoBanners from "../promo-banners/promo-banners";
import { cartAfterHero, cartBeforeCheckout } from "../promo-banners/promo-data";

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

function normalizeLocationPart(s) {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
}

/**
 * India Post often uses district / area names that differ from what users type.
 * Accept pincode as valid when state loosely matches and city matches district,
 * block, or locality (Name) in either direction.
 */
function postOfficeMatchesUser(po, cityRaw, stateRaw) {
  const city = normalizeLocationPart(cityRaw);
  const state = normalizeLocationPart(stateRaw);
  const district = normalizeLocationPart(po.District);
  const st = normalizeLocationPart(po.State);
  const block = normalizeLocationPart(po.Block);
  const name = normalizeLocationPart(po.Name);

  if (!city && !state) return true;

  if (state && st) {
    const compactUser = state.replace(/\s/g, "");
    const compactApi = st.replace(/\s/g, "");
    const stateOk =
      st === state ||
      st.includes(state) ||
      state.includes(st) ||
      compactUser === compactApi ||
      compactApi.includes(compactUser) ||
      compactUser.includes(compactApi);
    if (!stateOk) return false;
  }

  if (!city) return true;

  if (!district && !block && !name) return true;

  const cityWords = city.split(" ").filter(Boolean);
  const cityMatch =
    district === city ||
    district.includes(city) ||
    city.includes(district) ||
    (block &&
      (block.includes(city) ||
        city.includes(block) ||
        cityWords.some((w) => w.length > 2 && block.includes(w)))) ||
    (name &&
      (name.includes(city) ||
        city.includes(name) ||
        cityWords.some((w) => w.length > 2 && name.includes(w))));

  return cityMatch;
}

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

  /** "UPI" = pay full amount online; "COD" = 10% now, rest on delivery */
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  // Price Summary
  const [priceSummary, setPriceSummary] = useState({
    basicSubtotal: 0,
    discountedSubtotal: 0,
    tax: 0,
    deliveryCharges: 0,
    total: 0,
  });

  const isLoggedIn = Boolean(user && account);

  const orderTotal = useMemo(() => {
    const t = Number(priceSummary.total);
    return Number.isFinite(t) ? Math.round(t * 100) / 100 : 0;
  }, [priceSummary.total]);

  const codAdvanceAmount = useMemo(
    () => Math.round(orderTotal * 0.1 * 100) / 100,
    [orderTotal]
  );
  const codBalanceAmount = useMemo(
    () => Math.round((orderTotal - codAdvanceAmount) * 100) / 100,
    [orderTotal, codAdvanceAmount]
  );
  const amountPayableNow =
    paymentMethod === "COD" ? codAdvanceAmount : orderTotal;

  // Load user, account, address, and phone on mount or user change
  useEffect(() => {
    async function fetchUserData() {
      try {
        const storedUser = localStorage.getItem("googleUser");
        const storedAccount = localStorage.getItem("accountDetails");

         if (!user || Object.keys(user).length === 0) {
    const storedUser = localStorage.getItem("googleUser");
    if (!storedUser) {
      navigate("/login", { replace: true });
    }
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
        if (storedUser && storedAccount) {
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
  }, [user]);

  useEffect(() => {
  if (!user || Object.keys(user).length === 0) {
    const storedUser = localStorage.getItem("googleUser");
    if (!storedUser) {
      navigate("/login", { replace: true });
    }
  }
}, [user]);


  // Debounce pincode (digits only) — always sync so clearing the field resets validation
  useEffect(() => {
    const handler = setTimeout(() => {
      const digits = String(addressForm.pincode || "").replace(/\D/g, "").slice(0, 6);
      setDebouncedPincode(digits);
    }, 450);
    return () => clearTimeout(handler);
  }, [addressForm.pincode]);

  // Validate pincode via India Post API; don’t tie this to full-page loading
  useEffect(() => {
    if (debouncedPincode.length !== 6) {
      setIsPincodeValid(null);
      setPincodeInfo(null);
      return;
    }

    let cancelled = false;
    fetch(`https://api.postalpincode.in/pincode/${debouncedPincode}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const block = Array.isArray(data) ? data[0] : null;
        if (!block || block.Status !== "Success") {
          setPincodeInfo(null);
          setIsPincodeValid(false);
          return;
        }
        const postOffices = block.PostOffice || [];
        if (!postOffices.length) {
          setPincodeInfo(null);
          setIsPincodeValid(false);
          return;
        }

        setPincodeInfo(postOffices);

        const city = (addressForm.city || "").trim();
        const st = (addressForm.state || "").trim();

        if (!city && !st) {
          setIsPincodeValid(true);
          return;
        }

        const match = postOffices.some((po) =>
          postOfficeMatchesUser(po, addressForm.city, addressForm.state)
        );
        setIsPincodeValid(match);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Pincode API error:", err);
        setPincodeInfo(null);
        setIsPincodeValid(false);
      });

    return () => {
      cancelled = true;
    };
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
        const regularLines = cart.filter((item) => !item.isGiftBundle);
        const giftSubtotal = cart
          .filter((item) => item.isGiftBundle)
          .reduce(
            (s, item) => s + Number(item.discountedPrice ?? item.price ?? 0) * item.qty,
            0
          );

        if (regularLines.length === 0) {
          setPriceSummary({
            basicSubtotal: giftSubtotal,
            discountedSubtotal: giftSubtotal,
            tax: 0,
            deliveryCharges: 0,
            total: giftSubtotal,
          });
          setDiscount(0);
          setAppliedOfferCode(null);
          if (couponApplied) {
            setCouponApplied(false);
          }
          return;
        }

        const res = await getCartPrice({
          products: regularLines.map((item) => ({
            productId: item._id,
            qty: item.qty,
          })),
          couponCode: couponApplied ? coupon : "",
        });
        const apiTotal = res.total ?? res.discountedSubtotal ?? 0;
        const mergedTotal = apiTotal + giftSubtotal;
        setPriceSummary({
          basicSubtotal: (res.basicSubtotal ?? 0) + giftSubtotal,
          discountedSubtotal: (res.discountedSubtotal ?? 0) + giftSubtotal,
          tax: res.tax || 0,
          deliveryCharges: res.deliveryCharges || 0,
          total: mergedTotal,
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
    const giftBundles = cart
      .filter((item) => item.isGiftBundle)
      .map((item) => ({
        giftProductId: item.giftProductId,
        giftSize: item.giftSize,
        chosenProducts: (item.chosenProducts || []).map((c) => ({
          productId: c.productId,
          size: c.size,
        })),
      }));

    const orderPayload = {
      products: cart.map((item) => {
        if (item.isGiftBundle) {
          const names = (item.chosenProducts || [])
            .map((c) => c.name || c.productId)
            .join(", ");
          return `Gift: ${item.name} — ${names} (x${item.qty})`;
        }
        const sizePart = item.size ? ` (${item.size} Bottle)` : "";
        return `${item.name}${sizePart} (x${item.qty})`;
      }),
      giftBundles,
      productImg: cart[0]?.image || "",
      coupon: couponApplied ? coupon : "",
      offer: "",
      totalPrice: orderTotal,
      /** Amount to charge via payment gateway (full for UPI, 10% for COD) */
      amountPayableNow,
      paymentMode: paymentMethod,
      ...(paymentMethod === "COD"
        ? {
            codAdvancePercent: 10,
            codAdvanceAmount,
            codBalanceOnDelivery: codBalanceAmount,
          }
        : {}),
      address,
      phone,
    };
    // UPI and COD both: submitOrder → getToken (payment API) → PhonePe. Backend uses amountPayableNow (full vs 10%).
    const res = await submitOrder(orderPayload);
    console.log("Payment initiation response:", res);
    if (res.success && res.order) {
      await handlePhonePePayment(res.order);
      return;
    }
    alert("Failed to launch payment. Please try again.");
    setLoading(false);
  } catch (error) {
    console.error("❌ Error submitting order:", error);
    setLoading(false);
    setErrorPopup({ show: true, message: "We are facing technical issues!" });
  }
};

const handlePhonePePayment = async (order) => {
  try {
    const res = await getToken(order);

    if (!res?.redirectUrl) {
      setLoading(false);
      alert("Failed to generate payment token. Try again.");
      return;
    }

    window.PhonePeCheckout.transact({
      tokenUrl: res.redirectUrl,
      type: "IFRAME",
      callback: async function (response) {
        console.log("Payment callback:", response);

        if (response === "CONCLUDED" || response.status === "SUCCESS") {
          const payload = {
            merchantOrderId: order.merchantOrderId,
            paymentStatus: res?.data?.state,
            transactionId: "",
            token: res?.token,
          };

          const updateRes = await updateOrderStatus(payload);
          if (!updateRes.success) {
            setLoading(false);
            alert("Payment Failed, If your Money is debited please, Contact support.");
            return;
          }

          setLoading(false);
          clearCart();
          const queryParams = { orderId: order._id };
          if (updateRes.getPhonepeStatus?.state === "COMPLETED") {
            navigate({
              pathname: "/order-confirmed",
              search: `?${createSearchParams(queryParams)}`,
            });
          } else if (updateRes.getPhonepeStatus?.state === "FAILED") {
            navigate({
              pathname: "/order-failed",
              search: `?${createSearchParams(queryParams)}`,
            });
          } else {
            navigate({
              pathname: "/order-pending",
              search: `?${createSearchParams(queryParams)}`,
            });
          }
        } else {
          setLoading(false);
          alert("Payment failed or cancelled.");
        }
      },
    });
  } catch (err) {
    console.error("Error initiating PhonePe payment:", err);
    setLoading(false);
    alert("Unable to initiate payment. Try again.");
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
      {loading && (
        <BrandPageLoader
          message="Please wait…"
          ariaLabel="Loading"
        />
      )}
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

      <PromoBanners items={cartAfterHero} />

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
                  <div
                    className={`product-cart-card${item.isGiftBundle ? " product-cart-card--gift" : ""}`}
                    key={`${item._id}-${item.size || ""}-${item.isGiftBundle ? "gift" : "line"}`}
                  >
                    <img
                      src={item.image}
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
                    {item.size ? (
                      <div className="product-cart-size">
                        {item.isGiftBundle ? `Box: ${item.size}` : `${item.size} Bottle`}
                      </div>
                    ) : null}
                    {item.isGiftBundle && item.chosenProducts?.length > 0 && (
                      <ul className="product-cart-gift-lines">
                        {item.chosenProducts.map((c) => (
                          <li key={`${c.productId}-${c.size}`}>
                            {c.name || "Fragrance"} · {c.size}
                          </li>
                        ))}
                      </ul>
                    )}
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
                          <button
                            onClick={() => isLoggedIn && !item.isGiftBundle && addToCart(item)}
                            disabled={!isLoggedIn || item.isGiftBundle}
                            title={item.isGiftBundle ? "Adjust gift on the product page" : undefined}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="product-cart-total-row">
                      <span className="product-cart-label">Total</span>
                      <span className="product-cart-subtotal">
                        ₹{(Number(item.discountedPrice ?? item.price) * item.qty).toFixed(2)}
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
              <PromoBanners items={cartBeforeCheckout} />
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
                    {isPincodeValid === true && (
                      <div style={{ color: "green", marginTop: 4 }}>
                        {(addressForm.city || "").trim() && (addressForm.state || "").trim()
                          ? "✅ Pincode matches your city & state"
                          : "✅ Pincode found — please enter city and state above"}
                      </div>
                    )}
                    {isPincodeValid === false && (
                      <div style={{ color: "red", marginTop: 4 }}>
                        ❌ Pincode not found, or city/state doesn’t match this PIN. Try the district or area
                        spelling from India Post (e.g. official district name).
                      </div>
                    )}
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
                <div className="cart-payment-heading">
                  <span className="cart-payment-title">Payment method</span>
                  <p className="cart-payment-lead">
                    Choose how you&apos;d like to pay. COD requires a 10% advance to confirm your order.
                  </p>
                </div>
                <div
                  className="cart-payment-methods"
                  role="radiogroup"
                  aria-label="Payment method"
                >
                  <label
                    className={`cart-payment-option${paymentMethod === "UPI" ? " cart-payment-option--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="UPI"
                      className="cart-payment-option__input"
                      checked={paymentMethod === "UPI"}
                      onChange={() => setPaymentMethod("UPI")}
                    />
                    <span className="cart-payment-option__check" aria-hidden />
                    <span className="cart-payment-option__icon" aria-hidden>
                      <FaMobileAlt />
                    </span>
                    <span className="cart-payment-option__text">
                      <span className="cart-payment-option__name">UPI / Online</span>
                      <span className="cart-payment-option__desc">
                        Pay the full order amount now with UPI, card, or net banking.
                      </span>
                      <span className="cart-payment-option__amount">
                        Pay now: <strong>₹{orderTotal.toFixed(2)}</strong>
                      </span>
                    </span>
                  </label>
                  <label
                    className={`cart-payment-option${paymentMethod === "COD" ? " cart-payment-option--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      className="cart-payment-option__input"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />
                    <span className="cart-payment-option__check" aria-hidden />
                    <span className="cart-payment-option__icon" aria-hidden>
                      <FaTruck />
                    </span>
                    <span className="cart-payment-option__text">
                      <span className="cart-payment-option__name">Cash on delivery</span>
                      <span className="cart-payment-option__desc">
                        Pay 10% online now to confirm. The rest when your order arrives.
                      </span>
                      <span className="cart-payment-option__amount cart-payment-option__amount--split">
                        <span>
                          Now (10%): <strong>₹{codAdvanceAmount.toFixed(2)}</strong>
                        </span>
                        <span className="cart-payment-option__on-delivery">
                          On delivery: ₹{codBalanceAmount.toFixed(2)}
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
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
                    ₹{orderTotal.toFixed(2)}
                  </span>
                </div>
                {paymentMethod === "COD" && orderTotal > 0 && (
                  <>
                    <div className="cart-summary-row cart-summary-row--cod">
                      <span className="cart-summary-label">Advance (10%)</span>
                      <span className="cart-summary-value cart-summary-value--advance">
                        ₹{codAdvanceAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="cart-summary-row cart-summary-row--cod-muted">
                      <span className="cart-summary-label">Due on delivery</span>
                      <span className="cart-summary-value">
                        ₹{codBalanceAmount.toFixed(2)}
                      </span>
                    </div>
                    <p className="cart-cod-note">
                      You will complete a secure online payment for the advance first; the
                      remaining balance is paid in cash to the courier.
                    </p>
                  </>
                )}
              </div>

              <button
                className="cart-buy-btn"
                disabled={!canCheckout}
                onClick={handleSubmitOrder}
              >
                {paymentMethod === "COD"
                  ? `Pay ₹${codAdvanceAmount.toFixed(2)} advance & place order`
                  : `Pay ₹${orderTotal.toFixed(2)} & place order`}
              </button>
              {(!canCheckout) && <div style={{ color: "red", marginTop: 4, textAlign: "center" }}>❌ Please Add Your Address or Phone Number To Order.</div>}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default CartPage;

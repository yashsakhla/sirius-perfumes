import React, { useState, useEffect } from "react";
import { useUser } from "../../services/userContext";
import { useNavigate, Link } from "react-router-dom";
import { FaWindowClose } from "react-icons/fa";
import { FaStopCircle } from "react-icons/fa";
import {
  fetchAccountDetails,
  updateAccountDetails,
  fetchUserOrders,
} from "../../services/api";
import { useCart } from "../../services/cartContext";
import { FaEdit, FaUser, FaShoppingCart, FaTag } from "react-icons/fa";
import { motion } from "framer-motion";
import { AccountPageLoader, AccountSavingOverlay } from "./AccountLoaders";
import ErrorPopup from "../error-popup/Error-popup";
import "./account.css";
import PromoBanners from "../promo-banners/promo-banners";
import { accountAfterHero } from "../promo-banners/promo-data";

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

export default function Account() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const { cart } = useCart();

  // Local state
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Editing states
  const [editName, setEditName] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [addressInput, setAddressInput] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [orders, setOrders] = useState([]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Pincode info and validation
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [debouncedPincode, setDebouncedPincode] = useState("");
  const [isPincodeValid, setIsPincodeValid] = useState(null); // null = unknown, true/false = validity

  // Debounce pincode input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPincode(addressInput.pincode);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [addressInput.pincode]);

  // Pincode validation effect including city/state match
  useEffect(() => {
    // Only run pincode validation if all required address fields are present
    if (
      !addressInput.city ||
      !addressInput.state ||
      !addressInput.pincode ||
      addressInput.pincode.length !== 6
    ) {
      setPincodeInfo(null);
      setIsPincodeValid(null);
      return;
    }

    fetch(`https://api.postalpincode.in/pincode/${addressInput.pincode}`)
      .then((res) => res.json())
      .then((data) => {
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          data[0].Status === "Success"
        ) {
          const postOffices = data[0].PostOffice || [];
          const match = postOffices.some(
            (po) =>
              po.District.toLowerCase() === addressInput.city.toLowerCase() &&
              po.State.toLowerCase() === addressInput.state.toLowerCase()
          );

          setPincodeInfo(postOffices);
          setIsPincodeValid(match);
        } else {
          setPincodeInfo(null);
          setIsPincodeValid(false);
        }
      })

      .catch((err) => {
        console.error("API Error:", err);
        setPincodeInfo(null);
        setIsPincodeValid(false);
      });
  }, [debouncedPincode, addressInput.city, addressInput.state]);

  // Fetch account and orders on mount and if user changes
  useEffect(() => {
    const storedUser = localStorage.getItem("googleUser");
    const storedAccount = localStorage.getItem("accountDetails");

    if (!user && !storedUser) {
      navigate("/login");
      return;
    }
    if (!user && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Show cached account data immediately
    if (!account && storedAccount) {
      const parsedAccount = JSON.parse(storedAccount);
      setAccount(parsedAccount);
      setNameInput(parsedAccount.name || "");
      setPhoneInput(parsedAccount.phone || "");
      setAddressInput(
        parsedAccount.address || {
          line1: "",
          line2: "",
          city: "",
          state: "",
          pincode: "",
        }
      );
    }

    if (user) {
      setLoading(true);
      Promise.all([fetchAccountDetails(), fetchUserOrders(user.id)])
        .then(([accountData, ordersData]) => {
          setAccount(accountData);
          setNameInput(accountData.name || "");
          setPhoneInput(accountData.phone || "");
          setAddressInput(
            accountData.address || {
              line1: "",
              line2: "",
              city: "",
              state: "",
              pincode: "",
            }
          );
          setOrders(ordersData);

          localStorage.setItem("accountDetails", JSON.stringify(accountData));
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch account or orders:", error);
          setShowErrorPopup(true);
          setLoading(false);
        });
    }
  }, [user]);

  // Save name handler
  const handleNameSave = async () => {
    setLoading(true);
    try {
      const updated = await updateAccountDetails({ name: nameInput });
      setAccount((prev) => ({ ...prev, name: updated.name }));
      setUser((prev) => ({ ...prev, name: updated.name }));
      localStorage.setItem(
        "googleUser",
        JSON.stringify({ ...user, name: updated.name })
      );
      localStorage.setItem(
        "accountDetails",
        JSON.stringify({ ...user, name: updated.name })
      );
      setEditName(false);
    } catch (err) {
      alert("Failed to update name");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Save phone number handler
  const handlePhoneSave = async () => {
    setLoading(true);
    try {
      const updated = await updateAccountDetails({ phone: phoneInput });
      setAccount((prev) => ({ ...prev, phone: updated.phone }));
      setUser((prev) => ({ ...prev, phone: updated.phone }));
      localStorage.setItem(
        "googleUser",
        JSON.stringify({ ...user, phone: updated.phone })
      );
      localStorage.setItem(
        "accountDetails",
        JSON.stringify({ ...user, phone: updated.phone })
      );
      setEditPhone(false);
    } catch (err) {
      alert("Failed to update phone number");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Save address handler
  const handleAddressSave = async (e) => {
    e.preventDefault();

    if (!addressInput.city || !addressInput.state || !addressInput.pincode) {
      alert("Please provide complete city, state, and pincode information.");
      return;
    }

    if (isPincodeValid !== true) {
      alert(
        "Pincode, City, and State do not match or invalid. Please correct before saving."
      );
      return;
    }

    setLoading(true);
    try {
      const updated = await updateAccountDetails({ address: addressInput });
      setAccount((prev) => ({ ...prev, address: updated.address }));
      setUser((prev) => ({ ...prev, address: updated.address }));
      localStorage.setItem(
        "googleUser",
        JSON.stringify({ ...user, address: updated.address })
      );
      localStorage.setItem(
        "accountDetails",
        JSON.stringify({ ...user, address: updated.address })
      );
      setEditAddress(false);
    } catch (err) {
      alert("Failed to update address");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setAccount(null);
    localStorage.removeItem("googleUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accountDetails");
    localStorage.removeItem("offerPopupShown");
    localStorage.removeItem("siriusNotificationDismissedId");
    navigate("/login");
  };

  if (!account) {
    if (loading) return <AccountPageLoader />;
    navigate("/login");
    return null;
  }

  const isPremiumUser =
    account?.premiumUser === true || user?.premiumUser === true;

  const firstName = (account.name || "").trim().split(/\s+/)[0] || "there";

  return (
    <div className={`account-page${isPremiumUser ? " premium" : ""}`}>
      {loading && <AccountSavingOverlay />}

      <header className="account-hero">
        <div className="account-hero__bg" aria-hidden />
        <motion.div
          className="account-hero__content"
          variants={bannerContentVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="account-hero__label" variants={itemVariants}>
            Sirius Perfumes
          </motion.span>
          <motion.h1 className="account-hero__title" variants={itemVariants}>
            <span className="account-hero__title-text">My account</span>
            <span className="account-hero__title-icon" aria-hidden>
              <FaUser />
            </span>
          </motion.h1>
          <motion.p className="account-hero__greet" variants={itemVariants}>
            Hello, {firstName}
          </motion.p>
          <motion.p className="account-hero__sub" variants={itemVariants}>
            Manage your profile, cart, and orders in one place.
          </motion.p>
        </motion.div>
      </header>

      <PromoBanners
        items={accountAfterHero}
        className="account-promo-strip"
      />

      {/* PREMIUM BADGE */}
      {isPremiumUser && (
        <div className="premium-badge">
          <span role="img" aria-label="star" className="star-gradient">
            🌟
          </span>
          <span>
            You are a <span className="premium-text">Premium Member</span>!
            Enjoy exclusive access, golden offers, and luxury perks.
          </span>
        </div>
      )}

      {/* Main account content */}
      <div className="account-content">
        {/* Account Details Section */}
        <section className="account-section account-section--profile">
          <div className="account-profile-badge" aria-hidden>
            {(account.name || account.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="section-title">
            <FaUser className="section-icon" />
            Profile
          </div>

          {/* Name */}
          <div className="info-row">
            <span className="info-label">Name:</span>
            {editName ? (
              <>
                <div className="info-input-col">
                  <input
                    className="edit-input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                  />
                  <div className="row">
                    <button className="save-btn" onClick={handleNameSave}>
                      Save
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setEditName(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="info-value info-strong">{account.name}</span>
                <button className="edit-btn" onClick={() => setEditName(true)}>
                  <FaEdit />
                </button>
              </>
            )}
          </div>

          {/* Phone Number */}
          <div className="info-row">
            <span className="info-label">Phone Number:</span>
            {editPhone ? (
              <>
                <div className="info-input-col">
                  <input
                    className="edit-input"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Enter phone number"
                  />
                  <div className="row">
                    <button className="save-btn" onClick={handlePhoneSave}>
                      Save
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setEditPhone(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="info-value info-strong">
                  {account.phone || "Not provided"}
                </span>
                <button className="edit-btn" onClick={() => setEditPhone(true)}>
                  <FaEdit />
                </button>
              </>
            )}
          </div>

          {/* Email */}
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{account.email}</span>
          </div>

          {/* Address */}
          <div className="info-row address-row">
            <span className="info-label">Address:</span>
            {editAddress ? (
              <form className="address-form" onSubmit={handleAddressSave}>
                <input
                  className="edit-input"
                  placeholder="Line 1"
                  value={addressInput.line1}
                  onChange={(e) =>
                    setAddressInput({ ...addressInput, line1: e.target.value })
                  }
                  required
                />
                <input
                  className="edit-input"
                  placeholder="Line 2"
                  value={addressInput.line2}
                  onChange={(e) =>
                    setAddressInput({ ...addressInput, line2: e.target.value })
                  }
                />
                <input
                  className="edit-input"
                  placeholder="City"
                  value={addressInput.city}
                  onChange={(e) =>
                    setAddressInput({ ...addressInput, city: e.target.value })
                  }
                  required
                />
                <input
                  className="edit-input"
                  placeholder="State"
                  value={addressInput.state}
                  onChange={(e) =>
                    setAddressInput({ ...addressInput, state: e.target.value })
                  }
                  required
                />
                <div>
                  <input
                    className="edit-input"
                    placeholder="Pincode"
                    value={addressInput.pincode}
                    onChange={(e) =>
                      setAddressInput({
                        ...addressInput,
                        pincode: e.target.value,
                      })
                    }
                    required
                  />

                  {/* Pincode validation messages */}
                  {isPincodeValid === true && (
                    <div className="account-pin-msg account-pin-msg--ok">
                      We can deliver to this pincode.
                    </div>
                  )}
                  {isPincodeValid === false &&
                    pincodeInfo &&
                    pincodeInfo.length > 0 && (
                      <div className="account-pin-msg account-pin-msg--warn">
                        City or state doesn&apos;t match this pincode. Please
                        update.
                      </div>
                    )}
                  {isPincodeValid === false &&
                    (!pincodeInfo || pincodeInfo.length === 0) && (
                      <div className="account-pin-msg account-pin-msg--err">
                        Invalid pincode.
                      </div>
                    )}
                </div>

                <button
                  className="save-btn"
                  type="submit"
                  disabled={isPincodeValid !== true}
                >
                  Save
                </button>
                <button
                  className="cancel-btn"
                  type="button"
                  onClick={() => setEditAddress(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span className="info-value">
                  {account.address?.line1 || ""}
                  {account.address?.line2
                    ? `, ${account.address.line2}`
                    : ""}, {account.address?.city || ""},{" "}
                  {account.address?.state || ""} -{" "}
                  {account.address?.pincode || ""}
                </span>
                <button
                  className="edit-btn"
                  onClick={() => setEditAddress(true)}
                >
                  <FaEdit />
                </button>
              </>
            )}
          </div>
        </section>

        {/* Cart Section */}
        <section className="account-section account-section--cart">
          <div className="section-title">
            <FaShoppingCart className="section-icon" />
            Cart
            <span className="section-count">{cart?.length ?? 0}</span>
          </div>
          {cart && cart.length > 0 ? (
            <ul className="account-cart-grid">
              {cart.map((item) => {
                const lineKey = `${item._id}-${String(item.size ?? "").trim()}`;
                const unit = Number(item.discountedPrice ?? item.price ?? 0);
                const subtotal = unit * (item.qty || 0);
                const imgSrc = item.image || "";
                return (
                  <li key={lineKey} className="account-cart-product">
                    <div className="account-cart-product__media">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={item.name || "Product"}
                          className="account-cart-product__img"
                        />
                      ) : (
                        <div className="account-cart-product__img-fallback" aria-hidden />
                      )}
                    </div>
                    <div className="account-cart-product__info">
                      <span className="account-cart-product__name">{item.name}</span>
                      {item.size ? (
                        <span className="account-cart-product__variant">
                          {item.size} bottle
                        </span>
                      ) : null}
                      <div className="account-cart-product__stats">
                        <span className="account-cart-product__unit">
                          ₹{unit.toFixed(2)}
                          <span className="account-cart-product__unit-label"> / unit</span>
                        </span>
                        <span className="account-cart-product__qty-pill">
                          ×{item.qty}
                        </span>
                      </div>
                      <span className="account-cart-product__subtotal">
                        Subtotal <strong>₹{subtotal.toFixed(2)}</strong>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="empty-cart-msg">Your cart is empty.</p>
          )}
          {(!cart || cart.length === 0) && (
            <Link to="/shop" className="account-cart-link account-cart-link--compact">
              Browse fragrances
            </Link>
          )}
          {cart && cart.length > 0 && (
            <Link to="/cart" className="account-cart-link account-cart-link--secondary account-cart-link--compact">
              Review bag & checkout
            </Link>
          )}
        </section>

        {/* Order History Section */}
        {account.orders && account.orders.length > 0 && (
          <section className="account-section">
            <div className="section-title">
              <FaTag className="section-icon" />
              Order History
            </div>
            <div className="order-history-list">
              {account.orders.map((order, idx) => (
                <div className="order-history-card" key={order._id || idx}>
                  <div className="order-row">
                    <span className="order-id">
                      Order #{order._id || order.id}
                    </span>
                    <span className="order-date">
                      {order.date
                        ? new Date(order.date).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="order-row">
                    <span className="order-items">
                      {order.items?.length || 0} item(s)
                    </span>
                    <span className="order-total">
                      ₹ {order.totalPrice || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {orders?.length > 0 && (
            <section className="account-section account-section--orders">
              <div className="section-title">
                <FaTag className="section-icon" />
                Recent orders
              </div>

              {orders.map((order, idx) => {
                const shippingSteps = [
                  {
                    label: "Ordered",
                    date: order.date,
                    done: [
                      "Ordered",
                      "Processing",
                      "Dispatched",
                      "Delivered",
                    ].includes(order.Deliverystatus),
                  },
                  {
                    label: "Processing",
                    date: order.processingDate,
                    done: ["Processing", "Dispatched", "Delivered"].includes(
                      order.Deliverystatus
                    ),
                  },
                  {
                    label: "Dispatched",
                    date: order.dispatchDate,
                    done: ["Dispatched", "Delivered"].includes(
                      order.Deliverystatus
                    ),
                  },
                  {
                    label: "Delivered",
                    date: order.deliveryDate,
                    done: order.Deliverystatus === "Delivered",
                  },
                ];

                return (
                  <div className="order-card">
                    <div className="order-card__row order-card__row--top">
                      <img
                        className="order-card__product-image"
                        src={
                          order.productImg || "https://via.placeholder.com/80"
                        }
                        alt={order.productName}
                      />
                      <div className="order-card__details">
                        <span
                          className={`order-card__payment-status order-card__payment-status--${order.paymentStatus}`}
                        >
                          {order.paymentStatus === "COMPLETED"
                            ? "ORDER CONFIRMED"
                            : order.paymentStatus === "FAILED"
                            ? "PAYMENT FAILED"
                            : "INCOMPLETE PAYMENT"}
                        </span>
                        <div className="order-card__product-title">
                          {order.products.join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="order-card__row order-card__row--info">
                      <div className="order-card__info-col">
                        <span>Order ID:</span>
                        <strong>{order._id}</strong>
                      </div>
                      <div className="order-card__info-col">
                        <span>Placed:</span>
                        <strong>
                          {new Date(order.date).toLocaleDateString()},{" "}
                          {new Date(order.date).toLocaleTimeString()}
                        </strong>
                      </div>
                      <div className="order-card__info-col">
                        <span>Total:</span>
                        <strong>₹ {order.totalPrice}</strong>
                      </div>
                      <div className="order-card__info-col">
                        <span>Offer:</span>
                        <strong>{order.offer || "None"}</strong>
                      </div>
                    </div>
                    {order.paymentStatus === "COMPLETED" ? (
                      <div className="order-stepper-vertical">
                        {shippingSteps.map((step, idx) => (
                          <div key={idx} className="stepper-row">
                            <div className="stepper-col">
                              <div className="stepper-col-left">
                                <input
                                  type="checkbox"
                                  className="step-checkbox"
                                  disabled
                                  checked={step.done}
                                />
                                <span
                                  className={`step-status${
                                    step.done ? " active" : ""
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                              <span className="step-date">
                                {step.done && step.date
                                  ? `${new Date(
                                      step.date
                                    ).toLocaleDateString()}, ${new Date(
                                      step.date
                                    ).toLocaleTimeString()}`
                                  : "--"}
                              </span>
                            </div>
                            {idx !== shippingSteps.length - 1 && (
                              <div className="stepper-line"></div>
                            )}
                          </div>
                        ))}
                        <button className="stepper-btn">
                          <a
                            href="https://wa.me/+919370917752"
                            target="_blank"
                            className="link"
                            rel="noopener noreferrer"
                          >
                            Contact Support
                          </a>
                        </button>
                      </div>
                    ) : (
                      <div className="payment-failed-box">
                       <div className="payment-status-row">
                        <div className="emoji">
                           {order.paymentStatus === "FAILED"
                            ? (<FaWindowClose size={30} color="#f01008ff" />)
                            : (<FaStopCircle size={30} color="#f4d136ff" />) }
                        </div>
                                                <p className="payment-status-text">
                          {order.paymentStatus === "FAILED"
                            ?  "Your payment has failed."
                            : "Your payment is pending confirmation."}
                        </p>
                       </div>

                        <p className="payment-support-text">
                          If money is debited, please contact support with your
                          order ID. Your order will be confirmed after
                          verification.
                          <br />
                          <strong>Thank you for your patience.</strong>
                        </p>
                        <button className="stepper-btn">
                          <a
                            href="https://wa.me/+919370917752"
                            target="_blank"
                            className="link"
                            rel="noopener noreferrer"
                          >
                            Contact Support
                          </a>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
        )}

        {/* Logout Button */}
        <button type="button" className="account-logout-btn" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      {showErrorPopup && (
        <ErrorPopup
          message="We are currently facing difficulty at our end, sorry for the inconvenience."
          onClose={() => setShowErrorPopup(false)}
        />
      )}
    </div>
  );
}

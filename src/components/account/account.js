import React, { useState, useEffect } from "react";
import { useUser } from "../../services/userContext";
import { useNavigate } from "react-router-dom";
import {
  fetchAccountDetails,
  updateAccountDetails,
  fetchUserOrders,
} from "../../services/api";
import { useCart } from "../../services/cartContext";
import { FaEdit, FaUser, FaShoppingCart, FaTag } from "react-icons/fa";
import { motion } from "framer-motion";
import Loader from "../loader/loader";
import ErrorPopup from "../error-popup/Error-popup";
import "./account.css";


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
  const [nameInput, setNameInput] = useState("");
  const [addressInput, setAddressInput] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [orders, setOrders] = useState([]);
  const [showErrorPopup, setShowErrorPopup] = React.useState(false);

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

  // Show cached account data immediately for quicker UX
  if (!account && storedAccount) {
    const parsedAccount = JSON.parse(storedAccount);
    setAccount(parsedAccount);
    setNameInput(parsedAccount.name || "");
    setAddressInput(parsedAccount.address || {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    });
  }

  if (user) {
    setLoading(true);

    // Fetch account details and orders simultaneously
    Promise.all([fetchAccountDetails(), fetchUserOrders(user.id)])
      .then(([accountData, ordersData]) => {
        setAccount(accountData);
        setNameInput(accountData.name || "");
        setAddressInput(accountData.address || {
          line1: "",
          line2: "",
          city: "",
          state: "",
          pincode: "",
        });
        setOrders(ordersData);

        // Cache latest account data
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

  const handleAddressSave = async (e) => {
    e.preventDefault();
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

  const handleLogout = () => {
    setUser(null);
    setAccount(null);
    localStorage.removeItem("googleUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accountDetails");
    localStorage.removeItem("offerPopupShown");
    navigate("/login");
  };

  if (!account) {
    if (loading) return <Loader />;
    navigate("/login");
    return null;
  }

  // Premium logic
  const isPremiumUser = account?.premiumUser === true || user?.premiumUser === true;

  return (
    <div className={`account-page${isPremiumUser ? " premium" : ""}`}>
      {loading && <Loader />}

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
            MY ACCOUNT <FaUser size={40} />
          </motion.h1>
          <motion.p className="banner-desc" variants={itemVariants}>
            Welcome to your account dashboard
          </motion.p>
        </motion.div>
      </section>

      {/* PREMIUM BADGE */}
      {isPremiumUser && (
        <div className="premium-badge">
          <span role="img" aria-label="star" className="star-gradient">🌟</span>
          <span>
            You are a <span className="premium-text">Premium Member</span>! Enjoy exclusive access, golden offers, and luxury perks.
          </span>
        </div>
      )}

      {/* Main account content */}
      <div className="account-content">
        {/* Account Details Section */}
        <section className="account-section">
          <div className="section-title">
            <FaUser className="section-icon" />
            Account Details
          </div>
          <div className="info-row">
            <span className="info-label">Name:</span>
            {editName ? (
              <>
                <input
                  className="edit-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
                <button className="save-btn" onClick={handleNameSave}>
                  Save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setEditName(false)}
                >
                  Cancel
                </button>
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
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{account.email}</span>
          </div>
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
                <button className="save-btn" type="submit">
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
        <section className="account-section">
          <div className="section-title">
            <FaShoppingCart className="section-icon" />
            Cart ({cart && cart.length})
          </div>
          {cart && cart.length > 0 ? (
            <div>
              {cart.map((item) => (
                <div key={item.id || item._id}>
                  {item.name} × {item.qty}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-cart-msg">Your cart is empty.</p>
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
                    <span className="order-total">${order.total || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <Loader />
        ) : (
          orders?.length > 0 && (
            <section className="account-section">
              <div className="section-title">
                <FaTag className="section-icon" />
                Order History
              </div>

              {orders.map((order, idx) => {
                const statusSteps = [
                  "Ordered",
                  "Processing",
                  "Dispatched",
                  "Delivered",
                ];
                const currentStep = statusSteps.indexOf(order.status);
                const deliveryDate = new Date(order.date);
                deliveryDate.setDate(deliveryDate.getDate() + 5);

                return (
                  <div className="order-card" key={order._id || idx}>
                    <div className="order-header">
                      <span>Order #{order._id}</span>
                      <span>{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    <div className="order-products">
                      {order.products?.join(", ")}
                    </div>
                    <div className="order-status-progress">
                      {statusSteps.map((step, i) => (
                        <div
                          key={i}
                          className={`order-step ${
                            i <= currentStep ? "active" : ""
                          }`}
                        >
                          <div className="step-circle" />
                          <span className="step-label">{step}</span>
                        </div>
                      ))}
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${
                              (currentStep / (statusSteps.length - 1)) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="order-message">
                      {order.status === "Delivered" ? (
                        <span className="delivered-msg">
                          ✅ Delivered on{" "}
                          {new Date(order.updatedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <em className="pending-msg">
                          📦 Order will be delivered by{" "}
                          {deliveryDate.toLocaleDateString()}
                        </em>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          )
        )}

        {/* Logout Button */}
        <button className="account-logout-btn" onClick={handleLogout}>
          Logout
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

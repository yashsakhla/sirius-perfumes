import React, { useEffect, useState } from "react";
import { FaShoppingBag, FaTrashAlt, FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import { useCart } from "../../services/cartContext";
import { getCartPrice, verifyCoupon, submitOrder } from "../../services/api";
import { indianStatesAndCities } from "../../constants/location";
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

  // Coupon, discount, payment
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

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
  const [priceSummary, setPriceSummary] = useState({ subtotal: 0, total: 0 });

  // Load account address from localStorage
  useEffect(() => {
    const account = JSON.parse(localStorage.getItem("accountDetails") || "{}");
    if (account?.address) {
      setAddress(account.address);
      setAddressForm(account.address);
    }
  }, []);

  // Update price from backend
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        if (!cart.length) {
          setPriceSummary({ subtotal: 0, total: 0 });
          return;
        }
        const res = await getCartPrice(
          cart.map(item => ({ productId: item._id, qty: item.qty }))
        );
        setPriceSummary(res);
      } catch (e) { /* fail silently for UI */ }
    };
    fetchPrice();
  }, [cart, discount]);

  // Coupon verification via API
  const handleApplyCoupon = async () => {
    try {
      const res = await verifyCoupon(coupon);
      if (res.valid) {
        setCouponApplied(true);
        setDiscount(res.discount || 0);
      } else {
        setCouponApplied(false);
        setDiscount(0);
        alert("Invalid coupon");
      }
    } catch {
      setCouponApplied(false);
      setDiscount(0);
      alert("Error verifying coupon");
    }
  };

const handleSubmitOrder = async () => {
  if (cart.length === 0 || !address || !deliveryAllowed) {
    alert("⚠ Please add products to your cart and provide a valid shipping address.");
    return;
  }

  try {
    const orderPayload = {
      products: cart.map(item => `${item.name} (x${item.qty})`), // You can use IDs or formatted names
      coupon: couponApplied ? coupon : "",
      offer: "", // add logic if you're tracking special offers
      totalPrice: priceSummary.subtotal - discount,
      paymentMode: paymentMethod === "COD" ? "Cash" : paymentMethod // match your model enum
    };

    await submitOrder(orderPayload);

    alert("🎉 Your product has been ordered successfully!");
    clearCart();

    // Reset local states
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
  const handleAddressSave = (e) => {
    e.preventDefault();
    const stEntry = indianStatesAndCities.find(s => s.state === addressForm.state);
    const ctEntry = stEntry?.cities.find(c => c.name === addressForm.city);

    if (!stEntry?.active || !ctEntry?.active) {
      setDeliveryAllowed(false);
      setAddress(addressForm);
      setShowAddressForm(false);
      // Still save form so it persists in UI
      return;
    }
    setDeliveryAllowed(true);
    setAddress(addressForm);
    setShowAddressForm(false);

    // Save to localStorage
    const account = JSON.parse(localStorage.getItem("accountDetails") || "{}");
    localStorage.setItem(
      "accountDetails",
      JSON.stringify({ ...account, address: addressForm })
    );
  };

  return (
    <div className="cart-page">
      {/* Banner */}
      <section className="banner">
        <motion.div className="banner-content" variants={bannerContentVariants} initial="hidden" animate="visible">
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
            <div className="cart-products-list">
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
                      onClick={() => removeFromCart(item)}
                      aria-label="Remove from cart"
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
                        <button onClick={() => removeFromCart(item)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => addToCart(item)}>+</button>
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

              {/* Coupon Block */}
              <div className="cart-coupon-block">
                <input
                  className="cart-coupon-input"
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
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
                  <div className="cart-coupon-success">
                    Coupon applied: -₹{discount}
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
                  <form className="cart-address-form" onSubmit={handleAddressSave}>
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={addressForm.line1}
                      onChange={e =>
                        setAddressForm({ ...addressForm, line1: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={addressForm.line2}
                      onChange={e =>
                        setAddressForm({ ...addressForm, line2: e.target.value })
                      }
                    />
                    <select
                      required
                      value={addressForm.state}
                      onChange={e =>
                        setAddressForm({ ...addressForm, state: e.target.value, city: "" })
                      }
                    >
                      <option value="">-- Select State --</option>
                      {indianStatesAndCities.map((s) => (
                        <option key={s.state} value={s.state}>{s.state}</option>
                      ))}
                    </select>
                    <select
                      required
                      value={addressForm.city}
                      onChange={e =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                    >
                      <option value="">-- Select City --</option>
                      {(indianStatesAndCities.find(s => s.state === addressForm.state)?.cities || []).map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={addressForm.pincode}
                      onChange={e =>
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
                <label>
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

              {/* Cart Total */}
              <div className="cart-grand-total-row">
                <span className="cart-grand-total-label">Subtotal</span>
                <span className="cart-grand-total-value">
                  ₹{priceSummary.subtotal?.toFixed(2) ?? "0.00"}
                </span>
              </div>
              {couponApplied && (
                <div className="cart-grand-total-row">
                  <span className="cart-grand-total-label">Coupon Discount</span>
                  <span className="cart-grand-total-value">
                    -₹{discount?.toFixed(2) ?? "0.00"}
                  </span>
                </div>
              )}
              <div className="cart-grand-total-row cart-grand-total-final">
                <span className="cart-grand-total-label">Cart Total</span>
                <span className="cart-grand-total-value">
                  ₹{(priceSummary.subtotal - discount).toFixed(2)}
                </span>
              </div>

              <button
                className="cart-buy-btn"
                disabled={cart.length === 0 || !address || !deliveryAllowed}
                onClick={handleSubmitOrder}
              >
                Buy Now
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CartPage;

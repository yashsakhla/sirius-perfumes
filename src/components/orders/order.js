import React, { useEffect, useState } from "react";
import { fetchAccountDetails } from "../../services/api";
import { FaShoppingBag, FaBox, FaTruck, FaCheckCircle, FaArchive } from "react-icons/fa";
import "./order.css";

const STATUS_STEPS = [
  { label: "Ordered", icon: <FaShoppingBag /> },
  { label: "Packed", icon: <FaArchive /> },
  { label: "Shipped", icon: <FaTruck /> },
  { label: "Delivered", icon: <FaCheckCircle /> },
];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateBar, setAnimateBar] = useState(false);

  useEffect(() => {
    fetchAccountDetails().then(account => {
      setOrders(account.orderHistory || []);
      setLoading(false);
      setTimeout(() => setAnimateBar(true), 200); // Trigger bar animation after load
    });
  }, []);

  return (
    <main className="order-history-main">
      {/* Banner */}
      <section className="order-history-banner">
        <h1>
          <FaShoppingBag className="order-history-banner-icon" />
          Order History
        </h1>
        <p className="order-history-banner-desc">
          Track your orders and see your past purchases.
        </p>
      </section>

      {loading ? (
        <div className="order-history-loading">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="order-history-empty">No orders found.</div>
      ) : (
        <div className="order-history-list">
          {orders.map(order => {
            const currentIdx = STATUS_STEPS.findIndex(s => s.label === order.status);
            return (
              <div className="order-card" key={order.id}>
                {/* Animated Status Bar */}
                <div className={`order-status-bar${animateBar ? " animate" : ""}`}>
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isActive = idx === currentIdx;
                    return (
                      <div
                        className={
                          "order-status-step" +
                          (isCompleted ? " completed" : "") +
                          (isActive ? " active" : "")
                        }
                        key={step.label}
                      >
                        <div className="order-status-icon">{step.icon}</div>
                        <div className="order-status-label">{step.label}</div>
                        {idx < STATUS_STEPS.length - 1 && (
                          <div
                            className={
                              "order-status-line" +
                              (isCompleted ? " filled" : "") +
                              (isActive ? " active" : "")
                            }
                            style={{
                              animationDelay: animateBar ? `${idx * 0.4}s` : "0s",
                              animationDuration: "0.6s"
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="order-card-header">
                  <div>
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <div className="order-total">{order.total}</div>
                </div>
                <div className="order-desc">
                  {order.status === "Delivered"
                    ? "Enjoy your fragrance."
                    : `Order is likely to be delivered by ${order.expectedDelivery || "soon"}.`}
                </div>
                <div className="order-products">
                  {order.products.map(product => (
                    <div className="order-product-card" key={product.id}>
                      <img
                        src={require(`../../images/${product.img}`)}
                        alt={product.name}
                        className="order-product-img"
                      />
                      <div className="order-product-info">
                        <div className="order-product-name">{product.name}</div>
                        <div className="order-product-size">{product.size}</div>
                        <div className="order-product-qty">Qty: {product.qty}</div>
                        <div className="order-product-price">{product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

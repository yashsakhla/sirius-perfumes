import React from "react";
import { motion } from "framer-motion";
import { FaStopCircle } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import "./confirm-order.css";

export default function OrderPending() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId"); // Get 'id' query param


  return (
    <div className="container">
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="check-icon"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          <FaStopCircle size={90} color="#f4d136ff" />
            <h1 className="title yellow">Order Pending!</h1>
        </motion.div>

        <div className="image">
          <img
            className="order-confirm-image"
            src={require("../../images/pending.png")}
            alt="confirm-order"
          />
        </div>

        <p className="message red">
          Thank you for your purchase. Your order is currently being processed.
        </p>

        {orderId && (
          <p className="order-id-display">
            Your Order ID is: <strong>{orderId}</strong>
          </p>
        )}

        <button className="button">
          <a href="https://wa.me/+919370917752" target="_blank" className="link" rel="noopener noreferrer">
                                Contact Support
                              </a>
        </button>
      </motion.div>
    </div>
  );
}

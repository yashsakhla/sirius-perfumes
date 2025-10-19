import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import "./confirm-order.css";

export default function OrderConfirmation() {
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
  <FaCheckCircle size={90} color="#4CAF50" />
           <h1 className="title">Order Confirmed!</h1>
        </motion.div>

        <div className="image">
          <img
            className="order-confirm-image"
            src={require("../../images/order-confirm.jpg")}
            alt="confirm-order"
          />
        </div>

       

        <p className="message">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {orderId && (
          <p className="order-id-display">
            Your Order ID is: <strong>{orderId}</strong>
          </p>
        )}

        <button className="button">
          <Link className="link" to="/account">
            See Order Details
          </Link>
        </button>
      </motion.div>
    </div>
  );
}

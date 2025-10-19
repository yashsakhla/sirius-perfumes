import React from "react";
import { motion } from "framer-motion";
import { FaWindowClose } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import "./confirm-order.css";

export default function OrderFailed() {
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
          <FaWindowClose size={90} color="#f01008ff" />
           <h1 className="title red">Order Failed!</h1>
        </motion.div>

        <div className="image">
          <img
            className="order-confirm-image"
            src={require("../../images/failed.png")}
            alt="confirm-order"
          />
        </div>

        <h1 className="title red">Order Failed!</h1>
        <p className="message">
          We're sorry, but there was an issue with your order, Please contact Support.
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

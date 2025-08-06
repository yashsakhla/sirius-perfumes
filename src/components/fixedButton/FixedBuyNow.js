import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./FixedBuyNow.css";

export default function FixedBuyNow({ count }) {
  const navigate = useNavigate();
  if (count < 1) return null;
  return (
    <button className="fixed-buy-btn" onClick={() => navigate("/cart")}>
      <FaShoppingCart style={{ marginRight: "0.5rem" }} />
      Buy Now <span className="fixed-buy-count">{count}</span>
    </button>
  );
}

import React from "react";
import styles from "./DeliveryTimeline.module.css";

export default function DeliveryTimeline() {
  const today = new Date();

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const deliveryStart = new Date();
  deliveryStart.setDate(today.getDate() + 3);

  const deliveryEnd = new Date();
  deliveryEnd.setDate(today.getDate() + 4);

  const getOrdinal = (day) => {
    if (day > 3 && day < 21) return day + "th";
    switch (day % 10) {
      case 1: return day + "st";
      case 2: return day + "nd";
      case 3: return day + "rd";
      default: return day + "th";
    }
  };

  return (
    <div className={styles.container}>
      {/* Order Placed */}
      <div className={styles.step}>
        <div className={styles.icon}>🛒</div>
        <p className={styles.date}>
          {getOrdinal(today.getDate())}
        </p>
        <p className={styles.label}>Order Placed</p>
      </div>

      <div className={styles.line}></div>

      {/* Order Shipped */}
      <div className={styles.step}>
        <div className={styles.icon}>🚚</div>
        <p className={styles.date}>
          {getOrdinal(tomorrow.getDate())}–
          {getOrdinal(dayAfterTomorrow.getDate())}
        </p>
        <p className={styles.label}>Order Shipped</p>
      </div>

      <div className={styles.line}></div>

      {/* Estimated Delivery */}
      <div className={styles.step}>
        <div className={styles.icon}>📦</div>
        <p className={styles.date}>
          {getOrdinal(deliveryStart.getDate())}–
          {getOrdinal(deliveryEnd.getDate())}
        </p>
        <p className={styles.label}>Estimated Delivery</p>
      </div>
    </div>
  );
}

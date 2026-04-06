import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNotifications } from "../../services/api";
import "./popup.css";

/** Dismissed id — new notification id will show again */
export const NOTIFICATION_DISMISS_STORAGE_KEY = "siriusNotificationDismissedId";

function normalizeNotificationList(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.notifications)) return payload.notifications;
    if (Array.isArray(payload.results)) return payload.results;
    if (payload.notification && typeof payload.notification === "object") {
      return [payload.notification];
    }
    if (payload.heading) return [payload];
  }
  return [];
}

function pickActiveNotification(payload) {
  const list = normalizeNotificationList(payload);
  return (
    list.find(
      (n) =>
        n &&
        String(n.status || "").toLowerCase() === "active" &&
        String(n.heading || "").trim()
    ) ?? null
  );
}

function notificationStableId(n) {
  if (n._id != null) return String(n._id);
  const u = n.updatedAt || n.createdAt || "";
  return `${String(n.heading)}::${u}`;
}

function resolveImageUrl(notification) {
  const img = notification?.image;
  if (img == null) return null;
  if (typeof img === "string" && img.trim()) return img.trim();
  if (Array.isArray(img) && img.length && typeof img[0] === "string" && img[0].trim()) {
    return img[0].trim();
  }
  return null;
}

/**
 * Home announcement: loads `/api/notifications`, shows first `active` item.
 * Fields: heading, description, content, image (URL string), status (active | inactive).
 */
export default function NotificationPopup() {
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchNotifications();
        if (cancelled) return;
        const n = pickActiveNotification(data);
        if (!n) return;
        const id = notificationStableId(n);
        const dismissed = localStorage.getItem(NOTIFICATION_DISMISS_STORAGE_KEY);
        if (dismissed === id) return;
        setImageFailed(false);
        setNotification(n);
        setOpen(true);
      } catch (e) {
        console.warn("Notifications unavailable:", e?.message || e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (notification) {
      localStorage.setItem(
        NOTIFICATION_DISMISS_STORAGE_KEY,
        notificationStableId(notification)
      );
    }
  }, [notification]);

  if (!open || !notification) return null;

  const { heading, description, content } = notification;
  const imageUrl = resolveImageUrl(notification);
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <div className="offer-popup-overlay" onClick={close}>
      <div
        className={`offer-popup offer-popup--dynamic${showImage ? " offer-popup--with-image" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-popup-title"
      >
        <button
          type="button"
          className="offer-popup-close"
          onClick={close}
          aria-label="Close notification"
        >
          ×
        </button>
        <div className="offer-popup-layout">
          {showImage ? (
            <div className="offer-popup-media">
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
              />
            </div>
          ) : null}
          <div className="offer-popup-body">
            <h2 id="notification-popup-title" className="offer-popup-heading">
              {heading}
            </h2>
            {description ? (
              <p className="offer-popup-description">{description}</p>
            ) : null}
            {content ? (
              <div className="offer-popup-content-text">{content}</div>
            ) : null}
            <Link
              to="/shop"
              className="shop-button offer-popup-cta"
              onClick={close}
            >
              Shop now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

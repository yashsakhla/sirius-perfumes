import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGift, FaPlus, FaTimes, FaCheck } from "react-icons/fa";
import { useCart } from "../../services/cartContext";
import {
  normalizeSizeEntries,
  getPriceForSize,
  resolveSizeLabel,
} from "../../utils/productSizes";
import {
  filterPickableProductsForGiftSize,
  computeGiftBundleUnitPrice,
  isGiftProduct,
} from "../../utils/giftProduct";
import "./GiftCustomizePanel.css";

const MAX_SLOTS = 4;

function normSizeKey(s) {
  return String(resolveSizeLabel(s) || s || "").trim().toLowerCase();
}

function GiftCustomizePanel({
  giftProduct,
  giftSize,
  allProducts,
  onClose,
  isSoldOut,
}) {
  const navigate = useNavigate();
  const { addGiftBundleToCart } = useCart();
  const [chosen, setChosen] = useState([]);

  const pickable = useMemo(
    () => filterPickableProductsForGiftSize(allProducts || [], giftSize),
    [allProducts, giftSize]
  );

  const giftUnitPrice = useMemo(
    () => getPriceForSize(giftProduct, giftSize),
    [giftProduct, giftSize]
  );

  const chosenTotal = useMemo(
    () =>
      chosen.reduce(
        (s, row) =>
          s + getPriceForSize(row.product, resolveSizeLabel(row.size) || row.size),
        0
      ),
    [chosen]
  );

  const grandTotal = giftUnitPrice + chosenTotal;

  const canAddAnother = chosen.length < MAX_SLOTS;

  const isPairTaken = (productId, sizeKey) =>
    chosen.some(
      (c) =>
        c.product._id === productId &&
        normSizeKey(c.size) === normSizeKey(sizeKey)
    );

  const handleAddRow = (product, sizeForRow) => {
    const sz = resolveSizeLabel(sizeForRow) || sizeForRow;
    if (!canAddAnother || isPairTaken(product._id, sz)) return;
    setChosen((prev) => [...prev, { product, size: sz }]);
  };

  const handleRemoveAt = (index) => {
    setChosen((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddToBag = () => {
    if (chosen.length === 0 || isSoldOut) return;
    addGiftBundleToCart({
      giftProduct,
      giftSize: resolveSizeLabel(giftSize) || giftSize,
      chosenPairs: chosen,
    });
    onClose?.();
    navigate("/cart");
  };

  return (
    <div className="gift-customize">
      <div className="gift-customize__header">
        <div className="gift-customize__header-text">
          <FaGift className="gift-customize__header-icon" aria-hidden />
          <div>
            <h2 className="gift-customize__title">Build your gift box</h2>
            <p className="gift-customize__subtitle">
              Box size: <strong>{resolveSizeLabel(giftSize) || giftSize}</strong>
              {" · "}
              Add 1–{MAX_SLOTS} fragrances ({chosen.length}/{MAX_SLOTS})
            </p>
          </div>
        </div>
        <button
          type="button"
          className="gift-customize__close"
          onClick={onClose}
          aria-label="Close customization"
        >
          <FaTimes />
        </button>
      </div>

      <div className="gift-customize__summary-bar">
        <div className="gift-customize__summary-prices">
          <span>
            Gift box <em>₹{giftUnitPrice.toFixed(2)}</em>
          </span>
          <span className="gift-customize__summary-plus">+</span>
          <span>
            Scents <em>₹{chosenTotal.toFixed(2)}</em>
          </span>
        </div>
        <div className="gift-customize__summary-total">
          Total <strong>₹{grandTotal.toFixed(2)}</strong>
        </div>
      </div>

      {chosen.length > 0 && (
        <ul className="gift-customize__picked">
          {chosen.map((row, idx) => (
            <li key={`${row.product._id}-${row.size}-${idx}`} className="gift-customize__picked-row">
              <img
                src={
                  row.product.image ||
                  (Array.isArray(row.product.images) && row.product.images[0]) ||
                  ""
                }
                alt=""
                className="gift-customize__picked-img"
              />
              <div className="gift-customize__picked-meta">
                <span className="gift-customize__picked-name">{row.product.name}</span>
                <span className="gift-customize__picked-size">{row.size}</span>
              </div>
              <span className="gift-customize__picked-price">
                ₹{getPriceForSize(row.product, row.size).toFixed(2)}
              </span>
              <button
                type="button"
                className="gift-customize__picked-remove"
                onClick={() => handleRemoveAt(idx)}
                aria-label="Remove"
              >
                <FaTimes />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="gift-customize__catalog">
        <h3 className="gift-customize__catalog-title">Choose fragrances</h3>
        <p className="gift-customize__catalog-hint">
          {pickable.length === 0
            ? "No other products loaded."
            : `Showing scents that match “${resolveSizeLabel(giftSize) || giftSize}” when available; otherwise all fragrances.`}
        </p>
        <div className="gift-customize__grid">
          {pickable
            .filter((p) => p._id !== giftProduct._id && !isGiftProduct(p))
            .map((p) => (
              <PickRow
                key={p._id}
                product={p}
                preferredSize={giftSize}
                disabled={!canAddAnother || isSoldOut}
                onAdd={handleAddRow}
                isTaken={(sz) => isPairTaken(p._id, sz)}
              />
            ))}
        </div>
      </div>

      <div className="gift-customize__footer">
        <button
          type="button"
          className="gift-customize__cta"
          disabled={chosen.length === 0 || isSoldOut}
          onClick={handleAddToBag}
        >
          <FaCheck aria-hidden />
          Add gift to bag — ₹{grandTotal.toFixed(2)}
        </button>
      </div>
    </div>
  );
}

function PickRow({ product, preferredSize, disabled, onAdd, isTaken }) {
  const entries = useMemo(() => normalizeSizeEntries(product), [product]);

  const pref = resolveSizeLabel(preferredSize) || preferredSize;

  const [localSize, setLocalSize] = useState(() => {
    const next =
      entries.find((e) => normSizeKey(e.size) === normSizeKey(pref))?.size ??
      entries[0]?.size ??
      "";
    return next;
  });

  useEffect(() => {
    const ent = normalizeSizeEntries(product);
    const next =
      ent.find((e) => normSizeKey(e.size) === normSizeKey(pref))?.size ??
      ent[0]?.size ??
      "";
    setLocalSize(next);
  }, [product._id, pref, product]);

  const taken = isTaken(localSize);
  const price = getPriceForSize(product, localSize);

  return (
    <div className="gift-customize__card">
      <div className="gift-customize__card-media">
        {product.image || (product.images && product.images[0]) ? (
          <img
            src={product.image || product.images[0]}
            alt=""
            className="gift-customize__card-img"
          />
        ) : (
          <div className="gift-customize__card-img gift-customize__card-img--empty" />
        )}
      </div>
      <div className="gift-customize__card-body">
        <span className="gift-customize__card-name">{product.name}</span>
        {entries.length > 0 && (
          <label className="gift-customize__card-size-label">
            Size
            <select
              className="gift-customize__card-select"
              value={localSize}
              onChange={(e) => setLocalSize(e.target.value)}
            >
              {entries.map((e, i) => {
                const v = resolveSizeLabel(e.size);
                if (!v) return null;
                return (
                  <option key={i} value={v}>
                    {v}
                  </option>
                );
              })}
            </select>
          </label>
        )}
        <div className="gift-customize__card-row">
          <span className="gift-customize__card-price">₹{price.toFixed(2)}</span>
          <button
            type="button"
            className="gift-customize__card-add"
            disabled={disabled || taken || !localSize}
            onClick={() => onAdd(product, localSize)}
          >
            <FaPlus size={12} />
            Add
          </button>
        </div>
        {taken && (
          <span className="gift-customize__card-note">Already in box</span>
        )}
      </div>
    </div>
  );
}

export default GiftCustomizePanel;

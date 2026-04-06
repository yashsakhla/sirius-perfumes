import React, { createContext, useContext, useState } from "react";
import { useToaster } from "./toasterContext"; // adjust path as needed
import { getPriceForSize, resolveSizeLabel } from "../utils/productSizes";
import {
  computeGiftBundleUnitPrice,
  isGiftProduct,
} from "../utils/giftProduct";


const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { showToast } = useToaster();

  const getFirstImage = (p) => {
    if (!p) return "";
    if (typeof p.image === "string" && p.image) return p.image;
    if (Array.isArray(p.images) && p.images.length) return p.images[0];
    return "";
  };

  const addToCart = (product, selectedSize) => {
    if (product && isGiftProduct(product)) {
      showToast("Use Customize on the gift page to build your box");
      return;
    }
    const sizeToUse = String(
      selectedSize ?? product?.size ?? ""
    ).trim();
    const imageToUse = getFirstImage(product);
    const variantPrice = getPriceForSize(product, sizeToUse);

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item._id === product._id &&
          String(item.size ?? "").trim() === sizeToUse
      );

      if (existing) {
        showToast("Product added to bag");
        return prev.map((item) =>
          item._id === product._id &&
          String(item.size ?? "").trim() === sizeToUse
            ? {
                ...item,
                qty: item.qty + 1,
                size: sizeToUse,
                discountedPrice: variantPrice,
                price: variantPrice,
                image: imageToUse,
              }
            : item
        );
      }

      showToast("Product added to bag");
      return [
        ...prev,
        {
          ...product,
          image: imageToUse,
          size: sizeToUse,
          discountedPrice: variantPrice,
          price: variantPrice,
          qty: 1,
        },
      ];
    });
  };

  /** `line` must be the cart line (includes `_id` and variant `size` when applicable). */
  const removeFromCart = (line) => {
    const id = line._id;
    const sizeKey = String(line.size ?? "").trim();
    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id !== id) return item;
          if (String(item.size ?? "").trim() !== sizeKey) return item;
          if (item.isGiftBundle) {
            return { ...item, qty: item.qty - 1 };
          }
          return { ...item, qty: item.qty - 1 };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const addGiftBundleToCart = ({ giftProduct, giftSize, chosenPairs }) => {
    const giftSizeLabel = resolveSizeLabel(giftSize) || String(giftSize ?? "").trim();
    const total = computeGiftBundleUnitPrice(giftProduct, giftSizeLabel, chosenPairs);
    const imageToUse = getFirstImage(giftProduct);
    const chosenProducts = (chosenPairs || []).map(({ product, size }) => ({
      productId: product._id,
      size: resolveSizeLabel(size) || String(size ?? "").trim(),
      name: product.name,
      image: getFirstImage(product),
    }));

    setCart((prev) => {
      const withoutSame = prev.filter(
        (item) =>
          !(
            item.isGiftBundle &&
            item._id === giftProduct._id &&
            String(item.giftSize ?? "").trim() === giftSizeLabel
          )
      );
      showToast("Custom gift added to bag");
      return [
        ...withoutSame,
        {
          ...giftProduct,
          name: `${giftProduct.name} (custom gift)`,
          image: imageToUse,
          size: giftSizeLabel,
          qty: 1,
          discountedPrice: total,
          price: total,
          basicPrice: null,
          isGiftBundle: true,
          giftProductId: giftProduct._id,
          giftSize: giftSizeLabel,
          chosenProducts,
        },
      ];
    });
  };

  const clearCart = () => {
    setCart([]);
    showToast("Cart cleared after placing order");
  };


  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, addGiftBundleToCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

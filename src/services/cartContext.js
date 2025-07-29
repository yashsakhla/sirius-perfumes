import React, { createContext, useContext, useState } from "react";
import { useToaster } from "./toasterContext"; // adjust path as needed

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { showToast } = useToaster();

const addToCart = (product) => {
  setCart((prev) => {
    const existing = prev.find((item) => item._id === product._id);
    if (existing) {
      showToast("Product added to bag");
      return prev.map((item) =>
        item._id === product._id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      showToast("Product added to bag");
      return [...prev, { ...product, qty: 1 }];
    }
  });
};

const removeFromCart = (product) => {
  setCart((prev) =>
    prev
      .map((item) =>
        item._id === product._id ? { ...item, qty: item.qty - 1 } : item
      )
      .filter((item) => item.qty > 0)
  );
};


  const clearCart = () => {
    setCart([]);
    showToast("Cart cleared after placing order");
  };


  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

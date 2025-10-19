import axios from 'axios';
import axiosInstance from './axiosInstance';
import { url } from '../env.config';

// 🔐 Login with Google
export const loginUser = async ({ idToken }) => {
  const res = await axios.post(`${url}/api/auth/google`, { idToken });
  return res.data;
};

// 🧑‍💼 Get user account
export const fetchAccountDetails = async () => {
  const res = await axiosInstance.get(`${url}/api/user/account`);
  return res.data;
};

// ✏️ Update user account
export const updateAccountDetails = async (payload) => {
  const res = await axiosInstance.put(`${url}/api/user/update-account`, payload);
  return res.data;
};

// 🛍️ Get products grouped by category (homepage)
export const getGroupedProducts = async () => {
  const res = await axiosInstance.get(`${url}/api/perfumes/category-products`);
  return res.data;
};

// Replace or add in your API file:
export const getAllProducts = async () => {
 const res = await axiosInstance.get(`${url}/api/perfumes/products`);
 return res.data;
};

export const getCategories = async () => {
  const res = await axiosInstance.get(`${url}/api/categories`);
  return res.data;
};

export const verifyCoupon = async (code) => {
  const res = await axiosInstance.post(`${url}/api/perfumes/offer/verify`, { code });
  return res.data; // { valid: true, discount: 10 }
};

export const getCartPrice = async (products) => {
  console.log(products)
  const res = await axiosInstance.post(`${url}/api/perfumes/cart-price`, products );
  return res.data; // e.g., { subtotal: 500, total: 490, discount: 10 }
};

export const submitOrder = async (orderData) => {
  const res = await axiosInstance.post("/api/orders", orderData);
  return res.data;
};

export const fetchUserOrders = async (id) => {
  const res = await axiosInstance.get(`/api/orders/user/${id}`);
  return res.data;
};


export const createPayment = async (payload) => {
  const res = await axiosInstance.post(`${url}/api/payment/phonepe/create`, payload);
  return res.data;
}

export const getToken = async (payload) => {
  const res = await axiosInstance.post(`${url}/api/payment/token`, payload);
  return res.data;
}

export const updateOrderStatus = async (payload) => {
  const res = await axiosInstance.post(`${url}/api/payment/update-order-status`, payload);
  return res.data;
}
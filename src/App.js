import React from 'react';
import './App.css';
import Header from "./components/header/header";
import Home from "./components/home/home";
import Shop from "./components/shop/shop";
import Footer from "./components/footer/footer";
import Cart from "./components/cart/cart";
import Login from "./components/login/login";
import OrderHistoryPage from './components/orders/order';
import { ToasterProvider } from './services/toasterContext';
import { CartProvider } from './services/cartContext';
import { Routes, Route, useLocation, Navigate, useMatch,  } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/guard/protcatedRoute';
import { ScrollToTop } from './shared/ScrollToTop';
import Account from './components/account/account';
import ExclusiveMembers from './components/members/members';
import Policy from './components/policy/policy';
import OrderConfirmed from './components/confirm-order/confirm-order';
import OrderPending from './components/confirm-order/pending.order';
import OrderFailed from './components/confirm-order/failed.order';
import { UserProvider } from './services/userContext';
import TopBar from './components/header/topbar';
import ProductDetails from './components/productdetails/productDetails';

import ScrollingTextBar from './components/scroollingtextbar/scrollingtextbar';

function App() {
  const location = useLocation();
  const showTopBar = location.pathname.startsWith("/product");
   const isProductPage = useMatch("/product/:productId");

  return (
    <GoogleOAuthProvider clientId="770410043587-phg02n0np9ultvijmts6bnvop28f0rvb.apps.googleusercontent.com">
      <UserProvider>
        <div className="app">
          <ToasterProvider>
            <CartProvider>
              <ScrollToTop />

              {isProductPage ? <TopBar /> : <ScrollingTextBar />}

              <Header />

              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/members" element={<ExclusiveMembers />} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/order" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                <Route path="/privacy-policy" element={<Policy />} />
                <Route path="/order-confirmed" element={<OrderConfirmed />} />
                <Route path="/order-pending" element={<OrderPending />} />
                <Route path="/order-failed" element={<OrderFailed />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
             
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>

              <Footer />
            </CartProvider>
          </ToasterProvider>
        </div>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

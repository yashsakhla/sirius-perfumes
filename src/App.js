import logo from './logo.svg';
import React from 'react';
import './App.css';
import Header from "./components/header/header";
import Home from "./components/home/home";
import Shop from "./components/shop/shop"; // Import your Shop page
import Footer from "./components/footer/footer";
import Cart from "./components/cart/cart"
import Login from "./components/login/login"
import OrderHistoryPage from './components/orders/order';
import { ToasterProvider } from './services/toasterContext';
import { CartProvider } from './services/cartContext';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/guard/protcatedRoute';
import { ScrollToTop } from './shared/ScrollToTop';
import Account from './components/account/account';
import { Navigate } from 'react-router-dom';
import ExclusiveMembers from './components/members/members';
import Policy from './components/policy/policy';
import OrderConfirmed from './components/confirm-order/confirm-order';
import OrderPending from './components/confirm-order/pending.order';
import OrderFailed from './components/confirm-order/failed.order';
import { UserProvider } from './services/userContext';

function App() {
  return (
    <GoogleOAuthProvider clientId="770410043587-phg02n0np9ultvijmts6bnvop28f0rvb.apps.googleusercontent.com">
      <React.StrictMode>
        <UserProvider>
          <div className="app">
            <ToasterProvider>
              <CartProvider>
                <Router>
                  <ScrollToTop />
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
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                  <Footer />
                </Router>
              </CartProvider>
            </ToasterProvider>
          </div>
        </UserProvider>
      </React.StrictMode>
    </GoogleOAuthProvider>
  );
}


export default App;

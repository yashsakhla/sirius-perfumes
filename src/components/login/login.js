import React from "react";
import { motion } from "framer-motion";
import { FaShoppingBag, FaUser } from "react-icons/fa";
import { GoogleLogin } from '@react-oauth/google';
import { fetchAccountDetails, loginUser, updateAccountDetails } from "../../services/api";
import { useUser } from "../../services/userContext";
import { Navigate } from "react-router-dom";
import "./login.css";

const bannerContentVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      when: "beforeChildren",
      staggerChildren: 0.15,
    },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

export default function LoginPage() {
  const { user, setUser } = useUser();

  /** ✅ Handles Google login success */
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      // Send idToken to backend
      const res = await loginUser({ idToken });

      // Handle failure
      if (!res.token) {
        alert(`Login failed: ${res.message || "No token returned from backend."}`);
        return;
      }

      // Save token & user
      localStorage.setItem("authToken", res.token);                // App's JWT
      localStorage.setItem("googleUser", JSON.stringify(res.user));// User info cache
      setUser(res.user);                                           // Update context

    } catch (err) {
      alert("Login failed due to a network or server issue.");
      console.error("Login error:", err);
    }
  };

  /** If login fails */
  const handleGoogleError = () => {
    alert("Google login failed");
  };

  // 🔄 Auto redirect on login
  if (user) {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="login-page">
      {/* Banner */}
      <section className="banner">
        <motion.div
          className="banner-content"
          variants={bannerContentVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="banner-label" variants={itemVariants}>
            SIRIUS PERFUMES
          </motion.span>
          <motion.h1 className="banner-header" variants={itemVariants}>
            LOGIN <FaShoppingBag size={40} />
          </motion.h1>
          <motion.p className="banner-desc" variants={itemVariants}>
            SIGN IN TO CONTINUE
          </motion.p>
        </motion.div>
      </section>

      {/* Google Login Button */}
      <div className="account-content">
        <div className="account-section" style={{ textAlign: "center" }}>
          <FaUser size={32} style={{ color: "#000", marginBottom: "1rem" }} />
          <h2 className="login-title" style={{ fontWeight: 600 }}>Login with Google</h2>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width="100%"
            text="signin_with"
            shape="pill"
            logo_alignment="left"
          />
        </div>
      </div>
    </div>
  );
}

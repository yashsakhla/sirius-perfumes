import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaShoppingBag, FaUser } from "react-icons/fa";
import { GoogleLogin } from '@react-oauth/google';
import { loginUser } from "../../services/api";
import { useUser } from "../../services/userContext";
import { Navigate } from "react-router-dom";

import Loader from "../loader/loader";
import ErrorPopup from "../error-popup/Error-popup";

import "./login.css";

const bannerVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, when: "beforeChildren", staggerChildren: 0.15 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

export default function LoginPage() {
  const { user, setUser } = useUser();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const idToken = credentialResponse.credential;

      const res = await loginUser({ idToken });

      if (!res.token) {
        setErrorMessage(res.message || "Login failed: no token received.");
        setLoading(false);
        return;
      }

      localStorage.setItem("authToken", res.token);
      localStorage.setItem("googleUser", JSON.stringify(res.user));
      setUser(res.user);

    } catch (err) {
      setErrorMessage("Login failed due to a network or server error.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage("Google Sign-In failed. Please try again.");
  };

  const closeErrorPopup = () => setErrorMessage("");

  if (user) {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="login-page">
      {loading && <Loader />}
      {errorMessage && <ErrorPopup message={errorMessage} onClose={closeErrorPopup} />}

      <section className="banner">
        <motion.div className="banner-content" variants={bannerVariants} initial="hidden" animate="visible">
          <motion.span className="banner-label" variants={itemVariants}>SIRIUS PERFUMES</motion.span>
          <motion.h1 className="banner-header" variants={itemVariants}>
            LOGIN <FaShoppingBag size={40} />
          </motion.h1>
          <motion.p className="banner-desc" variants={itemVariants}>
            SIGN IN TO CONTINUE
          </motion.p>
        </motion.div>
      </section>

      <div className="login-box" style={{ maxWidth: 400, margin: "3rem auto", textAlign: "center" }}>
        <FaUser size={32} style={{ marginBottom: 16, color: "#333" }} />
        <h2 style={{ fontWeight: 600, marginBottom: 24 }}>Login with Google</h2>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          btnText="Sign in with Google"
          width="100%"
          shape="pill"
          logo_alignment="left"
          disabled={loading}
        />
      </div>
    </div>
  );
}

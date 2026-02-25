import React from "react";
import { FaEnvelope, FaPhoneAlt, FaTruck } from "react-icons/fa";

const TopBar = () => {
    return (
        <div
            style={{
                backgroundColor: "#ff9431",
                color: "#fff",
                padding: "8px 0",
                position: "fixed",
                top: 0,
                width: "100%",
                zIndex: 10000,
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "30px",
                    flexWrap: "wrap",
                    fontSize: "14px",
                    fontWeight: "500"
                }}
            >
                {/* Delivery Text */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaTruck />
                    <span>Delivery in 4–5 days</span>
                </div>

                {/* Email  */}
                <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=info@trinestsky.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        textDecoration: "none",
                        color: "#fff",
                    }}
                >
                    {/* <FaEnvelope />
                    info@sirius.com */}
                </a>

                {/* Phone */}
                <div
                    onClick={(e) => {
                        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                        if (!isMobile) {
                            e.preventDefault();
                            alert("Calling is only supported on mobile devices.");
                        } else {
                            window.location.href = "tel:+917620457636";
                        }
                    }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                    }}
                >
                  
                </div>
            </div>
        </div>
    );
};

export default TopBar;

import "./productDetails.css";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../services/api";
import whatsapp from "../../images/whatsapp.png";
import DeliveryTimeline from "./DeliveryTimeline";
import { useCart } from "../../services/cartContext";

const ProductDetails = () => {
    const faqData = [{ q: "Do you deliver Sirius perfumes all over India?", a: "Yes, we offer pan-India delivery to every city and town.Delivery timelines usually range from 3–7 business days depending on your location and courier partner." }, { q: "How do I track my order?", a: "Once your order is shipped, you’ll receive a tracking number by email/ SMS that you can use to follow the delivery status with the courier." }, { q: "Are customs duties or extra fees applicable?", a: "Since products are shipped domestically from our Indian warehouse or authorised partner, no additional customs charges are usually levied." }, { q: "What payment options do you accept?", a: "We accept all major Indian payment methods - UPI, debit/credit cards, net banking, wallets (e.g. Paytm, PhonePe, Google Pay), and Cash on Delivery (COD) where available." }, { q: "Is online payment secure?", a: "Yes, all payment transactions are processed through secure, encrypted gateways to protect your financial information." }, { q: "Are Sirius perfumes original?", a: "Yes, all Sirius fragrances sold on our site are 100% authentic and genuine, sourced directly from authorised distributors or official brand supply chains." }, { q: "How can I be sure the perfume is real?", a: "Each box is supplied in original packaging, with batch codes and label details consistent with brand standards." }, { q: "Can I return or exchange a perfume if I don’t like it?", a: "Due to the nature of fragrance products, returns are accepted only if the item is damaged, incorrect, or defective. Please contact customer care within 48 hours of receiving your order with photos." }, { q: "What if my perfume arrives damaged?", a: " If the bottle or packaging is damaged in transit, notify us immediately with proof, and we’ll replace it or refund your order." }, { q: "How do I choose the right Sirius perfume for me?", a: "Check the fragrance notes (top, heart, and base) in the product description to match your preferences - e.g., fresh, woody, floral, spicy - before buying. Reviews and descriptions help too." }, { q: "How long will the perfume last on my skin?", a: "Longevity varies by concentration (e.g., Eau de Parfum vs. Eau de Toilette) and your skin chemistry, but most quality perfumes last 7–10 hours or more." }, { q: "How should I store my perfume?", a: "Keep it in a cool, dry place away from direct sunlight to preserve its scent and quality." }, { q: "Why does perfume smell different on me than in the bottle?", a: "Perfume interacts with your skin chemistry, weather, and body temperature, especially in India’s varied climate - this can change how a fragrance unfolds on your skin. " }, { q: "Do you offer samples or travel sizes?", a: "Yes, we offer sample bottles or decants so you can try before investing in full-size bottles." },];



    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // ✅ State
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [openFaq, setOpenFaq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFullDesc, setShowFullDesc] = useState(false);

    // ✅ Fetch Product
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await getProductById(productId);
                const data = res?.data ? res.data : res;
                setProduct(data);
                setMainImage(data?.image || "");
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    if (loading) return <h2 style={{ padding: "50px" }}>Loading...</h2>;
    if (!product) return <h2 style={{ padding: "50px" }}>Product not found</h2>;

    const discountPercent =
        product?.basicPrice && product?.discountedPrice
            ? Math.round(
                ((product.basicPrice - product.discountedPrice) /
                    product.basicPrice) *
                100
            )
            : 0;

    const handleWhatsApp = () => {
        const message = `Hi, I want to buy ${product.name}`;
        window.open(
            `https://wa.me/919370917752?text=${encodeURIComponent(message)}`,
            "_blank"
        );
    };

    const handleAddToCart = () => {
        if (product) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
        }
    };

    const handleBuyNow = () => {
        if (product) {
            addToCart(product);
            navigate("/cart");
        }
    };

    return (
        <div className="product-container">
            <div className="product-wrapper">
                {/* LEFT */}
                <div className="left-section">
                    <div className="main-image-container">
                        <img
                            src={mainImage || "fallback-image-url"}
                            alt={product.name}
                            className="main-img"
                        />
                    </div>
                </div>

                {/* RIGHT */}
                <div className="right-section">
                    <h1 className="title">{product.name}</h1>

                    <div className="price-box">
                        <span className="new-price">₹{product.discountedPrice}</span>
                        <span className="old-price">₹{product.basicPrice}</span>
                        <span className="discount-badge">{discountPercent}% OFF</span>
                    </div>


                    {/* Description */}
                    <div className="description">
                        <h4>Product Description</h4>

                        <div className={`desc-wrapper ${showFullDesc ? "open" : ""}`}>
                            <p className="desc-text">{product.description}</p>
                        </div>

                        <button
                            className="read-more-btn"
                            onClick={() => setShowFullDesc(!showFullDesc)}
                        >
                            {showFullDesc ? "Read Less" : "Read More"}
                        </button>
                    </div>

                    {/* Quantity */}
                    <div className="qty-section">
                        Quantity:
                        <div className="qty-button">
                            <button
                                onClick={() =>
                                    setQuantity(quantity > 1 ? quantity - 1 : 1)
                                }
                            >
                                -
                            </button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>
                                +
                            </button>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="button-group">
                        <button className="cart-btn" onClick={handleAddToCart}>
                            Add to Cart
                        </button>
                        <button className="buy-btn" onClick={handleBuyNow}>
                            Buy Now
                        </button>
                    </div>

                    <DeliveryTimeline />
                </div>
            </div>

            {/* FAQ */}
            <div className="faq-full-wrapper">
                <div className="faq-section">
                    <h2 className="faq-title">FAQs</h2>

                    {faqData.map((faq, index) => (
                        <div key={index} className="faq-item">
                            <button
                                className="faq-question"
                                onClick={() =>
                                    setOpenFaq(openFaq === index ? null : index)
                                }
                            >
                                <span>{faq.q}</span>
                                <span
                                    className={`faq-icon ${openFaq === index ? "open" : ""
                                        }`}
                                >
                                    ▾
                                </span>
                            </button>

                            <div
                                className={`faq-answer-wrapper ${openFaq === index ? "show" : ""
                                    }`}
                            >
                                <div className="faq-answer">{faq.a}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* WhatsApp */}
            <button className="whatsapp-btn" onClick={handleWhatsApp}>
                <img src={whatsapp} alt="WhatsApp" className="icon" />
            </button>
        </div>
    );
};

export default ProductDetails;
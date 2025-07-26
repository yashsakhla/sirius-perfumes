// src/pages/ShopPage.js
import React, { useEffect, useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import { motion } from "framer-motion";
import FilterSidebar from "../filter/filter";
import ProductCard from "../product-card/product-card";
import { useCart } from "../../services/cartContext";
import { getAllProducts } from "../../services/api";
import Loader from "../loader/loader";
import "./shop.css";

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

function ShopPage() {
  const { addToCart, removeFromCart, cart } = useCart();
  const [loading, setLoader] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(""); // 🔁 Fetch all products on mount

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllProducts();
        setLoader(false);
        setProducts(data);
        setFilteredProducts(data); // 🔍 Extract unique categories

        const unique = [...new Set(data.map((p) => p.category))];
        setCategories(unique);
      } catch (err) {
        console.error("Error fetching products", err);
         setLoader(false);
      }
    };

    fetchData();
  }, []); // 🧠 Handle category filter

  const handleCategoryChange = (newChecked) => {
    setSelectedCategories(newChecked);

    let filtered = [...products];

    if (newChecked.length) {
      filtered = filtered.filter((p) => newChecked.includes(p.category));
    } // 🤖 Apply search after category also

    if (searchInput.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }; // 🧠 Handle search

  const handleSearchChange = (query) => {
    setSearchInput(query);

    let filtered = [...products];

    if (selectedCategories.length) {
      filtered = filtered.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    if (query.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  return (
    <>
      {loading ?  Loader : (         
      <div className="shop-page"> 
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
  SHOP <FaShoppingBag size={40} />
            </motion.h1>
            <motion.p className="banner-desc" variants={itemVariants}>
                CREATING THE ESSENCE!
            </motion.p>
          </motion.div>
        </section>
        <div className="shop-content">
          <FilterSidebar
            categories={categories}
            onCategoryChange={handleCategoryChange}
            onSearchChange={handleSearchChange}
          />
          <section className="shop-products">
            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              filteredProducts.map((product, j) => {
                const cartItem = cart.find((item) => item._id === product._id);
                const qty = cartItem ? cartItem.qty : 0;

                return (
                  <ProductCard
                    key={product._id}
                    product={product}
                    qty={qty}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    index={j}
                    className="visible"
                  />
                );
              })
            )}
          </section>
        </div>
    </div>
    )}
      </>
  )
}

export default ShopPage;

import React from "react";
import { FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import "./members.css";

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

const ExclusiveMembers = () => {
  return (
    <div className="exclusive-page">
      {/* Banner Section */}
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
            ABOUT MEMBERS <FaUser size={40} />
          </motion.h1>
          <motion.p className="banner-desc" variants={itemVariants}>
            know about what actually memebers special brings to you!
          </motion.p>
        </motion.div>
      </section>

      <div className="exclusive-members-page">
        <section className="members-exclusive-header">
          <h2>Members Exclusive</h2>
        </section>

        {/* Content Section */}
        <section className="members-content">
          <div className="members-text">
            <h3>Exclusive Membership for the Lucky Ones</h3>
            <p>
              Our exclusive membership is a special surprise reward for our
              loyal customers who purchase perfumes from Sirius Perfumes. It's
              our way of saying thank you for choosing us.
            </p>
            <p>
              Members receive fantastic benefits including discounted prices on
              an extensive range of perfumes. When you apply your exclusive
              coupon, you will enjoy wonderful savings tailored just for you.
            </p>
            <p>
              Here’s the exciting part: with your first 2 purchases, you get 1
              free perfume! Buy 5 and you receive 2 perfumes absolutely free.
              And the perks don’t stop there — access exclusive trial perfumes
              included within your surprise membership box, giving you a chance
              to explore new scents before anyone else.
            </p>
            <p className="members-invite">
              Keep shopping, stay lucky, and indulge in the world of exclusive
              fragrances only for members like you.
            </p>
          </div>

          <div className="members-images">
            <img
              src="https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=600&q=80"
              alt="Exclusive Perfume Collection"
            />
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
              alt="Luxury Perfumes"
              className="image-right"
            />
          </div>
        </section>
      </div>
      {/* Members Exclusive Header */}
    </div>
  );
};

export default ExclusiveMembers;

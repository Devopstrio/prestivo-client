import React from "react";
import { FaShoppingCart  } from "react-icons/fa";
import "../styles/HeroBannerSection.css";

const HeroBannerSection = ({ onShopNow }) => {
  return (
    <>
      {/* HERO */}
      <section className="heroBanner">
        <div className="heroRight" id="heroTitle">
          <h1 className="heroTitle">Smart Shopping</h1>
          <h2 className="heroSubtitle">Trusted by Millions</h2>

          <button
            className="shopNowBtn"
            onClick={onShopNow}
            onMouseEnter={(e) => {
              e.target.style.background = "#ffd700";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0px 8px 25px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#ffffff";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0px 6px 20px rgba(0, 0, 0, 0.15)";
            }}
          >
            <FaShoppingCart  className="shopIcon" />
            Shop Now
          </button>
        </div>
      </section>

      {/* ⭐ BOTTOM FEATURES STRIP */}
      <div className="featuresContainer">
        <div className="featuresStrip">
          <div className="feature">
            <img
              src="/Home/icon1.png"
              alt="Return"
              className="featureIconImg"
            />
            <span>7 Days Easy Return</span>
          </div>

          <div className="divider"></div>

          <div className="feature">
            <img
              src="/Home/icon2.png"
              alt="COD"
              className="featureIconImg"
            />
            <span>Cash on Delivery</span>
          </div>

          <div className="divider"></div>

          <div className="feature">
            <img
              src="/Home/icon3.png"
              alt="Lowest Price"
              className="featureIconImg"
            />
            <span>Lowest Prices</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroBannerSection;

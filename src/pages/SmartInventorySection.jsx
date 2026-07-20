import React from "react";
import "../styles/SmartInventorySection.css";

const SmartInventorySection = () => {
  const cards = [
    { title: "Free Shipping", subtitle: "Delivered to your doorstep at no extra cost" },
    { title: "Secure Payment", subtitle: "Safe & encrypted checkout" },
    { title: "Quality Guarantee", subtitle: "Premium products, guaranteed satisfaction" },
    { title: "24/7 Support", subtitle: "Always here to help you" },
    { title: "Sales", subtitle: "Boost your savings every day / Great deals & best prices" },
    { title: "Customer Reviews", subtitle: "Rated by real verified shoppers" },
  ];

  const images = [
    "/siv/siv1.jpg",
    "/siv/siv2.jpg",
    "/siv/siv3.jpg",
    "/siv/siv4.jpg",
    "/siv/siv5.jpg",
    "/siv/siv6.jpg"
  ];

  return (
    <section className="oneapp-container">

      <h1 className="oneapp-main-title">
        Everything for a better <span>shopping experience.</span>
      </h1>

      <p className="oneapp-main-subtitle">
        All these benefits are offered to make your shopping experience better.
      </p>

      <div className="oneapp-card-wrapper">
        {cards.map((item, index) => (
          <div className="oneapp-card" key={index}>
            <img src={images[index]} className="oneapp-icon" alt="icon" />

            <div className="oneapp-text">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};

export default SmartInventorySection;

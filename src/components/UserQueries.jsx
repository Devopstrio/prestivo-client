import React, { useState } from "react";
import "../styles/UserQueries.css";

const UserQueries = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  // ⭐ Updated FAQ List (Full Professional FAQ from previous dataset)
  const faqList = [
    // Shipping & Delivery
    {
      question: "How long does delivery take?",
      answer:
        "Orders are usually delivered within 3 to 7 business days, depending on your location.",
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes, free standard shipping is available on all orders.",
    },
    {
      question: "Can I track my order?",
      answer:
        "Absolutely! Once your order is placed, go to your “My Orders” dashboard to track it.",
    },
    {
      question: "Can I change my delivery address after placing an order?",
      answer:
        "No, you can't change your address after placing the order. The product will be delivered to the address you provided.",
    },
    {
      question: "What if I miss my delivery?",
      answer:
        "The courier will attempt delivery up to 2 more times. If all attempts fail, the package will be returned to the warehouse for rescheduling.",
    },

    // Returns & Refunds
    {
      question: "How do I return a product?",
      answer:
        "Go to the “My Orders” page, select the item, and follow the instructions to request a return or replacement within 7 days of delivery.",
    },
    {
      question: "When will I receive my refund?",
      answer:
        "Refunds take 3–5 business days after the returned product is received and verified.",
    },
    {
      question: "Are return pickups free?",
      answer: "Yes, return pickups are completely free for eligible items.",
    },
    {
      question: "What if an item is damaged or incorrect?",
      answer:
        "Please contact support immediately with a photo and your order ID. We will process a refund or replacement promptly.",
    },

    // Payments & Subscriptions
    {
      question: "What payment methods are supported?",
      answer:
        "We accept UPI, credit/debit cards, net banking, wallet payments, and Cash on Delivery (COD) in select locations.",
    },
    {
      question: "Is it safe to make online payments?",
      answer:
        "Yes, all online payments are processed through secure, encrypted gateways for your safety.",
    },
    {
      question: "Can I change my payment method after placing an order?",
      answer:
        "You can change payment methods for future orders, but not after an order has already been placed.",
    },

    // My Account & Orders
    {
      question: "Do I need an account to place an order?",
      answer:
        "Yes, creating an account is required to place orders. It allows you to track orders and enjoy faster checkout.",
    },
    {
      question: "How can I view my order history?",
      answer:
        "Log in to your account and navigate to the “My Orders” section to see all your order details.",
    },
    {
      question: "How can I cancel an order?",
      answer:
        "Orders can be canceled within a limited time after placing them. Go to the My Orders page to request cancellation. If eligible, refunds will be credited within 3 to 7 business days.",
    },
    {
      question: "How do I update my address or contact details?",
      answer:
        "Go to the “My Profile” section in your account dashboard to update your personal information.",
    },

    // Products & Availability
    {
      question: "Are the products authentic?",
      answer:
        "Yes, all products are 100% authentic and sourced only from verified brands and sellers.",
    },
    {
      question: "Do you offer product customization?",
      answer:
        "Some products offer customization options. Check the product page to see if it is available.",
    },

    // Security & Privacy
    {
      question: "How is my personal data protected?",
      answer:
        "We take data privacy seriously. All sensitive information is encrypted and never shared without your consent.",
    }
  ];

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="userQueries-container">
      <h2 className="userQueries-title">Frequently Asked Questions</h2>

      {faqList.map((faq, index) => (
        <div
          key={index}
          className={`userQueries-faqItem ${
            activeIndex === index ? "active" : ""
          }`}
        >
          <div 
            className="userQueries-question" 
            onClick={() => toggleFaq(index)}
          >
            <span>{faq.question}</span>
            <span className="userQueries-arrow">
              {activeIndex === index ? "▲" : "▼"}
            </span>
          </div>
          
          <div className={`userQueries-answer ${activeIndex === index ? "active" : ""}`}>
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserQueries;
import React, { useState } from 'react';
import {Link} from 'react-router-dom'
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaQuestionCircle,
  FaShippingFast,
  FaUndo,
  FaCreditCard,
  FaUser,
  FaBox,
  FaShieldAlt,
  FaEnvelope,
  FaStar
} from 'react-icons/fa';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import '../styles/FAQ.css';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = [
    { id: 'all', name: 'All Questions', icon: FaQuestionCircle, count: 21, color: 'faq-blue-indigo' },
    { id: 'shipping', name: 'Shipping & Delivery', icon: FaShippingFast, count: 5, color: 'faq-emerald-teal' },
    { id: 'returns', name: 'Returns & Refunds', icon: FaUndo, count: 4, color: 'faq-purple-pink' },
    { id: 'payments', name: 'Payments & Subscriptions', icon: FaCreditCard, count: 4, color: 'faq-orange-red' },
    { id: 'account', name: 'My Account & Orders', icon: FaUser, count: 4, color: 'faq-blue-indigo' },
    { id: 'products', name: 'Products & Availability', icon: FaBox, count: 3, color: 'faq-emerald-teal' },
    { id: 'security', name: 'Data & Privacy', icon: FaShieldAlt, count: 1, color: 'faq-purple-pink' }
  ];

  const faqItems = [
    // Shipping & Delivery
    {
      id: 1,
      category: 'shipping',
      question: 'How long does delivery take?',
      answer: 'Orders are usually delivered within 3 to 7 business days, depending on your location.',
      popular: true
    },
    {
      id: 2,
      category: 'shipping',
      question: 'Do you offer free shipping?',
      answer: 'Yes, free standard shipping is available on all orders.'
    },
    {
      id: 3,
      category: 'shipping',
      question: 'Can I track my order?',
      answer: 'Absolutely! Once your order is placed, go to your "My Orders" dashboard to track it.',
      popular: true
    },
    {
      id: 4,
      category: 'shipping',
      question: 'Can I change my delivery address after placing an order?',
      answer: "No, you can't change your address after the order is placed. It will be delivered to the address provided.",
    },
    {
      id: 5,
      category: 'shipping',
      question: 'What if I miss my delivery?',
      answer: 'The courier will attempt delivery up to 2 more times. If missed, the package will be returned to the warehouse for rescheduling.'
    },

    // Returns & Refunds
    {
      id: 6,
      category: 'returns',
      question: 'How do I return a product?',
      answer: 'Go to the "My Orders" page, select the item, and follow the instructions to request a return or replacement within 7 days of delivery.',
      popular: true
    },
    {
      id: 7,
      category: 'returns',
      question: 'When will I receive my refund?',
      answer: 'Refunds take 3–5 business days after the returned product is received and verified.'
    },
    {
      id: 8,
      category: 'returns',
      question: 'Are return pickups free?',
      answer: 'Yes, return pickups are completely free for eligible items.'
    },
    {
      id: 9,
      category: 'returns',
      question: 'What if an item is damaged or incorrect?',
      answer: 'Please contact support immediately with a photo and order ID. We will process a refund or replacement promptly.'
    },

    // Payments & Subscriptions
    {
      id: 10,
      category: 'payments',
      question: 'What payment methods are supported?',
      answer: 'We accept UPI, credit/debit cards, net banking, wallet payments, and Cash on Delivery (COD) in select areas.'
    },
    {
      id: 11,
      category: 'payments',
      question: 'Is it safe to make online payments?',
      answer: 'Yes, all online payments are processed through secure, encrypted gateways.',
    },
    {
      id: 12,
      category: 'payments',
      question: 'Can I change my payment method after placing an order?',
      answer: 'You can change payment methods for future orders, but not after an order has already been placed.',
    },

    // Account & Orders
    {
      id: 13,
      category: 'account',
      question: 'Do I need an account to place an order?',
      answer: 'Yes, creating an account is required to place orders so you can track orders and enjoy faster checkout.'
    },
    {
      id: 14,
      category: 'account',
      question: 'How can I view my order history?',
      answer: 'Log in to your account and navigate to the "My Orders" section to view your order details.',
    },
    {
      id: 15,
      category: 'account',
      question: 'How can I cancel an order?',
      answer: 'Orders can be canceled within a limited time after placing them. Go to the My Orders page to request cancellation. After a few hours, we will process the cancellation. If a refund is applicable, it will be credited within 3 to 7 business days.',
    },
    {
      id: 16,
      category: 'account',
      question: 'How do I update my address or contact details?',
      answer: 'Go to the "My Profile" section in your account dashboard to update your personal information.'
    },

    // Products & Availability
    {
      id: 17,
      category: 'products',
      question: 'Are the products authentic?',
      answer: 'Yes, all products are 100% authentic and sourced only from verified brands and sellers.',
    },
    {
      id: 18,
      category: 'products',
      question: 'Do you offer product customization?',
      answer: 'Some products offer customization options. Check the product page for availability.'
    },

    // Security & Privacy
    {
      id: 19,
      category: 'security',
      question: 'How is my personal data protected?',
      answer: 'We take data privacy seriously. All sensitive information is encrypted and will not be shared without your consent.'
    }
  ];

  const filteredItems = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularItems = faqItems.filter(item => item.popular);

  return (
    <><Navbar />
      <div className="faq-help-center">
        {/* Hero Section */}
        <section className="faq-hero-area">
          <div className="faq-hero-overlay"></div>
          <div className="faq-hero-container">
            <div className="faq-hero-content">
              <div className="faq-hero-badge">
                <FaQuestionCircle className="faq-badge-icon" />
                <span>Frequently Asked Questions</span>
              </div>
              
              <h1 className="faq-hero-title">
                How Can We
                <span className="faq-hero-accent">
                  Help You?
                </span>
              </h1>
              
              <p className="faq-hero-subtitle">
                Find answers to the most common questions about shopping on our platform
              </p>
              
              <div className="faq-stats-grid">
                <div className="faq-stat-item">
                  <div className="faq-stat-number">21</div>
                  <div className="faq-stat-label">Total Questions</div>
                </div>
                <div className="faq-stat-item">
                  <div className="faq-stat-number">7</div>
                  <div className="faq-stat-label">Categories</div>
                </div>
                <div className="faq-stat-item">
                  <div className="faq-stat-number">24/7</div>
                  <div className="faq-stat-label">Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="faq-search-area faq-section-container">
          <div className="faq-search-wrapper">
            <div className="faq-search-input-container">
              <FaSearch className="faq-search-icon" />
              <input
                type="text"
                placeholder="Search questions or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="faq-search-field"
              />
            </div>
            <div className="faq-search-results">
              {filteredItems.length} questions found
            </div>
          </div>
        </section>

        {/* Popular Questions */}
        {activeCategory === 'all' && searchTerm === '' && (
          <section className="faq-popular-section faq-section-container">
            <div className="faq-section-header">
              <h2 className="faq-section-title">
                Popular Questions
              </h2>
              <p className="faq-section-subtitle">
                Most frequently asked questions by our customers
              </p>
            </div>
            
            <div className="faq-popular-grid">
              {popularItems.map(item => (
                <div key={item.id} className="faq-popular-card">
                  <div className="faq-popular-tag">Most Asked</div>
                  <div className="faq-popular-content">
                    <h4>{item.question}</h4>
                    <p>{item.answer.substring(0, 100)}...</p>
                  </div>
                  <div className="faq-popular-star">
                    <FaStar />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main FAQ Content */}
        <section className="faq-main-area faq-section-container">
          <div className="faq-layout">
            {/* Categories Sidebar */}
            <div className="faq-categories-sidebar">
              <div className="faq-sidebar-header">
                <h3>Categories</h3>
              </div>
              <div className="faq-category-list">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`faq-category-btn ${activeCategory === category.id ? 'faq-category-active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <div className={`faq-category-icon ${category.color}`}>
                      <category.icon className="faq-category-svg" />
                    </div>
                    <div className="faq-category-info">
                      <span className="faq-category-name">{category.name}</span>
                      <span className="faq-category-count">{category.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Items */}
            <div className="faq-content-area">
              <div className="faq-content-header">
                <h2 className="faq-content-title">
                  {activeCategory === 'all'
                    ? 'All Questions'
                    : categories.find(cat => cat.id === activeCategory)?.name
                  }
                </h2>
                <div className="faq-results-count">
                  {filteredItems.length} of {faqItems.length} questions
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="faq-no-results">
                  <FaSearch className="faq-no-results-icon" />
                  <h3>No questions found</h3>
                  <p>Try another search keyword or select a different category</p>
                </div>
              ) : (
                <div className="faq-items-list">
                  {filteredItems.map(item => (
                    <div key={item.id} className={`faq-item ${openItems[item.id] ? 'faq-item-open' : ''}`}>
                      <div
                        className="faq-question"
                        onClick={() => toggleItem(item.id)}
                      >
                        <div className="faq-question-text">
                          {item.popular && <span className="faq-popular-indicator">Popular</span>}
                          <h4>{item.question}</h4>
                        </div>
                        <div className="faq-toggle">
                          {openItems[item.id] ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>
                      <div className="faq-answer-container">
                        <div className="faq-answer-content">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="faq-cta-section faq-section-container">
          <div className="faq-cta-card">
            <div className="faq-cta-overlay"></div>
            <div className="faq-cta-content">
              <FaEnvelope className="faq-cta-icon" />
              <h2 className="faq-cta-title">
                Need More Help?
              </h2>
              <p className="faq-cta-text">
                Our support team is available 24/7 to assist you with any questions.
              </p>
              <Link to="/contact"><button className="faq-cta-button">
                <FaEnvelope className="faq-cta-btn-icon" />
                Contact Support
              </button></Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default FAQ;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaGavel,
  FaFileContract,
  FaUserCheck,
  FaExclamationTriangle,
  FaBalanceScale,
  FaShieldAlt,
  FaBan,
  FaSync,
  FaUserTimes,
  FaCommentDots,
  FaFilePdf,
  FaDownload,
  FaInfoCircle,
  FaShoppingCart,
  FaUser,
  FaCreditCard,
  FaTruck,
  FaHeadset,
  FaQuestionCircle,
  FaEnvelope,
  FaBook,
  FaLock,
  FaGlobe,
  FaExchangeAlt,
  FaClock
} from 'react-icons/fa';
import '../styles/TermsOfService.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_BASE_URL from '../config';

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState('acceptance');
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/company`)
      .then((res) => {
        setCompany(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching company details:", err);
        setLoading(false);
      });
  }, []);

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'user-terms', title: 'User Terms & Conditions' },
    { id: 'accounts', title: 'User Accounts' },
    { id: 'purchases', title: 'Purchases & Payments' },
    { id: 'shipping', title: 'Shipping & Delivery' },
    { id: 'returns', title: 'Returns & Refunds' },
    { id: 'intellectual', title: 'Intellectual Property' },
    { id: 'conduct', title: 'User Conduct' },
    { id: 'termination', title: 'Termination' },
    { id: 'disclaimer', title: 'Disclaimers' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'governing', title: 'Governing Law' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'contact', title: 'Contact Us' }
  ];

  const lastUpdated = "October 1, 2025";

  // Fallback company data if API fails
  const fallbackCompany = {
    name: "YourStore",
    email: "legal@yourstore.com",
    phone: "+1 (555) 123-4567",
    street: "123 Commerce Street",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "United States"
  };

  const currentCompany = company || fallbackCompany;

  // PDF Download Function
  const downloadPDF = () => {
    const printContent = document.getElementById('terms-content-main').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="color: #1e3c72; margin-bottom: 10px;">Terms of Service</h1>
          <p style="color: #666; font-size: 16px;">Last updated: ${lastUpdated}</p>
          <p style="color: #666; font-size: 14px;">${currentCompany.name}</p>
        </div>
        ${printContent}
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center;">
          <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} ${currentCompany.name}. All rights reserved.</p>
        </div>
      </div>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="terms-of-service-container loading-state">
        <div className="loading-indicator">
          <FaGavel className="loading-spinner-icon" />
          <p>Loading Terms of Service...</p>
        </div>
      </div>
    );
  }

  return (
    <><Navbar />
      <div className="terms-of-service-container">
        {/* Hero Section */}
        <section className="terms-hero-section">
          <div className="hero-container">
            <FaGavel className="hero-main-icon" />
            <h1>Terms of Service</h1>
            <p>Please read these terms carefully before using our services. By accessing or using our platform, you agree to be bound by these terms.</p>
            <div className="update-date">
              Last updated: {lastUpdated}
            </div>
          </div>
        </section>


        {/* Main Content */}
        <section className="terms-main-content">
          <div className="content-container">
            <div className="content-wrapper">
              {/* Sidebar Navigation */}
              <aside className="terms-sidebar-nav">
                <h3>Terms of Service</h3>
                <nav className="sidebar-navigation">
                  {sections.map(section => (
                    <button
                      key={section.id}
                      className={`sidebar-nav-link ${activeSection === section.id ? 'active-sidebar' : ''}`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
                <div className="sidebar-download-section">
                  <button className="download-pdf-button" onClick={downloadPDF}>
                    <FaFilePdf className="download-button-icon" />
                    Download PDF Version
                  </button>
                </div>
              </aside>

              {/* Main Terms Content */}
              <main className="terms-content-main" id="terms-content-main">
                {/* Acceptance Section */}
                {activeSection === 'acceptance' && (
                  <div className="terms-content-section">
                    <h2>Acceptance of Terms</h2>

                    <div className="terms-feature-card">
                      <div className="feature-card-icon" id="feature-card-icon">
                        <FaFileContract style={{ color: "#1e3c72" }} />
                      </div>
                      <div className="feature-card-content">
                        <h3>Binding Agreement</h3>
                        <p>
                          These Terms of Service constitute a legally binding agreement between you and {currentCompany.name}
                          governing your access to and use of our website, services, and products.
                        </p>
                        <p>
                          By accessing, browsing, or using our services, you acknowledge that you have read, understood,
                          and agree to be bound by these terms and to comply with all applicable laws and regulations.
                        </p>
                      </div>
                    </div>

                    <div className="terms-key-points">
                      <h4>Key Conditions</h4>
                      <div className="key-points-grid">
                        <div className="key-point-item">
                          <FaGavel className="key-point-icon" />
                          <strong>Legal Capacity</strong>
                          <p>You have the legal capacity to enter into binding contracts</p>
                        </div>
                        <div className="key-point-item">
                          <FaBan className="key-point-icon" />
                          <strong>Prohibited Use</strong>
                          <p>You will not use our services for any illegal or unauthorized purpose</p>
                        </div>
                        <div className="key-point-item">
                          <FaShieldAlt className="key-point-icon" />
                          <strong>Compliance</strong>
                          <p>You agree to comply with all applicable laws and regulations</p>
                        </div>
                      </div>
                    </div>

                    <div className="terms-update-notice">
                      <FaInfoCircle className="notice-icon" />
                      <p>
                        <strong>Important:</strong> We reserve the right to update these terms at any time.
                        Continued use of our services after changes constitutes acceptance of the modified terms.
                      </p>
                    </div>
                  </div>
                )}

                {/* ================= USER TERMS & CONDITIONS ================= */}
                {activeSection === 'user-terms' && (
                  <div className="terms-content-section">
                    <h2>User Terms & Conditions</h2>

                    <div className="terms-feature-card">
                      <div className="feature-card-icon">
                        <FaFileContract />
                      </div>
                      <div className="feature-card-content">
                        <h3>Overview</h3>
                        <p>
                          These User Terms & Conditions explain your rights and responsibilities
                          when accessing this website or purchasing products through it.
                        </p>
                        <p>
                          By using this website or placing an order, you confirm that you have
                          read, understood, and agreed to these terms.
                        </p>
                      </div>
                    </div>

                    {/* 1. Website Scope */}
                    <h4>1. Scope of Use</h4>
                    <ul className="responsibilities-list">
                      <li>
                        <FaInfoCircle className="list-icon" />
                        This website operates as a direct online store offering products to customers.
                      </li>
                      <li>
                        <FaInfoCircle className="list-icon" />
                        All products listed are sold directly by the website owner.
                      </li>
                      <li>
                        <FaBan className="list-icon" />
                        The website does not act as a marketplace for third-party sellers.
                      </li>
                    </ul>

                    {/* 2. Eligibility */}
                    <h4>2. Eligibility to Use</h4>
                    <p>You may use this website only if:</p>
                    <ul className="license-restrictions">
                      <li>You are at least 18 years old</li>
                      <li>You have legal authority to enter into binding agreements</li>
                      <li>You provide accurate and complete personal and payment details</li>
                    </ul>

                    {/* 3. Product Information */}
                    <h4>3. Product Information</h4>
                    <p>
                      Product descriptions, images, and prices are provided for informational
                      purposes. Minor variations may occur, including colour differences due
                      to screen settings.
                    </p>

                    {/* 4. Pricing & Payment */}
                    <h4>4. Pricing & Payment</h4>
                    <ul className="license-restrictions">
                      <li>All prices are displayed in the applicable local currency</li>
                      <li>Taxes are included where legally required</li>
                      <li>Orders are processed only after successful payment confirmation</li>
                    </ul>

                    {/* 5. Orders */}
                    <h4>5. Orders & Acceptance</h4>
                    <p>
                      Submitting an order does not guarantee acceptance. Orders may be cancelled
                      due to stock availability, payment verification issues, or system errors.
                    </p>

                    {/* 6. Delivery */}
                    <h4>6. Delivery</h4>
                    <p>
                      Delivery timelines are estimates. Responsibility for the product transfers
                      to you once delivery is completed at the provided address.
                    </p>

                    {/* 7. Right to Cancel */}
                    <h4>7. Right to Cancel</h4>
                    <p>
                      You may have the legal right to cancel your order within a specified period
                      after delivery, subject to applicable consumer protection laws.
                    </p>

                    {/* 8. Faulty Items */}
                    <h4>8. Faulty or Incorrect Items</h4>
                    <p>
                      If you receive a faulty, damaged, or incorrect item, you may be entitled
                      to a repair, replacement, or refund as required by applicable law.
                    </p>

                    {/* 9. Website Usage Rules */}
                    <h4>9. Website Usage Rules</h4>
                    <ul className="license-restrictions">
                      <li>Do not misuse the website or attempt unauthorized access</li>
                      <li>Do not engage in fraudulent, abusive, or illegal activities</li>
                      <li>Violations may result in restricted or terminated access</li>
                    </ul>

                    {/* 10. Intellectual Property */}
                    <h4>10. Intellectual Property</h4>
                    <p>
                      All website content, including text, images, and design elements, is
                      protected by intellectual property laws and may not be reused without
                      prior written permission.
                    </p>

                    {/* 11. Limitation of Liability */}
                    <h4>11. Limitation of Liability</h4>
                    <p>
                      Liability, where permitted by law, is limited to the value of the order.
                      Indirect or consequential losses are excluded.
                    </p>

                    {/* 12. Governing Law */}
                    <h4>12. Governing Law</h4>
                    <p>
                      These terms are governed by applicable local laws, and disputes will be
                      resolved by the relevant courts with proper jurisdiction.
                    </p>

                    <div className="terms-update-notice" style={{ marginTop: 40 }}>
                      <FaShieldAlt className="notice-icon" />
                      <p>
                        <strong>Notice:</strong> These User Terms apply to all customers using
                        this website and purchasing products through it.
                      </p>
                    </div>
                  </div>
                )}




                {/* User Accounts Section */}
                {activeSection === 'accounts' && (
                  <div className="terms-content-section">
                    <h2>User Accounts</h2>

                    <div className="account-requirements">
                      <h4>Account Registration</h4>
                      <div className="requirements-grid">
                        <div className="requirement-card">
                          <FaUser className="requirement-icon" />
                          <h5>Accurate Information</h5>
                          <p>You must provide accurate and complete information during registration</p>
                        </div>
                        <div className="requirement-card">
                          <FaLock className="requirement-icon" />
                          <h5>Password Security</h5>
                          <p>You are responsible for maintaining the confidentiality of your password</p>
                        </div>
                        <div className="requirement-card">
                          <FaSync className="requirement-icon" />
                          <h5>Information Updates</h5>
                          <p>You must keep your account information current and accurate</p>
                        </div>
                      </div>
                    </div>

                    <div className="account-responsibilities">
                      <h4>Account Responsibilities</h4>
                      <ul className="responsibilities-list">
                        <li>
                          <FaExclamationTriangle className="list-icon" />
                          <strong>Security:</strong> You are responsible for all activities under your account
                        </li>
                        <li>
                          <FaExclamationTriangle className="list-icon" />
                          <strong>Notification:</strong> Immediately notify us of any unauthorized use of your account
                        </li>
                        <li>
                          <FaExclamationTriangle className="list-icon" />
                          <strong>Liability:</strong> You may be held liable for losses incurred due to unauthorized use
                        </li>
                        <li>
                          <FaExclamationTriangle className="list-icon" />
                          <strong>Accuracy:</strong> We reserve the right to refuse service due to inaccurate information
                        </li>
                      </ul>
                    </div>

                    <div className="account-termination-info">
                      <div className="info-card warning">
                        <FaUserTimes className="info-card-icon" />
                        <h5>Account Termination Rights</h5>
                        <p>
                          We reserve the right to suspend or terminate your account at our sole discretion
                          if we believe you have violated these terms or applicable laws.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Purchases & Payments Section */}
                {activeSection === 'purchases' && (
                  <div className="terms-content-section">
                    <h2>Purchases & Payments</h2>

                    <div className="purchase-terms-grid">
                      <div className="purchase-term-card">
                        <FaShoppingCart className="term-icon" />
                        <h4>Order Acceptance</h4>
                        <p>All orders are subject to acceptance and availability. We reserve the right to refuse any order.</p>
                      </div>

                      <div className="purchase-term-card">
                        <FaCreditCard className="term-icon" />
                        <h4>Payment Methods</h4>
                        <p>We accept major credit cards and other payment methods as indicated during checkout.</p>
                      </div>

                      <div className="purchase-term-card">
                        <FaExchangeAlt className="term-icon" />
                        <h4>Price Changes</h4>
                        <p>We reserve the right to change prices at any time without prior notice.</p>
                      </div>

                      <div className="purchase-term-card">
                        <FaFileContract className="term-icon" />
                        <h4>Sales Tax</h4>
                        <p>Applicable sales tax will be added to your order total based on your location.</p>
                      </div>
                    </div>

                    <div className="billing-info">
                      <h4>Billing Information</h4>
                      <div className="billing-details">
                        <div className="billing-point">
                          <strong>Currency:</strong> All transactions are processed in US Dollars (USD)
                        </div>
                        <div className="billing-point">
                          <strong>Authorization:</strong> Your payment method will be authorized at time of order
                        </div>
                        <div className="billing-point">
                          <strong>Verification:</strong> We may require additional verification for large orders
                        </div>
                        <div className="billing-point">
                          <strong>Declined Payments:</strong> Orders with declined payments will be cancelled automatically
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping & Delivery Section */}
                {activeSection === 'shipping' && (
                  <div className="terms-content-section">
                    <h2>Shipping & Delivery</h2>

                    <div className="shipping-info-grid">
                      <div className="shipping-info-card">
                        <FaTruck className="shipping-icon" />
                        <h4>Shipping Methods</h4>
                        <p>We offer various shipping options with different delivery times and costs.</p>
                      </div>

                      <div className="shipping-info-card">
                        <FaGlobe className="shipping-icon" />
                        <h4>Delivery Areas</h4>
                        <p>We ship to most countries worldwide. Some restrictions may apply.</p>
                      </div>

                      <div className="shipping-info-card">
                        <FaClock className="shipping-icon" />
                        <h4>Processing Time</h4>
                        <p>Orders are typically processed within 1-3 business days.</p>
                      </div>

                      <div className="shipping-info-card">
                        <FaExclamationTriangle className="shipping-icon" />
                        <h4>Delivery Issues</h4>
                        <p>Contact us immediately if you experience delivery problems.</p>
                      </div>
                    </div>

                    <div className="shipping-important">
                      <h4>Important Shipping Notes</h4>
                      <div className="shipping-notes">
                        <div className="shipping-note">
                          <strong>Delivery Times:</strong> Estimated delivery times are not guaranteed
                        </div>
                        <div className="shipping-note">
                          <strong>Address Accuracy:</strong> Ensure shipping address is complete and accurate
                        </div>
                        <div className="shipping-note">
                          <strong>Customs & Duties:</strong> International customers are responsible for customs fees
                        </div>
                        <div className="shipping-note">
                          <strong>Risk of Loss:</strong> Products become your responsibility upon delivery
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Returns & Refunds Section */}
                {activeSection === 'returns' && (
                  <div className="terms-content-section">
                    <h2>Returns & Refunds</h2>

                    <div className="return-policy-highlights">
                      <div className="policy-highlight-card">
                        <FaSync className="highlight-icon" />
                        <h4>30-Day Return Policy</h4>
                        <p>Most items can be returned within 30 days of delivery for a full refund.</p>
                      </div>
                    </div>

                    <div className="return-conditions">
                      <h4>Return Conditions</h4>
                      <div className="conditions-list">
                        <div className="condition-item">
                          <span className="condition-number">1</span>
                          <div className="condition-content">
                            <strong>Original Condition</strong>
                            <p>Items must be unused and in original packaging with all tags attached</p>
                          </div>
                        </div>
                        <div className="condition-item">
                          <span className="condition-number">2</span>
                          <div className="condition-content">
                            <strong>Proof of Purchase</strong>
                            <p>Return must include original receipt or order confirmation</p>
                          </div>
                        </div>
                        <div className="condition-item">
                          <span className="condition-number">3</span>
                          <div className="condition-content">
                            <strong>Return Shipping</strong>
                            <p>Customer is responsible for return shipping costs unless item is defective</p>
                          </div>
                        </div>
                        <div className="condition-item">
                          <span className="condition-number">4</span>
                          <div className="condition-content">
                            <strong>Non-Returnable Items</strong>
                            <p>Certain items (e.g., personalized products) cannot be returned</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="refund-process">
                      <h4>Refund Process</h4>
                      <div className="process-steps">
                        <div className="process-step">
                          <div className="step-header">
                            <span className="step-number">1</span>
                            <h5>Return Request</h5>
                          </div>
                          <p>Contact our support team to initiate return process</p>
                        </div>
                        <div className="process-step">
                          <div className="step-header">
                            <span className="step-number">2</span>
                            <h5>Return Approval</h5>
                          </div>
                          <p>We'll provide return instructions and authorization</p>
                        </div>
                        <div className="process-step">
                          <div className="step-header">
                            <span className="step-number">3</span>
                            <h5>Product Receipt</h5>
                          </div>
                          <p>Refund processed after we receive and inspect returned item</p>
                        </div>
                        <div className="process-step">
                          <div className="step-header">
                            <span className="step-number">4</span>
                            <h5>Refund Issuance</h5>
                          </div>
                          <p>Refund issued to original payment method within 5-10 business days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Intellectual Property Section */}
                {activeSection === 'intellectual' && (
                  <div className="terms-content-section">
                    <h2>Intellectual Property</h2>

                    <div className="ip-rights-grid">
                      <div className="ip-right-card">
                        <FaBook className="ip-icon" />
                        <h4>Our Content</h4>
                        <p>All website content, logos, and designs are our property and protected by copyright.</p>
                      </div>

                      <div className="ip-right-card">
                        <FaShieldAlt className="ip-icon" />
                        <h4>Trademarks</h4>
                        <p>Our trademarks and logos may not be used without prior written permission.</p>
                      </div>

                      <div className="ip-right-card">
                        <FaUser className="ip-icon" />
                        <h4>User Content</h4>
                        <p>You retain rights to content you submit but grant us license to use it.</p>
                      </div>

                      <div className="ip-right-card">
                        <FaBan className="ip-icon" />
                        <h4>Prohibited Use</h4>
                        <p>You may not copy, modify, or distribute our intellectual property without permission.</p>
                      </div>
                    </div>

                    <div className="ip-license">
                      <h4>License Grant</h4>
                      <p>
                        We grant you a limited, non-exclusive, non-transferable license to access and use
                        our services for personal, non-commercial purposes. This license does not include:
                      </p>
                      <ul className="license-restrictions">
                        <li>Resale or commercial use of our services or content</li>
                        <li>Collection and use of product listings or descriptions</li>
                        <li>Derivative use of our website or content</li>
                        <li>Use of data mining or similar data gathering tools</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* User Conduct Section */}
                {activeSection === 'conduct' && (
                  <div className="terms-content-section">
                    <h2>User Conduct</h2>

                    <div className="conduct-rules">
                      <h4>Prohibited Activities</h4>
                      <div className="rules-grid">
                        <div className="rule-card prohibited">
                          <FaBan className="rule-icon" />
                          <h5>Illegal Activities</h5>
                          <p>Using our services for any unlawful purpose or soliciting illegal acts</p>
                        </div>
                        <div className="rule-card prohibited">
                          <FaBan className="rule-icon" />
                          <h5>Fraudulent Behavior</h5>
                          <p>Providing false information or engaging in fraudulent transactions</p>
                        </div>
                        <div className="rule-card prohibited">
                          <FaBan className="rule-icon" />
                          <h5>Security Violations</h5>
                          <p>Attempting to interfere with or compromise system security</p>
                        </div>
                        <div className="rule-card prohibited">
                          <FaBan className="rule-icon" />
                          <h5>Spam & Abuse</h5>
                          <p>Sending spam or engaging in harassing or abusive behavior</p>
                        </div>
                      </div>
                    </div>

                    <div className="content-guidelines">
                      <h4>Content Guidelines</h4>
                      <div className="guidelines-list">
                        <div className="guideline-item">
                          <strong>Appropriate Content:</strong> User-generated content must not be offensive or inappropriate
                        </div>
                        <div className="guideline-item">
                          <strong>Respectful Communication:</strong> Maintain respectful communication in all interactions
                        </div>
                        <div className="guideline-item">
                          <strong>No Infringement:</strong> Do not post content that infringes others' rights
                        </div>
                        <div className="guideline-item">
                          <strong>Accuracy:</strong> Ensure all submitted information is accurate and truthful
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Termination Section */}
                {activeSection === 'termination' && (
                  <div className="terms-content-section">
                    <h2>Termination</h2>

                    <div className="termination-rights">
                      <div className="termination-card">
                        <FaUserTimes className="termination-icon" />
                        <h4>Termination Rights</h4>
                        <p>
                          We may suspend or terminate your account and access to our services at our sole discretion,
                          without notice, for conduct that we believe violates these Terms or is harmful to other users,
                          us, or third parties, or for any other reason.
                        </p>
                      </div>
                    </div>

                    <div className="termination-effects">
                      <h4>Effects of Termination</h4>
                      <div className="effects-grid">
                        <div className="effect-item">
                          <strong>Account Access</strong>
                          <p>Immediate termination of your right to use our services</p>
                        </div>
                        <div className="effect-item">
                          <strong>Outstanding Payments</strong>
                          <p>You remain liable for all amounts due up to termination</p>
                        </div>
                        <div className="effect-item">
                          <strong>Content Removal</strong>
                          <p>We may remove and discard any content associated with your account</p>
                        </div>
                        <div className="effect-item">
                          <strong>Survival</strong>
                          <p>Certain provisions will survive termination of these Terms</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disclaimers Section */}
                {activeSection === 'disclaimer' && (
                  <div className="terms-content-section">
                    <h2>Disclaimers</h2>

                    <div className="disclaimer-notice">
                      <div className="disclaimer-card important">
                        <FaExclamationTriangle className="disclaimer-icon" />
                        <h4>Important Disclaimer</h4>
                        <p>
                          Our services are provided "as is" and "as available" without any warranties,
                          express or implied. We do not guarantee that our services will be uninterrupted,
                          timely, secure, or error-free.
                        </p>
                      </div>
                    </div>

                    <div className="disclaimer-details">
                      <h4>Specific Disclaimers</h4>
                      <div className="disclaimer-list">
                        <div className="disclaimer-item">
                          <strong>Product Information:</strong> We are not responsible for errors in product descriptions or pricing
                        </div>
                        <div className="disclaimer-item">
                          <strong>Technical Issues:</strong> We are not liable for service interruptions or technical problems
                        </div>
                        <div className="disclaimer-item">
                          <strong>Third-Party Content:</strong> We are not responsible for content provided by third parties
                        </div>
                        <div className="disclaimer-item">
                          <strong>User Content:</strong> We do not endorse and are not responsible for user-generated content
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Limitation of Liability Section */}
                {activeSection === 'liability' && (
                  <div className="terms-content-section">
                    <h2>Limitation of Liability</h2>

                    <div className="liability-limitation">
                      <div className="liability-card">
                        <FaBalanceScale className="liability-icon" />
                        <h4>Liability Cap</h4>
                        <p>
                          To the fullest extent permitted by law, our total liability to you for all claims
                          arising from or related to these terms or your use of our services shall not exceed
                          the amount you paid us in the six months preceding the claim.
                        </p>
                      </div>
                    </div>

                    <div className="liability-exclusions">
                      <h4>Excluded Damages</h4>
                      <p>
                        In no event shall we be liable for any indirect, punitive, incidental, special,
                        or consequential damages arising out of or in any way connected with your use of
                        our services, including but not limited to:
                      </p>
                      <ul className="excluded-damages-list">
                        <li>Loss of profits, revenue, or data</li>
                        <li>Business interruption</li>
                        <li>Cost of substitute goods or services</li>
                        <li>Personal injury or property damage</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Governing Law Section */}
                {activeSection === 'governing' && (
                  <div className="terms-content-section">
                    <h2>Governing Law</h2>

                    <div className="governing-law-info">
                      <div className="law-card">
                        <FaGavel className="law-icon" />
                        <h4>Applicable Law</h4>
                        <p>
                          These Terms shall be governed by and construed in accordance with the laws of the State of California,
                          without regard to its conflict of law provisions.
                        </p>
                      </div>
                    </div>

                    <div className="dispute-resolution">
                      <h4>Dispute Resolution</h4>
                      <div className="resolution-steps">
                        <div className="resolution-step">
                          <span className="step-indicator">1</span>
                          <div className="step-content">
                            <strong>Informal Negotiation</strong>
                            <p>Parties agree to attempt informal resolution before formal proceedings</p>
                          </div>
                        </div>
                        <div className="resolution-step">
                          <span className="step-indicator">2</span>
                          <div className="step-content">
                            <strong>Mediation</strong>
                            <p>If informal resolution fails, parties agree to mediation in San Francisco, CA</p>
                          </div>
                        </div>
                        <div className="resolution-step">
                          <span className="step-indicator">3</span>
                          <div className="step-content">
                            <strong>Legal Action</strong>
                            <p>Any legal action must be filed in state or federal courts in San Francisco, CA</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Changes to Terms Section */}
                {activeSection === 'changes' && (
                  <div className="terms-content-section">
                    <h2>Changes to Terms</h2>

                    <div className="changes-policy">
                      <div className="changes-card">
                        <FaSync className="changes-icon" />
                        <h4>Modification Rights</h4>
                        <p>
                          We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                          If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                        </p>
                      </div>
                    </div>

                    <div className="change-notification">
                      <h4>Notification of Changes</h4>
                      <div className="notification-methods">
                        <div className="notification-method">
                          <FaEnvelope className="method-icon" />
                          <strong>Email Notification</strong>
                          <p>Registered users will receive email notifications of material changes</p>
                        </div>
                        <div className="notification-method">
                          <FaInfoCircle className="method-icon" />
                          <strong>Website Notice</strong>
                          <p>Updated terms will be posted on our website with revision dates</p>
                        </div>
                        <div className="notification-method">
                          <FaCommentDots className="method-icon" />
                          <strong>Continued Use</strong>
                          <p>Continued use after changes constitutes acceptance of modified terms</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Us Section */}
                {activeSection === 'contact' && (
                  <div className="terms-content-section">
                    <h2>Contact Us</h2>

                    <div className="contact-introduction">
                      <p>
                        If you have any questions about these Terms of Service, please contact us using the information below.
                      </p>
                    </div>

                    <div className="contact-methods-grid">
                      <div className="contact-method-card">
                        <FaEnvelope className="contact-method-icon" />
                        <h4>Email</h4>
                        <p>{currentCompany.email || 'legal@yourstore.com'}</p>
                        <span>Response within 48 hours</span>
                      </div>

                      <div className="contact-method-card">
                        <FaHeadset className="contact-method-icon" />
                        <h4>Customer Support</h4>
                        <p>support@{currentCompany.email?.split('@')[1] || 'yourstore.com'}</p>
                        <span>General inquiries and support</span>
                      </div>

                      <div className="contact-method-card">
                        <FaGavel className="contact-method-icon" />
                        <h4>Legal Department</h4>
                        <p>legal@{currentCompany.email?.split('@')[1] || 'yourstore.com'}</p>
                        <span>Legal and formal notices</span>
                      </div>
                    </div>

                    <div className="contact-address-section">
                      <h4>Mailing Address</h4>
                      <div className="address-contact-card">
                        <p>
                          <strong>{currentCompany.name}</strong><br />
                          Attn: Legal Department<br />
                          {currentCompany.street && `${currentCompany.street},`}<br />
                          {currentCompany.city && `${currentCompany.city},`} {currentCompany.state} {currentCompany.postalCode}<br />
                          {currentCompany.country}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default TermsOfService;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaShieldAlt,
  FaUserLock,
  FaDatabase,
  FaCookie,
  FaEye,
  FaExchangeAlt,
  FaQuestionCircle,
  FaEnvelope,
  FaDownload,
  FaInfoCircle,
  FaShoppingCart,
  FaUser,
  FaComments,
  FaSearch,
  FaGavel,
  FaFileContract,
  FaClipboardList,
  FaEdit,
  FaTrash,
  FaPause,
  FaBan,
  FaUndo,
  FaLock,
  FaUsers,
  FaChartBar,
  FaArchive,
  FaGraduationCap,
  FaSync,
  FaFilePdf,
  FaFileAlt,
  FaTruck,
  FaCreditCard,
  FaHeadset,
  FaChartLine
} from 'react-icons/fa';
import '../styles/PrivacyPolicy.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_BASE_URL from '../config';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('overview');
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
    { id: 'overview', title: 'Overview' },
    { id: 'data-collection', title: 'Data Collection' },
    { id: 'data-usage', title: 'Data Usage' },
    { id: 'data-sharing', title: 'Data Sharing' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'rights', title: 'Your Rights' },
    { id: 'security', title: 'Security' },
    { id: 'contact', title: 'Contact Us' }
  ];

  const lastUpdated = "October 1, 2025";

  // Fallback company data if API fails
  const fallbackCompany = {
    name: "YourStore",
    email: "privacy@yourstore.com",
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
    // Create a printable version of the privacy policy
    const printContent = document.getElementById('privacy-content-main').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="color: #1e3c72; margin-bottom: 10px;">Privacy Policy</h1>
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
    
    // Restore original content
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="privacy-policy-page privacy-loading-state">
        <div className="privacy-loading-indicator">
          <FaShieldAlt className="privacy-loading-spinner" />
          <p>Loading Privacy Policy...</p>
        </div>
      </div>
    );
  }

  return (
    <><Navbar />
    <div className="privacy-policy-page">
      {/* Hero Section */}
      <section className="privacy-hero-area">
        <div className="privacy-hero-overlay"></div>
        <div className="privacy-container">
          <div className="privacy-hero-wrapper">
            <div className="privacy-hero-content">
              <div className="privacy-hero-banner">
                <FaShieldAlt className="privacy-banner-icon" />
                Your Privacy Matters
              </div>
              <h1 className="privacy-hero-heading">
                Privacy Policy
                <span className="privacy-hero-accent">Your Data, Your Control</span>
              </h1>
              <p className="privacy-hero-description">
                Learn how we protect and manage your personal information with transparency and security. 
                Your trust is our priority.
              </p>
              <div className="privacy-stats-container">
                <div className="privacy-stat">
                  <span className="privacy-stat-value">100%</span>
                  <span className="privacy-stat-label">Data Protection</span>
                </div>
                <div className="privacy-stat">
                  <span className="privacy-stat-value">24/7</span>
                  <span className="privacy-stat-label">Security Monitoring</span>
                </div>
                <div className="privacy-stat">
                  <span className="privacy-stat-value">0</span>
                  <span className="privacy-stat-label">Data Sold</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="privacy-content-area">
        <div className="privacy-container">
          <div className="privacy-layout">
            {/* Sidebar Navigation */}
            <aside className="privacy-sidebar">
              <div className="privacy-sidebar-header">
                <FaShieldAlt className="privacy-sidebar-icon" />
                <h3>Privacy Policy</h3>
              </div>
              <nav className="privacy-sidebar-nav">
                {sections.map(section => (
                  <button
                    key={section.id}
                    className={`privacy-nav-item ${activeSection === section.id ? 'privacy-nav-active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
              <div className="privacy-download-area">
                <button className="privacy-download-btn" onClick={downloadPDF}>
                  <FaFilePdf className="privacy-download-icon" />
                  Download PDF Version
                </button>
                <div className="privacy-update-info">
                  <FaInfoCircle className="privacy-update-icon" />
                  Last updated: {lastUpdated}
                </div>
              </div>
            </aside>

            {/* Main Policy Content */}
            <main className="privacy-content-main" id="privacy-content-main">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div className="privacy-content-section">
                  <div className="privacy-section-header">
                    <h2 className="privacy-section-title">Privacy Overview</h2>
                    <p className="privacy-section-subtitle">Our commitment to protecting your personal information</p>
                  </div>
                  
                  <div className="privacy-feature-block">
                    <div className="privacy-feature-icon">
                      <FaShieldAlt />
                    </div>
                    <div className="privacy-feature-content">
                      <h3>Our Commitment to Your Privacy</h3>
                      <p>
                        At {currentCompany.name}, we are committed to protecting your privacy and ensuring the security 
                        of your personal information. This Privacy Policy explains how we collect, use, 
                        disclose, and safeguard your information when you visit our website or make a purchase.
                      </p>
                      <p>
                        We encourage you to read this Privacy Policy carefully to understand our practices 
                        regarding your personal data and how we will treat it.
                      </p>
                    </div>
                  </div>

                  <div className="privacy-principles">
                    <h4>Key Principles</h4>
                    <div className="privacy-principles-grid">
                      <div className="privacy-principle">
                        <FaUserLock className="privacy-principle-icon" />
                        <strong>Transparency</strong>
                        <p>We clearly explain what data we collect and why</p>
                      </div>
                      <div className="privacy-principle">
                        <FaDatabase className="privacy-principle-icon" />
                        <strong>Minimal Data</strong>
                        <p>We only collect data necessary for your experience</p>
                      </div>
                      <div className="privacy-principle">
                        <FaEye className="privacy-principle-icon" />
                        <strong>Control</strong>
                        <p>You have control over your personal information</p>
                      </div>
                      <div className="privacy-principle">
                        <FaShieldAlt className="privacy-principle-icon" />
                        <strong>Security</strong>
                        <p>We implement robust security measures</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Collection Section */}
              {activeSection === 'data-collection' && (
                <div className="privacy-content-section">
                  <div className="privacy-section-header">
                    <h2 className="privacy-section-title">Information We Collect</h2>
                    <p className="privacy-section-subtitle">Transparent overview of the data we gather and how we collect it</p>
                  </div>
                  
                  <div className="privacy-collection-types">
                    <div className="privacy-collection-card">
                      <div className="privacy-collection-header">
                        <FaUser className="privacy-collection-type-icon" />
                        <h4>Personal Information</h4>
                      </div>
                      <ul>
                        <li><strong>Contact Details:</strong> Name, email address, phone number</li>
                        <li><strong>Account Information:</strong> Username, password, profile preferences</li>
                        <li><strong>Demographic Information:</strong> Age, gender, location (with consent)</li>
                        <li><strong>Communication Records:</strong> Customer service interactions</li>
                      </ul>
                    </div>

                    <div className="privacy-collection-card">
                      <div className="privacy-collection-header">
                        <FaShoppingCart className="privacy-collection-type-icon" />
                        <h4>Transaction Information</h4>
                      </div>
                      <ul>
                        <li><strong>Order Details:</strong> Products purchased, order history, preferences</li>
                        <li><strong>Payment Information:</strong> Billing address, payment method (processed securely)</li>
                        <li><strong>Shipping Information:</strong> Delivery address, shipping preferences</li>
                      </ul>
                    </div>

                    <div className="privacy-collection-card">
                      <div className="privacy-collection-header">
                        <FaChartLine className="privacy-collection-type-icon" />
                        <h4>Technical Information</h4>
                      </div>
                      <ul>
                        <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                        <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
                        <li><strong>Location Data:</strong> General location based on IP address</li>
                      </ul>
                    </div>
                  </div>

                  <div className="privacy-collection-methods">
                    <h4>How We Collect Information</h4>
                    <div className="privacy-methods-grid">
                      <div className="privacy-method">
                        <FaComments className="privacy-method-icon" />
                        <strong>Direct Interactions</strong>
                        <p>When you create an account, make a purchase, or contact our support team</p>
                      </div>
                      <div className="privacy-method">
                        <FaCookie className="privacy-method-icon" />
                        <strong>Automated Technologies</strong>
                        <p>Through cookies and similar technologies when you use our website</p>
                      </div>
                      <div className="privacy-method">
                        <FaUsers className="privacy-method-icon" />
                        <strong>Third Parties</strong>
                        <p>From partners, social media platforms, and analytics providers</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Usage Section */}
              {activeSection === 'data-usage' && (
                <div className="privacy-content-section">
                  <div className="privacy-section-header">
                    <h2 className="privacy-section-title">How We Use Your Information</h2>
                    <p className="privacy-section-subtitle">Clear explanation of how your data helps us serve you better</p>
                  </div>
                  
                  <div className="privacy-usage-grid">
                    <div className="privacy-usage-card">
                      <FaShoppingCart className="privacy-usage-icon" />
                      <h4>Order Processing</h4>
                      <p>Process and fulfill your purchases, manage payments, and arrange shipping</p>
                    </div>

                    <div className="privacy-usage-card">
                      <FaUser className="privacy-usage-icon" />
                      <h4>Account Management</h4>
                      <p>Create and manage your account, provide customer support, and personalize your experience</p>
                    </div>

                    <div className="privacy-usage-card">
                      <FaEnvelope className="privacy-usage-icon" />
                      <h4>Communication</h4>
                      <p>Send order updates, respond to inquiries, and provide promotional offers (with consent)</p>
                    </div>

                    <div className="privacy-usage-card">
                      <FaSearch className="privacy-usage-icon" />
                      <h4>Website Improvement</h4>
                      <p>Analyze usage patterns, improve our website functionality, and develop new features</p>
                    </div>

                    <div className="privacy-usage-card">
                      <FaLock className="privacy-usage-icon" />
                      <h4>Security & Fraud Prevention</h4>
                      <p>Protect our website, prevent fraudulent transactions, and ensure account security</p>
                    </div>

                    <div className="privacy-usage-card">
                      <FaGavel className="privacy-usage-icon" />
                      <h4>Legal Compliance</h4>
                      <p>Comply with legal obligations, enforce our terms, and protect our rights</p>
                    </div>
                  </div>

                  <div className="privacy-legal-basis">
                    <h4>Legal Basis for Processing</h4>
                    <div className="privacy-basis-list">
                      <div className="privacy-basis-item">
                        <FaFileContract className="privacy-basis-icon" />
                        <strong>Contractual Necessity</strong>
                        <p>Processing necessary to fulfill our contract with you (e.g., processing orders)</p>
                      </div>
                      <div className="privacy-basis-item">
                        <FaChartBar className="privacy-basis-icon" />
                        <strong>Legitimate Interests</strong>
                        <p>Processing for our legitimate business interests (e.g., website improvement)</p>
                      </div>
                      <div className="privacy-basis-item">
                        <FaUserLock className="privacy-basis-icon" />
                        <strong>Consent</strong>
                        <p>Processing based on your explicit consent (e.g., marketing communications)</p>
                      </div>
                      <div className="privacy-basis-item">
                        <FaGavel className="privacy-basis-icon" />
                        <strong>Legal Obligation</strong>
                        <p>Processing required by law (e.g., tax compliance, fraud prevention)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Sharing Section */}
              {activeSection === 'data-sharing' && (
                <div className="privacy-content-section">
                  <div className="privacy-section-header">
                    <h2 className="privacy-section-title">Information Sharing & Disclosure</h2>
                    <p className="privacy-section-subtitle">Transparent disclosure of when and how we share your information</p>
                  </div>
                  
                  <div className="privacy-sharing-info">
                    <div className="privacy-notice-block">
                      <FaBan className="privacy-notice-icon" />
                      <h4>We Do Not Sell Your Data</h4>
                      <p>We never sell your personal information to third parties for their marketing purposes.</p>
                    </div>
                  </div>

                  <div className="privacy-partners-section">
                    <h4>Service Providers We Work With</h4>
                    <div className="privacy-partners-grid">
                      <div className="privacy-partner-card">
                        <FaCreditCard className="privacy-partner-icon" />
                        <h5>Payment Processors</h5>
                        <p>Secure payment processing services</p>
                        <span className="privacy-partner-purpose">Transaction Processing</span>
                      </div>

                      <div className="privacy-partner-card">
                        <FaDatabase className="privacy-partner-icon" />
                        <h5>Cloud Storage</h5>
                        <p>Secure data storage and hosting services</p>
                        <span className="privacy-partner-purpose">Data Storage</span>
                      </div>

                      <div className="privacy-partner-card">
                        <FaChartBar className="privacy-partner-icon" />
                        <h5>Analytics Providers</h5>
                        <p>Website usage analysis and improvement</p>
                        <span className="privacy-partner-purpose">Website Analytics</span>
                      </div>

                      <div className="privacy-partner-card">
                        <FaEnvelope className="privacy-partner-icon" />
                        <h5>Marketing Platforms</h5>
                        <p>Email marketing and communication tools</p>
                        <span className="privacy-partner-purpose">Customer Communication</span>
                      </div>

                      <div className="privacy-partner-card">
                        <FaTruck className="privacy-partner-icon" />
                        <h5>Shipping Carriers</h5>
                        <p>Delivery and logistics partners</p>
                        <span className="privacy-partner-purpose">Order Fulfillment</span>
                      </div>

                      <div className="privacy-partner-card">
                        <FaHeadset className="privacy-partner-icon" />
                        <h5>Customer Support</h5>
                        <p>Help desk and support services</p>
                        <span className="privacy-partner-purpose">Customer Service</span>
                      </div>
                    </div>
                  </div>

                  <div className="privacy-legal-disclosure">
                    <h4>Legal Disclosures</h4>
                    <p>
                      We may disclose your information when required by law, to protect our rights, 
                      or in connection with business transfers such as mergers or acquisitions.
                    </p>
                  </div>
                </div>
              )}

              {/* Cookies Section */}
              {activeSection === 'cookies' && (
                <div className="privacy-content-section">
                  <div className="privacy-section-header">
                    <h2 className="privacy-section-title">Cookies & Tracking Technologies</h2>
                    <p className="privacy-section-subtitle">Understanding how we use cookies to enhance your experience</p>
                  </div>
                  
                  <div className="privacy-cookies-intro">
                    <div className="privacy-cookie-icon">
                      <FaCookie />
                    </div>
                    <div className="privacy-cookie-content">
                      <h4>Understanding Cookies</h4>
                      <p>
                        Cookies are small text files stored on your device that help us provide, 
                        protect, and improve our services. You can control cookie preferences through your browser settings.
                      </p>
                    </div>
                  </div>

                  <div className="privacy-cookies-types">
                    <h4>Types of Cookies We Use</h4>
                    <div className="privacy-cookies-grid">
                      <div className="privacy-cookie-type">
                        <FaLock className="privacy-cookie-type-icon" />
                        <h5>Essential Cookies</h5>
                        <p>Required for basic website functionality and security</p>
                        <span className="privacy-cookie-status">Always Active</span>
                      </div>

                      <div className="privacy-cookie-type">
                        <FaChartBar className="privacy-cookie-type-icon" />
                        <h5>Performance Cookies</h5>
                        <p>Help us understand how visitors interact with our website</p>
                        <span className="privacy-cookie-status privacy-cookie-optional">Optional</span>
                      </div>

                      <div className="privacy-cookie-type">
                        <FaUser className="privacy-cookie-type-icon" />
                        <h5>Functional Cookies</h5>
                        <p>Remember your preferences and settings</p>
                        <span className="privacy-cookie-status privacy-cookie-optional">Optional</span>
                      </div>

                      <div className="privacy-cookie-type">
                        <FaEnvelope className="privacy-cookie-type-icon" />
                        <h5>Marketing Cookies</h5>
                        <p>Used to deliver relevant advertisements</p>
                        <span className="privacy-cookie-status privacy-cookie-optional">Optional</span>
                      </div>
                    </div>
                  </div>

                  <div className="privacy-cookie-controls">
                    <h4>Cookie Management</h4>
                    <div className="privacy-control-options">
                      <div className="privacy-control-option">
                        <FaSearch className="privacy-control-icon" />
                        <strong>Browser Settings</strong>
                        <p>Most browsers allow you to refuse or delete cookies through their settings</p>
                      </div>
                      <div className="privacy-control-option">
                        <FaBan className="privacy-control-icon" />
                        <strong>Opt-Out Tools</strong>
                        <p>Use industry opt-out tools for targeted advertising</p>
                      </div>
                      <div className="privacy-control-option">
                        <FaEye className="privacy-control-icon" />
                        <strong>Do Not Track</strong>
                        <p>We respect "Do Not Track" signals from your browser</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Your Rights Section */}
              {activeSection === 'rights' && (
                <div className="privacy-content-section">
                  <div className="privacy-section-header">
                    <h2 className="privacy-section-title">Your Privacy Rights</h2>
                    <p className="privacy-section-subtitle">Empowering you with control over your personal information</p>
                  </div>
                  
                  <div className="privacy-rights-intro">
                    <p>
                      You have important rights regarding your personal information. We are committed 
                      to making it easy for you to exercise these rights.
                    </p>
                  </div>

                  <div className="privacy-rights-grid">
                    <div className="privacy-right-card">
                      <FaClipboardList className="privacy-right-icon" />
                      <h4>Access & Portability</h4>
                      <p>Request a copy of your personal data in a machine-readable format</p>
                    </div>

                    <div className="privacy-right-card">
                      <FaEdit className="privacy-right-icon" />
                      <h4>Correction</h4>
                      <p>Update or correct inaccurate or incomplete information</p>
                    </div>

                    <div className="privacy-right-card">
                      <FaTrash className="privacy-right-icon" />
                      <h4>Deletion</h4>
                      <p>Request deletion of your personal data under certain circumstances</p>
                    </div>

                    <div className="privacy-right-card">
                      <FaPause className="privacy-right-icon" />
                      <h4>Restriction</h4>
                      <p>Request temporary restriction of processing in specific situations</p>
                    </div>

                    <div className="privacy-right-card">
                      <FaBan className="privacy-right-icon" />
                      <h4>Objection</h4>
                      <p>Object to processing of your personal data for direct marketing</p>
                    </div>

                    <div className="privacy-right-card">
                      <FaUndo className="privacy-right-icon" />
                      <h4>Withdraw Consent</h4>
                      <p>Withdraw previously given consent at any time</p>
                    </div>
                  </div>

                  <div className="privacy-exercise-process">
                    <h4>How to Exercise Your Rights</h4>
                    <div className="privacy-process-steps">
                      <div className="privacy-process-step">
                        <span className="privacy-step-number">1</span>
                        <div className="privacy-step-content">
                          <FaEnvelope className="privacy-step-icon" />
                          <strong>Contact Us</strong>
                          <p>Submit your request through our contact form or email</p>
                        </div>
                      </div>
                      <div className="privacy-process-step">
                        <span className="privacy-step-number">2</span>
                        <div className="privacy-step-content">
                          <FaUserLock className="privacy-step-icon" />
                          <strong>Identity Verification</strong>
                          <p>We'll verify your identity to protect your information</p>
                        </div>
                      </div>
                      <div className="privacy-process-step">
                        <span className="privacy-step-number">3</span>
                        <div className="privacy-step-content">
                          <FaSync className="privacy-step-icon" />
                          <strong>Response</strong>
                          <p>We'll respond to your request within 30 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div className="privacy-content-section">
                  <div className="privacy-section-header">
                    <h2 className="privacy-section-title">Data Security</h2>
                    <p className="privacy-section-subtitle">Our comprehensive approach to protecting your information</p>
                  </div>
                  
                  <div className="privacy-security-commitment">
                    <div className="privacy-security-badge">
                      <FaShieldAlt />
                    </div>
                    <div className="privacy-security-content">
                      <h4>Our Security Commitment</h4>
                      <p>
                        We implement appropriate technical and organizational security measures 
                        to protect your personal information against unauthorized access, 
                        alteration, disclosure, or destruction.
                      </p>
                    </div>
                  </div>

                  <div className="privacy-security-measures">
                    <h4>Security Measures We Implement</h4>
                    <div className="privacy-measures-grid">
                      <div className="privacy-measure-card">
                        <FaLock className="privacy-measure-icon" />
                        <h5>Encryption</h5>
                        <p>SSL/TLS encryption for data transmission</p>
                      </div>
                      <div className="privacy-measure-card">
                        <FaUsers className="privacy-measure-icon" />
                        <h5>Access Controls</h5>
                        <p>Strict access controls and authentication</p>
                      </div>
                      <div className="privacy-measure-card">
                        <FaChartBar className="privacy-measure-icon" />
                        <h5>Regular Audits</h5>
                        <p>Security assessments and vulnerability testing</p>
                      </div>
                      <div className="privacy-measure-card">
                        <FaArchive className="privacy-measure-icon" />
                        <h5>Secure Storage</h5>
                        <p>Encrypted data storage with regular backups</p>
                      </div>
                      <div className="privacy-measure-card">
                        <FaGraduationCap className="privacy-measure-icon" />
                        <h5>Employee Training</h5>
                        <p>Privacy and security awareness training</p>
                      </div>
                      <div className="privacy-measure-card">
                        <FaSync className="privacy-measure-icon" />
                        <h5>Incident Response</h5>
                        <p>Comprehensive incident response procedures</p>
                      </div>
                    </div>
                  </div>

                  <div className="privacy-retention-policy">
                    <h4>Data Retention</h4>
                    <p>
                      We retain your personal information only for as long as necessary to fulfill 
                      the purposes outlined in this Privacy Policy, unless a longer retention period 
                      is required or permitted by law.
                    </p>
                    <div className="privacy-retention-examples">
                      <div className="privacy-retention-item">
                        <FaUser className="privacy-retention-icon" />
                        <strong>Account Information:</strong> Until account deletion request
                      </div>
                      <div className="privacy-retention-item">
                        <FaFileAlt className="privacy-retention-icon" />
                        <strong>Transaction Records:</strong> 7 years for tax purposes
                      </div>
                      <div className="privacy-retention-item">
                        <FaEnvelope className="privacy-retention-icon" />
                        <strong>Marketing Data:</strong> Until consent withdrawal
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Section */}
              {activeSection === 'contact' && (
                <div className="privacy-content-section">
                  <div className="privacy-section-header">
                    <h2 className="privacy-section-title">Contact Us</h2>
                    <p className="privacy-section-subtitle">Get in touch with our privacy team for any questions or concerns</p>
                  </div>
                  
                  <div className="privacy-contact-intro">
                    <p>
                      If you have any questions, concerns, or requests regarding this Privacy Policy 
                      or our data practices, please don't hesitate to contact us.
                    </p>
                  </div>

                  <div className="privacy-contact-methods">
                    <div className="privacy-contact-card">
                      <FaEnvelope className="privacy-contact-icon" />
                      <h4>Email</h4>
                      <p>{currentCompany.email || 'privacy@yourstore.com'}</p>
                      <span>Response within 48 hours</span>
                    </div>

                    <div className="privacy-contact-card">
                      <FaUserLock className="privacy-contact-icon" />
                      <h4>Data Protection Officer</h4>
                      <p>{currentCompany.email|| 'yourstore.com'}</p>
                      <span>For privacy-specific inquiries</span>
                    </div>

                    <div className="privacy-contact-card">
                      <FaQuestionCircle className="privacy-contact-icon" />
                      <h4>Support Center</h4>
                      <p>{currentCompany.email || 'yourstore.com'}</p>
                      <span>General customer service</span>
                    </div>
                  </div>

                  <div className="privacy-address-section">
                    <h4>Mailing Address</h4>
                    <div className="privacy-address-card">
                      <p>
                        <strong>{currentCompany.name}</strong><br />
                        Attn: Privacy Team<br />
                        {currentCompany.street && `${currentCompany.street},`}<br />
                        {currentCompany.city && `${currentCompany.city},`} {currentCompany.state} {currentCompany.postalCode}<br />
                        {currentCompany.country}
                      </p>
                    </div>
                  </div>

                  <div className="privacy-updates-section">
                    <h4>Policy Updates</h4>
                    <p>
                      We may update this Privacy Policy from time to time. We will notify you of any 
                      material changes by posting the new Privacy Policy on this page and updating 
                      the "Last Updated" date.
                    </p>
                    <div className="privacy-update-notice">
                      <FaInfoCircle className="privacy-update-notice-icon" />
                      <span>We encourage you to review this Privacy Policy periodically.</span>
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

export default PrivacyPolicy;
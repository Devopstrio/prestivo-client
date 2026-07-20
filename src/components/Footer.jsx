import { useEffect, useState } from "react";  
import axios from "axios";
import API_BASE_URL from "../config";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaHome,
  FaUserCircle,
  FaBoxOpen,
  FaShoppingCart,
  FaHeart,
  FaShieldAlt,
  FaHeadset,
  FaShippingFast,
  FaAward,
  FaExchangeAlt,
  FaQuestionCircle,
  FaRuler,
  FaFileAlt,
  FaRegCreditCard,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaStar,
  FaGem
} from "react-icons/fa";
import "../styles/Footer.css";

const Footer = () => {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/company`)
      .then((res) => setCompany(res.data.data))
      .catch((err) => console.error("Error fetching company details:", err));
  }, []);

  if (!company) return null;

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Company Info */}
        <div className="footer-section">
          <div className="company-brand">
            <h3 className="footer-heading">{company.name}</h3>
            <div className="company-highlight">
              <span>Premium E-Commerce Experience</span>
            </div>
          </div>

          <p className="footer-about">{company.about}</p>

          {/* CONTACT + SOCIAL ICONS */}
          <div className="footer-icon-row">
            {company.phone && (
              <a href={`tel:${company.phone}`} className="social-link">
                <FaPhone className="social-icon" />
              </a>
            )}
            {company.whatsapp && (
              <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer" className="social-link">
                <FaWhatsapp className="social-icon" />
              </a>
            )}
            {company.email && (
              <a href={`mailto:${company.email}`} className="social-link">
                <FaEnvelope className="social-icon" />
              </a>
            )}
            {company.facebook && (<a href={company.facebook} target="_blank" rel="noreferrer" className="social-link"><FaFacebook className="social-icon" /></a>)}
            {company.twitter && (<a href={company.twitter} target="_blank" rel="noreferrer" className="social-link"><FaTwitter className="social-icon" /></a>)}
            {company.instagram && (<a href={company.instagram} target="_blank" rel="noreferrer" className="social-link"><FaInstagram className="social-icon" /></a>)}
            {company.linkedin && (<a href={company.linkedin} target="_blank" rel="noreferrer" className="social-link"><FaLinkedin className="social-icon" /></a>)}
            {company.youtube && (<a href={company.youtube} target="_blank" rel="noreferrer" className="social-link"><FaYoutube className="social-icon" /></a>)}
          </div>

          {/* ⭐ 🚚 💎 SERVICE BADGES */}
          <div className="footer-service-badges">
            <div className="service-badge"><FaStar className="service-icon" /> Premium Quality</div>
            <div className="service-badge"><FaShippingFast className="service-icon" /> Fast Delivery</div>
            <div className="service-badge"><FaGem className="service-icon" /> Luxury Service</div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="footer-section">
          <h3 className="footer-heading">Quick Access</h3>
          <div className="quick-links">
            <a href="/" className="footer-link"><FaHome className="footer-link-icon" /> Home</a>
            <a href="/profile" className="footer-link"><FaUserCircle className="footer-link-icon" /> My Profile</a>
            <a href="/myorders" className="footer-link"><FaBoxOpen className="footer-link-icon" /> My Orders</a>
            <a href="/cart" className="footer-link"><FaShoppingCart className="footer-link-icon" /> My Cart</a>
            <a href="/wishlist" className="footer-link"><FaHeart className="footer-link-icon" /> Wishlist</a>
          </div>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h3 className="footer-heading">Support</h3>
          <div className="quick-links">
            <a href="/contact" className="footer-link"><FaHeadset className="footer-link-icon" /> Contact</a>
            <a href="/shipping-info" className="footer-link"><FaShippingFast className="footer-link-icon" /> Shipping</a>
            <a href="/returns" className="footer-link"><FaExchangeAlt className="footer-link-icon" /> Returns</a>
            <a href="/faq" className="footer-link"><FaQuestionCircle className="footer-link-icon" /> FAQ</a>
          </div>
        </div>

        {/* Policies */}
        <div className="footer-section">
          <h3 className="footer-heading">Policies & Trust</h3>

          <div className="quick-links">
            <a href="/privacy-policy" className="footer-link"><FaShieldAlt className="footer-link-icon" /> Privacy Policy</a>
            <a href="/terms" className="footer-link"><FaFileAlt className="footer-link-icon" /> Terms of Service</a>
            <a href="/size-guide" className="footer-link"><FaRuler className="footer-link-icon" /> Size Guide</a>
            <a href="/subscription" className="footer-link"><FaRegCreditCard className="footer-link-icon" /> Subscription</a>
          </div>
        </div>

      </div>

      {/* FOOTER BOTTOM WITH SSL + SECURE BADGES */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">

          {/* Left: Copyright */}
          <div className="copyright">
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </div>

          {/* NEW TRUST BADGES ON FOOTER BOTTOM */}
          {/* <div className="footer-bottom-badges">
            <div className="trust-badge small">
              <div className="trust-icon small"><FaShieldAlt /></div>
              <div className="trust-content small">
                <span className="trust-title small">100% Secure</span>
                <span className="trust-subtitle small">Payment</span>
              </div>
            </div>

            <div className="trust-badge small">
              <div className="trust-icon small"><FaShieldAlt /></div>
              <div className="trust-content small">
                <span className="trust-title small">SSL</span>
                <span className="trust-subtitle small">Encrypted</span>
              </div>
            </div>
          </div> */}

          {/* Right: Links */}
          <div className="footer-links">
            <a href="/privacy-policy">PRIVACY</a>
            <a href="/privacy-policy">Cookies</a>
            <a href="/terms">TERMS</a>
            <a href="/contact">CONTACT</a>
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;

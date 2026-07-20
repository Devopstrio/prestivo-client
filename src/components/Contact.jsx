import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import "../styles/Contact.css";
import Navbar from "../components/Navbar";
import UserQueries from "../components/UserQueries";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";
import { FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [companyInfo, setCompanyInfo] = useState({
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    workingHours: ""
  });

  const [mapLink, setMapLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMapLink = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/company/map`);
        if (res.data.mapLink) {
          setMapLink(res.data.mapLink);
        }
      } catch (err) {
        console.error("Failed to load map link:", err);
      }
    };
    fetchMapLink();
  }, []);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/company`);
        if (res.data.data) {
          const data = res.data.data;
          const address = [
            data.street,
            data.city,
            data.district,
            data.state,
            data.postalCode,
            data.country
          ].filter(Boolean).join(", ");

          setCompanyInfo({
            email: data.email || "",
            phone: data.phone || "",
            whatsapp: data.whatsapp || "",
            address,
            workingHours: data.workingHours || "9 AM - 6 PM Monday to Saturday"
          });

          if (data.mapLink) {
            setMapLink(data.mapLink);
          }
        }
      } catch (err) {
        console.error("Failed to fetch company info:", err);
      }
    };
    fetchCompanyData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/contact/submit`, formData);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="contact-page-container">

        {/* Header Section */}
        <div className="contact-page-header">
          <h1 className="contact-page-title">
            <FaPhoneAlt style={{ marginRight: "12px", fontSize: "2.6rem", verticalAlign: "middle" }} />
            Get In Touch
          </h1>
          <p className="contact-page-subtitle">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Content Section */}
        <div className="contact-page-content equal-height-grid">

          {/* Contact Information */}
          <div className="contact-page-info-section equal-box">
            <div className="contact-page-info-card full-height-card">
              <h3 className="contact-info-section-title">Contact Information</h3>

              <div className="contact-page-info-item">
                <div className="contact-info-icon-wrapper">
                  <i className="fas fa-map-marker-alt contact-info-icon"></i>
                </div>
                <div className="contact-info-content">
                  <h4>Our Location</h4>
                  <p>{companyInfo.address || "Address not available"}</p>
                </div>
              </div>

              <div className="contact-page-info-item">
                <div className="contact-info-icon-wrapper">
                  <i className="fas fa-phone contact-info-icon"></i>
                </div>
                <div className="contact-info-content">
                  <h4>Phone Number</h4>
                  <p>{companyInfo.phone ? (
                    <a
                      href={`tel:${companyInfo.phone}`}
                      className="contact-info-link"
                    >
                      {companyInfo.phone}
                    </a>
                  ) : (
                    <p>Phone not available</p>
                  )}

                  </p>
                </div>
              </div>

              {/* WhatsApp Number */}
              <div className="contact-page-info-item">
                <div className="contact-info-icon-wrapper">
                  <FaWhatsapp className="contact-info-icon" />
                </div>
                <div className="contact-info-content">
                  <h4>WhatsApp</h4>

                  {companyInfo.whatsapp ? (
                    <a
                      href={`https://wa.me/${companyInfo.whatsapp}?text=Hello%2C%20I%20need%20assistance`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-info-link"
                    >
                      {companyInfo.whatsapp}
                    </a>
                  ) : (
                    <p>WhatsApp not available</p>
                  )}
                </div>
              </div>

              <div className="contact-page-info-item">
                <div className="contact-info-icon-wrapper">
                  <i className="fas fa-envelope contact-info-icon"></i>
                </div>
                <div className="contact-info-content">
                  <h4>Email Address</h4>
                  <p>{companyInfo.email ? (
                    <a
                      href={`mailto:${companyInfo.email}`}
                      className="contact-info-link"
                    >
                      {companyInfo.email}
                    </a>
                  ) : (
                    <p>Email not available</p>
                  )}
                  </p>
                </div>
              </div>

              <div className="contact-page-info-item">
                <div className="contact-info-icon-wrapper">
                  <i className="fas fa-clock contact-info-icon"></i>
                </div>
                <div className="contact-info-content">
                  <h4>Working Hours</h4>
                  <p>{companyInfo.workingHours || "Working hours not available"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-page-form-section equal-box">
            <div className="contact-page-form-card full-height-card">
              <h3 className="contact-form-title">Send Us a Message</h3>

              {successMsg && (
                <div className="contact-alert contact-alert-success">
                  <i className="fas fa-check-circle"></i>
                  {successMsg}
                </div>
              )}

              {error && (
                <div className="contact-alert contact-alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-page-form">
                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label className="contact-form-label">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="contact-form-input" />
                  </div>

                  <div className="contact-form-group">
                    <label className="contact-form-label">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="contact-form-input" />
                  </div>
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">Subject</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="contact-form-input" />
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">Message</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows="6" required className="contact-form-textarea"></textarea>
                </div>

                <button type="submit" disabled={loading} className={`contact-submit-btn ${loading ? "contact-loading" : ""}`}>
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Sending Message...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Full Width Map */}
        <div className="contact-page-map-full-wrapper">
          <div className="contact-page-map-card">
            <h3 className="contact-info-section-title">Find Us Here</h3>
            <div className="contact-map-container">
              {mapLink ? (
                <iframe
                  src={mapLink}
                  width="100%"
                  height="350"
                  style={{ border: 0, borderRadius: "12px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Company Location Map"
                ></iframe>
              ) : (
                <div className="contact-map-placeholder">
                  <i className="fas fa-map-marked-alt contact-placeholder-icon"></i>
                  <p>Loading map...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <UserQueries />
        <Chatbot />
        <Footer />
      </div>
    </>
  );
};

export default Contact;

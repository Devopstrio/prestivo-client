// VerificationTab.js - Enhanced with animations
import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import {
  FaSearch,
  FaCheck,
  FaUser,
  FaEnvelope,
  FaTag,
  FaCalendarAlt,
  FaRocket,
  FaClock
} from "react-icons/fa";
import { MdVerified, MdOutlineContentCopy } from "react-icons/md";

const VerificationTab = ({ loading, setLoading }) => {
  const [subId, setSubId] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchDetails = async () => {
    if (!subId.trim()) {
      showNotification("Please enter a subscription ID", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/subscription/${subId}`);
      const data = res.data.data;
      setSubscription(data);

      if (data?.verifiedStatus) {
        showNotification("This subscription is already verified!", "success");
      } else {
        showNotification("Subscription details loaded successfully", "info");
      }
    } catch (err) {
      showNotification("Subscription not found. Please check the ID.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (e) => {
    const date = e.target.value;
    setStartDate(date);

    if (subscription?.plan) {
      const plan = subscription.plan.toLowerCase();
      const start = new Date(date);
      let expiry = new Date(start);

      // 🔁 Calculate expiry based on plan type
      if (plan.includes("year")) {
        expiry.setFullYear(expiry.getFullYear() + 1);
      }
      else if (plan.includes("month")) {
        expiry.setMonth(expiry.getMonth() + 1);
      }
      else if (plan.includes("free")) {
        expiry.setDate(expiry.getDate() + 7); // ✅ Free Trial - 7 days expiry
      }

      setExpiryDate(expiry.toISOString().split("T")[0]);
    }
  };

  const updateSubscription = async () => {
    if (!subscription) {
      showNotification("Please fetch subscription details first.", "warning");
      return;
    }
    if (subscription.verifiedStatus) {
      showNotification("Subscription is already verified!", "info");
      return;
    }
    if (!startDate) {
      showNotification("Please select a start date first.", "warning");
      return;
    }

    setIsVerifying(true);
    setLoading(true);

    try {
      await axios.put(`${API_BASE_URL}/api/subscription/updateDates`, {
        subscriptionId: subId,
        subscription_start_date: startDate,
        subscription_expiry_date: expiryDate,
        verifiedStatus: true,
      });

      showNotification("Subscription verified and updated successfully!", "success");
      setSubscription({ ...subscription, verifiedStatus: true });
    } catch (err) {
      console.error("Error updating subscription:", err);
      showNotification("Error updating subscription details. Please try again.", "error");
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const showNotification = (message, type) => {
    // Implementation for toast notifications
    console.log(`${type}: ${message}`);
  };

  return (
    <div className="verify-form">
      <div className="form-header">
        <div className="header-icon-container">
          <FaRocket className="header-icon" />
        </div>
        <div className="header-text">
          <h2 className="verify-title">Verify Subscription</h2>
          <p className="verify-subtitle">
            Enter subscription ID to verify and update customer details
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="form-group animated-input">
          <div className="input-icon">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Enter Subscription ID (e.g. SUB-1761900490925)"
            value={subId}
            onChange={(e) => setSubId(e.target.value)}
            className="form-input"
            disabled={loading}
          />
          {subId && (
            <button
              className="input-clear"
              onClick={() => setSubId("")}
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={fetchDetails}
          disabled={loading}
          className={`btn btn-primary fetch-btn ${loading ? 'loading' : ''}`}
        >
          <div className="btn-content">
            <FaSearch className="btn-search" />
            <span>{loading ? "Fetching Details..." : "Fetch Details"}</span>
          </div>
          <div className="btn-loader"></div>
        </button>
      </div>

      {/* Subscription Details */}
      {subscription && (
        <div className="subscription-details slide-up">
          <div className="details-header">
            <h3>Subscription Details</h3>
            <div className={`status-badge ${subscription.verifiedStatus ? 'verified' : 'pending'}`}>
              {subscription.verifiedStatus ? <MdVerified /> : <FaClock />}
              {subscription.verifiedStatus ? "Verified" : "Pending Verification"}
            </div>
          </div>
          <div className="details-grid"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "stretch",
              gap: "1rem",
              marginBottom: "2rem",
              flexWrap: "nowrap",
            }}
          >
            <div
              className="detail-card"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                transition: "all 0.3s ease",
                minWidth: "250px",
              }}
            >
              <div
                className="detail-icon"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  marginBottom: "1rem",
                }}
              >
                <FaUser />
              </div>
              <div className="detail-info">
                <label>
                  Customer Name
                </label>
                <span>
                  {subscription.name}
                </span>
              </div>
            </div>

            <div
              className="detail-card"
              style={{
                flex: 1,
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                transition: "all 0.3s ease",
                minWidth: "250px",
              }}
            >
              <div
                className="detail-icon"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaEnvelope />
              </div>
              <div className="detail-info">
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                    fontWeight: 500,
                  }}
                >
                  Email Address
                </label>
                <span
                  style={{
                    display: "block",
                    fontSize: "1rem",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                  }}
                >
                  {subscription.email}
                </span>
              </div>
            </div>

            <div
              className="detail-card"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                transition: "all 0.3s ease",
                minWidth: "250px",
              }}
            >
              <div className="detail-icon"><FaTag /></div>
              <div className="detail-info">
                <label>
                  Subscription Plan
                </label>
                <span
                  style={{
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                    color: "white",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "15px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {subscription.plan}
                </span>
              </div>
            </div>
          </div>


          {!subscription.verifiedStatus && (
            <div className="verification-section slide-up">
              <div className="section-header">
                {/* <FaShieldCheck /> */}
                <h4>Complete Verification</h4>
              </div>

              <div className="date-inputs">
                <div className="form-group">
                  <label className="form-label">
                    <FaCalendarAlt className="calender-icon" />
                    Subscription Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaCalendarAlt className="calender-icon" />
                    Subscription Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    readOnly
                    className="form-input readonly"
                  />
                </div>
              </div>

              <button
                onClick={updateSubscription}
                disabled={loading || !startDate || isVerifying}
                className={`btn btn-success verify-btn ${isVerifying ? 'verifying' : ''}`}
              >
                <div className="btn-content">
                  <FaCheck className="calender-icon" />
                  <span>{isVerifying ? "Verifying..." : "Verify & Save Subscription"}</span>
                </div>
                <div className="btn-loader"></div>
                <div className="success-checkmark"></div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationTab;
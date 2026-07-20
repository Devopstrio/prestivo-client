import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import "../styles/SubscriptionVerification.css";

// React Icons
import {
  FaSearch,
  FaList,
  FaTools
} from "react-icons/fa";
import Swal from "sweetalert2";
import { MdVerified, MdPending, MdOutlineAutoAwesome, } from "react-icons/md";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
// Import Components
import VerificationTab from "./VerificationTab";
import AllRequestsTab from "./AllRequestsTab";
import MaintenanceTab from "./MaintenanceTab";
import AllMaintenanceTab from "./AllMaintenanceTab";

const SubscriptionVerification = () => {
  const [activeTab, setActiveTab] = useState("verify");
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);


  // ✅ Fetch subscription stats dynamically from DB
  const fetchSubscriptionStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/subscription/all`);
      const subscriptions = res.data.data || [];

      const verified = subscriptions.filter(sub => sub.verifiedStatus === true).length;
      const pending = subscriptions.filter(sub => !sub.verifiedStatus).length;

      setVerifiedCount(verified);
      setPendingCount(pending);
    } catch (error) {
      console.error("❌ Error fetching subscription stats:", error);
    }
  };

  // ✅ Fetch stats on load
  useEffect(() => {
    fetchSubscriptionStats();
  }, []);

  const handleTabChange = (tab) => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsAnimating(false);
    }, 300);
  };

  /* ===============================
     ✅ SWEETALERT LOGOUT
  =============================== */
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef476f",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      localStorage.clear();
      sessionStorage.clear();

      await Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been logged out successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      window.location.href = "/devopstriologin";
    }
  };

  return (
    <div className="subscription-verification">
      {/* Animated Background Elements */}
      <div className="animated-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="verification-container">
        {/* Header Section */}
        <div className="verification-header">
          <div className="header-content">
            <div className="header-icon">
              <MdOutlineAutoAwesome />
            </div>
            <div className="header-text">
              <h1 className="header-title">Subscription Verification</h1>
              <p className="header-subtitle">
                Manage and verify customer subscription requests with ease
              </p>
            </div>
          </div>

          {/* ✅ ADMIN PROFILE SECTION */}
          <div className="header-right">
            <div className="admin-profile">
              <FaUserCircle className="admin-icon" />
              <span className="admin-name">Devopstrio Admin</span>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>

          {/* ✅ Dynamic Stats Section */}
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon verified">
                <MdVerified />
              </div>
              <div className="stat-info">
                <span className="stat-number" style={{ color: "gray" }}>
                  {verifiedCount}
                </span>
                <span className="stat-label">Verified</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pending">
                <MdPending />
              </div>
              <div className="stat-info">
                <span className="stat-number" style={{ color: "gray" }}>
                  {pendingCount}
                </span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>
        </div>


        {/* Main Tabs */}
        <div className="verification-tabs-container">
          <div className="verification-tabs">
            <button
              className={`verification-tab ${activeTab === "verify" ? "active" : ""}`}
              onClick={() => handleTabChange("verify")}
            >
              <div className="tab-icon">
                <FaSearch />
              </div>
              <div className="tab-content">
                <span className="tab-title">Verify Subscription</span>
                <span className="tab-description">
                  Validate new subscription requests
                </span>
              </div>
              <div className="tab-indicator"></div>
            </button>

            <button
              className={`verification-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => handleTabChange("all")}
            >
              <div className="tab-icon">
                <FaList />
              </div>
              <div className="tab-content">
                <span className="tab-title">All Requests</span>
                <span className="tab-description">
                  View all subscription records
                </span>
              </div>
              <div className="tab-indicator"></div>
            </button>

            {/* Maintenance */}
            <button
              className={`verification-tab ${activeTab === "maintenance" ? "active" : ""}`}
              onClick={() => handleTabChange("maintenance")}
            >
              <div className="tab-icon"><FaTools /></div>
              <div className="tab-content">
                <span className="tab-title">Maintenance</span>
                <span className="tab-description">Add / remove maintenance</span>
              </div>
              <div className="tab-indicator"></div>
            </button>

            <button
              className={`verification-tab ${activeTab === "allmaintenance" ? "active" : ""}`}
              onClick={() => handleTabChange("allmaintenance")}
            >
              <div className="tab-icon"><FaTools /></div>
              <div className="tab-content">
                <span className="tab-title">All Maintenance</span>
                <span className="tab-description">View / Update / Delete</span>
              </div>
              <div className="tab-indicator"></div>
            </button>


          </div>
        </div>



        {/* Tab Content with Animation */}
        <div className={`verification-tab-content ${isAnimating ? "fade-out" : "fade-in"}`}>
          {activeTab === "verify" && (
            <VerificationTab loading={loading} setLoading={setLoading} />
          )}
          {activeTab === "all" && (
            <AllRequestsTab loading={loading} setLoading={setLoading} />
          )}
          {activeTab === "maintenance" && (
            <MaintenanceTab loading={loading} setLoading={setLoading} />
          )}
          {activeTab === "allmaintenance" && (
            <AllMaintenanceTab loading={loading} setLoading={setLoading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionVerification;

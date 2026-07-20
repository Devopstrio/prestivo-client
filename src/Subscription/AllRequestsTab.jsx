// AllRequestsTab.js - Enhanced with animations
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import {
  FaList,
  FaCheck,
  FaClock,
  FaEye,
  FaFilter,
  FaSync,
  FaDownload,
  FaSearch,
} from "react-icons/fa";
import { MdVerified, MdPending } from "react-icons/md";
import { exportToExcel } from "../templates/SubscriptionListExcel";

const AllRequestsTab = ({ loading, setLoading }) => {
  const [filterTab, setFilterTab] = useState("all");
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/subscription/all`);
      setAllSubscriptions(res.data.data || []);
    } catch (error) {
      console.error("Error fetching all subscriptions:", error);
      showNotification("Error fetching subscriptions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSubscriptions();
  }, []);

  const filteredSubscriptions = allSubscriptions.filter((sub) => {
    const matchesFilter = filterTab === "all" ? true :
      filterTab === "completed" ? sub.verifiedStatus :
        !sub.verifiedStatus;

    const matchesSearch = sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subscriptionId?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (verified) => {
    return verified ? (
      <span className="status-badge verified">
        <MdVerified />
        Verified
      </span>
    ) : (
      <span className="status-badge pending">
        <MdPending />
        Pending
      </span>
    );
  };

  const handleExportExcel = () => {
    exportToExcel(filteredSubscriptions, "Subscription_List");
  };

  const showNotification = (message, type) => {
    console.log(`${type}: ${message}`);
  };

  return (
    <div className="all-requests-tab">
      {/* Header with Stats */}
      <div className="requests-header">
        <div className="header-content">
          <h2 className="verify-title">All Subscription Requests</h2>
          <p className="verify-subtitle">
            Manage and monitor all subscription verification requests
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary refresh-btn"
            onClick={fetchAllSubscriptions}
            disabled={loading}
          >
            <FaSync className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        {/* Search Input */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or subscription ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs-container">
          <div className="filter-tabs">
            {[
              { key: "all", label: "All Requests", icon: <FaList />, count: allSubscriptions.length },
              { key: "completed", label: "Completed", icon: <FaCheck />, count: allSubscriptions.filter(s => s.verifiedStatus).length },
              { key: "incomplete", label: "Incomplete", icon: <FaClock />, count: allSubscriptions.filter(s => !s.verifiedStatus).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`filter-tab ${filterTab === tab.key ? "active" : ""}`}
              >
                <div className="tab-icon">{tab.icon}</div>
                <span className="tab-label">{tab.label}</span>
                <span className="tab-count">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="requests-table-container">
        <div className="table-wrapper">
          <table className="requests-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Subscription ID</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>paymentStatus</th>
                <th>Company Name</th>
                <th>Company Address</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((sub, i) => (
                  <tr key={sub._id} className="table-row">
                    <td className="index-cell">{i + 1}</td>
                    <td className="subscription-id-cell">
                      <code>{sub.subscriptionId}</code>
                    </td>
                    <td className="name-cell">{sub.name}</td>
                    <td className="email-cell">{sub.email}</td>
                    <td className="plan-cell">
                      <span className="plan-tag">{sub.plan}</span>
                    </td>
                    <td className="email-cell">
                      {sub.plan?.toLowerCase().includes("free") ? "None" : sub.paymentStatus}
                    </td>
                    <td className="email-cell">{sub.companyName}</td>
                    <td className="email-cell">{sub.companyAddress}</td>
                    <td className="status-cell">
                      {getStatusIcon(sub.verifiedStatus)}
                    </td>
                    <td className="date-cell">
                      {sub.subscription_start_date || (
                        <span className="empty-date">Not set</span>
                      )}
                    </td>
                    <td className="date-cell">
                      {sub.subscription_expiry_date || (
                        <span className="empty-date">Not set</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FaEye />
                      </div>
                      <h3>No subscriptions found</h3>
                      <p>
                        {searchTerm
                          ? "No results match your search criteria."
                          : "No subscription requests found for this filter."
                        }
                      </p>
                      {searchTerm && (
                        <button
                          className="btn btn-text"
                          onClick={() => setSearchTerm("")}
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredSubscriptions.length > 0 && (
          <div className="table-footer">
            <div className="footer-info">
              Showing <strong>{filteredSubscriptions.length}</strong> of{" "}
              <strong>{allSubscriptions.length}</strong> subscriptions
            </div>
            <div className="footer-actions">
              <button
                className="btn btn-text export-btn"
                onClick={handleExportExcel}
                disabled={filteredSubscriptions.length === 0}
              >
                <FaDownload />
                Export Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRequestsTab;
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
import { AuthContext } from "../context/AuthContext";
import "../styles/SupportManagement.css";
import SupportCancelOrderTab from "../pages/SupportCancelOrderTab";
import ReturnPolicyRequests from "../pages/ReturnPolicyRequests";
import InvoiceViewer from "../pages/InvoiceViewer";
import DeleteUsers from "../components/DeleteUsers";

const SupportManagement = () => {
  const [queries, setQueries] = useState([]);
  const [activeTab, setActiveTab] = useState("Incomplete");
  const navigate = useNavigate();
  const { user, logout, loading } = useContext(AuthContext);
  const [pendingReturnCount, setPendingReturnCount] = useState(0);
  const [approvedCancelCount, setApprovedCancelCount] = useState(0);


  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchQueries();
      fetchReturnRequestCount();
      fetchApprovedCancelCount();
    }
  }, [user]);

  const fetchQueries = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/contact/all`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setQueries(res.data);
    } catch (err) {
      console.error("Error fetching queries", err);
    }
  };

  // ✅ Fetch Return Requests (only count pending)
  const fetchReturnRequestCount = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/return-policy/return-orders`);
      const pending = res.data.filter((req) => req.status === "Pending").length;
      setPendingReturnCount(pending);
    } catch (err) {
      console.error("Error fetching return request count", err);
    }
  };

  const fetchApprovedCancelCount = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders/cancellations/approved`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setApprovedCancelCount(res.data.approvedOrders?.length || 0);
    } catch (err) {
      console.error("Error fetching approved cancellation count", err);
    }
  };


  const markAsCompleted = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/contact/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      fetchQueries();
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const filteredQueries = queries.filter((q) =>
    activeTab === "Incomplete" ? q.status === "Pending" : q.status === "Completed"
  );

  const pendingCount = queries.filter((q) => q.status === "Pending").length;
  const completedCount = queries.filter((q) => q.status === "Completed").length;

  return (
    <div className="support-new-dashboard">
      {/* Sidebar */}
      <div className="support-new-sidebar">
        <div className="support-sidebar-header">
          <h2>Support Panel</h2>
        </div>

        <div className="support-sidebar-content">
          <div className="support-user-welcome">
            <div className="support-user-avatar">
              <i className="fas fa-user-shield support-avatar-icon"></i>
            </div>
            <div className="support-user-info">
              <p className="support-welcome-text">Welcome back,</p>
              <p className="support-username">{user?.name}</p>
              <p className="support-user-role">{user?.role}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="support-sidebar-nav">
            <div
              className={`support-nav-item ${activeTab === "Incomplete" ? "support-nav-active" : ""
                }`}
              onClick={() => setActiveTab("Incomplete")}
            >
              <i className="fas fa-clock support-nav-icon"></i>
              <span>Incomplete</span>
              {pendingCount > 0 && <span className="support-badge">{pendingCount}</span>}
            </div>

            <div
              className={`support-nav-item ${activeTab === "Completed" ? "support-nav-active" : ""
                }`}
              onClick={() => setActiveTab("Completed")}
            >
              <i className="fas fa-check-circle support-nav-icon"></i>
              <span>Completed</span>
              {completedCount > 0 && (
                <span className="support-badge support-badge-completed">
                  {completedCount}
                </span>
              )}
            </div>

            <div
              className={`support-nav-item ${activeTab === "ReturnPolicyRequests" ? "support-nav-active" : ""
                }`}
              onClick={() => setActiveTab("ReturnPolicyRequests")}
            >
              <i className="fas fa-undo-alt support-nav-icon"></i>
              <span>Return Requests</span>
              {pendingReturnCount > 0 && (
                <span className="support-badge">{pendingReturnCount}</span>
              )}
            </div>

            <div
              className={`support-nav-item ${activeTab === "SupportCancelOrderTab" ? "support-nav-active" : ""
                }`}
              onClick={() => setActiveTab("SupportCancelOrderTab")}
            >
              <i className="fas fa-times-circle support-nav-icon"></i>
              <span>Cancellations Requests</span>
              {approvedCancelCount > 0 && (
                <span className="support-badge">{approvedCancelCount}</span>
              )}
            </div>

            <div
              className={`support-nav-item ${activeTab === "DeleteUsers" ? "support-nav-active" : ""
                }`}
              onClick={() => setActiveTab("DeleteUsers")}
            >
              <i className="fas fa-user-times support-nav-icon"></i>
              <span>Delete Users</span>
            </div>



            {/* <div
              className={`support-nav-item ${activeTab === "InvoiceViewer" ? "support-nav-active" : ""
                }`}
              onClick={() => setActiveTab("InvoiceViewer")}
            >
              <i className="fas fa-file-invoice support-nav-icon"></i>
              <span>Invoice Viewer</span>
            </div> */}

            <div
              className="support-nav-item support-logout-item"
              onClick={logout}
            >
              <i className="fas fa-sign-out-alt support-nav-icon"></i>
              <span>Logout</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="support-new-main">
        <div className="support-main-header">
          <h1>Support Management Dashboard</h1>
        </div>

        <div className="support-content-area">
          {activeTab === "Profile" && (
            <div className="support-tab-content">
              <h2 className="support-tab-title">{user?.role} Profile</h2>
              <div className="support-profile-card">
                <div className="support-profile-header">
                  <i className="fas fa-user-shield support-avatar-large"></i>
                  <div className="support-profile-info">
                    <h3>{user?.name}</h3>
                    <p><i className="fas fa-envelope"></i> {user?.email}</p>
                    <p><i className="fas fa-briefcase"></i> {user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Queries Section */}
          {(activeTab === "Incomplete" || activeTab === "Completed") && (
            <div className="support-tab-content">
              <h2 className="support-tab-title">{activeTab} Queries</h2>
              {filteredQueries.length === 0 ? (
                <div className="support-no-queries">
                  <i className="fas fa-inbox support-no-queries-icon"></i>
                  <p>No {activeTab.toLowerCase()} queries found</p>
                </div>
              ) : (
                <div className="support-table-container">
                  <table className="support-data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Status</th>
                        {activeTab === "Incomplete" && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQueries.map((q) => (
                        <tr key={q._id}>
                          <td>{q.name}</td>
                          <td>{q.email}</td>
                          <td>{q.subject}</td>
                          <td>{q.message}</td>
                          <td>
                            <span
                              className={`support-status-badge ${q.status === "Completed"
                                ? "support-status-completed"
                                : "support-status-pending"
                                }`}
                            >
                              {q.status}
                            </span>
                          </td>
                          {activeTab === "Incomplete" && (
                            <td>
                              <button
                                onClick={() => markAsCompleted(q._id)}
                                className="support-complete-btn"
                              >
                                <i className="fas fa-check"></i>
                                Mark Complete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "SupportCancelOrderTab" && <SupportCancelOrderTab />}


          {/* Return Policy Requests */}
          {activeTab === "ReturnPolicyRequests" && <ReturnPolicyRequests />}
          {activeTab === "DeleteUsers" && <DeleteUsers />}

          {/* Invoice Viewer */}
          {/* {activeTab === "InvoiceViewer" && <InvoiceViewer />} */}
        </div>
      </div>
    </div>
  );
};

export default SupportManagement;

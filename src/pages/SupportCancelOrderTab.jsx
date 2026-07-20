import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { AuthContext } from "../context/AuthContext";
import "../styles/SupportCancelOrderTab.css";
import {
  FaSearch,
  FaCheckCircle,
  FaTimes,
  FaClock,
  FaUser,
  FaInfoCircle,
  FaBoxOpen,
  FaWarehouse,
  FaMoneyBillWave,
  FaCreditCard,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaShoppingBag,
  FaShippingFast,
  FaExclamationTriangle,
  FaGlobe,
  FaIdCard
} from "react-icons/fa";

const SupportCancelOrderTab = () => {
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { user } = useContext(AuthContext);

  const fetchApprovedOrders = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/orders/cancellations/approved`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setApprovedOrders(res.data.approvedOrders || []);
    } catch (err) {
      console.error("Error fetching approved cancellation orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchApprovedOrders();
  }, [user]);

  const markAsCompleted = async (orderId) => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/orders/cancel/complete/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      alert(res.data.message || "Cancellation completed successfully.");
      fetchApprovedOrders();
    } catch (err) {
      console.error("Error completing cancellation:", err);
      alert("Failed to complete cancellation.");
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const renderProductDetails = (product) => {
    const details = {
      Category: product.category,
      Subcategory: product.subCategory,
      "Sub-Subcategory": product.subSubCategory,
      Size: product.size?.length > 0 ? product.size.join(", ") : null,
      Color: product.color,
      Material: product.material,
      Fit: product.fit,
      Brand: product.brand,
      Warranty: product.warranty,
      RAM: product.ram?.join(", "),
      Storage: product.storage?.join(", "),
      Processor: product.processor,
      "Display Size": product.displaySize,
      Battery: product.battery,
      Camera: product.camera,
      "Screen Size": product.screenSize,
      Inches: product.inchs,
      "Skin Type": product.skinType,
      "Hair Type": product.hairType,
      "Fragrance Type": product.fragranceType,
      Language: product.language,
      Author: product.author,
      Genre: product.genre,
      Format: product.format,
      "Pack Size": product.packSize,
      Organic: product.organic,
      Model: product.model,
      Power: product.power,
      Capacity: product.capacity,
      Weight: product.weight,
      "Extra Details": product.extraDetails
        ? JSON.stringify(Object.fromEntries(product.extraDetails))
        : null,
    };

    return (
      <div className="sc-product-details-grid">
        {Object.entries(details).map(([label, value], idx) =>
          value ? (
            <div key={idx} className="sc-detail-item">
              <span className="sc-detail-label">{label}:</span>
              <span className="sc-detail-value">{value}</span>
            </div>
          ) : null
        )}
      </div>
    );
  };

  // Filter orders based on search and status
  const filteredOrders = approvedOrders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userDetails?.mobile?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || order.cancellationStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { class: "sc-status-approved", label: "Approved" },
      processing: { class: "sc-status-processing", label: "Processing" },
      completed: { class: "sc-status-completed", label: "Completed" }
    };

    const config = statusConfig[status] || { class: "sc-status-default", label: status };
    return <span className={`sc-status-badge ${config.class}`}>{config.label}</span>;
  };

  return (
    <div className="sc-container">
      {/* Header Section */}
      <div className="sc-header">
        <div className="sc-header-content">
          <div className="sc-title-section">
            <FaBoxOpen className="sc-title-icon" />
            <div>
              <h1 className="sc-main-title">Approved Cancellation Orders</h1>
              <p className="sc-subtitle">Manage and process approved order cancellations</p>
            </div>
          </div>
          <div className="sc-stats">
            <div className="sc-stat-card">
              <span className="sc-stat-number">{approvedOrders.length}</span>
              <span className="sc-stat-label">Total Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="sc-controls">
        <div className="sc-search-container">
          <FaSearch className="sc-search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Email or Phone..."
            className="sc-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="sc-content">
        {loading ? (
          <div className="sc-loading">
            <div className="sc-loading-spinner"></div>
            <p>Loading cancellation orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="sc-empty-state">
            <FaExclamationTriangle className="sc-empty-icon" />
            <h3>No Approved Cancellations Found</h3>
            <p>There are currently no approved cancellation orders to display.</p>
          </div>
        ) : (
          <div className="sc-orders-grid">
            {filteredOrders.map((order) => (
              <div key={order._id} className="sc-order-card">
                <div className="sc-card-header">
                  <div className="sc-order-info">
                    <div className="sc-order-id">
                      <FaBoxOpen className="sc-order-icon" />
                      <span>Order #{order._id}</span>
                    </div>
                    {getStatusBadge(order.cancellationStatus)}
                  </div>
                  <div className="sc-order-meta">
                    <div className="sc-meta-item">
                      <FaClock className="sc-meta-icon" />
                      <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="sc-card-body">
                  <div className="sc-customer-info">
                    <div className="sc-customer-avatar">
                      <FaUser className="sc-avatar-icon" />
                    </div>
                    <div className="sc-customer-details">
                      <h4 className="sc-customer-name">{order.userDetails?.name || "Unknown User"}</h4>
                      <div className="sc-customer-contact-grid">
                        <div className="sc-contact-item">
                          <FaEnvelope className="sc-contact-icon" />
                          <span>{order.userDetails?.email || "No email"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sc-order-details">
                    <div className="sc-detail-row">
                      <div className="sc-detail-item">
                        <FaMoneyBillWave className="sc-detail-icon" />
                        <div>
                          <span className="sc-detail-label">Total Amount</span>
                          <span className="sc-detail-value">{order.currency} {order.totalAmount}</span>
                        </div>
                      </div>
                      <div className="sc-detail-item">
                        <FaCreditCard className="sc-detail-icon" />
                        <div>
                          <span className="sc-detail-label">Payment</span>
                          <span className="sc-detail-value">{order.paymentMethod} ({order.paymentStatus})</span>
                        </div>
                      </div>
                    </div>

                    <div className="sc-reason-section">
                      <FaInfoCircle className="sc-reason-icon" />
                      <div className="sc-reason-content">
                        <span className="sc-reason-label">Cancellation Reason</span>
                        <p className="sc-reason-text">{order.cancellationReason || "No reason provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sc-card-actions">
                  <button
                    className="sc-btn sc-btn-secondary"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <FaSearch className="sc-btn-icon" />
                    View Details
                  </button>
                  {order.cancellationStatus !== "completed" && (
                    <button
                      className="sc-btn sc-btn-primary"
                      onClick={() => markAsCompleted(order._id)}
                    >
                      <FaCheckCircle className="sc-btn-icon" />
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="sc-modal-overlay">
          <div className="sc-modal-container">
            <div className="sc-modal-header">
              <div className="sc-modal-title-section">
                <FaBoxOpen className="sc-modal-title-icon" />
                <div>
                  <h2>Order Details</h2>
                  <p>Order #{selectedOrder._id}</p>
                </div>
              </div>
              <button className="sc-modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="sc-modal-body">
              <div className="sc-modal-grid">
                {/* Order Information Card */}
                <div className="sc-info-card">
                  <div className="sc-card-header">
                    <FaInfoCircle className="sc-card-icon" />
                    <h3>Order Information</h3>
                  </div>
                  <div className="sc-card-content">
                    <div className="sc-info-grid">
                      <div className="sc-info-item">
                        <span className="sc-info-label">Total Amount : </span>
                        <span className="sc-info-value">
                          <FaMoneyBillWave className="sc-value-icon" /> &nbsp;
                          {selectedOrder.currency} {selectedOrder.totalAmount}
                        </span>
                      </div>
                      <div className="sc-info-item">
                        <span className="sc-info-label">Payment Method : </span>
                        <span className="sc-info-value">{selectedOrder.paymentMethod || "N/A"}</span>
                      </div>
                      <div className="sc-info-item">
                        <span className="sc-info-label">Payment Status : </span>
                        <span className={`sc-info-value sc-status-${selectedOrder.paymentStatus?.toLowerCase()}`}>
                          {selectedOrder.paymentStatus || "Pending"}
                        </span>
                      </div>
                      <div className="sc-info-item">
                        <span className="sc-info-label">Cancellation Status: </span>
                        {getStatusBadge(selectedOrder.cancellationStatus)}
                      </div>
                    </div>
                    <div className="sc-reason-box">
                      <span className="sc-reason-title">Cancellation Reason : </span>
                      <p className="sc-reason-description">{selectedOrder.cancellationReason}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Information Card */}
                <div className="sc-info-card">
                  <div className="sc-card-header">
                    <FaUser className="sc-card-icon" />
                    <h3>Customer Information</h3>
                  </div>
                  <div className="sc-card-content">
                    <div className="sc-customer-modal-grid">
                      <div className="sc-customer-detail-item">
                        <div className="sc-detail-header">
                          <FaIdCard className="sc-detail-header-icon" />
                          <span className="sc-detail-header-label">Personal Info</span>
                        </div>
                        <div className="sc-detail-content">
                          <div className="sc-customer-field">
                            <span className="sc-field-label">Full Name</span>
                            <span className="sc-field-value">{selectedOrder.userDetails?.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="sc-customer-detail-item">
                        <div className="sc-detail-header">
                          <FaEnvelope className="sc-detail-header-icon" />
                          <span className="sc-detail-header-label">Contact Info</span>
                        </div>
                        <div className="sc-detail-content">
                          <div className="sc-customer-field">
                            <span className="sc-field-label">Email Address</span>
                            <span className="sc-field-value sc-email-value">
                              {selectedOrder.userDetails?.email}
                            </span>
                          </div>
                          <div className="sc-customer-field">
                            <span className="sc-field-label">Phone Number</span>
                            <span className="sc-field-value sc-phone-value">
                              <FaPhone className="sc-field-icon" />
                              {selectedOrder.userDetails?.regionCode && selectedOrder.userDetails?.mobile
                                ? `${selectedOrder.userDetails.regionCode} ${selectedOrder.userDetails.mobile}`
                                : selectedOrder.userDetails?.mobile || "Not provided"
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="sc-customer-detail-item sc-full-width">
                        <div className="sc-detail-header">
                          <FaMapMarkerAlt className="sc-detail-header-icon" />
                          <span className="sc-detail-header-label">Delivery Address</span>
                        </div>
                        <div className="sc-detail-content">
                          <div className="sc-address-details">
                            <div className="sc-address-line">
                              <strong>Address:</strong> {selectedOrder.userDetails?.houseNumber}
                            </div>
                            <div className="sc-address-line">
                              <strong>District:</strong> {selectedOrder.userDetails?.district}
                            </div>
                            <div className="sc-address-line">
                              <strong>State:</strong> {selectedOrder.userDetails?.state}
                            </div>
                            <div className="sc-address-line">
                              <strong>Pincode:</strong> {selectedOrder.userDetails?.pincode}
                            </div>
                            <div className="sc-address-line">
                              <FaGlobe className="sc-globe-icon" />
                              <strong>Region:</strong> {selectedOrder.userDetails?.region}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Card */}
                <div className="sc-info-card sc-full-width">
                  <div className="sc-card-header">
                    <FaShoppingBag className="sc-card-icon" />
                    <h3>Products & Allocations</h3>
                  </div>
                  <div className="sc-card-content">
                    <div className="sc-products-list">
                      {selectedOrder.products?.map((product, idx) => (
                        <div key={idx} className="sc-product-item">
                          <div className="sc-product-header">
                            <div className="sc-product-basic">
                              <h4 className="sc-product-name">{product.name}</h4>
                              <div className="sc-product-meta">
                                <span className="sc-product-qty">Qty: {product.qty}</span>
                                <span className="sc-product-total">{selectedOrder.currency} {product.total}</span>
                              </div>
                            </div>
                          </div>

                          {renderProductDetails(product)}

                          <div className="sc-allocations-section">
                            <div className="sc-section-header">
                              <FaWarehouse className="sc-section-icon" />
                              <h5>Warehouse Allocations</h5>
                            </div>
                            <div className="sc-allocations-grid">
                              {product.warehouseAllocations?.map((alloc, i) => (
                                <div key={i} className="sc-allocation-item">
                                  <FaShippingFast className="sc-allocation-icon" />
                                  <div className="sc-allocation-details">
                                    <span className="sc-allocation-type">{alloc.warehouseType}</span>
                                    <span className="sc-allocation-name">{alloc.name}</span>
                                    <span className="sc-allocation-address">
                                      {alloc.city}, {alloc.state}
                                    </span>
                                  </div>
                                  <span className="sc-allocation-qty">{alloc.qty} items</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sc-modal-footer">
              <button className="sc-btn sc-btn-outline" onClick={closeModal}>
                Close Details
              </button>
              {selectedOrder.cancellationStatus !== "completed" && (
                <button
                  className="sc-btn sc-btn-primary"
                  onClick={() => {
                    markAsCompleted(selectedOrder._id);
                    closeModal();
                  }}
                >
                  <FaCheckCircle className="sc-btn-icon" />
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportCancelOrderTab;
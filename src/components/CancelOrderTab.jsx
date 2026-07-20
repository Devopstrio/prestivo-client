import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import {
  FaTimesCircle,
  FaBoxOpen,
  FaRegClock,
  FaSearch,
  FaTimes,
  FaWarehouse,
  FaUser,
  FaInfoCircle,
  FaCheckCircle,
  FaSpinner,
  FaFileExcel
} from "react-icons/fa";
import "../styles/CancelOrderTab.css";
import "../styles/LoadingAnimation.css";
import CancelOrderTabExcel from "../templates/CancelOrderTabExcel";

const CancelOrderTab = ({ warehouseId, user }) => {
  const [canceledOrders, setCanceledOrders] = useState([]);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("incomplete");
  const [isExporting, setIsExporting] = useState(false);

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const fetchCanceledOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/warehouse-management/cancellations/${warehouseId}`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setCanceledOrders(res.data.canceledOrders || []);
    } catch (err) {
      console.error("Failed to fetch canceled orders:", err);
      setError("Error fetching canceled orders");
    }
  };

  useEffect(() => {
    fetchCanceledOrders();
  }, [warehouseId]);

  const handleApproveCancellation = async (orderId) => {
    try {
      setLoading(true);
      await axios.put(
        `${API_BASE_URL}/api/warehouse-management/cancellations/approve/${orderId}/${warehouseId}`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      toast.success("Order cancellation approved.");
      fetchCanceledOrders();
    } catch (err) {
      console.error("Failed to approve cancellation:", err);
      toast.error("Error approving cancellation.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  // Handle Excel export
  const handleExportOrders = async () => {
    setIsExporting(true);
    try {
      const ordersToExport = currentTab === "completed" ? completedOrders : incompleteOrders;
      await CancelOrderTabExcel.exportToExcel(ordersToExport, currentTab);
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Error exporting orders to Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const renderProductDetails = (product) => {
    const productDetails = {
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
      <ul className="cancel-product-details">
        {Object.entries(productDetails).map(([label, value], idx) =>
          value ? (
            <li key={idx}>
              <strong>{label}:</strong> {value}
            </li>
          ) : null
        )}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading </h3>
          <p>Please wait while orders are Loading...</p>
        </div>
      </div>
    );
  }

  // Filter orders based on tab
  const incompleteOrders = canceledOrders.filter(
    (order) =>
      order.cancellationStatus === "processing" ||
      order.cancellationStatus === "approved"
  );

  const completedOrders = canceledOrders.filter(
    (order) => order.cancellationStatus === "completed"
  );

  const currentOrders = currentTab === "completed" ? completedOrders : incompleteOrders;

  return (
    <div className="cancel-order-container">
      <h3 className="cancel-title">Cancellation Orders</h3>

      {/* Header Section with Gradient Background */}
      <div
        className="cancel-tab-header"
        style={{
          background: "linear-gradient(165deg, #1e3c72 0%, #2a5298 50%, #3a6fd9 100%)"
        }}
      >
        <div className="cancel-header-content">
          {currentTab === "completed" ? (
            <FaCheckCircle className="cancel-header-icon" />
          ) : (
            <FaTimesCircle className="cancel-header-icon" />
          )}
          <div>
            <h1>
              {currentTab === "completed" ? "Completed Cancellations" : "Incomplete Cancellations"}
            </h1>
            <p>
              {currentTab === "completed"
                ? "Successfully processed cancellation orders"
                : "Cancellation orders pending processing or approval"
              }
            </p>
          </div>
        </div>
        <div className="cancel-header-stats">
          <button
            className="cancel-export-btn"
            onClick={handleExportOrders}
            disabled={isExporting || currentOrders.length === 0}
          >
            {isExporting ? (
              <FaSpinner className="cancel-export-icon cancel-export-spinning" />
            ) : (
              <FaFileExcel className="cancel-export-icon" />
            )}
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </button>
          <div className="cancel-stat-card">
            <span className="cancel-stat-number">{currentOrders.length}</span>
            <span className="cancel-stat-label">
              {currentTab === "completed" ? "Completed" : "Incomplete"} Orders
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="cancel-tabs">
        <button
          className={`cancel-tab ${currentTab === "incomplete" ? "cancel-tab-active" : ""}`}
          onClick={() => setCurrentTab("incomplete")}
        >
          Incomplete (Processing / Approved)
        </button>
        <button
          className={`cancel-tab ${currentTab === "completed" ? "cancel-tab-active" : ""}`}
          onClick={() => setCurrentTab("completed")}
        >
          Completed
        </button>
      </div>

      {error && <p className="cancel-error-text">{error}</p>}

      {currentOrders.length === 0 ? (
        <p className="cancel-no-orders">
          No {currentTab === "completed" ? "completed" : "incomplete"} canceled
          orders found for this warehouse.
        </p>
      ) : (
        <div className="cancel-orders-grid">
          {currentOrders.map((order) => (
            <div key={order._id} className="cancel-order-card">
              <header className="cancel-card-header">
                <FaBoxOpen className="cancel-card-icon" />
                <div>
                  <h4>Order #{order._id}</h4>
                  <p>
                    Total: {order.currency} {order.totalAmount}
                  </p>
                </div>
              </header>

              <p className="cancel-order-status">Status: {order.cancellationStatus || "N/A"}</p>
              <p className="cancel-order-reason">Reason: {order.cancellationReason || "No reason provided"}</p>
              <p className="cancel-payment-method">Payment Method: {order.paymentMethod || "N/A"}</p>
              <p className="cancel-payment-status">Payment Status: {order.paymentStatus || "Pending"}</p>

              <ul className="cancel-product-list">
                {order.products.map((product, idx) => (
                  <li key={idx}>
                    <strong>{product.name}</strong> – Qty: {product.qty}
                  </li>
                ))}
              </ul>

              <div className="cancel-order-actions">
                {order.cancellationStatus === "processing" && (
                  <button
                    className="cancel-btn cancel-btn-approve"
                    onClick={() => handleApproveCancellation(order._id)}
                    disabled={loading}
                  >
                    <FaCheckCircle /> Approve Cancellation
                  </button>
                )}
                <button
                  className="cancel-btn cancel-btn-view"
                  onClick={() => setSelectedOrder(order)}
                >
                  <FaSearch /> View Details
                </button>
              </div>

              <p className="cancel-order-date">
                <FaRegClock /> Updated On: {new Date(order.updatedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing order details */}
      {selectedOrder && (
        <div className="cancel-modal-overlay">
          <div className="cancel-modal-content cancel-modal-large">
            <div className="cancel-modal-header">
              <h3>Order Details</h3>
              <button className="cancel-modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="cancel-modal-body">
              <h4 className="cancel-modal-order-title">
                <FaInfoCircle /> Order # {selectedOrder._id}
              </h4>
              <p className="cancel-modal-amount">
                <strong>Total Amount:</strong> {selectedOrder.currency}{" "}
                {selectedOrder.totalAmount}
              </p>
              <p className="cancel-modal-status">
                <strong>Status:</strong> {selectedOrder.cancellationStatus}
              </p>
              <p className="cancel-modal-payment-method">
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod || "N/A"}
              </p>
              <p className="cancel-modal-payment-status">
                <strong>Payment Status:</strong> {selectedOrder.paymentStatus || "Pending"}
              </p>
              <p className="cancel-modal-reason">
                <strong>Reason:</strong> {selectedOrder.cancellationReason}
              </p>

              <hr className="cancel-modal-divider" />

              <h4 className="cancel-modal-section-title">
                <FaUser /> Customer Details
              </h4>
              <p className="cancel-customer-name">
                <strong>Name:</strong> {selectedOrder.userDetails?.name}
              </p>
              <p className="cancel-customer-email">
                <strong>Email:</strong> {selectedOrder.userDetails?.email}
              </p>
              <p className="cancel-customer-address">
                <strong>Address:</strong>{" "}
                {`${selectedOrder.userDetails?.houseNumber}, ${selectedOrder.userDetails?.addressLine1}, ${selectedOrder.userDetails?.addressLine2}, ${selectedOrder.userDetails?.district
                  }, ${selectedOrder.userDetails?.state},
                ${selectedOrder.userDetails?.region}, - ${selectedOrder.userDetails?.pincode
                  }`}
              </p>

              <hr className="cancel-modal-divider" />

              <h4 className="cancel-modal-section-title">
                <FaBoxOpen /> Products
              </h4>
              {selectedOrder.products?.map((product, idx) => (
                <div key={idx} className="cancel-modal-product">
                  <h5 className="cancel-product-title">{product.name}</h5>
                  <p className="cancel-product-quantity">
                    <strong>Quantity:</strong> {product.qty}
                  </p>
                  <p className="cancel-product-total">
                    <strong>Total:</strong> {selectedOrder.currency} {product.total}
                  </p>

                  {renderProductDetails(product)}

                  <h6 className="cancel-allocations-title">Warehouse Allocations</h6>
                  <ul className="cancel-allocation-list">
                    {product.warehouseAllocations?.map((alloc, i) => (
                      <li key={i}>
                        <FaWarehouse /> {alloc.warehouseType} - {alloc.name} ({alloc.qty}{" "}
                        items)
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <hr className="cancel-modal-divider" />
            </div>

            <div className="cancel-modal-footer">
              <button className="cancel-btn cancel-btn-close" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelOrderTab;
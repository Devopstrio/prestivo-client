import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaBox,
  FaCheckCircle,
  FaShippingFast,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaWarehouse,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaClock,
  FaTruck,
  FaBarcode,
  FaSpinner,
  FaInfoCircle
} from "react-icons/fa";
import { toast } from "react-toastify";
import "../styles/NotificationsTab.css";
import "../styles/LoadingAnimation.css";
const NotificationsTab = ({
  notifications,
  onAcceptRequest,
  onRefresh,
  warehouseId,
  user
}) => {
  const [expandedOrders, setExpandedOrders] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);
  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading </h3>
          <p>Please wait while notifications are Loading...</p>
        </div>
      </div>
    );
  }

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Function to render warehouse status with icons
  const renderWarehouseStatus = (product) => {
    const mainWarehouseAlloc = product.warehouseAllocations?.find(
      alloc => alloc.warehouseType === "Main Warehouse"
    );

    const remainingWarehouseAlloc = product.warehouseAllocations?.find(
      alloc => alloc.warehouseType === "Remaining Warehouse"
    );


    return (
      <div className="warehouse-status-container">
        {/* Main Warehouse Status */}
        <div className={`warehouse-status-item ${mainWarehouseAlloc ? 'main-warehouse-status' : ''}`}>
          <div className="warehouse-status-header">
            <FaWarehouse className="warehouse-status-icon main-warehouse-icon" />
            <span className="warehouse-status-title">Main Warehouse</span>
          </div>
          <div className="warehouse-status-content">
            {mainWarehouseAlloc ? (
              <>
                <span className={`warehouse-status-badge ${product.notificationStatus === 'Accepted' ? 'accepted-status' : 'allocated-status'}`}>
                  {product.notificationStatus === 'Accepted' ? (
                    <>
                      <FaCheckCircle className="status-badge-icon" />
                      Accepted
                    </>
                  ) : (
                    <>
                      <FaBox className="status-badge-icon" />
                      Allocated
                    </>
                  )}
                </span>
                <span className="warehouse-quantity">Qty: {mainWarehouseAlloc.qty}</span>
              </>
            ) : (
              <span className="warehouse-status-badge not-allocated-status">
                <FaExclamationTriangle className="status-badge-icon" />
                Not Allocated
              </span>
            )}
          </div>
        </div>

        {/* Remaining Warehouse Status */}
        <div className={`warehouse-status-item ${remainingWarehouseAlloc ? 'remaining-warehouse-status' : ''}`}>
          <div className="warehouse-status-header">
            <FaWarehouse className="warehouse-status-icon remaining-warehouse-icon" />
            <span className="warehouse-status-title">Remaining Warehouse</span>
          </div>
          <div className="warehouse-status-content">
            {remainingWarehouseAlloc ? (
              <>
                <span className={`warehouse-status-badge ${product.notificationStatus === 'Accepted' ? 'accepted-status' : 'requested-status'}`}>
                  {product.notificationStatus === 'Accepted' ? (
                    <>
                      <FaCheckCircle className="status-badge-icon" />
                      Accepted
                    </>
                  ) : (
                    <>
                      <FaClock className="status-badge-icon" />
                      Requested
                    </>
                  )}
                </span>
                <span className="warehouse-quantity">Qty: {remainingWarehouseAlloc.qty}</span>
              </>
            ) : (
              <span className="warehouse-status-badge not-involved-status">
                <FaExclamationTriangle className="status-badge-icon" />
                Not Involved
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Function to render order details for accepted requests
  const renderAcceptedOrderDetails = (order) => (
    <div className="accepted-order-details-container">
      <div className="accepted-section-header">
        <FaCheckCircle className="accepted-section-icon" />
        <h4>Accepted Order Details</h4>
      </div>

      <div className="accepted-order-info-grid">
        <div className="accepted-info-item">
          <strong>Order ID:</strong>
          <span>{order._id}</span>
        </div>
        <div className="accepted-info-item">
          <strong>User:</strong>
          <span>{order.userDetails?.name || "N/A"} - {order.userDetails?.email || "N/A"}</span>
        </div>
      </div>

      <div className="accepted-products-section">
        <h5>Products to Prepare:</h5>
        <div className="accepted-products-list-container">
          {order.products.map((p, idx) => (
            <div key={idx} className="accepted-product-card">
              <div className="accepted-product-header">
                <h6>{p.name}</h6>
                {p.productId && (
                  <div className="product-id-display">
                    <FaBarcode className="product-id-icon" />
                    <span className="product-id-text">ID: {p.productId}</span>
                  </div>
                )}
                <span className="accepted-quantity-badge">Qty: {p.qty}</span>
              </div>
              <div className="accepted-product-details">
                <span>Category: {p.category}</span>
                {p.subCategory && <span>SubCategory: {p.subCategory}</span>}
                {p.subSubCategory && <span>SubSubCate: {p.subSubCategory}</span>}
                <span>Price: {p.discountedPrice} {order.currency}</span>
                {p.discount > 0 && <span className="accepted-discount">({p.discount}% OFF)</span>}
              </div>
              <div className="accepted-status-indicator">
                <FaCheckCircle className="accepted-status-icon" />
                Status: Accepted
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Function to render completed order details
  const renderCompletedOrderDetails = (order) => (
    <div className="completed-order-details-container">
      <div className="completed-section-header">
        <FaTruck className="completed-section-icon" />
        <h4>Completed Order</h4>
      </div>

      <div className="completed-order-info-grid">
        <div className="completed-info-item" id="orderid">
          <strong>Order ID:</strong>
          <span>{order._id}</span>
        </div>
        <div className="completed-info-item">
          <strong>Shipping Status:</strong>
          <span className={`completed-status ${order.shippingCompleted ? 'shipping-completed' : 'shipping-pending'}`}>
            {order.shippingCompleted ? (
              <>
                <FaCheckCircle className="completed-status-icon" />
                Completed
              </>
            ) : (
              <>
                <FaClock className="completed-status-icon" />
                Pending
              </>
            )}
          </span>
        </div>
        <div className="completed-info-item">
          <strong>Delivery Status:</strong>
          <span className={`completed-status ${order.deliveryCompleted ? 'delivery-completed' : 'delivery-pending'}`}>
            {order.deliveryCompleted ? (
              <>
                <FaCheckCircle className="completed-status-icon" />
                Delivered
              </>
            ) : (
              <>
                <FaClock className="completed-status-icon" />
                Pending
              </>
            )}
          </span>
        </div>
      </div>

      <div className="completed-products-section">
        <h5>Completed Products:</h5>
        <div className="completed-products-list-container">
          {order.products.map((p, idx) => (
            <div key={idx} className="completed-product-card">
              <div className="completed-product-header">
                <h6>{p.name}</h6>
                {p.productId && (
                  <div className="product-id-display">
                    <FaBarcode className="product-id-icon" />
                    <span className="product-id-text">ID: {p.productId}</span>
                  </div>
                )}
                <span className="completed-quantity-badge">Qty: {p.qty}</span>
              </div>
              <div className="completed-product-details">
                <span>Category: {p.category}</span>
                {p.subCategory && <span>SubCategory: {p.subCategory}</span>}
                {p.subSubCategory && <span>SubSubCate: {p.subSubCategory}</span>}
                <span>Price: {p.discountedPrice} {order.currency}</span>
              </div>
              <div className="completed-status-indicator">
                <FaCheckCircle className="completed-status-icon" />
                Order Completed
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationCard = (order) => {
    const isExpanded = expandedOrders[order._id];
    const hasRemainingRequests = order.products.some(p =>
      p.isRemainingWarehouse && p.notificationStatus === "Requested"
    );
    const hasAcceptedOrders = order.products.some(p =>
      p.isMainWarehouse && p.notificationStatus === "Accepted" && !order.shippingCompleted
    );
    const isCompleted = order.shippingCompleted || order.deliveryCompleted;

    return (
      <div key={order._id} className="notification-item-card">
        <div className="notification-card-header" onClick={() => toggleOrderExpansion(order._id)}>
          <div className="notification-header-content">
            <div className="notification-order-id-section">
              <FaBox className="notification-order-icon" />
              <div>
                <h3>Order Id #{order._id}</h3>
              </div>
            </div>
            <div className="notification-header-actions">
              {hasRemainingRequests && (
                <span className="notification-alert-badge request-alert">
                  <FaBell className="notification-badge-icon" />
                  Action Required
                </span>
              )}
              {hasAcceptedOrders && (
                <span className="notification-alert-badge accepted-alert">
                  <FaCheckCircle className="notification-badge-icon" />
                  Ready to Ship
                </span>
              )}
              {isCompleted && (
                <span className="notification-alert-badge completed-alert">
                  <FaTruck className="notification-badge-icon" />
                  Completed
                </span>
              )}

              {/* 🚀 Express / 🕒 Free Delivery */}
              {order.isExpressDelivery ? (
                <span className="notification-alert-badge express-alert">
                  <FaShippingFast className="notification-badge-icon" />
                  Express Delivery
                </span>
              ) : (
                <span className="notification-alert-badge free-alert">
                  <FaClock className="notification-badge-icon" />
                  Free Delivery
                </span>
              )}
              <div className="notification-expand-icon">
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="notification-card-content">
            {/* User Information */}
            <div className="notification-info-section">
              <div className="notification-section-title">
                <FaUser className="notification-section-icon" />
                <h4>Customer Information</h4>
              </div>
              <div className="notification-user-details-grid">
                <div className="notification-detail-item">
                  <FaUser className="notification-detail-icon" />
                  <div className="notification-detail-content">
                    <span className="notification-label">Name</span>
                    <span className="notification-value">{order.userDetails?.name || "N/A"}</span>
                  </div>
                </div>
                <div className="notification-detail-item">
                  <FaEnvelope className="notification-detail-icon" />
                  <div className="notification-detail-content">
                    <span className="notification-label">Email</span>
                    <span className="notification-value email-value">{order.userDetails?.email || "N/A"}</span>
                  </div>
                </div>
                <div className="notification-detail-item">
                  <FaPhone className="notification-detail-icon" />
                  <div className="notification-detail-content">
                    <span className="notification-label">Mobile</span>
                    <span className="notification-value">
                      {order.userDetails?.regionCode || ""} {order.userDetails?.mobile || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="notification-detail-item full-width-item">
                  <FaMapMarkerAlt className="notification-detail-icon" />
                  <div className="notification-detail-content">
                    <span className="notification-label">Delivery Address</span>
                    <div className="notification-address">
                      <p>{order.userDetails?.houseNumber || ""}, {order.userDetails?.addressLine1 || ""}, {order.userDetails?.addressLine2 || ""}, {order.userDetails?.district || ""}</p>
                      <p>{order.userDetails?.state || ""}, {order.userDetails?.region || ""} - {order.userDetails?.pincode || ""}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="notification-info-section">
              <div className="notification-section-title">
                <FaCreditCard className="notification-section-icon" />
                <h4>Payment Information</h4>
              </div>
              <div className="notification-payment-details">
                <div className="notification-payment-item">
                  <span className="notification-label">Method</span>
                  <span className="notification-value payment-method">{order.paymentMethod}</span>
                </div>
                <div className="notification-payment-item">
                  <span className="notification-label">Status</span>
                  <span className={`notification-value payment-status ${order.paymentStatus?.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="notification-payment-item">
                  <span className="notification-label">Total Amount</span>
                  <span className="notification-value payment-amount">
                    <FaMoneyBillWave className="payment-amount-icon" />
                    {order.totalAmount} {order.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="notification-info-section">
              <div className="notification-section-title">
                <FaBox className="notification-section-icon" />
                <h4>Products ({order.products.length})</h4>
              </div>
              <div className="notification-products-list">
                {order.products.map((p, idx) => (
                  <div key={idx} className="notification-product-item">
                    <div className="notification-product-main">
                      <div className="notification-product-info">
                        <h5>{p.name}</h5>
                        {p.productId && (
                          <div className="product-id-display">
                            <FaBarcode className="product-id-icon" />
                            <span className="product-id-text">ID: {p.productId}</span>
                          </div>
                        )}
                        <div className="notification-product-meta">
                          <span className="notification-meta-item">
                            <FaBox className="notification-meta-icon" />
                            Qty: {p.qty}
                          </span>
                          <span className="notification-meta-item">
                            Category: {p.category}
                          </span>
                          {p.subCategory && (
                            <span className="notification-meta-item">
                              Sub: {p.subCategory}
                            </span>
                          )}
                          {p.subSubCategory && (
                            <span className="notification-meta-item">
                              SubSubCate: {p.subSubCategory}
                            </span>
                          )}
                        </div>


                        <div className="notification-product-pricing">
                          <span className="notification-price">{p.discountedPrice} {order.currency}</span>
                          {p.discount > 0 && (
                            <span className="notification-discount">({p.discount}% OFF)</span>
                          )}
                        </div>
                      </div>



                      {/* Warehouse Status */}
                      {renderWarehouseStatus(p)}

                      {/* Action Buttons */}
                      <div className="notification-product-actions">
                        {p.isRemainingWarehouse && p.notificationStatus === "Requested" && (
                          <button
                            className="notification-accept-btn"
                            onClick={() => onAcceptRequest(order._id, p.allocationId)}
                          >
                            <FaCheckCircle className="notification-btn-icon" />
                            Accept Request
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Show accepted order details for Main Warehouse */}
                    {p.isMainWarehouse && p.notificationStatus === "Accepted" && !order.shippingCompleted && (
                      renderAcceptedOrderDetails(order)
                    )}


                    {/* Show completed order details */}
                    {(order.shippingCompleted || order.deliveryCompleted) && (
                      renderCompletedOrderDetails(order)
                    )}


                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Separate notifications by type and status
  const remainingWarehouseNotifications = notifications.filter(order =>
    order.products.some(p => p.isRemainingWarehouse && p.notificationStatus === "Requested")
  );

  const mainWarehouseAcceptedNotifications = notifications.filter(order =>
    order.products.some(p => p.isMainWarehouse && p.notificationStatus === "Accepted" && !order.shippingCompleted)
  );

  const completedNotifications = notifications.filter(order =>
    order.shippingCompleted || order.deliveryCompleted
  );

  const pendingMainWarehouseNotifications = notifications.filter(order =>
    order.products.some(p => p.isMainWarehouse && (!p.notificationStatus || p.notificationStatus === "Allocated") && !order.shippingCompleted)
  );

  return (
    <div className="notifications-container-main">
      <div className="notifications-main-header">
        <div className="notifications-header-content">
          <FaBell className="notifications-header-icon" />
          <div>
            <h1>Warehouse Notifications</h1>
            <p>Manage order requests and allocations</p>
          </div>
        </div>
        <button className="notifications-refresh-btn" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {/* Statistics Summary */}
      <div className="notifications-stats-grid">
        <div className="notifications-stat-card total-stat">
          <FaBell className="notifications-stat-icon" />
          <div className="notifications-stat-content">
            <span className="notifications-stat-number">{notifications.length}</span>
            <span className="notifications-stat-label">Total Notifications</span>
          </div>
        </div>
        <div className="notifications-stat-card pending-stat">
          <FaClock className="notifications-stat-icon" />
          <div className="notifications-stat-content">
            <span className="notifications-stat-number">{remainingWarehouseNotifications.length}</span>
            <span className="notifications-stat-label">Pending Requests</span>
          </div>
        </div>
        <div className="notifications-stat-card allocated-stat">
          <FaBox className="notifications-stat-icon" />
          <div className="notifications-stat-content">
            <span className="notifications-stat-number">{pendingMainWarehouseNotifications.length}</span>
            <span className="notifications-stat-label">Pending Allocations</span>
          </div>
        </div>
        <div className="notifications-stat-card accepted-stat">
          <FaCheckCircle className="notifications-stat-icon" />
          <div className="notifications-stat-content">
            <span className="notifications-stat-number">{mainWarehouseAcceptedNotifications.length}</span>
            <span className="notifications-stat-label">Accepted Orders</span>
          </div>
        </div>
        <div className="notifications-stat-card completed-stat">
          <FaTruck className="notifications-stat-icon" />
          <div className="notifications-stat-content">
            <span className="notifications-stat-number">{completedNotifications.length}</span>
            <span className="notifications-stat-label">Completed Orders</span>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="notifications-empty-state">
          <FaBell className="notifications-empty-icon" />
          <h3>No Notifications Available</h3>
          <p>There are no notifications for your warehouse at the moment.</p>
        </div>
      ) : (
        <div className="notifications-sections-container">
          {/* Pending Requests from Main Warehouse */}
          {remainingWarehouseNotifications.length > 0 && (
            <div className="notifications-section-group">
              <div className="notifications-section-header warning-section">
                <FaExclamationTriangle className="notifications-section-icon" />
                <h2>Pending Requests from Main Warehouse ({remainingWarehouseNotifications.length})</h2>
              </div>
              {remainingWarehouseNotifications.map((order) => renderNotificationCard(order))}
            </div>
          )}

          {/* Pending Main Warehouse Allocations */}
          {pendingMainWarehouseNotifications.length > 0 && (
            <div className="notifications-section-group">
              <div className="notifications-section-header info-section">
                <FaBox className="notifications-section-icon" />
                <h2>Pending Main Warehouse Allocations ({pendingMainWarehouseNotifications.length})</h2>
              </div>
              {pendingMainWarehouseNotifications.map((order) => renderNotificationCard(order))}
            </div>
          )}

          {/* Main Warehouse Accepted Orders */}
          {mainWarehouseAcceptedNotifications.length > 0 && (
            <div className="notifications-section-group">
              <div className="notifications-section-header success-section">
                <FaCheckCircle className="notifications-section-icon" />
                <h2>Accepted Orders - Ready for Shipping ({mainWarehouseAcceptedNotifications.length})</h2>
              </div>
              {mainWarehouseAcceptedNotifications.map((order) => renderNotificationCard(order))}
            </div>
          )}

          {/* Completed Orders */}
          {completedNotifications.length > 0 && (
            <div className="notifications-section-group">
              <div className="notifications-section-header completed-section">
                <FaTruck className="notifications-section-icon" />
                <h2>Completed Orders ({completedNotifications.length})</h2>
              </div>
              {completedNotifications.map((order) => renderNotificationCard(order))}

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
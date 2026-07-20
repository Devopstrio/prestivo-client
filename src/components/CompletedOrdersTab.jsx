import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBox,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaCheckCircle,
  FaShippingFast,
  FaUserTie,
  FaCalendarAlt,
  FaIdCard,
  FaTag,
  FaRuler,
  FaWeight,
  FaPalette,
  FaLayerGroup,
  FaWarehouse,
  FaTimes,
  FaExpand,
  FaCompress,
  FaBarcode,
  FaInfoCircle,
  FaSpinner,
  FaFileExcel
} from "react-icons/fa";
import "../styles/CompletedOrdersTab.css";
import "../styles/LoadingAnimation.css";
import { exportCompletedOrdersToExcel } from "../templates/CompletedOrdersTabExcel";

const CompletedOrdersTab = ({ completedOrders, warehouseId, employees }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [warehouseName, setWarehouseName] = useState("");

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Get warehouse name from session storage
  useEffect(() => {
    const nameFromSession = sessionStorage.getItem("warehouseName");
    if (nameFromSession) setWarehouseName(nameFromSession);
  }, []);

  // Export function for completed orders
  const handleExportCompletedOrders = () => {
    exportCompletedOrdersToExcel(mainWarehouseCompletedOrders, warehouseName, setIsExporting, employees);
  };

  // Filter to show only Main Warehouse completed orders
  const mainWarehouseCompletedOrders = completedOrders.filter(order =>
    order.products?.some(product =>
      product.warehouseAllocations?.some(alloc =>
        alloc.warehouseId?.toString() === warehouseId &&
        alloc.warehouseType === "Main Warehouse"
      )
    )
  );

  // Enhanced search to include product IDs
  const filteredOrders = mainWarehouseCompletedOrders.filter(order =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userDetails?.mobile?.includes(searchTerm) ||
    // Search in product IDs and names
    order.products?.some(product =>
      product.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
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

  // ... rest of your existing functions (renderProductDetails, renderOrderCard, renderOrderModal) remain the same
  // Function to render product details similar to DeliveryTab
  const renderProductDetails = (product, currency) => {
    const details = [];

    // Product ID - Similar to DeliveryTab
    if (product.productId) {
      details.push(
        <div key="product-id" className="completed-product-detail-item">
          <FaBarcode className="completed-detail-icon" />
          <div className="completed-detail-content">
            <span className="completed-detail-label">Product ID</span>
            <span className="completed-detail-value completed-product-id">{product.productId}</span>
          </div>
        </div>
      );
    }

    // Basic product info
    details.push(
      <div key="quantity" className="completed-product-detail-item">
        <FaBox className="completed-detail-icon" />
        <div className="completed-detail-content">
          <span className="completed-detail-label">Quantity</span>
          <span className="completed-detail-value">Qty: {product.qty}</span>
        </div>
      </div>
    );

    // Pricing information
    details.push(
      <div key="pricing" className="completed-product-detail-item">
        <FaMoneyBillWave className="completed-detail-icon" />
        <div className="completed-detail-content">
          <span className="completed-detail-label">Price</span>
          <span className="completed-detail-value">
            {product.discountedPrice} {currency}
            {product.originalPrice && product.originalPrice !== product.discountedPrice && (
              <span className="completed-original-price">(Was: {product.originalPrice} {currency})</span>
            )}
          </span>
        </div>
      </div>
    );

    // Product attributes from schema - Similar to DeliveryTab
    const attributes = [
      { key: 'brand', label: 'Brand', icon: FaBarcode },
      { key: 'color', label: 'Color', icon: FaPalette },
      { key: 'material', label: 'Material', icon: FaInfoCircle },
      { key: 'weight', label: 'Weight', icon: FaWeight },
      { key: 'dimensions', label: 'Dimensions', icon: FaRuler },
      { key: 'selectedSize', label: 'Size', icon: FaRuler },
      { key: 'sizeInches', label: 'Size (Inches)', icon: FaRuler },
      { key: 'category', label: 'Category', icon: FaTag },
      { key: 'subCategory', label: 'Sub Category', icon: FaLayerGroup },
      { key: 'subSubCategory', label: 'Sub Sub Category', icon: FaLayerGroup }
    ];

    attributes.forEach(({ key, label, icon: Icon }) => {
      if (product[key] && product[key] !== "N/A" && product[key] !== "Uncategorized") {
        details.push(
          <div key={key} className="completed-product-detail-item">
            <Icon className="completed-detail-icon" />
            <div className="completed-detail-content">
              <span className="completed-detail-label">{label}</span>
              <span className="completed-detail-value">{product[key]}</span>
            </div>
          </div>
        );
      }
    });

    return details;
  };

  const renderOrderCard = (order) => {
    const assignedEmployee = order.assignedDeliveryEmployee
      ? employees.find(emp => emp._id === order.assignedDeliveryEmployee)
      : null;

    const deliveryDate = order.deliveredDate
      ? new Date(order.deliveredDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      : "Not specified";

    return (
      <div key={order._id} className="completed-order-card-item">
        <div className="completed-order-card-header">
          <div className="completed-order-id-section">
            <FaIdCard className="completed-order-id-icon" />
            <div>
              <h3 id="orderid">Order Id #{order._id}</h3>
              <div className="completed-order-date">
                <FaCalendarAlt className="completed-date-icon" />
                Completed on {deliveryDate}
              </div>
            </div>
          </div>
          <div className="completed-status-badges">
  {/* Completed Status */}
  <span className="completed-status-badge completed-status">
    <FaCheckCircle className="completed-badge-icon" />
    Completed
  </span>

  {/* 🚀 Express / 🕒 Free Delivery */}
  {order.isExpressDelivery ? (
    <span className="completed-status-badge completed-express">
      <FaShippingFast /> Express Delivery
    </span>
  ) : (
    <span className="completed-status-badge completed-free">
      <FaCalendarAlt /> Free Delivery
    </span>
  )}
</div>

        </div>

        <div className="completed-order-card-content">
          {/* Customer Summary */}
          <div className="completed-customer-summary">
            <div className="completed-customer-avatar">
              <FaUser className="completed-avatar-icon" />
            </div>
            <div className="completed-customer-info">
              <h4>{order.userDetails?.name || "N/A"}</h4>
              <p className="completed-customer-contact">
                <FaEnvelope className="completed-contact-icon" />
                {order.userDetails?.email || "N/A"}
              </p>
              <p className="completed-customer-contact">
                <FaPhone className="completed-contact-icon" />
                {order.userDetails?.regionCode || ""} {order.userDetails?.mobile || "N/A"}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="completed-order-summary-grid">
            <div className="completed-summary-item">
              <FaBox className="completed-summary-icon" />
              <div className="completed-summary-content">
                <span className="completed-summary-label">Products</span>
                <span className="completed-summary-value">{order.products?.length || 0} Items</span>
              </div>
            </div>
            <div className="completed-summary-item">
              <FaMoneyBillWave className="completed-summary-icon" />
              <div className="completed-summary-content">
                <span className="completed-summary-label">Total Amount</span>
                <span className="completed-summary-value">{order.totalAmount} {order.currency}</span>
              </div>
            </div>
            <div className="completed-summary-item">
              <FaCreditCard className="completed-summary-icon" />
              <div className="completed-summary-content">
                <span className="completed-summary-label">Payment</span>
                <span className="completed-summary-value">{order.paymentMethod}</span>
              </div>
            </div>
            {assignedEmployee && (
              <div className="completed-summary-item">
                <FaUserTie className="completed-summary-icon" />
                <div className="completed-summary-content">
                  <span className="completed-summary-label">Delivered By</span>
                  <span className="completed-summary-value">{assignedEmployee.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Quick Product Preview with Product IDs */}
          <div className="completed-products-preview">
            <h5>Products Delivered</h5>
            <div className="completed-preview-list">
              {order.products.slice(0, 3).map((p, idx) => (
                <div key={idx} className="completed-preview-item">
                  <div className="completed-preview-item-content">
                    <span className="completed-product-name">{p.name}</span>
                    {p.productId && (
                      <span className="completed-product-id-preview">ID: {p.productId}</span>
                    )}
                    <span className="completed-product-qty">Qty: {p.qty}</span>
                  </div>
                </div>
              ))}
              {order.products.length > 3 && (
                <div className="completed-more-items">
                  +{order.products.length - 3} more items
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="completed-order-card-actions">
          <button
            className="completed-view-details-btn"
            onClick={() => openOrderModal(order)}
          >
            <FaExpand className="completed-btn-icon" />
            View Full Details
          </button>
        </div>
      </div>
    );
  };

  const renderOrderModal = () => {
    if (!selectedOrder) return null;

    const assignedEmployee = selectedOrder.assignedDeliveryEmployee
      ? employees.find(emp => emp._id === selectedOrder.assignedDeliveryEmployee)
      : null;

    const deliveryDate = selectedOrder.deliveredDate
      ? new Date(selectedOrder.deliveredDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      : "Not specified";

    return (
      <div className={`completed-modal-overlay ${isModalOpen ? 'completed-active' : ''}`} onClick={closeOrderModal}>
        <div className="completed-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="completed-modal-header">
            <div className="completed-modal-title-section">
              <FaCheckCircle className="completed-modal-title-icon" />
              <div>
                <h2>Completed Order #{selectedOrder._id}</h2>
                <p className="completed-modal-subtitle">Delivery completed on {deliveryDate}</p>
              </div>
            </div>
            <button className="completed-close-modal" onClick={closeOrderModal}>
              <FaTimes />
            </button>
          </div>

          <div className="completed-modal-body">
            <div className="completed-modal-grid">
              {/* First Row: Customer Information & Payment Information */}
              <div className="completed-info-card completed-customer-card">
                <div className="completed-card-header">
                  <FaUser className="completed-card-icon" />
                  <h3>Customer Information</h3>
                </div>
                <div className="completed-card-content">
                  <div className="completed-customer-details">
                    <div className="completed-detail-item">
                      <FaUser className="completed-detail-icon" />
                      <div className="completed-detail-content">
                        <span className="completed-detail-label">Full Name</span>
                        <span className="completed-detail-value">{selectedOrder.userDetails?.name || "N/A"}</span>
                      </div>
                    </div>
                    <div className="completed-detail-item">
                      <FaEnvelope className="completed-detail-icon" />
                      <div className="completed-detail-content">
                        <span className="completed-detail-label">Email</span>
                        <span className="completed-detail-value completed-email">{selectedOrder.userDetails?.email || "N/A"}</span>
                      </div>
                    </div>
                    <div className="completed-detail-item">
                      <FaPhone className="completed-detail-icon" />
                      <div className="completed-detail-content">
                        <span className="completed-detail-label">Mobile</span>
                        <span className="completed-detail-value">
                          {selectedOrder.userDetails?.regionCode || ""} {selectedOrder.userDetails?.mobile || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="completed-detail-item completed-full-width">
                      <FaMapMarkerAlt className="completed-detail-icon" />
                      <div className="completed-detail-content">
                        <span className="completed-detail-label">Delivery Address</span>
                        <div className="completed-address-content">
                          <p>{selectedOrder.userDetails?.houseNumber || ""}, {selectedOrder.userDetails?.addressLine1 || ""}, {selectedOrder.userDetails?.addressLine2 || ""}, {selectedOrder.userDetails?.district || ""}</p>
                          <p>{selectedOrder.userDetails?.state || ""}, {selectedOrder.userDetails?.region || ""} - {selectedOrder.userDetails?.pincode || ""}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="completed-info-card completed-payment-card">
                <div className="completed-card-header">
                  <FaCreditCard className="completed-card-icon" />
                  <h3>Payment Information</h3>
                </div>
                <div className="completed-card-content">
                  <div className="completed-payment-grid">
                    <div className="completed-payment-item">
                      <div className="completed-payment-label">Payment Method</div>
                      <div className="completed-payment-method">{selectedOrder.paymentMethod}</div>
                    </div>
                    <div className="completed-payment-item">
                      <div className="completed-payment-label">Payment Status</div>
                      <div className="completed-payment-status completed-payment-completed">{selectedOrder.paymentStatus}</div>
                    </div>
                    <div className="completed-payment-item">
                      <div className="completed-payment-label">Total Amount</div>
                      <div className="completed-amount-display">
                        <FaMoneyBillWave className="completed-amount-icon" />
                        <span className="completed-amount">{selectedOrder.totalAmount}</span>
                        <span className="completed-currency">{selectedOrder.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Row: Delivery Information (full width) */}
              <div className="completed-info-card completed-delivery-card">
                <div className="completed-card-header">
                  <FaShippingFast className="completed-card-icon" />
                  <h3>Delivery Information</h3>
                </div>
                <div className="completed-card-content">
                  <div className="completed-delivery-details">
                    <div className="completed-status-item">
                      <FaCheckCircle className="completed-status-icon completed-status-completed" />
                      <div className="completed-status-content">
                        <span className="completed-status-label">Shipping Status</span>
                        <span className="completed-status-value">Completed</span>
                      </div>
                    </div>
                    <div className="completed-status-item">
                      <FaCheckCircle className="completed-status-icon completed-status-completed" />
                      <div className="completed-status-content">
                        <span className="completed-status-label">Delivery Status</span>
                        <span className="completed-status-value">Completed</span>
                      </div>
                    </div>
                    <div className="completed-delivery-date">
                      <FaCalendarAlt className="completed-date-icon" />
                      <span>Delivered on: {deliveryDate}</span>
                    </div>
                    {assignedEmployee && (
                      <div className="completed-delivery-employee">
                        <FaUserTie className="completed-employee-icon" />
                        <div className="completed-employee-details">
                          <span className="completed-employee-name">{assignedEmployee.deliveryEmployee?.employeeId}</span>
                          <span className="completed-employee-name">{assignedEmployee.name}</span>
                          <div className="completed-employee-contact">
                            {assignedEmployee.phone && (
                              <span className="completed-employee-phone">
                                <FaPhone className="completed-contact-icon" />
                                {assignedEmployee.phone}
                              </span>
                            )}
                            {assignedEmployee.email && (
                              <span className="completed-employee-email">
                                <FaEnvelope className="completed-contact-icon" />
                                {assignedEmployee.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Products Information with Product IDs */}
              <div className="completed-info-card completed-products-card">
                <div className="completed-card-header">
                  <FaBox className="completed-card-icon" />
                  <h3>Products Delivered ({selectedOrder.products?.length || 0})</h3>
                </div>
                <div className="completed-card-content" id="completed-card-content">
                  <div className="completed-products-list">
                    {selectedOrder.products.map((p, idx) => (
                      <div key={idx} className="completed-product-item">
                        <div className="completed-product-header">
                          <div className="completed-product-basic-info">
                            <div className="completed-product-title-section">
                              <h4>{p.name}</h4>
                              {p.productId && (
                                <div className="completed-product-id-display">
                                  <FaBarcode className="completed-id-icon" />
                                  <span className="completed-product-id-text">ID: {p.productId}</span>
                                </div>
                              )}
                            </div>
                            <div className="completed-product-meta">
                              <span className="completed-product-quantity">
                                <FaBox className="completed-meta-icon" />
                                Qty: {p.qty}
                              </span>
                              <span className="completed-product-category">
                                <FaTag className="completed-meta-icon" />
                                {p.category}
                              </span>
                              {p.subCategory && (
                                <span className="completed-product-subcategory">
                                  <FaLayerGroup className="completed-meta-icon" />
                                  {p.subCategory}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="completed-product-pricing">
                            <div className="completed-price-breakdown">
                              {p.originalPrice && p.originalPrice !== p.discountedPrice && (
                                <div className="completed-original-price">
                                  {p.originalPrice} {selectedOrder.currency}
                                </div>
                              )}
                              <div className="completed-discounted-price">
                                {p.discountedPrice} {selectedOrder.currency}
                              </div>
                              {p.discount > 0 && (
                                <span className="completed-discount-badge">{p.discount}% OFF</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Product Details with structured layout */}
                        <div className="completed-product-details">
                          <div className="completed-product-details-grid">
                            {renderProductDetails(p, selectedOrder.currency)}
                          </div>

                          {/* ✅ Dynamic Product Attribute Section */}
                          <div className="ship-product-details-expanded">
                            <h5 className="ship-expanded-title">
                              <FaInfoCircle className="ship-expanded-icon" /> View Full Product Details
                            </h5>

                            <div className="ship-product-detail-grid">
                              {(() => {
                                // ✅ allowed keys based on your Order schema product fields
                                const allowedKeys = [
                                  "selectedSize",
                                  "sizeInches",
                                  "size",
                                  "color",
                                  "material",
                                  "fit",
                                  "brand",
                                  "ram",
                                  "storage",
                                  "product_type",
                                  "processor",
                                  "displaySize",
                                  "battery",
                                  "camera",
                                  "screenSize",
                                  "inchs",
                                  "skinType",
                                  "hairType",
                                  "fragranceType",
                                  "language",
                                  "author",
                                  "genre",
                                  "format",
                                  "packSize",
                                  "organic",
                                  "model",
                                  "power",
                                  "capacity",
                                  "weight",
                                  "warranty"
                                ];

                                return Object.entries(p)
                                  .filter(([key, value]) => {
                                    // 🔥 CORE FIX — hide "size" if selectedSize exists
                                    if (key === "size" && p.selectedSize) return false;
                                    if (!allowedKeys.includes(key)) return false;
                                    if (value === null || value === undefined) return false;
                                    if (Array.isArray(value) && value.length === 0) return false;
                                    if (typeof value === "string" && value.trim() === "") return false;
                                    return true;
                                  })
                                  .map(([key, value]) => {
                                    // format key to readable label
                                    const formattedKey = key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/_/g, " ")
                                      .replace(/^./, (str) => str.toUpperCase());

                                    // handle arrays & objects
                                    let displayValue;
                                    if (Array.isArray(value)) {
                                      displayValue = value.join(", ");
                                    } else if (typeof value === "object") {
                                      displayValue = JSON.stringify(value);
                                    } else {
                                      displayValue = String(value);
                                    }

                                    return (
                                      <div key={key} className="ship-detail-item">
                                        <span className="ship-detail-label">{formattedKey}:</span>
                                        <span className="ship-detail-value" style={{ marginRight: "20px" }}>
                                          {displayValue}
                                        </span>
                                      </div>
                                    );
                                  });
                              })()}
                            </div>

                            {/* Out of Stock Notice */}
                            {p.stock !== undefined && p.stock <= 0 && (
                              <div className="ship-out-of-stock-notice">
                                <FaInfoCircle />
                                <span>Out of Stock</span>
                              </div>
                            )}
                          </div>
                        </div>


                        {/* Warehouse Allocations */}
                        {p.warehouseAllocations && p.warehouseAllocations.length > 0 && (
                          <div className="completed-allocations-section">
                            <h5>
                              <FaWarehouse className="completed-section-icon" />
                              Warehouse Allocations
                            </h5>
                            <div className="completed-allocations-list">
                              {p.warehouseAllocations
                                .filter(alloc => alloc.warehouseId?.toString() === warehouseId && alloc.warehouseType === "Main Warehouse")
                                .map((alloc, allocIdx) => (
                                  <div
                                    key={allocIdx}
                                    className="completed-allocation-item completed-main-warehouse"
                                  >
                                    <FaWarehouse className="completed-allocation-icon" />
                                    <div className="completed-allocation-details">
                                      <span className="completed-allocation-type">{alloc.warehouseType}</span>
                                      <span className="completed-allocation-name">{alloc.name}</span>
                                      <span className="completed-allocation-address">
                                        {alloc.city && `${alloc.city}, `}{alloc.state}
                                      </span>
                                    </div>
                                    <div className="completed-allocation-meta">
                                      <span className="completed-allocation-qty">Qty: {alloc.qty}</span>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="completed-modal-actions">
            <button className="completed-close-btn" onClick={closeOrderModal}>
              <FaCompress className="completed-btn-icon" />
              Close Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="completed-orders-container">
      <div className="completed-tab-header">
        <div className="completed-header-content">
          <FaCheckCircle className="completed-header-icon" />
          <div>
            <h1>Completed Orders</h1>
            <p>Successfully delivered orders from Main Warehouse</p>
          </div>
        </div>
        <div className="completed-header-stats">
          <button
            className="completed-export-btn"
            onClick={handleExportCompletedOrders}
            disabled={isExporting || mainWarehouseCompletedOrders.length === 0}
          >
            {isExporting ? (
              <FaSpinner className="completed-export-icon completed-export-spinning" />
            ) : (
              <FaFileExcel className="completed-export-icon" />
            )}
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </button>
          <div className="completed-stat-card">
            <span className="completed-stat-number">{filteredOrders.length}</span>
            <span className="completed-stat-label">Completed Orders</span>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="completed-search-section">
        <div className="completed-search-container">
          <FaSearch className="completed-search-icon" />
          <input
            type="text"
            placeholder="Search orders by ID, customer name, email, phone, or product ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="completed-search-input"
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="completed-orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="completed-empty-state">
            <FaBox className="completed-empty-icon" />
            <h3>No Completed Orders Found</h3>
            <p>
              {searchTerm ?
                "No orders match your search criteria. Try different keywords." :
                "Completed delivery orders from Main Warehouse will appear here."
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => renderOrderCard(order))
        )}
      </div>

      {/* Order Details Modal */}
      {renderOrderModal()}
    </div>
  );
};

export default CompletedOrdersTab;
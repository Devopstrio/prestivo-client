import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaBox,
  FaTag,
  FaWarehouse,
  FaUserTie,
  FaCheckCircle,
  FaShippingFast,
  FaIdCard,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaSpinner,
  FaSearch,
  FaInfoCircle,
  FaWeight,
  FaRuler,
  FaPalette,
  FaLayerGroup,
  FaBarcode,
  FaEye,
  FaEyeSlash,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaUsers,
  FaFileExcel,
  FaClock
} from "react-icons/fa";
import "../styles/DeliveryTab.css";
import "../styles/LoadingAnimation.css";
import { exportDeliveryOrdersToExcel } from "../templates/DeliveryTabExcel";

const DeliveryTab = ({
  deliveredOrders,
  warehouseId,
  user,
  employees,
  onRefresh
}) => {
  const [warehouseName, setWarehouseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigningEmployee, setAssigningEmployee] = useState(null);
  const [searchTerms, setSearchTerms] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [emailStatus, setEmailStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const toggleDropdown = (orderId) => {
    setDropdownOpen(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
    // Clear search when opening dropdown
    if (!dropdownOpen[orderId]) {
      setSearchTerms(prev => ({ ...prev, [orderId]: "" }));
    }
  };

  const closeAllDropdowns = () => {
    setDropdownOpen({});
  };

  useEffect(() => {
    const nameFromSession = sessionStorage.getItem("warehouseName");
    if (nameFromSession) setWarehouseName(nameFromSession);
  }, []);

  // Export function for delivery orders
  // Export function for delivery orders
  const handleExportDeliveryOrders = () => {
    console.log('Employees array passed to export:', employees);
    console.log('Looking for employee with ID:', mainWarehouseDeliveredOrders[0]?.assignedDeliveryEmployee);

    // Check if we can find the employee in the array
    const testEmployee = employees.find(emp => emp._id === mainWarehouseDeliveredOrders[0]?.assignedDeliveryEmployee);
    console.log('Test employee lookup result:', testEmployee);

    exportDeliveryOrdersToExcel(mainWarehouseDeliveredOrders, warehouseName, setIsExporting, employees);
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

  const handleMarkAsDelivered = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/api/warehouse-management/delivery/complete/${orderId}/${warehouseId}`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      // Show appropriate message based on email status
      if (response.data.emailSent) {
        setEmailStatus(prev => ({
          ...prev,
          [orderId]: { success: true, message: "Order marked as delivered and email sent to user!" }
        }));
        toast.success("Order marked as delivered and email sent to user!");
      } else {
        setEmailStatus(prev => ({
          ...prev,
          [orderId]: {
            success: false,
            message: "Order marked as delivered but email failed to send."
          }
        }));
        toast.error("Order marked as delivered but email failed to send.");
      }

      onRefresh();
    } catch (err) {
      console.error("Delivery Complete Error:", err);
      setEmailStatus(prev => ({
        ...prev,
        [orderId]: { success: false, message: "Failed to mark as delivered. Please try again." }
      }));
      toast.error("Failed to mark as delivered. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEmployee = async (orderId, employeeId) => {
    try {
      setAssigningEmployee(orderId);
      await axios.put(
        `${API_BASE_URL}/api/warehouse-management/orders/${orderId}/assign-delivery-employee`,
        {
          deliveryEmployeeId: employeeId,
          warehouseId: warehouseId
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      toast.success("Delivery employee assigned successfully!");
      onRefresh();
      // Close dropdown after assignment
      closeAllDropdowns();
    } catch (err) {
      console.error("Assign Employee Error:", err);
      toast.error("Failed to assign delivery employee. Please try again.");
    } finally {
      setAssigningEmployee(null);
      setSearchTerms(prev => ({ ...prev, [orderId]: "" }));
    }
  };

  // Filter delivered orders to only show main warehouse orders
  const mainWarehouseDeliveredOrders = deliveredOrders.filter(order =>
    order.products?.some(product =>
      product.warehouseAllocations?.some(alloc =>
        alloc.warehouseId?.toString() === warehouseId &&
        alloc.warehouseType === "Main Warehouse"
      )
    )
  );

  const handleSearchChange = (orderId, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [orderId]: value
    }));
  };

  // Get filtered employees for a specific order
  const getFilteredEmployees = (orderId) => {
    const searchTerm = searchTerms[orderId] || "";
    if (!searchTerm) return employees;

    return employees.filter(employee =>
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone?.includes(searchTerm)
    );
  };

  const renderProductDetails = (product, currency) => {
    const details = [];

    // Basic product info
    details.push(
      <div key="quantity" className="delivery-detail-item">
        <FaBox className="delivery-detail-icon" />
        <span><strong>Quantity:</strong> {product.qty}</span>
      </div>
    );

    // Pricing information
    details.push(
      <div key="pricing" className="delivery-detail-item">
        <FaMoneyBillWave className="delivery-detail-icon" />
        <span><strong>Price:</strong> {product.discountedPrice} {currency}</span>
        {product.originalPrice && product.originalPrice !== product.discountedPrice && (
          <span className="delivery-original-price">(Was: {product.originalPrice} {currency})</span>
        )}
      </div>
    );

    // Product attributes from schema
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
          <div key={key} className="delivery-detail-item">
            <Icon className="delivery-detail-icon" />
            <span><strong>{label}:</strong> {product[key]}</span>
          </div>
        );
      }
    });

    return details;
  };

  const renderOrderSummary = (order) => {
    const assignedEmployee = order.assignedDeliveryEmployee
      ? employees.find(emp => emp._id === order.assignedDeliveryEmployee)
      : null;

    return (
      <div className="delivery-order-summary">
        <div className="delivery-summary-grid">
          <div className="delivery-summary-item">
            <FaUser className="delivery-summary-icon" />
            <div className="delivery-summary-content">
              <span className="delivery-summary-label">Customer</span>
              <span className="delivery-summary-value">{order.userDetails?.name || "N/A"}</span>
            </div>
          </div>

          <div className="delivery-summary-item">
            <FaBox className="delivery-summary-icon" />
            <div className="delivery-summary-content">
              <span className="delivery-summary-label">Products</span>
              <span className="delivery-summary-value">{order.products?.length || 0} items</span>
            </div>
          </div>

          <div className="delivery-summary-item">
            <FaUserTie className="delivery-summary-icon" />
            <div className="delivery-summary-content">
              <span className="delivery-summary-label">Delivery Employee</span>
              <span className={`delivery-summary-value ${assignedEmployee ? 'delivery-assigned' : 'delivery-not-assigned'}`}>
                {assignedEmployee ? assignedEmployee.name : "Not Assigned"}
                {assignedEmployee ? assignedEmployee.employeeId : "Not Assigned"}
              </span>
            </div>
          </div>

          <div className="delivery-summary-item">
            <FaCreditCard className="delivery-summary-icon" />
            <div className="delivery-summary-content">
              <span className="delivery-summary-label">Payment</span>
              <span className="delivery-summary-value">{order.paymentMethod} • {order.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmployeeDropdown = (order) => {
    const isOpen = dropdownOpen[order._id];
    const filteredEmployees = getFilteredEmployees(order._id);
    const searchTerm = searchTerms[order._id] || "";

    return (
      <div className="delivery-custom-dropdown-container">
        <button
          className="delivery-dropdown-trigger"
          onClick={() => toggleDropdown(order._id)}
          disabled={assigningEmployee === order._id}
        >
          <FaUserTie className="delivery-trigger-icon" />
          <span>Select Delivery Employee</span>
          <FaChevronDown className={`delivery-dropdown-chevron ${isOpen ? 'delivery-open' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="delivery-dropdown-backdrop" onClick={closeAllDropdowns}></div>
            <div className="delivery-dropdown-modal">
              <div className="delivery-modal-header">
                <div className="delivery-modal-title">
                  <FaUsers className="delivery-title-icon" />
                  <h3>Assign Delivery Employee</h3>
                </div>
                <button
                  className="delivery-modal-close"
                  onClick={closeAllDropdowns}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="delivery-modal-content">
                {/* Search Bar */}
                <div className="delivery-dropdown-search">
                  <FaSearch className="delivery-search-icon" />
                  <input
                    type="text"
                    placeholder="Search employees by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(order._id, e.target.value)}
                    className="delivery-search-input"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      className="delivery-clear-search"
                      onClick={() => handleSearchChange(order._id, "")}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {/* Employee List */}
                <div className="delivery-employee-list">
                  {filteredEmployees.length === 0 ? (
                    <div className="delivery-no-employees">
                      <FaUsers className="delivery-no-employees-icon" />
                      <p>{searchTerm ? "No employees found matching your search" : "No delivery employees available"}</p>
                      {searchTerm && (
                        <button
                          className="delivery-clear-search-btn"
                          onClick={() => handleSearchChange(order._id, "")}
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredEmployees.map((employee) => {
                      const isAssigned = order.assignedDeliveryEmployee === employee._id;

                      return (
                        <div
                          key={employee._id}
                          className={`delivery-employee-option ${isAssigned ? "disabled-employee" : ""}`}
                          onClick={() => !isAssigned && handleAssignEmployee(order._id, employee._id)}
                          style={{
                            opacity: isAssigned ? 0.5 : 1,
                            cursor: isAssigned ? "not-allowed" : "pointer",
                            pointerEvents: isAssigned ? "none" : "auto",
                          }}
                        >
                          <div className="delivery-employee-option-avatar">
                            <FaUserTie />
                          </div>

                          <div className="delivery-employee-option-info">
                            <span className="delivery-employee-option-name">{employee.name}</span>

                            {/* email & phone */}
                            <div className="delivery-employee-option-details">
                              {employee.phone && (
                                <span className="delivery-employee-option-phone">
                                  <FaPhone className="delivery-detail-icon" />
                                  {employee.phone}
                                </span>
                              )}
                              {employee.email && (
                                <span className="delivery-employee-option-email">
                                  <FaEnvelope className="delivery-detail-icon" />
                                  {employee.email}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* ⭐ STATUS BADGE */}
                          {isAssigned && (
                            <span
                              style={{
                                marginLeft: "auto",
                                background: "#4CAF50",
                                color: "white",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              Assigned
                            </span>
                          )}

                          {/* Spinner if assigning */}
                          {assigningEmployee === order._id && !isAssigned && (
                            <FaSpinner className="delivery-option-spinner" />
                          )}
                        </div>
                      );
                    })

                  )}
                </div>

                {/* Dropdown Footer */}
                <div className="delivery-dropdown-footer">
                  <div className="delivery-employee-count">
                    <span className="delivery-count-number">{filteredEmployees.length}</span>
                    <span className="delivery-count-label">
                      {filteredEmployees.length === 1 ? 'employee' : 'employees'} found
                      {searchTerm && ` for "${searchTerm}"`}
                    </span>
                  </div>
                  <button
                    className="delivery-close-dropdown"
                    onClick={closeAllDropdowns}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderOrderDetails = (order) => {
    const assignedEmployee = order.assignedDeliveryEmployee
      ? employees.find(emp => emp._id === order.assignedDeliveryEmployee)
      : null;

    return (
      <div className="delivery-order-details">
        {/* Main Grid Layout */}
        <div className="delivery-order-grid">
          {/* Customer Information */}
          <div className="delivery-grid-section delivery-customer-section">
            <div className="delivery-section-header">
              <FaUser className="delivery-section-icon" />
              <h4>Customer Information</h4>
            </div>
            <div className="delivery-section-content">
              <div className="delivery-info-grid">
                <div className="delivery-info-item">
                  <span className="delivery-info-label">Name</span>
                  <span className="delivery-info-value">{order.userDetails?.name || "N/A"}</span>
                </div>
                <div className="delivery-info-item">
                  <span className="delivery-info-label">Email</span>
                  <span className="delivery-info-value delivery-email">{order.userDetails?.email || "N/A"}</span>
                </div>
                <div className="delivery-info-item">
                  <span className="delivery-info-label">Mobile</span>
                  <span className="delivery-info-value">
                    {order.userDetails?.regionCode || ""} {order.userDetails?.mobile || "N/A"}
                  </span>
                </div>
                <div className="delivery-info-item delivery-full-width">
                  <span className="delivery-info-label">Delivery Address</span>
                  <div className="delivery-address-content">
                    <p>{order.userDetails?.houseNumber || ""}, {order.userDetails?.addressLine1 || ""}, {order.userDetails?.addressLine2 || ""}, {order.userDetails?.district || ""}</p>
                    <p>{order.userDetails?.state || ""}, {order.userDetails?.region || ""} - {order.userDetails?.pincode || ""}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="delivery-grid-section delivery-payment-section">
            <div className="delivery-section-header">
              <FaCreditCard className="delivery-section-icon" />
              <h4>Payment Information</h4>
            </div>
            <div className="delivery-section-content">
              <div className="delivery-payment-grid">
                <div className="delivery-payment-item">
                  <span className="delivery-payment-label">Method</span>
                  <span className="delivery-payment-method">{order.paymentMethod}</span>
                </div>
                <div className="delivery-payment-item">
                  <span className="delivery-payment-label">Status</span>
                  <span className={`delivery-payment-status ${order.paymentStatus?.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="delivery-payment-item delivery-full-width">
                  <span className="delivery-payment-label">Total Amount</span>
                  <span className="delivery-amount-value">
                    {order.totalAmount} {order.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Information */}
          <div className="delivery-grid-section delivery-products-section">
            <div className="delivery-section-header">
              <FaBox className="delivery-section-icon" />
              <h4>Products ({order.products?.length || 0})</h4>
            </div>
            <div className="delivery-section-content">
              <div className="delivery-products-grid">
                {order.products?.map((product, index) => (
                  <div key={index} className="delivery-product-card">
                    <div className="delivery-product-header">
                      <div className="delivery-product-basic">
                        <h5 className="delivery-product-name">{product.name}</h5>
                        <div className="delivery-product-meta">
                          <span className="delivery-product-id">Product ID: {product.productId || `ITEM-${index + 1}`}</span>
                          {product.category && (
                            <span className="delivery-product-category-tag">{product.category}</span>
                          )}
                        </div>
                      </div>
                      <div className="delivery-product-pricing">
                        <div className="delivery-price-main">{product.discountedPrice} {order.currency}</div>
                        {product.discount > 0 && (
                          <div className="delivery-discount-badge">
                            {product.discount}% OFF
                            {product.originalPrice && (
                              <span className="delivery-original-price-line">{product.originalPrice} {order.currency}</span>
                            )}
                          </div>
                        )}
                        <div className="delivery-product-total">
                          Total: {(product.discountedPrice * product.qty).toFixed(2)} {order.currency}
                        </div>
                      </div>
                    </div>

                    {/* Complete Product Details */}
                    {/* Complete Product Details */}
                    <div className="delivery-product-details-container">
                      <div className="delivery-product-details-grid">
                        {renderProductDetails(product, order.currency)}
                      </div>

                      {/* ✅ Dynamic Product Attributes Based on Schema */}
                      <div className="ship-product-details-expanded">
                        <h5 className="ship-expanded-title">
                          <FaInfoCircle className="ship-expanded-icon" /> View Full Product Details
                        </h5>

                        <div className="ship-product-detail-grid">
                          {(() => {
                            // ✅ Allowed keys based on your orderSchema product subdocument
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

                            return Object.entries(product)
                              .filter(([key, value]) => {
                                // 🔥 CORE FIX — hide "size" if selectedSize exists
                                if (key === "size" && product.selectedSize) return false;
                                if (!allowedKeys.includes(key)) return false;
                                if (value === null || value === undefined) return false;
                                if (Array.isArray(value) && value.length === 0) return false;
                                if (typeof value === "string" && value.trim() === "") return false;
                                return true;
                              })
                              .map(([key, value]) => {
                                const formattedKey = key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/_/g, " ")
                                  .replace(/^./, (str) => str.toUpperCase());

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
                        {product.stock !== undefined && product.stock <= 0 && (
                          <div className="ship-out-of-stock-notice">
                            <FaInfoCircle />
                            <span>Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Warehouse Allocations */}
                    {product.warehouseAllocations && product.warehouseAllocations.length > 0 && (
                      <div className="delivery-allocations-section">
                        <h6 className="delivery-allocations-title">
                          <FaWarehouse className="delivery-title-icon" />
                          Warehouse Allocations
                        </h6>
                        <div className="delivery-allocations-grid">
                          {product.warehouseAllocations.map((alloc, allocIdx) => (
                            <div
                              key={allocIdx}
                              className={`delivery-allocation-card ${alloc.warehouseType.toLowerCase().replace(' ', '-')}`}
                            >
                              <div className="delivery-allocation-header">
                                <FaWarehouse className="delivery-allocation-icon" />
                                <div className="delivery-allocation-info">
                                  <span className="delivery-allocation-type">{alloc.warehouseType}</span>
                                  <span className="delivery-allocation-name">{alloc.name}</span>
                                  <span className="delivery-allocation-address">
                                    {alloc.street && `${alloc.street}, `}
                                    {alloc.city && `${alloc.city}, `}
                                    {alloc.district && `${alloc.district}, `}
                                    {alloc.postalCode}
                                  </span>
                                </div>
                              </div>
                              <div className="delivery-allocation-meta">
                                <span className="delivery-allocation-qty">Qty: {alloc.qty}</span>
                                {alloc.warehouseType !== "Main Warehouse" && (
                                  <span className={`delivery-allocation-status ${alloc.notificationStatus?.toLowerCase()}`}>
                                    {alloc.notificationStatus || "Allocated"}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Assignment */}
          <div className="delivery-grid-section delivery-assignment-section">
            <div className="delivery-section-header">
              <FaUserTie className="delivery-section-icon" />
              <h4>Delivery Assignment</h4>
            </div>
            <div className="delivery-section-content">
              <div className="delivery-assignment-content">
                {assignedEmployee ? (
                  <div className="delivery-assigned-employee-card">
                    <div className="delivery-employee-avatar">
                      <FaUserTie />
                    </div>
                    <div className="delivery-employee-info">
                      <span className="delivery-employee-name">
                        {assignedEmployee?.deliveryEmployee?.employeeId || "N/A"}
                      </span>

                      <span className="delivery-employee-name">{assignedEmployee.name}</span>
                      <div className="delivery-employee-contacts">
                        {assignedEmployee.phone && (
                          <span className="delivery-employee-phone">{assignedEmployee.phone}</span>
                        )}
                        {assignedEmployee.email && (
                          <span className="delivery-employee-email">{assignedEmployee.email}</span>
                        )}
                      </div>
                    </div>
                    <span className="delivery-assigned-badge">Assigned</span>
                  </div>
                ) : (
                  <div className="delivery-not-assigned-card">
                    <FaUserTie className="delivery-warning-icon" />
                    <span>No delivery employee assigned</span>
                  </div>
                )}

                <div className="delivery-employee-assignment-section">
                  <label className="delivery-assignment-label">Assign Delivery Employee</label>
                  {renderEmployeeDropdown(order)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderCard = (order) => {
    const isMainWarehouseOrder = order.products?.some(product =>
      product.warehouseAllocations?.some(alloc =>
        alloc.warehouseId?.toString() === warehouseId &&
        alloc.warehouseType === "Main Warehouse"
      )
    );

    if (!isMainWarehouseOrder) {
      return null;
    }

    const isExpanded = expandedOrders[order._id];
    const currentEmailStatus = emailStatus[order._id];

    return (
      <div key={order._id} className="delivery-order-card">
        {/* Order Header */}
        <div className="delivery-order-card-header">
          <div className="delivery-order-id-section">
            <div className="delivery-order-info">
              <FaIdCard className="delivery-order-id-icon" />
              <h3 className="orderid" id="orderid">OrderId: #{order._id}</h3>
              <span className="delivery-order-date" style={{ marginLeft: "2rem" }}>
                {order.deliveryDate && (
                  <span className="delivery-order-date" style={{ marginLeft: "2rem" }}>
                    <FaCalendarAlt className="delivery-date-icon" />
                    Delivery Date: {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="delivery-header-right">
            <div className="delivery-status-badges">
              {/* Delivery Ready */}
              <span className="delivery-status-badge delivery-delivered">
                Ready for Delivery
              </span>

              {/* 🚀 Express / 🕒 Free Delivery */}
              {order.isExpressDelivery ? (
                <span className="delivery-status-badge delivery-express">
                  <FaShippingFast /> Express Delivery
                </span>
              ) : (
                <span className="delivery-status-badge delivery-free">
                  <FaClock /> Free Delivery
                </span>
              )}
            </div>

            <div className="delivery-total-amount">
              {order.totalAmount} {order.currency}
            </div>
          </div>

        </div>

        {/* Email Status Alert */}
        {currentEmailStatus && (
          <div className={`delivery-email-status-alert ${currentEmailStatus.success ? 'delivery-success' : 'delivery-error'}`}>
            <FaEnvelope className="delivery-alert-icon" />
            <span>{currentEmailStatus.message}</span>
          </div>
        )}

        {/* Order Summary (Always Visible) */}
        {renderOrderSummary(order)}

        {/* Expand/Collapse Button */}
        <div className="delivery-expand-section">
          <button
            className="delivery-expand-btn"
            onClick={() => toggleOrderDetails(order._id)}
          >
            {isExpanded ? (
              <>
                <FaEyeSlash className="delivery-btn-icon" />
                Hide Details
                <FaChevronUp className="delivery-chevron-icon" />
              </>
            ) : (
              <>
                <FaEye className="delivery-btn-icon" />
                View Details
                <FaChevronDown className="delivery-chevron-icon" />
              </>
            )}
          </button>
        </div>

        {/* Detailed Information (Conditional) */}
        {isExpanded && renderOrderDetails(order)}

        {/* Actions */}
        {/* <div className="delivery-order-card-actions">
          <button
            className="delivery-deliver-btn delivery-primary-action"
            onClick={() => handleMarkAsDelivered(order._id)}
            disabled={loading || !order.assignedDeliveryEmployee}
          >
            <FaCheckCircle className="delivery-btn-icon" />
            {loading ? "Processing..." : "Mark as Delivered"}
          </button>
          {!order.assignedDeliveryEmployee && (
            <div className="delivery-assignment-warning">
              Please assign a delivery employee first
            </div>
          )}
        </div> */}
      </div>
    );
  };

  return (
    <div className="delivery-tab">
      <div className="delivery-header">
        <div className="delivery-header-content">
          <FaShippingFast className="delivery-header-icon" />
          <div className="delivery-header-text">
            <h2>Delivery Management</h2>
            <p>Manage orders ready for delivery from {warehouseName} warehouse</p>
          </div>
        </div>
        <div className="delivery-header-stats">
          <button
            className="delivery-export-btn"
            onClick={handleExportDeliveryOrders}
            disabled={isExporting || mainWarehouseDeliveredOrders.length === 0}
          >
            {isExporting ? (
              <FaSpinner className="delivery-export-icon delivery-export-spinning" />
            ) : (
              <FaFileExcel className="delivery-export-icon" />
            )}
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </button>
          <div className="delivery-stat-card1">
            <span className="delivery-stat-number">{mainWarehouseDeliveredOrders.length}</span>
            <span className="delivery-stat-label" style={{ color: "white" }}>Orders Ready</span>
          </div>
        </div>
      </div>

      <div className="delivery-content">
        {mainWarehouseDeliveredOrders.length === 0 ? (
          <div className="delivery-empty-state">
            <FaBox className="delivery-empty-icon" />
            <h3>No Orders for Delivery</h3>
            <p style={{ textAlign: "center" }}>There are no shipped orders ready for delivery from the main warehouse.</p>
          </div>
        ) : (
          <div className="delivery-orders-container">
            {mainWarehouseDeliveredOrders.map((order) => renderOrderCard(order))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryTab;
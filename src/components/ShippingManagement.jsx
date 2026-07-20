import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CurrencyContext } from "../context/CurrencyContext";
import axios from "axios";
import API_BASE_URL from "../config";
import {
  FaSearch, FaFilter, FaCheckCircle, FaTruck, FaBoxOpen,
  FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaInfoCircle,
  FaShippingFast, FaClock, FaBox, FaImage, FaBars, FaTimesCircle,
  FaClipboardList, FaShoppingCart, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaUser, FaSignOutAlt, FaFileExport, FaShoppingBasket, FaFileExcel, FaSpinner
} from "react-icons/fa";
import "../styles/ShippingManagement.css";
import "../styles/LoadingAnimation.css";
import PurchaseProducts from "../pages/PurchaseProducts";
import { exportShippingOrdersToExcel } from "../templates/ShippingManagementExcel";

const getImageUrl = (img) => {
  if (!img) return "/placeholder.png";

  if (typeof img === "string") {
    if (img.startsWith("http") || img.startsWith("https")) return img;
    if (img.startsWith("data:")) return img;
    return `${API_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  }

  return "/placeholder.png";
};

const ShippingManagement = () => {
  const { logout } = useContext(AuthContext);
  const { currency: currentCurrency, changeCurrency, rates } = useContext(CurrencyContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("incomplete");
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("incomplete");
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  // Currency symbols
  const currencySymbols = {
    GBP: "£",
    INR: "₹",
    USD: "$",
    EUR: "€",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
  };

  // Price conversion function
  const convertPrice = (price) => {
    if (!price || isNaN(price)) return "0.00";

    // Convert from stored GBP to selected currency
    const rate = rates[currentCurrency] || 1;
    const converted = Number(price) * rate;
    return converted.toFixed(2);
  };

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);


  // ✅ Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/orders/shipping/all`
        );
        const validOrders = (response.data || []).filter(
          order => !order.cancellationStatus || order.cancellationStatus === "none"
        );

        setOrders(validOrders);
      } catch (error) {
        console.error("Error fetching shipping orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Mark order as shipped
  const handleMarkShipped = async (orderId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/orders/shipping/complete/${orderId}`
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
              ...order,
              shippingCompleted: true,
              orderStatus: { ...order.orderStatus, shipping: true },
            }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order shipping status:", error);
    }
  };

  // ✅ Export orders data to Excel
  const handleExportOrders = () => {
    const ordersToExport = activeSection === 'incomplete'
      ? orders.filter(order => !order.shippingCompleted)
      : orders.filter(order => order.shippingCompleted);

    const exportType = activeSection === 'incomplete' ? 'Incomplete' : 'Completed';

    exportShippingOrdersToExcel(ordersToExport, exportType, setIsExporting);
  };

  const toggleProductDetails = (orderId, productIndex) => {
    const key = `${orderId}-${productIndex}`;
    setExpandedProducts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Close sidebar when clicking on overlay
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Stats
  const totalOrders = orders.length;
  const shippedOrders = orders.filter(order => order.shippingCompleted).length;
  const pendingOrders = orders.filter(order => !order.shippingCompleted).length;

  const activeOrders = orders.filter(order => !order.shippingCompleted);
  const completedOrders = orders.filter(order => order.shippingCompleted);

  const filterOrders = (ordersList) => {
    return ordersList.filter(order => {
      if (filterStatus === "completed" && !order.shippingCompleted) return false;
      if (filterStatus === "incomplete" && order.shippingCompleted) return false;
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  const filteredActiveOrders = filterOrders(activeOrders);
  const filteredCompletedOrders = filterOrders(completedOrders);

  const renderSize = (product) => {
    const category = product.category?.toLowerCase() || "";
    if (category.includes("home")) {
      const inchesValue = product.sizeInches || product.inches || product.dimensions;
      return inchesValue ? `${inchesValue} inches` : "N/A";
    }
    return product.selectedSize || product.size || "N/A";
  };

  const renderProductImage = (product) => {
    const src = getImageUrl(product.image);
    return (
      <img
        src={src}
        alt={product.name || "Product Image"}
        className="smc-product-image"
      />
    );
  };

  if (loading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading...</h3>
          <p>Please Wait while orders are loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smc-container">
      {/* Mobile Header */}
      <div className="smc-mobile-header">
        <button
          className="smc-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FaTimesCircle /> : <FaBars />}
        </button>
        <h2>Shipping Management</h2>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && <div className="smc-overlay active" onClick={closeSidebar}></div>}

      <div className="smc-content-wrapper">
        {/* Sidebar */}
        <div className={`smc-sidebar ${sidebarOpen ? 'active' : ''}`}>
          <div className="smc-sidebar-header">
            <button
              className="smc-sidebar-close" id="toogleclose"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimesCircle />
            </button>
            <h3>Shipping Dashboard</h3>
          </div>

          <div className="smc-sidebar-stats">
            <div className="smc-stat-item">
              <div className="smc-stat-icon smc-stat-icon-total"><FaBox /></div>
              <div className="smc-stat-info">
                <span className="smc-stat-number">{totalOrders}</span>
                <span className="smc-stat-label">Total Orders</span>
              </div>
            </div>
            <div className="smc-stat-item">
              <div className="smc-stat-icon smc-stat-icon-completed"><FaCheckCircle /></div>
              <div className="smc-stat-info">
                <span className="smc-stat-number">{shippedOrders}</span>
                <span className="smc-stat-label">Completed</span>
              </div>
            </div>
            <div className="smc-stat-item">
              <div className="smc-stat-icon smc-stat-icon-pending"><FaClock /></div>
              <div className="smc-stat-info">
                <span className="smc-stat-number">{pendingOrders}</span>
                <span className="smc-stat-label">Pending</span>
              </div>
            </div>
          </div>

          <nav className="smc-sidebar-nav">
            <button
              className={`smc-nav-item ${activeSection === 'incomplete' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('incomplete');
                setFilterStatus('incomplete');
                setSidebarOpen(false);
              }}
            >
              <FaTruck /><span>Incomplete Orders</span>
              <span className="smc-nav-badge">{pendingOrders}</span>
            </button>
            <button
              className={`smc-nav-item ${activeSection === 'completed' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('completed');
                setFilterStatus('completed');
                setSidebarOpen(false);
              }}
            >
              <FaCheckCircle /><span>Completed Orders</span>
              <span className="smc-nav-badge">{shippedOrders}</span>
            </button>

            {/* Purchase Products Tab Button */}
            <button
              className={`smc-nav-item ${activeSection === 'purchaseProducts' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('purchaseProducts');
                setSidebarOpen(false);
              }}
            >
              <FaShoppingBasket /><span>Products</span>
            </button>

            <button
              className="smc-nav-item"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <FaSignOutAlt /><span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="smc-main-content">
          <div className="smc-content-header">
            <h2>
              {activeSection === 'completed' ? 'Completed Orders' :
                activeSection === 'purchaseProducts' ? 'Purchase Products' :
                  'Incomplete Orders'}
            </h2>

            {/* Conditional Controls based on active section */}
            {activeSection !== 'purchaseProducts' ? (
              <div className="smc-controls-container">
                <div className="smc-search-box">
                  <FaSearch className="smc-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Name or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {(activeSection === 'incomplete' || activeSection === 'completed') && (
                  <button
                    className="smc-export-btn"
                    onClick={handleExportOrders}
                    disabled={isExporting || (activeSection === 'incomplete' ? pendingOrders === 0 : shippedOrders === 0)}
                  >
                    {isExporting ? (
                      <FaClock className="smc-export-icon" />
                    ) : (
                      <FaFileExcel className="smc-export-icon" />
                    )}
                    {isExporting ? 'Exporting...' : 'Export Excel'}
                  </button>
                )}
              </div>
            ) : (
              <div className="smc-controls-container">
                {/* Purchase Products will handle its own controls internally */}
                <div style={{ height: '40px' }}></div> {/* Spacer for consistent layout */}
              </div>
            )}
          </div>

          {/* Conditional Content based on active section */}
          {activeSection !== 'purchaseProducts' ? (
            <div className="smc-orders-section">
              {filterStatus !== 'completed' && filteredActiveOrders.length === 0 ? (
                <div className="smc-no-orders">
                  <FaBoxOpen className="smc-no-orders-icon" />
                  <p>No active orders found.</p>
                </div>
              ) : filterStatus !== 'incomplete' && filteredCompletedOrders.length === 0 ? (
                <div className="smc-no-orders">
                  <FaCheckCircle className="smc-no-orders-icon" />
                  <p>No completed orders yet.</p>
                </div>
              ) : (
                <div className="smc-orders-grid">
                  {(filterStatus !== 'completed' ? filteredActiveOrders : [])
                    .concat(filterStatus !== 'incomplete' ? filteredCompletedOrders : [])
                    .map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        expandedOrders={expandedOrders}
                        expandedProducts={expandedProducts}
                        toggleOrderDetails={toggleOrderDetails}
                        toggleProductDetails={toggleProductDetails}
                        handleMarkShipped={handleMarkShipped}
                        renderSize={renderSize}
                        renderProductImage={renderProductImage}
                        isCompleted={order.shippingCompleted}
                        convertPrice={convertPrice}
                        currencySymbol={currencySymbols[currentCurrency]}
                      />
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="smc-purchase-products-tab">
              <PurchaseProducts
                isEmbedded={true}
                currentCurrency={currentCurrency}
                currencySymbols={currencySymbols}
                rates={rates}
                changeCurrency={changeCurrency}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ OrderCard
const OrderCard = ({
  order,
  expandedOrders,
  expandedProducts,
  toggleOrderDetails,
  toggleProductDetails,
  handleMarkShipped,
  renderSize,
  renderProductImage,
  isCompleted,
  convertPrice,
  currencySymbol
}) => {
  const addr = order.userDetails
    ? `${order.userDetails.houseNumber || ""}, ${order.userDetails.addressLine1 || ""}, ${order.userDetails.addressLine2 || ""}, ${order.userDetails.district || ""}, ${order.userDetails.state || ""}, ${order.userDetails.region || ""} - ${order.userDetails.pincode || ""}`
    : "N/A";
  const phone =
    order.userDetails?.mobile ||
    order.userDetails?.phone ||
    order.userDetails?.phoneNumber || "N/A";
  const isOrderExpanded = expandedOrders[order._id];

  return (
    <div className={`smc-order-card ${isCompleted ? 'completed' : ''}`}>
      <div className="smc-order-card-header" onClick={() => toggleOrderDetails(order._id)}>
        <div className="smc-order-id-status">
          <div className="smc-order-id">Order: {order._id}</div>
          {order.deliveryDate && (
            <div className="smc-delivery-date">
              <FaClock className="smc-info-icon" /> Delivery Date:{" "}
              {new Date(order.deliveryDate).toLocaleDateString()}
            </div>
          )}
          <div className="smc-status-badges">
            <div className={`smc-status-badge ${order.shippingCompleted ? "completed" : "pending"}`}>
              {order.shippingCompleted ? <FaCheckCircle /> : <FaTruck />}
              {order.shippingCompleted ? "Delivered" : "Processing"}
            </div>
          </div>

          {/* 🚀 Express / Free Delivery Badge */}
          {order.isExpressDelivery ? (
            <div className="smc-status-badge smc-express">
              <FaShippingFast />
              Express Delivery
            </div>
          ) : (
            <div className="smc-status-badge smc-free">
              <FaClock />
              Free Delivery
            </div>
          )}
        </div>
        <div className="smc-order-toggle">{isOrderExpanded ? <FaChevronUp /> : <FaChevronDown />}</div>
      </div>

      <div className="smc-order-card-summary">
        <div className="smc-customer-info">
          <div className="smc-customer-name"><FaUser className="smc-info-icon" />{order.userDetails?.name || "Unknown"}</div>
          <div className="smc-customer-email"><FaEnvelope className="smc-info-icon" />{order.userDetails?.email || "N/A"}</div>
          <div className="smc-customer-phone"><FaPhone className="smc-info-icon" />{order.userDetails?.regionCode ? `${order.userDetails.regionCode} ` : ""}{phone}</div>
        </div>
        <div className="smc-order-meta">
          <div className="smc-payment-info">
            <span className="smc-payment-method">{order.paymentMethod}</span>
            <span className={`smc-payment-status ${order.paymentStatus?.toLowerCase()}`}>{order.paymentStatus}</span>
          </div>
          {/* Display original currency and amount */}
          <div className="smc-total-amount">
            <FaShoppingCart className="smc-amount-icon" />
            {order.currency} {order.totalAmount}
          </div>
        </div>
      </div>

      {isOrderExpanded && (
        <div className="smc-order-card-details">
          <div className="smc-contact-section">
            <h4><FaMapMarkerAlt className="smc-section-icon" />Delivery Address</h4>
            <div className="smc-contact-details"><div className="smc-contact-address">{addr}</div></div>
          </div>

          <div className="smc-products-section">
            <h4><FaBox className="smc-section-icon" />Products ({order.products?.length})</h4>
            <div className="smc-products-list">
              {order.products?.map((p, idx) => {
                const key = `${order._id}-${idx}`;
                const expanded = expandedProducts[key];
                return (
                  <div key={idx} className="smc-product-item">
                    <div className="smc-product-summary" onClick={() => toggleProductDetails(order._id, idx)}>
                      <div className="smc-product-info">
                        <div className="smc-product-name">{p.name}</div>
                        <div className="smc-product-id">ID: {p.productId}</div>
                        {/* Display original currency and price */}
                        <div className="smc-product-price">
                          {order.currency} {p.discountedPrice || p.originalPrice} × {p.qty}
                        </div>
                      </div>
                      <div className="smc-product-toggle">{expanded ? <FaChevronUp /> : <FaChevronDown />}</div>
                    </div>

                    {/* ✅ Warehouse Allocation Section */}
                    {p.warehouseAllocations && p.warehouseAllocations.length > 0 && (
                      <div className="ship-warehouse-allocation">
                        <h4>Warehouse Allocation</h4>
                        {p.warehouseAllocations.map((wh, index) => (
                          <div key={index} className="ship-warehouse-entry">
                            <p><strong>{wh.warehouseType}:</strong> {wh.name} ({wh.city}, {wh.state})</p>
                            <p><strong>Allocated Qty:</strong> {wh.qty}</p>
                            <p><strong>Manager:</strong> {wh.warehouseManager?.name || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {expanded && (
                      <div className="smc-product-details-expanded">
                        <div className="smc-product-detail-grid">
                          {Object.entries(p).map(([key, value]) => {
                            // 🚫 Skip internal or unnecessary fields
                            if (
                              value === null ||
                              value === undefined ||
                              key === "_id" ||
                              key === "__v" ||
                              value === "NA" ||
                              value === "N/A" ||
                              value === "null" ||
                              value === "undefined" ||
                              key === "warehouseAllocations" ||
                              key === "warehouseStocks" ||
                              key === "image" ||
                              key === "images" ||
                              key === "description" ||
                              key === "extraDetails" ||
                              key === "createdAt" ||
                              key === "updatedAt"
                            )
                              return null;

                            // 🔥 CORE FIX — hide "size" if selectedSize exists
                            if (key === "size" && p.selectedSize) return null;

                            // 🏷️ Format key to readable label (camelCase → Title Case)
                            const formattedKey = key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/_/g, " ")
                              .replace(/^./, (str) => str.toUpperCase());

                            // 📦 Handle arrays and objects
                            let displayValue;
                            if (typeof value === "object") {
                              if (Array.isArray(value)) {
                                displayValue = value.length ? value.join(", ") : "N/A";
                              } else {
                                // For object types like extra details or nested fields
                                displayValue = Object.entries(value)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(", ");
                              }
                            } else {
                              displayValue = value;
                            }

                            // ❌ Final safety check
                            if (
                              !displayValue ||
                              displayValue === "NA" ||
                              displayValue === "Na" ||
                              displayValue === "na" ||
                              displayValue === "nA" ||
                              displayValue === "N/a" ||
                              displayValue === "n/a" ||
                              displayValue === "n/A" ||
                              displayValue === "N/A"
                            ) return null;

                            // 💰 Special formatting for price-related fields
                            if (
                              key.toLowerCase().includes("price") ||
                              key === "total" ||
                              key === "totalPrice" ||
                              key === "discountedPrice"
                            ) {
                              displayValue = `${order.currency} ${displayValue}`;
                            }

                            // 🏷️ Optional renaming for clarity
                            const labelMap = {
                              productId: "Product ID",
                              subCategory: "Subcategory",
                              subSubCategory: "Sub-Subcategory",
                              originalPrice: "Original Price",
                              discountedPrice: "After Discount",
                              total: "Total Amount",
                              qty: "Quantity",
                              inchs: "Inches",
                              ram: "RAM",
                              storage: "Storage",
                              type: "Type",
                              brand: "Brand",
                              color: "Color",
                              material: "Material",
                              processor: "Processor",
                              displaySize: "Display Size",
                              battery: "Battery",
                              camera: "Camera",
                              model: "Model",
                              power: "Power",
                              capacity: "Capacity",
                              weight: "Weight",
                              warranty: "Warranty",
                            };

                            const finalLabel = labelMap[key] || formattedKey;

                            // 🧩 Render each detail item
                            return (
                              <div key={key} className="smc-detail-item">
                                <span className="smc-detail-label">{finalLabel}:</span>
                                <span className="smc-detail-value" style={{ marginRight: "20px" }}>
                                  {displayValue || "N/A"}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* 🚨 Out-of-stock notice */}
                        {p.stock !== undefined && p.stock <= 0 && (
                          <div className="smc-out-of-stock-notice">
                            <FaInfoCircle />
                            <span>Out of Stock</span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          {/* {!isCompleted && (
            <div className="smc-action-buttons">
              <button onClick={() => handleMarkShipped(order._id)} className="smc-btn smc-btn-complete">
                <FaTruck className="smc-btn-icon" />Mark as Shipped
              </button>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};

export default ShippingManagement;
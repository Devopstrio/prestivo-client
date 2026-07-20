import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import "../styles/ReturnPolicyRequests.css";
import "../styles/LoadingAnimation.css";
import {
  FiUser,
  FiMail,
  FiPackage,
  FiShoppingBag,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiMapPin,
  FiBox,
  FiDollarSign,
  FiTruck,
  FiCreditCard,
  FiCalendar,
  FiMessageSquare,
  FiAlertCircle,
  FiFilter,
  FiFileText,
  FiEye,
  FiX,
  FiDownload,
  FiLoader,
  FiHome,
  FiDatabase,
  FiInfo,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";

// Import Font Awesome icons separately
import {
  FaFileInvoice,
  FaSpinner,
  FaExclamationTriangle
} from "react-icons/fa";

// Invoice Viewer Component (Integrated directly)
const InvoiceViewer = ({ orderId, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const fetchInvoice = async () => {
    try {
      if (!orderId) {
        setError("No Order ID provided");
        return;
      }

      setIsLoading(true);
      setError("");
      setPdfUrl(null);

      // Fetch the invoice from backend API
      const response = await axios.get(`${API_BASE_URL}/api/invoices/${orderId}`, {
        responseType: "arraybuffer",
      });

      if (response.data) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        setError("No invoice found for this Order ID");
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError("Failed to fetch invoice. Please check the Order ID.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchInvoice();
    }
  }, [orderId]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Invoice_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };



  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading </h3>
          <p>Please wait while page is loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="return-request-invoice-modal">
      <div className="return-request-invoice-modal-content">
        <div className="return-request-invoice-header">
          <h3>
            <FaFileInvoice /> Invoice Viewer - Order #{orderId}
          </h3>
          <button
            className="return-request-invoice-close"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <div className="return-request-invoice-body">
          {isLoading && (
            <div className="invoice-viewer-loading">
              <FaSpinner className="loading-spinner" />
              <p>Loading invoice...</p>
            </div>
          )}

          {error && (
            <div className="invoice-viewer-error">
              <FaExclamationTriangle className="error-icon" />
              <p>{error}</p>
              <button
                className="invoice-retry-btn"
                onClick={fetchInvoice}
              >
                Retry
              </button>
            </div>
          )}

          {pdfUrl && (
            <>
              <div className="invoice-viewer-actions">
                <button
                  className="invoice-download-btn"
                  onClick={handleDownload}
                >
                  <FiDownload /> Download PDF
                </button>
              </div>

              <div className="pdf-preview-container">
                <iframe
                  src={pdfUrl}
                  title={`Invoice for Order ${orderId}`}
                  className="pdf-preview-frame"
                  loading="lazy"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ReturnPolicyRequests = ({ warehouseId, warehouseName, user }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState({});

  // useEffect(() => {
  //   console.log("🏭 Warehouse ID from prop:", warehouseId);
  //   console.log("🏬 Warehouse Name from prop:", warehouseName);
  // }, [warehouseId, warehouseName]);

  const fetchReturnRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/return-policy/return-orders`);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching return requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/return-policy/update-status/${id}`, { status: newStatus });
      fetchReturnRequests();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const toggleProductExpansion = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <span className="return-request-status-badge return-request-status-approved"><FiCheckCircle /> Approved</span>;
      case "Completed":
        return <span className="return-request-status-badge return-request-status-completed"><FiCheckCircle /> Completed</span>;
      case "Rejected":
        return <span className="return-request-status-badge return-request-status-rejected"><FiXCircle /> Rejected</span>;
      default:
        return <span className="return-request-status-badge return-request-status-pending"><FiClock /> Pending</span>;
    }
  };

  // Helper function to check if order belongs to user's warehouse
  const isOrderFromUserWarehouse = (orderDetails) => {
    if (!warehouseId || !orderDetails?.products) return false;

    // Check if any product in the order has warehouse allocations matching user's warehouse
    return orderDetails.products.some(product =>
      product.warehouseAllocations?.some(allocation =>
        allocation.warehouseId === warehouseId
      )
    );
  };

  // Helper function to get warehouse info for display
  const getWarehouseInfo = (orderDetails) => {
    if (!orderDetails?.products) return null;

    const warehouseAllocations = [];

    orderDetails.products.forEach(product => {
      product.warehouseAllocations?.forEach(allocation => {
        if (allocation.warehouseId) {
          warehouseAllocations.push({
            warehouseId: allocation.warehouseId,
            warehouseName: allocation.name || 'Unknown Warehouse',
            quantity: allocation.qty || 0,
            isUserWarehouse: allocation.warehouseId === warehouseId
          });
        }
      });
    });

    return warehouseAllocations.length > 0 ? warehouseAllocations : null;
  };

  // Get warehouse-specific requests
  const getWarehouseRequests = () => {
    if (!warehouseId) return requests;
    return requests.filter(req => isOrderFromUserWarehouse(req.orderDetails));
  };

  // Get filtered requests based on current filters
  const getFilteredRequests = () => {
    const sourceRequests = warehouseId ? getWarehouseRequests() : requests;

    if (activeFilter === "All") return sourceRequests;
    return sourceRequests.filter(req => req.status === activeFilter);
  };

  // Count requests for warehouse
  const warehouseRequestsCount = warehouseId ? getWarehouseRequests().length : 0;

  // Get status counts based on current view (warehouse or all)
  const getStatusCounts = () => {
    const sourceRequests = warehouseId ? getWarehouseRequests() : requests;

    return {
      all: sourceRequests.length,
      pending: sourceRequests.filter(req => req.status === "Pending").length,
      approved: sourceRequests.filter(req => req.status === "Approved").length,
      completed: sourceRequests.filter(req => req.status === "Completed").length,
      rejected: sourceRequests.filter(req => req.status === "Rejected").length
    };
  };

  const statusCounts = getStatusCounts();

  // Filter options with dynamic counts
  const filterOptions = [
    { value: "All", label: "All Requests", icon: FiFilter, count: statusCounts.all },
    { value: "Pending", label: "Pending", icon: FiClock, count: statusCounts.pending },
    { value: "Approved", label: "Approved", icon: FiCheckCircle, count: statusCounts.approved },
    { value: "Completed", label: "Completed", icon: FiCheckCircle, count: statusCounts.completed },
    { value: "Rejected", label: "Rejected", icon: FiXCircle, count: statusCounts.rejected }
  ];

  // Open invoice viewer
  const openInvoiceViewer = (orderId) => {
    setSelectedOrderId(orderId);
    setShowInvoiceViewer(true);
  };

  // Close invoice viewer
  const closeInvoiceViewer = () => {
    setShowInvoiceViewer(false);
    setSelectedOrderId(null);
  };

  // ✅ Professional Product Specifications Component with Labels
  const ProductSpecifications = ({ product }) => {
    const isExpanded = expandedProducts[product._id || product.productId];

    // Define specifications with labels
    const specifications = [
      { label: "Category", value: product.category },
      { label: "Sub Category", value: product.subCategory },
      { label: "Sub Sub Category", value: product.subSubCategory },
      { label: "Brand", value: product.brand },
      { label: "Color", value: product.color },
      { label: "Material", value: product.material },
      { label: "Fit", value: product.fit },
      { label: "RAM", value: product.ram && Array.isArray(product.ram) ? product.ram.join(", ") : product.ram },
      { label: "Storage", value: product.storage && Array.isArray(product.storage) ? product.storage.join(", ") : product.storage },
      { label: "Type", value: product.type && Array.isArray(product.type) ? product.type.join(", ") : product.type },
      { label: "Processor", value: product.processor },
      { label: "Display Size", value: product.displaySize },
      { label: "Battery", value: product.battery },
      { label: "Camera", value: product.camera },
      { label: "Screen Size", value: product.screenSize },
      { label: "Inches", value: product.inchs },
      { label: "Size", value: product.size && Array.isArray(product.size) ? product.size.join(", ") : product.size },
      { label: "Skin Type", value: product.skinType },
      { label: "Hair Type", value: product.hairType },
      { label: "Fragrance Type", value: product.fragranceType },
      { label: "Language", value: product.language },
      { label: "Author", value: product.author },
      { label: "Genre", value: product.genre },
      { label: "Format", value: product.format },
      { label: "Pack Size", value: product.packSize },
      { label: "Organic", value: product.organic },
      { label: "Model", value: product.model },
      { label: "Power", value: product.power },
      { label: "Capacity", value: product.capacity },
      { label: "Weight", value: product.weight },
      { label: "Warranty", value: product.warranty }
    ].filter(spec => spec.value && (Array.isArray(spec.value) ? spec.value.length > 0 : spec.value.toString().trim() !== ""));

    const hasSpecifications = specifications.length > 0;

    if (!hasSpecifications) return null;

    return (
      <div className="return-product-specs-container">
        <div
          className="return-product-specs-header"
          onClick={() => toggleProductExpansion(product._id || product.productId)}
        >
          <div className="return-product-specs-title">
            <FiInfo className="return-product-specs-icon" />
            <span>Product Specifications</span>
          </div>
          <div className="return-product-specs-toggle">
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </div>
        </div>

        {isExpanded && (
          <div className="return-product-specs-content">
            {/* Category Hierarchy */}
            {(product.category || product.subCategory || product.subSubCategory) && (
              <div className="return-specs-section">
                <h6 className="return-specs-section-title">Category Information</h6>
                <div className="return-category-hierarchy">
                  {product.category && (
                    <div className="return-category-level">
                      <span className="return-category-label">Category:</span>
                      <span className="return-category-value">{product.category}</span>
                    </div>
                  )}
                  {product.subCategory && (
                    <div className="return-category-level">
                      <span className="return-category-label">Sub Category:</span>
                      <span className="return-category-value">{product.subCategory}</span>
                    </div>
                  )}
                  {product.subSubCategory && (
                    <div className="return-category-level">
                      <span className="return-category-label">Sub Sub Category:</span>
                      <span className="return-category-value">{product.subSubCategory}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product Specifications Grid */}
            <div className="return-specs-section">
              <h6 className="return-specs-section-title">Product Details</h6>
              <div className="return-specs-grid">
                {specifications
                  .filter(spec => !['category', 'subCategory', 'subSubCategory'].includes(spec.label.toLowerCase().replace(/\s+/g, '')))
                  .map((spec, index) => (
                    <div key={index} className="return-spec-row">
                      <span className="return-spec-label">{spec.label}:</span>
                      <span className="return-spec-value">{spec.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredRequests = getFilteredRequests();

  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading </h3>
          <p>Please wait while return requests are loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="return-request-container">
      {/* Header Section */}
      <div className="return-request-header-section">
        <div className="return-request-header-content">
          <h2 className="return-request-page-title">
            <FiShoppingBag /> Return Policy Requests
            {warehouseName && (
              <span className="return-request-warehouse-subtitle">
                for {warehouseName}
              </span>
            )}
          </h2>
          <div className="return-request-header-stats">
            <span className="return-request-total-count">
              Total: {statusCounts.all} requests
            </span>
            {warehouseId && (
              <span className="return-request-warehouse-count">
                Warehouse Requests: {warehouseRequestsCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Warehouse Info Section - Only show if warehouseId prop is provided */}
      {warehouseId && (
        <div className="return-request-warehouse-info-section">
          <div className="return-request-warehouse-info-header">
            <FiHome className="return-request-warehouse-info-icon" />
            <span>Warehouse Information</span>
          </div>
          <div className="return-request-current-warehouse">
            <FiMapPin className="return-request-current-warehouse-icon" />
            <div className="return-request-warehouse-details">
              <span className="return-request-warehouse-id">ID: {warehouseId}</span>
              {warehouseName && (
                <span className="return-request-warehouse-name">Name: {warehouseName}</span>
              )}
            </div>
          </div>
          <div className="return-request-warehouse-note">
            <FiInfo className="return-request-warehouse-note-icon" />
            <span>Showing only return requests allocated to your warehouse</span>
          </div>
        </div>
      )}

      {/* Status Filter Section */}
      <div className="return-request-filter-section">
        <div className="return-request-filter-header">
          <FiFilter className="return-request-filter-icon" />
          <span>Filter by Status</span>
          {warehouseId && (
            <span className="return-request-filter-note">
              (Showing warehouse-specific counts)
            </span>
          )}
        </div>
        <div className="return-request-filter-buttons">
          {filterOptions.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <button
                key={filter.value}
                className={`return-request-filter-btn ${activeFilter === filter.value ? 'return-request-filter-active' : ''}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                <IconComponent className="return-request-filter-btn-icon" />
                <span>{filter.label}</span>
                <span className="return-request-filter-count">{filter.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Invoice Viewer */}
      {showInvoiceViewer && (
        <InvoiceViewer
          orderId={selectedOrderId}
          onClose={closeInvoiceViewer}
        />
      )}

      {/* Requests Grid */}
      {filteredRequests.length > 0 ? (
        <div className="return-request-cards-grid">
          {filteredRequests.map((req) => {
            const warehouseInfo = getWarehouseInfo(req.orderDetails);
            const isMyWarehouseOrder = warehouseId ? isOrderFromUserWarehouse(req.orderDetails) : false;

            return (
              <div key={req._id} className={`return-request-card return-request-card-${req.status.toLowerCase()} ${isMyWarehouseOrder ? 'return-request-card-my-warehouse' : ''}`}>
                <div className="return-request-card-header">
                  <div className="return-request-card-title-section">
                    <h3 className="return-request-order-title">
                      <FiPackage /> Order ID: {req.orderDetails?._id || "N/A"}
                    </h3>
                    {getStatusBadge(req.status)}
                  </div>

                  {/* Invoice Viewer Button */}
                  {req.orderDetails?._id && (
                    <button
                      className="return-request-invoice-btn"
                      onClick={() => openInvoiceViewer(req.orderDetails._id)}
                    >
                      <FiEye className="return-request-invoice-btn-icon" />
                      View Invoice
                    </button>
                  )}
                </div>

                {/* Warehouse Information */}
                {warehouseInfo && warehouseInfo.length > 0 && (
                  <div className="return-request-warehouse-info">
                    <h4 className="return-request-warehouse-title">
                      <FiHome /> Warehouse Allocations
                    </h4>
                    <div className="return-request-warehouse-list">
                      {warehouseInfo.map((warehouse, idx) => (
                        <div
                          key={idx}
                          className={`return-request-warehouse-item ${warehouse.isUserWarehouse ? 'return-request-warehouse-item-my' : ''}`}
                        >
                          <FiMapPin className="return-request-warehouse-icon" />
                          <div className="return-request-warehouse-details">
                            <span className="return-request-warehouse-name">{warehouse.warehouseName}</span>
                            <span className="return-request-warehouse-id">ID: {warehouse.warehouseId}</span>
                            <span className="return-request-warehouse-qty">Qty: {warehouse.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Information */}
                <div className="return-request-user-info">
                  <div className="return-request-user-item">
                    <FiUser className="return-request-user-icon" />
                    <span>{req.name}</span>
                  </div>
                  <div className="return-request-user-item">
                    <FiMail className="return-request-user-icon" />
                    <span>{req.email}</span>
                  </div>
                </div>

                {/* Return Details */}
                <div className="return-request-details">
                  <div className="return-request-detail-item">
                    <FiAlertCircle className="return-request-detail-icon" />
                    <span><strong>Reason:</strong> {req.reason}</span>
                  </div>
                  <div className="return-request-detail-item">
                    <FiMessageSquare className="return-request-detail-icon" />
                    <span><strong>Message:</strong> {req.message}</span>
                  </div>
                  <div className="return-request-detail-item">
                    <FiCalendar className="return-request-detail-icon" />
                    <span><strong>Requested On:</strong> {new Date(req.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Order Details */}
                {req.orderDetails && (
                  <div className="return-request-order-details">
                    <h4 className="return-request-order-details-title">
                      <FiPackage /> Order Summary
                    </h4>

                    <div className="return-request-order-summary">
                      <div className="return-request-summary-item">
                        <FiCreditCard className="return-request-summary-icon" />
                        <span><strong>Payment:</strong> {req.orderDetails.paymentMethod}</span>
                      </div>
                      <div className="return-request-summary-item">
                        <FiCheckCircle className="return-request-summary-icon" />
                        <span><strong>Payment Status:</strong> {req.orderDetails.paymentStatus}</span>
                      </div>
                      <div className="return-request-summary-item">
                        <FiDollarSign className="return-request-summary-icon" />
                        <span><strong>Total Amount:</strong> £ {req.orderDetails.totalAmount}</span>
                      </div>
                    </div>

                    {/* Products Preview */}
                    <div className="return-request-products-preview">
                      <h5 className="return-request-products-title">
                        <FiBox /> Products ({req.orderDetails.products?.length || 0})
                      </h5>
                      {req.orderDetails.products?.length > 0 ? (
                        <div className="return-request-products-preview-list">
                          {req.orderDetails.products.slice(0, 2).map((p, idx) => (
                            <div key={idx} className="return-request-product-preview-item">
                              <div className="return-request-product-header">
                                <span className="return-request-product-preview-name">{p.name}</span>
                                <span className="return-request-product-preview-qty">Qty: {p.qty}</span>
                              </div>

                              {/* Professional Product Specifications with Labels */}
                              <ProductSpecifications product={p} />
                            </div>
                          ))}

                          {req.orderDetails.products.length > 2 && (
                            <div className="return-request-products-more">
                              +{req.orderDetails.products.length - 2} more products
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="return-request-no-products">No products found</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {req.status === "Pending" && (
                  <div className="return-request-action-buttons">
                    <button
                      className="return-request-approve-btn"
                      onClick={() => updateStatus(req._id, "Approved")}
                    >
                      <FiCheckCircle /> Approve
                    </button>
                    <button
                      className="return-request-reject-btn"
                      onClick={() => updateStatus(req._id, "Rejected")}
                    >
                      <FiXCircle /> Reject
                    </button>
                  </div>
                )}

                {req.status === "Approved" && (
                  <div className="return-request-action-buttons">
                    <button
                      className="return-request-complete-btn"
                      onClick={() => updateStatus(req._id, "Completed")}
                    >
                      <FiCheckCircle /> Mark as Complete
                    </button>
                  </div>
                )}

                {req.status === "Completed" && (
                  <div className="return-request-completed-message">
                    <FiCheckCircle className="return-request-completed-icon" />
                    Return Process Successfully Completed
                  </div>
                )}

                {req.status === "Rejected" && (
                  <div className="return-request-rejected-message">
                    <FiXCircle className="return-request-rejected-icon" />
                    Return Request Rejected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="return-request-no-data">
          <FiShoppingBag className="return-request-no-data-icon" />
          <p className="return-request-no-data-text">
            No {activeFilter !== "All" ? activeFilter.toLowerCase() : ""} return requests found
            {warehouseId ? " for your warehouse" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReturnPolicyRequests;
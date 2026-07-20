import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_BASE_URL from "../config";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiDownload,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiShoppingBag,
  FiEye,
  FiX,
  FiUpload,
  FiFile,
  FiCalendar,
  FiDollarSign,
  FiCreditCard,
  FiChevronDown,
  FiChevronUp,
  FiBox,
  FiRotateCcw,
  FiMapPin
} from "react-icons/fi";

import "../styles/MyOrder.css";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [emailFormData, setEmailFormData] = useState({
    name: "",
    email: "",
    message: "",
    subject: "Product Delivery Confirmation",
    reason: "",
    otherReason: ""
  });

  // ✅ Fetch orders
  const fetchOrders = async () => {
    if (!user) return;

    try {
      const resOrders = await axios.get(
        `${API_BASE_URL}/api/orders/user/${user.id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const resReturns = await axios.get(
        `${API_BASE_URL}/api/return-policy/user/${user.id}`
      );

      const returnRequests = resReturns.data;

      // 🔥 Merge return policy status into orders
      const mergedOrders = resOrders.data.map(order => {
        const match = returnRequests.find(
          r => r.orderId?._id === order._id || r.orderId === order._id
        );

        return {
          ...order,
          returnStatus: match ? match.status : "None",
          returnRequestId: match?._id || null,
        };
      });

      setOrders(mergedOrders);
    } catch (err) {
      console.error("Failed:", err);
    }
  };


  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // ✅ Toggle product specifications
  const toggleProductExpanded = (orderId, productIndex) => {
    setExpandedProducts(prev => ({
      ...prev,
      [`${orderId}-${productIndex}`]: !prev[`${orderId}-${productIndex}`]
    }));
  };

  const handleDownloadInvoice = (order) => {
    if (!order?._id) {
      toast.error("Invalid order");
      return;
    }

    try {
      // ✅ Open invoice in NEW TAB
      window.open(
        `${API_BASE_URL}/api/invoices/${order._id}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to open invoice");
    }
  };



  // 🆕 ADDED: Cancel Order Function
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return toast.error("Please enter a cancellation reason.");

    try {
      setLoading(true);
      await axios.put(
        `${API_BASE_URL}/api/orders/cancel/${selectedOrder._id}`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success("Order cancel request successfully submitted.");
      setShowCancelModal(false);
      fetchOrders();
    } catch (err) {
      // console.error("Failed to cancel order:", err);
      toast.error("Failed to cancel order.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ View product details
  const handleViewProduct = (product) => {
    toast.success(`Viewing product: ${product.name}\nID: ${product.productId || "NA"}`);
  };

  // ✅ Open email modal
  const handleOpenEmailModal = (order) => {
    setSelectedOrder(order);
    setEmailFormData({
      name: user.name || "",
      email: user.email || "",
      message: `I would like to request a return for my order (ID: ${order._id}).\n\nOrder Details:\n- Total Amount: ${order.currency} ${order.totalAmount}\n- Products: ${order.products.map(p => `${p.name} (ID: ${p.productId?._id || "NA"})`).join(', ')}\n\nKindly guide me through the return process as per the product return policy.\n\nThank you!`,
      subject: `Product Return Request - Order #${order._id}`,
      reason: "",
      otherReason: ""
    });
    setShowEmailModal(true);
  };

  // ✅ Close email modal
  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setSelectedOrder(null);
    setEmailFormData({
      name: "",
      email: "",
      message: "",
      subject: "Product Delivery Confirmation",
      reason: "",
      otherReason: ""
    });
  };

  // ✅ Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Submit email form using Web3Forms
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!emailFormData.reason) return toast.warn("Please select a reason");

    try {
      setLoading(true);
      const finalReason =
        emailFormData.reason === "Other"
          ? emailFormData.otherReason
          : emailFormData.reason;

      await axios.post(`${API_BASE_URL}/api/return-policy/create-request`, {
        userId: user.id,
        orderId: selectedOrder._id,
        name: emailFormData.name,
        email: emailFormData.email,
        subject: emailFormData.subject,
        reason: finalReason,
        message: emailFormData.message,
      });

      toast.success("Return request submitted successfully!");
      handleCloseEmailModal();
    } catch (err) {
      // console.error("Return policy submission failed:", err);
      toast.error("Failed to submit return request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open cancel modal
  const handleOpenCancelModal = (order) => {
    setSelectedOrder(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  // ✅ Dynamic attribute renderer (universal for all product categories)
  const renderProductDetails = (p) => {
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

    const entries = Object.entries(p).filter(([key, value]) => {
      // 🔥 CORE FIX — hide "size" if selectedSize exists
      if (key === "size" && p.selectedSize) return false;
      if (!allowedKeys.includes(key)) return false;
      if (value === null || value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    });

    if (entries.length === 0) return null;

    return (
      <div className="order-product-details-expanded">
        <h5 className="order-expanded-title">
          <FiFile className="order-expanded-icon" /> Product Specifications
        </h5>

        <div className="order-product-detail-grid">
          {entries.map(([key, value]) => {
            const formattedKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/_/g, " ")
              .replace(/^./, (str) => str.toUpperCase());

            const displayValue = Array.isArray(value)
              ? value.join(", ")
              : typeof value === "object"
                ? JSON.stringify(value)
                : String(value);

            return (
              <div key={key} className="order-detail-item">
                <span className="order-detail-label">{formattedKey}</span>
                <span className="order-detail-value">{displayValue}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="my-orders-container">
        {/* Header Section */}
        <div className="orders-header">
          <h1 className="orders-page-title"><FiBox className="orders-title-icon" /> My Orders</h1>
          <p className="orders-subtitle">Track and manage your orders</p>
        </div>

        {orders.length === 0 && (
          <div className="no-orders">
            <FiShoppingBag className="empty-orders-icon" />
            <h2>No Orders Found</h2>
            <p>You haven't placed any orders yet</p>
          </div>
        )}

        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Order Header */}
              <div className="order-card-header">
                <div className="order-main-info">
                  <div className="order-id-section">
                    <FiCalendar className="order-header-icon" />
                    <span className="order-id">Order #{order._id}</span>
                  </div>
                  {/* 🆕 Updated with Cancel Support */}
                  <span className="order-status-badge">
                    Status:&nbsp;
                    {order.cancellationStatus === "processing"
                      ? "Cancellation Processing"
                      : order.cancellationStatus === "approved"
                        ? "Cancellation Approved"
                        : order.cancellationStatus === "completed"
                          ? "Cancelled"
                          : order.deliveryCompleted
                            ? "Delivered"
                            : "Processing"}
                  </span>


                </div>

                <div className="order-meta-info">
                  <div className="order-meta-item">
                    <FiCreditCard className="meta-icon" />
                    <span className="meta-label">Total:</span>
                    <span className="meta-value">{order.currency} {order.totalAmount}</span>
                  </div>
                  <div className="order-meta-item">
                    <FiCreditCard className="meta-icon" />
                    <span className="meta-label">Payment:</span>
                    <span className="meta-value">{order.paymentMethod} ({order.paymentStatus})</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="order-customer-info">
                <h4 className="customer-info-title">Customer Information</h4>
                <div className="customer-info-grid">
                  <div className="customer-info-item">
                    <FiUser className="customer-info-icon" />
                    <div className="customer-info-content">
                      <span className="customer-info-label">Name</span>
                      <span className="customer-info-value">{order.customerName || user?.name}</span>
                    </div>
                  </div>
                  <div className="customer-info-item">
                    <FiMail className="customer-info-icon" />
                    <div className="customer-info-content">
                      <span className="customer-info-label">Email</span>
                      <span className="customer-info-value">{order.customerEmail || user?.email}</span>
                    </div>
                  </div>
                  <div className="customer-info-item">
                    <FiPhone className="customer-info-icon" />
                    <div className="customer-info-content">
                      <span className="customer-info-label">Mobile</span>
                      <span className="customer-info-value">{order.userDetails?.regionCode || ""} {order.userDetails?.mobile || "N/A"}</span>
                    </div>
                  </div>

                  <div className="customer-info-item">
                    <FiMapPin className="customer-info-icon" />
                    <div className="customer-info-content">
                      <span className="customer-info-label">Address</span>

                      <span className="customer-info-value">
                        {order.userDetails?.houseNumber || ""}

                        {order.userDetails?.addressLine1
                          ? `, ${order.userDetails.addressLine1}`
                          : ""}

                        {order.userDetails?.addressLine2
                          ? `, ${order.userDetails.addressLine2}`
                          : ""}

                        {order.userDetails?.city ? `, ${order.userDetails.city}` : ""}

                        {order.userDetails?.district ? `, ${order.userDetails.district}` : ""}

                        {order.userDetails?.state ? `, ${order.userDetails.state}` : ""}

                        {order.userDetails?.region ? `, ${order.userDetails.region}` : ""}

                        {order.userDetails?.pincode
                          ? ` - ${order.userDetails.pincode}`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              {order.products?.length > 0 && (
                <div className="order-products-section">
                  <h4 className="products-section-title">Products ({order.products.length})</h4>
                  <div className="products-list">
                    {order.products.map((p, idx) => {
                      const isExpanded = expandedProducts[`${order._id}-${idx}`];
                      return (
                        <div key={idx} className="order-product-item">
                          <div className="order-product-header">
                            <span className="order-product-name">{p.name || "Balman Paris"}</span>
                            <span className="order-product-price">{order.currency} {p.total || 90}</span>
                          </div>
                          <div className="order-product-meta">
                            <span className="product-meta-item">ID: {p.productId?._id || "N/A"}</span>
                            <span className="product-meta-item">Qty: {p.qty || 1}</span>
                            {p.category && <span className="product-meta-item">Category: {p.category}</span>}
                          </div>

                          {/* Expandable Product Specifications */}
                          <div className="product-specs-section">
                            <button
                              className="toggle-specs-btn"
                              onClick={() => toggleProductExpanded(order._id, idx)}
                            >
                              <span>View Specifications</span>
                              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </button>

                            {isExpanded && renderProductDetails(p)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Progress Tracker with Lines */}
              <div className="order-progress-section">
                <h4 className="progress-title">Order Status</h4>
                <div className="order-progress-tracker">
                  <div className={`progress-step ${order.orderStatus?.placeOrder ? 'completed' : ''}`}>
                    <div className="step-icon-container">
                      <FiPackage className="step-icon" />
                    </div>
                    <span className="step-label">Order Placed</span>
                  </div>

                  <div className={`progress-connector ${order.orderStatus?.shipping ? 'completed' : ''}`}></div>

                  <div className={`progress-step ${order.orderStatus?.shipping ? 'completed' : ''}`}>
                    <div className="step-icon-container">
                      <FiTruck className="step-icon" />
                    </div>
                    <span className="step-label">In Transit</span>
                  </div>

                  <div className={`progress-connector ${order.orderStatus?.delivery ? 'completed' : ''}`}></div>

                  <div className={`progress-step ${order.orderStatus?.delivery ? 'completed' : ''}`}>
                    <div className="step-icon-container">
                      <FiCheckCircle className="step-icon" />
                    </div>
                    <span className="step-label">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="order-actions">
                {order.deliveryCompleted && (
                  <>
                    {/* ⭐ DO NOT REMOVE — Invoice Button */}
                    <button
                      className="btn btn-download-invoice"
                      onClick={() => handleDownloadInvoice(order)}
                    >
                      <FiDownload className="btn-icon" />
                      Download Invoice
                    </button>

                    {/* ⭐ DYNAMIC RETURN POLICY BUTTON */}
                    {order.returnStatus === "None" && (
                      <button
                        className="btn btn-return"
                        onClick={() => handleOpenEmailModal(order)}
                      >
                        <FiRotateCcw className="btn-icon" />
                        Return Policy
                      </button>
                    )}

                    {order.returnStatus === "Pending" && (
                      <button className="btn btn-return processing" disabled>
                        Processing...
                      </button>
                    )}

                    {order.returnStatus === "Approved" && (
                      <button className="btn btn-return approved" disabled>
                        Approved
                      </button>
                    )}

                    {order.returnStatus === "Rejected" && (
                      <button className="btn btn-return rejected" disabled>
                        Rejected
                      </button>
                    )}

                    {order.returnStatus === "Completed" && (
                      <button className="btn btn-return completed" disabled>
                        Returned
                      </button>
                    )}
                  </>
                )}


                {/* 🆕 ADDED: Cancel Order Button */}
                {!order.deliveryCompleted &&
                  order.cancellationStatus === "none" && (
                    <button
                      className={`btn btn-cancel ${order.orderStatus?.shipping ? "disabled" : ""}`}
                      onClick={() => handleOpenCancelModal(order)}
                      disabled={order.orderStatus?.shipping}
                    >
                      <FiX className="btn-icon" />
                      Cancel Order
                    </button>
                  )}

              </div>
            </div>
          ))}
        </div>

        {/* 🆕 ADDED: Cancel Modal */}
        {showCancelModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Cancel Order</h3>
                <button className="modal-close" onClick={() => setShowCancelModal(false)}>
                  <FiX />
                </button>
              </div>

              <div className="form-group">
                <label>Reason for Cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows="4"
                  placeholder="Please explain your reason..."
                  required
                ></textarea>
              </div>

              <div className="form-actions">
                <button className="btn btn-cancel" onClick={() => setShowCancelModal(false)}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={handleCancelOrder}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Return Policy Request</h3>
                <button className="modal-close" onClick={handleCloseEmailModal}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSubmitEmail} className="email-form">
                <div className="form-group">
                  <label>Your Name </label>
                  <input
                    type="text"
                    name="name"
                    value={emailFormData.name}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Your Email </label>
                  <input
                    type="email"
                    name="email"
                    value={emailFormData.email}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={emailFormData.subject}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Reason for Return </label>
                  <select
                    name="reason"
                    value={emailFormData.reason}
                    onChange={handleInputChange}
                    required
                    className="reason-select"
                  >
                    <option value="">Select a reason</option>
                    <option value="Product damaged">Product damaged</option>
                    <option value="Wrong product received">Wrong product received</option>
                    <option value="Product not as described">Product not as described</option>
                    <option value="Size issue">Size issue</option>
                    <option value="Color issue">Color issue</option>
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {emailFormData.reason === "Other" && (
                  <div className="form-group">
                    <label>Please specify your reason *</label>
                    <input
                      type="text"
                      name="otherReason"
                      value={emailFormData.otherReason || ""}
                      onChange={handleInputChange}
                      placeholder="Write your reason here..."
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Details</label>
                  <textarea
                    name="message"
                    value={emailFormData.message}
                    onChange={handleInputChange}
                    rows="6"
                    required
                    disabled
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-cancel" onClick={handleCloseEmailModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        Sending...
                      </>
                    ) : (
                      "Submit Return Request"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        <Chatbot />
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
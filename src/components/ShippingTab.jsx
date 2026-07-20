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
    FaFileExcel,
    FaHashtag,
    FaClock
} from "react-icons/fa";
import { toast } from "react-toastify";
import "../styles/ShippingTab.css";
import "../styles/LoadingAnimation.css";
import { exportShippingOrdersToExcel } from "../templates/ShippingTabExcel";

const ShippingTab = ({ orders, warehouseId, user, onRefresh, warehouseName }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [qrModal, setQrModal] = useState(false);
    const [selectedQR, setSelectedQR] = useState(null);

    // Only show loading for 0.3 seconds on initial page load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    // Filter orders based on search
    const filteredOrders = orders
        .filter(order => !order.cancellationStatus || order.cancellationStatus === "none") // Exclude cancellation orders
        .filter(order =>
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userDetails?.mobile?.includes(searchTerm) ||
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

    // Handle complete shipping
    const handleCompleteShipping = async (orderId) => {
        try {
            await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/warehouse-management/shipping/complete/${orderId}/${warehouseId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });
            toast.success("Shipping marked as completed for this warehouse!");
            onRefresh();
            closeOrderModal();
        } catch (err) {
            console.error("Complete Shipping Error:", err);
            toast.error("Failed to complete shipping. Try again.");
        }
    };

    // Export function for shipping orders
    const handleExportShippingOrders = () => {
        exportShippingOrdersToExcel(orders, warehouseName, setIsExporting);
    };

    // Function to render product details
    const renderProductDetails = (product, currency) => {
        const details = [];

        // Product ID
        if (product.productId) {
            details.push(
                <div key="product-id" className="shipping-product-detail-item">
                    <FaBarcode className="shipping-detail-icon" />
                    <div className="shipping-detail-content">
                        <span className="shipping-detail-label">Product ID</span>
                        <span className="shipping-detail-value shipping-product-id">{product.productId}</span>
                    </div>
                </div>
            );
        }

        // Basic product info
        details.push(
            <div key="quantity" className="shipping-product-detail-item">
                <FaBox className="shipping-detail-icon" />
                <div className="shipping-detail-content">
                    <span className="shipping-detail-label">Quantity</span>
                    <span className="shipping-detail-value">Qty: {product.qty}</span>
                </div>
            </div>
        );

        // Pricing information
        details.push(
            <div key="pricing" className="shipping-product-detail-item">
                <FaMoneyBillWave className="shipping-detail-icon" />
                <div className="shipping-detail-content">
                    <span className="shipping-detail-label">Price</span>
                    <span className="shipping-detail-value">
                        {product.discountedPrice} {currency}
                        {product.originalPrice && product.originalPrice !== product.discountedPrice && (
                            <span className="shipping-original-price">(Was: {product.originalPrice} {currency})</span>
                        )}
                    </span>
                </div>
            </div>
        );

        // Product attributes
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
                    <div key={key} className="shipping-product-detail-item">
                        <Icon className="shipping-detail-icon" />
                        <div className="shipping-detail-content">
                            <span className="shipping-detail-label">{label}</span>
                            <span className="shipping-detail-value">{product[key]}</span>
                        </div>
                    </div>
                );
            }
        });

        return details;
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

    const renderOrderCard = (order) => {
        const totalQuantity = order.products?.reduce((sum, product) => sum + (product.qty || 0), 0) || 0;

        return (
            <div key={order._id} className="shipping-order-card-item">
                <div className="shipping-order-card-header">
                    <div className="shipping-order-id-section">
                        <FaIdCard className="shipping-order-id-icon" />
                        <div>
                            <h3>Order #{order._id}</h3>
                            <div className="shipping-order-date">
                                <FaCalendarAlt className="shipping-date-icon" />Order date : &nbsp;
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                            {order.deliveryDate && (
                                <div className="shipping-order-date">
                                    <FaCalendarAlt className="shipping-date-icon" />
                                    Delivery Date:{" "}
                                    {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="shipping-status-badges">
                        {/* Shipping Status */}
                        <span className={`shipping-status-badge ${order.shippingCompleted ? 'shipping-completed' : 'shipping-pending'}`}>
                            {order.shippingCompleted ? 'Completed' : 'Pending'}
                        </span>

                        {/* 🚀 Express / Free Delivery */}
                        {order.isExpressDelivery ? (
                            <span className="shipping-status-badge shipping-express">
                                <FaShippingFast /> Express Delivery
                            </span>
                        ) : (
                            <span className="shipping-status-badge shipping-free">
                                <FaClock /> Free Delivery
                            </span>
                        )}
                    </div>


                </div>

                <div className="shipping-order-card-content">
                    {/* Customer Summary */}
                    <div className="shipping-customer-summary">
                        <div className="shipping-customer-avatar">
                            <FaUser className="shipping-avatar-icon" />
                        </div>
                        <div className="shipping-customer-info">
                            <h4>{order.userDetails?.name || "N/A"}</h4>
                            <p className="shipping-customer-contact">
                                <FaEnvelope className="shipping-contact-icon" />
                                {order.userDetails?.email || "N/A"}
                            </p>
                            <p className="shipping-customer-contact">
                                <FaPhone className="shipping-contact-icon" />
                                {order.userDetails?.regionCode || ""} {order.userDetails?.mobile || "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="shipping-order-summary-grid">
                        <div className="shipping-summary-item">
                            <FaBox className="shipping-summary-icon" />
                            <div className="shipping-summary-content">
                                <span className="shipping-summary-label">Products</span>
                                <span className="shipping-summary-value">{order.products?.length || 0} Items</span>
                            </div>
                        </div>
                        <div className="shipping-summary-item">
                            <FaMoneyBillWave className="shipping-summary-icon" />
                            <div className="shipping-summary-content">
                                <span className="shipping-summary-label">Total Amount</span>
                                <span className="shipping-summary-value">{order.totalAmount} {order.currency}</span>
                            </div>
                        </div>
                        <div className="shipping-summary-item">
                            <FaCreditCard className="shipping-summary-icon" />
                            <div className="shipping-summary-content">
                                <span className="shipping-summary-label">Payment</span>
                                <span className="shipping-summary-value">{order.paymentMethod}</span>
                            </div>
                        </div>
                        <div className="shipping-summary-item">
                            <FaHashtag className="shipping-summary-icon" />
                            <div className="shipping-summary-content">
                                <span className="shipping-summary-label">Total Quantity</span>
                                <span className="shipping-summary-value">{totalQuantity} Units</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Product Preview */}
                    <div className="shipping-products-preview">
                        <h5>Products</h5>
                        <div className="shipping-preview-list">
                            {order.products.slice(0, 3).map((p, idx) => (
                                <div key={idx} className="shipping-preview-item">
                                    <div className="shipping-preview-item-content">
                                        <span className="shipping-product-name">{p.name}</span>
                                        {p.productId && (
                                            <span className="shipping-product-id-preview">ID: {p.productId}</span>
                                        )}
                                        <span className="shipping-product-qty">Qty: {p.qty}</span>
                                    </div>
                                </div>
                            ))}
                            {order.products.length > 3 && (
                                <div className="shipping-more-items">
                                    +{order.products.length - 3} more items
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="shipping-order-card-actions">
                    <button
                        className="shipping-view-details-btn"
                        onClick={() => openOrderModal(order)}
                    >
                        <FaExpand className="shipping-btn-icon" />
                        View Full Details
                    </button>

                    <button
                        className="shipping-view-details-btn" id="qrdowbtn"
                        onClick={() => {
                            if (!order.qrCode) {
                                toast.error("QR not available for this order");
                                console.log("QR VALUE:", order.qrCode);
                                return;
                            }

                            setSelectedQR(order.qrCode);
                            setQrModal(true);
                        }}
                    >
                        <FaBarcode className="shipping-btn-icon" />
                        Show QR
                    </button>
                </div>



            </div>
        );
    };

    const renderOrderModal = () => {
        if (!selectedOrder) return null;

        return (
            <div className={`shipping-modal-overlay ${isModalOpen ? 'shipping-active' : ''}`} onClick={closeOrderModal}>
                <div className="shipping-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="shipping-modal-header">
                        <div className="shipping-modal-title-section">
                            <FaIdCard className="shipping-modal-title-icon" />
                            <div>
                                <h2>Order #{selectedOrder._id}</h2>
                                <p className="shipping-order-date-text"><FaCalendarAlt className="shipping-date-icon" /> Order Date:{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                {selectedOrder.deliveryDate && (
                                    <div className="shipping-order-date">
                                        <FaCalendarAlt className="shipping-date-icon" />
                                        Delivery Date:{" "}
                                        {new Date(selectedOrder.deliveryDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </div>
                                )}

                            </div>
                        </div>
                        <button className="shipping-close-modal" onClick={closeOrderModal}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="shipping-modal-body">
                        <div className="shipping-modal-grid">
                            {/* Customer Information */}
                            <div className="shipping-info-card shipping-customer-card">
                                <div className="shipping-card-header">
                                    <FaUser className="shipping-card-icon" id="shiph3" />
                                    <h3 id="shiph3">Customer Information</h3>
                                </div>
                                <div className="shipping-card-content">
                                    <div className="shipping-customer-details">
                                        <div className="shipping-detail-item">
                                            <FaUser className="shipping-detail-icon" />
                                            <div className="shipping-detail-content">
                                                <span className="shipping-detail-label">Full Name</span>
                                                <span className="shipping-detail-value">{selectedOrder.userDetails?.name || "N/A"}</span>
                                            </div>
                                        </div>
                                        <div className="shipping-detail-item">
                                            <FaEnvelope className="shipping-detail-icon" />
                                            <div className="shipping-detail-content">
                                                <span className="shipping-detail-label">Email</span>
                                                <span className="shipping-detail-value shipping-email">{selectedOrder.userDetails?.email || "N/A"}</span>
                                            </div>
                                        </div>
                                        <div className="shipping-detail-item">
                                            <FaPhone className="shipping-detail-icon" />
                                            <div className="shipping-detail-content">
                                                <span className="shipping-detail-label">Mobile</span>
                                                <span className="shipping-detail-value">
                                                    {selectedOrder.userDetails?.regionCode || ""} {selectedOrder.userDetails?.mobile || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shipping-detail-item shipping-full-width">
                                            <FaMapMarkerAlt className="shipping-detail-icon" />
                                            <div className="shipping-detail-content">
                                                <span className="shipping-detail-label">Delivery Address</span>
                                                <div className="shipping-address-content" style={{ border: "none", background: "none" }}>
                                                    <p>{selectedOrder.userDetails?.houseNumber || ""}, {selectedOrder.userDetails?.addressLine1 || ""}, {selectedOrder.userDetails?.addressLine2 || ""}, {selectedOrder.userDetails?.district || ""}</p>
                                                    <p>{selectedOrder.userDetails?.state || ""}, {selectedOrder.userDetails?.region || ""} - {selectedOrder.userDetails?.pincode || ""}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="shipping-info-card shipping-payment-card">
                                <div className="shipping-card-header">
                                    <FaCreditCard className="shipping-card-icon" id="shiph3" />
                                    <h3 id="shiph3">Payment Information</h3>
                                </div>
                                <div className="shipping-card-content">
                                    <div className="shipping-payment-grid">
                                        <div className="shipping-payment-item">
                                            <div className="shipping-payment-label">Payment Method</div>
                                            <div className="shipping-payment-method">{selectedOrder.paymentMethod}</div>
                                        </div>
                                        <div className="shipping-payment-item">
                                            <div className="shipping-payment-label">Payment Status</div>
                                            <div className={`shipping-payment-status ${selectedOrder.paymentStatus?.toLowerCase()}`}>
                                                {selectedOrder.paymentStatus}
                                            </div>
                                        </div>
                                        <div className="shipping-payment-item">
                                            <div className="shipping-payment-label">Total Amount</div>
                                            <div className="shipping-amount-display">
                                                <FaMoneyBillWave className="shipping-amount-icon" />
                                                <span className="shipping-amount">{selectedOrder.totalAmount}</span>
                                                <span className="shipping-currency">{selectedOrder.currency}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products Information */}
                            <div className="shipping-info-card shipping-products-card">
                                <div className="shipping-card-header">
                                    <FaBox className="shipping-card-icon" id="shiph3" />
                                    <h3 id="shiph3">Products ({selectedOrder.products?.length || 0})</h3>
                                </div>
                                <div className="shipping-card-content">
                                    <div className="shipping-products-list">
                                        {selectedOrder.products.map((p, idx) => (
                                            <div key={idx} className="shipping-product-item">
                                                <div className="shipping-product-header">
                                                    <div className="shipping-product-basic-info">
                                                        <div className="shipping-product-title-section">
                                                            <h4>{p.name}</h4>
                                                            {p.productId && (
                                                                <div className="shipping-product-id-display">
                                                                    <FaBarcode className="shipping-id-icon" />
                                                                    <span className="shipping-product-id-text">ID: {p.productId}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="shipping-product-meta">
                                                            <span className="shipping-product-quantity">
                                                                <FaBox className="shipping-meta-icon" />
                                                                Qty: {p.qty}
                                                            </span>
                                                            <span className="shipping-product-category">
                                                                <FaTag className="shipping-meta-icon" />
                                                                {p.category}
                                                            </span>
                                                            {p.subCategory && (
                                                                <span className="shipping-product-subcategory">
                                                                    <FaLayerGroup className="shipping-meta-icon" />
                                                                    {p.subCategory}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="shipping-product-pricing">
                                                        <div className="shipping-price-breakdown">
                                                            {p.originalPrice && p.originalPrice !== p.discountedPrice && (
                                                                <div className="shipping-original-price">
                                                                    {p.originalPrice} {selectedOrder.currency}
                                                                </div>
                                                            )}
                                                            <div className="shipping-discounted-price">
                                                                {p.discountedPrice} {selectedOrder.currency}
                                                            </div>
                                                            {p.discount > 0 && (
                                                                <span className="shipping-discount-badge">{p.discount}% OFF</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Product Details */}
                                                <div className="shipping-product-details">
                                                    <div className="shipping-product-details-grid">
                                                        {renderProductDetails(p, selectedOrder.currency)}
                                                    </div>

                                                    {/* ✅ Expandable Dynamic Product Info Section (show only schema fields) */}
                                                    <div className="ship-product-details-expanded">
                                                        <h5 className="ship-expanded-title">
                                                            <FaInfoCircle className="ship-expanded-icon" /> View Full Product Details
                                                        </h5>

                                                        <div className="ship-product-detail-grid">
                                                            {(() => {
                                                                // allowed keys based on your Order schema product subdocument
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
                                                                    "product_type", // you used product_type in the schema snippet
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
                                                                    "warranty",
                                                                    // any other product-level keys you want to show can be added here
                                                                ];

                                                                return Object.entries(p)
                                                                    .filter(([key, value]) => {
                                                                        // only keys in allowed list and non-empty values
                                                                        if (!allowedKeys.includes(key)) return false;
                                                                        if (key === "size" && p.selectedSize) return false;
                                                                        if (value === null || value === undefined) return false;
                                                                        // treat empty arrays / empty strings as not present
                                                                        if (Array.isArray(value) && value.length === 0) return false;
                                                                        if (typeof value === "string" && value.trim() === "") return false;
                                                                        return true;
                                                                    })
                                                                    .map(([key, value]) => {
                                                                        // Format key into readable label
                                                                        const formattedKey = key
                                                                            .replace(/([A-Z])/g, " $1")
                                                                            .replace(/_/g, " ")
                                                                            .replace(/^./, (str) => str.toUpperCase());

                                                                        // Format display value
                                                                        let displayValue;
                                                                        if (Array.isArray(value)) {
                                                                            displayValue = value.join(", ");
                                                                        } else if (typeof value === "object") {
                                                                            // if it's an object (rare here) stringify compactly
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
                                                    <div className="shipping-allocations-section">
                                                        <h5>
                                                            <FaWarehouse className="shipping-section-icon" />
                                                            Warehouse Allocations
                                                        </h5>
                                                        <div className="shipping-allocations-list">
                                                            {p.warehouseAllocations
                                                                .filter(alloc => alloc.warehouseId?.toString() === warehouseId && alloc.warehouseType === "Main Warehouse")
                                                                .map((alloc, allocIdx) => (
                                                                    <div
                                                                        key={allocIdx}
                                                                        className="shipping-allocation-item shipping-main-warehouse"
                                                                    >
                                                                        <FaWarehouse className="shipping-allocation-icon" />
                                                                        <div className="shipping-allocation-details">
                                                                            <span className="shipping-allocation-type">{alloc.warehouseType}</span>
                                                                            <span className="shipping-allocation-name">{alloc.name}</span>
                                                                            <span className="shipping-allocation-address">
                                                                                {alloc.city && `${alloc.city}, `}{alloc.state}
                                                                            </span>
                                                                        </div>
                                                                        <div className="shipping-allocation-meta">
                                                                            <span className="shipping-allocation-qty">Qty: {alloc.qty}</span>
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

                    <div className="shipping-modal-actions">
                        {!selectedOrder.shippingCompleted && (
                            <button
                                className="shipping-complete-shipping-btn shipping-primary-action"
                                onClick={() => handleCompleteShipping(selectedOrder._id)}
                            >
                                <FaCheckCircle className="shipping-btn-icon" />
                                Mark Shipping as Completed
                            </button>
                        )}
                        <button className="shipping-close-btn" onClick={closeOrderModal}>
                            <FaCompress className="shipping-btn-icon" />
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        );
    };



    return (
        <div className="shipping-tab-container">
            <div className="shipping-tab-header">
                <div className="shipping-header-content">
                    <FaShippingFast className="shipping-header-icon" />
                    <div className="shipping-header-text">
                        <h2>Shipping Management</h2>
                        <p>Manage orders pending shipping from {warehouseName} warehouse</p>
                    </div>
                </div>
                <div className="shipping-header-stats">
                    <button
                        className="shipping-export-btn"
                        onClick={handleExportShippingOrders}
                        disabled={isExporting || orders.length === 0}
                    >
                        {isExporting ? (
                            <FaSpinner className="shipping-export-icon shipping-export-spinning" />
                        ) : (
                            <FaFileExcel className="shipping-export-icon" />
                        )}
                        {isExporting ? 'Exporting...' : 'Export Excel'}
                    </button>
                    <div className="shipping-stat-card">
                        <span className="shipping-stat-number">{filteredOrders.length}</span>
                        <span className="shipping-stat-label">Orders Ready</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="shipping-search-section">
                <div className="shipping-search-container">
                    <FaSearch className="shipping-search-icon" />
                    <input
                        type="text"
                        placeholder="Search orders by ID, customer name, email, phone, or product ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="shipping-search-input"
                    />
                </div>
            </div>

            {/* Orders Grid */}
            <div className="shipping-orders-grid">
                {filteredOrders.length === 0 ? (
                    <div className="shipping-empty-state">
                        <FaBox className="shipping-empty-icon" />
                        <h3>No Shipping Orders Found</h3>
                        <p>
                            {searchTerm ?
                                "No orders match your search criteria. Try different keywords." :
                                "Shipping orders from Main Warehouse will appear here."
                            }
                        </p>
                    </div>
                ) : (
                    filteredOrders.map((order) => renderOrderCard(order))
                )}
            </div>

            {/* Order Details Modal */}
            {renderOrderModal()}

            {qrModal && (
                <div
                    className="shipping-qr-modal-overlay"
                    style={{ zIndex: 9999 }}
                    onClick={() => setQrModal(false)}
                >
                    <div
                        className="shipping-qr-modal-content"
                        style={{ maxWidth: "400px", textAlign: "center" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="shipping-qr-modal-header">
                            <h2>Order QR Code</h2>
                            <button onClick={() => setQrModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        {/* BODY */}
                        <div style={{ padding: "20px" }}>
                            {!selectedQR ? (
                                <p style={{ color: "red", fontWeight: "600" }}>
                                    QR not available for this order
                                </p>
                            ) : (
                                <>
                                    <img
                                        src={selectedQR}
                                        alt="QR Code"
                                        style={{
                                            width: "220px",
                                            height: "220px",
                                            borderRadius: "10px",
                                            border: "1px solid #ddd",
                                        }}
                                    />

                                    {/* 🔥 DOWNLOAD BUTTON */}
                                    <div style={{ marginTop: "15px" }}>
                                        <a
                                            href={selectedQR}
                                            download={`order-${Date.now()}.png`}
                                            className="shipping-qr-complete-shipping-btn"
                                            style={{ display: "inline-block" }}
                                        >
                                            ⬇ Download QR
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShippingTab;
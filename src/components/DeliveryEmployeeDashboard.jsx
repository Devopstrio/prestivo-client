import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import API_BASE_URL from "../config";
import {
    FaUser,
    FaTasks,
    FaCheckCircle,
    FaSignOutAlt,
    FaChevronLeft,
    FaChevronRight,
    FaBox,
    FaClock,
    FaCheck,
    FaChevronDown,
    FaChevronUp,
    FaMapMarkerAlt,
    FaPhone,
    FaHome,
    FaCity,
    FaMapPin,
    FaEnvelope,
    FaIdCard,
    FaCalendarAlt,
    FaBriefcase,
    FaDollarSign,
    FaTruck,
    FaShoppingCart,
    FaInfoCircle
} from "react-icons/fa";
import "../styles/DeliveryEmployeeDashboard.css";

const DeliveryEmployeeDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("assigned");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [employeeData, setEmployeeData] = useState({
        // Personal Information
        name: "",
        email: "",
        employeeId: "",
        dateOfJoining: "",
        department: "",
        designation: "",

        // Contact Information
        regionCode: "+91",
        mobile: "",

        // Address Details
        houseNumber: "",
        addressLine1: "",
        addressLine2: "",
        region: "",
        district: "",
        state: "",
        pincode: "",

        // Employment Details
        salary: "",
        employmentType: "",
        shiftTimings: "",
        vehicleNumber: "",
        supervisor: "",

        // Performance Metrics
        totalDeliveries: 0,
        completedDeliveries: 0,
        pendingDeliveries: 0,
        averageRating: 0,
        lastActive: ""
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Fetch assigned orders
    useEffect(() => {
        if (!user?.id) return;

        const fetchAssignedOrders = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/orders/assigned/${user.id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedOrders();
    }, [user]);

    // Fetch employee profile data
    useEffect(() => {
        if (user?.id) {
            const fetchEmployeeProfile = async () => {
                try {
                    const res = await axios.get(`${API_BASE_URL}/api/deliveryEmployees/profile/${user.id}`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });

                    if (res.data) {
                        setEmployeeData(prev => ({
                            ...prev,
                            ...res.data,
                            // Ensure address fields are properly set
                            ...(res.data.address || {}),
                            supervisor: res.data.supervisor || "",
                            employeeId: res.data.deliveryEmployee?.employeeId || res.data.employeeId || "",
                            // Set performance metrics
                            totalDeliveries: orders.length,
                            completedDeliveries: orders.filter(order => order.deliveryCompleted).length,
                            pendingDeliveries: orders.filter(order => !order.deliveryCompleted).length,
                            // Set basic user info
                            name: res.data.name || user.name,
                            email: res.data.email || user.email
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch employee profile:", err);
                    // Fallback to basic user data
                    setEmployeeData(prev => ({
                        ...prev,
                        name: user.name,
                        email: user.email,
                        totalDeliveries: orders.length,
                        completedDeliveries: orders.filter(order => order.deliveryCompleted).length,
                        pendingDeliveries: orders.filter(order => !order.deliveryCompleted).length
                    }));
                }
            };
            fetchEmployeeProfile();
        }
    }, [user, orders]);

    // Mark order as delivered and send email
    const handleMarkDelivered = async (orderId) => {
        try {
            const res = await axios.put(
                `${API_BASE_URL}/api/orders/admin/mark-delivered/${orderId}`
            );
            const updatedOrder = res.data.order;

            setOrders((prevOrders) =>
                prevOrders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
            );

            // Construct the delivery address from user details
            const userDetails = updatedOrder.userDetails || {};
            const deliveryAddress = userDetails.houseNumber || userDetails.addressLine1 || userDetails.addressLine2 || userDetails.region || userDetails.district || userDetails.state || userDetails.pincode
                ? `${userDetails.houseNumber || ""}, ${userDetails.addressLine1 || ""}, ${userDetails.addressLine2 || ""}, ${userDetails.district || ""}, ${userDetails.state || ""}, ${userDetails.region || ""} - ${userDetails.pincode || ""}`.replace(/, ,/g, ', ').replace(/, $/, '')
                : "N/A";

            const emailPayload = {
                to: updatedOrder.userDetails?.email,
                userName: updatedOrder.userDetails?.name,
                orderId: updatedOrder._id,
                products: updatedOrder.products.map(p => ({
                    name: p.name,
                    quantity: p.qty,
                    price: p.discountedPrice,
                    total: p.qty * p.discountedPrice
                })),
                totalAmount: updatedOrder.totalAmount,
                currency: updatedOrder.currency,
                deliveryDate: new Date().toLocaleDateString(),
                invoiceUrl: updatedOrder.invoiceUrl || "",
                address: deliveryAddress // Use the constructed address here
            };

            await axios.post(
                `${API_BASE_URL}/api/email/order-completed`,
                emailPayload
            );

            toast.success("Order marked as delivered and email sent successfully!");
        } catch (err) {
            console.error("Failed to mark order delivered or send email:", err);
            toast.error("Failed to update order or send email");
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out from your account",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, Logout",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                toast.success("Logged out successfully");

                setTimeout(() => {
                    logout();
                }, 800);
            }
        });
    };


    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_BASE_URL}/api/deliveryEmployees/profile/${user.id}`,
                {
                    ...employeeData,
                    address: {
                        regionCode: employeeData.regionCode,
                        mobile: employeeData.mobile,
                        houseNumber: employeeData.houseNumber,
                        addressLine1: employeeData.addressLine1,
                        addressLine2: employeeData.addressLine2,
                        region: employeeData.region,
                        district: employeeData.district,
                        state: employeeData.state,
                        pincode: employeeData.pincode
                    }
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            toast.success("Profile updated successfully!");
            setIsEditingProfile(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
            toast.error("Failed to update profile");
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Filter orders based on active tab
    const pendingOrders = orders.filter(order => !order.deliveryCompleted);
    const completedOrders = orders.filter(order => order.deliveryCompleted);

    // Function to render product size correctly
    const renderSize = (product) => {
        const category = product.category?.toLowerCase() || "";
        if (category.includes("home")) {
            const inchesValue = product.sizeInches || product.inches || product.dimensions;
            return inchesValue ? `${inchesValue} inches` : "N/A";
        }
        return product.selectedSize || product.size || "N/A";
    };

    if (loading) return (
        <div className="delivery-employee-loading-state">
            <div className="delivery-loading-spinner"></div>
            <p>Loading orders...</p>
        </div>
    );

    if (error) return <div className="delivery-employee-error-state">{error}</div>;

    return (
        <div className="delivery-employee-dashboard">
            {/* Sidebar */}
            <div className={`delivery-employee-sidebar ${sidebarOpen ? 'delivery-sidebar-expanded' : 'delivery-sidebar-collapsed'}`}>
                <div className="delivery-sidebar-header">
                    <h2>Delivery Portal</h2>
                    <button
                        className="delivery-sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <span className="delivery-toggle-icon">
                            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
                        </span>
                    </button>
                </div>

                <div className="delivery-sidebar-content">
                    <div className="delivery-user-welcome">
                        <div className="delivery-user-avatar" id="avatar">
                            <FaUser className="delivery-avatar-icon" />
                        </div>
                        <div className="delivery-user-info">
                            <p className="delivery-welcome-text">Welcome back,</p>
                            <p className="delivery-username">{employeeData.name || user?.name || 'Employee'}</p>
                        </div>
                    </div>

                    <nav className="delivery-sidebar-nav">
                        <button
                            className={`delivery-nav-item ${activeTab === 'assigned' ? 'delivery-nav-active' : ''}`}
                            onClick={() => setActiveTab('assigned')}
                        >
                            <FaTasks className="delivery-nav-icon" />
                            {sidebarOpen && <span>Assigned Tasks</span>}
                        </button>

                        <button
                            className={`delivery-nav-item ${activeTab === 'completed' ? 'delivery-nav-active' : ''}`}
                            onClick={() => setActiveTab('completed')}
                        >
                            <FaCheckCircle className="delivery-nav-icon" />
                            {sidebarOpen && <span>Completed Orders</span>}
                        </button>

                        <button
                            className={`delivery-nav-item ${activeTab === 'profile' ? 'delivery-nav-active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <FaUser className="delivery-nav-icon" />
                            {sidebarOpen && <span>My Profile</span>}
                        </button>
                    </nav>
                </div>

                <div className="delivery-sidebar-footer">
                    <button className="delivery-logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt className="delivery-logout-icon" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="delivery-main-content-area">
                {/* Stats Cards */}
                <div className="delivery-performance-cards">
                    <div className="delivery-stat-card delivery-pending-card">
                        <div className="delivery-stat-icon">
                            <FaClock className="delivery-card-icon" />
                        </div>
                        <div className="delivery-stat-content">
                            <h3>{pendingOrders.length}</h3>
                            <p>Pending Deliveries</p>
                        </div>
                    </div>

                    <div className="delivery-stat-card delivery-completed-card">
                        <div className="delivery-stat-icon">
                            <FaCheck className="delivery-card-icon" />
                        </div>
                        <div className="delivery-stat-content">
                            <h3>{completedOrders.length}</h3>
                            <p>Completed Deliveries</p>
                        </div>
                    </div>

                    <div className="delivery-stat-card delivery-total-card">
                        <div className="delivery-stat-icon">
                            <FaBox className="delivery-card-icon" />
                        </div>
                        <div className="delivery-stat-content">
                            <h3>{orders.length}</h3>
                            <p>Total Assigned</p>
                        </div>
                    </div>
                </div>

                {/* Content based on active tab */}
                <div className="delivery-content-panel">
                    {activeTab === 'assigned' && (
                        <div className="delivery-tab-content">
                            <h2 className="delivery-tab-title">My Assigned Tasks</h2>
                            {pendingOrders.length === 0 ? (
                                <div className="delivery-empty-state">
                                    <FaBox className="delivery-empty-icon" />
                                    <p>No pending orders assigned yet.</p>
                                </div>
                            ) : (
                                <div className="delivery-orders-grid">
                                    {pendingOrders.map((order) => (
                                        <DeliveryOrderCard
                                            key={order._id}
                                            order={order}
                                            onMarkDelivered={handleMarkDelivered}
                                            renderSize={renderSize}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'completed' && (
                        <div className="delivery-tab-content">
                            <h2 className="delivery-tab-title">Completed Orders</h2>
                            {completedOrders.length === 0 ? (
                                <div className="delivery-empty-state">
                                    <FaCheckCircle className="delivery-empty-icon" />
                                    <p>No completed orders yet.</p>
                                </div>
                            ) : (
                                <div className="delivery-orders-grid">
                                    {completedOrders.map((order) => (
                                        <DeliveryOrderCard
                                            key={order._id}
                                            order={order}
                                            onMarkDelivered={handleMarkDelivered}
                                            renderSize={renderSize}
                                            isCompleted={true}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="delivery-tab-content">
                            <h2 className="delivery-tab-title">My Profile</h2>
                            <div className="delivery-profile-card">
                                <div className="delivery-profile-header">
                                    <div className="delivery-profile-avatar">
                                        <FaUser className="delivery-avatar-large" />
                                    </div>
                                    <div className="delivery-profile-info">
                                        <h3>{employeeData.name || 'Delivery Employee'}</h3>
                                        <p className="delivery-profile-email">
                                            <FaEnvelope className="delivery-info-icon" />
                                            {employeeData.email || user?.email || 'N/A'}
                                        </p>
                                        <p className="delivery-profile-role">
                                            <FaBriefcase className="delivery-info-icon" />
                                            {employeeData.designation || 'Delivery Personnel'}
                                        </p>
                                        <p className="delivery-profile-id">
                                            <FaIdCard className="delivery-info-icon" />
                                            ID: {employeeData.employeeId || 'N/A'}
                                        </p>
                                    </div>
                                    <button
                                        className="delivery-edit-profile-btn"
                                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                                    >
                                        {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                </div>

                                {!isEditingProfile ? (
                                    <div className="delivery-profile-details">

                                        {/* Personal Information */}
                                        <div className="delivery-info-section">
                                            <h4 className="delivery-section-title">
                                                <FaUser className="delivery-section-icon" />
                                                Personal Information
                                            </h4>
                                            <div className="delivery-info-grid">
                                                <div className="delivery-info-item">
                                                    <span className="delivery-info-label">Employee ID:</span>
                                                    <span className="delivery-info-value">
                                                        {employeeData.employeeId || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="delivery-info-item">
                                                    <span className="delivery-info-label">Date of Joining:</span>
                                                    <span className="delivery-info-value">
                                                        {employeeData.dateOfJoining ?
                                                            new Date(employeeData.dateOfJoining).toLocaleDateString() : 'N/A'
                                                        }
                                                    </span>
                                                </div>
                                                <div className="delivery-info-item">
                                                    <span className="delivery-info-label">Department:</span>
                                                    <span className="delivery-info-value">{employeeData.department || 'Delivery'}</span>
                                                </div>
                                                <div className="delivery-info-item">
                                                    <span className="delivery-info-label">Designation:</span>
                                                    <span className="delivery-info-value">{employeeData.designation || 'Delivery Executive'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div className="delivery-info-section">
                                            <h4 className="delivery-section-title">
                                                <FaPhone className="delivery-section-icon" />
                                                Contact Information
                                            </h4>
                                            <div className="delivery-info-grid">
                                                <div className="delivery-info-item">
                                                    <span className="delivery-info-label">Mobile:</span>
                                                    <span className="delivery-info-value">
                                                        {employeeData.regionCode} {employeeData.mobile || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="delivery-info-item">
                                                    <span className="delivery-info-label">Email:</span>
                                                    <span className="delivery-info-value">{employeeData.email || user?.email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Details */}
                                        <div className="delivery-info-section">
                                            <h4 className="delivery-section-title">
                                                <FaHome className="delivery-section-icon" />
                                                Address Details
                                            </h4>
                                            <div className="delivery-info-grid">
                                                <div className="delivery-info-item delivery-full-width">
                                                    <span className="delivery-info-label">Address:</span>
                                                    <span className="delivery-info-value">
                                                        {employeeData.houseNumber ?
                                                            `${employeeData.houseNumber}, ${employeeData.addressLine1}, ${employeeData.addressLine2}, ${employeeData.district || ''}, ${employeeData.state || ''}, ${employeeData.region || ''} - ${employeeData.pincode || ''}`.replace(/, ,/g, ', ').replace(/, $/, '')
                                                            : 'N/A'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Employment Details */}
                                        <div className="delivery-info-section">
                                            <h4 className="delivery-section-title">
                                                <FaBriefcase className="delivery-section-icon" />
                                                Employment Details
                                            </h4>
                                            <div className="delivery-info-grid">
                                                <div className="delivery-info-item">
                                                    <span className="delivery-info-label">Employment Type:</span>
                                                    <span className="delivery-info-value">{employeeData.employmentType || 'Full-time'}</span>
                                                </div>
                                                <div className="delivery-info-item">
                                                    <span className="delivery-info-label">Shift Timings:</span>
                                                    <span className="delivery-info-value">{employeeData.shiftTimings || '9:00 AM - 6:00 PM'}</span>
                                                </div>
                                                <div className="delivery-info-item">
                                                    <span className="delivery-info-label">Vehicle Number:</span>
                                                    <span className="delivery-info-value">{employeeData.vehicleNumber || 'N/A'}</span>
                                                </div>
                                                <div className="delivery-info-item">
                                                    <span className="delivery-info-label">Supervisor:</span>
                                                    <span className="delivery-info-value">{employeeData.supervisor || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <form className="delivery-profile-form" onSubmit={handleProfileUpdate}>
                                        {/* Contact Information */}
                                        <div className="delivery-form-section">
                                            <h4 className="delivery-form-section-title">
                                                <FaPhone className="delivery-section-icon" />
                                                Contact Information
                                            </h4>
                                            <div className="delivery-form-row">
                                                <div className="delivery-form-group">
                                                    <label>Region Code</label>
                                                    <select
                                                        name="regionCode"
                                                        value={employeeData.regionCode}
                                                        onChange={handleProfileChange}
                                                        className="delivery-form-input"
                                                    >
                                                        <option value="+91">+91 (India)</option>
                                                        <option value="+1">+1 (USA)</option>
                                                        <option value="+44">+44 (UK)</option>
                                                        <option value="+61">+61 (Australia)</option>
                                                        <option value="+81">+81 (Japan)</option>
                                                        <option value="+49">+49 (Germany)</option>
                                                        <option value="+86">+86 (China)</option>
                                                    </select>
                                                </div>
                                                <div className="delivery-form-group">
                                                    <label>Mobile Number</label>
                                                    <input
                                                        type="text"
                                                        name="mobile"
                                                        value={employeeData.mobile}
                                                        onChange={handleProfileChange}
                                                        className="delivery-form-input"
                                                        placeholder="Enter mobile number"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Details */}
                                        <div className="delivery-form-section">
                                            <h4 className="delivery-form-section-title">
                                                <FaHome className="delivery-section-icon" />
                                                Address Details
                                            </h4>
                                            <div className="delivery-form-group">
                                                <label>House/Apartment Number</label>
                                                <input
                                                    type="text"
                                                    name="houseNumber"
                                                    value={employeeData.houseNumber}
                                                    onChange={handleProfileChange}
                                                    className="delivery-form-input"
                                                    placeholder="Enter house number"
                                                />
                                            </div>
                                            <div className="delivery-form-group">
                                                <label>Street Name/Area</label>
                                                <input
                                                    type="text"
                                                    name="addressLine1"
                                                    value={employeeData.addressLine1}
                                                    onChange={handleProfileChange}
                                                    className="delivery-form-input"
                                                    placeholder="Enter Street Name"
                                                />
                                            </div>
                                            <div className="delivery-form-group">
                                                <label>Nearby Landmark</label>
                                                <input
                                                    type="text"
                                                    name="addressLine2"
                                                    value={employeeData.addressLine2}
                                                    onChange={handleProfileChange}
                                                    className="delivery-form-input"
                                                    placeholder="Enter house number"
                                                />
                                            </div>
                                            <div className="delivery-form-row">
                                                <div className="delivery-form-group">
                                                    <label>Region/Area</label>
                                                    <input
                                                        type="text"
                                                        name="region"
                                                        value={employeeData.region}
                                                        onChange={handleProfileChange}
                                                        className="delivery-form-input"
                                                        placeholder="Enter region"
                                                    />
                                                </div>
                                                <div className="delivery-form-group">
                                                    <label>District</label>
                                                    <input
                                                        type="text"
                                                        name="district"
                                                        value={employeeData.district}
                                                        onChange={handleProfileChange}
                                                        className="delivery-form-input"
                                                        placeholder="Enter district"
                                                    />
                                                </div>
                                            </div>
                                            <div className="delivery-form-row">
                                                <div className="delivery-form-group">
                                                    <label>State</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={employeeData.state}
                                                        onChange={handleProfileChange}
                                                        className="delivery-form-input"
                                                        placeholder="Enter state"
                                                    />
                                                </div>
                                                <div className="delivery-form-group">
                                                    <label>Pincode</label>
                                                    <input
                                                        type="text"
                                                        name="pincode"
                                                        value={employeeData.pincode}
                                                        onChange={handleProfileChange}
                                                        className="delivery-form-input"
                                                        placeholder="Enter pincode"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="delivery-form-actions">
                                            <button type="submit" className="delivery-save-profile-btn">
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Updated Order Card Component with complete product details
const DeliveryOrderCard = ({ order, onMarkDelivered, renderSize, isCompleted = false }) => {
    const [expanded, setExpanded] = useState(false);
    const [expandedProducts, setExpandedProducts] = useState({});

    const toggleProductDetails = (orderId, index) => {
        const key = `${orderId}-${index}`;
        setExpandedProducts(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const addr = order.userDetails
        ? `${order.userDetails.houseNumber || ""}, ${order.userDetails.addressLine1 || ""}, ${order.userDetails.addressLine2 || ""}, ${order.userDetails.district || ""}, ${order.userDetails.state || ""}, ${order.userDetails.region || ""} - ${order.userDetails.pincode || ""}`
        : "N/A";

    const phone =
        order.userDetails?.mobile ||
        order.userDetails?.phone ||
        order.userDetails?.phoneNumber || "N/A";

    return (
        <div className={`delivery-order-item ${isCompleted ? 'delivery-order-completed' : ''}`}>
            <div className="delivery-order-header" onClick={() => setExpanded(!expanded)}>
                <div className="delivery-order-basic">
                    <h4>Order ID: {order._id}</h4>
                    <p className="delivery-order-date">
                        <FaCalendarAlt className="delivery-calendar-icon" />{" "}
                        {order.deliveryDate
                            ? new Date(order.deliveryDate).toLocaleDateString()
                            : "Delivery Date: N/A"}
                    </p>
                    <div className="delivery-order-meta">
                        <span className="delivery-payment-method">{order.paymentMethod}</span>
                        <span className={`delivery-payment-status ${order.paymentStatus?.toLowerCase()}`}>
                            {order.paymentStatus}
                        </span>
                    </div>
                </div>
                <div className="delivery-order-status">
                    <span className={`delivery-status-badge ${isCompleted ? 'delivery-status-completed' : 'delivery-status-pending'}`}>
                        {isCompleted ? 'Delivered' : 'Pending Delivery'}
                    </span>
                    <span className="delivery-total-amount">
                        <FaShoppingCart className="delivery-amount-icon" />
                        {order.currency} {order.totalAmount}
                    </span>
                    <span className="delivery-expand-icon">{expanded ? <FaChevronUp /> : <FaChevronDown />}</span>
                </div>
            </div>

            {expanded && (
                <div className="delivery-order-details">
                    {/* User Details Section */}
                    <div className="delivery-user-details">
                        <h5 className="delivery-section-title">
                            <FaUser className="delivery-section-icon" />
                            Customer Details
                        </h5>
                        <div className="delivery-customer-info">
                            <div className="delivery-customer-detail">
                                <strong>Name:</strong> {order.userDetails?.name || "N/A"}
                            </div>
                            <div className="delivery-customer-detail">
                                <strong>Email:</strong> {order.userDetails?.email || "N/A"}
                            </div>
                            <div className="delivery-customer-detail">
                                <strong>Phone:</strong> {phone}
                            </div>
                            <div className="delivery-customer-detail delivery-full-width">
                                <strong>Address:</strong> {addr}
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="delivery-products-section">
                        <h5 className="delivery-section-title">
                            <FaBox className="delivery-section-icon" />
                            Products ({order.products?.length || 0})
                        </h5>
                        <div className="delivery-products-list">
                            {order.products?.map((p, idx) => {
                                const key = `${order._id}-${idx}`;
                                const isExpanded = expandedProducts[key];
                                return (
                                    <div key={idx} className="delivery-product-item">
                                        <div
                                            className="delivery-product-summary"
                                            onClick={() => toggleProductDetails(order._id, idx)}
                                        >
                                            <div className="delivery-product-basic">
                                                <span className="delivery-product-name">{p.name}</span>
                                                <span className="delivery-product-quantity-price">
                                                    {p.qty} × {order.currency} {p.discountedPrice || p.originalPrice}
                                                </span>
                                            </div>
                                            <span className="delivery-product-toggle">
                                                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                            </span>
                                        </div>
                                        {isExpanded && (
                                            <div className="delivery-product-details">
                                                <div className="delivery-product-detail-grid">
                                                    {Object.entries(p).map(([key, value]) => {
                                                        const allowedKeys = [
                                                            "productId", "category", "subCategory", "subSubCategory", "brand",
                                                            "size", "selectedSize", "color", "material", "fit", "ram", "storage",
                                                            "type", "processor", "displaySize", "battery", "camera", "screenSize",
                                                            "inchs", "skinType", "hairType", "fragranceType", "language", "author",
                                                            "genre", "format", "packSize", "organic", "model", "power", "capacity",
                                                            "weight", , "total"
                                                        ];
                                                        // 🔥 CORE FIX — hide "size" if selectedSize exists
                                                        if (key === "size" && p.selectedSize) return null;


                                                        if (!allowedKeys.includes(key)) return null;
                                                        if (value === null || value === undefined || value === "") return null;

                                                        // Format key name for readability (e.g., "ram" => "RAM")
                                                        const formattedKey = key.replace(/([A-Z])/g, " $1")
                                                            .replace(/^./, (str) => str.toUpperCase());


                                                        // Handle arrays (e.g., ["8GB", "16GB"])
                                                        const formattedValue = Array.isArray(value) ? value.join(", ") : value;

                                                        return (
                                                            <div key={key} className="delivery-product-detail">
                                                                <span className="delivery-detail-label">{formattedKey}:</span>
                                                                <span className="delivery-detail-value" >{formattedValue}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {p.stock !== undefined && p.stock <= 0 && (
                                                    <div className="delivery-out-of-stock">
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

                    {/* Order Summary */}
                    <div className="delivery-order-summary">
                        <h5 className="delivery-section-title">
                            <FaDollarSign className="delivery-section-icon" />
                            Order Summary
                        </h5>
                        <div className="delivery-summary-details">
                            <div className="delivery-summary-item">
                                <span>Subtotal:</span>
                                <span>{order.currency} {order.totalAmount}</span>
                            </div>
                            <div className="delivery-summary-item">
                                <span>Payment Method:</span>
                                <span className="delivery-payment-method-display">{order.paymentMethod}</span>
                            </div>
                            <div className="delivery-summary-item">
                                <span>Payment Status:</span>
                                <span className={`delivery-payment-status-display ${order.paymentStatus?.toLowerCase()}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mark Delivered or Completed Tag */}
                    {!isCompleted && (
                        <div className="delivery-order-actions">
                            <button
                                onClick={() => onMarkDelivered(order._id)}
                                className="delivery-mark-delivered-btn"
                            >
                                <FaCheck className="delivery-btn-icon" />
                                Mark as Delivered
                            </button>
                        </div>
                    )}
                    {isCompleted && (
                        <div className="delivery-completed-tag">
                            <FaCheckCircle className="delivery-completed-icon" />
                            Delivered on {new Date(order.updatedAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeliveryEmployeeDashboard;
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaShippingFast,
  FaTruck,
  FaCheckCircle,
  FaBell,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaBox,
  FaWarehouse,
  FaFileContract,
  FaTimesCircle
} from "react-icons/fa";
import ShippingTab from "./ShippingTab";
import DeliveryTab from "./DeliveryTab";
import CompletedOrdersTab from "./CompletedOrdersTab";
import CancelOrderTab from "./CancelOrderTab"; // Add this
import NotificationsTab from "./NotificationsTab";
import PurchaseProducts from "../pages/PurchaseProducts";
import ReturnPolicyRequests from "../pages/ReturnPolicyRequests"; // Import the Return Policy component
import "../styles/WarehouseManagement.css";

const WarehouseManagement = () => {
  const { user, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("shipping");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [warehouseName, setWarehouseName] = useState("");
  const [pendingCancellations, setPendingCancellations] = useState(0);

  const navigate = useNavigate();

  const storedUser = JSON.parse(sessionStorage.getItem("user"));
  const warehouseId =
    user?.warehouseId ||
    storedUser?.warehouseId ||
    sessionStorage.getItem("warehouseId") ||
    null;

  useEffect(() => {
    if (warehouseId && !sessionStorage.getItem("warehouseId")) {
      sessionStorage.setItem("warehouseId", warehouseId);
    }

    if (!warehouseId) {
      setError("Warehouse ID not found. Please login again.");
      return;
    }

    const fetchWarehouseName = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/warehouse/${warehouseId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        if (res.data?.name) {
          setWarehouseName(res.data.name);
          sessionStorage.setItem("warehouseName", res.data.name);
        }
      } catch (err) {
        console.error("Failed to fetch warehouse name:", err);
      }
    };

    fetchWarehouseName();
  }, [user, warehouseId]);

  const fetchOrders = async () => {
    if (!warehouseId) {
      setError("Warehouse ID not found. Please login again.");
      return;
    }
    setError("");

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/warehouse-management/status/${warehouseId}`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      if (res.data) {
        const allOrders = res.data.incomplete.concat(res.data.completed || []);

        const mainOrders = [];
        const remainingOrders = [];
        const deliveredList = [];
        const completedList = [];

        allOrders.forEach((order) => {
          if (order.shippingCompleted && !order.deliveryCompleted) {
            deliveredList.push(order);
          }

          if (order.deliveryCompleted) {
            completedList.push(order);
          }

          let hasMain = false;
          let hasRemaining = false;

          order.products.forEach((p) => {
            p.warehouseAllocations.forEach((w) => {
              if (w.warehouseId.toString() === warehouseId) {
                if (w.warehouseType === "Main Warehouse") {
                  hasMain = true;

                  const updatedProducts = order.products
                    .map((prod) => {
                      const mainAlloc = prod.warehouseAllocations.find(
                        (alloc) =>
                          alloc.warehouseId.toString() === warehouseId &&
                          alloc.warehouseType === "Main Warehouse"
                      );
                      if (!mainAlloc) return null;

                      const remainingAlloc = prod.warehouseAllocations.find(
                        (alloc) => alloc.warehouseType === "Remaining Warehouse"
                      );

                      return {
                        ...prod,
                        notificationMsg: remainingAlloc
                          ? `Request from ${remainingAlloc.name} Warehouse for ${mainAlloc.qty} of ${prod.name}`
                          : `Product allocation for ${mainAlloc.qty} of ${prod.name}`,
                        notificationStatus: mainAlloc.notificationStatus || "Allocated",
                        allocationId: mainAlloc._id,
                        isMainWarehouse: true,
                      };
                    })
                    .filter(Boolean);

                  if (updatedProducts.length > 0) {
                    const existingOrderIndex = remainingOrders.findIndex(o => o._id === order._id);
                    if (existingOrderIndex === -1) {
                      remainingOrders.push({
                        ...order,
                        products: updatedProducts,
                        isMainWarehouseOrder: true
                      });
                    }
                  }
                }

                if (w.warehouseType === "Remaining Warehouse") hasRemaining = true;
              }
            });
          });

          if (!order.shippingCompleted && hasMain) {
            const filteredOrder = {
              ...order,
              products: order.products.map(p => ({
                ...p,
                warehouseAllocations: p.warehouseAllocations ? p.warehouseAllocations.map(alloc => ({
                  ...alloc,
                  displayStatus: alloc.warehouseType === "Main Warehouse" ? false : true
                })) : p.warehouseAllocations
              }))
            };
            mainOrders.push(filteredOrder);
          }

          if (hasRemaining) {
            const updatedProducts = order.products
              .map((p) => {
                const remainingAlloc = p.warehouseAllocations.find(
                  (w) =>
                    w.warehouseId.toString() === warehouseId &&
                    w.warehouseType === "Remaining Warehouse"
                );
                if (!remainingAlloc) return null;

                const mainAlloc = p.warehouseAllocations.find(
                  (w) => w.warehouseType === "Main Warehouse"
                );

                return {
                  ...p,
                  notificationMsg: mainAlloc
                    ? `${mainAlloc.name} Warehouse requested ${remainingAlloc.qty} of ${p.name}`
                    : `Main warehouse requested ${remainingAlloc.qty} of ${p.name}`,
                  notificationStatus: remainingAlloc.notificationStatus || "Requested",
                  allocationId: remainingAlloc._id,
                  isRemainingWarehouse: true,
                };
              })
              .filter(Boolean);

            const existingOrderIndex = remainingOrders.findIndex(o => o._id === order._id);
            if (existingOrderIndex === -1) {
              remainingOrders.push({
                ...order,
                products: updatedProducts,
                isRemainingWarehouseOrder: true
              });
            } else {
              const existingProducts = remainingOrders[existingOrderIndex].products;
              const newProducts = [...existingProducts, ...updatedProducts];
              remainingOrders[existingOrderIndex].products = newProducts;
            }
          }
        });

        setOrders(mainOrders);
        setDeliveredOrders(deliveredList);
        setCompletedOrders(completedList);
        setNotifications(remainingOrders);
      }
    } catch (err) {
      console.error("Fetch Warehouse Orders Error:", err);
      setError("Failed to fetch orders. Try again later.");
    }
    const cancelRes = await axios.get(
      `${API_BASE_URL}/api/warehouse-management/cancellations/${warehouseId}`,
      { headers: { Authorization: `Bearer ${user?.token}` } }
    );

    if (cancelRes.data?.canceledOrders) {
      const pendingCancel = cancelRes.data.canceledOrders.filter(
        (o) => o.cancellationStatus === "processing" || o.cancellationStatus === "approved"
      ).length;

      setPendingCancellations(pendingCancel);
    }

  };

  useEffect(() => {
    fetchOrders();
  }, [warehouseId]);

  const handleAcceptRequest = async (orderId, allocationId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/warehouse-management/notification/accept/${orderId}/${warehouseId}/${allocationId}`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      toast.success("Request accepted!");
      fetchOrders();
    } catch (err) {
      console.error("Accept Request Error:", err);
      toast.error("Failed to accept request. Try again.");
    }
  };

  const fetchDeliveryEmployees = async () => {
    if (!warehouseId) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/warehouse-management/delivery-employees/${warehouseId}`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to fetch delivery employees:", err);
    }
  };

  useEffect(() => {
    fetchDeliveryEmployees();
  }, [warehouseId]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarItems = [
    { id: "shipping", label: "Shipping Orders", icon: <FaShippingFast /> },
    { id: "delivery", label: "Delivery Orders", icon: <FaTruck /> },
    { id: "completed", label: "Completed Orders", icon: <FaCheckCircle /> },
    {
      id: "cancellations",
      label: `Cancellation Orders ${pendingCancellations > 0 ? ` (${pendingCancellations})` : ""}`,
      icon: <FaTimesCircle />,
    },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "employees", label: "Employees", icon: <FaUsers /> },
    { id: "products", label: "Products", icon: <FaBox /> },
    { id: "returnpolicy", label: "Return Policy", icon: <FaFileContract /> },
  ];

  return (
    <div className="warehouse-management-container">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="warehouse-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`warehouse-sidebar ${sidebarOpen ? 'warehouse-sidebar-open' : ''}`}>
        <div className="warehouse-sidebar-header">
          <div className="warehouse-sidebar-title">
            <FaWarehouse className="warehouse-sidebar-title-icon" />
            <h3>Warehouse Manager</h3>
          </div>
          <button className="warehouse-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="warehouse-sidebar-content">
          <div className="warehouse-info">
            <h4>{warehouseName}</h4>
            <p>Warehouse Management System</p>
          </div>

          <nav className="warehouse-sidebar-nav">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`warehouse-sidebar-item ${activeTab === item.id ? 'warehouse-sidebar-active' : ''}`}
                onClick={() => {
                  if (item.id === 'employees') {
                    navigate('/deliverymanager');
                  } else {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }
                }}
              >
                <span className="warehouse-sidebar-icon">{item.icon}</span>
                <span className="warehouse-sidebar-label">{item.label}</span>
              </button>
            ))}

            <button className="warehouse-sidebar-item warehouse-logout-btn" onClick={handleLogout}>
              <span className="warehouse-sidebar-icon"><FaSignOutAlt /></span>
              <span className="warehouse-sidebar-label">Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="warehouse-main-content">
        <header className="warehouse-content-header">
          <button className="warehouse-sidebar-toggle" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
          <div className="warehouse-header-title">
            <h2>Warehouse Management</h2>
            {warehouseName && <p>Welcome to {warehouseName}</p>}
          </div>
          <div className="warehouse-user-info">
            <FaUser className="warehouse-user-icon" />
            <span>{user?.name || storedUser?.name || 'User'}</span>
          </div>
        </header>

        <div className="warehouse-content-body">
          {/* Mobile Tabs */}
          <div className="warehouse-mobile-tabs">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`warehouse-mobile-tab ${activeTab === item.id ? 'warehouse-tab-active' : ''}`}
                onClick={() => {
                  if (item.id === 'employees') {
                    navigate('/deliverymanager');
                  } else {
                    setActiveTab(item.id);
                  }
                }}
              >
                <span className="warehouse-mobile-tab-icon">{item.icon}</span>
                <span className="warehouse-mobile-tab-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Tabs */}
          <div className="warehouse-desktop-tabs">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`warehouse-desktop-tab ${activeTab === item.id ? 'warehouse-tab-active' : ''}`}
                onClick={() => {
                  if (item.id === 'employees') {
                    navigate('/deliverymanager');
                  } else {
                    setActiveTab(item.id);
                  }
                }}
              >
                <span className="warehouse-desktop-tab-icon">{item.icon}</span>
                <span className="warehouse-desktop-tab-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="warehouse-error-alert">
              <span>{error}</span>
            </div>
          )}

          {/* Content Areas */}
          <div className="warehouse-tab-content">
            {activeTab === "shipping" && (
              <ShippingTab
                orders={orders}
                warehouseId={warehouseId}
                user={user}
                onRefresh={fetchOrders}
                warehouseName={warehouseName}
              />
            )}

            {activeTab === "delivery" && (
              <DeliveryTab
                deliveredOrders={deliveredOrders}
                warehouseId={warehouseId}
                user={user}
                employees={employees}
                onRefresh={fetchOrders}
              />
            )}

            {activeTab === "completed" && (
              <CompletedOrdersTab
                completedOrders={completedOrders}
                warehouseId={warehouseId}
                employees={employees}
              />
            )}

            {activeTab === "cancellations" && (
              <CancelOrderTab
                warehouseId={warehouseId}
                user={user}
              />
            )}


            {activeTab === "notifications" && (
              <NotificationsTab
                notifications={notifications}
                onAcceptRequest={handleAcceptRequest}
                onRefresh={fetchOrders}
                warehouseId={warehouseId}
                user={user}
              />
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="warehouse-products-tab">
                <PurchaseProducts />
              </div>
            )}

            {/* Return Policy Tab */}
            {activeTab === "returnpolicy" && (
              <div className="warehouse-returnpolicy-tab">
                <ReturnPolicyRequests
                  warehouseId={warehouseId}
                  warehouseName={warehouseName}
                  user={user}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseManagement;
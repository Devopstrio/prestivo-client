import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ProductManagement from "./ProductManagement";
import CategoryManagement from "./CategoryManagement";
import ExistingProducts from "./ExistingProducts";
import ShippingDetails from "./ShippingDetails";
import DeliveryDetails from "./DeliveryDetails";
import Customization from "./Customization";
import CompanyDetails from "./CompanyDetails";
import UserCarts from "./UserCarts";
import Departments from "./Departments";
import Warehouse from "./Warehouse";
import PaymentDetails from "./PaymentDetails";
import axios from "axios";
import API_BASE_URL from "../config";
import { Link } from "react-router-dom";
import "../styles/AdminDashboard.css";

// ✅ React Icons
import {
  FaUsers, FaBoxOpen, FaListAlt, FaTruck,
  FaShippingFast, FaBuilding, FaShoppingCart,
  FaBars, FaTimes, FaUserCheck, FaUserPlus,
  FaUserShield, FaUser, FaArrowLeft,
  FaWarehouse, FaHeadset, FaMoneyCheckAlt
} from "react-icons/fa";

import {
  FiSettings,
} from "react-icons/fi";

// ✅ Chart.js imports
import { Pie, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
} from "chart.js";

// ✅ Register all necessary chart plugins including Filler
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [carts, setCarts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    price: 0,
    stock: 0,
    description: "",
    category: "",
    image: null,
  });
  const [activeSection, setActiveSection] = useState(
    sessionStorage.getItem("activeSection") || "users"
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    sessionStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  const [hideHeader, setHideHeader] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > lastScroll && currentScroll > 80) {
        // scrolling down → HIDE header
        setHideHeader(true);
      } else {
        // scrolling up → SHOW header
        setHideHeader(false);
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);



  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  // Enhanced role detection with warehouse role
  const getRole = (u) => {
    if (u.isAdmin) return "Admin";
    const userRole = u.role?.toLowerCase();
    if (userRole === "shipping") return "Shipping";
    if (userRole === "warehouse") return "Warehouse";
    if (userRole === "delivery") return "Delivery";
    if (userRole === "deliveryemployee") return "Delivery";
    if (userRole === "support") return "Support";
    if (userRole === "purchase") return "Purchase";
    return "User";
  };

  // Enhanced role badge system
  const getRoleBadge = (user) => {
    const role = getRole(user);

    if (role === "Admin") {
      return {
        label: "Admin",
        icon: <FaUserShield />,
        color: "admin"
      };
    }

    if (role === "Shipping") {
      return {
        label: "Shipping",
        icon: <FaShippingFast />,
        color: "shipping"
      };
    }

    if (role === "Warehouse") {
      return {
        label: "Warehouse",
        icon: <FaWarehouse />,
        color: "warehouse"
      };
    }

    if (role === "Delivery") {
      return {
        label: "Delivery",
        icon: <FaTruck />,
        color: "delivery"
      };
    }

    if (role === "Support") {
      return {
        label: "Support",
        icon: <FaHeadset />,
        color: "support"
      };
    }
    if (role === "Purchase") {
      return {
        label: "Purchase",
        icon: <FaMoneyCheckAlt />,
        color: "purchase",
      };
    }

    // Default to User
    return {
      label: "User",
      icon: <FaUser />,
      color: "user"
    };
  };

  // ✅ Fetch data
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.products || [];

      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchUsers = async () => {
    if (!user?.isAdmin) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchCarts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cart/admin/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCarts(res.data);
    } catch (err) {
      console.error("Failed to fetch carts:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const fetchDepartments = async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchUsers();
    fetchCarts();
    fetchOrders();
    fetchDepartments();

    setIsMobile(window.innerWidth < 992);
    setSidebarOpen(window.innerWidth >= 992);
  }, [user]);

  // ✅ Calculate user statistics
  const activeUsersCount = users.filter(u => u.isActive !== false).length;
  const totalUsersCount = users.length;

  // Calculate users created this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const usersThisMonth = users.filter(u => {
    const createdDate = new Date(u.createdAt || u.dateJoined || Date.now());
    return createdDate.getMonth() === currentMonth &&
      createdDate.getFullYear() === currentYear;
  }).length;

  // ✅ Chart Data with Warehouse role included
  const getProductChartData = () => ({
    labels: ["Total Products", "Categories"],
    datasets: [
      {
        label: "# of Products",
        data: [products.length, categories.length],
        backgroundColor: ['#522c72', '#ce2453'],
        borderWidth: 0,
        borderRadius: 6
      }
    ]
  });

  // Updated role chart data with Warehouse
  const getRoleChartData = () => {
    const adminCount = users.filter(u => getRole(u) === "Admin").length;
    const shippingCount = users.filter(u => getRole(u) === "Shipping").length;
    const warehouseCount = users.filter(u => getRole(u) === "Warehouse").length;
    const deliveryCount = users.filter(u => getRole(u) === "Delivery").length;
    const supportCount = users.filter(u => getRole(u) === "Support").length;
    const purchaseCount = users.filter(u => getRole(u) === "Purchase").length;
    const userCount = users.filter(u => getRole(u) === "User").length;

    return {
      labels: ["Admin", "Shipping", "Warehouse", "Delivery", "Support", "User", "Purchase"],
      datasets: [
        {
          label: "User Roles",
          data: [adminCount, shippingCount, warehouseCount, deliveryCount, supportCount, userCount, purchaseCount],
          backgroundColor: [
            '#522c72', // Admin - Purple
            '#962964', // Shipping - Dark Pink
            '#0066cc', // Warehouse - Blue
            '#ce2453', // Delivery - Red
            '#10b981', // Support - Green
            '#e79e57', // User - Orange
            'rgb(189, 123, 123)',
          ],
          borderWidth: 0,
          borderRadius: 6
        },
      ],
    };
  };

  const getCartChartData = () => ({
    labels: ["Users with Carts", "Users without Carts"],
    datasets: [
      {
        label: "User Carts",
        data: [
          new Set(carts.map(c => c.user?.email)).size,
          users.length - new Set(carts.map(c => c.user?.email)).size,
        ],
        backgroundColor: ['#522c72', '#e79e57'],
        borderWidth: 0,
        borderRadius: 6
      },
    ],
  });

  const shippingCompleted = orders.filter(o => o.shippingCompleted).length;
  const shippingPending = orders.filter(o => !o.shippingCompleted).length;
  const getShippingChartData = () => ({
    labels: ["Shipped Orders", "Pending Orders"],
    datasets: [
      {
        label: "Shipping Status",
        data: [shippingCompleted, shippingPending],
        backgroundColor: ['#522c72', '#ce2453'],
        borderWidth: 0,
        borderRadius: 6
      },
    ],
  });

  const deliveryCompleted = orders.filter(o => o.deliveryCompleted).length;
  const deliveryPending = orders.filter(o => !o.deliveryCompleted && o.shippingCompleted).length;
  const getDeliveryChartData = () => ({
    labels: ["Delivered Orders", "Pending Deliveries"],
    datasets: [
      {
        label: "Delivery Status",
        data: [deliveryCompleted, deliveryPending],
        backgroundColor: ['#522c72', '#e79e57'],
        borderWidth: 0,
        borderRadius: 6
      },
    ],
  });

  const getRedemptionChartData = () => ({
    labels: ["Completed", "Pending"],
    datasets: [
      {
        label: "Shipping",
        data: [shippingCompleted, shippingPending],
        borderColor: '#522c72',
        backgroundColor: 'rgba(82, 44, 114, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#522c72',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: "Delivery",
        data: [deliveryCompleted, deliveryPending],
        borderColor: '#e79e57',
        backgroundColor: 'rgba(231, 158, 87, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#e79e57',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
    ],
  });

  // ✅ Sidebar Menu
  const menuItems = [
    { key: "users", label: "Users", icon: <FaUsers /> },
    { key: "categories", label: "Manage Categories", icon: <FaListAlt /> },
    { key: "products", label: "Add Products", icon: <FaBoxOpen /> },
    { key: "existing", label: "Manage Products", icon: <FaBoxOpen /> },
    { key: "shipping", label: "Shipping Details", icon: <FaShippingFast /> },
    { key: "delivery", label: "Delivery Details", icon: <FaTruck /> },
    { key: "payments", label: "Payment Details", icon: <FaMoneyCheckAlt /> },
    { key: "company", label: "Company Details", icon: <FaBuilding /> },
    { key: "customization", label: "Customization", icon: <FiSettings /> },
    { key: "carts", label: "User Carts", icon: <FaShoppingCart /> },
    { key: "departments", label: "Departments", icon: <FaUser /> },
    { key: "warehouse", label: "Warehouse", icon: <FaWarehouse /> },
  ];

  return (
    <div className="admin-new-dashboard">
      {/* Mobile overlay to close sidebar when clicking outside */}
      {isMobile && sidebarOpen && (
        <div className="admin-mobile-overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Toggle */}
      <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div className={`admin-new-sidebar ${sidebarOpen ? "admin-open" : "admin-collapsed"}`}>
        <h3 className="admin-menu-title">
          <FaUserShield className="admin-menu-icon" /> Admin Menu
        </h3>
        <ul className="admin-new-menu">
          {menuItems.map((item) => (
            <li key={item.key}>
              <div
                className={`admin-new-menu-item ${activeSection === item.key ? "admin-active" : ""}`}
                onClick={() => {
                  setActiveSection(item.key);
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <span className="admin-icon" style={{ color: "white" }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </li>
          ))}
          <li>
            <Link to={"/"} className="admin-back-link">
              <FaArrowLeft style={{ marginRight: "6px" }} />
              Back to Site
            </Link>
          </li>
        </ul>
      </div>

      {/* Main */}
      <div className="admin-new-main">
        <div className={`admin-new-header ${hideHeader ? "admin-header-hide" : ""}`}>
          <h2>Admin Dashboard</h2>
          {user && (
            <div className="admin-welcome-user">
              <FaUser style={{ marginRight: "6px" }} />
              Welcome, &nbsp;<strong>{user.name}</strong>
            </div>
          )}
        </div><br /><br /><br />

        {/* ✅ Default Dashboard (Users + Charts) */}
        {activeSection === "users" && (
          <div>
            {/* User Statistics Cards */}
            <div className="admin-user-stats-cards">
              <div className="admin-stat-card">
                <div className="admin-stat-icon admin-total-users">
                  <FaUsers />
                </div>
                <div className="admin-stat-content">
                  <h3>{totalUsersCount}</h3>
                  <p>Total Users</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon admin-active-users">
                  <FaUserCheck />
                </div>
                <div className="admin-stat-content">
                  <h3>{activeUsersCount}</h3>
                  <p>Active Users</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon admin-new-users">
                  <FaUserPlus />
                </div>
                <div className="admin-stat-content">
                  <h3>{usersThisMonth}</h3>
                  <p>New This Month</p>
                </div>
              </div>
            </div>

            <h3 className="users-heading">All Users</h3><br />
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <>
                <div className="admin-new-table-container">
                  <table className="admin-new-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const roleBadge = getRoleBadge(u);
                        return (
                          <tr key={u._id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td className="admin-role-cell">
                              <span className={`admin-role-badge admin-${roleBadge.color}-badge`}>
                                {roleBadge.icon}
                                {roleBadge.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ✅ All Dashboard Charts with Warehouse included */}
                <div className="admin-charts-container">
                  <div className="admin-chart-card">
                    <h4>User Roles</h4>
                    <div className="admin-chart-container">
                      <Pie
                        data={getRoleChartData()}
                        options={{
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                usePointStyle: true,
                                padding: 15
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-chart-card">
                    <h4>Shipping Status</h4>
                    <div className="admin-chart-container">
                      <Doughnut
                        data={getShippingChartData()}
                        options={{
                          rotation: -90,
                          circumference: 180,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-chart-card">
                    <h4>Delivery Status</h4>
                    <div className="admin-chart-container">
                      <Doughnut
                        data={getDeliveryChartData()}
                        options={{
                          rotation: -90,
                          circumference: 180,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-chart-card">
                    <h4>Products vs Categories</h4>
                    <div className="admin-chart-container">
                      <Pie
                        data={getProductChartData()}
                        options={{
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-chart-card">
                    <h4>Business Progress</h4>
                    <div className="admin-chart-container">
                      <Line
                        data={getRedemptionChartData()}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-chart-card">
                    <h4>User Carts</h4>
                    <div className="admin-chart-container">
                      <Pie
                        data={getCartChartData()}
                        options={{
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ✅ Other Sections */}
        {activeSection === "categories" && <CategoryManagement categories={categories} fetchCategories={fetchCategories} />}
        {activeSection === "products" && <ProductManagement products={products} categories={categories} fetchProducts={fetchProducts} productForm={productForm} setProductForm={setProductForm} editingProductId={editingProductId} setEditingProductId={setEditingProductId} />}
        {activeSection === "existing" && <ExistingProducts products={products} fetchProducts={fetchProducts} setEditingProductId={setEditingProductId} setProductForm={setProductForm} />}
        {activeSection === "shipping" && <ShippingDetails orders={orders} />}
        {activeSection === "delivery" && <DeliveryDetails orders={orders} />}
        {activeSection === "payments" && <PaymentDetails />}
        {activeSection === "carts" && <UserCarts allCarts={carts} />}
        {activeSection === "customization" && <Customization />}
        {activeSection === "company" && <CompanyDetails />}
        {activeSection === "departments" && (
          <Departments departments={departments} fetchDepartments={fetchDepartments} />
        )}
        {activeSection === "warehouse" && <Warehouse />}
      </div>
    </div>
  );
};

export default AdminDashboard;
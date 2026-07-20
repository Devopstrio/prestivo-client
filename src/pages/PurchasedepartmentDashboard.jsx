import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { 
  FaBox, 
  FaChartBar, 
  FaShoppingBasket, 
  FaTags, 
  FaPlus, 
  FaEdit,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaThList,
  FaLayerGroup,
  FaFolderOpen,
  FaStream    
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import StockDetectorTab from "./StockDetectorTab";
import AnalysisTab from "./AnalysisTab";
import PurchaseProducts from "./PurchaseProducts";
import CategoryManagement from "./CategoryManagement";
import ProductManagement from "./ProductManagement";
import ExistingProducts from "./ExistingProducts";
import "../styles/PurchaseDepartmentDashboard.css";

const PurchaseDepartmentDashboard = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    }
  };

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    closeSidebar();
  };

  // ✅ Logout function
  const handleLogout = () => {
  logout();
};


  // Tab content with animations
  const renderTabContent = () => {
    const tabProps = {
      categories,
      products,
      fetchCategories,
      fetchProducts
    };

    const tabComponents = {
      stock: <StockDetectorTab key="stock" />,
      analysis: <AnalysisTab key="analysis" />,
      products: <PurchaseProducts key="products" />,
      categorymanagement: <CategoryManagement key="category" {...tabProps} />,
      productmanagement: <ProductManagement key="product" {...tabProps} />,
      existingproduct: <ExistingProducts key="existing" {...tabProps} />
    };

    return (
      <div className={`pd-tab-content pd-tab-${activeTab}`}>
        {tabComponents[activeTab]}
      </div>
    );
  };

  return (
    <div className="purchase-dept-dashboard">
      {/* Mobile Sidebar Toggle */}
      <button className="pd-sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="pd-mobile-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`pd-sidebar ${isSidebarOpen ? "pd-open" : ""}`}>
        <div className="pd-sidebar-header">
          <h2 className="pd-sidebar-title"><FaLayerGroup className="pd-icon"/>Menus</h2>
        </div>
        
        <ul className="pd-menu">
          <li
            className={activeTab === "stock" ? "pd-active" : ""}
            onClick={() => handleTabChange("stock")}
          >
            <FaBox className="pd-icon" />
            <span className="pd-menu-text">Stock Detector</span>
          </li>
          <li
            className={activeTab === "analysis" ? "pd-active" : ""}
            onClick={() => handleTabChange("analysis")}
          >
            <FaChartBar className="pd-icon" />
            <span className="pd-menu-text">Analysis Report</span>
          </li>
          <li
            className={activeTab === "products" ? "pd-active" : ""}
            onClick={() => handleTabChange("products")}
          >
            <FaShoppingBasket className="pd-icon" />
            <span className="pd-menu-text">All Products</span>
          </li>
          <li
            className={activeTab === "categorymanagement" ? "pd-active" : ""}
            onClick={() => handleTabChange("categorymanagement")}
          >
            <FaTags className="pd-icon" />
            <span className="pd-menu-text">Add Category</span>
          </li>
          <li
            className={activeTab === "productmanagement" ? "pd-active" : ""}
            onClick={() => handleTabChange("productmanagement")}
          >
            <FaPlus className="pd-icon" />
            <span className="pd-menu-text">Add Product</span>
          </li>
          <li
            className={activeTab === "existingproduct" ? "pd-active" : ""}
            onClick={() => handleTabChange("existingproduct")}
          >
            <FaEdit className="pd-icon" />
            <span className="pd-menu-text">Edit Product</span>
          </li>
        </ul>

        {/* Logout Button */}
        <div className="pd-logout-section">
          <button 
            className={`pd-logout-btn ${isLoggingOut ? 'pd-logging-out' : ''}`}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <FaSignOutAlt className="pd-logout-icon" />
            <span className="pd-logout-text">
              {isLoggingOut ? 'Logging Out...' : 'Logout'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pd-main-content">
        <header className="pd-header">
          <h1 className="pd-main-title">Purchase Department Dashboard</h1>
          <div className="pd-user-info">
            <FaUserCircle className="pd-user-icon" />
            <span className="pd-welcome-text">Welcome, {user?.name || "User"}</span>
          </div>
        </header>

        <div className="pd-content-area">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default PurchaseDepartmentDashboard;
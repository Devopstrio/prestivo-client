import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "../styles/UserCarts.css";
import "../styles/LoadingAnimation.css";

// Import icons
import {
  FaShoppingCart, FaUser, FaEnvelope, FaBox,
  FaImage, FaSearch, FaFilter, FaSortAmountDown,
  FaSortAmountUp, FaEye, FaExclamationTriangle, FaSpinner
} from "react-icons/fa";

const getImageUrl = (img) => {
  if (!img) return "/placeholder.png";

  if (typeof img === "string") {
    if (img.startsWith("http") || img.startsWith("https")) return img;
    return `${API_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  }

  // If image is an object from MongoDB
  if (img.data && img.contentType) {
    // Convert binary object to base64
    const binary = new Uint8Array(img.data.data); // img.data.data is the raw array
    let binaryStr = "";
    for (let i = 0; i < binary.length; i++) {
      binaryStr += String.fromCharCode(binary[i]);
    }
    const base64String = btoa(binaryStr);
    return `data:${img.contentType};base64,${base64String}`;
  }

  return "/placeholder.png";
};

const UserCarts = ({ allCarts }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterDeleted, setFilterDeleted] = useState("all");

  const [isLoading, setIsLoading] = useState(true);

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Filter and sort carts
  const filteredCarts = allCarts
    .filter(cart => {
      const matchesSearch =
        cart.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterDeleted === "all" ||
        (filterDeleted === "available" && cart.product) ||
        (filterDeleted === "deleted" && !cart.product);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.user?.name || "";
          bValue = b.user?.name || "";
          break;
        case "email":
          aValue = a.user?.email || "";
          bValue = b.user?.email || "";
          break;
        case "product":
          aValue = a.product?.name || "";
          bValue = b.product?.name || "";
          break;
        case "qty":
          aValue = a.qty;
          bValue = b.qty;
          break;
        default:
          aValue = a.user?.name || "";
          bValue = b.user?.name || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleViewProduct = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  const getTotalItems = () => {
    return allCarts.reduce((total, cart) => total + cart.qty, 0);
  };

  const getTotalUsers = () => {
    return new Set(allCarts.map(cart => cart.user?.email)).size;
  };

  const getDeletedProducts = () => {
    return allCarts.filter(cart => !cart.product).length;
  };

  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading </h3>
          <p>Please wait while user carts are Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-management-container">
      <div className="cart-management-header">
        <h2 className="cart-management-title">
          <FaShoppingCart className="cart-management-title-icon" />
          User Cart Items
        </h2>
        <p className="cart-management-subtitle">Manage and view all user shopping carts</p>
      </div>

      {/* Statistics Cards */}
      <div className="cart-stats-cards">
        <div className="cart-stat-card cart-total-items">
          <div className="cart-stat-icon">
            <FaShoppingCart />
          </div>
          <div className="cart-stat-content">
            <h3>{allCarts.length}</h3>
            <p>Total Cart Items</p>
          </div>
        </div>

        <div className="cart-stat-card cart-total-products">
          <div className="cart-stat-icon">
            <FaBox />
          </div>
          <div className="cart-stat-content">
            <h3>{getTotalItems()}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="cart-stat-card cart-active-users">
          <div className="cart-stat-icon">
            <FaUser />
          </div>
          <div className="cart-stat-content">
            <h3>{getTotalUsers()}</h3>
            <p>Active Users</p>
          </div>
        </div>

        <div className="cart-stat-card cart-deleted-products">
          <div className="cart-stat-icon">
            <FaExclamationTriangle />
          </div>
          <div className="cart-stat-content">
            <h3>{getDeletedProducts()}</h3>
            <p>Deleted Products</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="cart-controls-container">
        <div className="cart-search-box">
          <FaSearch className="cart-search-icon" />
          <input
            type="text"
            placeholder="Search by user, email, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cart-search-input"
            style={{
              border: "none",
              outline: "none",
              boxShadow: "none"
            }}
          />
        </div>


        <div className="cart-filter-box">
          <FaFilter className="cart-filter-icon" />
          <select
            value={filterDeleted}
            onChange={(e) => setFilterDeleted(e.target.value)}
            className="cart-filter-select"
          >
            <option value="all">All Products</option>
            <option value="available">Available Only</option>
            <option value="deleted">Deleted Products</option>
          </select>
        </div>

        <div className="cart-sort-box">
          {sortOrder === "asc" ? <FaSortAmountDown className="cart-filter-icon" /> : <FaSortAmountUp className="cart-filter-icon" />}
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="cart-sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="product">Sort by Product</option>
            <option value="qty">Sort by Quantity</option>
          </select>
        </div>
      </div>

      {filteredCarts.length === 0 ? (
        <div className="cart-empty-state">
          <FaShoppingCart className="cart-empty-icon" />
          <p>No cart items found.</p>
          {searchTerm && <p>Try adjusting your search terms.</p>}
        </div>
      ) : (
        <div className="cart-table-container">
          <table className="cart-data-table">
            <thead>
              <tr>
                <th
                  className={sortBy === "name" ? "cart-active-sort" : ""}
                  onClick={() => handleSort("name")}
                >
                  <FaUser className="cart-header-icon" />
                  User
                  {sortBy === "name" && (
                    <span className="cart-sort-indicator">
                      {/* {sortOrder === "asc" ? "↑" : "↓"} */}
                    </span>
                  )}
                </th>
                <th
                  className={sortBy === "email" ? "cart-active-sort" : ""}
                  onClick={() => handleSort("email")}
                >
                  <FaEnvelope className="cart-header-icon" />
                  Email
                  {sortBy === "email" && (
                    <span className="cart-sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className={sortBy === "product" ? "cart-active-sort" : ""}
                  onClick={() => handleSort("product")}
                >
                  <FaBox className="cart-header-icon" />
                  Product
                  {sortBy === "product" && (
                    <span className="cart-sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className={sortBy === "qty" ? "cart-active-sort" : ""}
                  onClick={() => handleSort("qty")}
                >
                  Qty
                  {sortBy === "qty" && (
                    <span className="cart-sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th>
                  <FaImage className="cart-header-icon" />
                  Image
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarts.map((item, index) => (
                <tr key={index} className="cart-data-row">
                  <td className="cart-user-info" id="cart-user-info">
                    <div className="cart-user-name">{item.user?.name || "N/A"}</div>
                  </td>
                  <td className="cart-user-email" id="cart-user-info">{item.user?.email || "N/A"}</td>
                  <td className="cart-product-info">
                    {item.product ? (
                      <div className="user-cart-product-name">{item.product.name}</div>
                    ) : (
                      <div className="cart-deleted-product">
                        <FaExclamationTriangle className="cart-warning-icon" />
                        <span>Product deleted</span>
                      </div>
                    )}
                  </td>
                  <td className="cart-quantity">
                    <span className="cart-qty-badge">{item.qty}</span>
                  </td>
                  <td className="cart-product-image">
                    {item.product?.image ? (
                      <img
                        src={getImageUrl(item.product?.image)}
                        alt={item.product?.name || "Product"}
                        className="cart-product-img"
                      />

                    ) : (
                      <div className="cart-no-image">
                        <FaImage className="cart-no-image-icon" />
                        <span>No image</span>
                      </div>
                    )}
                  </td>

                  <td className="cart-actions">
                    <button
                      className="cart-view-btn"
                      onClick={() => handleViewProduct(item.product?._id)}
                      disabled={!item.product}
                      title={item.product ? "View Product Details" : "Product not available"}
                    >
                      <FaEye className="cart-btn-icon" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredCarts.length > 0 && (
        <div className="cart-pagination">
          <span className="cart-pagination-info">
            Showing {filteredCarts.length} of {allCarts.length} items
          </span>
        </div>
      )}
    </div>
  );
};

export default UserCarts;
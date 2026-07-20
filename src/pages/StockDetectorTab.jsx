// src/components/StockDetectorTab.jsx
import React, { useEffect, useState } from "react"; 
import axios from "axios";
import { 
  FaBox, 
  FaWarehouse, 
  FaMapMarkerAlt, 
  FaExclamationTriangle, 
  FaInfoCircle,
  FaSpinner,
  FaChartLine,
  FaBell,
  FaFilter,
  FaDownload,
  FaFileExcel
} from "react-icons/fa";
import API_BASE_URL from "../config";
import { exportStockDetectorToExcel } from "../templates/StockDetectorTabExcel";
import "../styles/StockDetectorTab.css";

const StockDetectorTab = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  // Festival time simulation
  const isFestivalTime = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    return month === 12 && date >= 20 && date <= 31;
  };

  const thresholdNormal = 30;
  const thresholdFestival = 60;
  const festivalTime = isFestivalTime();

  // ✅ Fetch categories function
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  // ✅ Fetch products function
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Enhanced search function for category, subcategory, subsubcategory
  const searchProducts = (product, searchTerm) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in product name
    if (product.name?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in category fields
    const categoryFields = [
      product.categoryId?.name || product.category,
      product.subCategory,
      product.subSubCategory
    ];
    
    // Check if any category field matches
    const categoryMatch = categoryFields.some(field => 
      field?.toLowerCase().includes(searchLower)
    );
    
    if (categoryMatch) {
      return true;
    }
    
    // Search in other product fields
    const otherFields = [
      product.brand,
      product.material,
      product.color,
      product.size?.join(' '), // Convert array to string
      product.ram?.join(' '),
      product.storage?.join(' '),
      product.type?.join(' '),
      product.description
    ];
    
    // Check if any other field matches
    const otherFieldsMatch = otherFields.some(field => 
      field?.toLowerCase().includes(searchLower)
    );
    
    return otherFieldsMatch;
  };

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products.filter(product => {
      const hasLowStock = product.warehouseStocks?.some(ws => 
        festivalTime ? ws.stock < thresholdFestival : ws.stock < thresholdNormal
      );
      return hasLowStock;
    });

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        searchProducts(product, searchTerm)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => {
        const productCategory = product.categoryId?.name || product.category;
        return productCategory?.trim().toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, festivalTime]);

  const getStockLevel = (stock) => {
    const threshold = festivalTime ? thresholdFestival : thresholdNormal;
    if (stock < threshold * 0.3) return 'critical';
    if (stock < threshold * 0.6) return 'warning';
    if (stock < threshold) return 'low';
    return 'adequate';
  };

  // ✅ Get categories from the fetched categories API
  const getCategories = () => {
    const categoryNames = categories
      .map(cat => cat.name?.trim())
      .filter(Boolean)
      .sort();

    const productCategories = [
      ...new Set(
        products
          .map(p => p.categoryId?.name || p.category)
          .filter(Boolean)
          .map(cat => cat.trim())
      )
    ].sort();

    const allCategories = [...new Set([...categoryNames, ...productCategories])];
    return allCategories;
  };

  // ✅ Get all subcategories and subsubcategories for search suggestions
  const getAllCategoryLevels = () => {
    const allLevels = {
      categories: new Set(),
      subCategories: new Set(),
      subSubCategories: new Set()
    };

    products.forEach(product => {
      // Add category
      if (product.categoryId?.name || product.category) {
        allLevels.categories.add(product.categoryId?.name || product.category);
      }
      
      // Add subcategory
      if (product.subCategory) {
        allLevels.subCategories.add(product.subCategory);
      }
      
      // Add subsubcategory
      if (product.subSubCategory) {
        allLevels.subSubCategories.add(product.subSubCategory);
      }
    });

    return {
      categories: Array.from(allLevels.categories).sort(),
      subCategories: Array.from(allLevels.subCategories).sort(),
      subSubCategories: Array.from(allLevels.subSubCategories).sort()
    };
  };

  // Excel Export Handler
  const handleExportToExcel = () => {
    const filters = {
      searchTerm,
      selectedCategory
    };
    
    exportStockDetectorToExcel(filteredProducts, filters, festivalTime, thresholdNormal, thresholdFestival, setIsExporting);
  };

  // Get category levels for debugging/info
  const categoryLevels = getAllCategoryLevels();

  if (isLoading) {
    return (
      <div className="sdt-loading-container">
        <div className="sdt-loading-content">
          <FaSpinner className="sdt-loading-spinner" />
          <h3>Analyzing Inventory Data</h3>
          <p>Loading product information and stock levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sdt-dashboard">
      {/* Header Section */}
      <div className="sdt-header">
        <div className="sdt-header-content">
          <div className="sdt-title-section">
            <div className="sdt-title-icon-wrapper">
              <FaChartLine className="sdt-title-icon" />
            </div>
            <div>
              <h1 className="sdt-main-title">Stock Intelligence Dashboard</h1>
              <p className="sdt-subtitle">Real-time inventory monitoring and alert system</p>
            </div>
          </div>
          <div className="sdt-header-actions">
            <button 
              className={`sdt-export-btn ${isExporting ? 'sdt-exporting' : ''}`}
              onClick={handleExportToExcel}
              disabled={isExporting || filteredProducts.length === 0}
            >
              {isExporting ? (
                <FaSpinner className="sdt-export-spinner" />
              ) : (
                <FaFileExcel className="sdt-excel-icon" />
              )}
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="sdt-alert-banner">
        <div className="sdt-alert-content">
          <FaBell className="sdt-alert-bell" />
          <div>
            <strong>System Alert:</strong> {festivalTime ? 'Festival Season Mode Active' : 'Standard Monitoring Mode'} • 
            Current Threshold: <strong>{festivalTime ? thresholdFestival : thresholdNormal} units</strong>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="sdt-stats-grid">
        <div className="sdt-stat-card sdt-stat-primary">
          <div className="sdt-stat-icon-wrapper">
            <FaBox className="sdt-stat-icon" />
          </div>
          <div className="sdt-stat-content">
            <h3>{filteredProducts.length}</h3>
            <p>Products Requiring Attention</p>
          </div>
        </div>
        <div className="sdt-stat-card sdt-stat-warning">
          <div className="sdt-stat-icon-wrapper">
            <FaExclamationTriangle className="sdt-stat-icon" />
          </div>
          <div className="sdt-stat-content">
            <h3>
              {
                filteredProducts.reduce((count, product) => 
                  count + (product.warehouseStocks?.filter(ws => 
                    getStockLevel(ws.stock) === 'warning'
                  ).length || 0), 0
                )
              }
            </h3>
            <p>Warning Level Items</p>
          </div>
        </div>
        <div className="sdt-stat-card sdt-stat-critical">
          <div className="sdt-stat-icon-wrapper">
            <FaExclamationTriangle className="sdt-stat-icon" />
          </div>
          <div className="sdt-stat-content">
            <h3>
              {
                filteredProducts.reduce((count, product) => 
                  count + (product.warehouseStocks?.filter(ws => 
                    getStockLevel(ws.stock) === 'critical'
                  ).length || 0), 0
                )
              }
            </h3>
            <p>Critical Level Items</p>
          </div>
        </div>
        <div className="sdt-stat-card sdt-stat-info">
          <div className="sdt-stat-icon-wrapper">
            <FaWarehouse className="sdt-stat-icon" />
          </div>
          <div className="sdt-stat-content">
            <h3>
              {
                new Set(
                  filteredProducts.flatMap(product => 
                    product.warehouseStocks?.map(ws => ws.warehouseName) || []
                  )
                ).size
              }
            </h3>
            <p>Warehouses Affected</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="sdt-filters-section">
        <div className="sdt-filters-header">
          <FaFilter className="sdt-filter-icon" />
          <span>Filters & Search</span>
          <div className="sdt-search-info">
            <FaInfoCircle className="sdt-info-icon-small" />
            <span>Search in: Name, Category, Subcategory, Brand, etc.</span>
          </div>
        </div>
        <div className="sdt-filters-content">
          <div className="sdt-search-box">
            <input
              type="text"
              placeholder="Search products by name, category, subcategory, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sdt-search-input"
            />
          </div>
          <div className="sdt-category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="sdt-category-select"
            >
              <option value="all">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Search Results Info */}
        {searchTerm && (
          <div className="sdt-search-results-info">
            <span>
              Search results for: <strong>"{searchTerm}"</strong> • 
              Found <strong>{filteredProducts.length}</strong> products • 
              <button 
                className="sdt-export-mini-btn"
                onClick={handleExportToExcel}
                disabled={isExporting || filteredProducts.length === 0}
              >
                {isExporting ? 'Exporting...' : 'Export Results'}
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="sdt-content">
        {filteredProducts.length === 0 ? (
          <div className="sdt-empty-state">
            <FaBox className="sdt-empty-icon" />
            <h3>
              {searchTerm || selectedCategory !== "all" 
                ? "No matching products found" 
                : "No Stock Alerts"}
            </h3>
            <p>
              {searchTerm 
                ? "Try searching with different terms or browse all categories" 
                : selectedCategory !== "all"
                ? "No products found in this category with low stock"
                : "All products are currently within safe stock levels"}
            </p>
            
            {/* Category suggestions when search has no results */}
            {searchTerm && categoryLevels.categories.length > 0 && (
              <div className="sdt-category-suggestions">
                <p>Available categories: {categoryLevels.categories.slice(0, 5).join(', ')}...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="sdt-table-container">
            <div className="sdt-table-header">
              <h3>Stock Alert Details</h3>
              <div className="sdt-table-actions">
                <span className="sdt-table-count">{filteredProducts.length} items</span>
                <button 
                  className="sdt-export-mini-btn"
                  onClick={handleExportToExcel}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting...' : 'Export All'}
                </button>
              </div>
            </div>
            
            <div className="sdt-products-grid">
              {filteredProducts.map((product) => (
                <div key={product._id} className="sdt-product-card">
                  <div className="sdt-product-header">
                    <div className="sdt-product-image-container">
                      <img
                        src={product.image || product.images?.[0]}
                        alt={product.name}
                        className="sdt-product-image"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEM0My4zMTM3IDQwIDQ2IDQyLjY4NjMgNDYgNDZDNDYgNDkuMzEzNyA0My4zMTM3IDUyIDQwIDUyQzM2LjY4NjMgNTIgMzQgNDkuMzEzNyAzNCA0NkMzNCA0Mi42ODYzIDM2LjY4NjMgNDAgNDAgNDBaIiBmaWxsPSIjOTRBMUI0Ii8+CjxwYXRoIGQ9Ik00OCAzNEg2NkM2Ny4xMDQ2IDM0IDY4IDM0Ljg5NTQgNjggMzZWNjRDNjggNjUuMTA0NiA2Ny4xMDQ2IDY2IDY2IDY2SDE0QzEyLjg5NTQgNjYgMTIgNjUuMTA0NiAxMiA2NFYzNkMxMiAzNC44OTU0IDEyLjg5NTQgMzQgMTQgMzRIMjJMMjYgMzBINTBMNTQgMzRINDhaTTQwIDQwQzQzLjMxMzcgNDAgNDYgNDIuNjg2MyA0NiA0NkM0NiA0OS4zMTM3IDQzLjMxMzcgNTIgNDAgNTJDMzYuNjg2MyA1MiAzNCA0OS4zMTM3IDM0IDQ2QzM0IDQyLjY4NjMgMzYuNjY2MyA0MCA0MCA0MFoiIGZpbGw9IiM5NEExQjQiLz4KPC9zdmc+';
                        }}
                      />
                    </div>
                    <div className="sdt-product-info">
                      <h4 className="sdt-product-name">{product.name}</h4>
                      <div className="sdt-category-hierarchy">
                        {(product.categoryId?.name || product.category) && (
                          <span className="sdt-product-category">
                            {product.categoryId?.name || product.category}
                          </span>
                        )}
                        {product.subCategory && (
                          <span className="sdt-product-subcategory">
                            › {product.subCategory}
                          </span>
                        )}
                        {product.subSubCategory && (
                          <span className="sdt-product-subsubcategory">
                            › {product.subSubCategory}
                          </span>
                        )}
                      </div>
                      {product.brand && (
                        <span className="sdt-product-brand">Brand: {product.brand}</span>
                      )}
                      <div className="sdt-total-stock">
                        Total Inventory: <strong>{product.stock} units</strong>
                      </div>
                    </div>
                  </div>

                  <div className="sdt-warehouses-section">
                    <div className="sdt-warehouses-header">
                      <FaWarehouse className="sdt-warehouses-icon" />
                      <span>Warehouse Stock Details</span>
                    </div>
                    <div className="sdt-warehouses-list">
                      {product.warehouseStocks
                        ?.filter(ws => festivalTime ? ws.stock < thresholdFestival : ws.stock < thresholdNormal)
                        .map((ws, index) => (
                        <div key={index} className={`sdt-warehouse-item sdt-${getStockLevel(ws.stock)}`}>
                          <div className="sdt-warehouse-main">
                            <div className="sdt-warehouse-info">
                              <h5 className="sdt-warehouse-name">{ws.warehouseName || "Unnamed Warehouse"}</h5>
                              <div className="sdt-warehouse-location">
                                <FaMapMarkerAlt className="sdt-location-icon" />
                                <span>
                                  {[ws.city, ws.state, ws.country].filter(Boolean).join(", ") || "Location not specified"}
                                </span>
                              </div>
                            </div>
                            <div className="sdt-stock-info">
                              <div className={`sdt-stock-badge sdt-${getStockLevel(ws.stock)}`}>
                                {ws.stock} units
                              </div>
                              <div className="sdt-stock-status">
                                {getStockLevel(ws.stock).charAt(0).toUpperCase() + getStockLevel(ws.stock).slice(1)}
                              </div>
                            </div>
                          </div>
                          <div className="sdt-stock-progress">
                            <div 
                              className={`sdt-progress-bar sdt-${getStockLevel(ws.stock)}`}
                              style={{
                                width: `${Math.min((ws.stock / (festivalTime ? thresholdFestival : thresholdNormal)) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="sdt-legend">
        <div className="sdt-legend-title">Alert Level Indicators</div>
        <div className="sdt-legend-items">
          <div className="sdt-legend-item">
            <div className="sdt-legend-color sdt-critical"></div>
            <span>Critical (Below 30% threshold)</span>
          </div>
          <div className="sdt-legend-item">
            <div className="sdt-legend-color sdt-warning"></div>
            <span>Warning (Below 60% threshold)</span>
          </div>
          <div className="sdt-legend-item">
            <div className="sdt-legend-color sdt-low"></div>
            <span>Low (Below threshold)</span>
          </div>
        </div>
        <div className="sdt-system-info">
          <FaInfoCircle className="sdt-info-icon" />
          <span>Monitoring Mode: {festivalTime ? 'Festival Season' : 'Standard'}</span>
        </div>
      </div>
    </div>
  );
};

export default StockDetectorTab;
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
import { CurrencyContext } from "../context/CurrencyContext";
import { exportToExcel } from "../templates/PurchaseProductsExcel";
import "../styles/PurchaseProducts.css";
import {
  FaEye,
  FaFileExcel,
  FaDownload,
  FaBox,
  FaWarehouse,
  FaTag,
  FaSpinner,
  FaCube,
  FaStore,
  FaSearch,
  FaFilter,
  FaMoneyBillWave,
  FaDollarSign,
  FaTimes,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";

const PurchaseProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("GBP");
  const [expandedWarehouses, setExpandedWarehouses] = useState({});

  const { currency, rates, changeCurrency } = useContext(CurrencyContext);
  const navigate = useNavigate();

  // Currency symbols
  const currencySymbols = { GBP: "£", INR: "₹", USD: "$", EUR: "€", AUD: "A$", CAD: "C$", JPY: "¥" };

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch products
        const productsRes = await axios.get(`${API_BASE_URL}/api/products/purchase`);

        // FIX: Extract actual array
        const productList = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data.products || [];

        setProducts(productList);
        setFilteredProducts(productList);

        // Fetch categories
        const categoriesRes = await axios.get(`${API_BASE_URL}/api/categories`);
        setCategories(categoriesRes.data);

      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };


    fetchData();
  }, []);

  // Toggle warehouse details
  const toggleWarehouseDetails = (productId, warehouseIndex) => {
    const key = `${productId}-${warehouseIndex}`;
    setExpandedWarehouses(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Currency conversion functions
  const convertPrice = (price, fromCurrency = "GBP") => {
    if (!price || !rates[fromCurrency] || !rates[currency]) return 0;
    const priceInGBP = price / rates[fromCurrency];
    return (priceInGBP * rates[currency]);
  };

  const getCurrencySymbol = (curr) => {
    return currencySymbols[curr] || curr;
  };

  // Filter products based on all criteria
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        product.subCategory?.toLowerCase().includes(searchLower) ||
        product.subSubCategory?.toLowerCase().includes(searchLower) ||
        product.price?.toString().includes(searchTerm) ||
        product.currency?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Category filters
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(product => product.subCategory === selectedSubCategory);
    }

    if (selectedSubSubCategory) {
      filtered = filtered.filter(product => product.subSubCategory === selectedSubSubCategory);
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filtered = filtered.filter(product => {
        if (!product.price) return false;

        const productPriceInFilterCurrency = convertPrice(product.price, product.currency);
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;

        return productPriceInFilterCurrency >= min && productPriceInFilterCurrency <= max;
      });
    }

    setFilteredProducts(filtered);
  }, [
    searchTerm,
    selectedCategory,
    selectedSubCategory,
    selectedSubSubCategory,
    minPrice,
    maxPrice,
    priceCurrency,
    products,
    rates
  ]);

  // Get unique values for dropdowns
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const uniqueSubCategories = [...new Set(
    products
      .filter(p => !selectedCategory || p.category === selectedCategory)
      .map(p => p.subCategory)
      .filter(Boolean)
  )];
  const uniqueSubSubCategories = [...new Set(
    products
      .filter(p => (!selectedCategory || p.category === selectedCategory) &&
        (!selectedSubCategory || p.subCategory === selectedSubCategory))
      .map(p => p.subSubCategory)
      .filter(Boolean)
  )];

  // Get price range statistics for current filters
  const getPriceRangeStats = () => {
    if (filteredProducts.length === 0) return { min: 0, max: 0, avg: 0 };

    const prices = filteredProducts
      .map(product => convertPrice(product.price, product.currency))
      .filter(price => price > 0);

    if (prices.length === 0) return { min: 0, max: 0, avg: 0 };

    return {
      min: Math.min(...prices).toFixed(2),
      max: Math.max(...prices).toFixed(2),
      avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
    };
  };

  const priceStats = getPriceRangeStats();

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedSubSubCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  // Clear price filters only
  const clearPriceFilters = () => {
    setMinPrice("");
    setMaxPrice("");
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency) => {
    changeCurrency(newCurrency);
    setPriceCurrency(newCurrency);
  };

  // Excel Export Handler
  const handleExportToExcel = () => {
    const filters = {
      searchTerm,
      selectedCategory,
      selectedSubCategory,
      selectedSubSubCategory,
      minPrice,
      maxPrice,
      priceCurrency
    };

    exportToExcel(filteredProducts, filters, currency, rates, currencySymbols, setIsExporting);
  };

  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading Products</h3>
          <p>Fetching product information from database...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="pp-empty-state">
        <FaCube className="pp-empty-icon" />
        <h3>No Products Available</h3>
        <p>No products found in the inventory. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="pp-dashboard">
      {/* Header Section */}
      <div className="pp-header">
        <div className="pp-title-section">
          <FaBox className="pp-title-icon" />
          <div>
            <h1 className="pp-main-title">Products Inventory</h1>
            <p className="pp-subtitle">Complete product catalog and stock management</p>
          </div>
        </div>
        <div className="pp-header-actions">
          <button
            className={`pp-export-btn ${isExporting ? 'pp-exporting' : ''}`}
            onClick={handleExportToExcel}
            disabled={isExporting || filteredProducts.length === 0}
          >
            {isExporting ? (
              <FaSpinner className="pp-export-spinner" />
            ) : (
              <FaFileExcel className="pp-excel-icon" />
            )}
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="pp-stats-grid">
        <div className="pp-stat-card pp-stat-primary">
          <div className="pp-stat-icon-wrapper">
            <FaCube className="pp-stat-icon" />
          </div>
          <div className="pp-stat-content">
            <h3>{filteredProducts.length}</h3>
            <p>Filtered Products</p>
          </div>
        </div>
        <div className="pp-stat-card pp-stat-warning">
          <div className="pp-stat-icon-wrapper">
            <FaTag className="pp-stat-icon" />
          </div>
          <div className="pp-stat-content">
            <h3>{filteredProducts.filter(p => p.discount > 0).length}</h3>
            <p>Discounted Products</p>
          </div>
        </div>
        <div className="pp-stat-card pp-stat-success">
          <div className="pp-stat-icon-wrapper">
            <FaStore className="pp-stat-icon" />
          </div>
          <div className="pp-stat-content">
            <h3>{filteredProducts.reduce((sum, p) => sum + (p.stock || 0), 0)}</h3>
            <p>Total Stock Units</p>
          </div>
        </div>
        <div className="pp-stat-card pp-stat-info">
          <div className="pp-stat-icon-wrapper">
            <FaMoneyBillWave className="pp-stat-icon" />
          </div>
          <div className="pp-stat-content">
            <h3>{getCurrencySymbol(currency)}</h3>
            <p>Display Currency</p>
          </div>
        </div>
      </div>

      {/* Price Range Statistics */}
      {(minPrice || maxPrice) && (
        <div className="pp-price-stats">
          <div className="pp-price-stats-content">
            <FaDollarSign className="pp-price-stats-icon" />
            <div className="pp-price-stats-info">
              <span className="pp-price-stats-title">Price Range Applied</span>
              <span className="pp-price-stats-range">
                {minPrice ? `${getCurrencySymbol(priceCurrency)}${minPrice}` : 'Min'} - {maxPrice ? `${getCurrencySymbol(priceCurrency)}${maxPrice}` : 'Max'}
              </span>
            </div>
            <button onClick={clearPriceFilters} className="pp-price-clear-btn">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="pp-filters-section">
        <div className="pp-filters-header">
          <FaFilter className="pp-filter-icon" />
          <span>Search & Filter Products</span>
        </div>
        <div className="pp-filters-content">
          {/* Search Bar */}
          <div className="pp-search-group">
            <label className="pp-search-label">
              <FaSearch className="pp-search-icon" />
              Search Products
            </label>
            <input
              type="text"
              placeholder="Search by name, category, price, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pp-search-input"
            />
          </div>

          {/* Currency Selection */}
          <div className="pp-filter-group">
            <label className="pp-filter-label">Display Currency</label>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="pp-select"
            >
              {Object.keys(currencySymbols).map((curr) => (
                <option key={curr} value={curr}>
                  {curr} ({getCurrencySymbol(curr)})
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="pp-filter-group pp-price-filter-group">
            <label className="pp-filter-label">Price Range ({getCurrencySymbol(priceCurrency)})</label>
            <div className="pp-price-inputs">
              <input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="pp-price-input"
                min="0"
                step="0.01"
              />
              <span className="pp-price-separator">to</span>
              <input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="pp-price-input"
                min="0"
                step="0.01"
              />
            </div>
            <div className="pp-price-currency-selector">
              <label>Filter Currency:</label>
              <select
                value={priceCurrency}
                onChange={(e) => setPriceCurrency(e.target.value)}
                className="pp-currency-select"
              >
                {Object.keys(currencySymbols).map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filters */}
          <div className="pp-filter-group">
            <label className="pp-filter-label">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory("");
                setSelectedSubSubCategory("");
              }}
              className="pp-select"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="pp-filter-group">
            <label className="pp-filter-label">Sub Category</label>
            <select
              value={selectedSubCategory}
              onChange={(e) => {
                setSelectedSubCategory(e.target.value);
                setSelectedSubSubCategory("");
              }}
              className="pp-select"
              disabled={!selectedCategory}
            >
              <option value="">All Sub Categories</option>
              {uniqueSubCategories.map((subCat, index) => (
                <option key={index} value={subCat}>{subCat}</option>
              ))}
            </select>
          </div>

          <div className="pp-filter-group">
            <label className="pp-filter-label">Sub Sub Category</label>
            <select
              value={selectedSubSubCategory}
              onChange={(e) => setSelectedSubSubCategory(e.target.value)}
              className="pp-select"
              disabled={!selectedSubCategory}
            >
              <option value="">All Sub Sub Categories</option>
              {uniqueSubSubCategories.map((subSubCat, index) => (
                <option key={index} value={subSubCat}>{subSubCat}</option>
              ))}
            </select>
          </div>

          <button onClick={clearFilters} className="pp-clear-btn">
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="pp-table-container">
        <div className="pp-table-header">
          <h3>Catalog</h3>
          <div className="pp-table-actions">
            <span className="pp-table-count">
              Showing {filteredProducts.length} of {products.length} products
              {priceStats.min > 0 && (
                <span className="pp-price-range-info">
                  • Price range: {getCurrencySymbol(currency)}{priceStats.min} - {getCurrencySymbol(currency)}{priceStats.max}
                </span>
              )}
            </span>
            <button
              className="pp-export-mini-btn"
              onClick={handleExportToExcel}
              disabled={isExporting || filteredProducts.length === 0}
            >
              <FaDownload className="pp-download-icon" />
              Export
            </button>
          </div>
        </div>

        <div className="pp-table-wrapper">
          <table className="pp-products-table">
            <thead>
              <tr>
                <th className="pp-col-image">Image</th>
                <th className="pp-col-name">Product Name</th>
                <th className="pp-col-category">Category</th>
                <th className="pp-col-price-offer">Price & Offer</th>
                <th className="pp-col-stock">Stock</th>
                <th className="pp-col-warehouse">Warehouses</th>
                {/* <th className="pp-col-action">Action</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const imageUrl = product.image?.data
                  ? `data:${product.image.contentType};base64,${btoa(
                    new Uint8Array(product.image.data.data).reduce(
                      (data, byte) => data + String.fromCharCode(byte),
                      ""
                    )
                  )}`
                  : product.images?.[0] || "/default-product.png";

                const totalStock = product.stock || 0;
                const convertedPrice = convertPrice(product.price, product.currency);

                return (
                  <tr key={product._id} className="pp-table-row">
                    <td className="pp-image-cell">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="pp-product-image"
                        onError={(e) => {
                          e.target.src = "/default-product.png";
                        }}
                      />
                    </td>
                    <td className="pp-name-cell">
                      <span className="pp-product-name">{product.name}</span>
                      {product.brand && (
                        <span className="pp-product-brand">{product.brand}</span>
                      )}
                    </td>
                    <td className="pp-category-cell">
                      <div className="pp-category-info">
                        <span className="pp-category-main">{product.category}</span>
                        {product.subCategory && (
                          <span className="pp-category-sub">→ {product.subCategory}</span>
                        )}
                        {product.subSubCategory && (
                          <span className="pp-category-subsub">→ {product.subSubCategory}</span>
                        )}
                      </div>
                    </td>
                    <td className="pp-price-offer-cell">
                      <div className="pp-price-offer-info">
                        <div className="pp-price-section">
                          <span className="pp-price-converted">
                            {getCurrencySymbol(currency)}{convertedPrice.toFixed(2)}
                          </span>
                          {currency !== product.currency && (
                            <span className="pp-price-original">
                              {getCurrencySymbol(product.currency)}{product.price}
                            </span>
                          )}
                        </div>
                        <div className="pp-offer-section">
                          <span className={`pp-discount-badge ${product.discount ? 'pp-discount-active' : ''}`}>
                            {product.discount ? `${product.discount}% OFF` : 'No Offer'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="pp-stock-cell">
                      <div className="pp-stock-info">
                        <span className="pp-stock-value">{totalStock}</span>
                        <span className="pp-stock-label">units</span>
                      </div>
                    </td>
                    <td className="pp-warehouse-cell">
                      {product.warehouseStocks?.length > 0 ? (
                        <div className="pp-warehouse-list">
                          {product.warehouseStocks.map((ws, idx) => {
                            const warehouseKey = `${product._id}-${idx}`;
                            const isExpanded = expandedWarehouses[warehouseKey];

                            return (
                              <div key={idx} className="pp-warehouse-item">
                                <FaWarehouse className="pp-warehouse-icon" />
                                <div className="pp-warehouse-details">
                                  <div className="pp-warehouse-summary">
                                    <span className="pp-warehouse-name">{ws.warehouseName || 'N/A'}</span>
                                    <span className="pp-warehouse-stock">{ws.stock || 0} units</span>
                                    <button
                                      className="pp-warehouse-toggle"
                                      onClick={() => toggleWarehouseDetails(product._id, idx)}
                                    >
                                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                  </div>

                                  {isExpanded && (
                                    <div className="pp-warehouse-expanded">
                                      <div className="pp-warehouse-location">
                                        <span className="pp-warehouse-location-item">
                                          <strong>Country:</strong> {ws.country || 'N/A'}
                                        </span>
                                        <span className="pp-warehouse-location-item">
                                          <strong>State:</strong> {ws.state || 'N/A'}
                                        </span>
                                        <span className="pp-warehouse-location-item">
                                          <strong>City:</strong> {ws.city || 'N/A'}
                                        </span>
                                        <span className="pp-warehouse-location-item">
                                          <strong>Postal Code:</strong> {ws.postalCode || 'N/A'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="pp-no-warehouse">
                          <FaWarehouse className="pp-warehouse-icon" />
                          <span>No warehouse data</span>
                        </div>
                      )}
                    </td>
                    {/* <td className="pp-action-cell">
                      <button
                        className="pp-view-btn"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <FaEye className="pp-view-icon" />
                        View Details
                      </button>
                    </td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="pp-no-results">
            <FaSearch className="pp-no-results-icon" />
            <h4>No products found</h4>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseProducts;
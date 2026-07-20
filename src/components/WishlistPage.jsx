import { useContext, useEffect, useState } from "react"; 
import { AuthContext } from "../context/AuthContext";
import { CurrencyContext } from "../context/CurrencyContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
import Navbar from "../components/Navbar"; 
import Chatbot from "../components/Chatbot"; 
import Footer from "../components/Footer";
import "../styles/WishlistPage.css";
import { FaHeart, FaShoppingCart, FaTrash, FaSearch, FaExchangeAlt, FaChevronDown, FaStar, FaTimes, FaHome, FaArrowLeft } from "react-icons/fa";

const WishlistPage = () => {
  const { user } = useContext(AuthContext);
  const { currency, rates } = useContext(CurrencyContext);
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [localCurrency, setLocalCurrency] = useState(() => {
    return localStorage.getItem("selectedCurrency") || currency || "GBP";
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [user]);

  useEffect(() => {
    const filtered = wishlist.filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWishlist(filtered);
  }, [searchTerm, wishlist]);

  const fetchWishlist = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await axios.get(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = sessionStorage.getItem("authToken");
      await axios.delete(`${API_BASE_URL}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(wishlist.filter(product => product._id !== productId));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  const getImageUrl = (product) => {
    if (product?.image) return product.image;
    if (Array.isArray(product?.images) && product.images.length > 0) return product.images[0];
    return "/default-product.png";
  };

  const currencySymbols = {
    GBP: "£",
    INR: "₹",
    USD: "$",
    EUR: "€",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
  };

  const convertPrice = (priceGBP) => {
    if (!rates) return `${currencySymbols[localCurrency]}${priceGBP?.toFixed(2) || '0.00'}`;
    const rate = rates[localCurrency] || 1;
    const converted = (priceGBP || 0) * rate;
    if (["INR", "JPY"].includes(localCurrency)) return `${currencySymbols[localCurrency]}${Math.round(converted)}`;
    return `${currencySymbols[localCurrency]}${converted.toFixed(2)}`;
  };

  const handleCurrencyChange = (newCurrency) => {
    setLocalCurrency(newCurrency);
    localStorage.setItem("selectedCurrency", newCurrency);
    setShowCurrencyDropdown(false);
  };

  const clearSearch = () => setSearchTerm("");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.wishlist-currency-converter')) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="loading-spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Banner Section */}
      <div className="wishlist-banner">
        <div className="wishlist-banner-content">
          <div className="wishlist-banner-text">
            <div className="wishlist-title-section">
              <FaHeart className="wishlist-banner-icon" />
              <h1>My Wishlist</h1>
              <span className="wishlist-banner-count">{filteredWishlist.length} items</span>
            </div>
          </div>
          <div className="wishlist-banner-actions">
            <Link to="/" className="wishlist-home-btn">
              <FaHome /> Home
            </Link>
          </div>
        </div>
        <div className="wishlist-banner-wave">
        </div>
      </div>

      <div className="wishlist-container">
        {/* Top Bar with Search and Currency Converter */}
        <div className="wishlist-top-bar">
          <div className="wishlist-search-container">
            <FaSearch className="wishlist-search-icon" />
            <input
              type="text"
              placeholder="Search products in your wishlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="wishlist-search-input"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={clearSearch} aria-label="Clear search">
                <FaTimes />
              </button>
            )}
          </div>

          {/* <div className="wishlist-currency-converter">
            <button 
              className="wishlist-currency-toggle" 
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              aria-expanded={showCurrencyDropdown}
              aria-haspopup="true"
            >
              <FaExchangeAlt />
              <span>{localCurrency}</span>
              <FaChevronDown className={`wishlist-dropdown-arrow ${showCurrencyDropdown ? 'rotate' : ''}`} />
            </button>
            {showCurrencyDropdown && (
              <div className="wishlist-currency-dropdown">
                {Object.keys(currencySymbols).map(curr => (
                  <button
                    key={curr}
                    className={`wishlist-currency-option ${localCurrency === curr ? 'active' : ''}`}
                    onClick={() => handleCurrencyChange(curr)}
                  >
                    {curr} - {currencySymbols[curr]}
                  </button>
                ))}
              </div>
            )}
          </div> */}
        </div>

        {searchTerm && (
          <div className="search-results-info">
            <p>
              Showing {filteredWishlist.length} results for "<strong>{searchTerm}</strong>"
              <button onClick={clearSearch} className="clear-search-link">Clear search</button>
            </p>
          </div>
        )}

        {filteredWishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-heart"><FaHeart /></div>
            <h2>{searchTerm ? "No products found" : "Your wishlist is empty"}</h2>
            <p>{searchTerm ? "Try adjusting your search terms or browse all products." : "Start adding products you love to your wishlist!"}</p>
            <Link to="/" className="wishlist-continue-shopping">
              <FaShoppingCart /> {searchTerm ? "Browse All Products" : "Continue Shopping"}
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {filteredWishlist.map((product) => (
              <div key={product._id} className="wishlist-item">
                <button 
                  className="wishlist-remove-btn" 
                  onClick={() => removeFromWishlist(product._id)} 
                  title="Remove from Wishlist"
                  aria-label="Remove from wishlist"
                >
                  <FaTrash />
                </button>

                <Link to={`/product/${product._id}`} className="wishlist-item-link">
                  <div className="wishlist-item-image">
                    <img 
                      src={getImageUrl(product)} 
                      alt={product.name} 
                      onError={(e) => {
                        e.target.src = "/default-product.png";
                        e.target.onerror = null;
                      }} 
                    />
                    {product.discount && (
                      <span className="wishlist-discount-badge">{product.discount}% OFF</span>
                    )}
                  </div>

                  <div className="wishlist-item-details">
                    <h3 className="wishlist-item-name">{product.name}</h3>
                    {product.rating && (
                      <div className="wishlist-item-rating">
                        <FaStar className="rating-star" />
                        <span className="rating-value">{product.rating}</span>
                      </div>
                    )}
                    {product.category && (
                      <div className="wishlist-item-category">{product.category}</div>
                    )}
                  </div>

                  <div className="wishlist-item-pricing">
                    {product.discount ? (
                      <>
                        <span className="wishlist-discounted-price">
                          {convertPrice(product.price - (product.price * product.discount / 100))}
                        </span>
                        <span className="wishlist-original-price">
                          {convertPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="wishlist-regular-price">
                        {convertPrice(product.price)}
                      </span>
                    )}
                  </div>
                </Link>

                <button 
                  className="wishlist-view-product-btn" 
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <FaShoppingCart /> View Product
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Chatbot/>
      <Footer />
    </>
  );
};

export default WishlistPage;
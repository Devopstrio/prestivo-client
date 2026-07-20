import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import API_BASE_URL from "../config";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import SubscriptionCountdown from "./SubscriptionCountdown";
import "../styles/Header.css";

// Import icons
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaBox,
  FaSignOutAlt,
  FaCog,
  FaHome,
  FaChevronRight,
  FaHeart,
  FaCrown,
  FaStar,
  FaCheck,
  FaRocket,
  FaGem,
  FaShieldAlt,
  FaUserCircle,
  FaShoppingBag,
  FaTruck,
  FaStore,
  FaChevronDown,
  FaQuestionCircle
} from "react-icons/fa";

const Header = ({ setSearch, setSelectedCategory, setSelectedSubCategory,
  setSelectedSubSubCategory }) => {
  const location = useLocation();
  const { user, logout, loading } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSubscriptionPanel, setShowSubscriptionPanel] = useState(false);
  const subscriptionStatus = subscriptionInfo?.status || "None";
  const subscriptionPlan = subscriptionInfo?.plan || "Free Trial";
  const subscriptionExpiryDate = subscriptionInfo?.endDate || subscriptionInfo?.expiryDate || subscriptionInfo?.subscriptionExpiryDate || null;
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const subscriptionPanelRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const premiumButtonRef = useRef(null);

  const { cart } = useContext(CartContext);
  const cartItemsCount = cart.reduce((acc, item) => acc + (item.qty || 0), 0);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user?.email) return;

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/subscriptionstatus`,
          {
            params: { email: user.email }
          }
        );

        setSubscriptionInfo(res.data);
      } catch (err) {
        console.error("Failed to fetch subscription status", err);
      }
    };

    fetchSubscriptionStatus();
  }, [user?.email]);



  // ✅ Subscription label logic
  const getSubscriptionLabel = () => {
    const plan = subscriptionPlan.toLowerCase();
    const status = subscriptionStatus.toLowerCase();

    if (plan.includes("free")) return "Upgrade";

    if (plan.includes("month") || plan.includes("year")) {
      return status === "active" ? "Upgraded" : "Upgrade";
    }

    return "Upgrade";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {

      // 🔻 Close Subscription Panel
      if (
        showSubscriptionPanel &&
        subscriptionPanelRef.current &&
        !subscriptionPanelRef.current.contains(event.target) &&
        !premiumButtonRef.current?.contains(event.target)
      ) {
        setShowSubscriptionPanel(false);
      }

      // 🔻 Close Profile Dropdown
      if (
        showProfileDropdown &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current?.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSubscriptionPanel, showProfileDropdown]);


  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowProfileDropdown(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        setAllProducts(res.data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const box = document.querySelector(".ecHeader-suggestionBox");
      const input = document.querySelector(".ecHeader-searchInputWrapper");

      if (box && !box.contains(e.target) && !input.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const generateSuggestions = (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);

    const lower = query.toLowerCase();
    const results = [];

    // ----------------------------
    // 1️⃣ PRODUCT MATCHES (ALL FIELDS)
    // ----------------------------
    const productMatches = allProducts.filter((p) => {
      const fields = [
        p.name,
        p.description,
        p.category,
        p.subCategory,
        p.subSubCategory,
        p.brand,
        p.model,
        p.material,
        p.color,
        p.fit,
        p.warranty,
        p.processor,
        p.displaySize,
        p.battery,
        p.camera,
        p.screenSize,
        p.inchs,
        p.skinType,
        p.hairType,
        p.fragranceType,
        p.language,
        p.author,
        p.genre,
        p.format,
        p.packSize,
        p.capacity,
        p.power,
        p.weight,
        p.organic,
        p.price?.toString(),
        p.discount?.toString(),
        p.totalPrice?.toString(),
      ];

      // Arrays → merge into fields
      const arrayFields = [
        ...(p.ram || []),
        ...(p.storage || []),
        ...(p.type || []),
        ...(p.size || []),
      ];

      const combined = [...fields, ...arrayFields]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return combined.includes(lower);
    }).slice(0, 5);

    results.push(
      ...productMatches.map((p) => ({
        type: "product",
        label: p.name,
        image: p.images?.[0]?.url || p.image || "/placeholder.png",
      }))
    );

    // ----------------------------
    // 2️⃣ CATEGORY MATCHES
    // ----------------------------
    const categoryMatches = categories
      .filter((c) => c.name?.toLowerCase().includes(lower))
      .slice(0, 5);

    results.push(
      ...categoryMatches.map((c) => ({
        type: "category",
        label: c.name,
      }))
    );

    // ----------------------------
    // 3️⃣ SUBCATEGORY MATCHES
    // ----------------------------
    const subCategoryMatches = [];

    categories.forEach((cat) => {
      cat.subCategories?.forEach((sub) => {
        if (sub.name?.toLowerCase().includes(lower)) {
          subCategoryMatches.push({
            parent: cat.name,
            name: sub.name,
          });
        }
      });
    });

    results.push(
      ...subCategoryMatches.slice(0, 5).map((s) => ({
        type: "subcategory",
        label: s.name,
      }))
    );

    // ----------------------------
    // 4️⃣ SUB-SUB CATEGORY MATCHES
    // ----------------------------
    const subSubCategoryMatches = [];

    categories.forEach((cat) => {
      cat.subCategories?.forEach((sub) => {
        sub.subSubCategories?.forEach((ss) => {
          const ssName = typeof ss === "string" ? ss : ss?.name || "";
          if (ssName.toLowerCase().includes(lower)) {
            subSubCategoryMatches.push({
              parent: sub.name,
              name: ssName,
            });
          }
        });
      });
    });

    results.push(
      ...subSubCategoryMatches.slice(0, 5).map((ss) => ({
        type: "subsubcategory",
        label: ss.name,
      }))
    );

    // ----------------------------
    // 5️⃣ LIMIT RESULTS
    // ----------------------------
    setSuggestions(results.slice(0, 12));
  };






  const handleSearch = (e) => {
    e.preventDefault();
    const searchLower = searchQuery.toLowerCase();

    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedSubSubCategory("");

    setSearch(searchQuery);
    sessionStorage.setItem("searchQuery", searchQuery);

    if (window.location.pathname !== "/") {
      navigate("/");
    } else {
      const event = new CustomEvent('scrollToProducts');
      window.dispatchEvent(event);
    }
  };


  const fetchCompanyLogo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/company`);
      if (res.data.data && res.data.data.logoUrl) {
        setCompanyLogo(res.data.data.logoUrl);
      }
    } catch (err) {
      console.error("Error fetching company logo:", err);
    }
  };

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/company`);
        setCompanyName(res.data?.data?.name || "");
      } catch (err) {
        console.error("Company fetch error:", err);
      }
    };

    fetchCompanyDetails();
  }, []);


  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories/home`);
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const scrollToProducts = () => {
    const event = new CustomEvent('scrollToProducts');
    window.dispatchEvent(event);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubCategory("");
    setSelectedSubSubCategory("");
    setSearch("");
    setSearchQuery("");
    scrollToProducts();
  };

  const handleSubCategorySelect = (subCategoryName) => {
    setSelectedSubCategory(subCategoryName);
    setSelectedSubSubCategory("");
    setSearch("");
    setSearchQuery("");
    scrollToProducts();
  };

  const handleSubSubCategorySelect = (subSubCategoryName) => {
    setSelectedSubSubCategory(subSubCategoryName);
    setSearch("");
    setSearchQuery("");
    scrollToProducts();
  };

  // Handle dropdown item click
  const handleDropdownItemClick = (path) => {
    setShowProfileDropdown(false);
    navigate(path);
  };

  useEffect(() => {
    setIsMounted(true);
    fetchCompanyLogo();
    fetchCategories();

    const savedSearch = sessionStorage.getItem("searchQuery");
    if (savedSearch) {
      setSearchQuery(savedSearch);
      setSearch(savedSearch);
    }

    return () => {
      setIsMounted(false);
    };
  }, [setSearch]);

  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem("searchQuery", searchQuery);
      setSearch(searchQuery);
    }
  }, [searchQuery, isMounted, setSearch]);

  // Close dropdown when clicking outside - FIXED VERSION
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.ecHeader-profileDropdown');
      const profileButton = document.querySelector('.ecHeader-userProfile');

      if (showProfileDropdown &&
        !dropdown?.contains(event.target) &&
        !profileButton?.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  // CLOSE SUBSCRIPTION PANEL
  useEffect(() => {
    const handleClickOutside = (event) => {
      const panel = document.querySelector(".subscription-panel");
      const premiumBtn = document.querySelector(".ecHeader-premium");

      if (
        showSubscriptionPanel &&
        !panel?.contains(event.target) &&
        !premiumBtn?.contains(event.target)
      ) {
        setShowSubscriptionPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSubscriptionPanel]);

  // Utility function to capitalize each word
  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .toLowerCase() // convert all to lowercase first
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) return <div className="ecHeader-loading">Loading...</div>;

  return (
    <>
      <header className="ecHeader-wrapper">
        <div className="ecHeader-content">

          {/* Logo Section */}
          <div className="ecHeader-logoContainer">
            <Link to="/" className="ecHeader-logoLink">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="ecHeader-logoImg"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
              ) : (
                <div className="ecHeader-logoFallback">
                  {/* <FaStore className="ecHeader-logoIcon" />
                  <span className="ecHeader-logoText">MarketPlace</span> */}
                </div>
              )}
            </Link>

            {/* ⭐ Company Name — show beside logo */}
            {companyName && (
              <span className="ecHeader-companyName">{companyName.toUpperCase()}</span>
            )}
          </div>

          {/* Search Bar */}
          <div className="ecHeader-searchContainer">
            <form onSubmit={handleSearch} className="ecHeader-searchForm">
              <div className="ecHeader-searchInputWrapper">
                <FaSearch className="ecHeader-searchInputIcon" />
                <input
                  type="text"
                  placeholder="Search for products, brands, and categories..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    generateSuggestions(value); // Generate LIVE suggestions
                  }}

                  onKeyDown={(e) => {
                    setSearch(e.target.value, e.key);  // SEND VALUE + KEY
                  }}
                  className="ecHeader-searchInput" style={{ border: "none" }}
                />
              </div>



            </form>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="ecHeader-suggestionBoxOuter">
              <div className="ecHeader-suggestionHeader">
                <span>Suggestions</span>
                <button
                  className="ecHeader-suggestionClose"
                  onClick={() => setShowSuggestions(false)}
                >
                  ✕
                </button>
              </div>

              {suggestions.map((item, index) => (
                <div
                  key={index}
                  className="ecHeader-suggestionItem"
                  onClick={() => {
                    setSearchQuery(item.label);
                    setSearch(item.label);
                    sessionStorage.setItem("searchQuery", item.label);

                    setSuggestions([]);
                    setShowSuggestions(false);

                    navigate("/", {
                      state: {
                        fromSuggestion: true
                      }
                    });
                  }}

                >
                  {item.type === "product" && (
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.label}
                      className="ecHeader-suggestionImage"
                    />
                  )}

                  {item.type !== "product" && (
                    <FaSearch className="ecHeader-suggestionIcon" />
                  )}

                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}


          {/* Navigation Items */}
          <div className="ecHeader-navContainer">

            {/* ⭐ PREMIUM BUTTON */}
            {(user?.isAdmin) && (
              <div
                ref={premiumButtonRef}
                className="ecHeader-navItem ecHeader-premium"
                onClick={() => {
                  if (!user) {
                    // UNAUTHORIZED → REDIRECT
                    navigate("/subscription");
                    return;
                  }
                  // AUTHORIZED → OPEN PANEL
                  setShowSubscriptionPanel(!showSubscriptionPanel);
                }}
                style={{ cursor: "pointer" }}
              >
                <FaCrown className="ecHeader-navIcon" />
                <span className="ecHeader-navLabel">
                  {user?.isAdmin ? getSubscriptionLabel() : "Premium"}
                </span>
              </div>
            )}

            {/* ⭐ SUBSCRIPTION PANEL (ONLY LOGGED-IN USERS) */}
            {showSubscriptionPanel && subscriptionInfo && (
              <div className="subscription-panel" ref={subscriptionPanelRef}>
                <h3 className="panel-title">Subscription Status</h3>

                <div className="panel-row">
                  <span className="panel-label">Plan:</span>
                  <span className="panel-value">
                    {subscriptionPlan || "Free Trial"}
                  </span>
                </div>

                <div className="panel-row">
                  <span className="panel-label">Status:</span>
                  <span
                    className="panel-value"
                    style={{
                      color:
                        subscriptionStatus === "Active"
                          ? "green"
                          : subscriptionStatus === "Expired"
                            ? "red"
                            : "orange",
                    }}
                  >
                    {subscriptionStatus || "None"}
                  </span>
                </div>

                {subscriptionExpiryDate && (
                  <div className="panel-row">
                    <span className="panel-label">Expiry:</span>
                    <span className="panel-value">
                      {new Date(subscriptionExpiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Countdown */}
                <SubscriptionCountdown expiryDate={subscriptionExpiryDate} />

                {/* BUTTON LOGIC */}
                {subscriptionPlan?.toLowerCase().includes("free") ? (
                  <button
                    className="panel-btn"
                    onClick={() => navigate("/subscription")}
                  >
                    Upgrade Plan
                  </button>
                ) : subscriptionStatus === "Active" ? (
                  <button
                    className="panel-btn"
                    onClick={() => navigate("/subscription")}
                  >
                    View Plan
                  </button>
                ) : (
                  <button
                    className="panel-btn"
                    onClick={() => navigate("/subscription")}
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            )}

            {/* HOME */}
            {location.pathname !== "/" && (
              <Link to="/" className="ecHeader-navItem">
                <FaHome className="ecHeader-navIcon" />
                <span className="ecHeader-navLabel">Home</span>
              </Link>
            )}

            {/* HELP */}
            <Link to="/contact" className="ecHeader-navItem">
              <FaQuestionCircle className="ecHeader-navIcon" />
              <span className="ecHeader-navLabel">Help</span>
            </Link>

            {!user?.isAdmin && (
              <Link to="/cart" className="ecHeader-navItem ecHeader-cartWithBadge" id="cartlength">
                <FaShoppingCart className="ecHeader-navIcon" />

                {cartItemsCount > 0 && (
                  <span className="ecHeader-cartBadge">{cartItemsCount}</span>
                )}

                <span className="ecHeader-navLabel">Cart</span>
              </Link>
            )}

            {/* USER LOGGED-IN */}
            {user ? (
              <>
                {/* PROFILE DROPDOWN */}
                <div className="ecHeader-userProfileWrapper">
                  <div
                    className="ecHeader-navItem ecHeader-userProfile"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    title={user?.username}
                  >
                    <FaUserCircle className="ecHeader-navIcon" />
                    <span className="ecHeader-navLabel">
                      {capitalizeWords(
                        user.username ||
                        user.name ||
                        user.email?.split("@")[0]
                      )}
                    </span>
                    <FaChevronDown
                      className={`ecHeader-dropdownChevron ${showProfileDropdown ? "ecHeader-chevronRotate" : ""
                        }`}
                    />
                  </div>

                  {showProfileDropdown && (
                    <div className="ecHeader-profileDropdown" ref={profileDropdownRef}>
                      <div
                        className="ecHeader-dropdownItem"
                        onClick={() => handleDropdownItemClick("/profile")}
                      >
                        <FaUser className="ecHeader-dropdownIcon" />
                        <span>My Profile</span>
                      </div>

                      {!user.isAdmin && (
                        <div
                          className="ecHeader-dropdownItem"
                          onClick={() => handleDropdownItemClick("/myorders")}
                        >
                          <FaBox className="ecHeader-dropdownIcon" />
                          <span>My Orders</span>
                        </div>
                      )}

                      {/* 🔥 HIDE Wishlist FOR ADMIN */}
                      {!user.isAdmin && (
                        <div
                          className="ecHeader-dropdownItem"
                          onClick={() => handleDropdownItemClick("/wishlist")}
                        >
                          <FaHeart className="ecHeader-dropdownIcon" />
                          <span>My Wishlist</span>
                        </div>
                      )}


                      {user.isAdmin && (
                        <div
                          className="ecHeader-dropdownItem"
                          onClick={() => handleDropdownItemClick("/admin")}
                        >
                          <FaCog className="ecHeader-dropdownIcon" />
                          <span>Admin Portal</span>
                        </div>
                      )}

                      <div className="ecHeader-dropdownDivider"></div>

                      <div
                        className="ecHeader-dropdownItem ecHeader-logoutItem"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="ecHeader-dropdownIcon" />
                        <span>Logout</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // NOT LOGGED-IN → LOGIN BUTTON
              <Link to="/login" className="ecHeader-navItem ecHeader-loginBtn">
                <FaUser className="ecHeader-navIcon" />
                <span className="ecHeader-navLabel">Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>


      {/* Category Navigation Bar */}
      <div className="categoryNavBar" style={{ position: "sticky", top: "94px", left: "0%", right: "0%", border: "none" }}>
        <div className="categoryNavContainer">
          {categories.map((category, index) => (
            <div
              key={category._id}
              className="categoryNavItem"
              onMouseEnter={() => setHoveredCategory(category._id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <span
                className="categoryNavLink"
                onClick={() => handleCategorySelect(category.name)}
              >
                {category.name}
              </span>

              {/* Subcategory Dropdown Only for 10th Category */}
              {hoveredCategory === category._id &&
                category.subCategories &&
                category.subCategories.length > 0 && (
                  <div
                    className="subcategoryDropdown"
                    style={{
                      position: "absolute",
                      left: (index % 10 === 6 || index % 10 === 7 || index % 10 === 8 || index % 10 === 9 || index % 10 === 10) ? "-30rem" : "0rem",
                    }}
                  >
                    <div className="subcategoryColumns">
                      {category.subCategories.map((subCategory) => (
                        <div
                          key={subCategory._id}
                          className="subcategoryColumn"
                          onMouseEnter={() => setHoveredSubCategory(subCategory._id)}
                          onMouseLeave={() => setHoveredSubCategory(null)}
                        >
                          <h4
                            className="subcategoryTitle"
                            onClick={() => handleSubCategorySelect(subCategory.name)}
                          >
                            {subCategory.name}
                          </h4>
                          <div className="subsubcategoryList">
                            {subCategory.subSubCategories &&
                              subCategory.subSubCategories.map((subSubCategory, index) => {
                                const ssName = typeof subSubCategory === "string" ? subSubCategory : subSubCategory?.name || "";
                                return (
                                  <a
                                    key={index}
                                    href="#"
                                    className="subsubcategoryLink"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSubSubCategorySelect(ssName);
                                    }}
                                  >
                                    {ssName}
                                  </a>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Header;
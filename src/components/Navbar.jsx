import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import API_BASE_URL from "../config";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import SubscriptionCountdown from "./SubscriptionCountdown";
import "../styles/Header.css";

// Icons
import {
  FaUser,
  FaShoppingCart,
  FaBox,
  FaSignOutAlt,
  FaCog,
  FaHome,
  FaHeart,
  FaUserCircle,
  FaChevronDown,
  FaCrown,
  FaStore,
  FaQuestionCircle
} from "react-icons/fa";

const Navbar = ({ setSelectedCategory, setSelectedSubCategory, setSelectedSubSubCategory }) => {
  const location = useLocation();
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSubscriptionPanel, setShowSubscriptionPanel] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const subscriptionPlan = subscriptionInfo?.plan || "Free Trial";
  const subscriptionStatus = subscriptionInfo?.status || "None";
  const subscriptionExpiryDate =
    subscriptionInfo?.endDate ||
    subscriptionInfo?.expiryDate ||
    null;
  const subscriptionPanelRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const { cart } = useContext(CartContext);
  const cartItemsCount = cart.reduce((acc, item) => acc + (item.qty || 0), 0);

  useEffect(() => {
    if (!user?.email) return;

    const fetchSubscriptionStatus = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/subscriptionstatus`,
          { params: { email: user.email } }
        );
        setSubscriptionInfo(res.data);
      } catch (err) {
        console.error("Subscription fetch failed", err);
      }
    };

    fetchSubscriptionStatus();
  }, [user?.email]);

  useEffect(() => {
    const handleClickOutside = (event) => {

      // 🔻 CLOSE SUBSCRIPTION PANEL
      if (
        showSubscriptionPanel &&
        subscriptionPanelRef.current &&
        !subscriptionPanelRef.current.contains(event.target)
      ) {
        setShowSubscriptionPanel(false);
      }

      // 🔻 CLOSE PROFILE DROPDOWN
      if (
        showProfileDropdown &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSubscriptionPanel, showProfileDropdown]);




  // 🔥 Auto-Redirect Expired Users
  useEffect(() => {
    if (
      user?.createdByDevopstrio &&
      subscriptionStatus === "Expired" &&
      location.pathname !== "/subscription"
    ) {
      navigate("/subscription", { replace: true });
    }
  }, [user, location.pathname]);

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


  // Subscription Logic
  const isSubscriptionExpired = () => {
    if (!user?.createdByDevopstrio) return false;
    if (subscriptionStatus === "Expired") return true;

    if (subscriptionExpiryDate) {
      const today = new Date();
      const expiry = new Date(subscriptionExpiryDate);
      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);
      return today > expiry;
    }
    return false;
  };

  const isExpired = isSubscriptionExpired();

  const getSubscriptionLabel = () => {
    const plan = user?.subscriptionPlan?.toLowerCase() || "";
    const status = user?.subscriptionStatus?.toLowerCase() || "";
    if (plan.includes("free")) return "Upgrade";
    if (plan.includes("month")) return status === "active" ? "Upgraded" : "Upgrade";
    if (plan.includes("year")) return status === "active" ? "Upgraded" : "Upgrade";
    return "Upgrade";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowProfileDropdown(false);
  };

  const handleDropdownItemClick = (path) => {
    if (isExpired) return;
    setShowProfileDropdown(false);
    navigate(path);
  };

  // Fetch company logo
  const fetchCompanyLogo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/company`);
      if (res.data.data?.logoUrl) setCompanyLogo(res.data.data.logoUrl);
    } catch (err) {
      console.error("Error fetching company logo:", err);
    }
  };

  useEffect(() => {
    fetchCompanyLogo();
  }, []);

  const capitalizeWords = (str) =>
    str?.toLowerCase()?.split(" ")?.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "";

  if (loading) return <div className="ecHeader-loading">Loading...</div>;

  const disableItemStyle = isExpired ? { pointerEvents: "none", opacity: 0.5 } : {};

  return (
    <>
      {isExpired && (
        <div className="navbar-banner" style={{ textAlign: "center" }}>
          Your access has been temporarily disabled due to an inactive account.{" "}
          <span style={{ color: "blue" }}>Please renew your Subscription</span>
        </div>
      )}

      <header
        className="ecHeader-wrapper"
        style={{
          border: "none",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div className="ecHeader-content">
          {/* Logo */}
          <div className="ecHeader-logoContainer">
            <Link to="/" className="ecHeader-logoLink" style={disableItemStyle}>
              {companyLogo ? (
                <img src={companyLogo} alt="Company Logo" className="ecHeader-logoImg" />
              ) : (
                <div className="ecHeader-logoFallback">
                  {/* <FaStore className="ecHeader-logoIcon" />
                  <span className="ecHeader-logoText">MarketPlace</span> */}
                </div>
              )}
              {companyName && (
                <span className="ecHeader-companyName">{companyName.toUpperCase()}</span>
              )}
            </Link>
          </div>

          {/* NAVIGATION */}
          <div className="ecHeader-navContainer">

            {/* Premium Button */}
            {(user?.isAdmin) && (
              <div
                className="ecHeader-navItem ecHeader-premium"
                style={disableItemStyle}
                onClick={() => {
                  if (!user) navigate("/subscription");
                  else setShowSubscriptionPanel(!showSubscriptionPanel);
                }}
              >
                <FaCrown className="ecHeader-navIcon" />
                <span className="ecHeader-navLabel">
                  {user?.isAdmin ? getSubscriptionLabel() : "Premium"}
                </span>
              </div>
            )}

            {/* Subscription Panel */}
            {showSubscriptionPanel && user && (
              <div className="subscription-panel" ref={subscriptionPanelRef}>
                <h3 className="panel-title">Your Subscription</h3>

                <div className="panel-row">
                  <span className="panel-label">Plan:</span>
                  <span className="panel-value">{subscriptionPlan}</span>
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
                    {subscriptionStatus}
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

                <SubscriptionCountdown expiryDate={subscriptionExpiryDate} />

                <button
                  className="panel-btn"
                  onClick={() => navigate("/subscription")}
                >
                  {subscriptionPlan?.toLowerCase().includes("free")
                    ? "Upgrade Plan"
                    : subscriptionStatus === "Active"
                      ? "View Plan"
                      : "Upgrade Plan"}
                </button>
              </div>
            )}

            {/* Other menu */}
            {location.pathname !== "/" && (
              <Link to="/" className="ecHeader-navItem" style={disableItemStyle}>
                <FaHome className="ecHeader-navIcon" />
                <span className="ecHeader-navLabel">Home</span>
              </Link>
            )}

            <Link to="/contact" className="ecHeader-navItem" style={disableItemStyle}>
              <FaQuestionCircle className="ecHeader-navIcon" />
              <span className="ecHeader-navLabel">Help</span>
            </Link>

            {/* 🔥 HIDE CART/ORDERS/WISHLIST FOR ADMIN */}
            {!user?.isAdmin && (
              <Link to="/cart" className="ecHeader-navItem ecHeader-cartWithBadge" id="cartlength">
                <FaShoppingCart className="ecHeader-navIcon" />

                {cartItemsCount > 0 && (
                  <span className="ecHeader-cartBadge">{cartItemsCount}</span>
                )}

                <span className="ecHeader-navLabel">Cart</span>
              </Link>
            )}

            {user ? (
              <>
                {/* Profile Dropdown */}
                <div className="ecHeader-userProfileWrapper">
                  <div
                    ref={profileButtonRef}
                    className="ecHeader-navItem ecHeader-userProfile"
                    style={disableItemStyle}
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <FaUserCircle className="ecHeader-navIcon" />
                    <span className="ecHeader-navLabel">
                      {capitalizeWords(user.name || user.email?.split("@")[0])}
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
                        style={disableItemStyle}
                        onClick={() => handleDropdownItemClick("/profile")}
                      >
                        <FaUser className="ecHeader-dropdownIcon" />
                        <span>My Profile</span>
                      </div>

                      {/* 🔥 HIDE My Orders FOR ADMIN */}
                      {!user.isAdmin && (
                        <div
                          className="ecHeader-dropdownItem"
                          style={disableItemStyle}
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
                          style={disableItemStyle}
                          onClick={() => handleDropdownItemClick("/wishlist")}
                        >
                          <FaHeart className="ecHeader-dropdownIcon" />
                          <span>My Wishlist</span>
                        </div>
                      )}

                      {user.isAdmin && (
                        <div
                          className="ecHeader-dropdownItem"
                          style={disableItemStyle}
                          onClick={() => handleDropdownItemClick("/admin")}
                        >
                          <FaCog className="ecHeader-dropdownIcon" />
                          <span>Admin Portal</span>
                        </div>
                      )}

                      <div className="ecHeader-dropdownDivider"></div>

                      {/* LOGOUT */}
                      <div
                        className="ecHeader-dropdownItem"
                        onClick={handleLogout}
                        style={{
                          pointerEvents: "auto",
                          cursor: "pointer",
                          opacity: 1,
                        }}
                      >
                        <FaSignOutAlt className="ecHeader-dropdownIcon" />
                        <span>Logout</span>
                      </div>
                    </div>
                  )}
                </div>

                {isExpired && (
                  <div
                    className="navbar-outside-logout"
                    onClick={handleLogout}
                    style={{ pointerEvents: "auto", cursor: "pointer", opacity: 1 }}
                  >
                    <FaSignOutAlt /> Logout
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="ecHeader-navItem ecHeader-loginBtn">
                <FaUser className="ecHeader-navIcon" />
                <span className="ecHeader-navLabel">Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;

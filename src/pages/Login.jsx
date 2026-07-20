import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_BASE_URL from "../config";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import Navbar from "../components/Navbar";
import "../styles/Login.css";
import { toast } from "react-toastify";

const Login = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const animationRef = useRef(null);
  const [pageLoading, setPageLoading] = useState(true);


  // Handle login form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const checkSubscriptionExpired = (user) => {
    if (!user || !user.createdByDevopstrio) return false;

    if (user.subscriptionStatus === "Expired") return true;

    if (user.subscriptionExpiryDate) {
      const today = new Date();
      const expiry = new Date(user.subscriptionExpiryDate);

      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);

      if (today > expiry) return true;
    }

    return false;
  };

  const getDeviceType = () => {
    const ua = navigator.userAgent.toLowerCase();

    if (/mobile|android|iphone/.test(ua)) return 1;
    if (/tablet|ipad/.test(ua)) return 2;
    return 3;
  };

  // 🔥 CLEAN OS NAME
  const getOS = () => {
    const ua = navigator.userAgent;

    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "MacOS";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone")) return "iOS";

    return "Web";
  };

  // 🔥 CLEAN BROWSER NAME
  const getBrowser = () => {
    const ua = navigator.userAgent;

    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edg")) return "Edge";

    return "Browser";
  };

  const deviceInfo = {
    deviceType: getDeviceType(),
    brand: getOS(),          // OS instead of vendor
    model: getBrowser(),     // browser name only
    os: "",                  // ❌ remove long userAgent
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);


    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        ...form,
        deviceInfo, // 🔥 added (optional but useful)
      });
      const userData = {
        token: res.data.token,
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        isAdmin: res.data.isAdmin,
        role: res.data.role,
        warehouseId: res.data.warehouseId || null,
        subscriptionId: res.data.subscriptionId,
        subscriptionStatus: res.data.subscriptionStatus,
        subscriptionPlan: res.data.subscriptionPlan,
        createdByDevopstrio: res.data.createdByDevopstrio,           // NEW
        subscriptionExpiryDate: res.data.subscriptionExpiryDate,
      };

      if (!userData.token) {
        setError("Login failed: No token received.");
        setIsLoading(false);
        return;
      }
      sessionStorage.setItem("authToken", userData.token);
      sessionStorage.setItem("user", JSON.stringify(userData));
      const user = JSON.parse(sessionStorage.getItem("user"));

      // ✅ Store warehouseIds for other pages
      if (res.data.warehouseIds && res.data.warehouseIds.length > 0) {
        sessionStorage.setItem("warehouseIds", JSON.stringify(res.data.warehouseIds));
        // store the first one for WarehouseManagement
        sessionStorage.setItem("warehouseId", res.data.warehouseIds[0]);

        if (res.data.warehouseNames && res.data.warehouseNames.length > 0) {
          sessionStorage.setItem("warehouseName", res.data.warehouseNames[0]);
        }
      }

      // ✅ Store nearest warehouse details (for all users)
      if (res.data.nearestWarehouse && res.data.nearestWarehouse.length > 0) {
        sessionStorage.setItem("nearestWarehouse", JSON.stringify(res.data.nearestWarehouse));
      }

      // ✅ Debugging logs
      // console.log("🔐 Logged-in User Role:", userData.role);
      // console.log("📦 Nearest Warehouse Details:", res.data.nearestWarehouse || []);
      // console.log("✅ Stored in session:", {
      //   warehouseIds: sessionStorage.getItem("warehouseIds"),
      //   warehouseId: sessionStorage.getItem("warehouseId"),
      //   warehouseName: sessionStorage.getItem("warehouseName"),
      //   nearestWarehouse: sessionStorage.getItem("nearestWarehouse"),
      // });

      login(userData);

      if (checkSubscriptionExpired(userData)) {
        navigate("/subscription");
        return;
      }

      if (userData.role === "admin") {
        navigate("/");
      } else if (userData.role === "shipping") {
        navigate("/shippingmanagement");
      } else if (userData.role === "delivery") {
        navigate("/deliverymanagement");
      } else if (userData.role === "support") {
        navigate("/supportmanagement");
      }
      else if (userData.role === "purchase") {
        navigate("/purchasedepartmentmanagement");
      }
      else if (userData.role === "deliveryEmployee") {
        navigate("/deliveryemployee");
      }
      else if (userData.role === "warehouse") {
        navigate("/warehousemanagement");
      } else {
        navigate("/"); // default user dashboard or home
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Check your credentials.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError("");

    try {
      const { credential } = credentialResponse;

      // Send credential to backend for verification & signup/login
      const res = await axios.post(`${API_BASE_URL}/api/auth/google-login`, {
        token: credential,
        deviceInfo,
      });

      if (res.data.success) {
        if (res.data.requiresOtpVerification) {
          // Store temp data for OTP verification
          sessionStorage.setItem("googleAuthData", JSON.stringify({
            email: res.data.email,
            name: res.data.name,
            tempToken: res.data.tempToken
          }));
          sessionStorage.setItem("verifyEmail", res.data.email);
          toast.success("OTP has been sent to your email!");

          // Navigate to OTP verification page
          navigate("/userverification");
        } else {
          // Direct login (existing user)
          const userData = {
            token: res.data.token,
            id: res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
            isAdmin: res.data.user.isAdmin,
            role: res.data.role,
            warehouseId: res.data.warehouseId || null,
            isGoogleAuth: true
          };

          sessionStorage.setItem("authToken", userData.token);
          sessionStorage.setItem("user", JSON.stringify(userData));

          // ✅ Store nearest warehouse details (for all users)
          if (res.data.nearestWarehouse && res.data.nearestWarehouse.length > 0) {
            sessionStorage.setItem("nearestWarehouse", JSON.stringify(res.data.nearestWarehouse));
          }

          // ✅ Debugging logs
          // console.log("🔐 Logged-in User Role:", userData.role);
          // console.log("📦 Nearest Warehouse Details:", res.data.nearestWarehouse || []);
          // console.log("✅ Stored in session:", {
          //   warehouseIds: sessionStorage.getItem("warehouseIds"),
          //   warehouseId: sessionStorage.getItem("warehouseId"),
          //   warehouseName: sessionStorage.getItem("warehouseName"),
          //   nearestWarehouse: sessionStorage.getItem("nearestWarehouse"),
          // });

          login(userData);
          if (userData.role === "admin") {
            navigate("/");
          } else {
            navigate("/"); // default user dashboard or home
          }
        }
      } else {
        setError(res.data.message || "Google login blocked");
      }
    }
    catch (err) {
      console.error("Google login error:", err);
      setError(err.response?.data?.message || "Google authentication failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Google OAuth Error Handler
  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  // Fetch company logo from backend
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
    const fetchData = async () => {
      try {
        await fetchCompanyLogo();
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, []);

  if (pageLoading) {
    return (
      <div className="pageLoadingOverlay">
        <div className="pageSpinner"></div>
        <p>Loading Please Wait...</p>
      </div>
    );
  }

  return (
    <><Navbar />
      <div className="ecLogin-container">
        <div className="ecLogin-content">
          <div className="ecLogin-animation-side">
            <div className="ecLogin-create-account">
              <h3>New to Our Platform?</h3>
              <p className="ca">Create an account to access exclusive features.</p>
              <Link to="/signup" className="ecLogin-create-account-btn">Create Account</Link>
            </div>
          </div>
          <div className="ecLogin-form-side" id="userlogin">
            <div className="ecLogin-formContainer">
              <div className="ecLogin-formWrapper">
                {companyLogo && (
                  <div className="ecLogin-logoContainer">
                    <img
                      src={companyLogo}
                      alt="Company Logo"
                      className="ecLogin-logo"
                      onError={(e) => e.target.style.display = "none"}
                    />
                  </div>
                )}
                <h2 className="ecLogin-title">Welcome Back</h2>
                <p className="ecLogin-subtitle">Please login to continue</p>
                {error && <div className="ecLogin-error">{error}</div>}

                {/* Google OAuth Button */}
                <div className="ecLogin-google-section">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    disabled={googleLoading || isLoading}
                  />

                  <div className="ecLogin-divider">
                    <span>or</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="ecLogin-form">
                  <div className="ecLogin-inputGroup">
                    <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required className="ecLogin-input" disabled={isLoading || googleLoading} />
                  </div>
                  <div className="ecLogin-inputGroup">
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="ecLogin-input" disabled={isLoading || googleLoading} />
                  </div>
                  <button
                    type="submit"
                    className={`ecLogin-submitButton ${isLoading ? 'ecLogin-submitButtonLoading' : ''}`}
                    disabled={isLoading || googleLoading}
                  >
                    {isLoading ? <div className="ecLogin-spinner"></div> : 'Login'}
                  </button>
                </form>
                <button type="button" onClick={() => navigate("/forgot-password")} className="ecLogin-forgotPassword" style={{ color: "darkblue", textDecoration: "none" }} disabled={isLoading || googleLoading}>Forgot Password?</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
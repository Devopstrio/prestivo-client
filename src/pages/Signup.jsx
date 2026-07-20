import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleLogin } from '@react-oauth/google';
import API_BASE_URL from "../config";
import "../styles/Login.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [regionCode, setRegionCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const animationRef = useRef(null);

  // Email validation state
  const [emailStatus, setEmailStatus] = useState(null);
  const [passwordMatchStatus, setPasswordMatchStatus] = useState(null);

  const navigate = useNavigate();

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
    sessionStorage.removeItem("googleAuthData");
  }, []);

  useEffect(() => {
    fetchCompanyLogo();
  }, []);

  // Debounced email check
  useEffect(() => {
    if (!email) {
      setEmailStatus(null);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setEmailStatus("checking");
      checkEmail(email);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [email]);

  const checkEmail = async (email) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/check-email`, { email });
      if (res.data.exists) {
        setEmailStatus("exists");
      } else {
        setEmailStatus("available");
      }
    } catch (err) {
      console.error("Error checking email:", err);
      setEmailStatus(null);
    }
  };

  // Live password == confirmPassword check
  useEffect(() => {
    // If both empty -> no status
    if (!password && !confirmPassword) {
      setPasswordMatchStatus(null);
      return;
    }

    if (confirmPassword.length === 0) {
      setPasswordMatchStatus(null);
      return;
    }

    if (password === confirmPassword) {
      setPasswordMatchStatus("match");
    } else {
      setPasswordMatchStatus("mismatch");
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1️⃣ Validate email format first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // 🔥 Strong Password Validation
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special symbol."
      );
      return;
    }

    // 2️⃣ Validate password
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // 3️⃣ Check email availability
    if (emailStatus === "exists") {
      toast.warn("This email is already registered");
      return;
    }

    // 4️⃣ Validate mobile
    if (mobile && !/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
        name,
        email,
        password,
        mobile,
        regionCode,
        type: "signup",
      });

      if (response.data && response.data.success === true) {
        sessionStorage.setItem("verifyEmail", email);
        toast.success("Verification code sent to your email!");
        navigate("/userverification");
      } else {
        setError(response.data.message || "Failed to send verification code.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error processing your request");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Success Handler - UPDATED
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError("");

    try {
      const { credential } = credentialResponse;

      // Send credential to backend for verification & signup/login
      const res = await axios.post(`${API_BASE_URL}/api/auth/google-login`, {
        token: credential
      });

      if (res.data.success) {
        // Only store 'authToken' and 'user' when fully verified/logged in
        if (res.data.requiresOtpVerification) {
          sessionStorage.setItem("googleAuthData", JSON.stringify({
            email: res.data.email,
            name: res.data.name,
            tempToken: res.data.tempToken
          }));
          sessionStorage.setItem("verifyEmail", res.data.email);
          navigate("/userverification");
        }
        else {
          toast.warn("Email already exists. Please login or use another email.");
          setError("This email is already registered");
          navigate("/login");
        }

      } else {
        setError(res.data.message || "Google login failed");
      }
    } catch (err) {
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

  return (
    <div className="ecLogin-container">
      <div className="ecLogin-content">
        {/* Left Side */}
        <div className="ecLogin-animation-side">
          <div className="ecLogin-create-account">
            <h3>Already Have an Account?</h3>
            <p className="ca">Sign in to access your personalized dashboard and continue your journey with us.</p>
            <Link to="/login" className="ecLogin-create-account-btn">
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="ecLogin-form-side">
          <div className="ecLogin-formContainer">
            <div className="ecLogin-formWrapper">
              {/* Logo */}
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

              <h2 className="ecLogin-title">Create Account</h2>
              <p className="ecLogin-subtitle">Join us and start your journey</p>

              {error && <div className="ecLogin-error">{error}</div>}

              {/* Google OAuth Button */}
              <div className="ecLogin-google-section">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={googleLoading}
                />

                <div className="ecLogin-divider">
                  <span>or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="ecLogin-form">
                <div className="ecLogin-inputGroup">
                  <input
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="ecLogin-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="ecLogin-inputGroup">
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`ecLogin-input ${emailStatus === "available" ? "input-success" :
                      emailStatus === "exists" ? "input-error" : ""
                      }`}
                    disabled={isLoading}
                  />
                  {/* Show status */}
                  {emailStatus === "checking" && <p className="info-text">Checking...</p>}
                  {emailStatus === "available" && <p className="success-text">Email available</p>}
                  {emailStatus === "exists" && <p className="error-text">Email already exists</p>}
                </div>

                {/* Mobile + Region Code */}
                <div className="ecLogin-inputGroup">
                  <select
                    value={regionCode}
                    onChange={(e) => setRegionCode(e.target.value)}
                    className="ecLogin-input" id="ecLogin-input"
                    disabled={isLoading}
                  >
                    <option value="+1">+1 (USA/Canada)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (Australia)</option>
                    <option value="+91">+91 (India)</option>
                    <option value="+81">+81 (Japan)</option>
                    <option value="+49">+49 (Germany)</option>
                    <option value="+33">+33 (France)</option>
                  </select>
                  <input
                    name="mobile"
                    type="tel"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="ecLogin-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="ecLogin-inputGroup">
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="ecLogin-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="ecLogin-inputGroup">
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="ecLogin-input"
                    disabled={isLoading}
                  />

                  {/* Password match status message */}
                  {passwordMatchStatus === "match" && (
                    <p className="success-text" style={{ marginTop: "11px", textAlign: "center" }}>
                      Passwords match
                    </p>
                  )}
                  {passwordMatchStatus === "mismatch" && (
                    <p className="error-text" style={{ marginTop: "11px", textAlign: "center" }}>
                      Passwords do not match
                    </p>
                  )}

                </div>

                <button
                  type="submit"
                  className={`ecLogin-submitButton ${isLoading ? 'ecLogin-submitButtonLoading' : ''}`}
                  disabled={isLoading || googleLoading}
                >
                  {isLoading ? (
                    <div className="ecLogin-spinner"></div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
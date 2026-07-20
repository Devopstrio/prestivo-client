import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import { AuthContext } from "../context/AuthContext";
import "../styles/Login.css";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);

  const token = location.state?.token;
  const email = location.state?.email;

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
    fetchCompanyLogo();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token || !email) {
      setError("Invalid or missing reset token. Please request a new password reset.");
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special symbol."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      // Use the correct endpoint for password reset
      const res = await axios.post(`${API_BASE_URL}/api/otp/reset`, {
        token,
        email,
        password
      });

      toast.success(res.data.message || "Password reset successfully!");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error resetting password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ecLogin-container">
      <div className="ecLogin-content">
        {/* Left Side - Icon Animation */}
        <div className="ecLogin-animation-side">

          {/* Back to Login Section */}
          <div className="ecLogin-create-account">
            <h3>Remember your password?</h3>
            <p className="ca">Go back to login and access your account</p>
            <button
              onClick={() => navigate("/login")}
              className="ecLogin-create-account-btn"
              disabled={isLoading}
            >
              Back to Login
            </button>
          </div>
        </div>

        {/* Right Side - Reset Password Form */}
        <div className="ecLogin-form-side">
          <div className="ecLogin-formContainer">
            <div className="ecLogin-formWrapper">
              {/* Logo Section */}
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
              <h2 className="ecLogin-title">Reset Your Password</h2>
              <p className="ecLogin-subtitle">Enter your new password below</p>

              {error && <div className="ecLogin-error">{error}</div>}
              {message && <div className="ecLogin-message">{message}</div>}

              <form onSubmit={handleReset} className="ecLogin-form">
                <div className="ecLogin-inputGroup">
                  <input
                    name="password"
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    required
                    className="ecLogin-input"
                    disabled={isLoading}
                    minLength="8"
                  />
                </div>

                <div className="ecLogin-inputGroup">
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    required
                    className="ecLogin-input"
                    disabled={isLoading}
                    minLength="6"
                  />
                </div>

                <button
                  type="submit"
                  className={`ecLogin-submitButton ${isLoading ? 'ecLogin-submitButtonLoading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="ecLogin-spinner"></div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
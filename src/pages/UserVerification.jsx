import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import "../styles/Login.css";

const UserVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [verificationType, setVerificationType] = useState("signup"); // 'signup' or 'google'
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Fetch company logo from backend
  const fetchCompanyLogo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/company`);
      if (res.data.data && res.data.data.logo) {
        setCompanyLogo(res.data.data.logo);
      }
    } catch (err) {
      console.error("Error fetching company logo:", err);
    }
  };

  // Get email and determine verification type
  useEffect(() => {
    const userEmail = sessionStorage.getItem("verifyEmail");
    const googleAuthData = sessionStorage.getItem("googleAuthData");

    if (googleAuthData) {
      const { email } = JSON.parse(googleAuthData);
      setEmail(email);
      setVerificationType("google");
    } else if (userEmail) {
      setEmail(userEmail);
      setVerificationType("signup");
    } else {
      navigate("/signup");
    }

    fetchCompanyLogo();
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Verify OTP - UPDATED for both regular and Google signup
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const enteredOtp = otp.join("");

    try {
      let response;

      if (verificationType === "google") {
        // Google OTP verification
        response = await axios.post(`${API_BASE_URL}/api/auth/verify-google-otp`, {
          email,
          otp: enteredOtp
        });
      } else {
        // Regular OTP verification
        response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
          email,
          otp: enteredOtp
        });
      }

      if (response.data.success) {
        // Clear session storage
        // sessionStorage.removeItem("verifyEmail");
        // sessionStorage.removeItem("googleAuthData");

        const emailToStore = response.data.user?.email || email;
        sessionStorage.setItem("verifyEmail", emailToStore);

        if (response.data.token) {
          // Store authentication data
          sessionStorage.setItem("authToken", response.data.token);
          sessionStorage.setItem("user", JSON.stringify(response.data.user));
        }

        toast.success(verificationType === "google"
          ? "Google account verified successfully!"
          : "Account created successfully!"
        );

        if (verificationType === "google") {
          navigate("/createprofile"); // Google signup → home
          // window.location.reload();
        } else {
          navigate("/createprofile"); // Normal signup → login page
        }
      } else {
        setError(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error verifying OTP");
    }

    setIsLoading(false);
  };

  // Resend OTP - UPDATED for both types
  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      setError("");

      let response;
      if (verificationType === "google") {
        const googleAuthData = JSON.parse(sessionStorage.getItem("googleAuthData"));
        response = await axios.post(`${API_BASE_URL}/api/auth/google-login`, {
          token: googleAuthData.tempToken
        });
      } else {
        response = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
          email,
          type: "signup",
        });
      }

      if (response.data.success) {
        toast.success("A new OTP has been sent to your email.");
        setTimeLeft(300); // reset timer
        setOtp(["", "", "", "", "", ""]);
      } else {
        setError("Failed to resend OTP. Try again later.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error resending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ecLogin-container">
      <div className="ecLogin-content">
        {/* Left Side */}
        <div className="ecLogin-animation-side">
          <div className="ecLogin-create-account">
            <h3>Verify Your Account</h3>
            <p style={{ color: "white" }}>Enter the 6-digit code sent to your email to complete your {verificationType === "google" ? "Google signup" : "registration"}.</p>
            <Link to="/login" className="ecLogin-create-account-btn">
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Right Side - Verification Form */}
        <div className="ecLogin-form-side">
          <div className="ecLogin-formContainer">
            <div className="ecLogin-formWrapper">
              {/* Logo */}
              {companyLogo && (
                <div className="ecLogin-logoContainer">
                  <img
                    src={`${API_BASE_URL}${companyLogo}`}
                    alt="Company Logo"
                    className="ecLogin-logo"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <h2 className="ecLogin-title">
                {verificationType === "google" ? "Verify Google Signup" : "Verify Your Email"}
              </h2>
              <p className="ecLogin-subtitle">We've sent a code to {email}</p>

              {error && <div className="ecLogin-error">{error}</div>}

              <form onSubmit={handleVerify} className="ecLogin-form">
                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      className="otp-input"
                      disabled={isLoading || timeLeft <= 0}
                      required
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="otp-timer">
                  {timeLeft > 0 ? (
                    <p>Time remaining: <strong>{formatTime(timeLeft)}</strong></p>
                  ) : (
                    <p className="error-text">OTP expired</p>
                  )}
                </div>

                <button
                  type="submit"
                  className={`ecLogin-submitButton ${isLoading ? 'ecLogin-submitButtonLoading' : ''}`}
                  disabled={isLoading || timeLeft <= 0}
                >
                  {isLoading ? (
                    <div className="ecLogin-spinner"></div>
                  ) : (
                    `Verify ${verificationType === "google" ? "Google Account" : "Account"}`
                  )}
                </button>
              </form>

              <div className="resend-otp">
                {timeLeft <= 0 && (
                  <button
                    onClick={handleResendOtp}
                    className="resend-button"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                )}
                <p>
                  Didn't receive the code?{" "}
                  <Link to="/signup" className="resend-button">Back to sign up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserVerification;
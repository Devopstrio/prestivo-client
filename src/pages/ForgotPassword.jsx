import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import "../styles/Login.css";
import API_BASE_URL from "../config";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [emailStatus, setEmailStatus] = useState(null);
  
  const navigate = useNavigate();
  const [companyLogo, setCompanyLogo] = useState(null);
  const inputRefs = useRef([]);

  // Timer countdown effect
  useEffect(() => {
    if (!otpSent || timeLeft <= 0) return;

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [otpSent, timeLeft]);

  // Reset timer when OTP is sent
  useEffect(() => {
    if (otpSent) {
      setTimeLeft(600); // Reset to 10 minutes
    }
  }, [otpSent]);

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
        setEmailStatus("notfound");
      }
    } catch (err) {
      console.error("Error checking email:", err);
      setEmailStatus(null);
    }
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

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // ✅ Send OTP using NodeMailer backend
  const sendOtp = async () => {
    if (!email) {
      setError("Please enter your email address!");
      return false;
    }

    if (emailStatus === "notfound") {
      setError("Account not available. Redirecting to Signup...");
      setTimeout(() => navigate("/signup"), 2000);
      return false;
    }

    if (emailStatus !== "exists") {
      setError("Checking email... please wait.");
      return false;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/otp/send`, { email });

      setMessage(res.data.message);
      setOtpSent(true);
      setError("");
      return true;
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Please try again.");
      setMessage("");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    await sendOtp();
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP!");
      return;
    }

    if (timeLeft <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/otp/verify`, {
        email,
        otp: enteredOtp,
      });

      if (res.data.valid) {
        // Show success alert
        toast.success("OTP Verified Successfully!");
        navigate("/reset-password", { state: { token: enteredOtp, email } });
      } else {
        // Show invalid alert
        toast.error("Invalid OTP! Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid OTP! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format time for display (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

        {/* Right Side - Forgot Password Form */}
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
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}

              <h2 className="ecLogin-title">Reset Your Password</h2>
              <p className="ecLogin-subtitle">
                {otpSent
                  ? "Enter the OTP sent to your email"
                  : "Enter your email to receive a verification code"}
              </p>

              {error && <div className="ecLogin-error">{error}</div>}
              {message && <div className="ecLogin-message">{message}</div>}

              {!otpSent ? (
                <form onSubmit={handleGenerateOtp} className="ecLogin-form">
                  <div className="ecLogin-inputGroup">
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      required
                      className={`ecLogin-input ${emailStatus === "exists"
                        ? "input-success"
                        : emailStatus === "notfound"
                          ? "input-error"
                          : ""
                        }`}
                      disabled={isLoading}
                    />
                    {/* Show status */}
                    {emailStatus === "checking" && (
                      <p className="info-text">Checking...</p>
                    )}
                    {emailStatus === "exists" && (
                      <p className="success-text">Account found</p>
                    )}
                    {emailStatus === "notfound" && (
                      <p className="error-text">Account not available</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={`ecLogin-submitButton ${
                      isLoading ? "ecLogin-submitButtonLoading" : ""
                    }`}
                    disabled={isLoading || emailStatus === "notfound"}
                  >
                    {isLoading ? (
                      <div className="ecLogin-spinner"></div>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="ecLogin-form">
                  {email && (
                    <div className="email-display">
                      <p>
                        Code sent to: <strong>{email}</strong>
                      </p>
                       <p className="otp-text">Enter the 6-digit code:</p>
                    </div>
                  )}
                  
                  <div className="otp-container">
                    <div className="otp-inputs">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          className="otp-input"
                          disabled={isLoading}
                          required
                        />
                      ))}
                    </div>
                  </div>

                  {/* Timer display */}
                  <div className="ecLogin-timer">
                    <span>Time remaining: </span>
                    <span className={timeLeft < 60 ? "ecLogin-timer-warning" : ""}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className={`ecLogin-submitButton ${
                      isLoading ? "ecLogin-submitButtonLoading" : ""
                    }`}
                    disabled={isLoading || timeLeft <= 0}
                  >
                    {isLoading ? (
                      <div className="ecLogin-spinner"></div>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={sendOtp}
                    className="ecLogin-forgotPassword"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
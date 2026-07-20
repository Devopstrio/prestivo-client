import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
import "../styles/PasswordConfirmation.css";

const PasswordConfirmation = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: security key, 3: new password
  const [securityKey, setSecurityKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [companyLogo, setCompanyLogo] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(0); // Track completed steps

  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (window.messageTimeout) clearTimeout(window.messageTimeout);
    window.messageTimeout = setTimeout(
      () => setMessage({ type: "", text: "" }),
      5000
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);

    fetchCompanyLogo();
  }, []);

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

  // Step 1: verify email
  const verifyEmail = async () => {
    if (!email) {
      showMessage("error", "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/departments/verify-email`,
        { email }
      );

      if (res.data.verified) {
        setStep(2);
        setCompletedSteps(1);
        showMessage("success", "Email verified. Please enter your security key.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Email not found";
      showMessage("error", errorMsg);
    }
    setLoading(false);
  };

  // Step 2: verify security key
  const verifyKey = async () => {
    if (!securityKey) {
      showMessage("error", "Please enter your security key");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/departments/verify-security-key`, {
        email,
        securityKey,
      });
      setStep(3);
      setCompletedSteps(2);
      showMessage("success", "Security key verified. Please set your new password.");
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "Invalid security key"
      );
    }
    setLoading(false);
  };

  // Step 3: update password
  const updatePassword = async () => {
    if (!newPassword) {
      showMessage("error", "Please enter a new password");
      return;
    }

    // ✅ Strong Password Rule (min 8 chars + small + caps + number + symbol)
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!strongPasswordRegex.test(newPassword)) {
      showMessage(
        "error",
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special symbol."
      );
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/departments/set-password`, {
        email,
        newPassword,
        securityKey,
      });

      setCompletedSteps(3);
      showMessage("success", "Password updated successfully! You can now log in.");

      setTimeout(() => {
        sessionStorage.clear();
        navigate("/login");
      }, 2000);
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "Error updating password"
      );
    }
    setLoading(false);
  };

  const progressPercentage = Math.round((completedSteps / 3) * 100);

  const stepDescriptions = {
    1: "Email Verification",
    2: "Security Key",
    3: "Set New Password",
  };

  const getStepStatus = (stepNum) => {
    if (stepNum < completedSteps) return "completed";
    if (stepNum === completedSteps) return "in-progress";
    return "pending";
  };

  return (
    <div className="passConfirm-container">
      <div className="passConfirm-form">

        <div className="passConfirm-logoContainer">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt="Company Logo"
              className="passConfirm-logo"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="passConfirm-logoFallback">
              <h2>Company Logo</h2>
            </div>
          )}
        </div>

        <h2>Set Your Password</h2>

        {/* Progress Bar */}
        <div className="passConfirm-progressSection">
          <div className="passConfirm-progressHeader">
            <span className="passConfirm-progressText">
              {step === 1 && "Enter your email to get started"}
              {step === 2 && "Check your email for security key"}
              {step === 3 && "Create your new password"}
            </span>
            <span className="passConfirm-progressPercentage">
              {progressPercentage}%
            </span>
          </div>

          <div className="passConfirm-progressBar">
            <div
              className="passConfirm-progressFill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="passConfirm-stepIndicator">
          {[1, 2, 3].map((stepNum) => {
            const status = getStepStatus(stepNum);
            return (
              <div
                key={stepNum}
                className={`passConfirm-stepDot ${
                  status === "completed"
                    ? "completed"
                    : status === "in-progress"
                    ? "active"
                    : ""
                }`}
                title={`Step ${stepNum}: ${stepDescriptions[stepNum]}`}
              >
                {status === "completed" ? "✓" : stepNum}
              </div>
            );
          })}
        </div>

        {message.text && (
          <div
            className={`passConfirm-alert passConfirm-alert-${
              message.type === "success" ? "success" : "error"
            }`}
          >
            {message.text}
          </div>
        )}

        {step === 1 && (
          <div className="passConfirm-formGroup">
            <label>Email</label>
            <input
              type="email"
              className="passConfirm-formControl"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="passConfirm-btn passConfirm-btn-primary"
              onClick={verifyEmail}
              disabled={loading || !email}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="passConfirm-formGroup">
            <label>Security Key</label>
            <input
              type="text"
              className="passConfirm-formControl"
              placeholder="Enter security key from email"
              value={securityKey}
              onChange={(e) => setSecurityKey(e.target.value)}
            />
            <button
              className="passConfirm-btn passConfirm-btn-primary"
              onClick={verifyKey}
              disabled={loading || !securityKey}
            >
              {loading ? "Verifying..." : "Verify Security Key"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="passConfirm-formGroup">
            <label>New Password</label>
            <input
              type="password"
              className="passConfirm-formControl"
              placeholder="Min 8 characters, with small, caps, number, and symbol"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="passConfirm-btn passConfirm-btn-primary"
              onClick={updatePassword}
              disabled={loading || !newPassword}
            >
              {loading ? "Updating..." : "Set Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordConfirmation;

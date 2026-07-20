import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaArrowLeft,
  FaCreditCard,
  FaExclamationTriangle,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import TermsConditions from "./TermsConditions";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import Select from "react-select";
import countryList from "react-select-country-list";
import countriesData from "country-telephone-data";
import axios from "axios";
import PaymentGateway from "./PaymentGateway";
import API_BASE_URL from "../config";
import "../styles/SubscriptionPopupForm.css";
import { AuthContext } from "../context/AuthContext";

export default function SubscriptionPopupForm({ plan, onClose, subscriptionId }) {
  const { user } = useContext(AuthContext);
  const countryOptions = useMemo(() => countryList().getData(), []);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [step, setStep] = useState("register");
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    regionCode: "",
    businessType: "",
    companyName: "",
    companyAddress: "",
    businessContent: "",
    subscriptionId: "",
  });

  const [cancelReason, setCancelReason] = useState("");

  // Timer effect
  useEffect(() => {
    if (step === "otp" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step === "otp" && timeLeft === 0) {
      setIsResendEnabled(true);
    }
  }, [step, timeLeft]);

  // Reset timer when OTP step is entered
  useEffect(() => {
    if (step === "otp") {
      setTimeLeft(300);
      setIsResendEnabled(false);
    }
  }, [step]);

  // ---------- NEW: Fetch existing subscription details when subscriptionId prop is present ----------
  useEffect(() => {
    if (!subscriptionId) {
      console.log("📦 No subscriptionId prop provided to popup");
      return;
    }

    let cancelled = false;
    const fetchSubscription = async () => {
      try {
        console.log("📦 Received subscriptionId prop in popup:", subscriptionId);
        setIsLoading(true);

        const res = await axios.get(`${API_BASE_URL}/api/subscription/${subscriptionId}`);
        if (!res?.data?.data) {
          console.warn("No subscription data returned for id:", subscriptionId);
          return;
        }
        const data = res.data.data;

        // Populate form with existing subscription data
        setForm((prev) => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          mobile: data.mobile || prev.mobile,
          regionCode: data.regionCode || prev.regionCode || "",
          businessType: data.plan || prev.businessType || "",
          companyName: data.companyName || prev.companyName || "",
          companyAddress: data.companyAddress || prev.companyAddress || "",
          businessContent: data.businessContent || prev.businessContent || "",
          subscriptionId: data.subscriptionId || subscriptionId,
        }));

        // Try to set selectedCountry from regionCode (if present)
        if (data.regionCode) {
          const dial = data.regionCode.replace("+", "");
          const found = countriesData.allCountries.find((c) => c.dialCode === dial);
          if (found) {
            const countryOpt = countryOptions.find(
              (opt) =>
                opt.label.toLowerCase() === found.name.toLowerCase() ||
                opt.value.toLowerCase() === found.iso2.toLowerCase()
            );
            if (countryOpt && !cancelled) setSelectedCountry(countryOpt);
          }
        }

        // If a user is already logged in, skip register step
        if (user && user.email) setStep("form");
        // If subscription was found, go to form (so user can update or view)
        if (!cancelled) setStep("form");

        // console.log("✅ Subscription data loaded into popup:", data.subscriptionId);
      } catch (err) {
        // console.error("❌ Error fetching subscription by id:", err?.response?.data || err.message);
        // Show gentle alert so user knows fetching failed
        // (You can remove this if you prefer silent fail)
        toast.error("Could not load subscription details. You can still fill the form manually.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchSubscription();

    return () => {
      cancelled = true;
    };
  }, [subscriptionId, countryOptions, user]);

  // ✅ Auto-skip registration if user already logged in
  useEffect(() => {
    if (user && user.email) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email,
      }));
      setStep("form");
    }
  }, [user]);

  // ✅ Handle country code selection
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    const found = countriesData.allCountries.find((c) => c.iso2.toUpperCase() === country.value);
    const code = found ? `+${found.dialCode}` : "";
    setForm((prev) => ({ ...prev, regionCode: code }));
  };

  const discountGBP = 49.99;

  // ✅ Step 1: Admin Registration (No Password)
  const handleAdminRegister = async (e) => {
    e.preventDefault();
    try {
      if (!adminData.email.includes("@")) {
        toast.warn("Please enter a valid email address.");
        return;
      }

      setIsLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/subscription/register-user`, adminData);
      if (res.status === 201) {
        toast.success("OTP has been sent to your email!");
        setStep("otp");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warn("User already exists!");
      } else {
        toast.error(error.response?.data?.message || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ OTP Input Handlers
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/subscription/register-user`, adminData);
      if (res.status === 201) {
        toast.success("New OTP has been sent to your email!");
        setTimeLeft(300);
        setIsResendEnabled(false);
        setOtp(["", "", "", "", "", ""]);
        // Focus first input
        document.getElementById("otp-0").focus();
      }
    } catch (error) {
      console.error("❌ Resend OTP Error:", error);
      toast.error(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Step 2: OTP Verification
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.warn("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/subscription/verify-otp`, {
        email: adminData.email,
        otp: otpValue,
      });
      if (res.status === 200) {
        toast.success("OTP Verified Successfully!");
        setForm((prev) => ({
          ...prev,
          name: adminData.name,
          email: adminData.email,
        }));
        setStep("form");
      }
    } catch (error) {
      // console.error("❌ OTP Verification Error:", error);
      toast.error(error.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Step 3: Handle form submission (create subscription)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const payload = {
        ...form,
        plan: plan.name,
        amount: plan.gbp,
        paymentType: "",
        paymentId: "",
        paymentStatus: "Pending",
        termsAccepted: acceptedTerms,
      };

      const response = await axios.post(`${API_BASE_URL}/api/subscription/create`, payload);

      // Accept both 200 (update) and 201 (create)
      if ((response.status === 200 || response.status === 201) && response.data.data?._id) {
        // Save subscription ID from response
        setForm((prev) => ({
          ...prev,
          subscriptionId: response.data.data.subscriptionId || response.data.data._id,
        }));

        // If you want the parent to know the new id, you can call a callback here.
        // (left out to not change existing operation)

        // Handle Free Trial Plan separately
        if (plan.name.toLowerCase().includes("free")) {
          toast.success("🎉 Thank you for selecting the Free Trial Plan! We'll send your login credentials soon!.");
          onClose();
          return;
        }

        // Proceed to review step for paid plans
        setStep("review");
      } else {
        toast.error("⚠️ Failed to save subscription details. Please try again.");
        // console.error("❌ Unexpected response:", response);
      }
    } catch (error) {
      // console.error("❌ Subscription API error:", error);
      toast.error(error.response?.data?.message || "Something went wrong while saving your subscription.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPay = () => {
    if (!form.subscriptionId) {
      toast.error("Subscription ID missing. Please try saving again.");
      return;
    }

    // Free Trial Plan should not go to payment gateway
    if (plan.name.toLowerCase().includes("free")) {
      toast.success("🎉 This is a Free Trial Plan! You don't need to make a payment. Login credentials will be sent soon.");
      onClose();
      return;
    }

    setStep("payment");
  };

  // Cancel, smart cancel etc. (same as before)
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const cancelPayload = {
        ...form,
        plan: plan.name,
        amount: plan.gbp,
        reason: cancelReason,
      };

      const response = await axios.post(`${API_BASE_URL}/api/subscription/cancel`, cancelPayload);

      if (response.status === 200) {
        toast.success("Subscription canceled successfully!");
        onClose();
      } else {
        toast.error("Failed to cancel subscription. Please try again.");
      }
    } catch (error) {
      console.error("❌ Cancel API error:", error);
      toast.error("Something went wrong while canceling your subscription.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartCancel = () => {
    const hasFilled =
      form.name ||
      form.email ||
      form.mobile ||
      form.businessType ||
      form.businessContent ||
      form.companyName ||
      form.companyAddress ||
      selectedCountry;

    if (hasFilled) setStep("cancel");
    else onClose();
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render payment, review, cancel, registration, OTP, main form same as before
  if (step === "payment") {
    return <PaymentGateway amountGBP={plan.gbp} plan={plan.name} user={form} onClose={onClose} />;
  }

  if (step === "review") {
    return (
      <div className="popup-overlay">
        <div className="popup-form-box">
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
          <h2 className="popup-title"><FaCheckCircle className="icon-success" /> Review & Confirm</h2>
          <div className="review-box">
            <p><strong>Name:</strong> {form.name}</p>
            <p><strong>Email:</strong> {form.email}</p>
            <p><strong>Mobile:</strong> {form.regionCode} {form.mobile}</p>
            <p><strong>Business Type:</strong> {form.businessType}</p>
            <p><strong>Company Name:</strong> {form.companyName}</p>
            <p><strong>Company Address :</strong> {form.companyAddress}</p>
            <p><strong>Description:</strong> {form.businessContent || "N/A"}</p>
            <p><strong>Plan:</strong> {plan.name}</p>
            <strong>Amount:</strong> £{plan.gbp} GBP
            {plan.name === "Yearly Plan" && <p className="discount-text">Save £{discountGBP} GBP</p>}
            <p><strong>Subscription ID:</strong> {form.subscriptionId || "Not assigned yet"}</p>
          </div>

          <div className="form-btn-group">
            <button className="btn-primary" onClick={handleProceedToPay}><FaCreditCard /> Proceed to PayPal</button>
            <button className="btn-secondary" onClick={handleSmartCancel}><FaArrowLeft /> Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "cancel") {
    return (
      <div className="popup-overlay">
        <div className="popup-form-box">
          <button className="close-btn close-disabled" disabled><FaTimes /></button>
          <h2 className="popup-title">Cancel Subscription</h2>
          <p>We'd love to know why you decided to cancel.</p>
          <form onSubmit={handleCancelSubmit}>
            <textarea className="textarea-field" placeholder="Reason for cancellation..." required onChange={(e) => setCancelReason(e.target.value)}></textarea>
            <div className="form-btn-group">
              <button type="submit" className="btn-primary" id="btn-primary" disabled={isLoading}>{isLoading ? "Submitting..." : "Submit Feedback"}</button>
              <button type="button" className="btn-secondary" onClick={() => setStep("form")}>Back to Form</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!user && step === "register") {
    return (
      <div className="popup-overlay">
        <div className="popup-form-box">
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
          <h2 className="popup-title">Registration</h2>
          <div className="popup-info-box">
            <div className="info-item">
              <FaExclamationTriangle className="info-icon warning" />
              <p>Please enter a <strong>valid email address</strong> — an OTP will be sent to this email.</p>
            </div>
            <div className="info-item">
              <FaEnvelope className="info-icon mail" />
              <p>Check your <strong>inbox or spam folder</strong> for the OTP email after submission.</p>
            </div>
          </div>
          <form onSubmit={handleAdminRegister} className="popup-main-form">
            <input type="text" placeholder="Full Name" required onChange={(e) => setAdminData({ ...adminData, name: e.target.value })} />
            <input type="email" placeholder="Email Address" required onChange={(e) => setAdminData({ ...adminData, email: e.target.value })} />
            <div className="form-btn-group" style={{ justifyContent: "center" }}>
              <button type="submit" className="btn-primary" id="btn-primary" disabled={isLoading}>{isLoading ? "Registering..." : "Submit"}</button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!user && step === "otp") {
    return (
      <div className="popup-overlay">
        <div className="popup-form-box">
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
          <h2 className="popup-title">Verify OTP</h2>
          <p className="otp-instruction">Enter the 6-digit code sent to your email</p>

          <div className="otp-timer">
            <FaClock className="timer-icon" />
            <span>Time remaining: {formatTime(timeLeft)}</span>
          </div>

          <form onSubmit={handleOtpVerify} className="popup-main-form">
            <div className="otp-container">
              {otp.map((data, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  className="otp-input"
                />
              ))}
            </div>

            <div className="resend-otp-section">
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendOtp}
                disabled={!isResendEnabled || isLoading}
              >
                {isLoading ? "Sending..." : "Resend OTP"}
              </button>
            </div>

            <div className="form-btn-group" style={{ justifyContent: "center" }}>
              <button type="submit" className="btn-primary" id="btn-primary" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setStep("register")}>Back</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main form
  const isFormValid = form.name && form.email && form.mobile && form.businessType && selectedCountry;

  return (
    <div className="popup-overlay">
      <div className="popup-form-box">
        <button className="close-btn" onClick={onClose}><FaTimes /></button>

        <h2 className="popup-title">{plan.name}</h2>
        <p className="popup-plan-amount">
          <strong>Plan Amount:</strong> ${plan.gbp} {plan.name === "Yearly Plan" && <span className="discount-text"> (Save ${discountGBP})</span>}
        </p>

        <form onSubmit={handleSubmit} className="popup-main-form">
          <input placeholder="Full Name" required value={form.name} readOnly disabled />
          <input type="email" placeholder="Email" required value={form.email} readOnly disabled />
          <Select options={countryOptions} value={selectedCountry} onChange={handleCountryChange} placeholder="Select Country" className="country-select" />
          {form.regionCode && <input value={form.regionCode} readOnly className="region-code" />}
          <input placeholder="Mobile Number" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <select required value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })}>
            <option value="">Select Business Type</option>
            <option>Individual</option>
            <option>Startup</option>
            <option>Enterprise</option>
          </select>

          {/* Company Name */}
          <input placeholder="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />

          {/* Company Address */}
          <textarea placeholder="Company Full Address" value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} required />

          <textarea placeholder="Business Description" value={form.businessContent} onChange={(e) => setForm({ ...form, businessContent: e.target.value })}></textarea>

          {/* TERMS & CONDITIONS */}
          <div className="terms-inline-box">
            <div className="terms-inline-header">
              <span className="terms-title">Terms & Conditions</span>

              <button
                type="button"
                className="terms-toggle-btn"
                onClick={() => setShowTerms(true)}   // ✅ OPEN MODAL
              >
                <FaEye />
                <span>View Terms</span>
              </button>
            </div>

            {/* Short preview only */}
            <div className="terms-inline-content">
              <p>
                By subscribing, you agree to our admin usage policies, billing terms,
                data protection rules, and security guidelines.
              </p>
            </div>

            {/* Controlled checkbox (auto-checked after modal accept) */}
            <label className="terms-checkbox-inline">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  if (e.target.checked) {
                    setShowTerms(true); // open modal before accepting
                  } else {
                    setAcceptedTerms(false); // allow uncheck
                  }
                }}
              />
              <span>I have read and agree to the Terms & Conditions</span>
            </label>
          </div>

          <TermsConditions
            isOpen={showTerms}
            onClose={() => setShowTerms(false)}
            onAccept={() => setAcceptedTerms(true)}
          />


          {/* show subscriptionId for debug/visibility */}
          <p style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
            <strong>Subscription ID:</strong> {form.subscriptionId || "Not assigned yet"}
          </p>

          <div className="form-btn-group" style={{ justifyContent: "center" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={!isFormValid || !acceptedTerms || isLoading}
            >
              {isLoading ? "Saving..." : "Review & Confirm"}
            </button>
            <button type="button" className="btn-secondary" onClick={handleSmartCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
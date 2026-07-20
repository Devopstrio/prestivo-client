import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// React Icons
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiClock,
  FiRefreshCw,
  FiEdit
} from "react-icons/fi";

import "../styles/DevopstrioLogin.css";

const OTP_EXPIRY_SECONDS = 300; // 5 minutes

const DevopstrioLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email"); // email | otp
  const [loading, setLoading] = useState(false);

  // ⏳ OTP Timer
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [otpExpired, setOtpExpired] = useState(false);

  const navigate = useNavigate();

  /* =====================================================
     🔹 OTP TIMER EFFECT
  ===================================================== */
  useEffect(() => {
    if (step !== "otp") return;

    if (timeLeft <= 0) {
      setOtpExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* =====================================================
     🔹 STEP 1: SEND OTP
  ===================================================== */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.warn("Please enter email");

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/api/devopstrio/login`, {
        email,
      });

      if (res.data.success && res.data.otpSent) {
        toast.success("OTP sent to your email");

        // Reset timer
        setTimeLeft(OTP_EXPIRY_SECONDS);
        setOtpExpired(false);
        setOtp("");

        setStep("otp");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🔹 STEP 2: VERIFY OTP & LOGIN
  ===================================================== */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otpExpired)
      return toast.error("OTP expired. Please request a new one.");

    if (!otp) return toast.warn("Please enter OTP");

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/api/devopstrio/login`, {
        email,
        otp,
      });

      if (res.data.success) {
        sessionStorage.setItem("devopstrioToken", res.data.token);
        sessionStorage.setItem(
          "devopstrioUser",
          JSON.stringify(res.data.user)
        );

        toast.success("Login Successfully");
        navigate("/subscriptionverification");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dev-login-container">
      <div className="dev-login-box">

        {/* Logo */}
        <img
          src="/Home/devopstriologo.jpg"
          className="dev-login-logo"
          alt="Devopstrio Logo"
        />

        <h2 className="dev-title">Devopstrio Portal Login</h2>

        {/* ================= EMAIL STEP ================= */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="dev-login-form">

            <div className="dev-input-group">
              <FiMail className="dev-input-icon" />
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="dev-login-btn" disabled={loading}>
              <FiLogIn className="btn-icon" />
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* ================= OTP STEP ================= */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="dev-login-form">

            <div className="dev-input-group">
              <FiLock className="dev-input-icon" />
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value)}
                disabled={otpExpired}
                required
              />
            </div>

            {/* TIMER */}
            <div
              style={{
                textAlign: "center",
                marginBottom: 12,
                color: otpExpired ? "#dc2626" : "#374151",
                fontSize: 14,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FiClock />
              {otpExpired
                ? "OTP expired"
                : `OTP expires in ${formatTime(timeLeft)}`}
            </div>

            <button
              type="submit"
              className="dev-login-btn"
              disabled={loading || otpExpired}
            >
              <FiLogIn className="btn-icon" />
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            {/* ACTION LINKS */}
            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span
                style={{
                  cursor: "pointer",
                  color: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onClick={() => setStep("email")}
              >
                <FiEdit /> Change Email
              </span>

              {otpExpired && (
                <span
                  style={{
                    cursor: "pointer",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onClick={() => setStep("email")}
                >
                  <FiRefreshCw /> Resend OTP
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DevopstrioLogin;

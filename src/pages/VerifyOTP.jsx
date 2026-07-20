import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../config";
import axios from "axios";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const email = location.state?.email; // get email from previous page

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, { email, otp });
      setMessage(res.data.message);
      // Navigate to reset password page
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Verify OTP</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify OTP</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

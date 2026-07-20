import React, { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";

const SubscriptionCountdown = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  const expDate = expiryDate ? new Date(expiryDate) : null;

  useEffect(() => {
    if (!expDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = expDate - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      setIsExpired(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!expiryDate) return null;

  if (isExpired) {
    return (
      <div style={expiredStyle}>
        <FaClock size={20} color="#ff0000" />
        <span style={{ color: "#d00000", fontWeight: "700" }}>
          Your plan has been expired. Please renew your plan.
        </span>
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div style={activeStyle}>
      <FaClock size={20} color="#2563eb" />
      <div>
        <strong>Subscription Expires In:</strong>
        <br />
        <span style={{ color: "#2563eb", fontWeight: "700" }}>
          {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
        </span>
      </div>
    </div>
  );
};

const activeStyle = {
  background: "#eef6ff",
  border: "2px solid #2563eb",
  padding: "12px 16px",
  borderRadius: "10px",
  maxWidth: "430px",
  display: "flex",
  gap: "10px",
  margin: "10px auto",
  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
};

const expiredStyle = {
  background: "#ffe5e5",
  border: "2px solid #ff4d4d",
  padding: "12px 16px",
  borderRadius: "10px",
  maxWidth: "430px",
  display: "flex",
  gap: "10px",
  margin: "10px auto",
  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
};

export default SubscriptionCountdown;

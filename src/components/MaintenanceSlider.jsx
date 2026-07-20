import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiTool,
  FiAlertTriangle,
  FiClock,
  FiCalendar,
  FiX,
  FiShield,
  FiServer
} from "react-icons/fi";
import API_BASE_URL from "../config";
import "../styles/MaintenanceSlider.css";
import "../styles/MaintenanceBlock.css";

/* -------------------------------------------------------------
    ⭐ GLOBAL STATE EXPORT (NEW)
------------------------------------------------------------- */
export const MaintenanceBlockState = { isBlocked: false };

const MaintenanceSlider = () => {
  const [maintenance, setMaintenance] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMaintenance, setActiveMaintenance] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  /* -------------------------------------------------------------
      ⭐ Allowed routes: Block screen should NOT show
  ------------------------------------------------------------- */
  const allowedRoutes = [
    "/devopstriologin",
    "/subscriptionverification"
  ];

  const currentPath = window.location.pathname;

  const isAllowedRoute = allowedRoutes.some(route =>
    currentPath.startsWith(route)
  );

  /* ------------------------------------------------------------- */
  useEffect(() => {
    loadMaintenance();
  }, []);

  /* ----------------------------------------------------------------
      ➕ AUTO-RELOAD CHECKER
  ---------------------------------------------------------------- */
  useEffect(() => {
    if (!maintenance) return;

    const interval = setInterval(() => {
      if (isAllowedRoute) {
        console.log("Allowed route → No auto-refresh");
        return;
      }

      const now = new Date().getTime();

      maintenance.forEach((item) => {
        const start = new Date(item.startTime).getTime();

        if (now >= start) {
          console.log("Auto reload: maintenance start reached");
          window.location.reload();
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [maintenance]);


  const loadMaintenance = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/subscription/maintenance/all`);
      const allMaintenance = res.data.data || [];

      const filtered = [];

      for (const item of allMaintenance) {
        const check = await axios.get(
          `${API_BASE_URL}/api/sitemaintenance/dynamic/${item.subscriptionId}`
        );

        if (check.data.allowed) {
          filtered.push(item);

          const now = new Date().getTime();
          const start = new Date(item.startTime).getTime();

          if (now >= start) {
            setActiveMaintenance(item);
            setIsBlocked(true);

            /* -------------------------------------------------------------
                ⭐ UPDATE GLOBAL STATE
            ------------------------------------------------------------- */
            MaintenanceBlockState.isBlocked = true;
          }
        }
      }

      if (filtered.length > 0) {
        setMaintenance(filtered);

        if (filtered.length > 1) {
          const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
              prevIndex === filtered.length - 1 ? 0 : prevIndex + 1
            );
          }, 5000);
          return () => clearInterval(interval);
        }
      } else {
        /* -------------------------------------------------------------
            ⭐ RESET GLOBAL STATE WHEN NO MAINTENANCE
        ------------------------------------------------------------- */
        MaintenanceBlockState.isBlocked = false;
      }

    } catch (error) {
      console.error("Maintenance Slider Error:", error);
    }
  };


  const handleClose = () => setIsVisible(false);
  const handleDotClick = (index) => setCurrentIndex(index);

  const formatDateTime = (dateString) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Date(dateString).toLocaleString("en-US", {
    timeZone: userTimeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


  // ⛔ NEW: Scroll lock effect at top level (NOT inside condition)
  useEffect(() => {
    if (isBlocked && activeMaintenance && !isAllowedRoute) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

  }, [isBlocked, activeMaintenance, isAllowedRoute]);

  /* -------------------------------------------------------------
      🔥 FULL-SCREEN BLOCK MODE (UPDATED)
      ➤ Do NOT show for allowed routes
  ------------------------------------------------------------- */
  if (isBlocked && activeMaintenance && !isAllowedRoute) {

    return (
      <div className="maintenance-block-screen">
        <div className="maintenance-block-card">

          <div className="block-icon-container">
            <FiShield className="block-main-icon" />
          </div>

          <h1 className="block-title">
            <FiServer className="block-title-icon" /> Maintenance in Progress
          </h1>

          <p className="block-description">
            Our system is currently undergoing scheduled maintenance.
            <br />
            The site will be available shortly.
          </p>

          <div className="block-timing-box">
            <div className="timing-row">
              <FiCalendar className="timing-icon" />
              <span><strong>Start:</strong> {formatDateTime(activeMaintenance.startTime)}</span>
            </div>

            <div className="timing-row">
              <FiClock className="timing-icon" />
              <span><strong>End:</strong> {formatDateTime(activeMaintenance.endTime)}</span>
            </div>
          </div>

          <p className="block-footer-text">Thank you for your patience.</p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
      🔥 ORIGINAL SLIDER UI
  ------------------------------------------------------------- */
  if (!maintenance || !isVisible || maintenance.length === 0) return null;

  const currentMaintenance = maintenance[currentIndex];

  return (
    <div className="pro-maintenance-banner">
      <div className="pro-slider-wrapper">

        <button
          className="pro-close-btn"
          onClick={handleClose}
        >
          <FiX size={18} />
        </button>

        <div className="pro-marquee-container">
          <div className="pro-marquee-content">

            <div className="pro-alert-group">
              <FiAlertTriangle className="pro-alert-icon" />
              <FiTool className="pro-tool-icon" />
            </div>

            <div className="pro-marquee-text">
              <span className="pro-maintenance-title">Maintenance Notice: </span>
              <span className="pro-maintenance-message">{currentMaintenance.message}</span>

              <span className="pro-schedule-separator">|</span>
              <span className="pro-schedule-item">
                <FiCalendar className="pro-schedule-icon" />
                <strong>From:</strong> {formatDateTime(currentMaintenance.startTime)}
              </span>

              <span className="pro-schedule-separator">|</span>
              <span className="pro-schedule-item">
                <FiClock className="pro-schedule-icon" />
                <strong>To:</strong> {formatDateTime(currentMaintenance.endTime)}
              </span>
            </div>
          </div>
        </div>

        {maintenance.length > 1 && (
          <div className="pro-slider-dots">
            {maintenance.map((_, index) => (
              <button
                key={index}
                className={`pro-dot ${index === currentIndex ? "pro-dot-active" : ""}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceSlider;

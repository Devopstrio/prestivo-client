import { toast } from "react-toastify";
import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

import {
  FaSearch,
  FaClock,
  FaTools,
  FaCalendarAlt,
  FaTrash,
  FaPlusCircle,
  FaEdit,
  FaBuilding
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import Swal from "sweetalert2";
import "../styles/MaintenanceTab.css";

// ⭐ DEFAULT MAINTENANCE MESSAGE ADDED HERE
const DEFAULT_MSG = "We add some features in site so maintenance will be going";

const MaintenanceTab = ({ loading, setLoading }) => {
  const [subId, setSubId] = useState("");
  const [companyName, setCompanyName] = useState("");

  // ⭐ Default message set here
  const [message, setMessage] = useState(DEFAULT_MSG);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activeMaintenance, setActiveMaintenance] = useState(null);
  const [notifyUsers, setNotifyUsers] = useState(false);

  /* ---------------------------------------------
      ⭐ Toastify Notification Handler
  --------------------------------------------- */
  const notify = (msg, type = "info") => {
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else if (type === "warning") toast.warn(msg);
    else toast.info(msg);
  };

  /* ---------------------------------------------
      ⭐ Helpers: IST <-> UTC conversions
  --------------------------------------------- */
  const convertUTCToISTInput = (utcString) => {
    if (!utcString) return "";
    const d = new Date(utcString);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const convertISTInputToUTCISOString = (istInput) => {
    if (!istInput) return null;
    const [datePart, timePart] = istInput.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm] = timePart.split(":").map(Number);
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const utcMillis = Date.UTC(y, m - 1, d, hh, mm) - istOffsetMs;
    return new Date(utcMillis).toISOString();
  };

  /* ---------------------------------------------
      VALIDATION
  --------------------------------------------- */
  const validateDateTime = () => {
    if (!startTime || !endTime)
      return { isValid: false, message: "Select date & time" };

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate)
      return { isValid: false, message: "End time must be after start time" };

    return { isValid: true, message: "" };
  };

  /* ---------------------------------------------
      STEP 1 → Fetch company + maintenance
  --------------------------------------------- */
  const fetchCompany = async () => {
    if (!subId.trim()) return notify("Enter Subscription ID", "warning");

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/subscription/maintenance/company/${subId}`
      );

      setCompanyName(res.data.companyName);
      notify("Company found successfully!", "success");

      const m = await axios.get(
        `${API_BASE_URL}/api/subscription/maintenance/get/${subId}`
      );

      const existing = m.data.data;
      setActiveMaintenance(existing || null);

      if (existing) {
        setMessage(existing.message || DEFAULT_MSG);
        setStartTime(convertUTCToISTInput(existing.startTime));
        setEndTime(convertUTCToISTInput(existing.endTime));
      } else {
        // ⭐ If no maintenance → load default message
        setMessage(DEFAULT_MSG);
        setStartTime("");
        setEndTime("");
      }
    } catch (err) {
      console.error(err);
      notify("Subscription not found!", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------
      STEP 2 → Add Maintenance
  --------------------------------------------- */
  const addMaintenance = async () => {
    if (!companyName) return notify("No company found", "warning");
    if (!message.trim()) return notify("Enter message", "warning");

    if (!notifyUsers) {
      return notify("Please confirm: Notify all users by email", "warning");
    }

    const validation = validateDateTime();
    if (!validation.isValid) return notify(validation.message, "warning");

    const startUTCISO = convertISTInputToUTCISOString(startTime);
    const endUTCISO = convertISTInputToUTCISOString(endTime);

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/subscription/maintenance/add`,
        {
          subscriptionId: subId,
          companyName,
          message,
          startTime: startUTCISO,
          endTime: endUTCISO,
          notifyUsers,
        }
      );

      setActiveMaintenance(res.data.mainData || res.data.data || null);
      notify("Maintenance created successfully!", "success");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      console.error(err);
      notify("Failed to create maintenance!", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------
      STEP 3 → Update Maintenance
  --------------------------------------------- */
  const updateMaintenance = async () => {
    if (!activeMaintenance) return;
    if (!message.trim()) return notify("Enter message", "warning");

    const validation = validateDateTime();
    if (!validation.isValid) return notify(validation.message);

    const startUTCISO = convertISTInputToUTCISOString(startTime);
    const endUTCISO = convertISTInputToUTCISOString(endTime);

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/subscription/maintenance/update`,
        {
          subscriptionId: subId,
          message,
          startTime: startUTCISO,
          endTime: endUTCISO,
          notifyUsers,
        }
      );

      setActiveMaintenance(res.data.mainUpdated || res.data.data || null);
      notify("Maintenance updated successfully!", "success");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      console.error(err);
      notify("Failed to update maintenance!", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------
      STEP 4 → Remove Maintenance
  --------------------------------------------- */
  const removeMaintenance = async () => {
    if (!activeMaintenance)
      return notify("No maintenance found to remove", "warning");

    const result = await Swal.fire({
      title: "Remove Maintenance?",
      text: "This maintenance schedule will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/subscription/maintenance/remove`, {
        subscriptionId: subId,
      });

      setActiveMaintenance(null);

      // ⭐ Reset message back to default
      setMessage(DEFAULT_MSG);

      setStartTime("");
      setEndTime("");

      notify("Maintenance removed successfully!", "success");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      console.error(err);
      notify("Failed to remove maintenance!", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------
      HELPERS
  --------------------------------------------- */
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const calculateDuration = () => {
    if (!activeMaintenance) return "—";
    const start = new Date(activeMaintenance.startTime);
    const end = new Date(activeMaintenance.endTime);
    const diff = end - start;
    return `${Math.floor(diff / 36e5)}h ${Math.floor((diff % 36e5) / 60000)}m`;
  };

  return (
    <div className="verify-form slide-up">

      {/* Header */}
      <div className="form-header">
        <div className="header-icon-container">
          <FaTools className="header-icon" />
        </div>
        <div>
          <h2 className="verify-title">Maintenance Control</h2>
          <p className="verify-subtitle">Manage website maintenance settings</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="form-group animated-input">
          <div className="input-icon"><FaSearch /></div>
          <input
            type="text"
            placeholder="Enter Subscription ID"
            value={subId}
            onChange={(e) => setSubId(e.target.value)}
            className="form-input"
            disabled={loading}
            onKeyPress={(e) => e.key === "Enter" && fetchCompany()}
          />
        </div>

        <button
          onClick={fetchCompany}
          className="btn btn-primary fetch-btn"
          disabled={loading || !subId.trim()}
        >
          <FaSearch /> {loading ? "Searching..." : "Fetch Details"}
        </button>
      </div>

      {/* Company Details */}
      {companyName && (
        <div className="subscription-details slide-up">
          <div className="details-header">
            <h3>Company Details</h3>
            <div className="status-badge verified">
              <MdVerified /> Found
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <div className="detail-icon"><FaBuilding /></div>
              <div className="detail-info">
                <label>Company Name</label>
                <span>{companyName}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon"><FaTools /></div>
              <div className="detail-info">
                <label>Subscription ID</label>
                <span>{subId}</span>
              </div>
            </div>
          </div>

          {/* Maintenance Form */}
          <div className="verification-section slide-up">
            <div className="section-header">
              <FaTools />
              <span>Maintenance Settings</span>
            </div>

            <div className="form-group">
              <label className="form-label">Maintenance Message</label>

              {/* ⭐ Default message auto-loaded */}
              <textarea
                className="form-input"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter maintenance message for users..."
                disabled={loading}
              />
            </div>

            <div className="date-inputs">
              <div className="form-group">
                <label className="form-label">
                  <FaCalendarAlt className="calender-icon" /> Start Time
                </label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaCalendarAlt className="calender-icon" /> End Time
                </label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notifyUsers}
                    onChange={(e) => setNotifyUsers(e.target.checked)}
                    disabled={loading}
                    required
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    Notify all users by email
                  </span>
                </label>
              </div>


            </div>

            <div className="btn-group">
              {!activeMaintenance ? (
                <button
                  className="btn btn-success btn-add"
                  onClick={addMaintenance}
                  disabled={loading || !message.trim() || !startTime || !endTime || !notifyUsers}
                >
                  <FaPlusCircle /> Add Maintenance
                </button>
              ) : (
                <button
                  className="btn btn-edit"
                  onClick={updateMaintenance}
                  disabled={loading}
                >
                  <FaEdit /> Update Maintenance
                </button>
              )}

              <button
                className="btn btn-remove"
                onClick={removeMaintenance}
                disabled={loading || !activeMaintenance}
              >
                <FaTrash /> Remove Maintenance
              </button>
            </div>
          </div>

          {/* Active Maintenance Preview */}
          {activeMaintenance && (
            <div className="verification-section slide-up active-maintenance">
              <div className="section-header">
                <FaClock />
                <span>Active Maintenance</span>
              </div>

              <div className="details-grid">
                <div className="detail-card">
                  <div className="detail-info">
                    <label>Message</label>
                    <span>{activeMaintenance.message}</span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-info">
                    <label>Start Time</label>
                    <span>{formatDisplayDate(activeMaintenance.startTime)}</span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-info">
                    <label>End Time</label>
                    <span>{formatDisplayDate(activeMaintenance.endTime)}</span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-info">
                    <label>Duration</label>
                    <span>{calculateDuration()}</span>
                  </div>
                </div>
              </div>

              <div className="status-badge pending">
                <FaClock /> Scheduled / Active
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenanceTab;

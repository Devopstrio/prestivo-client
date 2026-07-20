import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
    FaTools,
    FaClock,
    FaEdit,
    FaTrash,
    FaBuilding,
    FaCalendarAlt,
    FaSync,
    FaExclamationTriangle,
    FaCheckCircle,
    FaInfoCircle,
    FaCopy,
    FaBell
} from "react-icons/fa";

import "../styles/MaintenanceTable.css";

const DEFAULT_MSG = "We add some features in site so maintenance will be going on";

const AllMaintenanceTab = ({ loading, setLoading }) => {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [editing, setEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [notifyUsers, setNotifyUsers] = useState(false);

    /* ============================
       Fetch ALL maintenance records
    ============================ */
    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/subscription/maintenance/all`);
            const recordsWithStatus = (res.data.data || []).map(record => ({
                ...record,
                status: getStatus(record)
            }));
            setRecords(recordsWithStatus);
            setFilteredRecords(recordsWithStatus);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load maintenance records");
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (record) => {
        const now = new Date();
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);

        if (now < startTime) return "scheduled";
        if (now >= startTime && now <= endTime) return "active";
        if (now > endTime) return "completed";
        return "scheduled";
    };

    useEffect(() => {
        fetchAll();
    }, []);

    /* ============================
       Filter Functions
    ============================ */
    useEffect(() => {
        let filtered = [...records];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(record =>
                record.companyName.toLowerCase().includes(term) ||
                record.subscriptionId.toLowerCase().includes(term) ||
                record.message.toLowerCase().includes(term)
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(record =>
                record.status === statusFilter
            );
        }

        setFilteredRecords(filtered);
    }, [searchTerm, statusFilter, records]);

    /* ============================
       IST <-> UTC Conversion
    ============================ */
    const convertISTInputToUTCISOString = (istInput) => {
        if (!istInput) return null;
        const [datePart, timePart] = istInput.split("T");
        const [y, m, d] = datePart.split("-").map(Number);
        const [hh, mm] = timePart.split(":").map(Number);

        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const utcMillis = Date.UTC(y, m - 1, d, hh, mm) - istOffsetMs;

        return new Date(utcMillis).toISOString();
    };

    const convertUTCToISTInput = (utcString) => {
        if (!utcString) return "";
        const d = new Date(utcString);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
            d.getDate()
        )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const formatDisplayDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const calculateDuration = (start, end) => {
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diff = endTime - startTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    /* ============================
       Delete Maintenance
    ============================ */
    const deleteMaintenance = async (subscriptionId, companyName) => {
        const result = await Swal.fire({
        title: "Remove Maintenance?",
        html: `
          <p>
            Are you sure you want to remove maintenance for
            <b>${companyName}</b>?
          </p>
          <small>This action cannot be undone.</small>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, remove it",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ef476f",
        cancelButtonColor: "#6c757d",
        reverseButtons: true,
        focusCancel: true,
    });

    if (!result.isConfirmed) return;

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/subscription/maintenance/remove`, {
                subscriptionId,
            });

            toast.success("Maintenance removed!");
            fetchAll();
        } catch (error) {
            console.error(error);
            toast.error("Delete failed");
        } finally {
            setLoading(false);
        }
    };

    /* ============================
       Update Maintenance
    ============================ */
    const saveUpdate = async () => {
        if (!editing) return;

        // Validation
        if (!editing.message.trim()) {
            toast.error("Please enter a maintenance message");
            return;
        }

        if (!editing.startTime || !editing.endTime) {
            toast.error("Please select both start and end times");
            return;
        }

        const startUTC = convertISTInputToUTCISOString(editing.startTime);
        const endUTC = convertISTInputToUTCISOString(editing.endTime);

        // Validate end time is after start time
        if (new Date(startUTC) >= new Date(endUTC)) {
            toast.error("End time must be after start time");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/subscription/maintenance/update`, {
                subscriptionId: editing.subscriptionId,
                message: editing.message,
                startTime: startUTC,
                endTime: endUTC,
                notifyUsers,
            });

            toast.success("Maintenance updated successfully!");
            setEditing(null);
            setNotifyUsers(false);
            fetchAll();
        } catch (error) {
            console.error(error);
            toast.error("Update failed: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return (
                    <span className="status-badge active">
                        <FaClock /> Active
                    </span>
                );
            case "completed":
                return (
                    <span className="status-badge completed">
                        <FaCheckCircle /> Completed
                    </span>
                );
            default:
                return (
                    <span className="status-badge scheduled">
                        <FaCalendarAlt /> Scheduled
                    </span>
                );
        }
    };

    const getCurrentISTDateTime = () => {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    };

    return (
        <div className="maintenance-table-container">

            {/* Header with Controls */}
            <div className="maintenance-header">
                <div className="header-left">
                    <h2 className="table-title">
                        <FaTools /> All Maintenance Records
                        <span className="record-count">({filteredRecords.length})</span>
                    </h2>
                    <p className="header-subtitle">
                        Manage all scheduled maintenance activities
                    </p>
                </div>

                <div className="header-controls">
                    <button
                        className="btn refresh-btn"
                        onClick={fetchAll}
                        disabled={loading}
                        title="Refresh"
                    >
                        <FaSync /> Refresh
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by company, subscription ID, or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        disabled={loading}
                    />
                </div>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-tab ${statusFilter === 'scheduled' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('scheduled')}
                    >
                        <FaCalendarAlt /> Scheduled
                    </button>
                    <button
                        className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('active')}
                    >
                        <FaClock /> Active
                    </button>
                    <button
                        className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('completed')}
                    >
                        <FaCheckCircle /> Completed
                    </button>
                </div>
            </div>

            {/* CARD VIEW */}
            <div className="card-view">
                <div className="maintenance-cards">
                    {filteredRecords.length === 0 ? (
                        <div className="empty-cards">
                            <FaExclamationTriangle />
                            <h3>No maintenance records found</h3>
                            <p>Try adjusting your filters</p>
                        </div>
                    ) : (
                        filteredRecords.map((rec) => (
                            <div key={rec._id} className={`maintenance-card ${rec.status}`}>
                                <div className="card-header">
                                    <div className="company-info">
                                        <div className="company-icon">
                                            <FaBuilding />
                                        </div>
                                        <div>
                                            <h3 className="company-name">{rec.companyName}</h3>
                                            <div className="subscription-id">
                                                <span>{rec.subscriptionId}</span>
                                                <button
                                                    className="copy-btn"
                                                    onClick={() => copyToClipboard(rec.subscriptionId)}
                                                    title="Copy ID"
                                                >
                                                    <FaCopy />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {getStatusBadge(rec.status)}
                                </div>

                                <div className="card-body">
                                    <div className="message-section">
                                        <label><FaInfoCircle /> Message</label>
                                        <p className="message-text">{rec.message}</p>
                                    </div>

                                    <div className="timeline-section">
                                        <div className="timeline-item">
                                            <label><FaCalendarAlt /> Start Time</label>
                                            <span>{formatDisplayDate(rec.startTime)}</span>
                                        </div>
                                        <div className="timeline-item">
                                            <label><FaCalendarAlt /> End Time</label>
                                            <span>{formatDisplayDate(rec.endTime)}</span>
                                        </div>
                                        <div className="timeline-item">
                                            <label><FaClock /> Duration</label>
                                            <span>{calculateDuration(rec.startTime, rec.endTime)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button
                                        className="btn btn-edit"
                                        onClick={() => {
                                            setNotifyUsers(false);
                                            setEditing({
                                                subscriptionId: rec.subscriptionId,
                                                message: rec.message,
                                                startTime: convertUTCToISTInput(rec.startTime),
                                                endTime: convertUTCToISTInput(rec.endTime),
                                            })
                                        }}
                                        title="Edit Maintenance"
                                        disabled={loading}
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button
                                        className="btn btn-delete"
                                        onClick={() => deleteMaintenance(rec.subscriptionId, rec.companyName)}
                                        title="Delete Maintenance"
                                        disabled={loading}
                                    >
                                        <FaTrash /> Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <div className="modal-header">
                            <h3><FaEdit /> Edit Maintenance</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setEditing(null);
                                    setNotifyUsers(false);
                                }}
                                disabled={loading}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Company</label>
                                <div className="form-static-value">
                                    {records.find(r => r.subscriptionId === editing.subscriptionId)?.companyName || "N/A"}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Subscription ID</label>
                                <div className="form-static-value subscription-id-display">
                                    {editing.subscriptionId}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label required">Message</label>
                                <textarea
                                    className="edit-input"
                                    value={editing.message}
                                    onChange={(e) =>
                                        setEditing({ ...editing, message: e.target.value })
                                    }
                                    rows={4}
                                    placeholder="Enter maintenance message..."
                                    disabled={loading}
                                />
                                <div className="form-help">Required field</div>
                            </div>

                            <div className="date-time-grid">
                                <div className="form-group">
                                    <label className="form-label required">
                                        <FaCalendarAlt /> Start Time (IST)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="edit-input datetime-input"
                                        value={editing.startTime}
                                        onChange={(e) =>
                                            setEditing({ ...editing, startTime: e.target.value })
                                        }
                                        min={getCurrentISTDateTime()}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">
                                        <FaCalendarAlt /> End Time (IST)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="edit-input datetime-input"
                                        value={editing.endTime}
                                        onChange={(e) =>
                                            setEditing({ ...editing, endTime: e.target.value })
                                        }
                                        min={editing.startTime || getCurrentISTDateTime()}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={notifyUsers}
                                        onChange={(e) => setNotifyUsers(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="checkbox-text">
                                        <FaBell /> Notify all users by email
                                    </span>
                                </label>
                                <div className="form-help">
                                    Users will receive an email notification about the maintenance schedule change
                                </div>
                            </div>
                        </div><br />

                        <div className="modal-footer">
                            <button
                                className="btn btn-cancel"
                                onClick={() => {
                                    setEditing(null);
                                    setNotifyUsers(false);
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-save"
                                onClick={saveUpdate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner-small"></div>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllMaintenanceTab;
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// React Icons
import {
    FaSearch,
    FaTrash,
    FaUserSlash,
    FaHistory,
    FaCheckCircle,
    FaExclamationTriangle,
    FaEye,
    FaEyeSlash,
    FaSync,
    FaShieldAlt,
    FaUserTimes,
    FaUsers,
    FaKey,
    FaCalendarAlt,
    FaUserTag,
    FaEnvelope,
    FaPhone,
    FaUserCog,
    FaChevronDown,
    FaChevronUp,
    FaTimes,
    FaCheck,
    FaLock
} from "react-icons/fa";

import API_BASE_URL from "../config";
import { AuthContext } from "../context/AuthContext";
import "../styles/DeleteUsers.css";

const DeleteUsers = () => {
    const { user } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState("delete");
    const [email, setEmail] = useState("");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaVerified, setCaptchaVerified] = useState(false);

    const [deletedUsers, setDeletedUsers] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [notFound, setNotFound] = useState("");

    /* ======================
       CAPTCHA
    ====================== */
    const generateCaptcha = () => {
        const value = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
        setCaptcha(value);
        setCaptchaInput("");
        setCaptchaVerified(false);
    };

    const verifyCaptcha = () => {
        if (captchaInput === captcha) {
            setCaptchaVerified(true);
            toast.success("Captcha verified successfully!", {
                icon: <FaCheckCircle className="toast-success-icon" />
            });
        } else {
            toast.error("Invalid captcha code!", {
                icon: <FaExclamationTriangle className="toast-error-icon" />
            });
            setCaptchaVerified(false);
        }
    };

    /* ======================
       FETCH USER BY EMAIL
    ====================== */
    const searchUser = async () => {
        if (!email) {
            toast.error("Please enter a user email address", {
                icon: <FaExclamationTriangle className="toast-error-icon" />
            });
            return;
        }

        try {
            setLoading(true);
            setUserData(null);
            setNotFound("");

            const res = await axios.get(
                `${API_BASE_URL}/api/deleted-users/find?email=${email}`,
                {
                    headers: { Authorization: `Bearer ${user?.token}` },
                }
            );

            setUserData(res.data);
            generateCaptcha();
            toast.success("User found successfully!", {
                icon: <FaCheckCircle className="toast-success-icon" />
            });
        } catch (err) {
            setUserData(null);
            setCaptcha("");
            setCaptchaVerified(false);

            if (err.response?.status === 404) {
                setNotFound("User email not found in the system");
            } else {
                toast.error("Failed to fetch user information", {
                    icon: <FaExclamationTriangle className="toast-error-icon" />
                });
            }
        } finally {
            setLoading(false);
        }
    };

    /* ======================
       DELETE USER
    ====================== */
    const handleDelete = async () => {
        if (!captchaVerified) {
            toast.error("Please verify the captcha first", {
                icon: <FaLock className="toast-error-icon" />
            });
            return;
        }

        const confirm = await Swal.fire({
            title: `
    <div class="delete-confirm-title">
      <i class="fas fa-exclamation-triangle confirm-warning-icon"></i>
      <span>Confirm Deletion</span>
    </div>
  `,
            html: `
    <div class="delete-confirm-content">
      <p class="delete-warning-text">
        You are about to <strong>confirm delete</strong> this user account.
      </p>

      <div class="user-delete-info">
        <p><strong>User:</strong> ${userData.name}</p>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Role:</strong> ${userData.role}</p>
      </div>

    </div>
  `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            customClass: {
                popup: "delete-confirm-popup",
                confirmButton: "delete-confirm-button",
                cancelButton: "delete-cancel-button"
            }
        });


        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(
                `${API_BASE_URL}/api/deleted-users/delete/${userData._id}`,
                {
                    headers: { Authorization: `Bearer ${user?.token}` },
                }
            );

            toast.success(
                <div className="delete-success-message">
                    <FaCheckCircle />
                    <span>User deleted successfully from the system</span>
                </div>,
                { autoClose: 3000 }
            );

            setUserData(null);
            setEmail("");
            setCaptcha("");
            setCaptchaInput("");
            setCaptchaVerified(false);
            setNotFound("");
            fetchDeletedUsers();
        } catch (err) {
            toast.error(
                <div className="delete-error-message">
                    <FaExclamationTriangle />
                    <span>{err.response?.data?.message || "Failed to delete user"}</span>
                </div>
            );
        }
    };

    const maskEmail = (email) => {
        if (!email || !email.includes("@")) return email;

        const [name, domain] = email.split("@");
        const lastDotIndex = domain.lastIndexOf(".");

        if (lastDotIndex === -1) {
            return `${name}@...`;
        }

        const extension = domain.slice(lastDotIndex);
        return `${name}@...`;
    };


    /* ======================
       FETCH DELETED USERS
    ====================== */
    const fetchDeletedUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/deleted-users`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            setDeletedUsers(res.data || []);
        } catch (err) {
            toast.error(
                <div className="fetch-error-message">
                    <FaExclamationTriangle />
                    <span>Failed to load deleted users list</span>
                </div>
            );
        }
    };

    useEffect(() => {
        if (activeTab === "deleted") {
            fetchDeletedUsers();
        }
    }, [activeTab]);

    return (
        <div className="user-deletion-management">
            {/* Toast Container with custom styling */}
            <ToastContainer
                position="top-center"
                className="user-deletion-toast-container"
                toastClassName="user-deletion-toast"
                progressClassName="user-deletion-progress"
            />

            {/* Header Section */}
            <div className="deletion-management-header">
                <div className="deletion-header-container">
                    <div className="deletion-header-icon">
                        <FaUserSlash className="header-primary-icon" />
                    </div>
                    <div className="deletion-header-content">
                        <h1 className="deletion-primary-title">User Account Management</h1>
                        <p className="deletion-description-text">
                            Securely manage user accounts with verification and deletion history tracking
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="deletion-management-container">
                {/* Tabs Navigation */}
                <div className="deletion-tabs-navigation">
                    <button
                        className={`deletion-tab-button ${activeTab === "delete" ? "deletion-tab-active" : ""}`}
                        onClick={() => setActiveTab("delete")} style={{ border: "none" }}
                    >
                        <FaUserTimes className="tab-button-icon" />
                        <span className="tab-button-text">Delete User</span>
                    </button>
                    <button
                        className={`deletion-tab-button ${activeTab === "deleted" ? "deletion-tab-active" : ""}`}
                        onClick={() => setActiveTab("deleted")} style={{ border: "none" }}
                    >
                        <FaHistory className="tab-button-icon" />
                        <span className="tab-button-text">Deleted Users</span>
                    </button>
                </div>

                {/* Search Section */}
                {activeTab === "delete" && (
                    <div className="user-search-section">
                        <div className="user-search-container">
                            <div className="user-search-input-area">
                                <div className="user-search-input-group">
                                    <FaSearch className="user-search-input-symbol" />
                                    <input
                                        type="email"
                                        placeholder="Enter user email address to search"
                                        className="user-deletion-search-field"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setNotFound("");
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                                    />
                                    {email && (
                                        <button
                                            className="search-clear-action-button"
                                            onClick={() => {
                                                setEmail("");
                                                setUserData(null);
                                                setCaptcha("");
                                                setCaptchaVerified(false);
                                                setNotFound("");
                                            }}
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                                <button
                                    className="user-search-action-button"
                                    onClick={searchUser}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <FaSync className="button-loading-indicator" />
                                    ) : (
                                        <FaSearch className="button-action-symbol" />
                                    )}
                                    <span className="button-action-text">
                                        {loading ? "Searching..." : "Search User"}
                                    </span>
                                </button>
                            </div>

                            {/* Error Message */}
                            {!loading && notFound && (
                                <div className="user-search-error-container">
                                    <FaExclamationTriangle className="error-indicator-icon" />
                                    <span className="error-message-text">{notFound}</span>
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="user-search-loading">
                                    <FaSync className="loading-indicator-icon" />
                                    <p>Searching for user account...</p>
                                </div>
                            )}
                        </div>

                        {/* User Details Card */}
                        {userData && (
                            <div className="user-details-card">
                                <div className="user-details-header">
                                    <FaUserCog className="user-details-icon" />
                                    <h3 className="user-details-title">User Information</h3>
                                </div>

                                <div className="user-details-grid">
                                    <div className="user-detail-item">
                                        <FaUserTag className="detail-item-icon" />
                                        <div className="detail-item-content">
                                            <span className="detail-item-label">Full Name</span>
                                            <span className="detail-item-value">{userData.name}</span>
                                        </div>
                                    </div>

                                    <div className="user-detail-item" >
                                        <FaEnvelope className="detail-item-icon" />
                                        <div className="detail-item-content">
                                            <span className="detail-item-label">Email Address</span>
                                            <span className="detail-item-value">
                                                {maskEmail(userData.email)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="user-detail-item">
                                        <FaPhone className="detail-item-icon" />
                                        <div className="detail-item-content">
                                            <span className="detail-item-label">Mobile Number</span>
                                            <span className="detail-item-value">{userData.mobile || "Not provided"}</span>
                                        </div>
                                    </div>

                                    <div className="user-detail-item">
                                        <FaKey className="detail-item-icon" />
                                        <div className="detail-item-content">
                                            <span className="detail-item-label">Account Role</span>
                                            <span className={`detail-item-value role-badge role-${userData.role.toLowerCase()}`}>
                                                {userData.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Captcha Verification */}
                                <div className="captcha-verification-section">
                                    <div className="captcha-section-header">
                                        <FaShieldAlt className="captcha-header-icon" />
                                        <h4 className="captcha-title">Security Verification</h4>
                                        <button
                                            className="captcha-refresh-button"
                                            onClick={generateCaptcha}
                                            title="Generate new captcha"
                                        >
                                            <FaSync />
                                        </button>
                                    </div>

                                    <div className="captcha-input-area">
                                        <div className="captcha-display-box">
                                            <span className="captcha-code">{captcha}</span>
                                            <FaKey className="captcha-code-icon" />
                                        </div>

                                        <div className="captcha-input-group">
                                            <input
                                                type="text"
                                                placeholder="Enter the captcha code above"
                                                className="captcha-input-field"
                                                value={captchaInput}
                                                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                                                maxLength={6}
                                            />
                                            <button
                                                className="captcha-verify-button"
                                                onClick={verifyCaptcha}
                                                disabled={!captchaInput}
                                            >
                                                <FaCheck className="verify-button-icon" />
                                                <span>Verify</span>
                                            </button>
                                        </div>
                                    </div>

                                    {captchaVerified && (
                                        <div className="captcha-success-message">
                                            <FaCheckCircle className="captcha-success-icon" />
                                            <span>Captcha verified successfully. You may proceed with deletion.</span>
                                        </div>
                                    )}
                                </div>

                                {/* Delete Action Button */}
                                {captchaVerified && (
                                    <div className="delete-action-container">
                                        <button
                                            className="user-delete-confirm-button"
                                            onClick={handleDelete}
                                        >
                                            <FaTrash className="delete-button-icon" />
                                            <span className="delete-button-text">Confirm Delete User Account</span>
                                        </button>
                                        <p className="delete-warning-note">
                                            <FaExclamationTriangle />
                                            This action is irreversible and will remove the user account.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Empty State */}
                        {!userData && !loading && !notFound && (
                            <div className="user-search-empty-state">
                                <FaSearch className="empty-state-icon" />
                                <h3 className="empty-state-title">Search for User Accounts</h3>
                                <p className="empty-state-description">
                                    Enter a user's email address above to search and manage their account.
                                    You'll be able to view details and perform secure deletion after verification.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Deleted Users Tab */}
                {activeTab === "deleted" && (
                    <div className="deleted-users-section">
                        <div className="deleted-users-header">
                            <FaUsers className="deleted-users-header-icon" />
                            <div className="deleted-users-header-content">
                                <h3 className="deleted-users-title">Deleted Users History</h3>
                                <p className="deleted-users-subtitle">
                                    View previously deleted user accounts and their deletion history
                                </p>
                            </div>
                            <button
                                className="deleted-users-refresh-button"
                                onClick={fetchDeletedUsers}
                                title="Refresh deleted users list"
                            >
                                <FaSync />
                            </button>
                        </div>

                        {deletedUsers.length === 0 ? (
                            <div className="no-deleted-users-state">
                                <FaUserSlash className="no-deleted-users-icon" />
                                <h4 className="no-deleted-users-title">No Deleted Users Found</h4>
                                <p className="no-deleted-users-description">
                                    There are no deleted user accounts in the system yet.
                                </p>
                            </div>
                        ) : (
                            <div className="deleted-users-grid-view">
                                {deletedUsers.map((du) => (
                                    <div key={du._id} className="deleted-user-profile-card">
                                        <div
                                            className="deleted-user-profile-header"
                                            onClick={() =>
                                                setExpandedId(expandedId === du._id ? null : du._id)
                                            }
                                        >
                                            <div className="deleted-user-avatar">
                                                <FaUserTimes className="deleted-user-avatar-icon" />
                                            </div>

                                            <div className="deleted-user-profile-info">
                                                <h4 className="deleted-user-name">{du.name}</h4>
                                                <p className="deleted-user-email">{du.email}</p>
                                                <div className="deleted-user-meta">
                                                    {/* <span className="deleted-user-role">{du.role}</span> */}
                                                    <span className="deleted-user-date">
                                                        <FaCalendarAlt />
                                                        {new Date(du.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="deleted-user-actions">
                                                <span className="deletion-count-badge">
                                                    <FaTrash />
                                                    <span>{du.deletedCount || 1}</span>
                                                </span>
                                                {expandedId === du._id ? (
                                                    <FaChevronUp className="expand-toggle-icon" />
                                                ) : (
                                                    <FaChevronDown className="expand-toggle-icon" />
                                                )}
                                            </div>
                                        </div>

                                        {expandedId === du._id && (
                                            <div className="deletion-history-details">
                                                <div className="deletion-history-header">
                                                    <FaHistory className="history-header-icon" />
                                                    <h5 className="history-title">Deletion History</h5>
                                                </div>

                                                <div className="deletion-history-list">
                                                    {du.deleteHistory?.map((h, idx) => (
                                                        <div key={idx} className="deletion-history-item">
                                                            <div className="history-item-icon">
                                                                <FaUserTimes />
                                                            </div>
                                                            <div className="history-item-content">
                                                                <p className="history-item-date">
                                                                    <FaCalendarAlt />
                                                                    Deleted on: {new Date(h.deletedAt).toLocaleString()}
                                                                </p>
                                                                <p className="history-item-role">
                                                                    <FaUserTag />
                                                                    Deleted by: {h.deletedByRole}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeleteUsers;
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import API_BASE_URL from "../config";
import "../styles/Departments.css";
import "../styles/LoadingAnimation.css";

// Import icons
import {
  FaSave,
  FaTimes,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUserPlus,
  FaUsers,
  FaCog,
  FaTag,
  FaSpinner
} from "react-icons/fa";
import { toast } from "react-toastify";

const Departments = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "shipping" });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [availableRoles, setAvailableRoles] = useState(["shipping", "delivery", "support"]);
  const [newRole, setNewRole] = useState("");
  const [showAddRole, setShowAddRole] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });

  const [isLoading, setIsLoading] = useState(true);

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      showMessage("error", "Error fetching departments");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/departments/roles`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAvailableRoles(res.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/departments/create`, form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success("Department created successfully!")
      setForm({ name: "", email: "", role: "shipping" });
      fetchDepartments();
      showMessage("success", "Department user created and email sent!");
    } catch (err) {
      toast.error(err.response?.data?.message);
      showMessage("error", err.response?.data?.message || "Error creating user");
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({ name: user.name, email: user.email, role: user.role });
  };

  const handleUpdateUser = async (userId) => {
    if (!editForm.role) {
      showMessage("error", "Please select a valid role before saving");
      return;
    }

    setUpdating(userId);
    try {
      await axios.put(
        `${API_BASE_URL}/api/departments/${userId}`,
        editForm,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success("Updated successfully!")
      setEditingUser(null);
      setEditForm({ name: "", email: "", role: "" });
      fetchDepartments();
      showMessage("success", "User updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message);
      showMessage("error", err.response?.data?.message || "Error updating user");
    }
    setUpdating(null);
  };


  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: "", email: "", role: "" });
  };

  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This department user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setDeleting(userId);

    try {
      await axios.delete(`${API_BASE_URL}/api/departments/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      Swal.fire({
        title: "Deleted!",
        text: "Department user has been removed successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchDepartments();
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Failed to delete department user",
        icon: "error",
      });
    }

    setDeleting(null);
  };


  const addNewRole = async () => {
    if (!newRole.trim()) {
      showMessage("error", "Please enter a role name");
      return;
    }

    const roleName = newRole.trim().toLowerCase();

    if (availableRoles.includes(roleName)) {
      showMessage("error", "Role already exists");
      return;
    }

    if (roleName.length < 2) {
      showMessage("error", "Role name must be at least 2 characters long");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/departments/roles`,
        { name: roleName },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      await fetchRoles(); // Refresh roles from database
      setForm({ ...form, role: roleName });
      setNewRole("");
      setShowAddRole(false);
      showMessage("success", `New role "${roleName}" added successfully`);
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Error adding role");
    }
  };

  const removeRole = async (roleToRemove) => {
    if (["shipping", "delivery", "support"].includes(roleToRemove)) {
      showMessage("error", "Default roles cannot be removed");
      return;
    }

    if (departments.some(dept => dept.role === roleToRemove)) {
      showMessage("error", `Cannot remove role "${roleToRemove}" as it's currently assigned to users`);
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/departments/roles/${roleToRemove}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      await fetchRoles(); // Refresh roles from database

      if (form.role === roleToRemove) {
        setForm({ ...form, role: "shipping" });
      }

      showMessage("success", `Role "${roleToRemove}" removed successfully`);
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Error removing role");
    }
  };
  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading </h3>
          <p>Please wait while departments are Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="dept-management-container">
      <div className="dept-header">
        <h2>
          <FaUsers className="dept-header-icon" />
          Department Management
        </h2>
        <p>Create and manage department users with customizable roles</p>
      </div>

      {message.text && (
        <div className={`dept-alert dept-alert-${message.type === "success" ? "success" : "error"}`}>
          {message.text}
        </div>
      )}

      {/* Role Management Section */}
      <div className="dept-form-section">
        <h3>
          <FaCog className="dept-section-icon" />
          Role Management
        </h3>
        <div className="dept-form-row">
          <div className="dept-form-group">
            <label htmlFor="available-roles">
              <FaTag className="dept-input-icon" />
              Available Roles
            </label>
            <div className="dept-roles-container">
              {availableRoles.map((role, index) => (
                <span key={index} className="dept-role-tag">
                  {role}
                  {!["shipping", "delivery", "support", "warehouse", "purchase"].includes(role) && (
                    <button
                      type="button"
                      className="dept-role-remove-btn"
                      onClick={() => removeRole(role)}
                      title={`Remove ${role} role`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* <div className="dept-form-group">
            <label htmlFor="new-role">
              <FaPlus className="dept-input-icon" />
              Add New Role
            </label>
            {showAddRole ? (
              <div className="dept-add-role-input">
                <input
                  type="text"
                  id="new-role"
                  className="dept-form-control"
                  placeholder="Enter new role name"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewRole()}
                />
                <div className="dept-role-actions">
                  <button
                    type="button"
                    className="dept-btn dept-btn-success dept-btn-sm"
                    onClick={addNewRole}
                  >
                    <FaPlus className="dept-btn-icon" />
                    Add
                  </button>
                  <button
                    type="button"
                    className="dept-btn dept-btn-secondary dept-btn-sm"
                    onClick={() => {
                      setShowAddRole(false);
                      setNewRole("");
                    }}
                  >
                    <FaTimes className="dept-btn-icon" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="dept-btn dept-btn-outline"
                onClick={() => setShowAddRole(true)}
              >
                <FaPlus className="dept-btn-icon" />
                Add New Role
              </button>
            )}
          </div> */}
        </div>
      </div>

      {/* Create Department User */}
      <form onSubmit={handleSubmit} className="dept-form-section">
        <h3>
          <FaUserPlus className="dept-section-icon" />
          Create New Department User
        </h3>
        <div className="dept-form-row">
          <div className="dept-form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="dept-form-control"
              placeholder="Enter full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="dept-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="dept-form-control"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="dept-form-group">
            <label htmlFor="role">Department Role</label>
            <select
              id="role"
              className="dept-form-control"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {availableRoles.map((role, index) => (
                <option key={index} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="dept-btn dept-btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="dept-loading-spinner"></div>
              Creating...
            </>
          ) : (
            <>
              <FaUserPlus className="dept-btn-icon" />
              Create Department User
            </>
          )}
        </button>
      </form>

      {/* Existing Departments */}
      <div className="dept-table-section">
        <div className="dept-table-header">
          <h3>
            <FaUsers className="dept-section-icon" />
            Existing Department Users ({departments.length})
          </h3>
        </div>

        <div className="dept-table-responsive">
          <table className="dept-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="dept-empty-state">
                    No department users found. Create your first department user above.
                  </td>
                </tr>
              ) : (
                departments.map(department => (
                  <tr key={department._id}>
                    <td>
                      {editingUser === department._id ? (
                        <input
                          type="text"
                          className="dept-form-control"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      ) : (
                        department.name
                      )}
                    </td>
                    <td>
                      {editingUser === department._id ? (
                        <input
                          type="email"
                          className="dept-form-control"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          disabled
                        />
                      ) : (
                        department.email
                      )}
                    </td>
                    <td>
                      {editingUser === department._id ? (
                        <select
                          className="dept-form-control"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        >
                          {availableRoles.map((role, index) => (
                            <option key={index} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="dept-role-badge">{department.role || "N/A"}</span>
                      )}
                    </td>
                    <td className="dept-actions-cell">
                      {editingUser === department._id ? (
                        <>
                          <button
                            className="dept-btn dept-btn-success"
                            onClick={() => handleUpdateUser(department._id)}
                            disabled={updating === department._id}
                          >
                            {updating === department._id ? (
                              <>
                                <div className="dept-loading-spinner"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FaSave className="dept-btn-icon" />
                                Save
                              </>
                            )}
                          </button>
                          <button
                            className="dept-btn dept-btn-secondary"
                            onClick={cancelEdit}
                          >
                            <FaTimes className="dept-btn-icon" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="dept-btn dept-btn-warning"
                            onClick={() => handleEdit(department)}
                            title="Edit User"
                          >
                            <FaEdit className="dept-btn-icon" />
                            Edit
                          </button>
                          <button
                            className="dept-btn dept-btn-danger"
                            onClick={() => handleDelete(department._id)}
                            disabled={deleting === department._id}
                            title="Delete User"
                          >
                            {deleting === department._id ? (
                              <>
                                <div className="dept-loading-spinner"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <FaTrash className="dept-btn-icon" />
                                Delete
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Departments;
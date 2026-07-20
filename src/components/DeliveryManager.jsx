import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import API_BASE_URL from "../config";
import "../styles/DeliveryManager.css";
import "../styles/LoadingAnimation.css";

import {
  FaSpinner
} from "react-icons/fa";

const DeliveryManager = () => {
  const { user } = useContext(AuthContext);
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [shiftTimings, setShiftTimings] = useState("9:00 AM - 6:00 PM");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [supervisor, setSupervisor] = useState("No");

  const [isLoading, setIsLoading] = useState(true);

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Fetch all delivery employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/deliveryEmployees`);
      const deliveryEmployees = res.data.filter(user => user.role === "deliveryEmployee");
      setEmployees(deliveryEmployees);

      // Filter employees based on current warehouse
      filterEmployeesByWarehouse(deliveryEmployees, warehouseName);
    } catch (err) {
      console.error("Error fetching employees:", err.response || err);
    }
  };

  // Filter employees by warehouse name
  const filterEmployeesByWarehouse = (employeesList, currentWarehouseName) => {
    if (!currentWarehouseName) {
      setFilteredEmployees(employeesList);
      return;
    }

    const filtered = employeesList.filter(emp =>
      emp.warehouseName === currentWarehouseName ||
      emp.deliveryEmployee?.warehouseName === currentWarehouseName
    );
    setFilteredEmployees(filtered);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Filter employees whenever warehouse name changes
    filterEmployeesByWarehouse(employees, warehouseName);
  }, [warehouseName, employees]);

  const handleActivateEmployee = async (email, securityKey) => {
    const password = window.prompt("Enter a temporary password for the employee:");
    if (!password) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/api/deliveryEmployees/activate`, {
        email,
        securityKey,
        password
      });
      setMessage(res.data.message);
      fetchEmployees(); // refresh list
    } catch (err) {
      setMessage(err.response?.data?.message || "Error activating employee");
    }
  };

  // Create new delivery employee
  const handleCreateEmployee = async () => {
    if (!name || !email || !vehicleNumber) {
      setMessage("All fields are required!");
      return;
    }

    if (!warehouseId || !warehouseName) {
      setMessage("Warehouse information is required!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/deliveryEmployees/create`, {
        name,
        email,
        role: "deliveryEmployee",
        warehouseId,
        warehouseName,
        vehicleNumber,
        employmentType,
        shiftTimings,
        supervisor
      });
      toast.success(res.data.message)
      setMessage(res.data.message);
      setName("");
      setEmail("");
      setVehicleNumber("");
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating employee");
      setMessage(err.response?.data?.message || "Error creating employee");
    }
    setLoading(false);
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this employee?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`${API_BASE_URL}/api/deliveryEmployees/delete/${id}`);

          Swal.fire({
            title: "Deleted!",
            text: res.data.message,
            icon: "success",
            confirmButtonColor: "#3085d6",
          });

          fetchEmployees(); // refresh list
        } catch (err) {
          Swal.fire({
            title: "Error!",
            text: err.response?.data?.message || "Error deleting employee",
            icon: "error",
          });
        }
      }
    });
  };


  // Start editing employee
  const handleEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setVehicleNumber(emp.deliveryEmployee?.vehicleNumber || "");
    setEmploymentType(emp.deliveryEmployee?.employmentType || "Full-time");
    setShiftTimings(emp.deliveryEmployee?.shiftTimings || "9:00 AM - 6:00 PM");
    setSupervisor(emp.deliveryEmployee?.supervisor || "No");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setName("");
    setEmail("");
    setVehicleNumber("");
  };

  // Update employee
  const handleUpdateEmployee = async () => {
    if (!name || !email || !vehicleNumber) {
      setMessage("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/deliveryEmployees/update/${editingEmployee._id}`, {
        name,
        email,
        vehicleNumber,
        employmentType,
        shiftTimings,
        supervisor
      });
      toast.success(res.data.message);
      setMessage(res.data.message);
      setEditingEmployee(null);
      setName("");
      setEmail("");
      setVehicleNumber("");
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating employee");
      setMessage(err.response?.data?.message || "Error updating employee");
    }
    setLoading(false);
  };

  const handleBackToSite = () => {
    window.history.back();
  };

  useEffect(() => {
    // 1️⃣ Try getting warehouseId and name from user context
    let id = user?.warehouse?._id || "";
    let name = user?.warehouse?.name || "";

    // 2️⃣ If not available, try getting from sessionStorage
    if (!id) {
      const storedId = sessionStorage.getItem("warehouseId");
      if (storedId) id = storedId;
    }
    if (!name) {
      const storedName = sessionStorage.getItem("warehouseName");
      if (storedName) name = storedName;
    }

    // 3️⃣ Set state
    setWarehouseId(id);
    setWarehouseName(name);

    // 4️⃣ Store in sessionStorage for future use
    if (id) sessionStorage.setItem("warehouseId", id);
    if (name) sessionStorage.setItem("warehouseName", name);

    console.log("✅ DeliveryManager warehouseId:", id, "warehouseName:", name);
  }, [user]);

  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading </h3>
          <p>Please wait while details are Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dm-main-container">
      {/* Back to Site Button */}
      <div className="dm-nav-section">
        <button className="dm-back-button" onClick={handleBackToSite}>
          <i className="fas fa-arrow-left"></i>
          Back to Site
        </button>
      </div>

      <h2 className="dm-page-title">Delivery Employees Management</h2>

      {message && (
        <div className={`dm-message-alert ${message.includes("Error") ? "dm-alert-error" : "dm-alert-success"}`}>
          {message}
        </div>
      )}

      {/* Warehouse Info Display */}
      {warehouseName && (
        <div className="dm-warehouse-section">
          <div className="dm-warehouse-badge">
            <i className="fas fa-warehouse"></i>
            Warehouse: <strong>{warehouseName}</strong>
          </div>
          <div className="dm-filter-info">
            Showing employees assigned to: <strong>{warehouseName}</strong>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="dm-form-section">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="dm-form-field"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="dm-form-field"
          disabled={editingEmployee ? true : false}
        />
        <input
          type="text"
          placeholder="Vehicle Number"
          value={vehicleNumber}
          onChange={e => setVehicleNumber(e.target.value)}
          className="dm-form-field"
        />

        <input
          type="text"
          value={warehouseName || ""}
          readOnly
          placeholder="Warehouse Name"
          className="dm-form-field"
          disabled
        />
        <input
          type="text"
          value={warehouseId || ""}
          readOnly
          placeholder="Warehouse ID"
          className="dm-form-field"
          disabled
        />

        {/* Employment Type */}
        <select
          name="employmentType"
          value={employmentType || "Full-time"}
          onChange={e => setEmploymentType(e.target.value)}
          className="dm-form-field"
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </select>

        {/* Shift Timings */}
        <select
          name="shiftTimings"
          value={shiftTimings || "9:00 AM - 6:00 PM"}
          onChange={e => setShiftTimings(e.target.value)}
          className="dm-form-field"
        >
          <option value="9:00 AM - 6:00 PM">9:00 AM - 6:00 PM</option>
          <option value="9:00 AM - 1:00 PM">9:00 AM - 1:00 PM</option>
          <option value="1:00 PM - 6:00 PM">1:00 PM - 6:00 PM</option>
        </select>

        {/* Supervisor */}
        <select
          name="supervisor"
          value={supervisor}
          onChange={e => setSupervisor(e.target.value)}
          className="dm-form-field"
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        {/* Create / Update Button */}
        <div className="dm-form-actions">
          {editingEmployee ? (
            <>
              <button onClick={handleUpdateEmployee} disabled={loading} className="dm-update-button">
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Updating Employee...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Update Employee
                  </>
                )}
              </button>
              <button onClick={handleCancelEdit} className="dm-cancel-button">
                <i className="fas fa-times"></i>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={handleCreateEmployee} disabled={loading} className="dm-submit-button">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating Employee...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Create Employee
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Employees List */}
      <div className="dm-employees-section">
        <h3 className="dm-section-heading" id="head">
          <i className="fas fa-users"></i>
          Existing Delivery Employees for {warehouseName || "Current Warehouse"}
        </h3>

        {filteredEmployees.length === 0 ? (
          <div className="dm-empty-state">
            <i className="fas fa-users dm-empty-icon"></i>
            <span className="dm-empty-text">
              {warehouseName
                ? `No delivery employees found for ${warehouseName} warehouse`
                : "No delivery employees found"
              }
            </span>
            {warehouseName && (
              <div className="dm-empty-hint">
                Create a new delivery employee above to get started.
              </div>
            )}
          </div>
        ) : (
          <div className="dm-employees-grid">
            {filteredEmployees.map(emp => (
              <div
                key={emp._id}
                className={`dm-employee-card ${emp.deliveryEmployee?.isActive ? 'dm-card-active' : 'dm-card-inactive'}`}
              >
                <div className="dm-card-header">
                  <div className="dm-employee-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="dm-employee-info">
                    <h4 className="dm-employee-name">{emp.name}</h4>
                    <p className="dm-employee-email">
                      <i className="fas fa-envelope"></i>
                      {emp.email}
                    </p>
                  </div>
                  <div className="dm-header-actions">
                    <div className={`dm-status-badge ${emp.deliveryEmployee?.isActive ?? false ? "dm-status-active" : "dm-status-inactive"}`}>
                      <i className={`fas ${emp.deliveryEmployee?.isActive ?? false ? "fa-check-circle" : "fa-times-circle"}`}></i>
                      {emp.deliveryEmployee?.isActive ?? false ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>

                <div className="dm-card-body">
                  <div className="dm-info-grid">
                    {/* Vehicle */}
                    <div className="dm-info-item">
                      <div className="dm-info-icon">
                        <i className="fas fa-motorcycle"></i>
                      </div>
                      <div className="dm-info-content">
                        <span className="dm-info-label">Vehicle</span>
                        <span className="dm-info-value">
                          {emp.deliveryEmployee?.vehicleNumber || "Not assigned"}
                        </span>
                      </div>
                    </div>

                    {/* Warehouse Name */}
                    <div className="dm-info-item">
                      <div className="dm-info-icon">
                        <i className="fas fa-warehouse"></i>
                      </div>
                      <div className="dm-info-content">
                        <span className="dm-info-label">Warehouse</span>
                        <span className="dm-info-value">
                          {emp.warehouseName || emp.deliveryEmployee?.warehouseName || "Not assigned"}
                        </span>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="dm-info-item">
                      <div className="dm-info-icon">
                        <i className="fas fa-user-tag"></i>
                      </div>
                      <div className="dm-info-content">
                        <span className="dm-info-label">Role</span>
                        <span className="dm-info-value dm-role-badge">
                          {emp.role}
                        </span>
                      </div>
                    </div>

                    {/* Joined Date */}
                    <div className="dm-info-item">
                      <div className="dm-info-icon">
                        <i className="fas fa-calendar"></i>
                      </div>
                      <div className="dm-info-content">
                        <span className="dm-info-label">Joined Date</span>
                        <span className="dm-info-value">
                          {emp.deliveryEmployee?.joinedDate
                            ? new Date(emp.deliveryEmployee.joinedDate).toLocaleDateString()
                            : "Not available"}
                        </span>
                      </div>
                    </div>

                    {/* Employee Type */}
                    <div className="dm-info-item">
                      <div className="dm-info-icon">
                        <i className="fas fa-id-badge"></i>
                      </div>
                      <div className="dm-info-content">
                        <span className="dm-info-label">Employee Type</span>
                        <span className="dm-info-value">
                          {emp.deliveryEmployee?.employmentType || "Full-time"}
                        </span>
                      </div>
                    </div>

                    {/* Shift Timings */}
                    <div className="dm-info-item">
                      <div className="dm-info-icon">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="dm-info-content">
                        <span className="dm-info-label">Shift Timings</span>
                        <span className="dm-info-value">
                          {emp.deliveryEmployee?.shiftTimings || "9:00 AM - 6:00 PM"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dm-card-footer">
                  <div className="dm-footer-content">
                    <div className="dm-employee-id">
                      <i className="fas fa-fingerprint"></i>
                      ID: {emp.deliveryEmployee?.employeeId || "N/A"}
                    </div>

                    <div className="dm-action-buttons">
                      {/* Edit Button */}
                      <button
                        className="dm-edit-button"
                        onClick={() => handleEditEmployee(emp)}
                        title="Edit Employee"
                      >
                        <i className="fas fa-edit"></i>
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        className="dm-delete-button"
                        onClick={() => handleDeleteEmployee(emp._id)}
                        title="Delete Employee"
                      >
                        <i className="fas fa-trash"></i>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryManager;
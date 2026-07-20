import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import API_BASE_URL from "../config";
import { FaEdit, FaTrash, FaMapMarkerAlt, FaWarehouse, FaSearchLocation, FaSave, FaPlus, FaTimes, FaSpinner } from "react-icons/fa";
import "../styles/Warehouse.css";
import "../styles/LoadingAnimation.css";

const GEOAPIFY_API_KEY = "bf58eac2ef4d43d3b7c5661f657f2a03";

export default function Warehouse() {
  const { user } = useContext(AuthContext);
  const [companyName, setCompanyName] = useState("");
  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    district: "",
    state: "",
    postalCode: "",
    country: "",
    capacity: "",
    warehouseManagerName: "",
    warehouseManagerEmail: "",
    role: "warehouse",
    latitude: "",
    longitude: "",
  });

  const [warehouses, setWarehouses] = useState([]);
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const postalCodeTimerRef = useRef(null);

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Auto-fetch address when postal code is entered (minimum 5 digits)
    if (name === "postalCode" && value.length >= 5) {
      // Clear previous timer
      if (postalCodeTimerRef.current) {
        clearTimeout(postalCodeTimerRef.current);
      }

      // Set a new timer to fetch address after user stops typing (1 second delay)
      postalCodeTimerRef.current = setTimeout(() => {
        getAddressFromPostalCode(value);
      }, 1000);
    }
  };

  const getAddressFromPostalCode = async (postalCode = null) => {
    const codeToFetch = postalCode || form.postalCode;

    if (!codeToFetch || codeToFetch.length < 5) {
      setMessage("Please enter a valid postal code (minimum 5 digits)!");
      return;
    }

    // Don't fetch if we're already fetching or if address is already populated
    if (isFetchingAddress || (form.city && form.state && form.country && !editId)) {
      return;
    }

    setIsFetchingAddress(true);
    setMessage("Fetching address...");

    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${codeToFetch}&apiKey=${GEOAPIFY_API_KEY}`
      );

      const feature = res.data?.features?.[0];
      if (feature) {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        const city = props.city || props.county || props.address_line1 || "";

        setForm(prevForm => ({
          ...prevForm,
          street: props.address_line1 || "",
          city: city,
          district: props.state_district || "",
          state: props.state || "",
          country: props.country || "",
          latitude: coords[1],
          longitude: coords[0],
        }));
        toast.success("Address fetched automatically!");
        setMessage("Address fetched automatically!");
      } else {
        toast.error("No address found for this postal code.");
        setMessage("No address found for this postal code.");
      }
    } catch (err) {
      console.error("Geoapify error:", err);
      toast.error("Failed to fetch address from postal code.");
      setMessage("Failed to fetch address from postal code.");
    } finally {
      setIsFetchingAddress(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        role: "warehouse",
        warehouseManager: {
          name: form.warehouseManagerName,
          email: form.warehouseManagerEmail,
        },
      };

      if (editId) {
        await axios.put(`${API_BASE_URL}/api/warehouse/${editId}`, payload);
        toast.success("Warehouse updated successfully!");
        setMessage("Warehouse updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/warehouse`, payload);
        toast.success("Warehouse added successfully!");
        setMessage("Warehouse added successfully!");
      }
      // Reset form
      setForm({
        name: "",
        street: "",
        city: "",
        district: "",
        state: "",
        postalCode: "",
        country: "",
        capacity: "",
        warehouseManagerName: "",
        warehouseManagerEmail: "",
        role: "warehouse",
        latitude: "",
        longitude: "",
      });
      setEditId(null);
      fetchWarehouses();
    } catch (err) {
      console.error(err);
      const backendMsg = err.response?.data?.message;
      toast.error(backendMsg || "Error saving warehouse!");
      setMessage(backendMsg || "Error saving warehouse!");
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/warehouse`);
      setWarehouses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompany = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/company`);
      if (res.data?.data?.name) setCompanyName(res.data.data.name);
    } catch (err) {
      console.error("Error fetching company name:", err);
    }
  };

  const deleteWarehouse = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This warehouse will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/warehouse/${id}`);

      Swal.fire({
        title: "Deleted!",
        text: "Warehouse has been removed successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchWarehouses();
      setMessage("Warehouse deleted successfully!");
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Error deleting warehouse!",
        icon: "error"
      });

      setMessage("Error deleting warehouse!");
    }
  };


  const editWarehouse = (w) => {
    setForm({
      name: w.name,
      street: w.street,
      city: w.city,
      district: w.district,
      state: w.state,
      postalCode: w.postalCode,
      country: w.country,
      capacity: w.capacity || "",
      warehouseManagerName: w.warehouseManager?.name || "",
      warehouseManagerEmail: w.warehouseManager?.email || "",
      role: w.role || "",
      latitude: w.coordinates?.latitude || "",
      longitude: w.coordinates?.longitude || "",
    });
    setEditId(w._id);
    setMessage(`Editing: ${w.name}`);
  };

  const openInMaps = (lat, lon) => {
    if (lat && lon) {
      window.open(`https://www.google.com/maps?q=${lat},${lon}`, "_blank");
    } else {
      toast.error("Coordinates not available for this warehouse.");
    }
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.incharge?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setForm({
      name: "",
      street: "",
      city: "",
      district: "",
      state: "",
      postalCode: "",
      country: "",
      capacity: "",
      warehouseManagerName: "",
      warehouseManagerEmail: "",
      role: "",
      latitude: "",
      longitude: "",
    });
    setEditId(null);
    setMessage("Edit cancelled.");
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (postalCodeTimerRef.current) {
        clearTimeout(postalCodeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchCompany();
    fetchWarehouses();
  }, []);

  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading </h3>
          <p>Please wait while wharehouses are Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wh-main-container">
      <div className="wh-page-header">
        <h1 className="wh-page-title">
          <FaWarehouse className="wh-title-icon" />
          Warehouse Management
        </h1>
        <p className="wh-page-subtitle">
          Manage your warehouse locations and details efficiently
        </p>
      </div>

      {message && (
        <div className={`wh-status-message ${message.includes("Error") ? "wh-error-msg" : "wh-success-msg"}`}>
          {isFetchingAddress ? (
            <div className="wh-fetching-address">
              <FaSpinner className="wh-loading-spinner-small" />
              <span>{message}</span>
            </div>
          ) : (
            message
          )}
        </div>
      )}

      <div className="wh-layout-column">
        <div className="wh-form-container">
          <div className="wh-form-card">
            <div className="wh-form-header">
              <h3 className="wh-form-title">
                {editId ? "Edit Warehouse Details" : "Add New Warehouse"}
              </h3>
              {editId && (
                <div className="wh-edit-badge">
                  Editing Mode
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="wh-input-form">
              <div className="wh-field-group">
                <label className="wh-field-label">Company Name</label>
                <input
                  name="companyName"
                  value={companyName}
                  disabled
                  className="wh-text-input wh-disabled-field"
                />
              </div>

              <div className="wh-postal-container">
                <div className="wh-field-group wh-postal-input-group">
                  <label className="wh-field-label">Postal Code *</label>
                  <input
                    name="postalCode"
                    placeholder="Enter postal code (address will auto-fetch)"
                    value={form.postalCode}
                    onChange={handleChange}
                    className="wh-text-input wh-postal-field"
                    required
                  />
                  <div className="wh-address-hint">
                    {isFetchingAddress ? (
                      <span className="wh-fetching-text">
                        <FaSpinner className="wh-loading-spinner-small" />
                        Fetching address...
                      </span>
                    ) : (
                      <span className="wh-auto-fetch-text">
                        <FaSearchLocation className="wh-hint-icon" />
                        Address will auto-fetch
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="wh-row-layout">
                <div className="wh-field-group">
                  <label className="wh-field-label">Warehouse Name *</label>
                  <input
                    name="name"
                    placeholder="Enter warehouse name"
                    value={form.name}
                    onChange={handleChange}
                    className="wh-text-input"
                    required
                  />
                </div>
                <div className="wh-field-group">
                  <label className="wh-field-label">Capacity</label>
                  <input
                    name="capacity"
                    placeholder="Enter capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    className="wh-text-input"
                    type="number"
                  />
                </div>
              </div>

              <div className="wh-row-layout">
                <div className="wh-field-group">
                  <label className="wh-field-label">Warehouse Manager Name *</label>
                  <input
                    name="warehouseManagerName"
                    placeholder="Enter manager name"
                    value={form.warehouseManagerName}
                    onChange={handleChange}
                    className="wh-text-input"
                    required
                  />
                </div>

                <div className="wh-field-group">
                  <label className="wh-field-label">Manager Email *</label>
                  <input
                    type="email"
                    name="warehouseManagerEmail"
                    placeholder="Enter manager email"
                    value={form.warehouseManagerEmail}
                    onChange={handleChange}
                    className="wh-text-input"
                    required
                    disabled={editId ? true : false}
                  />
                </div>
              </div>

              <div className="wh-row-layout">
                <div className="wh-field-group">
                  <label className="wh-field-label">City</label>
                  <input
                    name="city"
                    placeholder="Enter city"
                    value={form.city}
                    onChange={handleChange}
                    className="wh-text-input"
                    disabled
                  />
                </div>
                <div className="wh-field-group">
                  <label className="wh-field-label">District</label>
                  <input
                    name="district"
                    placeholder="Enter district"
                    value={form.district}
                    onChange={handleChange}
                    className="wh-text-input"
                    disabled
                  />
                </div>
              </div>

              <div className="wh-row-layout">
                <div className="wh-field-group">
                  <label className="wh-field-label">State</label>
                  <input
                    name="state"
                    placeholder="Enter state"
                    value={form.state}
                    onChange={handleChange}
                    className="wh-text-input"
                    disabled
                  />
                </div>
                <div className="wh-field-group">
                  <label className="wh-field-label">Country</label>
                  <input
                    name="country"
                    placeholder="Enter country"
                    value={form.country}
                    onChange={handleChange}
                    className="wh-text-input"
                    disabled
                  />
                </div>
              </div>

              <div className="wh-form-buttons">
                <button type="submit" className="wh-primary-btn">
                  {editId ? (
                    <>
                      <FaSave className="wh-btn-icon" />
                      Update Warehouse
                    </>
                  ) : (
                    <>
                      <FaPlus className="wh-btn-icon" />
                      Add Warehouse
                    </>
                  )}
                </button>

                {editId && (
                  <button type="button" onClick={resetForm} className="wh-cancel-btn">
                    <FaTimes className="wh-btn-icon" />
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="wh-data-container">
          <div className="wh-search-controls">
            <div className="wh-search-wrapper">
              <FaSearchLocation className="wh-search-icon" />
              <input
                type="text"
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="wh-search-input"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "14px",
                  width: "100%",
                  color: "#2c3e50",
                  padding: "6px 0"
                }}
              />
            </div>
          </div>

          <div className="wh-table-wrapper">
            <h3 className="wh-table-heading">All Warehouses</h3>

            {filteredWarehouses.length > 0 ? (
              <table className="wh-data-grid">
                <thead>
                  <tr>
                    <th className="wh-col-index">S.No</th>
                    <th className="wh-col-name">Name</th>
                    <th className="wh-col-incharge">Manager Name</th>
                    <th className="wh-col-email">Manager Email</th>
                    <th className="wh-col-role">Role</th>
                    <th className="wh-col-capacity">Capacity</th>
                    <th className="wh-col-postal">Postal Code</th>
                    <th className="wh-col-city">City</th>
                    <th className="wh-col-city">District</th>
                    <th className="wh-col-state">State</th>
                    <th className="wh-col-country">Country</th>
                    <th className="wh-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWarehouses.map((w, index) => (
                    <tr key={w._id} className="wh-data-item">
                      <td className="wh-cell-index">{index + 1}</td>
                      <td className="wh-cell-name">{w.name}</td>
                      <td className="wh-cell-incharge">{w.warehouseManager?.name || "—"}</td>
                      <td className="wh-cell-email">{w.warehouseManager?.email || "—"}</td>
                      <td className="wh-cell-role">{w.role || "—"}</td>
                      <td className="wh-cell-capacity">{w.capacity || 0}</td>
                      <td className="wh-cell-postal">{w.postalCode || "—"}</td>
                      <td className="wh-cell-city">{w.city || "—"}</td>
                      <td className="wh-cell-city">{w.district || "—"}</td>
                      <td className="wh-cell-state">{w.state || "—"}</td>
                      <td className="wh-cell-country">{w.country || "—"}</td>
                      <td className="wh-cell-actions">
                        <button
                          onClick={() => editWarehouse(w)}
                          className="wh-action-btn wh-edit-action"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteWarehouse(w._id)}
                          className="wh-action-btn wh-delete-action"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                        <button
                          onClick={() => openInMaps(w.coordinates?.latitude, w.coordinates?.longitude)}
                          className="wh-action-btn wh-map-action"
                          title="View on Map"
                        >
                          <FaMapMarkerAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="wh-empty-state">
                <FaWarehouse className="wh-empty-icon" />
                <p className="wh-empty-text">No warehouses found</p>
                {searchTerm && <p className="wh-empty-hint">Try adjusting your search terms</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
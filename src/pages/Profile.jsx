import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FaUser, FaEnvelope, FaPhone, FaHome,
  FaMapMarkerAlt, FaCity, FaSave, FaEdit,
  FaGlobe, FaCheckCircle
} from "react-icons/fa";
import API_BASE_URL from "../config";
import "../styles/Profile.css";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    regionCode: "+91",
    mobile: "",
    houseNumber: "",
    addressLine1: "",
    addressLine2: "",
    district: "",
    city: "",
    state: "",
    pincode: "",
    region: "",
    latitude: null,
    longitude: null,
    vatNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;



  // Ref to track initial load and avoid API calls on mount
  const initialLoad = useRef(true);
  const pincodeInputRef = useRef(null);

  const countryCodes = [
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    { code: "+61", country: "Australia" },
    { code: "+91", country: "India" },
    { code: "+81", country: "Japan" },
    { code: "+49", country: "Germany" },
    { code: "+33", country: "France" },
    { code: "+971", country: "UAE" },
    { code: "+86", country: "China" },
  ];

  // Load profile
  useEffect(() => {
    if (user?.id) {
      fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setProfile({
            name: data.name || "",
            email: data.email || "",
            regionCode: data.regionCode || "+91",
            mobile: data.mobile || "",
            houseNumber: data.houseNumber || "",
            addressLine1: data.addressLine1 || "",
            addressLine2: data.addressLine2 || "",
            district: data.district || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
            region: data.region || "",
            vatNumber: data.vatNumber || "",
          });
        })
        .catch((err) => console.error("Error loading profile:", err));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Auto-fetch address when pincode changes and is valid
  useEffect(() => {
    // Skip on initial load and when not editing
    if (initialLoad.current || !isEditing) {
      initialLoad.current = false;
      return;
    }

    // Only fetch if pincode is exactly 6 digits (for India) or 5 digits (for US)
    const isValidPincode = /^\d{5,6}$/.test(profile.pincode.trim());

    if (isValidPincode) {
      // Add a small delay to avoid too many API calls while typing
      const timer = setTimeout(() => {
        fetchAddressByPincode();
      }, 800); // 800ms delay

      return () => clearTimeout(timer);
    }
  }, [profile.pincode, isEditing]);

  const fetchAddressByPincode = async () => {
    if (!profile.pincode.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const GEOAPIFY_API_KEY = "bf58eac2ef4d43d3b7c5661f657f2a03";
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${profile.pincode.trim()}&apiKey=${GEOAPIFY_API_KEY}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch address");
      }

      const data = await res.json();

      const feature = data.features?.[0];
      if (!feature) {
        console.warn("No address found for this postal code");
        return;
      }

      const props = feature.properties;
      const district = props.state_district || props.county || props.city || "";
      const city = props.city || props.county || "";
      const state = props.state || "";
      const country = props.country || "";

      setProfile((prev) => ({
        ...prev,
        district: district,
        city: city,
        state: state,
        region: country,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      }));

      console.log("Address fetched automatically for pincode:", profile.pincode);
    } catch (err) {
      console.error("Geoapify fetch error:", err);
      // Don't show alert for automatic fetch to avoid annoying the user
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCurrentPassword = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ password: currentPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError("Current password is incorrect.");
        setPasswordVerified(false);
        return;
      }

      setPasswordError("");
      setPasswordVerified(true);
      setPasswordSuccess("Password verified! You can now set a new password.");
    } catch (err) {
      console.error("Password verify error:", err);
      setPasswordError("Something went wrong.");
    }
  };

  const updatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Please enter all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (!strongPasswordRegex.test(newPassword)) {
      setPasswordError(
        "Password must be 8+ characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      // ❌ Show backend error message directly
      if (!res.ok) {
        setPasswordError(data.message || "Failed to update password.");
        return;
      }

      // ✅ Success
      setPasswordSuccess(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordVerified(false);

    } catch (err) {
      console.error("Password update error:", err);
      setPasswordError("Something went wrong. Try again later.");
    }
  };



  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      setIsSaved(true);
      setIsEditing(false);

      // Reset saved status after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);

      setProfile((prev) => ({ ...prev, ...data }));
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  const handleRemoveVat = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/remove-vat/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to remove VAT");
        return;
      }

      // ✅ Update UI
      setProfile((prev) => ({
        ...prev,
        vatNumber: "",
      }));

      toast.success("VAT removed successfully ✅");

    } catch (err) {
      console.error("Error removing VAT:", err);
      toast.error("Something went wrong ❌");
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isSaved) setIsSaved(false);
    // Reset the initial load flag when entering edit mode
    if (!isEditing) {
      initialLoad.current = true;
      setTimeout(() => {
        initialLoad.current = false;
      }, 100);
    }
  };

  return (
    <><Navbar />
      <div className="profile-page-container">
        <div className="profile-page-header">
          <h1 className="profile-page-title">My Profile</h1>
          <div className="profile-page-actions">
            {isEditing ? (
              <button className="profile-btn-save" onClick={handleSave}>
                <FaSave className="profile-btn-icon" />
                Save Changes
              </button>
            ) : (
              <button className="profile-btn-edit" onClick={toggleEdit}>
                <FaEdit className="profile-btn-icon" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {isSaved && (
          <div className="profile-save-notification">
            <FaCheckCircle className="profile-success-icon" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <div className="profile-card-container">
          <div className="profile-avatar-section">
            <div className="profile-avatar-circle">
              <FaUser className="profile-avatar-icon" />
            </div>
            <h2 className="profile-user-name">{profile.name || "User Name"}</h2>
          </div>

          <div className="profile-form-container">
            <div className="profile-form-section">
              <h3 className="profile-section-title">
                <FaUser className="profile-section-icon" />
                Personal Information
              </h3>

              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label className="profile-input-label">
                    <FaUser className="profile-input-icon" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="profile-form-input"
                    disabled={!isEditing}
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-input-label">
                    <FaEnvelope className="profile-input-icon" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="profile-form-input"
                    disabled
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-input-label">
                  <FaGlobe className="profile-input-icon" />
                  Pincode
                  {isLoading && isEditing && (
                    <span className="profile-loading-text"> (Fetching address...)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={profile.pincode}
                  onChange={handleChange}
                  className="profile-form-input"
                  disabled={!isEditing}
                  placeholder="Enter pincode to auto-fill address"
                  ref={pincodeInputRef}
                />

                {isEditing && (
                  <div className="profile-pincode-hint">
                    Address will be automatically fetched when you enter a valid pincode
                  </div>
                )}
              </div>

              <div className="profile-form-group">
                <label className="profile-input-label">
                  <FaPhone className="profile-input-icon" />
                  Mobile Number
                </label>
                <div className="profile-mobile-input-group">
                  <select
                    name="regionCode"
                    value={profile.regionCode}
                    onChange={handleChange}
                    className="profile-country-code-select"
                    disabled={!isEditing}
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.country} ({c.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="mobile"
                    value={profile.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    className="profile-mobile-input"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="profile-form-section">
              <h3 className="profile-section-title">
                <FaHome className="profile-section-icon" />
                Address Information
              </h3>

              <div className="profile-form-group">
                <label className="profile-input-label">
                  <FaHome className="profile-input-icon" />
                  House/Apartment Number *
                </label>
                <input
                  type="text"
                  name="houseNumber"
                  value={profile.houseNumber}
                  onChange={handleChange}
                  className="profile-form-input"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-input-label">
                  <FaHome className="profile-input-icon" />
                  Address Line 1 (Street / Area )*
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={profile.addressLine1}
                  onChange={handleChange}
                  className="profile-form-input"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-input-label">
                  <FaHome className="profile-input-icon" />
                  Address Line 2 (Nearby LandMark) *
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={profile.addressLine2}
                  onChange={handleChange}
                  className="profile-form-input"
                  disabled={!isEditing}
                  required
                />
              </div>



              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label className="profile-input-label">
                    <FaCity className="profile-input-icon" />
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    className="profile-form-input"
                    disabled
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-input-label">
                    <FaCity className="profile-input-icon" />
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={profile.district}
                    onChange={handleChange}
                    className="profile-form-input"
                    disabled
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-input-label">
                    <FaMapMarkerAlt className="profile-input-icon" />
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleChange}
                    className="profile-form-input"
                    disabled
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-input-label">
                  <FaGlobe className="profile-input-icon" />
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={profile.region}
                  onChange={handleChange}
                  className="profile-form-input"
                  disabled
                />
              </div>



              <div className="profile-form-group">
                <label className="profile-input-label">
                  <FaGlobe className="profile-input-icon" />
                  VAT Number
                </label>
                <input
                  type="text"
                  name="vatNumber"
                  value={profile.vatNumber}
                  onChange={handleChange}
                  className="profile-form-input"
                  disabled={!isEditing}
                  placeholder="Enter VAT Number"
                />
                {profile.vatNumber && isEditing && (
                  <button
                    className="remove-vat-btn"
                    onClick={handleRemoveVat}
                  >
                    Remove VAT
                  </button>
                )}
              </div>


              <div className="profile-helper-text">
                If you have an organization, please provide your VAT number.
              </div>
            </div>

            <div className="profile-form-section">
              <h3 className="profile-section-title">
                <FaUser /> Update Password
              </h3>

              {passwordError && <p className="error-text">{passwordError}</p>}
              {passwordSuccess && <p className="success-text">{passwordSuccess}</p>}

              {/* Current Password */}
              <div className="profile-form-group">
                <label className="profile-input-label">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="profile-form-input"
                />
                <button
                  className="profile-btn-edit"
                  onClick={verifyCurrentPassword}
                  disabled={!currentPassword}
                  style={{ marginTop: "10px" }}
                >
                  Verify Password
                </button>
              </div>

              {/* New Password */}
              <div className="profile-form-group">
                <label className="profile-input-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  disabled={!passwordVerified}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="profile-form-input"
                />
              </div>

              {/* Confirm Password */}
              <div className="profile-form-group">
                <label className="profile-input-label">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  disabled={!passwordVerified}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="profile-form-input"
                />
              </div>

              <button
                className="profile-btn-save"
                onClick={updatePassword}
                disabled={!passwordVerified}
              >
                Update Password
              </button>
            </div>


          </div>
        </div>
        <Chatbot />
      </div>
      <Footer />
    </>
  );
}
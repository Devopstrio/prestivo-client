import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import "../styles/CreateProfile.css";

// React Icons
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaMapMarkerAlt,
  FaGlobe,
  FaMoneyBillWave,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

const CreateProfile = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    regionCode: "+91",
    mobile: "",
    houseNumber: "",
    addressLine1: "",
    addressLine2: "",
    pincode: "",
    district: "",
    city: "",
    state: "",
    region: "",
    latitude: null,
    longitude: null,
    currency: "GBP",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const pincodeInputRef = useRef(null);
  const GEOAPIFY_API_KEY = "bf58eac2ef4d43d3b7c5661f657f2a03";

  // Currency symbols and available options
  const currencySymbols = {
    GBP: "£",
    INR: "₹",
    USD: "$",
    EUR: "€",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
  };

  // Region codes
  const regionCodes = [
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "France", flag: "🇫🇷" },
  ];

  const getDeviceType = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone/.test(ua)) return 1;
    if (/tablet|ipad/.test(ua)) return 2;
    return 3;
  };

  const getOS = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "MacOS";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone")) return "iOS";
    return "Web";
  };

  const getBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edg")) return "Edge";
    return "Browser";
  };

  // Get user email safely from sessionStorage
  useEffect(() => {
    let sessionUser = null;
    const storedUser = sessionStorage.getItem("user");
    const verifyEmail = sessionStorage.getItem("verifyEmail");

    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        sessionUser = JSON.parse(storedUser);
      } catch (err) {
        console.error("Invalid session user JSON:", storedUser);
        sessionStorage.removeItem("user");
      }
    }

    const email = sessionUser?.email || verifyEmail;

    if (!email) {
      toast.error("Email not found in session. Please sign up again.");
      navigate("/signup");
      return;
    }

    setProfile((prev) => ({ ...prev, email }));
    fetchUserByEmail(email);
  }, [navigate]);

  // Fetch user data from backend using email
  const fetchUserByEmail = async (email) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/users/email/${email}`);
      if (response.data) {
        const userData = response.data;

        // Pre-fill existing details if found
        setProfile((prev) => ({
          ...prev,
          name: userData.name || "",
          regionCode: userData.regionCode || "+91",
          mobile: userData.mobile || "",
          houseNumber: userData.houseNumber || "",
          addressLine1: userData.addressLine1 || "",
          addressLine2: userData.addressLine2 || "",
          pincode: userData.pincode || "",
          city: userData.city || "",
          district: userData.district || "",
          state: userData.state || "",
          region: userData.region || "",
          currency: userData.currency || "GBP",
        }));

        sessionStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.warn("No existing user found for email:", email);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch address from pincode
  useEffect(() => {
    const isValid = /^\d{5,6}$/.test(profile.pincode.trim());
    if (!isValid) return;

    const timer = setTimeout(() => fetchAddressByPincode(), 800);
    return () => clearTimeout(timer);
  }, [profile.pincode]);

  const fetchAddressByPincode = async () => {
    try {
      setIsLoading(true);
      setErrors((prev) => ({ ...prev, pincode: "" }));

      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${profile.pincode}&apiKey=${GEOAPIFY_API_KEY}`
      );
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const props = feature.properties;

        setProfile((prev) => ({
          ...prev,
          district: props.state_district || props.county || props.city || "",
          city: props.city || props.county || "",
          state: props.state || "",
          region: props.country || "",
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          pincode: "Invalid pincode. Please check and try again."
        }));
      }
    } catch (err) {
      console.error("Geoapify Error:", err);
      setErrors((prev) => ({
        ...prev,
        pincode: "Failed to fetch address. Please try again."
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!profile.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!profile.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(profile.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    if (!profile.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{5,6}$/.test(profile.pincode)) {
      newErrors.pincode = "Please enter a valid 5 or 6 digit pincode";
    }

    if (!profile.houseNumber.trim()) {
      newErrors.houseNumber = "House number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      setSuccess(false);

      const userSession = sessionStorage.getItem("user");
      const token = sessionStorage.getItem("authToken");

      if (!userSession || !token) {
        toast.warn("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const user = JSON.parse(userSession);

      /* ================= SAVE PROFILE ================= */
      const response = await axios.put(
        `${API_BASE_URL}/api/users/${user._id}`,
        profile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      /* ================= UPDATE CURRENCY ================= */
      await axios.put(
        `${API_BASE_URL}/api/users/currency`,
        { currency: profile.currency },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const deviceInfo = {
        deviceType: getDeviceType(),
        brand: getOS(),
        model: getBrowser(),
      };

      // ================= STORE DEVICE =================
      await axios.post(
        `${API_BASE_URL}/api/users/store-device-session`,
        {
          device: `${deviceInfo.brand} - ${deviceInfo.model}`,
          browser: deviceInfo.model,
          os: deviceInfo.brand,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      /* ================= FETCH /ME ================= */
      const meRes = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      /* ================= UPDATE AUTH CONTEXT ================= */
      login({
        ...meRes.data.user,
        id: meRes.data.user._id,
        token,
      });

      /* ================= SUCCESS ================= */
      if (response.status === 200) {
        setSuccess(true);
        toast.success("Profile Created Successfully!");
        navigate("/");
      }

    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to create profile. Please try again.",
      }));
    } finally {
      setIsSaving(false);
    }
  };





  return (
    <div className="ecProfile-container">
      <div className="ecProfile-card">
        <div className="ecProfile-header">
          <div className="ecProfile-headerIcon">
            <FaUser />
          </div>
          <h2>Create Your Profile</h2>
          <p>Complete your profile details to continue</p>
        </div>

        <div className="ecProfile-form">
          {errors.submit && (
            <div className="ecProfile-errorMessage">
              <FaExclamationTriangle />
              <span>{errors.submit}</span>
            </div>
          )}

          {success && (
            <div className="ecProfile-successMessage">
              <FaCheckCircle />
              <span>Profile created successfully! Redirecting to login...</span>
            </div>
          )}

          <div className="ecProfile-formGrid">
            {/* Personal Information Section */}
            <div className="ecProfile-formSection">
              <h3 className="ecProfile-sectionTitle">
                <FaUser className="ecProfile-sectionIcon" />
                Personal Information
              </h3>

              <div className="ecProfile-formGroup">
                <label htmlFor="name" className="ecProfile-formLabel">
                  <FaUser className="ecProfile-inputIcon" />
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`ecProfile-formInput ${errors.name ? "ecProfile-formInput-error" : ""}`}
                />
                {errors.name && <span className="ecProfile-errorText">{errors.name}</span>}
              </div>

              <div className="ecProfile-formGroup">
                <label htmlFor="email" className="ecProfile-formLabel">
                  <FaEnvelope className="ecProfile-inputIcon" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="ecProfile-formInput ecProfile-inputDisabled"
                />
                <span className="ecProfile-helperText">Email cannot be changed</span>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="ecProfile-formSection">
              <h3 className="ecProfile-sectionTitle">
                <FaPhone className="ecProfile-sectionIcon" />
                Contact Information
              </h3>

              <div className="ecProfile-formGroup">
                <label htmlFor="mobile" className="ecProfile-formLabel">
                  <FaPhone className="ecProfile-inputIcon" />
                  Mobile Number *
                </label>
                <div className="ecProfile-mobileContainer">
                  <select
                    name="regionCode"
                    value={profile.regionCode}
                    onChange={handleChange}
                    className="ecProfile-countrySelect"
                  >
                    {regionCodes.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.flag} {region.code}
                      </option>
                    ))}
                  </select>
                  <input
                    id="mobile"
                    type="text"
                    name="mobile"
                    value={profile.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    className={`ecProfile-formInput ecProfile-mobileInput ${errors.mobile ? "ecProfile-formInput-error" : ""}`}
                  />
                </div>
                {errors.mobile && <span className="ecProfile-errorText">{errors.mobile}</span>}
              </div>
            </div>

            {/* Address Information Section */}
            <div className="ecProfile-formSection ecProfile-formSection-full">
              <h3 className="ecProfile-sectionTitle">
                <FaHome className="ecProfile-sectionIcon" />
                Address Information
              </h3>

              <div className="ecProfile-addressGrid">
                <div className="ecProfile-formGroup">
                  <label htmlFor="houseNumber" className="ecProfile-formLabel">
                    <FaHome className="ecProfile-inputIcon" />
                    House/Flat Number *
                  </label>
                  <input
                    id="houseNumber"
                    type="text"
                    name="houseNumber"
                    value={profile.houseNumber}
                    onChange={handleChange}
                    placeholder="Enter house/flat number"
                    required
                    className={`ecProfile-formInput ${errors.houseNumber ? "ecProfile-formInput-error" : ""}`}
                  />
                  {errors.houseNumber && <span className="ecProfile-errorText">{errors.houseNumber}</span>}
                </div>

                <div className="ecProfile-formGroup">
                  <label htmlFor="addressLine1" className="ecProfile-formLabel">
                    <FaHome className="ecProfile-inputIcon" />
                    Street / Area *
                  </label>
                  <input
                    id="addressLine1"
                    type="text"
                    name="addressLine1"
                    value={profile.addressLine1}
                    onChange={handleChange}
                    placeholder="Enter street or area"
                    required
                    className="ecProfile-formInput"
                  />
                </div>


                <div className="ecProfile-formGroup">
                  <label htmlFor="addressLine2" className="ecProfile-formLabel">
                    <FaHome className="ecProfile-inputIcon" />
                    Landmark *
                  </label>
                  <input
                    id="addressLine2"
                    type="text"
                    name="addressLine2"
                    value={profile.addressLine2}
                    onChange={handleChange}
                    required
                    placeholder="Enter landmark (optional)"
                    className="ecProfile-formInput"
                  />
                </div>

                <div className="ecProfile-formGroup">
                  <label htmlFor="pincode" className="ecProfile-formLabel">
                    <FaMapMarkerAlt className="ecProfile-inputIcon" />
                    Pincode *
                    {isLoading && <span className="ecProfile-loadingIndicator">Fetching address...</span>}
                  </label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    value={profile.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    ref={pincodeInputRef}
                    className={`ecProfile-formInput ${errors.pincode ? "ecProfile-formInput-error" : ""}`}
                  />
                  {errors.pincode && <span className="ecProfile-errorText">{errors.pincode}</span>}
                </div>

                <div className="ecProfile-formGroup">
                  <label htmlFor="city" className="ecProfile-formLabel">
                    <FaMapMarkerAlt className="ecProfile-inputIcon" />
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={profile.city}
                    disabled
                    className="ecProfile-formInput ecProfile-inputDisabled"
                  />
                </div>


                <div className="ecProfile-formGroup">
                  <label htmlFor="district" className="ecProfile-formLabel">
                    <FaMapMarkerAlt className="ecProfile-inputIcon" />
                    District
                  </label>
                  <input
                    id="district"
                    type="text"
                    value={profile.district}
                    disabled
                    className="ecProfile-formInput ecProfile-inputDisabled"
                  />
                </div>

                <div className="ecProfile-formGroup">
                  <label htmlFor="state" className="ecProfile-formLabel">
                    <FaMapMarkerAlt className="ecProfile-inputIcon" />
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={profile.state}
                    disabled
                    className="ecProfile-formInput ecProfile-inputDisabled"
                  />
                </div>

                <div className="ecProfile-formGroup">
                  <label htmlFor="region" className="ecProfile-formLabel">
                    <FaGlobe className="ecProfile-inputIcon" />
                    Country
                  </label>
                  <input
                    id="region"
                    type="text"
                    value={profile.region}
                    disabled
                    className="ecProfile-formInput ecProfile-inputDisabled"
                  />
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            {/* <div className="ecProfile-formSection">
              <h3 className="ecProfile-sectionTitle">
                <FaMoneyBillWave className="ecProfile-sectionIcon" />
                Preferences
              </h3>

              <div className="ecProfile-formGroup">
                <label htmlFor="currency" className="ecProfile-formLabel">
                  <FaMoneyBillWave className="ecProfile-inputIcon" />
                  Preferred Currency
                </label>
                <div className="ecProfile-selectWrapper">
                  <select
                    id="currency"
                    name="currency"
                    value={profile.currency}
                    onChange={handleChange}
                    className="ecProfile-formSelect ecProfile-currencySelect"
                  >
                    {Object.entries(currencySymbols).map(([code, symbol]) => (
                      <option key={code} value={code}>
                        {code} ({symbol})
                      </option>
                    ))}
                  </select>
                  <IoIosArrowDown className="ecProfile-selectArrow" />
                </div>
                <span className="ecProfile-helperText">
                  Selected: {currencySymbols[profile.currency]} ({profile.currency})
                </span>
              </div>
            </div> */}
          </div>

          <div className="ecProfile-formActions">
            <button
              onClick={handleSave}
              className="ecProfile-saveButton"
              disabled={isSaving || !profile.name || !profile.pincode || !profile.mobile || !profile.houseNumber}
            >
              {isSaving ? (
                <>
                  <FaSpinner className="ecProfile-buttonSpinner" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <FaSave />
                  Create Profile
                </>
              )}
            </button>

            <p className="ecProfile-formNote">
              * Required fields. Your profile information will be used to personalize your experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
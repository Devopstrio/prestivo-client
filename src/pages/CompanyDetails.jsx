import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import "../styles/CompanyDetails.css";
import "../styles/LoadingAnimation.css";

// Import icons
import {
  FaBuilding, FaFileAlt, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaGlobe, FaFacebook, FaTwitter, FaInstagram, FaWhatsapp,
  FaMoneyBillWave, FaUniversity, FaIdCard, FaBullseye, FaEye,
  FaSave, FaTrash, FaUpload, FaPlusCircle, FaEdit, FaClock, FaSpinner,
  FaSignature, FaDrawPolygon, FaEraser, FaUndo, FaPencilAlt
} from "react-icons/fa";

const CompanyDetails = () => {
  const [company, setCompany] = useState({
    name: "",
    type: "",
    registrationNumber: "",
    about: "",
    street: "",
    city: "",
    district: "",
    state: "",
    postalCode: "",
    country: "",
    mapLink: "",
    email: "",
    phone: "",
    whatsapp: "",
    website: "",
    facebook: "",
    twitter: "",
    instagram: "",
    mission: "",
    vision: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    swift: "",
    vatNumber: "",
    logo: null,
    signature: null,
    workingHours: ""
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [signaturePreview, setSignaturePreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [signatureMethod, setSignatureMethod] = useState("upload"); // "upload" or "draw"
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(2);
  const [penColor, setPenColor] = useState("#000000");

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Initialize canvas for drawing
  useEffect(() => {
    if (signatureMethod === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas size
      canvas.width = 600;
      canvas.height = 200;

      // Style the canvas
      context.strokeStyle = penColor;
      context.lineWidth = penSize;
      context.lineCap = "round";
      context.lineJoin = "round";
      contextRef.current = context;

      // Clear canvas
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [signatureMethod, penColor, penSize]);

  const fetchCompanyDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/company`);
      if (res.data.data) {
        const companyData = res.data.data;

        setCompany({
          ...companyData,
          logo: null, // We don't auto-populate file input
          signature: null, // We don't auto-populate file input
        });

        // ✅ Handle base64 Buffer or logoUrl
        if (companyData.logo?.data) {
          const base64String = `data:${companyData.logo.contentType || "image/png"};base64,${companyData.logo.data}`;
          setLogoPreview(base64String);
        } else if (companyData.logoUrl) {
          setLogoPreview(`${API_BASE_URL}${companyData.logoUrl}`);
        }

        // ✅ Handle signature preview
        if (companyData.signature?.data) {
          const base64String = `data:${companyData.signature.contentType || "image/png"};base64,${companyData.signature.data}`;
          setSignaturePreview(base64String);
        } else if (companyData.signatureUrl) {
          setSignaturePreview(`${API_BASE_URL}${companyData.signatureUrl}`);
        }

        setIsEditing(true);
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (e.target.name === "logo") {
      setCompany({ ...company, logo: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (e.target.name === "signature") {
      setCompany({ ...company, signature: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSignaturePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Canvas Drawing Functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    if (context) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const updatePenSettings = () => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = penColor;
      contextRef.current.lineWidth = penSize;
    }
  };

  const saveCanvasAsImage = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const file = new File([blob], "signature.png", { type: "image/png" });
      setCompany({ ...company, signature: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result);
      };
      reader.readAsDataURL(blob);

      // Switch back to upload view to show preview
      setSignatureMethod("upload");
    }, "image/png");
  };

  const handleClear = () => {
    setCompany({
      name: "",
      type: "",
      registrationNumber: "",
      about: "",
      street: "",
      city: "",
      district: "",
      state: "",
      postalCode: "",
      country: "",
      email: "",
      phone: "",
      whatsapp: "",
      website: "",
      facebook: "",
      mapLink: "",
      twitter: "",
      instagram: "",
      mission: "",
      vision: "",
      bankName: "",
      accountNumber: "",
      ifsc: "",
      swift: "",
      taxNumber: "",
      logo: null,
      signature: null,
      workingHours: ""
    });
    setLogoPreview("");
    setSignaturePreview("");
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      for (const key in company) {
        if (company[key] !== null && company[key] !== undefined) {
          formData.append(key, company[key]);
        }
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/company`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Company details saved successfully!");
      setCompany({ ...res.data.data, logo: null, signature: null });
      setIsEditing(true);

      if (res.data.data.logoUrl) {
        setLogoPreview(`${API_BASE_URL}${res.data.data.logoUrl}`);
      }
      if (res.data.data.signatureUrl) {
        setSignaturePreview(`${API_BASE_URL}${res.data.data.signatureUrl}`);
      }
    } catch (err) {
      // console.error("Error saving company details:", err);
      toast.error("Failed to save company details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  useEffect(() => {
    updatePenSettings();
  }, [penColor, penSize]);

  const stripIframe = (input) => {
    if (!input) return "";
    const match = input.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];
    return input;
  };

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
    <div className="comp-details-container">
      <div className="comp-header">
        <h2 className="comp-title">
          <FaBuilding className="comp-title-icon" />
          Company Details
        </h2>
        <p className="comp-subtitle">Manage your company information and branding</p>
      </div>

      <form onSubmit={handleSubmit} className="comp-form">
        {/* Logo Section */}
        <div className="comp-form-section comp-logo-section">
          <h3 className="comp-section-title">
            <FaUpload className="comp-section-icon" />
            Company Logo
          </h3>
          <div className="comp-logo-upload-container">
            <div className="comp-logo-preview">
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" className="comp-logo-image" />
              ) : (
                <div className="comp-logo-placeholder">
                  <FaBuilding className="comp-placeholder-icon" />
                  <span>Upload Logo</span>
                </div>
              )}
            </div>
            <label className="comp-file-input-label">
              <input
                type="file"
                name="logo"
                onChange={handleFileChange}
                accept="image/*"
                className="comp-file-input"
              />
              <span className="comp-upload-button">
                <FaUpload className="comp-upload-icon" />
                Choose File
              </span>
            </label>
          </div>
        </div>

        {/* Signature Section */}
        <div className="comp-form-section comp-signature-section">
          <h3 className="comp-section-title">
            <FaSignature className="comp-section-icon" />
            Authorized Signature
          </h3>

          {/* Signature Method Selection */}
          <div className="comp-signature-method-tabs">
            <button
              type="button"
              className={`comp-method-tab ${signatureMethod === "upload" ? "active" : ""}`}
              onClick={() => setSignatureMethod("upload")}
            >
              <FaUpload className="comp-tab-icon" />
              Upload Image
            </button>
            <button
              type="button"
              className={`comp-method-tab ${signatureMethod === "draw" ? "active" : ""}`}
              onClick={() => setSignatureMethod("draw")}
            >
              <FaPencilAlt className="comp-tab-icon" />
              Draw Signature
            </button>
          </div>

          {/* Upload Method */}
          {signatureMethod === "upload" && (
            <div className="comp-signature-upload-container">
              <div className="comp-signature-preview">
                {signaturePreview ? (
                  <img src={signaturePreview} alt="Company Signature" className="comp-signature-image" />
                ) : (
                  <div className="comp-signature-placeholder">
                    <FaSignature className="comp-placeholder-icon" />
                    <span>Upload Signature</span>
                  </div>
                )}
              </div>
              <label className="comp-file-input-label">
                <input
                  type="file"
                  name="signature"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="comp-file-input"
                />
                <span className="comp-upload-button">
                  <FaUpload className="comp-upload-icon" />
                  Choose Signature File
                </span>
              </label>
            </div>
          )}

          {/* Draw Method */}
          {signatureMethod === "draw" && (
            <div className="comp-signature-draw-container">
              {/* Drawing Tools */}
              <div className="comp-drawing-tools">
                <div className="comp-tool-group">
                  <label className="comp-tool-label">
                    <FaPencilAlt className="comp-tool-icon" />
                    Pen Size
                  </label>
                  <div className="comp-pen-size-controls">
                    <button
                      type="button"
                      className={`comp-pen-size-btn ${penSize === 1 ? 'active' : ''}`}
                      onClick={() => setPenSize(1)}
                    >
                      Thin
                    </button>
                    <button
                      type="button"
                      className={`comp-pen-size-btn ${penSize === 2 ? 'active' : ''}`}
                      onClick={() => setPenSize(2)}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      className={`comp-pen-size-btn ${penSize === 4 ? 'active' : ''}`}
                      onClick={() => setPenSize(4)}
                    >
                      Thick
                    </button>
                  </div>
                </div>

                <div className="comp-tool-group">
                  <label className="comp-tool-label">
                    <FaPencilAlt className="comp-tool-icon" />
                    Pen Color
                  </label>
                  <div className="comp-color-picker">
                    <button
                      type="button"
                      className={`comp-color-btn ${penColor === '#000000' ? 'active' : ''}`}
                      style={{ backgroundColor: '#000000' }}
                      onClick={() => setPenColor('#000000')}
                    />
                    <button
                      type="button"
                      className={`comp-color-btn ${penColor === '#dc2626' ? 'active' : ''}`}
                      style={{ backgroundColor: '#dc2626' }}
                      onClick={() => setPenColor('#dc2626')}
                    />
                    <button
                      type="button"
                      className={`comp-color-btn ${penColor === '#2563eb' ? 'active' : ''}`}
                      style={{ backgroundColor: '#2563eb' }}
                      onClick={() => setPenColor('#2563eb')}
                    />
                    <button
                      type="button"
                      className={`comp-color-btn ${penColor === '#16a34a' ? 'active' : ''}`}
                      style={{ backgroundColor: '#16a34a' }}
                      onClick={() => setPenColor('#16a34a')}
                    />
                  </div>
                </div>
              </div>

              {/* Canvas */}
              <div className="comp-canvas-container">
                <div className="comp-canvas-header">
                  <FaPencilAlt className="comp-canvas-icon" />
                  <span>Draw your signature below</span>
                </div>
                <canvas
                  ref={canvasRef}
                  className="comp-signature-canvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startDrawing(e.touches[0]);
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    draw(e.touches[0]);
                  }}
                  onTouchEnd={stopDrawing}
                />
              </div>

              {/* Canvas Controls */}
              <div className="comp-canvas-controls">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="comp-canvas-btn comp-clear-btn"
                >
                  <FaEraser className="comp-btn-icon" />
                  Clear Canvas
                </button>
                <button
                  type="button"
                  onClick={saveCanvasAsImage}
                  className="comp-canvas-btn comp-save-btn"
                >
                  <FaSave className="comp-btn-icon" />
                  Save Signature
                </button>
              </div>

              <p className="comp-canvas-hint">
                <FaPencilAlt className="comp-hint-icon" />
                Draw your signature in the area above, then click "Save Signature"
              </p>
            </div>
          )}
        </div>

        {/* Rest of your form sections remain exactly the same */}
        {/* Basic Information */}
        <div className="comp-form-section">
          <h3 className="comp-section-title">
            <FaBuilding className="comp-section-icon" />
            Basic Information
          </h3>
          <div className="comp-form-grid">
            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaBuilding className="comp-input-icon" />
                Company Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter company name"
                value={company.name}
                onChange={handleChange}
                className="comp-form-input"
                required
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaFileAlt className="comp-input-icon" />
                Company Type
              </label>
              <input
                type="text"
                name="type"
                placeholder="e.g., Private Limited, LLC"
                value={company.type}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaIdCard className="comp-input-icon" />
                Registration Number
              </label>
              <input
                type="text"
                name="registrationNumber"
                placeholder="Registration number"
                value={company.registrationNumber}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group comp-full-width">
              <label className="comp-form-label">
                <FaFileAlt className="comp-input-icon" />
                About Company
              </label>
              <textarea
                name="about"
                placeholder="Brief description of your company"
                value={company.about}
                onChange={handleChange}
                className="comp-form-textarea"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="comp-form-section">
          <h3 className="comp-section-title">
            <FaBullseye className="comp-section-icon" />
            Mission & Vision
          </h3>
          <div className="comp-form-grid">
            <div className="comp-form-group comp-full-width">
              <label className="comp-form-label">
                <FaBullseye className="comp-input-icon" />
                Mission Statement
              </label>
              <textarea
                name="mission"
                placeholder="Company mission statement"
                value={company.mission}
                onChange={handleChange}
                className="comp-form-textarea"
                rows={3}
              />
            </div>

            <div className="comp-form-group comp-full-width">
              <label className="comp-form-label">
                <FaEye className="comp-input-icon" />
                Vision Statement
              </label>
              <textarea
                name="vision"
                placeholder="Company vision statement"
                value={company.vision}
                onChange={handleChange}
                className="comp-form-textarea"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="comp-form-section">
          <h3 className="comp-section-title">
            <FaMapMarkerAlt className="comp-section-icon" />
            Address Information
          </h3>
          <div className="comp-form-grid">
            <div className="comp-form-group comp-full-width">
              <label className="comp-form-label">
                <FaMapMarkerAlt className="comp-input-icon" />
                Street Address
              </label>
              <input
                type="text"
                name="street"
                placeholder="Street address"
                value={company.street}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>
            <div className="comp-form-group comp-full-width">
              <label className="comp-form-label">
                <FaClock className="comp-input-icon" />
                Working Hours
              </label>
              <input
                type="text"
                name="workingHours"
                placeholder="e.g., 9 AM - 10 PM Monday to Saturday"
                value={company.workingHours || ""}
                onChange={handleChange}
                className="comp-form-input"
              />
              <small>Specify working hours in plain text.</small>
            </div>

            <div className="comp-form-group comp-full-width">
              <label className="comp-form-label">
                <FaMapMarkerAlt className="comp-input-icon" />
                Google Maps Embed URL
              </label>
              <textarea
                name="mapLink"
                placeholder='Paste iframe code or URL here'
                value={company.mapLink || ""}
                onChange={(e) => setCompany({
                  ...company,
                  mapLink: stripIframe(e.target.value)
                })}
                className="comp-form-textarea"
                rows={3}
              />
              <small>Only the URL will be stored. Example: https://www.google.com/maps/embed?... </small>
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">City</label>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={company.city}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">District</label>
              <input
                type="text"
                name="district"
                placeholder="District"
                value={company.district}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">State</label>
              <input
                type="text"
                name="state"
                placeholder="State"
                value={company.state}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                placeholder="Postal code"
                value={company.postalCode}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">Country</label>
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={company.country}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="comp-form-section">
          <h3 className="comp-section-title">
            <FaPhone className="comp-section-icon" />
            Contact Details
          </h3>
          <div className="comp-form-grid">
            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaEnvelope className="comp-input-icon" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="company@email.com"
                value={company.email}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaPhone className="comp-input-icon" />
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                placeholder="Phone number"
                value={company.phone}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaWhatsapp className="comp-input-icon" />
                WhatsApp Number
              </label>
              <input
                type="text"
                name="whatsapp"
                placeholder="WhatsApp number"
                value={company.whatsapp}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaGlobe className="comp-input-icon" />
                Website
              </label>
              <input
                type="text"
                name="website"
                placeholder="https://company.com"
                value={company.website}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="comp-form-section">
          <h3 className="comp-section-title">
            <FaGlobe className="comp-section-icon" />
            Social Media
          </h3>
          <div className="comp-form-grid">
            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaFacebook className="comp-input-icon" />
                Facebook
              </label>
              <input
                type="text"
                name="facebook"
                placeholder="Facebook URL"
                value={company.facebook}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaTwitter className="comp-input-icon" />
                Twitter
              </label>
              <input
                type="text"
                name="twitter"
                placeholder="Twitter URL"
                value={company.twitter}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaInstagram className="comp-input-icon" />
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                placeholder="Instagram URL"
                value={company.instagram}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="comp-form-section">
          <h3 className="comp-section-title">
            <FaUniversity className="comp-section-icon" />
            Financial Information
          </h3>
          <div className="comp-form-grid">
            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaUniversity className="comp-input-icon" />
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                placeholder="Bank name"
                value={company.bankName}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaMoneyBillWave className="comp-input-icon" />
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                placeholder="Account number"
                value={company.accountNumber}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            {/* <div className="comp-form-group">
              <label className="comp-form-label">IFSC Code</label>
              <input
                type="text"
                name="ifsc"
                placeholder="IFSC code"
                value={company.ifsc}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div> */}

            <div className="comp-form-group">
              <label className="comp-form-label">SWIFT Code</label>
              <input
                type="text"
                name="swift"
                placeholder="SWIFT code"
                value={company.swift}
                onChange={handleChange}
                className="comp-form-input"
              />
            </div>

            <div className="comp-form-group">
              <label className="comp-form-label">
                <FaIdCard className="comp-input-icon" />
                VAT Number
              </label>
              <input
                type="text"
                name="vatNumber"
                placeholder="Tax identification number"
                value={company.vatNumber}
                onChange={handleChange}
                className="comp-form-input"
                required
              />
              <small style={{ color: "#666", fontSize: "12px", marginLeft: "10px", marginTop: "10px" }}>
                Required if VAT registered (UK)
              </small>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="comp-form-actions">
          <button
            type="submit"
            className="comp-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="comp-loading-spinner"></div>
            ) : (
              <>
                <FaSave className="comp-btn-icon" />
                {isEditing ? 'Update' : 'Save'} Company Details
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="comp-clear-btn"
          >
            <FaTrash className="comp-btn-icon" />
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyDetails;
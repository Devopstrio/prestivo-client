import React, { useState } from "react";

const API_BASE_URL = "http://localhost:5000";

export default function VatValidator() {
  const [countryCode, setCountryCode] = useState("GB");
  const [vatNumber, setVatNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // ✅ Open HMRC official site
  const openHMRC = () => {
    window.open(
      "https://www.tax.service.gov.uk/check-vat-number/enter-vat-details",
      "_blank"
    );
  };

  // ✅ Main validation
  const validateVAT = async () => {
    if (!countryCode || !vatNumber) {
      alert("Enter all fields");
      return;
    }

    const fullVAT = `${countryCode}${vatNumber}`;

    // 🇬🇧 UK VAT (NO API)
    if (countryCode === "GB") {
      const isValidFormat = /^GB\d{9}$/.test(fullVAT);

      setResult({
        vatNumber: fullVAT,
        valid: isValidFormat,
        isUK: true,
        fallback: false,
        message: isValidFormat
          ? "VAT format looks valid. Please verify via HMRC."
          : "Invalid UK VAT format",
      });

      return;
    }

    // 🌍 Other Countries (API)
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch(
        `${API_BASE_URL}/api/vat/validate?countryCode=${countryCode}&vatNumber=${vatNumber}`
      );

      const data = await res.json();

      setResult({
        ...data,
        isUK: false,
      });
    } catch (err) {
      console.error(err);
      setResult({
        fallback: true,
        message: "API Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>VAT Validator</h2>

      {/* Country Code */}
      <input
        placeholder="Country Code (GB, DE, IE...)"
        value={countryCode}
        onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
        style={styles.input}
      />

      {/* VAT Number */}
      <input
        placeholder="VAT Number"
        value={vatNumber}
        onChange={(e) => setVatNumber(e.target.value)}
        style={styles.input}
      />

      {/* Button */}
      <button
        onClick={validateVAT}
        style={styles.button}
        disabled={loading}
      >
        {loading ? "Checking..." : "Validate VAT"}
      </button>

      {/* Result */}
      {result && (
        <div
          style={{
            ...styles.result,
            background: result.fallback
              ? "#fff3cd"
              : result.valid
              ? "#d1fae5"
              : "#fee2e2",
          }}
        >
          {/* ⚠️ API ERROR */}
          {result.fallback && (
            <>
              ⚠️ Service Unavailable <br />
              <span style={{ fontSize: 13 }}>{result.message}</span>
            </>
          )}

          {/* 🇬🇧 UK VAT */}
          {result.isUK && !result.fallback && (
            <>
              {result.valid ? (
                <>
                  ✅ <strong>Valid Format (UK VAT)</strong> <br /><br />

                  <strong>VAT:</strong> {result.vatNumber} <br />

                  <p style={{ color: "#856404", marginTop: 10 }}>
                    ⚠️ UK VAT cannot be auto-verified. Please verify via HMRC.
                  </p>

                  <button
                    onClick={openHMRC}
                    style={styles.verifyBtn}
                  >
                    Verify on HMRC
                  </button>
                </>
              ) : (
                <>
                  ❌ <strong>Invalid UK VAT Format</strong>
                </>
              )}
            </>
          )}

          {/* 🌍 OTHER COUNTRIES */}
          {!result.isUK && !result.fallback && result.valid && (
            <>
              ✅ <strong>Valid VAT</strong> <br /><br />

              <strong>VAT:</strong> {result.vatNumber} <br />
              <strong>Country:</strong> {result.countryName} ({result.countryCode}) <br />

              <hr style={{ margin: "10px 0" }} />

              {result.hasCompanyData ? (
                <>
                  <strong>Company:</strong> {result.name} <br />
                  <strong>Address:</strong> {result.address}
                </>
              ) : (
                <span style={{ color: "#856404" }}>
                  ⚠️ Company details not available
                </span>
              )}
            </>
          )}

          {/* ❌ INVALID */}
          {!result.isUK && !result.fallback && !result.valid && (
            <>
              ❌ <strong>Invalid VAT</strong> <br />
              <span style={{ fontSize: 13 }}>
                Check VAT number or try again later
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 420,
    margin: "50px auto",
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 12,
    fontFamily: "Arial",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: 12,
    marginTop: 15,
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "600",
  },
  verifyBtn: {
    marginTop: 10,
    padding: "10px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    width: "100%",
    fontWeight: "600",
  },
  result: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.6,
  },
};
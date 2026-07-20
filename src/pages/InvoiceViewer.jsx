import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaFileInvoice,
  FaDownload,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
  FaFilePdf,
  FaEye
} from "react-icons/fa";
import API_BASE_URL from "../config";
import "../styles/InvoiceViewer.css";
import "../styles/LoadingAnimation.css";
const InvoiceViewerComponent = () => {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [pdfDocumentUrl, setPdfDocumentUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const fetchInvoiceDocument = async () => {
    try {
      if (!orderIdInput.trim()) {
        setErrorMessage("Please enter a valid Order ID");
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      setPdfDocumentUrl(null);

      // Fetch the invoice buffer from backend API
      const response = await axios.get(`${API_BASE_URL}/api/invoices/${orderIdInput}`, {
        responseType: "arraybuffer",
      });

      if (response.data) {
        // Convert ArrayBuffer to Blob
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfDocumentUrl(url);
      } else {
        setErrorMessage("No invoice found for this Order ID");
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setErrorMessage("Failed to fetch invoice. Please check the Order ID.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchInvoiceDocument();
    }
  };

  const resetViewerState = () => {
    setOrderIdInput("");
    setPdfDocumentUrl(null);
    setErrorMessage("");
  };

  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading </h3>
          <p>Please wait while page is loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-viewer-wrapper">
      {/* Header Section */}
      <div className="invoice-viewer-top-header">
        <div className="invoice-header-container">
          <div className="invoice-header-image">
            <FaFileInvoice className="header-primary-icon" />
          </div>
          <div className="invoice-header-content">
            <h1 className="invoice-primary-title">Invoice Viewer</h1>
            <p className="invoice-description-text">
              Enter the Order ID to view or download the invoice
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="invoice-search-container">
        <div className="search-input-area">
          <div className="search-input-group">
            <FaSearch className="search-input-symbol" />
            <input
              type="text"
              placeholder="Enter Order ID (e.g., ORD123456)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              onKeyPress={handleInputKeyPress}
              className="invoice-search-field"
              disabled={isLoading}
            />
            {orderIdInput && (
              <button
                className="search-clear-button"
                onClick={resetViewerState}
                type="button"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={fetchInvoiceDocument}
            disabled={isLoading || !orderIdInput.trim()}
            className="invoice-fetch-button"
          >
            {isLoading ? (
              <>
                <FaSpinner className="button-loading-indicator" />
                Loading...
              </>
            ) : (
              <>
                <FaEye className="button-action-symbol" />
                View Invoice
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="invoice-error-container">
            <FaExclamationTriangle className="error-indicator-icon" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* PDF Preview Section */}
      {pdfDocumentUrl && (
        <div className="invoice-preview-area">
          <div className="preview-top-header">
            <div className="preview-title-section">
              <FaFilePdf className="preview-title-symbol" />
              <h3>Invoice Preview - Order #{orderIdInput}</h3>
            </div>
            <a
              href={pdfDocumentUrl}
              download={`Invoice_${orderIdInput}.pdf`}
              className="invoice-download-button"
            >
              <FaDownload className="download-button-icon" />
              Download PDF
            </a>
          </div>

          <div className="pdf-preview-wrapper">
            <iframe
              src={pdfDocumentUrl}
              title={`Invoice for Order ${orderIdInput}`}
              className="pdf-preview-iframe"
              loading="lazy"
            />
            <div className="pdf-preview-loading">
              <div className="preview-loading-content">
                <FaFilePdf className="loading-indicator-icon" />
                <p>PDF Preview Loading...</p>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="invoice-actions-container">
            <button
              className="secondary-action-button"
              onClick={resetViewerState}
            >
              Search Another Invoice
            </button>
            <a
              href={pdfDocumentUrl}
              download={`Invoice_${orderIdInput}.pdf`}
              className="primary-action-button"
            >
              <FaDownload className="action-button-icon" />
              Save Invoice
            </a>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!pdfDocumentUrl && !isLoading && !errorMessage && (
        <div className="invoice-empty-state">
          <div className="empty-state-image">
            <FaFileInvoice />
          </div>
          <h3>Ready to View the Invoice</h3>
          <p>Enter an Order ID above to retrieve and view the invoice</p>
          <div className="empty-state-features-list">
            <div className="feature-list-item">
              <FaEye className="feature-item-icon" />
              <span>View invoices instantly</span>
            </div>
            <div className="feature-list-item">
              <FaDownload className="feature-item-icon" />
              <span>Download for your records</span>
            </div>
            <div className="feature-list-item">
              <FaFilePdf className="feature-item-icon" />
              <span>PDF format supported</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceViewerComponent;
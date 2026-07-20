import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  FaBuilding,
  FaUser,
  FaBox,
  FaCheck,
  FaTruck,
  FaHome,
  FaArrowRight,
  FaTimes,
  FaSignature
} from 'react-icons/fa';
import API_BASE_URL from "../config";
import '../styles/InvoiceGenerator.css';

const InvoiceGenerator = ({ order, user, onClose, isOpen }) => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Fetch company details and user details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);

        // Fetch company details
        const companyResponse = await axios.get(`${API_BASE_URL}/api/company`);
        setCompanyDetails(companyResponse.data.data);

        // Fetch user details to get complete address
        if (user && user.id) {
          try {
            const userResponse = await axios.get(
              `${API_BASE_URL}/api/users/${user.id}`,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setUserDetails(userResponse.data);
          } catch (userError) {
            console.error('Error fetching user details:', userError);
            // Use order userDetails as fallback
            setUserDetails(order.userDetails || {});
          }
        } else {
          setUserDetails(order.userDetails || {});
        }

      } catch (error) {
        console.error('Error fetching details:', error);
        // Set default company details as fallback
        setCompanyDetails({
          name: 'Your Company',
          street: '123 Business Street',
          city: 'Business City',
          district: 'Central District',
          state: 'State',
          postalCode: '100001',
          country: 'Country',
          email: 'info@company.com',
          phone: '+1 234 567 8900',
          website: 'www.company.com',
          taxNumber: 'TAX123456789',
          registrationNumber: 'REG123456789'
        });
        setUserDetails(order.userDetails || {});
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchDetails();
    }
  }, [isOpen, user, order]);

  // Format currency
  const formatCurrency = (amount, currency = 'GBP') => {
    const symbols = {
      INR: '₹', USD: '$', GBP: '£', EUR: '€', AUD: 'A$', CAD: 'C$', JPY: '¥'
    };
    const symbol = symbols[currency] || currency;
    return `${symbol}${(amount || 0).toFixed(2)}`;
  };

  // Format address
  const formatAddress = (userData) => {
    if (!userData) return 'Address not available';

    const addressParts = [
      userData.houseNumber,
      userData.street,
      userData.region,
      userData.district,
      userData.state,
      userData.pincode,
      userData.country
    ].filter(Boolean);

    return addressParts.length > 0 ? addressParts.join(', ') : 'Address not provided';
  };

  // Tax configuration per currency
  const TAX_CONFIG = {
    INR: 18,
    USD: 10,
    GBP: 15,
    EUR: 12,
    DEFAULT: 0
  };


  // Calculate order totals
  const calculateOrderTotals = () => {
    let totalPrice = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    // Calculate total price and discounts
    order.products?.forEach(product => {
      const unitPrice = product.originalPrice || 0;
      const discountedPrice = product.discountedPrice || unitPrice;
      const quantity = product.qty || 1;

      const productTotal = discountedPrice * quantity;
      const productDiscount = (unitPrice - discountedPrice) * quantity;

      totalPrice += productTotal;
      totalDiscount += productDiscount;
      totalItems += quantity;
    });

    // Determine tax rate based on currency
    const currency = order.currency || 'DEFAULT';
    const taxRate = TAX_CONFIG[currency] ?? TAX_CONFIG.DEFAULT;

    // Step 1: Calculate tax amount based on total price
    const taxAmount = totalPrice * (taxRate / 100);

    // Step 2: Calculate preTotal (total - tax)
    const preTotal = totalPrice - taxAmount;

    // Step 3: Calculate subTotal (preTotal + tax again)
    const subTotal = preTotal + taxAmount;

    // Step 4: Grand total is subtotal (final amount)
    const grandTotal = subTotal;

    const marketPrice = totalPrice - (totalPrice * (taxRate / 100));

    return {
      totalPrice,
      totalDiscount,
      preTotal,
      subTotal,
      taxAmount,
      grandTotal,
      taxRate,
      totalItems,
      marketPrice
    };
  };



  // Generate PDF (multi-page support with black and white)
  const generatePDF = async () => {
    if (!order || !companyDetails) return;

    try {
      setGenerating(true);

      const invoiceElement = document.getElementById('invoice-preview');
      if (!invoiceElement) throw new Error('Invoice element not found');

      // Apply black and white styles for PDF
      invoiceElement.classList.add('pdf-export', 'bw-invoice');

      // Add slight delay for large DOM rendering
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Capture the invoice as a high-resolution canvas
      const canvas = await html2canvas(invoiceElement, {
        scale: 2, // Reduced for better performance
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Ensure black and white styling in cloned document
          const clonedInvoice = clonedDoc.getElementById('invoice-preview');
          if (clonedInvoice) {
            clonedInvoice.classList.add('pdf-export', 'bw-invoice');
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller file size
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 210; // A4 width
      const pageHeight = 297; // A4 height
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add remaining pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Remove PDF export classes
      invoiceElement.classList.remove('pdf-export', 'bw-invoice');

      // Generate professional filename
      const invoiceNumber = `${order._id}`.slice(-8);
      const dateString = new Date().toISOString().split('T')[0];
      pdf.save(`invoice-${invoiceNumber}-${dateString}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate invoice. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Render product specifications in a clean format
  // 🔹 Dynamically render all available product specifications
  const renderProductSpecifications = (product) => {
    if (!product) return null;

    // ✅ Allowed fields based on your product schema
    const allowedKeys = [
      "selectedSize", "sizeInches", "size", "color", "material", "fit",
      "brand", "ram", "storage", "type", "processor", "displaySize",
      "battery", "camera", "screenSize", "inchs", "skinType", "hairType",
      "fragranceType", "language", "author", "genre", "format", "packSize",
      "organic", "model", "power", "capacity", "weight", "warranty"
    ];

    // ✅ Collect valid entries
    const specs = Object.entries(product)
      .filter(([key, value]) => {
        // 🔥 CORE FIX — hide "size" if selectedSize exists
        if (key === "size" && product.selectedSize) return false;
        if (!allowedKeys.includes(key)) return false;
        if (value === null || value === undefined) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        return true;
      })
      .map(([key, value]) => {
        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/_/g, " ")
          .replace(/^./, (str) => str.toUpperCase());

        const formattedValue = Array.isArray(value) ? value.join(", ") : String(value);

        return { label: formattedKey, value: formattedValue };
      });

    if (specs.length === 0) return null;

    return (
      <div className="product-specs-container">
        <div className="specs-grid-layout">
          {specs.map((spec, index) => (
            <div key={index} className="spec-item-wrapper">
              <span className="spec-name-text">{spec.label}:</span>
              <span className="spec-value-text">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="invoice-modal-overlay">
        <div className="invoice-modal-loading">
          <div className="loading-spinner"></div>
          <p>Loading invoice details...</p>
        </div>
      </div>
    );
  }

  const totals = calculateOrderTotals();
  const invoiceNumber = `${order._id.slice(-8)}`;
  const currentDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const customerName = order.customerName || userDetails?.name || user?.name;
  const customerEmail = order.customerEmail || userDetails?.email || user?.email;
  const customerPhone = order.customerPhone || userDetails?.mobile || userDetails?.phone;

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-container">
        {/* Modal Header */}
        <div className="invoice-modal-header">
          <h2>Download your Invoice</h2>
          <div className="invoice-modal-actions">
            <button
              className="btn-primary"
              onClick={generatePDF}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="btn-spinner"></span>
                  Downloading PDF...
                </>
              ) : (
                'Download PDF'
              )}
            </button>
            <button className='closeform' onClick={onClose}>
              <FaTimes style={{ color: "white" }} />
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="invoice-preview-container">
          <div id="invoice-preview" className="invoice-document bw-invoice">
            {/* Invoice Header */}
            <div className="invoice-header-section">
              <div className="invoice-company-info">
                {companyDetails?.logoUrl && (
                  <img
                    src={companyDetails.logoUrl}
                    alt={companyDetails.name}
                    className="company-logo-img"
                  />
                )}
                <div className="company-details-wrapper">
                  <h1 className="company-name-text">{companyDetails?.name || 'Company Name'}</h1>
                  <div className="company-info-grid">
                    <div className="company-address-info">
                      <p>{companyDetails?.street}</p>
                      <p>
                        {[
                          companyDetails?.city,
                          companyDetails?.district,
                          companyDetails?.state,
                          companyDetails?.postalCode
                        ].filter(Boolean).join(', ')}
                      </p>
                      <p>{companyDetails?.country}</p>
                    </div>
                    <div className="company-contact-info">
                      {companyDetails?.email && (
                        <p><strong>Email:</strong> {companyDetails.email}</p>
                      )}
                      {companyDetails?.phone && (
                        <p><strong>Phone:</strong> {companyDetails.phone}</p>
                      )}
                      {companyDetails?.website && (
                        <p><strong>Website:</strong> {companyDetails.website}</p>
                      )}
                      {companyDetails?.taxNumber && (
                        <p><strong>Tax ID:</strong> {companyDetails.taxNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="invoice-meta-info">
                <div className="invoice-title-wrapper">
                  <h1 className="invoice-title-text">INVOICE</h1>
                  <div className="invoice-number-badge">Invoice Number : {invoiceNumber}</div>
                </div>
                <div className="invoice-dates-container">
                  <div className="date-info-row">
                    <span className="date-label-text">Invoice Date:</span>
                    <span className="date-value-text">{currentDate}</span>
                  </div>
                  <div className="date-info-row">
                    <span className="date-label-text">Order Date:</span>
                    <span className="date-value-text">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {order.deliveryDate && (
                    <div className="date-info-row">
                      <span className="date-label-text">Delivery Date:</span>
                      <span className="date-value-text">
                        {new Date(order.deliveryDate).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To / Bill From */}
            <div className="invoice-parties-section">
              <div className="bill-from-container">
                <div className="section-header-wrapper">
                  <div className="section-icon-wrapper">
                    <FaBuilding />
                  </div>
                  <h3>Seller Information</h3>
                </div>
                <div className="party-details-content">
                  <div className="party-name-text">{companyDetails?.name}</div>
                  <div className="party-address-content">
                    <p>{companyDetails?.street}</p>
                    <p>
                      {[
                        companyDetails?.city,
                        companyDetails?.district,
                        companyDetails?.state,
                        companyDetails?.postalCode
                      ].filter(Boolean).join(', ')}
                    </p>
                    <p>{companyDetails?.country}</p>
                  </div>
                  <div className="party-contact-content">
                    {companyDetails?.email && <p><strong>Email:</strong> {companyDetails.email}</p>}
                    {companyDetails?.phone && <p><strong>Phone:</strong> {companyDetails.phone}</p>}
                    {companyDetails?.taxNumber && <p><strong>Tax ID:</strong> {companyDetails.taxNumber}</p>}
                  </div>
                </div>
              </div>

              <div className="bill-to-container">
                <div className="section-header-wrapper">
                  <div className="section-icon-wrapper">
                    <FaUser />
                  </div>
                  <h3>Bill To</h3>
                </div>
                <div className="party-details-content">
                  <div className="party-name-text">{customerName}</div>
                  <div className="party-address-content">
                    <p>{formatAddress(userDetails)}</p>
                  </div>
                  <div className="party-contact-content">
                    {customerEmail && <p><strong>Email:</strong> {customerEmail}</p>}
                    {customerPhone && <p><strong>Phone:</strong> {customerPhone}</p>}
                    <p><strong>Order ID:</strong> {order._id}</p>
                  </div>
                </div>
              </div>
            </div><br />

            {/* Order Summary */}
            <div className="order-summary-section">
              <div className="summary-grid-layout">
                <div className="summary-item-wrapper">
                  <span className="summary-label-text">Total Items</span>
                  <span className="summary-value-text">{totals.totalItems}</span>
                </div>
                <div className="summary-item-wrapper">
                  <span className="summary-label-text">Payment Method</span>
                  <span className="summary-value-text">{order.paymentMethod}</span>
                </div>
                <div className="summary-item-wrapper">
                  <span className="summary-label-text">Payment Status</span>
                  <span className={`summary-value-text status-${order.paymentStatus?.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="summary-item-wrapper">
                  <span className="summary-label-text">Currency</span>
                  <span className="summary-value-text">{order.currency}</span>
                </div>
              </div>
            </div><br />

            {/* Payment & Shipping Information */}
            <div className="invoice-additional-info-section">
              <div className="info-grid-layout">
                <div className="info-section-wrapper">
                  <h4>Shipping Information</h4>
                  <div className="info-content-wrapper">
                    <p><strong>Delivery Status:</strong>
                      <span className={`status-indicator ${order.deliveryCompleted ? 'status-completed' : 'status-processing'}`}>
                        {order.deliveryCompleted ? 'Delivered' : 'In Progress'}
                      </span>
                    </p>
                    {order.deliveryDate && (
                      <p><strong>Delivery Date:</strong> {new Date(order.deliveryDate).toLocaleDateString('en-GB')}</p>
                    )}
                    {order.deliveredDate && (
                      <p><strong>Delivered Date:</strong> {new Date(order.deliveredDate).toLocaleDateString('en-GB')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="invoice-products-section">
              <div className="section-header-wrapper">
                <div className="section-icon-wrapper">
                  <FaBox />
                </div>
                <h3>Order Items</h3>
              </div>
              <table className="products-data-table">
                <thead>
                  <tr>
                    <th className="col-product-details">Product Details</th>
                    <th className="col-quantity">Qty</th>
                    {/* <th className="col-unit-price" id="col-unit-price">Unit Price</th> */}
                    <th className="col-discount">Discount Amount</th>
                    <th className="col-total-amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products?.map((product, index) => {
                    const unitPrice = product.originalPrice || 0;
                    const discountedPrice = product.discountedPrice || unitPrice;
                    const quantity = product.qty || 1;
                    const discount = unitPrice - discountedPrice;
                    const productTotal = discountedPrice * quantity;
                    const totalDiscount = discount * quantity;

                    return (
                      <tr key={index} className="product-data-row">
                        <td className="col-product-details">
                          <div className="product-name-header"><strong>{product.name}</strong></div>

                          {/* Product ID */}
                          {product.productId && (
                            <div className="product-id-badge">
                              <strong>Product ID:</strong> {product.productId}
                            </div>
                          )}

                          {/* Category Information */}
                          <div className="product-categories-container">
                            <div className="category-info-item">
                              <span className="category-label-text"><strong>Category:</strong></span>
                              <span className="category-value-text">{product.category || "Uncategorized"}</span>
                            </div>
                            {product.subCategory && (
                              <div className="subcategory-info-item">
                                <span className="category-label-text"><strong>Subcategory:</strong></span>
                                <span className="category-value-text">{product.subCategory}</span>
                              </div>
                            )}
                            {product.subSubCategory && (
                              <div className="subsubcategory-info-item">
                                <span className="category-label-text"><strong>Sub-Subcategory:</strong></span>
                                <span className="category-value-text">{product.subSubCategory}</span>
                              </div>
                            )}
                          </div>

                          {/* Product Specifications */}
                          {renderProductSpecifications(product)}

                          {/* Pricing Information */}
                          <div className="product-pricing-details">
                            <div className="pricing-info-row">
                              <span className="price-label-text">Original Price:</span>
                              <span className="price-value-text">{formatCurrency(unitPrice, order.currency)}</span>
                            </div>
                            {discountedPrice !== unitPrice && (
                              <div className="pricing-info-row">
                                <span className="price-label-text">Discounted Price:</span>
                                <span className="price-value-text discounted-price">{formatCurrency(discountedPrice, order.currency)}</span>
                              </div>
                            )}
                            {product.discount > 0 && (
                              <div className="pricing-info-row">
                                <span className="price-label-text">Discount Applied:</span>
                                <span className="price-value-text discount-percentage">{product.discount}%</span>
                              </div>
                            )}
                          </div>

                          {/* Warehouse Information */}
                          {product.warehouseAllocations?.length > 0 && (
                            <div className="warehouse-info-container">
                              <div className="warehouse-label-text"><strong>Sold By:</strong></div>
                              <div className="warehouse-list-container">
                                {product.warehouseAllocations.map((allocation, i) => (
                                  <div key={i} className="warehouse-item-wrapper">
                                    <span className="warehouse-name-text">{allocation.name}</span>
                                    {allocation.quantity && (
                                      <span className="warehouse-quantity-text">(Qty: {allocation.quantity})</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </td>

                        <td className="col-quantity">
                          <span className="quantity-indicator">{quantity}</span>
                        </td>
                        {/* <td className="col-unit-price" style={{color:"black !important"}}>{formatCurrency(unitPrice, order.currency)}</td> */}
                        <td className="col-discount">
                          {totalDiscount > 0 ? (
                            <span className="discount-amount-text">- {formatCurrency(totalDiscount, order.currency)}</span>
                          ) : (
                            <span className="no-discount-text">-</span>
                          )}
                        </td>
                        <td className="col-total-amount">
                          <strong>{formatCurrency(productTotal, order.currency)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="invoice-totals-section">
              <div className="totals-wrapper">
                <table className="totals-summary-table">
                  <tbody>
                    <tr>
                      <td className="total-label-cell">Market Price:</td>
                      <td className="total-value-cell">{formatCurrency(totals.marketPrice, order.currency)}</td>
                    </tr>
                    {totals.taxRate > 0 && (
                      <tr>
                        <td className="total-label-cell">Tax ({totals.taxRate}%):</td>
                        <td className="total-value-cell">{formatCurrency(totals.taxAmount, order.currency)}</td>
                      </tr>
                    )}

                    <tr className="grand-total-row">
                      <td className="total-label-cell">Grand Total:</td>
                      <td className="total-value-cell">{formatCurrency(totals.grandTotal, order.currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Section */}
            <div className="invoice-signature-section">
              <div className="signature-container">
                <div className="signature-wrapper">
                  {companyDetails?.signatureUrl ? (
                    <>
                      <img
                        src={companyDetails.signatureUrl}
                        alt="Authorized Signature"
                        className="company-signature-img"
                      />
                      <div className="signature-line"></div>
                      <div className="signature-details">
                        <p className="signature-name">Authorized Signature</p>
                        <p className="signature-title">{companyDetails?.name}</p>
                        <p className="signature-date">Date: {currentDate}</p>
                      </div>
                    </>
                  ) : (
                    <div className="no-signature-placeholder">
                      <FaSignature className="signature-placeholder-icon" />
                      <p>No signature available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Timeline with Arrow Processing */}
            <div className="order-timeline-section">
              <h4>Order Timeline</h4>
              <div className="timeline-main-container">
                <div className="timeline-progress-tracker">
                  <div className={`timeline-step-item ${order.orderStatus?.placeOrder ? 'completed' : 'active'}`}>
                    <div className="timeline-step-icon">
                      {order.orderStatus?.placeOrder ? <FaCheck /> : <FaBox />}
                    </div>
                    <div className="timeline-step-content">
                      <div className="timeline-step-title">Order Placed</div>
                      <div className="timeline-step-date">
                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>

                  <div className="timeline-arrow-separator">
                    <FaArrowRight />
                  </div>

                  <div className={`timeline-step-item ${order.orderStatus?.shipping ? 'completed' : order.orderStatus?.placeOrder ? 'active' : ''}`}>
                    <div className="timeline-step-icon">
                      {order.orderStatus?.shipping ? <FaCheck /> : <FaTruck />}
                    </div>
                    <div className="timeline-step-content">
                      <div className="timeline-step-title">In Transit</div>
                      <div className="timeline-step-date">
                        {order.shippingCompleted ? new Date(order.updatedAt).toLocaleDateString('en-GB') : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className="timeline-arrow-separator">
                    <FaArrowRight />
                  </div>

                  <div className={`timeline-step-item ${order.orderStatus?.delivery ? 'completed' : order.orderStatus?.shipping ? 'active' : ''}`}>
                    <div className="timeline-step-icon">
                      {order.orderStatus?.delivery ? <FaCheck /> : <FaHome />}
                    </div>
                    <div className="timeline-step-content">
                      <div className="timeline-step-title">Delivered</div>
                      <div className="timeline-step-date">
                        {order.deliveryCompleted && order.deliveredDate
                          ? new Date(order.deliveredDate).toLocaleDateString('en-GB')
                          : 'Pending'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="invoice-footer-section">
              <div className="footer-content-wrapper">
                <div className="footer-notes-container">
                  <h4>Thank you for your order!</h4>
                  <p>We appreciate your trust in us.</p>
                </div>
                <div className="footer-contact-container">
                  <p>
                    {companyDetails?.email && <span>Email: {companyDetails.email} • </span>}
                    {companyDetails?.phone && <span>Phone: {companyDetails.phone} • </span>}
                    {companyDetails?.website && <span>Website: {companyDetails.website}</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
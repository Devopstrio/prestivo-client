// src/components/AnalysisTab.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { CurrencyContext } from "../context/CurrencyContext";
import { exportAnalysisToExcel } from "../templates/AnalysisTabExcel";
import { Bar } from "react-chartjs-2";
import "../styles/OrderAnalysis.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  FaFileExcel,
  FaChartBar,
  FaFilter,
  FaTimes,
  FaDownload,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaGlobe,
  FaCube,
  FaShoppingCart,
  FaChartLine,
  FaSpinner
} from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const currencySymbols = { GBP: "£", INR: "₹", USD: "$", EUR: "€", AUD: "A$", CAD: "C$", JPY: "¥" };

const AnalysisTab = () => {
  const { currency, rates, changeCurrency } = useContext(CurrencyContext);
  const [data, setData] = useState([]);
  const [leadTime, setLeadTime] = useState("");
  const [customLeadTime, setCustomLeadTime] = useState("");
  const [budget, setBudget] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrdersWithProducts = async () => {
      try {
        setIsLoading(true);
        const orderRes = await axios.get(`${API_BASE_URL}/api/orders/analysis/orders`);
        const orders = orderRes.data;

        const uniqueProductIds = [...new Set(orders.map(item => item.productId).filter(Boolean))];

        const productDetails = await Promise.all(
          uniqueProductIds.map(async (id) => {
            try {
              const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
              return res.data;  // valid product
            } catch (err) {
              console.warn("Product not found (skipping):", id);
              return null; // <-- IMPORTANT
            }
          })
        );

        const productMap = {};

        productDetails.forEach((prod) => {
          if (prod && prod._id) {
            productMap[prod._id] = prod.price;
          }
        });

        const enrichedOrders = orders.map(item => ({
          ...item,
          originalPrice: productMap[item.productId] || 0,
        }));

        setData(enrichedOrders);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdersWithProducts();
  }, []);

  const calculateDemand = () => {
    const selectedLead = Number(customLeadTime || leadTime);
    const today = new Date();

    const filtered = selectedLead
      ? data.filter(item => {
        const diffInDays = (today - new Date(item.orderDate)) / (1000 * 60 * 60 * 24);
        return diffInDays <= selectedLead;
      })
      : data;

    const productDemand = {};
    filtered.forEach(item => {
      const key = item.productId || item.productName;
      if (!productDemand[key]) {
        productDemand[key] = {
          productName: item.productName,
          productId: item.productId,
          totalQty: 0,
        };
      }
      productDemand[key].totalQty += Number(item.qty);
    });

    // ✅ Convert budget to GBP
    const budgetInGBP = budget && rates[currency] ? Number(budget) / rates[currency] : 0;

    return Object.values(productDemand).map(product => {
      const matchedOrder = data.find(item => item.productId === product.productId);
      const priceInGBP = matchedOrder ? matchedOrder.originalPrice : 0;
      const priceInUserCurrency = (priceInGBP * rates[currency]).toFixed(2);

      const demandPerDay = selectedLead ? (product.totalQty / selectedLead).toFixed(2) : "-";
      const rol = selectedLead ? product.totalQty.toFixed(0) : "-";

      let roq = "-";
      if (budgetInGBP > 0 && priceInGBP > 0) {
        roq = Math.floor(budgetInGBP / priceInGBP); // ✅ Budget / original price
      } else if (selectedLead) {
        roq = (demandPerDay * selectedLead).toFixed(0);
      }

      return {
        productName: product.productName,
        productId: product.productId,
        totalQty: product.totalQty,
        leadTimeApplied: selectedLead || "All",
        demandPerDay,
        rol,
        roq,
        originalPrice: `${currencySymbols[currency]}${priceInUserCurrency}`,
        priceInGBP: priceInGBP,
      };
    });
  };

  const demandData = calculateDemand();

  // Calculate chart statistics
  const calculateChartStatistics = () => {
    const validRolData = demandData.map(item => Number(item.rol) || 0).filter(val => val > 0);
    const validRoqData = demandData.map(item => Number(item.roq) || 0).filter(val => val > 0);

    const avgROL = validRolData.length > 0 ? validRolData.reduce((a, b) => a + b, 0) / validRolData.length : 0;
    const avgROQ = validRoqData.length > 0 ? validRoqData.reduce((a, b) => a + b, 0) / validRoqData.length : 0;
    const maxROL = validRolData.length > 0 ? Math.max(...validRolData) : 0;
    const maxROQ = validRoqData.length > 0 ? Math.max(...validRoqData) : 0;
    const minROL = validRolData.length > 0 ? Math.min(...validRolData) : 0;
    const minROQ = validRoqData.length > 0 ? Math.min(...validRoqData) : 0;

    return {
      avgROL: avgROL.toFixed(2),
      avgROQ: avgROQ.toFixed(2),
      maxROL,
      maxROQ,
      minROL,
      minROQ,
      totalProducts: demandData.length,
      productsWithROL: validRolData.length,
      productsWithROQ: validRoqData.length
    };
  };

  const chartStatistics = calculateChartStatistics();

  const chartData = {
    labels: demandData.map(item => item.productName),
    datasets: [
      {
        label: "ROL (Reorder Level)",
        data: demandData.map(item => Number(item.rol) || 0),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1
      },
      {
        label: "ROQ (Reorder Quantity)",
        data: demandData.map(item => Number(item.roq) || 0),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Product Demand Analysis - ROL vs ROQ'
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const productName = context.label;
            const product = demandData.find(item => item.productName === productName);

            if (label.includes('ROL') && product) {
              return `${label}: ${value} (Based on ${product.totalQty} units over ${product.leadTimeApplied} days)`;
            } else if (label.includes('ROQ') && product) {
              return `${label}: ${value} (Recommended order quantity)`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Products'
        }
      }
    }
  };

  const clearFilter = () => {
    setLeadTime("");
    setCustomLeadTime("");
    setBudget("");
  };

  // Excel Export Handler
  const handleExportToExcel = () => {
    const filters = {
      leadTime,
      customLeadTime,
      budget
    };

    exportAnalysisToExcel(demandData, filters, currency, chartStatistics, data, setIsExporting);
  };

  if (isLoading) {
    return (
      <div className="oa-loading-container">
        <div className="oa-loading-content">
          <FaSpinner className="oa-loading-spinner" />
          <h3>Analyzing Order Data</h3>
          <p>Loading order information and product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="oa-dashboard">
      {/* Header Section */}
      <div className="oa-header">
        <div className="oa-title-section">
          <FaChartBar className="oa-title-icon" />
          <div>
            <h1 className="oa-main-title">Order Analysis Dashboard</h1>
            <p className="oa-subtitle">Demand forecasting and inventory optimization</p>
          </div>
        </div>
        <div className="oa-header-actions">
          <button
            className={`oa-export-btn ${isExporting ? 'oa-exporting' : ''}`}
            onClick={handleExportToExcel}
            disabled={isExporting || demandData.length === 0}
          >
            {isExporting ? (
              <FaSpinner className="oa-export-spinner" />
            ) : (
              <FaFileExcel className="oa-excel-icon" />
            )}
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="oa-stats-grid">
        <div className="oa-stat-card oa-stat-primary">
          <div className="oa-stat-icon-wrapper">
            <FaCube className="oa-stat-icon" />
          </div>
          <div className="oa-stat-content">
            <h3>{demandData.length}</h3>
            <p>Products Analyzed</p>
          </div>
        </div>
        <div className="oa-stat-card oa-stat-warning">
          <div className="oa-stat-icon-wrapper">
            <FaShoppingCart className="oa-stat-icon" />
          </div>
          <div className="oa-stat-content">
            <h3>{data.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="oa-stat-card oa-stat-info">
          <div className="oa-stat-icon-wrapper">
            <FaChartLine className="oa-stat-icon" />
          </div>
          <div className="oa-stat-content">
            <h3>{leadTime || customLeadTime || 'All'}</h3>
            <p>Lead Time (Days)</p>
          </div>
        </div>
        <div className="oa-stat-card oa-stat-success">
          <div className="oa-stat-icon-wrapper">
            <FaMoneyBillWave className="oa-stat-icon" />
          </div>
          <div className="oa-stat-content">
            <h3>{budget ? currencySymbols[currency] + budget : '0'}</h3>
            <p>Budget Allocated</p>
          </div>
        </div>
      </div>

      {/* Filters Section with Improved Structure */}
      <div className="oa-filters-section">
        <div className="oa-filters-header">
          <FaFilter className="oa-filter-icon" />
          <span>Analysis Parameters</span>
        </div>
        <div className="oa-filters-content">
          {/* Lead Time - Full Width */}
          <div className="oa-filter-group oa-full-width">
            <label className="oa-filter-label">
              <FaCalendarAlt className="oa-filter-input-icon" />
              Lead Time Analysis
            </label>
            <div className="oa-filter-inputs">
              <select
                value={leadTime}
                onChange={e => { setLeadTime(e.target.value); setCustomLeadTime(""); }}
                className="oa-select"
              >
                <option value="">-- All Time --</option>
                <option value="5">5 Days</option>
                <option value="10">10 Days</option>
                <option value="15">15 Days</option>
                <option value="20">20 Days</option>
                <option value="25">25 Days</option>
                <option value="30">30 Days</option>
              </select>
              <input
                type="number"
                placeholder="Custom Days"
                value={customLeadTime}
                onChange={e => setCustomLeadTime(e.target.value)}
                className="oa-input"
              />
            </div>
          </div>

          {/* Other filters - Equal Width */}
          <div className="oa-filter-group">
            <label className="oa-filter-label">
              <FaGlobe className="oa-filter-input-icon" />
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              className="oa-select"
            >
              {Object.keys(currencySymbols).map((cur, i) => (
                <option key={i} value={cur}>{cur} ({currencySymbols[cur]})</option>
              ))}
            </select>
          </div>

          <div className="oa-filter-group">
            <label className="oa-filter-label">
              <FaMoneyBillWave className="oa-filter-input-icon" />
              Budget Planning
            </label>
            <input
              type="number"
              placeholder={`Enter Budget (${currency})`}
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="oa-input"
            />
          </div>

          <button onClick={clearFilter} className="oa-clear-btn">
            <FaTimes className="oa-clear-icon" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="oa-content">
        {demandData.length === 0 ? (
          <div className="oa-empty-state">
            <FaChartBar className="oa-empty-icon" />
            <h3>No Analysis Data Available</h3>
            <p>No order data found for the selected criteria. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            {/* Data Table */}
            <div className="oa-table-container">
              <div className="oa-table-header">
                <h3>Demand Analysis Results</h3>
                <div className="oa-table-actions">
                  <span className="oa-table-count">{demandData.length} products</span>
                  <button
                    className="oa-export-mini-btn"
                    onClick={handleExportToExcel}
                    disabled={isExporting}
                  >
                    <FaDownload className="oa-download-icon" />
                    Export
                  </button>
                </div>
              </div>

              <div className="oa-table-wrapper">
                <table className="oa-analysis-table">
                  <thead>
                    <tr>
                      <th className="oa-col-product">Product Name</th>
                      <th className="oa-col-qty">Total Qty</th>
                      <th className="oa-col-leadtime">Lead Time</th>
                      <th className="oa-col-demand">Demand / Day</th>
                      <th className="oa-col-rol">ROL</th>
                      <th className="oa-col-roq">ROQ</th>
                      <th className="oa-col-price">Price ({currency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandData.map((item, index) => (
                      <tr key={index} className="oa-table-row">
                        <td className="oa-product-cell">
                          <FaCube className="oa-product-icon" />
                          <span className="oa-product-name">{item.productName}</span>
                        </td>
                        <td className="oa-qty-cell">{item.totalQty}</td>
                        <td className="oa-leadtime-cell">{item.leadTimeApplied}</td>
                        <td className="oa-demand-cell">{item.demandPerDay}</td>
                        <td className="oa-rol-cell">
                          <span className="oa-rol-badge">{item.rol}</span>
                        </td>
                        <td className="oa-roq-cell">
                          <span className="oa-roq-badge">{item.roq}</span>
                        </td>
                        <td className="oa-price-cell">{item.originalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart Section */}
            <div className="oa-chart-section">
              <div className="oa-chart-header">
                <FaChartBar className="oa-chart-icon" />
                <h3>ROL vs ROQ Analysis</h3>
                <div className="oa-chart-stats">
                  <small>
                    Avg ROL: {chartStatistics.avgROL} | Avg ROQ: {chartStatistics.avgROQ}
                  </small>
                </div>
              </div>
              <div className="oa-chart-container">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysisTab;
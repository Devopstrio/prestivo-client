import React from 'react';
import { toast } from "react-toastify";
const generateExcelTemplate = (demandData, filters, currency, chartStatistics, data) => {
  const {
    leadTime,
    customLeadTime,
    budget
  } = filters;

  let tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <title>Order Analysis Report</title>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Order Analysis</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th { background-color: #1e40af; color: white; font-weight: bold; padding: 12px; border: 1px solid #ddd; text-align: center; }
        td { padding: 10px; border: 1px solid #ddd; text-align: center; }
        .header { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 18px; font-weight: bold; }
        .summary { background-color: #f1f5f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .chart-summary { background-color: #e8f4fd; padding: 15px; margin: 10px 0; border-left: 4px solid #1e40af; }
        .positive { color: #10b981; font-weight: bold; }
        .negative { color: #ef4444; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        Order Analysis Report - ${new Date().toLocaleDateString()}
      </div>
      <div class="summary">
        <strong>Filters Applied:</strong><br/>
        Lead Time: ${leadTime || customLeadTime || 'All'} days | 
        Currency: ${currency} | 
        Budget: ${budget ? budget + ' ' + currency : 'Not set'}
      </div>

      <!-- Chart Data Summary Section -->
      <div class="chart-summary">
        <h3>📊 Chart Analysis Summary (ROL vs ROQ)</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>ROL Value</th>
              <th>ROQ Value</th>
              <th>Difference (ROQ - ROL)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
  `;

  // Add chart data summary rows
  demandData.forEach(item => {
    const rolValue = Number(item.rol) || 0;
    const roqValue = Number(item.roq) || 0;
    const difference = roqValue - rolValue;
    const status = difference >= 0 ? "Surplus" : "Shortage";

    tableHTML += `
      <tr>
        <td>${item.productName || 'N/A'}</td>
        <td>${rolValue}</td>
        <td>${roqValue}</td>
        <td class="${difference >= 0 ? 'positive' : 'negative'}">${difference}</td>
        <td class="${difference >= 0 ? 'positive' : 'negative'}">${status}</td>
      </tr>
    `;
  });

  tableHTML += `
          </tbody>
        </table>
      </div>

      <!-- Detailed Data Table -->
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Total Quantity</th>
            <th>Lead Time (Days)</th>
            <th>Demand / Day</th>
            <th>ROL</th>
            <th>ROQ</th>
            <th>Product ID</th>
            <th>Price (${currency})</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Add detailed data rows
  demandData.forEach(item => {
    tableHTML += `
      <tr>
        <td>${item.productName || 'N/A'}</td>
        <td>${item.totalQty}</td>
        <td>${item.leadTimeApplied}</td>
        <td>${item.demandPerDay}</td>
        <td>${item.rol}</td>
        <td>${item.roq}</td>
        <td>${item.productId || 'N/A'}</td>
        <td>${item.originalPrice}</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
      <div class="summary">
        <strong>Report Summary:</strong><br/>
        Total Products: ${demandData.length} | 
        Total Records Analyzed: ${data.length} | 
        Generated on: ${new Date().toLocaleString()}
      </div>
      <div class="chart-summary">
        <strong>📈 Chart Statistics:</strong><br/>
        • Average ROL: ${chartStatistics.avgROL} units<br/>
        • Average ROQ: ${chartStatistics.avgROQ} units<br/>
        • Maximum ROL: ${chartStatistics.maxROL} units<br/>
        • Maximum ROQ: ${chartStatistics.maxROQ} units<br/>
        • Minimum ROL: ${chartStatistics.minROL} units<br/>
        • Minimum ROQ: ${chartStatistics.minROQ} units<br/>
        • Products with ROL data: ${chartStatistics.productsWithROL}<br/>
        • Products with ROQ data: ${chartStatistics.productsWithROQ}<br/>
        <br/>
        <strong>📋 Chart Interpretation:</strong><br/>
        - <span style="color: #ef4444">ROL (Reorder Level)</span>: Total demand during lead time period<br/>
        - <span style="color: #3b82f6">ROQ (Reorder Quantity)</span>: Recommended order quantity<br/>
        - <span class="positive">Positive difference</span>: Inventory surplus capacity<br/>
        - <span class="negative">Negative difference</span>: Potential stockout risk
      </div>
    </body>
    </html>
  `;

  return tableHTML;
};

export const exportAnalysisToExcel = (demandData, filters, currency, chartStatistics, data, setIsExporting) => {
  try {
    setIsExporting(true);

    const tableHTML = generateExcelTemplate(demandData, filters, currency, chartStatistics, data);

    // Create and download file
    const blob = new Blob([tableHTML], {
      type: 'application/vnd.ms-excel'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];

    a.href = url;
    a.download = `Order_Analysis_Report_${timestamp}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Error exporting data to Excel. Please try again.');
  } finally {
    setIsExporting(false);
  }
};

export default generateExcelTemplate;
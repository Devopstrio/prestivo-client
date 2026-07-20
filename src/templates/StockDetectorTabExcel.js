// src/templates/StockDetectorTabExcel.jsx
import React from 'react';
import { toast } from "react-toastify";
const generateExcelTemplate = (filteredProducts, filters, festivalTime, thresholdNormal, thresholdFestival) => {
  const {
    searchTerm,
    selectedCategory
  } = filters;

  const getStockLevel = (stock) => {
    const threshold = festivalTime ? thresholdFestival : thresholdNormal;
    if (stock < threshold * 0.3) return 'critical';
    if (stock < threshold * 0.6) return 'warning';
    if (stock < threshold) return 'low';
    return 'adequate';
  };

  let tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <title>Stock Alerts Report</title>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Stock Alerts</x:Name>
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
        th { background-color: #2C5AA0; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; text-align: center; }
        td { padding: 6px; border: 1px solid #ddd; text-align: center; }
        .critical { background-color: #FFE5E5; }
        .warning { background-color: #FFF4E5; }
        .low { background-color: #E5F4FF; }
        .header { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 18px; font-weight: bold; }
        .summary { background-color: #f1f5f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .alert-info { background-color: #fff3cd; padding: 10px; margin: 10px 0; border: 1px solid #ffeaa7; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        Stock Alerts Report - ${new Date().toLocaleDateString()}
      </div>
      <div class="alert-info">
        <strong>System Status:</strong> ${festivalTime ? 'Festival Season Mode Active' : 'Standard Monitoring Mode'} | 
        <strong>Current Threshold:</strong> ${festivalTime ? thresholdFestival : thresholdNormal} units
      </div>
      <div class="summary">
        <strong>Filters Applied:</strong><br/>
        Search: ${searchTerm || 'None'} | 
        Category: ${selectedCategory !== 'all' ? selectedCategory : 'All Categories'} | 
        Total Alert Items: ${filteredProducts.length}
      </div>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Subcategory</th>
            <th>Sub-Subcategory</th>
            <th>Brand</th>
            <th>Total Stock</th>
            <th>Warehouse</th>
            <th>City</th>
            <th>State</th>
            <th>Country</th>
            <th>Warehouse Stock</th>
            <th>Stock Level</th>
            <th>Threshold</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Add data rows
  filteredProducts.forEach(product => {
    product.warehouseStocks?.filter(ws => 
      festivalTime ? ws.stock < thresholdFestival : ws.stock < thresholdNormal
    ).forEach(ws => {
      const stockLevel = getStockLevel(ws.stock);
      const status = ws.stock < (festivalTime ? thresholdFestival * 0.3 : thresholdNormal * 0.3) 
        ? 'CRITICAL' 
        : ws.stock < (festivalTime ? thresholdFestival * 0.6 : thresholdNormal * 0.6)
        ? 'WARNING'
        : 'LOW';

      tableHTML += `
        <tr class="${stockLevel}">
          <td>${product.name || 'N/A'}</td>
          <td>${product.categoryId?.name || product.category || 'N/A'}</td>
          <td>${product.subCategory || 'N/A'}</td>
          <td>${product.subSubCategory || 'N/A'}</td>
          <td>${product.brand || 'N/A'}</td>
          <td>${product.stock}</td>
          <td>${ws.warehouseName || 'Unnamed Warehouse'}</td>
          <td>${ws.city || 'N/A'}</td>
          <td>${ws.state || 'N/A'}</td>
          <td>${ws.country || 'N/A'}</td>
          <td>${ws.stock}</td>
          <td>${stockLevel.toUpperCase()}</td>
          <td>${festivalTime ? thresholdFestival : thresholdNormal}</td>
          <td>${status}</td>
        </tr>
      `;
    });
  });

  tableHTML += `
        </tbody>
      </table>
      
      <!-- Summary Statistics -->
      <div class="summary">
        <strong>📊 Alert Summary:</strong><br/>
        • Total Products with Alerts: ${filteredProducts.length}<br/>
        • Critical Items: ${
          filteredProducts.reduce((count, product) => 
            count + (product.warehouseStocks?.filter(ws => 
              getStockLevel(ws.stock) === 'critical'
            ).length || 0), 0
          )
        }<br/>
        • Warning Items: ${
          filteredProducts.reduce((count, product) => 
            count + (product.warehouseStocks?.filter(ws => 
              getStockLevel(ws.stock) === 'warning'
            ).length || 0), 0
          )
        }<br/>
        • Low Stock Items: ${
          filteredProducts.reduce((count, product) => 
            count + (product.warehouseStocks?.filter(ws => 
              getStockLevel(ws.stock) === 'low'
            ).length || 0), 0
          )
        }<br/>
        • Warehouses Affected: ${
          new Set(
            filteredProducts.flatMap(product => 
              product.warehouseStocks?.map(ws => ws.warehouseName) || []
            )
          ).size
        }<br/>
        <br/>
        <strong>🚨 Action Required:</strong><br/>
        - <span style="color: #dc2626">CRITICAL</span>: Immediate restocking needed<br/>
        - <span style="color: #ea580c">WARNING</span>: Plan restocking within 1-2 days<br/>
        - <span style="color: #2563eb">LOW</span>: Monitor closely, consider restocking
      </div>
    </body>
    </html>
  `;

  return tableHTML;
};

export const exportStockDetectorToExcel = (filteredProducts, filters, festivalTime, thresholdNormal, thresholdFestival, setIsExporting) => {
  try {
    setIsExporting(true);

    const tableHTML = generateExcelTemplate(filteredProducts, filters, festivalTime, thresholdNormal, thresholdFestival);

    // Create and download file
    const blob = new Blob([tableHTML], { 
      type: 'application/vnd.ms-excel' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    
    a.href = url;
    a.download = `Stock_Alerts_${timestamp}.xls`;
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

// Alternative export using XLSX library (commented out for reference)
export const exportStockDetectorToExcelXLSX = async (filteredProducts, filters, festivalTime, thresholdNormal, thresholdFestival, setIsExporting) => {
  try {
    setIsExporting(true);
    
    // Import xlsx library dynamically to reduce bundle size
    const XLSX = await import('xlsx');
    
    // Prepare data for Excel
    const excelData = filteredProducts.flatMap(product => 
      product.warehouseStocks?.filter(ws => 
        festivalTime ? ws.stock < thresholdFestival : ws.stock < thresholdNormal
      ).map(ws => {
        const getStockLevel = (stock) => {
          const threshold = festivalTime ? thresholdFestival : thresholdNormal;
          if (stock < threshold * 0.3) return 'critical';
          if (stock < threshold * 0.6) return 'warning';
          if (stock < threshold) return 'low';
          return 'adequate';
        };

        const stockLevel = getStockLevel(ws.stock);
        const status = ws.stock < (festivalTime ? thresholdFestival * 0.3 : thresholdNormal * 0.3) 
          ? 'CRITICAL' 
          : ws.stock < (festivalTime ? thresholdFestival * 0.6 : thresholdNormal * 0.6)
          ? 'WARNING'
          : 'LOW';

        return {
          'Product Name': product.name,
          'Category': product.categoryId?.name || product.category || 'N/A',
          'Subcategory': product.subCategory || 'N/A',
          'Sub-Subcategory': product.subSubCategory || 'N/A',
          'Brand': product.brand || 'N/A',
          'Total Stock': product.stock,
          'Warehouse': ws.warehouseName || 'Unnamed Warehouse',
          'City': ws.city || 'N/A',
          'State': ws.state || 'N/A',
          'Country': ws.country || 'N/A',
          'Warehouse Stock': ws.stock,
          'Stock Level': stockLevel.toUpperCase(),
          'Threshold': festivalTime ? thresholdFestival : thresholdNormal,
          'Status': status
        };
      }) || []
    );

    if (excelData.length === 0) {
      toast.error('No data available to export');
      return;
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const colWidths = [
      { wch: 25 }, // Product Name
      { wch: 20 }, // Category
      { wch: 20 }, // Subcategory
      { wch: 20 }, // Sub-Subcategory
      { wch: 15 }, // Brand
      { wch: 12 }, // Total Stock
      { wch: 20 }, // Warehouse
      { wch: 15 }, // City
      { wch: 15 }, // State
      { wch: 15 }, // Country
      { wch: 15 }, // Warehouse Stock
      { wch: 12 }, // Stock Level
      { wch: 12 }, // Threshold
      { wch: 12 }  // Status
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Alerts');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Stock_Alerts_${timestamp}.xlsx`;

    // Export to Excel
    XLSX.writeFile(wb, filename);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Error exporting data to Excel. Please try again.');
  } finally {
    setIsExporting(false);
  }
};

export default generateExcelTemplate;
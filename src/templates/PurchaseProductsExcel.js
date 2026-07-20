import React from 'react';
import { toast } from "react-toastify";
const generateExcelTemplate = (filteredProducts, filters, currency, rates, currencySymbols) => {
  const {
    searchTerm,
    selectedCategory,
    selectedSubCategory,
    selectedSubSubCategory,
    minPrice,
    maxPrice,
    priceCurrency
  } = filters;

  // Currency conversion function
  const convertPrice = (price, fromCurrency = "GBP") => {
    if (!price || !rates[fromCurrency] || !rates[currency]) return 0;
    const priceInGBP = price / rates[fromCurrency];
    return (priceInGBP * rates[currency]);
  };

  const getCurrencySymbol = (curr) => {
    return currencySymbols[curr] || curr;
  };

  // Get price statistics
  const getPriceRangeStats = () => {
    if (filteredProducts.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const prices = filteredProducts
      .map(product => convertPrice(product.price, product.currency))
      .filter(price => price > 0);
    
    if (prices.length === 0) return { min: 0, max: 0, avg: 0 };
    
    return {
      min: Math.min(...prices).toFixed(2),
      max: Math.max(...prices).toFixed(2),
      avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
    };
  };

  const priceStats = getPriceRangeStats();

  let tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <title>Products Inventory Report</title>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Products Inventory</x:Name>
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
        td { padding: 10px; border: 1px solid #ddd; text-align: center; vertical-align: top; }
        .header { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 18px; font-weight: bold; }
        .summary { background-color: #f1f5f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .warehouse-list { text-align: left; font-size: 12px; }
        .filters { background-color: #e8f4fd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .price-range { background-color: #f0f9ff; padding: 10px; margin: 5px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        Products Inventory Report - ${new Date().toLocaleDateString()}
      </div>
      <div class="filters">
        <strong>Filters Applied:</strong><br/>
        Search: ${searchTerm || 'None'} | 
        Category: ${selectedCategory || 'All'} | 
        Sub Category: ${selectedSubCategory || 'All'} | 
        Sub Sub Category: ${selectedSubSubCategory || 'All'} |
        Price Range: ${minPrice ? `${getCurrencySymbol(priceCurrency)}${minPrice}` : 'Min'} - ${maxPrice ? `${getCurrencySymbol(priceCurrency)}${maxPrice}` : 'Max'} |
        Display Currency: ${currency}
      </div>
      <div class="price-range">
        <strong>Price Statistics (${currency}):</strong><br/>
        Min: ${getCurrencySymbol(currency)}${priceStats.min} | 
        Max: ${getCurrencySymbol(currency)}${priceStats.max} | 
        Average: ${getCurrencySymbol(currency)}${priceStats.avg}
      </div>
      <div class="summary">
        <strong>Report Summary:</strong><br/>
        Total Products: ${filteredProducts.length} | 
        Generated on: ${new Date().toLocaleString()}
      </div>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Sub Category</th>
            <th>Sub Sub Category</th>
            <th>Original Price</th>
            <th>Price (${currency})</th>
            <th>Offer/Discount</th>
            <th>Total Stock</th>
            <th>Warehouse Details</th>
            <th>Product ID</th>
          </tr>
        </thead>
        <tbody>
  `;

  filteredProducts.forEach((product) => {
    const totalStock = product.stock || 0;
    const warehouseDetails = product.warehouseStocks?.length > 0 
      ? product.warehouseStocks.map(ws => 
          `${ws.warehouseName || 'N/A'}: ${ws.stock || 0} units (${ws.city || 'N/A'}, ${ws.state || 'N/A'})`
        ).join('; ')
      : 'No warehouse data';

    const convertedPrice = convertPrice(product.price, product.currency);

    tableHTML += `
      <tr>
        <td>${product.name || 'N/A'}</td>
        <td>${product.category || 'N/A'}</td>
        <td>${product.subCategory || 'N/A'}</td>
        <td>${product.subSubCategory || 'N/A'}</td>
        <td>${getCurrencySymbol(product.currency)}${product.price || 0}</td>
        <td>${getCurrencySymbol(currency)}${convertedPrice.toFixed(2)}</td>
        <td>${product.discount ? product.discount + '% OFF' : '0%'}</td>
        <td>${totalStock}</td>
        <td class="warehouse-list">${warehouseDetails}</td>
        <td>${product._id || 'N/A'}</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
      <div class="summary">
        <strong>Inventory Analysis:</strong><br/>
        • Products with discount: ${filteredProducts.filter(p => p.discount > 0).length}<br/>
        • Products with warehouse data: ${filteredProducts.filter(p => p.warehouseStocks?.length > 0).length}<br/>
        • Total stock across all products: ${filteredProducts.reduce((sum, p) => sum + (p.stock || 0), 0)} units<br/>
        • Categories represented: ${[...new Set(filteredProducts.map(p => p.category).filter(Boolean))].length}
      </div>
    </body>
    </html>
  `;

  return tableHTML;
};

export const exportToExcel = (filteredProducts, filters, currency, rates, currencySymbols, setIsExporting) => {
  try {
    setIsExporting(true);
    
    const tableHTML = generateExcelTemplate(filteredProducts, filters, currency, rates, currencySymbols);

    const blob = new Blob([tableHTML], { 
      type: 'application/vnd.ms-excel' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    
    a.href = url;
    a.download = `Products_Inventory_Report_${timestamp}.xls`;
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
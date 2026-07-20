import React from 'react';
import { toast } from "react-toastify";
const DeliveryManagementExcel = {
  /**
   * Format date for Excel compatibility (YYYY-MM-DD format)
   * @param {Date} date - Date object
   * @returns {string} Formatted date string
   */
  formatDateForExcel: (date) => {
    if (!date) return 'Not specified';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      
      // Format as YYYY-MM-DD for Excel compatibility
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  },

  /**
   * Format date with time for Excel compatibility
   * @param {Date} date - Date object
   * @returns {string} Formatted datetime string
   */
  formatDateTimeForExcel: (date) => {
    if (!date) return 'Not specified';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      
      // Format as YYYY-MM-DD HH:MM:SS for Excel compatibility
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Invalid Date';
    }
  },

  /**
   * Export incomplete delivery orders to Excel format with comprehensive data
   * @param {Array} orders - Array of order objects
   */
  exportToExcel: (orders) => {
    try {
      // Prepare comprehensive data for Excel
      const excelData = [];
      
      orders.forEach(order => {
        const userDetails = order.userDetails || {};
        const address = userDetails 
          ? `${userDetails.houseNumber || ''}, ${userDetails.region || ''}, ${userDetails.district || ''}, ${userDetails.state || ''} - ${userDetails.pincode || ''}`
          : 'N/A';

        // Process each product individually for detailed export
        order.products?.forEach((product, productIndex) => {
          // Warehouse allocation details for this specific product
          const warehouseDetails = product.warehouseAllocations?.map(wh => 
            `${wh.warehouseType}: ${wh.name} (${wh.city}, ${wh.state}) - Qty: ${wh.qty} - Manager: ${wh.warehouseManager?.name || 'N/A'}`
          ).join('; ') || 'No allocation';

          // Product size information
          const category = product.category?.toLowerCase() || '';
          let size = product.selectedSize || product.size || 'N/A';
          if (category.includes('home')) {
            const inchesValue = product.sizeInches || product.inches || product.dimensions;
            size = inchesValue ? `${inchesValue} inches` : 'N/A';
          }

          // Create comprehensive row for each product
          const rowData = {
            // Order Information
            'Order ID': order._id,
            'Order Date': DeliveryManagementExcel.formatDateForExcel(order.createdAt),
            'Order DateTime': DeliveryManagementExcel.formatDateTimeForExcel(order.createdAt),
            'Order Status': order.deliveryCompleted ? 'Delivered' : 'Pending Delivery',
            'Total Order Amount': `${order.currency} ${order.totalAmount}`,
            
            // User Information
            'Customer Name': userDetails.name || 'Unknown',
            'Customer Email': userDetails.email || 'N/A',
            'Customer Phone': userDetails.mobile || userDetails.phone || 'N/A',
            'Customer Region Code': userDetails.regionCode || 'N/A',
            'Delivery Address': address,
            'House Number': userDetails.houseNumber || 'N/A',
            'Region': userDetails.region || 'N/A',
            'District': userDetails.district || 'N/A',
            'State': userDetails.state || 'N/A',
            'Pincode': userDetails.pincode || 'N/A',
            
            // Payment Information
            'Payment Status': order.paymentStatus,
            'Payment Method': order.paymentMethod,
            'Currency': order.currency,
            
            // Product Information
            'Product Number': productIndex + 1,
            'Product Name': product.name || 'N/A',
            'Product ID': product.productId || 'N/A',
            'Product Category': product.category || 'N/A',
            'Product Subcategory': product.subCategory || 'N/A',
            'Product Sub-Subcategory': product.subSubCategory || 'N/A',
            'Product Size': size,
            'Product Quantity': product.qty || 0,
            'Original Price': product.originalPrice || 0,
            'Discount Percentage': product.discount || 0,
            'Discounted Price': product.discountedPrice || product.originalPrice || 0,
            'Product Total': product.total || 0,
            'Stock Status': (product.stock !== undefined && product.stock <= 0) ? 'Out of Stock' : 'In Stock',
            
            // Warehouse Information
            'Warehouse Allocations': warehouseDetails,
            
            // Delivery Employee Information
            'Delivery Employee ID': order.assignedDeliveryEmployee?._id || 'Not assigned',
            'Assigned Delivery Employee': order.assignedDeliveryEmployee?.name || 'Not assigned',
            'Employee Email': order.assignedDeliveryEmployee?.email || 'N/A',
            
            // Delivery Information - Properly formatted dates for Excel
            'Delivery Date': DeliveryManagementExcel.formatDateForExcel(order.deliveryDate),
            'Delivery DateTime': DeliveryManagementExcel.formatDateTimeForExcel(order.deliveryDate),
            'Shipping Status': 'Completed',
            'Delivery Status': order.deliveryCompleted ? 'Delivered' : 'Pending'
          };

          excelData.push(rowData);
        });

        // If no products, still create a row with order and user info
        if (!order.products || order.products.length === 0) {
          const rowData = {
            // Order Information
            'Order ID': order._id,
            'Order Date': DeliveryManagementExcel.formatDateForExcel(order.createdAt),
            'Order DateTime': DeliveryManagementExcel.formatDateTimeForExcel(order.createdAt),
            'Order Status': order.deliveryCompleted ? 'Delivered' : 'Pending Delivery',
            'Total Order Amount': `${order.currency} ${order.totalAmount}`,
            
            // User Information
            'Customer Name': userDetails.name || 'Unknown',
            'Customer Email': userDetails.email || 'N/A',
            'Customer Phone': userDetails.mobile || userDetails.phone || 'N/A',
            'Customer Region Code': userDetails.regionCode || 'N/A',
            'Delivery Address': address,
            'House Number': userDetails.houseNumber || 'N/A',
            'Region': userDetails.region || 'N/A',
            'District': userDetails.district || 'N/A',
            'State': userDetails.state || 'N/A',
            'Pincode': userDetails.pincode || 'N/A',
            
            // Payment Information
            'Payment Status': order.paymentStatus,
            'Payment Method': order.paymentMethod,
            'Currency': order.currency,
            
            // Product Information
            'Product Number': 'N/A',
            'Product Name': 'No products',
            'Product ID': 'N/A',
            'Product Category': 'N/A',
            'Product Subcategory': 'N/A',
            'Product Sub-Subcategory': 'N/A',
            'Product Size': 'N/A',
            'Product Quantity': 0,
            'Original Price': 0,
            'Discount Percentage': 0,
            'Discounted Price': 0,
            'Product Total': 0,
            'Stock Status': 'N/A',
            
            // Warehouse Information
            'Warehouse Allocations': 'No products',
            
            // Delivery Employee Information
            'Delivery Employee ID': order.assignedDeliveryEmployee?._id || 'Not assigned',
            'Assigned Delivery Employee': order.assignedDeliveryEmployee?.name || 'Not assigned',
            'Employee Email': order.assignedDeliveryEmployee?.email || 'N/A',
            
            // Delivery Information - Properly formatted dates for Excel
            'Delivery Date': DeliveryManagementExcel.formatDateForExcel(order.deliveryDate),
            'Delivery DateTime': DeliveryManagementExcel.formatDateTimeForExcel(order.deliveryDate),
            'Shipping Status': 'Completed',
            'Delivery Status': order.deliveryCompleted ? 'Delivered' : 'Pending'
          };

          excelData.push(rowData);
        }
      });

      if (excelData.length === 0) {
        toast.error('No data to export!');
        return;
      }

      // Create CSV content with proper date formatting for Excel
      const headers = Object.keys(excelData[0]);
      const csvContent = [
        headers.join(','),
        ...excelData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // For dates, don't wrap in quotes if they're already in proper format
            if (header.includes('Date') && value !== 'Not specified' && value !== 'Invalid Date') {
              return value;
            }
            // Escape quotes and wrap in quotes if contains comma
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `delivery_orders_detailed_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      const totalProducts = excelData.reduce((sum, row) => sum + (row['Product Quantity'] || 0), 0);
      toast.success(`Successfully exported ${orders.length} orders with ${excelData.length} product lines to Excel format!\nTotal products: ${totalProducts}`);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error exporting data. Please check the console for details.');
    }
  },

  /**
   * Alternative method using proper Excel format (xlsx) with comprehensive data
   * This would require the xlsx library to be installed
   */
  exportToExcelAdvanced: async (orders) => {
    try {
      // This method requires the xlsx library
      // You would need to install: npm install xlsx
      const XLSX = await import('xlsx');
      
      const worksheetData = [];
      
      orders.forEach(order => {
        const userDetails = order.userDetails || {};
        const address = userDetails 
          ? `${userDetails.houseNumber || ''}, ${userDetails.region || ''}, ${userDetails.district || ''}, ${userDetails.state || ''} - ${userDetails.pincode || ''}`
          : 'N/A';

        // Process each product individually for detailed export
        order.products?.forEach((product, productIndex) => {
          // Warehouse allocation details for this specific product
          const warehouseDetails = product.warehouseAllocations?.map(wh => 
            `${wh.warehouseType}: ${wh.name} (${wh.city}, ${wh.state}) - Qty: ${wh.qty} - Manager: ${wh.warehouseManager?.name || 'N/A'}`
          ).join('; ') || 'No allocation';

          // Product size information
          const category = product.category?.toLowerCase() || '';
          let size = product.selectedSize || product.size || 'N/A';
          if (category.includes('home')) {
            const inchesValue = product.sizeInches || product.inches || product.dimensions;
            size = inchesValue ? `${inchesValue} inches` : 'N/A';
          }

          // Create comprehensive row for each product
          const rowData = {
            // Order Information
            'Order ID': order._id,
            'Order Date': DeliveryManagementExcel.formatDateForExcel(order.createdAt),
            'Order DateTime': DeliveryManagementExcel.formatDateTimeForExcel(order.createdAt),
            'Order Status': order.deliveryCompleted ? 'Delivered' : 'Pending Delivery',
            'Total Order Amount': order.totalAmount,
            
            // User Information
            'Customer Name': userDetails.name || 'Unknown',
            'Customer Email': userDetails.email || 'N/A',
            'Customer Phone': userDetails.mobile || userDetails.phone || 'N/A',
            'Customer Region Code': userDetails.regionCode || 'N/A',
            'Delivery Address': address,
            'House Number': userDetails.houseNumber || 'N/A',
            'Region': userDetails.region || 'N/A',
            'District': userDetails.district || 'N/A',
            'State': userDetails.state || 'N/A',
            'Pincode': userDetails.pincode || 'N/A',
            
            // Payment Information
            'Payment Status': order.paymentStatus,
            'Payment Method': order.paymentMethod,
            'Currency': order.currency,
            
            // Product Information
            'Product Number': productIndex + 1,
            'Product Name': product.name || 'N/A',
            'Product ID': product.productId || 'N/A',
            'Product Category': product.category || 'N/A',
            'Product Subcategory': product.subCategory || 'N/A',
            'Product Sub-Subcategory': product.subSubCategory || 'N/A',
            'Product Size': size,
            'Product Quantity': product.qty || 0,
            'Original Price': product.originalPrice || 0,
            'Discount Percentage': product.discount || 0,
            'Discounted Price': product.discountedPrice || product.originalPrice || 0,
            'Product Total': product.total || 0,
            'Stock Status': (product.stock !== undefined && product.stock <= 0) ? 'Out of Stock' : 'In Stock',
            
            // Warehouse Information
            'Warehouse Allocations': warehouseDetails,
            
            // Delivery Employee Information
            'Delivery Employee ID': order.assignedDeliveryEmployee?._id || 'Not assigned',
            'Assigned Delivery Employee': order.assignedDeliveryEmployee?.name || 'Not assigned',
            'Employee Email': order.assignedDeliveryEmployee?.email || 'N/A',
            
            // Delivery Information - Properly formatted dates for Excel
            'Delivery Date': DeliveryManagementExcel.formatDateForExcel(order.deliveryDate),
            'Delivery DateTime': DeliveryManagementExcel.formatDateTimeForExcel(order.deliveryDate),
            'Shipping Status': 'Completed',
            'Delivery Status': order.deliveryCompleted ? 'Delivered' : 'Pending'
          };

          worksheetData.push(rowData);
        });

        // If no products, still create a row with order and user info
        if (!order.products || order.products.length === 0) {
          const rowData = {
            // Order Information
            'Order ID': order._id,
            'Order Date': DeliveryManagementExcel.formatDateForExcel(order.createdAt),
            'Order DateTime': DeliveryManagementExcel.formatDateTimeForExcel(order.createdAt),
            'Order Status': order.deliveryCompleted ? 'Delivered' : 'Pending Delivery',
            'Total Order Amount': order.totalAmount,
            
            // User Information
            'Customer Name': userDetails.name || 'Unknown',
            'Customer Email': userDetails.email || 'N/A',
            'Customer Phone': userDetails.mobile || userDetails.phone || 'N/A',
            'Customer Region Code': userDetails.regionCode || 'N/A',
            'Delivery Address': address,
            'House Number': userDetails.houseNumber || 'N/A',
            'Region': userDetails.region || 'N/A',
            'District': userDetails.district || 'N/A',
            'State': userDetails.state || 'N/A',
            'Pincode': userDetails.pincode || 'N/A',
            
            // Payment Information
            'Payment Status': order.paymentStatus,
            'Payment Method': order.paymentMethod,
            'Currency': order.currency,
            
            // Product Information
            'Product Number': 'N/A',
            'Product Name': 'No products',
            'Product ID': 'N/A',
            'Product Category': 'N/A',
            'Product Subcategory': 'N/A',
            'Product Sub-Subcategory': 'N/A',
            'Product Size': 'N/A',
            'Product Quantity': 0,
            'Original Price': 0,
            'Discount Percentage': 0,
            'Discounted Price': 0,
            'Product Total': 0,
            'Stock Status': 'N/A',
            
            // Warehouse Information
            'Warehouse Allocations': 'No products',
            
            // Delivery Employee Information
            'Delivery Employee ID': order.assignedDeliveryEmployee?._id || 'Not assigned',
            'Assigned Delivery Employee': order.assignedDeliveryEmployee?.name || 'Not assigned',
            'Employee Email': order.assignedDeliveryEmployee?.email || 'N/A',
            
            // Delivery Information - Properly formatted dates for Excel
            'Delivery Date': DeliveryManagementExcel.formatDateForExcel(order.deliveryDate),
            'Delivery DateTime': DeliveryManagementExcel.formatDateTimeForExcel(order.deliveryDate),
            'Shipping Status': 'Completed',
            'Delivery Status': order.deliveryCompleted ? 'Delivered' : 'Pending'
          };

          worksheetData.push(rowData);
        }
      });

      if (worksheetData.length === 0) {
        toast.error('No data to export!');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Delivery Orders');
      
      // Generate Excel file and download
      XLSX.writeFile(workbook, `delivery_orders_detailed_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      const totalProducts = worksheetData.reduce((sum, row) => sum + (row['Product Quantity'] || 0), 0);
      toast.success(`Successfully exported ${orders.length} orders with ${worksheetData.length} product lines to Excel!\nTotal products: ${totalProducts}`);
      
    } catch (error) {
      console.error('Error exporting to Excel (advanced):', error);
      // Fallback to CSV method
      toast.error('Advanced Excel export failed. Using CSV format instead.');
      DeliveryManagementExcel.exportToExcel(orders);
    }
  },

  /**
   * Export summary data (one row per order)
   * @param {Array} orders - Array of order objects
   */
  exportOrderSummary: (orders) => {
    try {
      const summaryData = orders.map(order => {
        const userDetails = order.userDetails || {};
        const address = userDetails 
          ? `${userDetails.houseNumber || ''}, ${userDetails.region || ''}, ${userDetails.district || ''}, ${userDetails.state || ''} - ${userDetails.pincode || ''}`
          : 'N/A';

        const products = order.products?.map(p => p.name).join('; ') || 'N/A';
        const productIds = order.products?.map(p => p.productId).join('; ') || 'N/A';
        const totalProducts = order.products?.reduce((sum, p) => sum + (p.qty || 0), 0) || 0;

        const warehouseDetails = order.products?.map(product => 
          product.warehouseAllocations?.map(wh => 
            `${wh.warehouseType}: ${wh.name} (${wh.city}, ${wh.state}) - Qty: ${wh.qty}`
          ).join('; ') || 'No allocation'
        ).join(' | ') || 'No warehouse allocations';

        return {
          'Order ID': order._id,
          'Order Date': DeliveryManagementExcel.formatDateForExcel(order.createdAt),
          'Order DateTime': DeliveryManagementExcel.formatDateTimeForExcel(order.createdAt),
          'Order Status': order.deliveryCompleted ? 'Delivered' : 'Pending Delivery',
          'Total Amount': `${order.currency} ${order.totalAmount}`,
          
          // User Information
          'Customer Name': userDetails.name || 'Unknown',
          'Customer Email': userDetails.email || 'N/A',
          'Customer Phone': userDetails.mobile || userDetails.phone || 'N/A',
          'Delivery Address': address,
          
          // Product Summary
          'Products': products,
          'Product IDs': productIds,
          'Total Products Quantity': totalProducts,
          'Number of Products': order.products?.length || 0,
          
          // Payment Information
          'Payment Status': order.paymentStatus,
          'Payment Method': order.paymentMethod,
          
          // Warehouse Information
          'Warehouse Allocations': warehouseDetails,
          
          // Delivery Employee Information
          'Delivery Employee ID': order.assignedDeliveryEmployee?._id || 'Not assigned',
          'Assigned Delivery Employee': order.assignedDeliveryEmployee?.name || 'Not assigned',
          'Employee Email': order.assignedDeliveryEmployee?.email || 'N/A',
          
          // Delivery Information - Properly formatted dates for Excel
          'Delivery Date': DeliveryManagementExcel.formatDateForExcel(order.deliveryDate),
          'Delivery DateTime': DeliveryManagementExcel.formatDateTimeForExcel(order.deliveryDate),
          'Delivery Status': order.deliveryCompleted ? 'Delivered' : 'Pending'
        };
      });

      const headers = Object.keys(summaryData[0]);
      const csvContent = [
        headers.join(','),
        ...summaryData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // For dates, don't wrap in quotes if they're already in proper format
            if (header.includes('Date') && value !== 'Not specified' && value !== 'Invalid Date') {
              return value;
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `delivery_orders_summary_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success(`Successfully exported ${orders.length} order summaries to Excel format!`);
      
    } catch (error) {
      console.error('Error exporting order summary:', error);
      toast.error('Error exporting order summary. Please check the console for details.');
    }
  }
};

export default DeliveryManagementExcel;
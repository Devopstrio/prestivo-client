// src/templates/CancelOrderTabExcel.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

class CancelOrderTabExcel {
  static exportToExcel(orders, tabType) {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheets for different data types
      this.createOrdersSheet(wb, orders, tabType);
      this.createProductsSheet(wb, orders, tabType);
      this.createUsersSheet(wb, orders, tabType);
      this.createSummarySheet(wb, orders, tabType);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Cancellation_Orders_${tabType}_${timestamp}.xlsx`;
      
      // Save the workbook
      XLSX.writeFile(wb, filename);
      
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }

  static createOrdersSheet(wb, orders, tabType) {
    const ordersData = orders.map(order => ({
      'Order ID': order._id || 'N/A',
      'Total Amount': `${order.currency || 'USD'} ${order.totalAmount || 0}`,
      'Cancellation Status': order.cancellationStatus || 'N/A',
      'Cancellation Reason': order.cancellationReason || 'No reason provided',
      'Payment Method': order.paymentMethod || 'N/A',
      'Payment Status': order.paymentStatus || 'Pending',
      'Order Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
      'Updated Date': order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A',
      'Customer Name': order.userDetails?.name || 'N/A',
      'Customer Email': order.userDetails?.email || 'N/A',
      'Products Count': order.products?.length || 0,
      'Total Items': order.products?.reduce((sum, product) => sum + (product.qty || 0), 0) || 0
    }));

    const ws = XLSX.utils.json_to_sheet(ordersData);
    
    // Add column widths
    const colWidths = [
      { wch: 20 }, // Order ID
      { wch: 15 }, // Total Amount
      { wch: 20 }, // Cancellation Status
      { wch: 30 }, // Cancellation Reason
      { wch: 15 }, // Payment Method
      { wch: 15 }, // Payment Status
      { wch: 12 }, // Order Date
      { wch: 12 }, // Updated Date
      { wch: 20 }, // Customer Name
      { wch: 25 }, // Customer Email
      { wch: 15 }, // Products Count
      { wch: 12 }  // Total Items
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  }

  static createProductsSheet(wb, orders, tabType) {
    const productsData = [];
    
    orders.forEach(order => {
      order.products?.forEach((product, index) => {
        const productRow = {
          'Order ID': order._id || 'N/A',
          'Product Name': product.name || 'N/A',
          'Quantity': product.qty || 0,
          'Price': product.price || 0,
          'Total': product.total || 0,
          'Currency': order.currency || 'USD',
          'Category': product.category || 'N/A',
          'Subcategory': product.subCategory || 'N/A',
          'Sub-Subcategory': product.subSubCategory || 'N/A',
          'Brand': product.brand || 'N/A',
          'Color': product.color || 'N/A',
          'Size': product.size?.join(', ') || 'N/A',
          'Material': product.material || 'N/A',
          'Warranty': product.warranty || 'N/A',
          'Model': product.model || 'N/A',
          'SKU': product.sku || 'N/A'
        };

        // Add dynamic product attributes
        const extraDetails = this.flattenProductDetails(product);
        Object.assign(productRow, extraDetails);

        productsData.push(productRow);
      });
    });

    if (productsData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(productsData);
      
      // Auto-size columns for product data
      const maxColWidth = 25;
      const colWidths = Object.keys(productsData[0]).map(() => ({ wch: maxColWidth }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Products');
    }
  }

  static createUsersSheet(wb, orders, tabType) {
    const usersData = [];
    const processedEmails = new Set();

    orders.forEach(order => {
      if (order.userDetails && !processedEmails.has(order.userDetails.email)) {
        processedEmails.add(order.userDetails.email);
        
        const userRow = {
          'Customer Name': order.userDetails.name || 'N/A',
          'Email': order.userDetails.email || 'N/A',
          'Phone': order.userDetails.phone || 'N/A',
          'House Number': order.userDetails.houseNumber || 'N/A',
          'Street': order.userDetails.street || 'N/A',
          'District': order.userDetails.district || 'N/A',
          'State': order.userDetails.state || 'N/A',
          'Pincode': order.userDetails.pincode || 'N/A',
          'Country': order.userDetails.country || 'N/A',
          'Total Orders': orders.filter(o => o.userDetails?.email === order.userDetails.email).length,
          'Total Amount Spent': orders
            .filter(o => o.userDetails?.email === order.userDetails.email)
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
        };

        usersData.push(userRow);
      }
    });

    if (usersData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(usersData);
      
      const colWidths = [
        { wch: 20 }, // Customer Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 15 }, // House Number
        { wch: 20 }, // Street
        { wch: 15 }, // District
        { wch: 15 }, // State
        { wch: 10 }, // Pincode
        { wch: 15 }, // Country
        { wch: 12 }, // Total Orders
        { wch: 15 }  // Total Amount Spent
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    }
  }

  static createSummarySheet(wb, orders, tabType) {
    const summaryData = [
      { 'Metric': 'Report Type', 'Value': `${tabType.charAt(0).toUpperCase() + tabType.slice(1)} Cancellation Orders` },
      { 'Metric': 'Generated Date', 'Value': new Date().toLocaleString() },
      { 'Metric': 'Total Orders', 'Value': orders.length },
      { 'Metric': 'Total Products', 'Value': orders.reduce((sum, order) => sum + (order.products?.length || 0), 0) },
      { 'Metric': 'Total Items', 'Value': orders.reduce((sum, order) => 
        sum + order.products?.reduce((productSum, product) => productSum + (product.qty || 0), 0), 0) 
      },
      { 'Metric': 'Total Amount', 'Value': orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) },
      { 'Metric': 'Unique Customers', 'Value': new Set(orders.map(order => order.userDetails?.email).filter(Boolean)).size }
    ];

    // Add status breakdown
    const statusBreakdown = this.getStatusBreakdown(orders);
    statusBreakdown.forEach((status, index) => {
      summaryData.push({ 
        'Metric': `${status.status} Orders`, 
        'Value': status.count 
      });
    });

    // Add payment method breakdown
    const paymentBreakdown = this.getPaymentMethodBreakdown(orders);
    paymentBreakdown.forEach((payment, index) => {
      summaryData.push({ 
        'Metric': `${payment.method} Payments`, 
        'Value': payment.count 
      });
    });

    const ws = XLSX.utils.json_to_sheet(summaryData);
    
    const colWidths = [
      { wch: 30 }, // Metric
      { wch: 20 }  // Value
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
  }

  static flattenProductDetails(product) {
    const details = {};
    
    const productDetails = {
      'RAM': product.ram?.join(', '),
      'Storage': product.storage?.join(', '),
      'Processor': product.processor,
      'Display Size': product.displaySize,
      'Battery': product.battery,
      'Camera': product.camera,
      'Screen Size': product.screenSize,
      'Inches': product.inchs,
      'Skin Type': product.skinType,
      'Hair Type': product.hairType,
      'Fragrance Type': product.fragranceType,
      'Language': product.language,
      'Author': product.author,
      'Genre': product.genre,
      'Format': product.format,
      'Pack Size': product.packSize,
      'Organic': product.organic,
      'Power': product.power,
      'Capacity': product.capacity,
      'Weight': product.weight,
      'Fit': product.fit
    };

    // Only add non-empty details
    Object.entries(productDetails).forEach(([key, value]) => {
      if (value && value !== 'N/A') {
        details[key] = value;
      }
    });

    // Handle extraDetails if present
    if (product.extraDetails && typeof product.extraDetails === 'object') {
      Object.entries(product.extraDetails).forEach(([key, value]) => {
        if (value && value !== 'N/A') {
          details[key] = value;
        }
      });
    }

    return details;
  }

  static getStatusBreakdown(orders) {
    const statusCount = {};
    orders.forEach(order => {
      const status = order.cancellationStatus || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));
  }

  static getPaymentMethodBreakdown(orders) {
    const paymentCount = {};
    orders.forEach(order => {
      const method = order.paymentMethod || 'unknown';
      paymentCount[method] = (paymentCount[method] || 0) + 1;
    });
    
    return Object.entries(paymentCount).map(([method, count]) => ({
      method: method.charAt(0).toUpperCase() + method.slice(1),
      count
    }));
  }

  // Alternative method for more detailed export with warehouse allocations
  static exportDetailedExcel(orders, tabType) {
    try {
      const wb = XLSX.utils.book_new();
      
      // Detailed orders sheet with warehouse allocations
      const detailedOrdersData = orders.map(order => {
        const baseOrderData = {
          'Order ID': order._id || 'N/A',
          'Total Amount': `${order.currency || 'USD'} ${order.totalAmount || 0}`,
          'Cancellation Status': order.cancellationStatus || 'N/A',
          'Cancellation Reason': order.cancellationReason || 'No reason provided',
          'Payment Method': order.paymentMethod || 'N/A',
          'Payment Status': order.paymentStatus || 'Pending',
          'Customer Name': order.userDetails?.name || 'N/A',
          'Customer Email': order.userDetails?.email || 'N/A',
          'Customer Address': this.formatAddress(order.userDetails),
          'Order Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
          'Last Updated': order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A'
        };

        // Add warehouse allocation summary
        const warehouseSummary = this.getWarehouseSummary(order);
        Object.assign(baseOrderData, warehouseSummary);

        return baseOrderData;
      });

      const ws = XLSX.utils.json_to_sheet(detailedOrdersData);
      XLSX.utils.book_append_sheet(wb, ws, 'Detailed Orders');

      // Also create the standard sheets
      this.createProductsSheet(wb, orders, tabType);
      this.createSummarySheet(wb, orders, tabType);

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Detailed_Cancellation_Orders_${tabType}_${timestamp}.xlsx`;
      
      XLSX.writeFile(wb, filename);
      
      return true;
    } catch (error) {
      console.error('Error exporting detailed Excel:', error);
      throw error;
    }
  }

  static formatAddress(userDetails) {
    if (!userDetails) return 'N/A';
    
    const addressParts = [
      userDetails.houseNumber,
      userDetails.street,
      userDetails.district,
      userDetails.state,
      userDetails.pincode,
      userDetails.country
    ].filter(Boolean);
    
    return addressParts.join(', ') || 'N/A';
  }

  static getWarehouseSummary(order) {
    const summary = {
      'Total Warehouses Involved': 0,
      'Warehouse Names': 'N/A',
      'Allocation Types': 'N/A'
    };

    const warehouses = new Set();
    const allocationTypes = new Set();

    order.products?.forEach(product => {
      product.warehouseAllocations?.forEach(allocation => {
        if (allocation.name) warehouses.add(allocation.name);
        if (allocation.warehouseType) allocationTypes.add(allocation.warehouseType);
      });
    });

    if (warehouses.size > 0) {
      summary['Total Warehouses Involved'] = warehouses.size;
      summary['Warehouse Names'] = Array.from(warehouses).join('; ');
      summary['Allocation Types'] = Array.from(allocationTypes).join('; ');
    }

    return summary;
  }
}

export default CancelOrderTabExcel;
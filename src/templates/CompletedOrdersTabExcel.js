import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
export const exportCompletedOrdersToExcel = (orders, warehouseName, setIsExporting, employees = []) => {
  if (!orders || orders.length === 0) {
    toast.error('No completed orders to export');
    return;
  }

  setIsExporting(true);

  try {
    // Prepare summary data for main sheet
    const summaryData = orders.map((order, index) => {
      const totalQuantity = order.products?.reduce((sum, product) => sum + (product.qty || 0), 0) || 0;
      
      // Find assigned employee
      const assignedEmployee = employees.find(emp => emp._id === order.assignedDeliveryEmployee);
      
      // Format delivery date (scheduled delivery date)
      const deliveryDate = order.deliveryDate 
        ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        : 'Not Scheduled';

      // Format delivered date (actual completion date)
      const deliveredDate = order.deliveredDate 
        ? new Date(order.deliveredDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        : 'Not Available';

      return {
        'SR No': index + 1,
        'Order ID': order._id,
        'Customer Name': order.userDetails?.name || 'N/A',
        'Customer Email': order.userDetails?.email || 'N/A',
        'Customer Phone': `${order.userDetails?.regionCode || ''} ${order.userDetails?.mobile || 'N/A'}`.trim(),
        'Delivery Address': `${order.userDetails?.houseNumber || ''}, ${order.userDetails?.district || ''}, ${order.userDetails?.state || ''}, ${order.userDetails?.pincode || ''}`,
        'Total Products': order.products?.length || 0,
        'Total Quantity': totalQuantity,
        'Total Amount': `${order.totalAmount} ${order.currency}`,
        'Payment Method': order.paymentMethod || 'N/A',
        'Payment Status': order.paymentStatus || 'N/A',
        'Delivery Employee': assignedEmployee?.name || 'Not Assigned',
        'Employee ID': assignedEmployee?.deliveryEmployee?.employeeId || 'Not Assigned',
        
        // Both delivery dates
        'Scheduled Delivery Date': deliveryDate,
        'Actual Delivered Date': deliveredDate,
        
        'Order Completion Status': 'Completed',
        'Warehouse': warehouseName
      };
    });

    // Prepare detailed product data
    const productDetailsData = [];
    orders.forEach((order, orderIndex) => {
      order.products?.forEach((product, productIndex) => {
        // Find assigned employee
        const assignedEmployee = employees.find(emp => emp._id === order.assignedDeliveryEmployee);
        
        // Format delivery dates
        const deliveryDate = order.deliveryDate 
          ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          : 'Not Scheduled';

        const deliveredDate = order.deliveredDate 
          ? new Date(order.deliveredDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          : 'Not Available';

        // Get warehouse allocations
        const mainWarehouseAlloc = product.warehouseAllocations?.find(
          alloc => alloc.warehouseType === "Main Warehouse"
        );

        productDetailsData.push({
          'Order SR No': orderIndex + 1,
          'Order ID': order._id,
          'Customer Name': order.userDetails?.name || 'N/A',
          'Customer Email': order.userDetails?.email || 'N/A',
          'Customer Phone': `${order.userDetails?.regionCode || ''} ${order.userDetails?.mobile || 'N/A'}`.trim(),
          'Delivery Address': `${order.userDetails?.houseNumber || ''}, ${order.userDetails?.district || ''}, ${order.userDetails?.state || ''}, ${order.userDetails?.pincode || ''}`,
          'Payment Method': order.paymentMethod || 'N/A',
          'Payment Status': order.paymentStatus || 'N/A',
          'Total Amount': `${order.totalAmount} ${order.currency}`,
          'Delivery Employee': assignedEmployee?.name || 'Not Assigned',
          'Employee ID': assignedEmployee?.deliveryEmployee?.employeeId || 'Not Assigned',
          
          // Both delivery dates
          'Scheduled Delivery Date': deliveryDate,
          'Actual Delivered Date': deliveredDate,
          
          'Product Name': product.name || 'N/A',
          'Product ID': product.productId || product._id || 'N/A',
          'Product Quantity': product.qty || 0,
          'Category': product.category || 'N/A',
          'Sub Category': product.subCategory || 'N/A',
          'Sub Sub Category': product.subSubCategory || 'N/A',
          'Original Price': product.originalPrice || 0,
          'Discount Percentage': product.discount || 0,
          'Discounted Price': product.discountedPrice || 0,
          'Line Total': product.total || 0,
          'Currency': order.currency || 'INR',
          'Main Warehouse': mainWarehouseAlloc?.name || 'N/A',
          'Main Warehouse Qty': mainWarehouseAlloc?.qty || 0,
          'Order Status': 'Completed',
          'Warehouse': warehouseName
        });
      });
    });

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [
      { wch: 8 },   // SR No
      { wch: 20 },  // Order ID
      { wch: 20 },  // Customer Name
      { wch: 25 },  // Customer Email
      { wch: 15 },  // Customer Phone
      { wch: 40 },  // Delivery Address
      { wch: 12 },  // Total Products
      { wch: 12 },  // Total Quantity
      { wch: 15 },  // Total Amount
      { wch: 15 },  // Payment Method
      { wch: 15 },  // Payment Status
      { wch: 20 },  // Delivery Employee
      { wch: 20 },  // Employee ID
      
      // Both delivery date columns
      { wch: 22 },  // Scheduled Delivery Date
      { wch: 22 },  // Actual Delivered Date
      
      { wch: 18 },  // Order Completion Status
      { wch: 20 }   // Warehouse
    ];

    // Product Details Sheet
    if (productDetailsData.length > 0) {
      const productsWs = XLSX.utils.json_to_sheet(productDetailsData);
      productsWs['!cols'] = [
        { wch: 10 },  // Order SR No
        { wch: 20 },  // Order ID
        { wch: 20 },  // Customer Name
        { wch: 25 },  // Customer Email
        { wch: 15 },  // Customer Phone
        { wch: 40 },  // Delivery Address
        { wch: 15 },  // Payment Method
        { wch: 15 },  // Payment Status
        { wch: 15 },  // Total Amount
        { wch: 20 },  // Delivery Employee
        { wch: 20 },  // Employee ID
        
        // Both delivery date columns
        { wch: 22 },  // Scheduled Delivery Date
        { wch: 22 },  // Actual Delivered Date
        
        { wch: 25 },  // Product Name
        { wch: 20 },  // Product ID
        { wch: 12 },  // Product Quantity
        { wch: 15 },  // Category
        { wch: 15 },  // Sub Category
        { wch: 15 },  // Sub Sub Category
        { wch: 12 },  // Original Price
        { wch: 12 },  // Discount Percentage
        { wch: 12 },  // Discounted Price
        { wch: 12 },  // Line Total
        { wch: 8 },   // Currency
        { wch: 20 },  // Main Warehouse
        { wch: 12 },  // Main Warehouse Qty
        { wch: 15 },  // Order Status
        { wch: 20 }   // Warehouse
      ];

      // Apply styles to product details sheet
      const productHeaderRange = XLSX.utils.decode_range(productsWs['!ref']);
      for (let C = productHeaderRange.s.c; C <= productHeaderRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!productsWs[address]) continue;
        productsWs[address].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2E86AB" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "1E3C72" } },
            left: { style: "thin", color: { rgb: "1E3C72" } },
            bottom: { style: "thin", color: { rgb: "1E3C72" } },
            right: { style: "thin", color: { rgb: "1E3C72" } }
          }
        };
      }

      XLSX.utils.book_append_sheet(wb, productsWs, 'Product Details');
    }

    // Apply styles to summary sheet
    const summaryHeaderRange = XLSX.utils.decode_range(summaryWs['!ref']);
    for (let C = summaryHeaderRange.s.c; C <= summaryHeaderRange.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!summaryWs[address]) continue;
      summaryWs[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2E86AB" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "1E3C72" } },
          left: { style: "thin", color: { rgb: "1E3C72" } },
          bottom: { style: "thin", color: { rgb: "1E3C72" } },
          right: { style: "thin", color: { rgb: "1E3C72" } }
        }
      };
    }

    // Add summary sheet to workbook
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Completed Orders Summary');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const safeWarehouseName = warehouseName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Completed_Orders_${safeWarehouseName}_${timestamp}.xlsx`;

    // Export to Excel
    XLSX.writeFile(wb, filename);

    console.log(`Exported ${summaryData.length} completed orders and ${productDetailsData.length} products to Excel`);

  } catch (error) {
    console.error('Error exporting completed orders to Excel:', error);
    toast.error('Error exporting completed orders to Excel. Please try again.');
  } finally {
    setIsExporting(false);
  }
};
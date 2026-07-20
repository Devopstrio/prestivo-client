import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
export const exportDeliveryOrdersToExcel = (orders, warehouseName, setIsExporting, employees = []) => {
  if (!orders || orders.length === 0) {
    toast.error('No delivery orders to export');
    return;
  }

  setIsExporting(true);

  try {
    // Debug: Log the employees array and orders to see what we're working with
    console.log('Employees array in export:', employees);
    console.log('Orders to export:', orders);

    // Prepare summary data for main sheet with enhanced payment and employee info
    const summaryData = orders.map((order, index) => {
      const totalQuantity = order.products?.reduce((sum, product) => sum + (product.qty || 0), 0) || 0;
      
      // Enhanced payment information
      const paymentInfo = {
        method: order.paymentMethod || 'N/A',
        status: order.paymentStatus || 'N/A',
        amount: `${order.totalAmount} ${order.currency}`,
        paymentDate: order.paymentDate ? new Date(order.paymentDate).toLocaleDateString() : 'N/A'
      };

      // Enhanced assigned employee information with name - ADD DEBUGGING
      const assignedEmployee = employees.find(emp => {
        const match = emp._id === order.assignedDeliveryEmployee;
        console.log(`Employee lookup for order ${order._id}:`, {
          employeeId: emp._id,
          assignedDeliveryEmployee: order.assignedDeliveryEmployee,
          match: match,
          employeeName: emp.name
        });
        return match;
      });
      
      console.log(`Order ${order._id} - Assigned Employee:`, {
        assignedDeliveryEmployee: order.assignedDeliveryEmployee,
        foundEmployee: assignedEmployee,
        employeeName: assignedEmployee?.name || 'Not Found'
      });

      const employeeInfo = {
        assigned: order.assignedDeliveryEmployee ? 'Yes' : 'No',
        employeeId: assignedEmployee?.deliveryEmployee?.employeeId || 'Not Assigned',
        employeeName: assignedEmployee?.name || 'Not Assigned',
        assignmentDate: order.deliveryAssignmentDate ? new Date(order.deliveryAssignmentDate).toLocaleDateString() : 'N/A'
      };

      // Delivery date information
      const deliveryDateInfo = {
        deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : 'Not Scheduled'
      };

      return {
        'SR No': index + 1,
        'Order ID': order._id,
        'Customer Name': order.userDetails?.name || 'N/A',
        'Customer Email': order.userDetails?.email || 'N/A',
        'Customer Phone': `${order.userDetails?.regionCode || ''} ${order.userDetails?.mobile || 'N/A'}`.trim(),
        'Total Products': order.products?.length || 0,
        'Total Quantity': totalQuantity,
        
        // Enhanced Payment Information (Transaction ID removed)
        'Payment Method': paymentInfo.method,
        'Payment Status': paymentInfo.status,
        'Total Amount': paymentInfo.amount,
        'Payment Date': paymentInfo.paymentDate,
        
        // Enhanced Delivery Information with Employee Name
        'Delivery Address': `${order.userDetails?.houseNumber || ''}, ${order.userDetails?.district || ''}, ${order.userDetails?.state || ''}, ${order.userDetails?.pincode || ''}`,
        'Employee Assigned': employeeInfo.assigned,
        'Employee Name': employeeInfo.employeeName,
        'Employee ID': employeeInfo.employeeId,
        'Assignment Date': employeeInfo.assignmentDate,
        
        // Delivery Date Column
        'Delivery Date': deliveryDateInfo.deliveryDate,
        
        'Delivery Status': 'Ready for Delivery',
        'Current Warehouse': warehouseName
      };
    });

    // Prepare detailed product data for separate sheet with enhanced information
    const productDetailsData = [];
    orders.forEach((order, orderIndex) => {
      order.products?.forEach((product, productIndex) => {
        // Customer contact information
        const customerEmail = order.userDetails?.email || 'N/A';
        const customerPhone = `${order.userDetails?.regionCode || ''} ${order.userDetails?.mobile || 'N/A'}`.trim();
        const customerAddress = `${order.userDetails?.houseNumber || ''}, ${order.userDetails?.district || ''}, ${order.userDetails?.state || ''}, ${order.userDetails?.pincode || ''}`;

        // Enhanced payment information (Transaction ID removed)
        const paymentInfo = {
          method: order.paymentMethod || 'N/A',
          status: order.paymentStatus || 'N/A',
          currency: order.currency || 'INR'
        };

        // Enhanced employee information with name - ADD DEBUGGING HERE TOO
        const assignedEmployee = employees.find(emp => emp._id === order.assignedDeliveryEmployee);
        console.log(`Product details - Order ${order._id} employee lookup:`, {
          employeeId: order.assignedDeliveryEmployee,
          foundEmployee: assignedEmployee,
          employeeName: assignedEmployee?.name
        });

        const employeeInfo = {
          assigned: order.assignedDeliveryEmployee ? 'Yes' : 'No',
          employeeId: assignedEmployee?.deliveryEmployee?.employeeId || 'Not Assigned',
          employeeName: assignedEmployee?.name || 'Not Assigned'
        };

        // Delivery date information
        const deliveryDateInfo = {
          deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : 'Not Scheduled'
        };

        // Get warehouse allocations
        const mainWarehouseAlloc = product.warehouseAllocations?.find(
          alloc => alloc.warehouseType === "Main Warehouse"
        );
        const remainingWarehouseAlloc = product.warehouseAllocations?.find(
          alloc => alloc.warehouseType === "Remaining Warehouse"
        );

        productDetailsData.push({
          // Order Information (Order Date removed)
          'Order SR No': orderIndex + 1,
          'Order ID': order._id,
          
          // Customer Contact Information
          'Customer Name': order.userDetails?.name || 'N/A',
          'Customer Email': customerEmail,
          'Customer Phone': customerPhone,
          'Customer Address': customerAddress,
          
          // Enhanced Payment Information (Transaction ID removed)
          'Payment Method': paymentInfo.method,
          'Payment Status': paymentInfo.status,
          'Payment Currency': paymentInfo.currency,
          
          // Enhanced Employee Information with Name
          'Employee Assigned': employeeInfo.assigned,
          'Employee Name': employeeInfo.employeeName,
          'Assigned Employee ID': employeeInfo.employeeId,
          
          // Delivery Date
          'Delivery Date': deliveryDateInfo.deliveryDate,
          
          // Product Information
          'Product Name': product.name || 'N/A',
          'Product ID': product.productId || product._id || 'N/A',
          'Product Quantity': product.qty || 0,
          
          // Category Information
          'Category': product.category || 'N/A',
          'Sub Category': product.subCategory || 'N/A',
          'Sub Sub Category': product.subSubCategory || 'N/A',
          
          // Pricing Information
          'Original Price': product.originalPrice || 0,
          'Discount Percentage': product.discount || 0,
          'Discounted Price': product.discountedPrice || 0,
          'Line Total': product.total || 0,
          'Currency': order.currency || 'INR',
          
          // Warehouse Allocations
          'Main Warehouse': mainWarehouseAlloc?.name || 'N/A',
          'Main Warehouse Qty': mainWarehouseAlloc?.qty || 0,
          'Remaining Warehouse': remainingWarehouseAlloc?.name || 'N/A',
          'Remaining Warehouse Qty': remainingWarehouseAlloc?.qty || 0,
          
          // Delivery Information
          'Delivery Status': 'Ready for Delivery',
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
      { wch: 12 },  // Total Products
      { wch: 12 },  // Total Quantity
      
      // Payment Information Columns (Transaction ID removed)
      { wch: 15 },  // Payment Method
      { wch: 15 },  // Payment Status
      { wch: 15 },  // Total Amount
      { wch: 12 },  // Payment Date
      
      // Delivery Information Columns with Employee Name
      { wch: 40 },  // Delivery Address
      { wch: 15 },  // Employee Assigned
      { wch: 20 },  // Employee Name
      { wch: 20 },  // Employee ID
      { wch: 15 },  // Assignment Date
      { wch: 20 },  // Delivery Date
      { wch: 18 },  // Delivery Status
      { wch: 20 }   // Current Warehouse
    ];

    // Product Details Sheet
    if (productDetailsData.length > 0) {
      const productsWs = XLSX.utils.json_to_sheet(productDetailsData);
      productsWs['!cols'] = [
        // Order Information (Order Date removed)
        { wch: 10 },  // Order SR No
        { wch: 20 },  // Order ID
        
        // Customer Contact Information
        { wch: 20 },  // Customer Name
        { wch: 25 },  // Customer Email
        { wch: 15 },  // Customer Phone
        { wch: 40 },  // Customer Address
        
        // Enhanced Payment Information (Transaction ID removed)
        { wch: 15 },  // Payment Method
        { wch: 15 },  // Payment Status
        { wch: 12 },  // Payment Currency
        
        // Enhanced Employee Information with Name
        { wch: 15 },  // Employee Assigned
        { wch: 20 },  // Employee Name
        { wch: 20 },  // Assigned Employee ID
        
        // Delivery Date
        { wch: 20 },  // Delivery Date
        
        // Product Information
        { wch: 25 },  // Product Name
        { wch: 20 },  // Product ID
        { wch: 12 },  // Product Quantity
        
        // Category Information
        { wch: 15 },  // Category
        { wch: 15 },  // Sub Category
        { wch: 15 },  // Sub Sub Category
        
        // Pricing Information
        { wch: 12 },  // Original Price
        { wch: 12 },  // Discount Percentage
        { wch: 12 },  // Discounted Price
        { wch: 12 },  // Line Total
        { wch: 8 },   // Currency
        
        // Warehouse Allocations
        { wch: 20 },  // Main Warehouse
        { wch: 12 },  // Main Warehouse Qty
        { wch: 22 },  // Remaining Warehouse
        { wch: 15 },  // Remaining Warehouse Qty
        
        // Delivery Information
        { wch: 18 },  // Delivery Status
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
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Delivery Orders Summary');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const safeWarehouseName = warehouseName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Delivery_Orders_${safeWarehouseName}_${timestamp}.xlsx`;

    // Export to Excel
    XLSX.writeFile(wb, filename);

    console.log(`Exported ${summaryData.length} delivery orders and ${productDetailsData.length} products to Excel`);

  } catch (error) {
    console.error('Error exporting delivery orders to Excel:', error);
    toast.error('Error exporting delivery orders to Excel. Please try again.');
  } finally {
    setIsExporting(false);
  }
};
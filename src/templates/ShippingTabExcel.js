import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
export const exportShippingOrdersToExcel = (orders, warehouseName, setIsExporting) => {
  if (!orders || orders.length === 0) {
    toast.error('No shipping orders to export');
    return;
  }

  setIsExporting(true);

  try {
    // Prepare summary data for main sheet
    const summaryData = orders.map((order, index) => {
      const totalQuantity = order.products?.reduce((sum, product) => sum + (product.qty || 0), 0) || 0;
      
      // Extract warehouse allocation information
      const mainWarehouseAllocations = [];
      const remainingWarehouseAllocations = [];
      
      order.products?.forEach(product => {
        product.warehouseAllocations?.forEach(allocation => {
          if (allocation.warehouseType === "Main Warehouse") {
            mainWarehouseAllocations.push({
              name: allocation.name || 'Main Warehouse',
              quantity: allocation.qty || 0
            });
          } else if (allocation.warehouseType === "Remaining Warehouse") {
            remainingWarehouseAllocations.push({
              name: allocation.name || 'Remaining Warehouse',
              quantity: allocation.qty || 0
            });
          }
        });
      });

      // Get unique warehouse names
      const mainWarehouseNames = [...new Set(mainWarehouseAllocations.map(a => a.name))];
      const remainingWarehouseNames = [...new Set(remainingWarehouseAllocations.map(a => a.name))];

      // Calculate total quantities per warehouse type
      const mainWarehouseQty = mainWarehouseAllocations.reduce((sum, a) => sum + a.quantity, 0);
      const remainingWarehouseQty = remainingWarehouseAllocations.reduce((sum, a) => sum + a.quantity, 0);

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
        'Payment Method': order.paymentMethod,
        'Payment Status': order.paymentStatus,
        'Shipping Status': order.shippingCompleted ? 'Completed' : 'Pending',
        'Main Warehouse Names': mainWarehouseNames.join(', '),
        'Main Warehouse Quantity': mainWarehouseQty,
        'Remaining Warehouse Names': remainingWarehouseNames.join(', '),
        'Remaining Warehouse Quantity': remainingWarehouseQty,
        'Current Warehouse': warehouseName,
      };
    });

    // Prepare detailed product data
    const productDetailsData = [];
    orders.forEach((order, orderIndex) => {
      order.products?.forEach((product, productIndex) => {
        // Extract warehouse allocations for this product
        const mainWarehouseAllocs = product.warehouseAllocations?.filter(
          alloc => alloc.warehouseType === "Main Warehouse"
        ) || [];
        
        const remainingWarehouseAllocs = product.warehouseAllocations?.filter(
          alloc => alloc.warehouseType === "Remaining Warehouse"
        ) || [];

        // Get main warehouse allocation (first one if multiple)
        const mainWarehouseAlloc = mainWarehouseAllocs[0];
        const remainingWarehouseAlloc = remainingWarehouseAllocs[0];

        // Ensure productId is properly accessed
        const productId = product.productId || product._id || 'N/A';

        // Get product specifications
        const productSize = product.selectedSize || product.size || product.sizeInches || product.dimensions || 'N/A';
        const productRAM = product.ram || product.memory || product.RAM || 'N/A';
        const productStorageType = product.storageType || product.storage || product.storageCapacity || 'N/A';

        productDetailsData.push({
          // Order Information
          'Order SR No': orderIndex + 1,
          'Order ID': order._id,
          
          // Customer Information
          'Customer Name': order.userDetails?.name || 'N/A',
          'Customer Email': order.userDetails?.email || 'N/A',
          'Customer Phone': `${order.userDetails?.regionCode || ''} ${order.userDetails?.mobile || 'N/A'}`.trim(),
          'Delivery Address': `${order.userDetails?.houseNumber || ''}, ${order.userDetails?.district || ''}, ${order.userDetails?.state || ''}, ${order.userDetails?.pincode || ''}`,
          
          // Payment Information
          'Payment Method': order.paymentMethod,
          'Payment Status': order.paymentStatus,
          'Total Amount': `${order.totalAmount} ${order.currency}`,
          'Shipping Status': order.shippingCompleted ? 'Completed' : 'Pending',
          
          // Product Information
          'Product Name': product.name || 'N/A',
          'Product ID': productId,
          'Product Quantity': product.qty || 0,
          
          // Category Information
          'Category': product.category || 'N/A',
          'Sub Category': product.subCategory || 'N/A',
          'Sub Sub Category': product.subSubCategory || 'N/A',
          
          // Product Specifications
          'Product Size': productSize,
          'RAM': productRAM,
          'Storage Type': productStorageType,
          'Color': product.color || 'N/A',
          'Brand': product.brand || 'N/A',
          'Material': product.material || 'N/A',
          'Weight': product.weight || 'N/A',
          
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
          'Current Warehouse': warehouseName
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
      { wch: 15 },  // Shipping Status
      { wch: 25 },  // Main Warehouse Names
      { wch: 15 },  // Main Warehouse Quantity
      { wch: 25 },  // Remaining Warehouse Names
      { wch: 18 },  // Remaining Warehouse Quantity
      { wch: 20 },  // Current Warehouse
    ];

    // Product Details Sheet
    if (productDetailsData.length > 0) {
      const productsWs = XLSX.utils.json_to_sheet(productDetailsData);
      productsWs['!cols'] = [
        // Order Information
        { wch: 10 },  // Order SR No
        { wch: 20 },  // Order ID
        
        // Customer Information
        { wch: 20 },  // Customer Name
        { wch: 25 },  // Customer Email
        { wch: 15 },  // Customer Phone
        { wch: 40 },  // Delivery Address
        
        // Payment Information
        { wch: 15 },  // Payment Method
        { wch: 15 },  // Payment Status
        { wch: 15 },  // Total Amount
        { wch: 15 },  // Shipping Status
        
        // Product Information
        { wch: 25 },  // Product Name
        { wch: 20 },  // Product ID
        { wch: 12 },  // Product Quantity
        
        // Category Information
        { wch: 15 },  // Category
        { wch: 15 },  // Sub Category
        { wch: 15 },  // Sub Sub Category
        
        // Product Specifications
        { wch: 15 },  // Product Size
        { wch: 12 },  // RAM
        { wch: 15 },  // Storage Type
        { wch: 12 },  // Color
        { wch: 15 },  // Brand
        { wch: 15 },  // Material
        { wch: 12 },  // Weight
        
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
        { wch: 20 }   // Current Warehouse
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
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Shipping Orders Summary');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const safeWarehouseName = warehouseName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Shipping_Orders_${safeWarehouseName}_${timestamp}.xlsx`;

    // Export to Excel
    XLSX.writeFile(wb, filename);

    console.log(`Exported ${summaryData.length} shipping orders and ${productDetailsData.length} products to Excel`);

  } catch (error) {
    console.error('Error exporting shipping orders to Excel:', error);
    toast.error('Error exporting shipping orders to Excel. Please try again.');
  } finally {
    setIsExporting(false);
  }
};
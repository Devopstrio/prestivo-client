import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
export const exportShippingOrdersToExcel = (orders, exportType, setIsExporting) => {
  if (!orders || orders.length === 0) {
    toast.error(`No ${exportType.toLowerCase()} orders to export`);
    return;
  }

  setIsExporting(true);

  try {
    // Prepare summary data for main sheet
    const summaryData = orders.map((order, index) => {
      const totalQuantity = order.products?.reduce((sum, product) => sum + (product.qty || 0), 0) || 0;
      
      // Customer address information
      const customerAddress = order.userDetails ? 
        `${order.userDetails.houseNumber || ''}, ${order.userDetails.district || ''}, ${order.userDetails.state || ''}, ${order.userDetails.pincode || ''}` : 
        'N/A';

      // Order dates
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
      const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Not Scheduled';

      return {
        'SR No': index + 1,
        'Order ID': order._id,
        'Order Date': orderDate,
        'Order Status': order.shippingCompleted ? 'Completed' : 'Pending',
        'Shipping Status': order.shippingCompleted ? 'Shipped' : 'Processing',
        
        // Customer Information
        'Customer Name': order.userDetails?.name || 'N/A',
        'Customer Email': order.userDetails?.email || 'N/A',
        'Customer Phone': `${order.userDetails?.regionCode || ''} ${order.userDetails?.mobile || 'N/A'}`.trim(),
        'Customer Address': customerAddress,
        
        // Payment Information
        'Payment Method': order.paymentMethod || 'N/A',
        'Payment Status': order.paymentStatus || 'N/A',
        'Total Amount': `${order.totalAmount} ${order.currency}`,
        
        // Product Summary
        'Total Products': order.products?.length || 0,
        'Total Quantity': totalQuantity,
        
        // Delivery Information
        'Delivery Date': deliveryDate,
        'Delivery Status': order.shippingCompleted ? 'Delivered' : 'Pending'
      };
    });

    // Prepare detailed product data for separate sheet
    const productDetailsData = [];
    orders.forEach((order, orderIndex) => {
      order.products?.forEach((product, productIndex) => {
        // Customer information
        const customerAddress = order.userDetails ? 
          `${order.userDetails.houseNumber || ''}, ${order.userDetails.district || ''}, ${order.userDetails.state || ''}, ${order.userDetails.pincode || ''}` : 
          'N/A';

        // Warehouse allocations
        const mainWarehouseAlloc = product.warehouseAllocations?.find(
          alloc => alloc.warehouseType === "Main Warehouse"
        );
        const remainingWarehouseAlloc = product.warehouseAllocations?.find(
          alloc => alloc.warehouseType === "Remaining Warehouse"
        );

        // Order dates
        const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
        const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Not Scheduled';

        // Get product specifications with multiple field name variations
        const productSize = product.selectedSize || product.size || product.sizeInches || product.dimensions || 'N/A';
        const productRAM = product.ram || product.memory || product.RAM || 'N/A';
        const productStorageType = product.storageType || product.storage || product.storageCapacity || 'N/A';

        productDetailsData.push({
          // Order Information
          'Order SR No': orderIndex + 1,
          'Order ID': order._id,
          'Order Date': orderDate,
          'Order Status': order.shippingCompleted ? 'Completed' : 'Pending',
          'Shipping Status': order.shippingCompleted ? 'Shipped' : 'Processing',
          
          // Customer Information
          'Customer Name': order.userDetails?.name || 'N/A',
          'Customer Email': order.userDetails?.email || 'N/A',
          'Customer Phone': `${order.userDetails?.regionCode || ''} ${order.userDetails?.mobile || 'N/A'}`.trim(),
          'Customer Address': customerAddress,
          
          // Payment Information
          'Payment Method': order.paymentMethod || 'N/A',
          'Payment Status': order.paymentStatus || 'N/A',
          'Total Order Amount': `${order.totalAmount} ${order.currency}`,
          
          // Product Information
          'Product SR No': productIndex + 1,
          'Product Name': product.name || 'N/A',
          'Product ID': product.productId || 'N/A',
          'Product Category': product.category || 'N/A',
          'Product Sub Category': product.subCategory || 'N/A',
          'Product Brand': product.brand || 'N/A',
          
          // Product Specifications
          'Size': productSize,
          'RAM': productRAM,
          'Storage Type': productStorageType,
          'Product Color': product.color || 'N/A',
          'Product Material': product.material || 'N/A',
          'Product Weight': product.weight || 'N/A',
          'Product Quantity': product.qty || 0,
          
          // Pricing Information
          'Original Price': product.originalPrice || 0,
          'Discount Percentage': product.discount || 0,
          'Discounted Price': product.discountedPrice || 0,
          'Line Total': product.total || 0,
          'Currency': order.currency || 'GBP',
          
          // Warehouse Allocations
          'Main Warehouse': mainWarehouseAlloc?.name || 'N/A',
          'Main Warehouse Qty': mainWarehouseAlloc?.qty || 0,
          'Remaining Warehouse': remainingWarehouseAlloc?.name || 'N/A',
          'Remaining Warehouse Qty': remainingWarehouseAlloc?.qty || 0,
          'Warehouse Manager': mainWarehouseAlloc?.warehouseManager?.name || 'N/A',
          
          // Delivery Information
          'Delivery Date': deliveryDate,
          'Delivery Status': order.shippingCompleted ? 'Delivered' : 'Pending'
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
      { wch: 12 },  // Order Date
      { wch: 15 },  // Order Status
      { wch: 15 },  // Shipping Status
      { wch: 20 },  // Customer Name
      { wch: 25 },  // Customer Email
      { wch: 15 },  // Customer Phone
      { wch: 40 },  // Customer Address
      { wch: 15 },  // Payment Method
      { wch: 15 },  // Payment Status
      { wch: 15 },  // Total Amount
      { wch: 12 },  // Total Products
      { wch: 12 },  // Total Quantity
      { wch: 15 },  // Delivery Date
      { wch: 15 }   // Delivery Status
    ];

    // Product Details Sheet
    if (productDetailsData.length > 0) {
      const productsWs = XLSX.utils.json_to_sheet(productDetailsData);
      productsWs['!cols'] = [
        // Order Information
        { wch: 10 },  // Order SR No
        { wch: 20 },  // Order ID
        { wch: 12 },  // Order Date
        { wch: 15 },  // Order Status
        { wch: 15 },  // Shipping Status
        
        // Customer Information
        { wch: 20 },  // Customer Name
        { wch: 25 },  // Customer Email
        { wch: 15 },  // Customer Phone
        { wch: 40 },  // Customer Address
        
        // Payment Information
        { wch: 15 },  // Payment Method
        { wch: 15 },  // Payment Status
        { wch: 15 },  // Total Order Amount
        
        // Product Basic Information
        { wch: 10 },  // Product SR No
        { wch: 25 },  // Product Name
        { wch: 20 },  // Product ID
        { wch: 15 },  // Product Category
        { wch: 15 },  // Product Sub Category
        { wch: 15 },  // Product Brand
        
        // Product Specifications
        { wch: 15 },  // Product Size
        { wch: 12 },  // RAM
        { wch: 15 },  // Storage Type
        { wch: 12 },  // Product Color
        { wch: 15 },  // Product Material
        { wch: 12 },  // Product Weight
        { wch: 10 },  // Product Quantity
        
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
        { wch: 20 },  // Warehouse Manager
        
        // Delivery Information
        { wch: 15 },  // Delivery Date
        { wch: 15 }   // Delivery Status
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
    XLSX.utils.book_append_sheet(wb, summaryWs, `${exportType} Orders Summary`);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${exportType}_Shipping_Orders_${timestamp}.xlsx`;

    // Export to Excel
    XLSX.writeFile(wb, filename);

    console.log(`Exported ${summaryData.length} ${exportType.toLowerCase()} orders and ${productDetailsData.length} products to Excel`);

  } catch (error) {
    console.error('Error exporting shipping orders to Excel:', error);
    toast.error('Error exporting shipping orders to Excel. Please try again.');
  } finally {
    setIsExporting(false);
  }
};
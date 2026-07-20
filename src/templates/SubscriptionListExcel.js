// SubscriptionListExcel.js - Excel Export Utility
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
/**
 * Export subscription data to Excel format
 * @param {Array} data - Array of subscription objects
 * @param {string} fileName - Name of the Excel file (without extension)
 */
export const exportToExcel = (data, fileName = 'Subscription_List') => {
  if (!data || data.length === 0) {
    toast.error('No data available to export');
    return;
  }

  try {
    // Format data for Excel
    const formattedData = data.map((subscription, index) => ({
      'S.No': index + 1,
      'Subscription ID': subscription.subscriptionId || 'N/A',
      'Customer Name': subscription.name || 'N/A',
      'Email': subscription.email || 'N/A',
      'Plan': subscription.plan || 'N/A',
      'Status': subscription.verifiedStatus ? 'Verified' : 'Pending',
      'Start Date': formatDate(subscription.subscription_start_date),
      'Expiry Date': formatDate(subscription.subscription_expiry_date),
      'Verification Date': subscription.verifiedStatus ? formatDate(new Date().toISOString()) : 'Not Verified',
      'Created At': formatDate(subscription.createdAt),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscriptions');

    // Set column widths for better readability
    const colWidths = [
      { wch: 6 },   // S.No
      { wch: 20 },  // Subscription ID
      { wch: 25 },  // Customer Name
      { wch: 30 },  // Email
      { wch: 15 },  // Plan
      { wch: 12 },  // Status
      { wch: 12 },  // Start Date
      { wch: 12 },  // Expiry Date
      { wch: 15 },  // Verification Date
      { wch: 12 },  // Created At
    ];
    worksheet['!cols'] = colWidths;

    // Add header style (bold)
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: {
          bold: true,
          color: { rgb: 'FFFFFF' }
        },
        fill: {
          fgColor: { rgb: '4361EE' }
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center'
        }
      };
    }

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Excel file "${fileName}.xlsx" downloaded successfully`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Error exporting data to Excel. Please try again.');
  }
};

/**
 * Format date for Excel export
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Export filtered data with custom options
 * @param {Array} data - Array of subscription objects
 * @param {string} fileName - Name of the Excel file
 * @param {Object} options - Export options
 */
export const exportFilteredExcel = (data, fileName = 'Subscription_List', options = {}) => {
  const {
    includeAllFields = true,
    customFields = [],
    filters = {}
  } = options;

  let filteredData = data;

  // Apply additional filters if provided
  if (filters.status) {
    filteredData = filteredData.filter(sub => 
      filters.status === 'verified' ? sub.verifiedStatus : !sub.verifiedStatus
    );
  }

  if (filters.dateRange) {
    filteredData = filteredData.filter(sub => {
      const subDate = new Date(sub.createdAt);
      return subDate >= new Date(filters.dateRange.start) && 
             subDate <= new Date(filters.dateRange.end);
    });
  }

  return exportToExcel(filteredData, fileName);
};

export default {
  exportToExcel,
  exportFilteredExcel
};
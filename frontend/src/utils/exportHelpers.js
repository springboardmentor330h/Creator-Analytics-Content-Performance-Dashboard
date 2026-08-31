// src/utils/exportHelpers.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { api } from '../services/api';

export const exportCompanyReport = async (type = 'pdf', filename) => {
  const reportType = type === 'excel' ? 'excel' : 'pdf';
  const defaultName = reportType === 'excel'
    ? `creatoriq_report_${new Date().toISOString().slice(0, 10)}.xlsx`
    : `creatoriq_report_${new Date().toISOString().slice(0, 10)}.pdf`;

  return api.downloadFile(`/reports/export/${reportType}/1`, filename || defaultName);
};

/**
 * Export tabular content array to a downloadable CSV file.
 */
export const exportToCSV = (data, filename = 'content_performance.csv') => {
  if (!data || !data.length) return;

  const headers = ['Title', 'Platform', 'Views', 'Likes', 'Comments'];

  const rows = data.map((item) => [
    `"${(item.title || '').replace(/"/g, '""')}"`,
    `"${item.platform || ''}"`,
    item.views ?? 0,
    item.likes ?? 0,
    item.comments ?? 0,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Capture a target HTML DOM element and save it as a PDF document.
 */
export const exportToPDF = async (elementId, filename = 'dashboard-report.pdf') => {
  const input = document.getElementById(elementId);
  if (!input) return;

  try {
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF report:', error);
  }
};
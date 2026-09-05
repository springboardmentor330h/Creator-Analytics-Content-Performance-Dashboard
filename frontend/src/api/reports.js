import api from "./axios";

export const generateReport = (creatorId) =>
  api.get("/reports/generate", { params: { creator_id: creatorId } }).then((r) => r.data);

/**
 * Downloads a file (PDF or Excel) by triggering the browser's save dialog.
 * Axios needs responseType: "blob" for binary file downloads to work.
 */
async function downloadFile(url, params, filename) {
  const response = await api.get(url, { params, responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export const downloadReportPdf = (creatorId) =>
  downloadFile("/reports/export/pdf", { creator_id: creatorId }, `creator_${creatorId}_report.pdf`);

export const downloadReportExcel = (creatorId) =>
  downloadFile("/reports/export/excel", { creator_id: creatorId }, `creator_${creatorId}_report.xlsx`);
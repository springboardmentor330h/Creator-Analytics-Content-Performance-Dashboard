import { useState } from "react";
import api from "../api/axios";
import { FileText, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react";

export default function Reports() {
  const [downloading, setDownloading] = useState(null); // "pdf" | "excel" | null
  const [error, setError] = useState("");

  const downloadFile = async (type) => {
    setError("");
    setDownloading(type);
    try {
      const res = await api.get(`/reports/export/${type}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `creatoriq_report.${type === "pdf" ? "pdf" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const label = type === "pdf" ? "PDF" : "Excel";
      setError(`Couldn't generate the ${label} report. Please try again in a moment.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Reports & Export</h2>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 mb-4 text-sm text-red-600 border border-red-100 rounded-xl bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-4 p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <button
          onClick={() => downloadFile("pdf")}
          disabled={downloading !== null}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {downloading === "pdf" ? "Generating..." : "Download PDF Report"}
        </button>
        <button
          onClick={() => downloadFile("excel")}
          disabled={downloading !== null}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading === "excel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          {downloading === "excel" ? "Generating..." : "Download Excel Report"}
        </button>
      </div>
    </div>
  );
}

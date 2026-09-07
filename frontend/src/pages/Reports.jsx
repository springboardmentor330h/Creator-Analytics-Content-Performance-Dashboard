import { useState } from "react";
import { FileText, FileSpreadsheet, Download } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

async function downloadFile(url, filename) {
  const res = await api.get(url, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export default function Reports() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      if (type === "pdf") {
        await downloadFile(`/reports/creator/${user.id}/pdf`, `creator_${user.id}_report.pdf`);
      } else {
        await downloadFile(`/reports/creator/${user.id}/excel`, `creator_${user.id}_report.xlsx`);
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-400">
          Combined performance, audience, and revenue reports — generated live from your data.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col items-start gap-3">
          <FileText size={28} className="text-red-500" />
          <div>
            <p className="font-medium text-slate-800">PDF Report</p>
            <p className="text-xs text-slate-400">Formatted summary, ready to share.</p>
          </div>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={downloading === "pdf"}
            className="flex items-center gap-1 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white px-3 py-2 rounded-lg"
          >
            <Download size={14} /> {downloading === "pdf" ? "Preparing..." : "Download"}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col items-start gap-3">
          <FileSpreadsheet size={28} className="text-emerald-600" />
          <div>
            <p className="font-medium text-slate-800">Excel Report</p>
            <p className="text-xs text-slate-400">Raw sheets for further analysis.</p>
          </div>
          <button
            onClick={() => handleDownload("excel")}
            disabled={downloading === "excel"}
            className="flex items-center gap-1 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white px-3 py-2 rounded-lg"
          >
            <Download size={14} /> {downloading === "excel" ? "Preparing..." : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}

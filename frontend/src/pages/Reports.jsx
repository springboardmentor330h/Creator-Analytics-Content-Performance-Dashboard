import api from "../api/axios";
import { FileText, FileSpreadsheet } from "lucide-react";

export default function Reports() {
  const downloadFile = async (type) => {
    const res = await api.get(`/reports/export/${type}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `creatoriq_report.${type === "pdf" ? "pdf" : "xlsx"}`);
    document.body.appendChild(link); link.click(); link.remove();
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Reports & Export</h2>
      <div className="flex gap-4 p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <button onClick={() => downloadFile("pdf")} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition">
          <FileText className="w-4 h-4" /> Download PDF Report
        </button>
        <button onClick={() => downloadFile("excel")} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition">
          <FileSpreadsheet className="w-4 h-4" /> Download Excel Report
        </button>
      </div>
    </div>
  );
}
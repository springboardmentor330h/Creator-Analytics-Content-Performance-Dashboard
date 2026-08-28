import { useEffect, useState } from "react";
import api from "../api/axios";

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const response = await api.get("/reports/creator");
        setReport(response.data);
      } catch (err) {
        console.error("Reports API Error:", err);
        setError("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  const downloadReport = async (type) => {
    try {
      setDownloading(type);

      const response = await api.get(
        `/reports/creator/${type}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      link.download =
        type === "pdf"
          ? "creator_report.pdf"
          : "creator_report.xlsx";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`${type} download error:`, err);
      alert(`Failed to download ${type.toUpperCase()} report.`);
    } finally {
      setDownloading("");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Reports
        </h1>

        <p className="mt-3 text-slate-500">
          Loading report...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Reports
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    );
  }

  const summary = report?.summary || report || {};

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Reports
        </h1>

        <p className="mt-2 text-slate-500">
          View and export your creator analytics report.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-6 text-xl font-semibold text-slate-800">
          CreatorIQ Analytics Report
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Total Views
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-800">
              {Number(
                summary.total_views || 0
              ).toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Total Likes
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-800">
              {Number(
                summary.total_likes || 0
              ).toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Total Comments
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-800">
              {Number(
                summary.total_comments || 0
              ).toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Total Reach
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-800">
              {Number(
                summary.total_reach || 0
              ).toLocaleString()}
            </p>
          </div>

        </div>

        <div className="mt-8 flex flex-wrap gap-3">

          <button
            onClick={() => downloadReport("pdf")}
            disabled={downloading !== ""}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {downloading === "pdf"
              ? "Downloading..."
              : "Download PDF"}
          </button>

          <button
            onClick={() => downloadReport("excel")}
            disabled={downloading !== ""}
            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {downloading === "excel"
              ? "Downloading..."
              : "Download Excel"}
          </button>

          <button
            onClick={() => window.print()}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Print Report
          </button>

        </div>
      </div>
    </div>
  );
}

export default Reports;
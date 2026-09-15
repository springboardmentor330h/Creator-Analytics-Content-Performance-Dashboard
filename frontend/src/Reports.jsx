import { useEffect, useState } from "react";
import api from "./services/api";
import { useAuth } from "./context/AuthContext";

function Reports() {
  const auth = useAuth();

  const user = auth?.user;
  const checkingSession = auth?.checkingSession ?? false;

  const [reportData, setReportData] = useState(null);
  const [creatorId, setCreatorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const currentCreatorId = user?.id;

  useEffect(() => {
    if (checkingSession) {
      return;
    }

    if (!currentCreatorId) {
      setError("Unable to identify the current creator.");
      setLoading(false);
      return;
    }

    setCreatorId(currentCreatorId);
    fetchReportData(currentCreatorId);
  }, [currentCreatorId, checkingSession]);

  const fetchReportData = async (id) => {
    if (!id) {
      setError("Unable to identify the current creator.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/reports/${id}`);

      setReportData(response.data);
    } catch (err) {
      console.error("Fetch report error:", err);

      setError(
        err.response?.data?.detail || "Failed to load report summary data.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    if (!creatorId) {
      setError("Unable to identify the current creator.");
      return;
    }

    try {
      setDownloadingFormat(format);
      setSuccessMsg("");
      setError("");

      const endpoint = `/reports/${creatorId}/${format}`;

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const fileName =
        format === "pdf"
          ? `creator_${creatorId}_report.pdf`
          : `creator_${creatorId}_report.xlsx`;

      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMsg(
        `Report successfully downloaded as ${format.toUpperCase()}!`,
      );
    } catch (err) {
      console.error(`Download ${format} report error:`, err);

      setError(
        err.response?.data?.detail ||
          `Failed to download ${format.toUpperCase()} report.`,
      );
    } finally {
      setDownloadingFormat(null);
    }
  };

  if (checkingSession || loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Loading Reports...
          </h1>

          <p className="text-gray-500 mt-2">Fetching your creator report.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reports & Exports</h1>

        <p className="text-gray-500 mt-2">
          Generate and download performance reports.
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-green-700 font-medium">{successMsg}</p>

            <button
              onClick={() => setSuccessMsg("")}
              className="text-green-700 font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* PDF */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 text-red-600 rounded-xl px-4 py-3 font-bold">
              PDF
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                PDF Performance Report
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Download a print-ready performance report.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload("pdf")}
            disabled={!creatorId || downloadingFormat === "pdf"}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingFormat === "pdf"
              ? "Generating PDF..."
              : "Download PDF Report"}
          </button>
        </div>

        {/* Excel */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 text-green-700 rounded-xl px-4 py-3 font-bold">
              XLS
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Excel Data Report
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Download detailed report data for analysis.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload("excel")}
            disabled={!creatorId || downloadingFormat === "excel"}
            className="w-full mt-6 bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingFormat === "excel"
              ? "Generating Excel..."
              : "Download Excel Report"}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Live Performance Summary
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Current report data from the backend.
            </p>
          </div>

          <button
            onClick={() => fetchReportData(creatorId)}
            disabled={!creatorId}
            className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh Data
          </button>
        </div>

        {reportData ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Creator ID */}
              <div className="bg-gray-50 border rounded-xl p-5">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Creator ID
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-2">
                  #{reportData.creator_id ?? creatorId}
                </p>
              </div>

              {/* Content */}
              <div className="bg-gray-50 border rounded-xl p-5">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Content Items
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {Array.isArray(reportData.content_performance)
                    ? reportData.content_performance.length
                    : (reportData.total_content ?? 0)}
                </p>
              </div>

              {/* Revenue */}
              <div className="bg-gray-50 border rounded-xl p-5">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Total Revenue
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-2">
                  ₹
                  {Number(
                    reportData.revenue_analytics?.total_revenue ??
                      reportData.total_revenue ??
                      0,
                  ).toLocaleString("en-IN")}
                </p>
              </div>

              {/* Audience */}
              <div className="bg-gray-50 border rounded-xl p-5">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Audience Records
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {Array.isArray(reportData.audience_analytics)
                    ? reportData.audience_analytics.length
                    : 0}
                </p>
              </div>

              {/* Growth */}
              <div className="bg-gray-50 border rounded-xl p-5">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Growth Records
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {Array.isArray(reportData.growth_trends)
                    ? reportData.growth_trends.length
                    : 0}
                </p>
              </div>

              {/* Revenue Sources */}
              <div className="bg-gray-50 border rounded-xl p-5">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Revenue Sources
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {Array.isArray(
                    reportData.revenue_analytics?.revenue_by_source,
                  )
                    ? reportData.revenue_analytics.revenue_by_source.length
                    : 0}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No report data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;

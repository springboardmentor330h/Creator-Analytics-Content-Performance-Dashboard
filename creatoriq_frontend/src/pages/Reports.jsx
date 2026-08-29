import { useState } from "react";
import api from "../services/api";

function Reports() {
  const creatorId = 2;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/reports/creator/${creatorId}`
      );

      setReport(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load creator report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await api.get(
        `/reports/export/pdf/${creatorId}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/pdf",
        })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = `creator_${creatorId}_report.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Unable to download PDF report.");
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await api.get(
        `/reports/export/excel/${creatorId}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = `creator_${creatorId}_report.xlsx`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Unable to download Excel report.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600">
          CreatorIQ Reporting
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Reports
        </h1>

        <p className="mt-2 text-slate-500">
          Generate and download analytics reports for Creator {creatorId}.
        </p>
      </div>

      {/* Report Actions */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">
            Creator
          </div>

          <div className="mt-2 text-3xl font-bold text-slate-900">
            #{creatorId}
          </div>

          <div className="mt-2 text-sm text-green-600">
            ● Connected
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">
            Generate Report
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">
            Export
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={downloadPdf}
              className="flex-1 rounded-xl bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              PDF
            </button>

            <button
              onClick={downloadExcel}
              className="flex-1 rounded-xl bg-green-600 px-3 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Creator Analytics Report
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Report type: {report.report_type}
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Generated
            </span>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Revenue Analytics
            </h3>

            {report.revenue?.revenue_summary && (
              <div className="mt-4 rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Total Revenue
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  ₹
                  {Number(
                    report.revenue.revenue_summary.total_revenue || 0
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </div>

          {/* Revenue Sources */}
          {report.revenue?.revenue_by_source
            ?.revenue_by_source && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900">
                Revenue by Source
              </h3>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 font-semibold">
                        Source
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.revenue.revenue_by_source.revenue_by_source.map(
                      (item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100"
                        >
                          <td className="px-4 py-3">
                            {item.source}
                          </td>

                          <td className="px-4 py-3 font-semibold">
                            ₹
                            {Number(
                              item.amount || 0
                            ).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!report && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-xl font-semibold text-slate-800">
            No report generated yet
          </h2>

          <p className="mt-2 text-slate-500">
            Click "Generate Report" to load your creator analytics.
          </p>
        </div>
      )}
    </div>
  );
}

export default Reports;
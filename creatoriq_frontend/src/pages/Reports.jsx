import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";


const formatNumber = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString("en-IN");
};


const formatPercent = (value) => {
  return `${Number(value || 0).toFixed(2)}%`;
};


const ReportSection = ({
  title,
  children,
}) => {
  return (
    <section className="report-section rounded-[24px] border p-5 shadow-sm">
      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
};


const MetricCard = ({
  label,
  value,
}) => {
  return (
    <div className="report-metric-card rounded-2xl border p-4">
      <p className="text-sm font-medium">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
};


const EmptyData = () => {
  return (
    <p className="report-empty-state rounded-xl p-4 text-sm">
      No data available for this section.
    </p>
  );
};


const DistributionRow = ({
  label,
  value,
}) => {
  return (
    <div className="report-distribution-row flex items-center justify-between gap-4 rounded-xl p-3">
      <span className="min-w-0 truncate">
        {label}
      </span>

      <strong className="shrink-0">
        {value}
      </strong>
    </div>
  );
};


function Reports() {
  const { user } = useAuth();

  const creatorId = user?.id;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState("");
  const [error, setError] = useState("");


  const fetchReport = async () => {
    if (!creatorId) {
      setError("Creator account is not available.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/reports/creator/${creatorId}`
      );

      setReport(response.data);
    } catch (err) {
      console.error(err);

      const status = err?.response?.status;

      if (status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (status === 403) {
        setError(
          "You do not have permission to access this report."
        );
      } else {
        setError(
          "Unable to load creator report."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  const downloadFile = async (
    format
  ) => {
    if (!creatorId) {
      setError("Creator account is not available.");
      return;
    }

    try {
      setExporting(format);
      setError("");

      const isPdf = format === "pdf";

      const endpoint = isPdf
        ? `/reports/export/pdf/${creatorId}`
        : `/reports/export/excel/${creatorId}`;

      const response = await api.get(
        endpoint,
        {
          responseType: "blob",
        }
      );

      const contentType = isPdf
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob(
        [response.data],
        {
          type: contentType,
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = isPdf
        ? `creator_${creatorId}_report.pdf`
        : `creator_${creatorId}_report.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);

      setError(
        `Unable to download ${format.toUpperCase()} report.`
      );
    } finally {
      setExporting("");
    }
  };


  const content =
    report?.content_performance;

  const audience =
    report?.audience_analytics;

  const revenue =
    report?.revenue;

  const growth =
    report?.growth_trends;

  const platform =
    report?.platform_comparison;


  const contentSummary =
    content?.summary || {};

  const audienceSummary =
    audience?.summary || {};

  const revenueSummary =
    revenue?.revenue_summary || {};

  const growthRows =
    growth?.growth_trend || [];

  const platformRows =
    platform?.platform_comparison || {};


  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="dashboard-hero">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">
                CreatorIQ Reporting
              </p>

              <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Reports
              </h1>

              <p className="mt-2 text-sm text-indigo-100/90">
                Generate a complete analytics report from your
                existing CreatorIQ data.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Creator #{creatorId}
            </div>

          </div>
        </div>


        {/* ACTIONS */}

        <div className="grid gap-5 md:grid-cols-3">

          <div className="stat-card stat-card-indigo">
            <p className="text-sm font-medium text-indigo-100">
              Creator
            </p>

            <h2 className="mt-5 text-3xl font-bold text-white">
              #{creatorId}
            </h2>

            <p className="mt-2 text-sm text-indigo-100/90">
              Authenticated creator
            </p>
          </div>


          <div className="stat-card stat-card-sky">
            <p className="text-sm font-medium text-sky-50">
              Report
            </p>

            <button
              onClick={fetchReport}
              disabled={loading || !creatorId}
              className="mt-5 w-full rounded-xl bg-white/15 px-4 py-3 font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              {loading
                ? "Generating..."
                : "Generate Complete Report"}
            </button>
          </div>


          <div className="stat-card stat-card-emerald">
            <p className="text-sm font-medium text-emerald-50">
              Export
            </p>

            <div className="mt-5 flex gap-2">

              <button
                onClick={() =>
                  downloadFile("pdf")
                }
                disabled={exporting !== ""}
                className="flex-1 rounded-xl bg-white/15 px-3 py-3 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-50"
              >
                {exporting === "pdf"
                  ? "..."
                  : "PDF"}
              </button>

              <button
                onClick={() =>
                  downloadFile("excel")
                }
                disabled={exporting !== ""}
                className="flex-1 rounded-xl bg-white/15 px-3 py-3 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-50"
              >
                {exporting === "excel"
                  ? "..."
                  : "Excel"}
              </button>

            </div>
          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            {error}
          </div>
        )}


        {/* EMPTY */}

        {!report &&
          !loading &&
          !error && (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-12 text-center shadow-sm">

              <h2 className="text-xl font-semibold text-slate-800">
                No report generated yet
              </h2>

              <p className="mt-2 text-slate-500">
                Click “Generate Complete Report” to load
                Content, Audience, Revenue, Growth and
                Platform analytics.
              </p>

            </div>
          )}


        {/* REPORT */}

        {report && (
          <div className="report-document space-y-6 rounded-[28px] p-3 sm:p-5">

            <div className="content-table-card">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Creator Analytics Report
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Creator #{report.creator_id}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                  Generated
                </span>

              </div>

            </div>


            {/* CONTENT */}

            <ReportSection title="Content Performance">

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <MetricCard
                  label="Total Content"
                  value={formatNumber(
                    contentSummary.total_content
                  )}
                />

                <MetricCard
                  label="Total Views"
                  value={formatNumber(
                    contentSummary.total_views
                  )}
                />

                <MetricCard
                  label="Total Reach"
                  value={formatNumber(
                    contentSummary.total_reach
                  )}
                />

                <MetricCard
                  label="Engagement Rate"
                  value={formatPercent(
                    contentSummary.average_engagement_rate
                  )}
                />

              </div>


              <div className="mt-6">

                <h4 className="mb-3 font-semibold text-slate-700">
                  Top Content
                </h4>

                {content?.top_content?.length ? (

                  <div className="overflow-x-auto">

                    <table className="dashboard-table w-full text-left">

                      <thead>
                        <tr>
                          <th>Content</th>
                          <th>Platform</th>
                          <th>Views</th>
                          <th>Reach</th>
                          <th>Engagement</th>
                        </tr>
                      </thead>

                      <tbody>
                        {content.top_content.map(
                          (item, index) => (
                            <tr key={index}>
                              <td>
                                {item.content_title}
                              </td>

                              <td>
                                {item.platform}
                              </td>

                              <td>
                                {formatNumber(
                                  item.views
                                )}
                              </td>

                              <td>
                                {formatNumber(
                                  item.reach
                                )}
                              </td>

                              <td>
                                {formatPercent(
                                  item.engagement_rate
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>

                    </table>

                  </div>

                ) : (
                  <EmptyData />
                )}

              </div>

            </ReportSection>


            {/* AUDIENCE */}

            <ReportSection title="Audience Analytics">

              <div className="grid gap-4 sm:grid-cols-3">

                <MetricCard
                  label="Followers"
                  value={formatNumber(
                    audienceSummary.total_followers
                  )}
                />

                <MetricCard
                  label="Reach"
                  value={formatNumber(
                    audienceSummary.total_reach
                  )}
                />

                <MetricCard
                  label="Impressions"
                  value={formatNumber(
                    audienceSummary.total_impressions
                  )}
                />

              </div>


              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                <div>
                  <h4 className="mb-3 font-semibold text-slate-700">
                    Gender Distribution
                  </h4>

                  {Object.keys(
                    audience?.gender_distribution || {}
                  ).length ? (

                    <div className="space-y-2">
                      {Object.entries(
                        audience.gender_distribution
                      ).map(
                        ([key, value]) => (
                          <DistributionRow
                            key={key}
                            label={key}
                            value={formatPercent(value)}
                          />
                        )
                      )}
                    </div>

                  ) : (
                    <EmptyData />
                  )}

                </div>


                <div>
                  <h4 className="mb-3 font-semibold text-slate-700">
                    Age Distribution
                  </h4>

                  {Object.keys(
                    audience?.age_distribution || {}
                  ).length ? (

                    <div className="space-y-2">
                      {Object.entries(
                        audience.age_distribution
                      ).map(
                        ([key, value]) => (
                          <DistributionRow
                            key={key}
                            label={key}
                            value={formatPercent(value)}
                          />
                        )
                      )}
                    </div>

                  ) : (
                    <EmptyData />
                  )}

                </div>

              </div>


              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                <div>
                  <h4 className="mb-3 font-semibold text-slate-700">
                    Top Countries
                  </h4>

                  {audience?.top_countries?.length ? (

                    <div className="space-y-2">
                      {audience.top_countries.map(
                        (item, index) => (
                          <DistributionRow
                            key={index}
                            label={item.country}
                            value={formatNumber(item.count)}
                          />
                        )
                      )}
                    </div>

                  ) : (
                    <EmptyData />
                  )}

                </div>


                <div>
                  <h4 className="mb-3 font-semibold text-slate-700">
                    Device Distribution
                  </h4>

                  {Object.keys(
                    audience?.device_distribution || {}
                  ).length ? (

                    <div className="space-y-2">
                      {Object.entries(
                        audience.device_distribution
                      ).map(
                        ([key, value]) => (
                          <DistributionRow
                            key={key}
                            label={key}
                            value={formatPercent(value)}
                          />
                        )
                      )}
                    </div>

                  ) : (
                    <EmptyData />
                  )}

                </div>

              </div>

            </ReportSection>


            {/* REVENUE */}

            <ReportSection title="Revenue Analytics">

              <div className="grid gap-4 sm:grid-cols-2">

                <MetricCard
                  label="Total Revenue"
                  value={`₹${Number(
                    revenueSummary.total_revenue || 0
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}`}
                />

                <MetricCard
                  label="Revenue Sources"
                  value={formatNumber(
                    revenue?.revenue_by_source
                      ?.revenue_by_source
                      ?.length
                  )}
                />

              </div>


              <div className="mt-6 overflow-x-auto">

                <h4 className="mb-3 font-semibold text-slate-700">
                  Revenue by Source
                </h4>

                {revenue?.revenue_by_source
                  ?.revenue_by_source?.length ? (

                  <table className="dashboard-table w-full text-left">

                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {revenue.revenue_by_source.revenue_by_source.map(
                        (item, index) => (
                          <tr key={index}>
                            <td>
                              {item.source}
                            </td>

                            <td>
                              ₹
                              {Number(
                                item.amount || 0
                              ).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                }
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                ) : (
                  <EmptyData />
                )}

              </div>


              <div className="mt-6 overflow-x-auto">

                <h4 className="mb-3 font-semibold text-slate-700">
                  Monthly Revenue
                </h4>

                {revenue?.monthly_revenue
                  ?.monthly_revenue?.length ? (

                  <table className="dashboard-table w-full text-left">

                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>

                    <tbody>
                      {revenue.monthly_revenue.monthly_revenue.map(
                        (item, index) => (
                          <tr key={index}>
                            <td>
                              {item.month}
                            </td>

                            <td>
                              ₹
                              {Number(
                                item.amount || 0
                              ).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                }
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                ) : (
                  <EmptyData />
                )}

              </div>

            </ReportSection>


            {/* GROWTH */}

            <ReportSection title="Growth Trends">

              {growthRows.length ? (

                <div className="overflow-x-auto">

                  <table className="dashboard-table w-full text-left">

                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Followers</th>
                        <th>Daily Growth</th>
                        <th>Growth %</th>
                        <th>Reach</th>
                        <th>Engagement</th>
                      </tr>
                    </thead>

                    <tbody>
                      {growthRows.map(
                        (item, index) => (
                          <tr key={index}>
                            <td>
                              {item.date}
                            </td>

                            <td>
                              {formatNumber(
                                item.followers
                              )}
                            </td>

                            <td>
                              {formatNumber(
                                item.daily_growth
                              )}
                            </td>

                            <td>
                              {formatPercent(
                                item.growth_percentage
                              )}
                            </td>

                            <td>
                              {formatNumber(
                                item.reach
                              )}
                            </td>

                            <td>
                              {formatPercent(
                                item.engagement_rate
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                </div>

              ) : (
                <EmptyData />
              )}

            </ReportSection>


            {/* PLATFORM */}

            <ReportSection title="Platform Comparison">

              {Object.keys(
                platformRows
              ).length ? (

                <div className="overflow-x-auto">

                  <table className="dashboard-table w-full text-left">

                    <thead>
                      <tr>
                        <th>Platform</th>
                        <th>Views</th>
                        <th>Reach</th>
                        <th>Likes</th>
                        <th>Comments</th>
                        <th>Engagement</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.entries(
                        platformRows
                      ).map(
                        ([platformName, item]) => (
                          <tr key={platformName}>
                            <td className="font-semibold">
                              {platformName}
                            </td>

                            <td>
                              {formatNumber(
                                item.views
                              )}
                            </td>

                            <td>
                              {formatNumber(
                                item.reach
                              )}
                            </td>

                            <td>
                              {formatNumber(
                                item.likes
                              )}
                            </td>

                            <td>
                              {formatNumber(
                                item.comments
                              )}
                            </td>

                            <td>
                              {formatPercent(
                                item.engagement_rate
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                </div>

              ) : (
                <EmptyData />
              )}

            </ReportSection>

          </div>
        )}

      </div>
    </div>
  );
}


export default Reports;


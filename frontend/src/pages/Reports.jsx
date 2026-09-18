import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Reports() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [downloadLoading, setDownloadLoading] =
    useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "N/A";
    }

    return number.toLocaleString("en-IN");
  };

  const formatCurrency = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "N/A";
    }

    return `₹${number.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const extractArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (Array.isArray(value?.data)) {
      return value.data;
    }

    return [];
  };

  const getSummaryValue = (
    summary,
    possibleKeys
  ) => {
    if (!summary || typeof summary !== "object") {
      return null;
    }

    for (const key of possibleKeys) {
      if (
        summary[key] !== undefined &&
        summary[key] !== null
      ) {
        return summary[key];
      }
    }

    return null;
  };

  const fetchReport = async (creatorId) => {
    try {
      setGenerating(true);
      setError("");
      setMessage("");

      const response = await api.get(
        `/reports/${creatorId}`
      );

      const result =
        response.data?.data ?? response.data;

      setReport(result || null);
    } catch (err) {
      console.error(
        "Failed to generate report:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to generate the report. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  const initializeReports = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        navigate("/login", {
          replace: true,
          state: {
            from: {
              pathname: "/reports",
            },
          },
        });

        return;
      }

      const response = await api.get("/auth/me");

      const currentUser =
        response.data?.data ?? response.data;

      if (!currentUser?.id) {
        throw new Error(
          "Unable to identify the authenticated creator."
        );
      }

      setUser(currentUser);

      await fetchReport(currentUser.id);
    } catch (err) {
      console.error(
        "Failed to initialize reports:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        navigate("/login", {
          replace: true,
          state: {
            from: {
              pathname: "/reports",
            },
          },
        });

        return;
      }

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeReports();
  }, []);

  const downloadFile = async (
    type,
    extension
  ) => {
    if (!user?.id) {
      return;
    }

    try {
      setDownloadLoading(type);
      setError("");
      setMessage("");

      const response = await api.get(
        `/reports/${user.id}/${type}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            type === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `creator_report_${user.id}.${extension}`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage(
        `${
          type === "pdf"
            ? "PDF"
            : "Excel"
        } report downloaded successfully.`
      );
    } catch (err) {
      console.error(
        `Failed to download ${type} report:`,
        err
      );

      setError(
        err.response?.data?.detail ||
          `Unable to download the ${type.toUpperCase()} report.`
      );
    } finally {
      setDownloadLoading("");
    }
  };

  const contentPerformance =
    report?.content_performance || {};

  const contentSummary =
    contentPerformance.summary || {};

  const topContent = extractArray(
    contentPerformance.top_content
  );

  const audienceAnalytics =
    report?.audience_analytics || {};

  const revenueAnalytics =
    report?.revenue_analytics || {};

  const growthTrends =
    report?.growth_trends || {};

  const platformComparison = extractArray(
    report?.platform_comparison
  );

  const revenueBySource = extractArray(
    revenueAnalytics.revenue_by_source
  );

  const monthlyRevenue = extractArray(
    revenueAnalytics.monthly_revenue
  );

  const contentMetricCards = useMemo(() => {
    return [
      {
        label: "Total Content",
        value: formatNumber(
          getSummaryValue(
            contentSummary,
            [
              "total_content",
              "total_posts",
              "content_count",
              "total",
            ]
          )
        ),
        icon: "▣",
        classes:
          "bg-purple-500/10 text-purple-400",
      },
      {
        label: "Total Engagement",
        value: formatNumber(
          getSummaryValue(
            contentSummary,
            [
              "total_engagement",
              "engagement",
              "total_interactions",
            ]
          )
        ),
        icon: "♥",
        classes:
          "bg-blue-500/10 text-blue-400",
      },
      {
        label: "Total Views",
        value: formatNumber(
          getSummaryValue(
            contentSummary,
            [
              "total_views",
              "views",
              "total_reach",
            ]
          )
        ),
        icon: "◉",
        classes:
          "bg-cyan-500/10 text-cyan-400",
      },
      {
        label: "Total Revenue",
        value: formatCurrency(
          revenueAnalytics.total_revenue
        ),
        icon: "₹",
        classes:
          "bg-emerald-500/10 text-emerald-400",
      },
    ];
  }, [
    contentSummary,
    revenueAnalytics.total_revenue,
  ]);

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-white/5" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl border border-white/10 bg-[#151515]"
            />
          ))}
        </div>

        <div className="h-32 animate-pulse rounded-xl border border-white/10 bg-[#151515]" />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-xl border border-white/10 bg-[#151515]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Generate and export your CreatorIQ analytics report.
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              !
            </div>

            <div>
              <h2 className="font-semibold text-red-400">
                Unable to load report
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {error}
              </p>

              <button
                onClick={initializeReports}
                className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500"
              >
                Try Again
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Generate, review, and export your complete CreatorIQ analytics report.
          </p>

          {user?.email && (
            <p className="mt-2 text-xs text-gray-600">
              Report for {user.email}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            onClick={() =>
              user?.id &&
              fetchReport(user.id)
            }
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#151515] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {generating
              ? "Generating..."
              : "Generate Report"}
          </button>

        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          {message}
        </div>
      )}

      {error && report && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Export Card */}
      <div className="rounded-xl border border-white/10 bg-[#151515] p-6">

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M6 2h9l4 4v16H6z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M14 2v5h5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M9 13h6M9 17h6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Export Report
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Download the complete analytics report in your preferred format.
                </p>
              </div>

            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                downloadFile(
                  "pdf",
                  "pdf"
                )
              }
              disabled={
                downloadLoading !== ""
              }
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-base">
                {downloadLoading === "pdf"
                  ? "..."
                  : "PDF"}
              </span>

              {downloadLoading === "pdf"
                ? "Preparing..."
                : "Download PDF"}
            </button>

            <button
              onClick={() =>
                downloadFile(
                  "excel",
                  "xlsx"
                )
              }
              disabled={
                downloadLoading !== ""
              }
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-sm font-medium text-emerald-400 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-base">
                {downloadLoading === "excel"
                  ? "..."
                  : "XLSX"}
              </span>

              {downloadLoading === "excel"
                ? "Preparing..."
                : "Download Excel"}
            </button>

          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {contentMetricCards.map(
          (card) => (
            <div
              key={card.label}
              className="rounded-xl border border-white/10 bg-[#151515] p-5"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    {card.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {card.value}
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.classes}`}
                >
                  {card.icon}
                </div>

              </div>
            </div>
          )
        )}

      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Content Performance */}
        <section className="rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white">
              Content Performance
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Summary and top-performing content from your analytics.
            </p>
          </div>

          <div className="p-6">

            {topContent.length === 0 ? (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-8 text-center">
                <p className="text-sm text-gray-500">
                  No top content data available.
                </p>
              </div>
            ) : (
              <div className="space-y-3">

                {topContent
                  .slice(0, 5)
                  .map(
                    (item, index) => {

                      const title =
                        item.title ||
                        item.content_title ||
                        item.name ||
                        `Content ${index + 1}`;

                      const engagement =
                        item.engagement_rate ??
                        item.engagement ??
                        item.engagement_count ??
                        null;

                      return (
                        <div
                          key={
                            item.id ??
                            item.content_id ??
                            index
                          }
                          className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-sm font-semibold text-purple-400">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-200">
                              {title}
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              Performance ranking
                            </p>
                          </div>

                          <div className="shrink-0 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                            {typeof engagement ===
                            "number" &&
                            Number.isFinite(engagement)
                              ? `${engagement.toLocaleString(
                                  "en-IN"
                                )}%`
                              : "N/A"}
                          </div>
                        </div>
                      );
                    }
                  )}

              </div>
            )}

          </div>
        </section>

        {/* Revenue Analytics */}
        <section className="rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white">
              Revenue Analytics
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Revenue summary and source breakdown.
            </p>
          </div>

          <div className="p-6">

            <div className="mb-5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-5">
              <p className="text-sm text-gray-500">
                Total Revenue
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {formatCurrency(
                  revenueAnalytics.total_revenue
                )}
              </p>
            </div>

            {revenueBySource.length === 0 ? (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-8 text-center">
                <p className="text-sm text-gray-500">
                  No revenue source data available.
                </p>
              </div>
            ) : (
              <div className="space-y-3">

                {revenueBySource.map(
                  (item, index) => {

                    const source =
                      item.source ||
                      item.revenue_source ||
                      item.name ||
                      `Source ${index + 1}`;

                    const amount =
                      item.amount ??
                      item.revenue ??
                      item.total ??
                      item.value ??
                      null;

                    return (
                      <div
                        key={
                          item.id ??
                          source ??
                          index
                        }
                        className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4"
                      >
                        <div className="flex items-center gap-3">

                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-xs font-semibold text-purple-400">
                            {index + 1}
                          </div>

                          <span className="text-sm text-gray-300">
                            {source}
                          </span>

                        </div>

                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        </section>

        {/* Audience Analytics */}
        <section className="rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white">
              Audience Analytics
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Audience information included in the generated report.
            </p>
          </div>

          <div className="p-6">

            {Object.keys(audienceAnalytics).length === 0 ? (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-8 text-center">
                <p className="text-sm text-gray-500">
                  No audience analytics available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                {Object.entries(
                  audienceAnalytics
                )
                  .filter(
                    ([, value]) =>
                      typeof value !==
                        "object" &&
                      value !== null
                  )
                  .slice(0, 8)
                  .map(
                    ([key, value]) => (

                      <div
                        key={key}
                        className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
                      >
                        <p className="text-xs capitalize text-gray-600">
                          {key.replace(
                            /_/g,
                            " "
                          )}
                        </p>

                        <p className="mt-2 text-lg font-semibold text-white">
                          {typeof value ===
                          "number"
                            ? formatNumber(
                                value
                              )
                            : String(
                                value
                              )}
                        </p>
                      </div>

                    )
                  )}

              </div>
            )}

          </div>
        </section>

        {/* Growth Trends */}
        <section className="rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white">
              Growth Trends
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Growth information generated from the existing audience services.
            </p>
          </div>

          <div className="p-6">

            {Array.isArray(growthTrends) &&
            growthTrends.length === 0 ? (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-8 text-center">
                <p className="text-sm text-gray-500">
                  No growth trend data available.
                </p>
              </div>
            ) : (
              <div className="space-y-3">

                {Array.isArray(
                  growthTrends
                ) ? (
                  growthTrends
                    .slice(0, 8)
                    .map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={
                            item.id ??
                            item.date ??
                            index
                          }
                          className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4"
                        >
                          <span className="text-sm text-gray-400">
                            {item.date ||
                              item.month ||
                              item.period ||
                              `Period ${
                                index +
                                1
                              }`}
                          </span>

                          <span className="font-semibold text-purple-400">
                            {formatNumber(
                              item.followers ??
                                item.growth ??
                                item.value ??
                                null
                            )}
                          </span>
                        </div>
                      )
                    )
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {Object.entries(
                      growthTrends
                    )
                      .filter(
                        ([, value]) =>
                          typeof value !==
                            "object" &&
                          value !== null
                      )
                      .slice(0, 8)
                      .map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
                          >
                            <p className="text-xs capitalize text-gray-600">
                              {key.replace(
                                /_/g,
                                " "
                              )}
                            </p>

                            <p className="mt-2 text-lg font-semibold text-purple-400">
                              {typeof value ===
                              "number"
                                ? formatNumber(
                                    value
                                  )
                                : String(
                                    value
                                  )}
                            </p>
                          </div>
                        )
                      )}

                  </div>
                )}

              </div>
            )}

          </div>
        </section>

      </div>

      {/* Platform Comparison */}
      <section className="rounded-xl border border-white/10 bg-[#151515]">

        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white">
            Platform Comparison
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Compare performance across available platforms.
          </p>
        </div>

        {platformComparison.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500">
              No platform comparison data available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px] text-left">

              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-600">

                  <th className="px-6 py-4 font-medium">
                    #
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Platform
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Performance
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Engagement
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">

                {platformComparison.map(
                  (item, index) => {

                    const platform =
                      item.platform ||
                      item.name ||
                      item.source ||
                      `Platform ${
                        index + 1
                      }`;

                    const performance =
                      item.performance ??
                      item.total ??
                      item.views ??
                      item.followers ??
                      null;

                    const engagement =
                      item.engagement_rate ??
                      item.engagement ??
                      0;

                    return (
                      <tr
                        key={
                          item.id ??
                          platform ??
                          index
                        }
                        className="transition hover:bg-white/[0.02]"
                      >

                        <td className="px-6 py-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-xs font-semibold text-purple-400">
                            {index + 1}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-gray-200">
                          {platform}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-400">
                          {formatNumber(
                            performance
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                            {typeof engagement ===
                            "number" &&
                            Number.isFinite(engagement)
                              ? `${engagement.toLocaleString(
                                  "en-IN"
                                )}%`
                              : "N/A"}
                          </span>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* Monthly Revenue */}
      <section className="rounded-xl border border-white/10 bg-[#151515]">

        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white">
            Monthly Revenue
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Monthly revenue values included in the report.
          </p>
        </div>

        {monthlyRevenue.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500">
              No monthly revenue data available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[500px] text-left">

              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-600">

                  <th className="px-6 py-4 font-medium">
                    Period
                  </th>

                  <th className="px-6 py-4 text-right font-medium">
                    Revenue
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">

                {monthlyRevenue.map(
                  (item, index) => {

                    const period =
                      item.month ||
                      item.date ||
                      item.period ||
                      item.label ||
                      `Period ${
                        index + 1
                      }`;

                    const revenue =
                      item.revenue ??
                      item.amount ??
                      item.total ??
                      item.value ??
                      null;

                    return (
                      <tr
                        key={
                          item.id ??
                          period ??
                          index
                        }
                        className="transition hover:bg-white/[0.02]"
                      >

                        <td className="px-6 py-4 text-sm text-gray-300">
                          {period}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-emerald-400">
                          {formatCurrency(
                            revenue
                          )}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

export default Reports;
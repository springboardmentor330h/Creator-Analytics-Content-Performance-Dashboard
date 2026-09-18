import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import api from "../services/api";
import { getCurrentUser } from "../services/auth";

function Revenue() {
  const [creatorId, setCreatorId] = useState(null);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueBySource, setRevenueBySource] = useState({});
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [revenueRecords, setRevenueRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD CURRENT USER + REVENUE DATA
  // --------------------------------------------------
  useEffect(() => {
    const loadRevenueData = async () => {
      setLoading(true);
      setError("");

      try {
        // Get the currently logged-in creator
        const user = await getCurrentUser();
        const currentCreatorId = user?.id;

        if (!currentCreatorId) {
          throw new Error("Unable to determine the logged-in user.");
        }

        setCreatorId(currentCreatorId);

        // Fetch all revenue data for the logged-in creator
        const [
          summaryResponse,
          sourceResponse,
          monthlyResponse,
          trendResponse,
          recordsResponse,
        ] = await Promise.all([
          api.get("/revenue/analytics/summary", {
            params: {
              creator_id: currentCreatorId,
            },
          }),

          api.get("/revenue/analytics/by-source", {
            params: {
              creator_id: currentCreatorId,
            },
          }),

          api.get("/revenue/analytics/monthly", {
            params: {
              creator_id: currentCreatorId,
            },
          }),

          api.get("/revenue/analytics/trend", {
            params: {
              creator_id: currentCreatorId,
            },
          }),

          api.get("/revenue/", {
            params: {
              creator_id: currentCreatorId,
            },
          }),
        ]);

        setTotalRevenue(
          Number(summaryResponse.data?.total_revenue ?? 0)
        );

        setRevenueBySource(
          sourceResponse.data?.revenue_by_source ?? {}
        );

        setMonthlyRevenue(
          Array.isArray(monthlyResponse.data?.data)
            ? monthlyResponse.data.data
            : []
        );

        setRevenueTrend(
          Array.isArray(trendResponse.data?.data)
            ? trendResponse.data.data
            : []
        );

        setRevenueRecords(
          Array.isArray(recordsResponse.data?.data)
            ? recordsResponse.data.data
            : []
        );
      } catch (err) {
        console.error("Revenue API error:", err);

        const message =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Unable to load revenue data. Please make sure the backend is running.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadRevenueData();
  }, []);

  // --------------------------------------------------
  // SOURCE CHART DATA
  // --------------------------------------------------
  const sourceChartData = useMemo(() => {
    return Object.entries(revenueBySource).map(
      ([source, amount]) => ({
        source,
        revenue: Number(amount ?? 0),
      })
    );
  }, [revenueBySource]);

  // --------------------------------------------------
  // MONTHLY DATA
  // --------------------------------------------------
  const formattedMonthlyData = useMemo(() => {
    return monthlyRevenue.map((item) => ({
      month: item.month,
      revenue: Number(item.revenue ?? 0),
    }));
  }, [monthlyRevenue]);

  // --------------------------------------------------
  // TREND DATA
  // --------------------------------------------------
  const formattedTrendData = useMemo(() => {
    return revenueTrend.map((item) => ({
      date: item.date,
      revenue: Number(item.revenue ?? 0),
    }));
  }, [revenueTrend]);

  // --------------------------------------------------
  // AVERAGE MONTHLY REVENUE
  // --------------------------------------------------
  const averageMonthlyRevenue = useMemo(() => {
    if (formattedMonthlyData.length === 0) {
      return 0;
    }

    const total = formattedMonthlyData.reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    return total / formattedMonthlyData.length;
  }, [formattedMonthlyData]);

  // --------------------------------------------------
  // HIGHEST REVENUE SOURCE
  // --------------------------------------------------
  const highestRevenueSource = useMemo(() => {
    if (sourceChartData.length === 0) {
      return "—";
    }

    const highest = [...sourceChartData].sort(
      (a, b) => b.revenue - a.revenue
    )[0];

    return highest?.source || "—";
  }, [sourceChartData]);

  // --------------------------------------------------
  // FORMAT CURRENCY
  // --------------------------------------------------
  const formatCurrency = (value) => {
    return `₹${Number(value ?? 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------
  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // FORMAT MONTH
  // --------------------------------------------------
  const formatMonth = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(`${value}-01`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-full bg-[#0d0d0d] p-6 text-white">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded bg-white/10" />

            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-white/5" />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-xl border border-white/10 bg-[#151515]"
              />
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-xl border border-white/10 bg-[#151515]"
              />
            ))}
          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------
  if (error) {
    return (
      <div className="min-h-full bg-[#0d0d0d] p-6 text-white">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">

            <h1 className="text-xl font-semibold text-red-400">
              Revenue Data Unavailable
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              {error}
            </p>

            <p className="mt-4 text-xs text-gray-500">
              Check that the FastAPI backend is running at
              http://127.0.0.1:8000.
            </p>

          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------
  return (
    <div className="min-h-full bg-[#0d0d0d] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>
              <p className="mb-2 text-sm font-medium text-emerald-400">
                MONETIZATION
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                Revenue Analytics
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Track your earnings, revenue sources, monthly performance,
                and revenue trends from your creator activity.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#151515] px-4 py-2">

              <p className="text-xs text-gray-500">
                Creator ID
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-200">
                #{creatorId}
              </p>

            </div>

          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL REVENUE */}
          <div className="rounded-xl border border-white/10 bg-[#151515] p-5 transition hover:border-emerald-500/30">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Revenue
                </p>

                <h2 className="mt-3 text-2xl font-bold text-white">
                  {formatCurrency(totalRevenue)}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-lg text-emerald-400">
                ₹
              </div>

            </div>

            <p className="mt-4 text-xs text-gray-500">
              Lifetime recorded revenue
            </p>

          </div>

          {/* MONTHLY AVERAGE */}
          <div className="rounded-xl border border-white/10 bg-[#151515] p-5 transition hover:border-blue-500/30">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Avg. Monthly Revenue
                </p>

                <h2 className="mt-3 text-2xl font-bold text-white">
                  {formatCurrency(averageMonthlyRevenue)}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                ↗
              </div>

            </div>

            <p className="mt-4 text-xs text-gray-500">
              Based on available monthly records
            </p>

          </div>

          {/* REVENUE SOURCES */}
          <div className="rounded-xl border border-white/10 bg-[#151515] p-5 transition hover:border-purple-500/30">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Revenue Sources
                </p>

                <h2 className="mt-3 text-2xl font-bold text-white">
                  {sourceChartData.length}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                ◈
              </div>

            </div>

            <p className="mt-4 text-xs text-gray-500">
              Active revenue categories
            </p>

          </div>

          {/* TOP SOURCE */}
          <div className="rounded-xl border border-white/10 bg-[#151515] p-5 transition hover:border-orange-500/30">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Top Revenue Source
                </p>

                <h2 className="mt-3 text-xl font-bold capitalize text-white">
                  {highestRevenueSource}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                ★
              </div>

            </div>

            <p className="mt-4 text-xs text-gray-500">
              Highest contribution to revenue
            </p>

          </div>

        </div>

        {/* TREND + SOURCE */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          {/* REVENUE TREND */}
          <div className="rounded-xl border border-white/10 bg-[#151515] p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Revenue Trend
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Daily revenue movement over time
              </p>
            </div>

            <div className="h-80">

              {formattedTrendData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  No revenue trend data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">

                  <LineChart
                    data={formattedTrendData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 5,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.07)"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      tick={{
                        fill: "#9ca3af",
                        fontSize: 11,
                      }}
                      axisLine={{
                        stroke: "rgba(255,255,255,0.1)",
                      }}
                      tickLine={false}
                      minTickGap={25}
                    />

                    <YAxis
                      tick={{
                        fill: "#9ca3af",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={65}
                      tickFormatter={(value) =>
                        `₹${Number(value).toLocaleString("en-IN")}`
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#181818",
                        border:
                          "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                      labelStyle={{
                        color: "#9ca3af",
                        fontSize: 11,
                        marginBottom: 4,
                      }}
                      itemStyle={{
                        color: "#10b981",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                      labelFormatter={formatDate}
                      formatter={(value) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{
                        r: 3,
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 5,
                      }}
                      animationDuration={800}
                    />

                  </LineChart>

                </ResponsiveContainer>
              )}

            </div>
          </div>

          {/* REVENUE BY SOURCE */}
          <div className="rounded-xl border border-white/10 bg-[#151515] p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Revenue by Source
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Contribution from each revenue source
              </p>
            </div>

            <div className="h-80">

              {sourceChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  No revenue source data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">

                  <BarChart
                    data={sourceChartData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 5,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.07)"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="source"
                      tick={{
                        fill: "#9ca3af",
                        fontSize: 11,
                      }}
                      axisLine={{
                        stroke: "rgba(255,255,255,0.1)",
                      }}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fill: "#9ca3af",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={65}
                      tickFormatter={(value) =>
                        `₹${Number(value).toLocaleString("en-IN")}`
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#181818",
                        border:
                          "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                      labelStyle={{
                        color: "#9ca3af",
                        fontSize: 11,
                        marginBottom: 4,
                      }}
                      itemStyle={{
                        color: "#a855f7",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                      formatter={(value) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                    />

                    <Bar
                      dataKey="revenue"
                      fill="#a855f7"
                      radius={[6, 6, 0, 0]}
                      animationDuration={800}
                    />

                  </BarChart>

                </ResponsiveContainer>
              )}

            </div>
          </div>

        </div>

        {/* MONTHLY REVENUE */}
        <div className="mt-6 rounded-xl border border-white/10 bg-[#151515] p-6">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">
              Monthly Revenue
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Monthly earnings generated from your recorded revenue
              activity
            </p>
          </div>

          <div className="h-80">

            {formattedMonthlyData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No monthly revenue data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">

                <BarChart
                  data={formattedMonthlyData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 5,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.07)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 11,
                    }}
                    axisLine={{
                      stroke: "rgba(255,255,255,0.1)",
                    }}
                    tickLine={false}
                    minTickGap={20}
                  />

                  <YAxis
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={65}
                    tickFormatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#181818",
                      border:
                        "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "10px",
                      padding: "10px 12px",
                    }}
                    labelStyle={{
                      color: "#9ca3af",
                      fontSize: 11,
                      marginBottom: 4,
                    }}
                    itemStyle={{
                      color: "#3b82f6",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                    labelFormatter={formatMonth}
                    formatter={(value) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                  />

                  <Bar
                    dataKey="revenue"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    animationDuration={800}
                  />

                </BarChart>

              </ResponsiveContainer>
            )}

          </div>
        </div>

        {/* REVENUE RECORDS */}
        <div className="mt-6 rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-6">

            <h2 className="text-lg font-semibold text-white">
              Revenue Records
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Detailed revenue transactions for this creator
            </p>

          </div>

          {revenueRecords.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center px-6 text-sm text-gray-500">
              No revenue records available.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>
                  <tr className="border-b border-white/10 text-left">

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Source
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Description
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {revenueRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.02]"
                    >

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-medium capitalize text-purple-400">
                          {record.source || "Unknown"}
                        </span>
                      </td>

                      <td className="max-w-xs px-6 py-4 text-sm text-gray-300">
                        <div className="truncate">
                          {record.description || "No description"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                        {formatCurrency(record.amount)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(record.date)}
                      </td>

                      <td className="px-6 py-4">

                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">

                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                          Recorded

                        </span>

                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* FOOTER INSIGHT */}
        <div className="mt-6 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-5">

          <div className="flex gap-3">

            <div className="mt-0.5 text-emerald-400">
              ●
            </div>

            <div>

              <h3 className="text-sm font-semibold text-gray-200">
                Revenue Overview
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Your revenue dashboard combines total earnings,
                source-level contribution, monthly performance,
                daily trends, and individual revenue records to give
                you a complete view of monetization performance.
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Revenue;
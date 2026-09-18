import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import api from "../services/api";
import { getCurrentUser } from "../services/auth";

function Sponsorships() {
  // --------------------------------------------------
  // CREATOR
  // --------------------------------------------------
  const [creatorId, setCreatorId] = useState(null);

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH SPONSORSHIPS
  // --------------------------------------------------
  const fetchSponsorships = async (currentCreatorId) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/sponsorships/", {
        params: {
          creator_id: currentCreatorId,
        },
      });

      const result = response.data?.data ?? response.data;

      setSponsorships(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to fetch sponsorships:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load sponsorship data. Please make sure the backend is running."
      );

      setSponsorships([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD CURRENT LOGGED-IN USER
  // --------------------------------------------------
  useEffect(() => {
    const loadSponsorships = async () => {
      try {
        const user = await getCurrentUser();
        const currentCreatorId = user?.id;

        if (!currentCreatorId) {
          throw new Error("Unable to determine the logged-in user.");
        }

        setCreatorId(currentCreatorId);

        await fetchSponsorships(currentCreatorId);
      } catch (err) {
        console.error("Failed to load current user:", err);

        setError(
          err.response?.data?.detail ||
            err.message ||
            "Unable to load sponsorship data."
        );

        setSponsorships([]);
        setLoading(false);
      }
    };

    loadSponsorships();
  }, []);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "N/A";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (value) => {
    if (!value) return "—";

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

  const normalizeStatus = (value) => {
    return String(value || "Unknown").trim();
  };

  const getStatusClasses = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "active") {
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    }

    if (normalized === "completed" || normalized === "complete") {
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    }

    if (normalized === "pending") {
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled" ||
      normalized === "inactive"
    ) {
      return "border-red-500/20 bg-red-500/10 text-red-400";
    }

    return "border-white/10 bg-white/5 text-gray-400";
  };

  const getPaymentClasses = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (
      normalized === "paid" ||
      normalized === "completed" ||
      normalized === "complete"
    ) {
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    }

    if (normalized === "pending" || normalized === "processing") {
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    }

    if (
      normalized === "failed" ||
      normalized === "overdue" ||
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return "border-red-500/20 bg-red-500/10 text-red-400";
    }

    return "border-white/10 bg-white/5 text-gray-400";
  };

  // --------------------------------------------------
  // DERIVED DATA
  // --------------------------------------------------
  const statistics = useMemo(() => {
    const totalValue = sponsorships.reduce(
      (sum, item) => sum + Number(item.contract_value ?? 0),
      0
    );

    const activeCount = sponsorships.filter(
      (item) =>
        String(item.status || "").toLowerCase() === "active"
    ).length;

    const paidCount = sponsorships.filter((item) => {
      const status = String(item.payment_status || "").toLowerCase();

      return (
        status === "paid" ||
        status === "completed" ||
        status === "complete"
      );
    }).length;

    const pendingCount = sponsorships.filter((item) => {
      const status = String(item.payment_status || "").toLowerCase();

      return status === "pending";
    }).length;

    return {
      totalValue,
      totalContracts: sponsorships.length,
      activeCount,
      paidCount,
      pendingCount,
    };
  }, [sponsorships]);

  // --------------------------------------------------
  // PAYMENT CHART
  // --------------------------------------------------
  const paymentChartData = useMemo(() => {
    const grouped = {};

    sponsorships.forEach((item) => {
      const status = normalizeStatus(item.payment_status);

      if (!grouped[status]) {
        grouped[status] = 0;
      }

      grouped[status] += 1;
    });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
  }, [sponsorships]);

  const paymentChartColors = [
    "#22c55e",
    "#eab308",
    "#3b82f6",
    "#ef4444",
    "#a855f7",
  ];

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-white/5" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl border border-white/10 bg-[#151515]"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-80 animate-pulse rounded-xl border border-white/10 bg-[#151515] xl:col-span-1" />
          <div className="h-80 animate-pulse rounded-xl border border-white/10 bg-[#151515] xl:col-span-2" />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Sponsorships
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage sponsorship campaigns and payment information.
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              !
            </div>

            <div>
              <h2 className="font-semibold text-red-400">
                Unable to load sponsorships
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {error}
              </p>

              <button
                onClick={() =>
                  creatorId && fetchSponsorships(creatorId)
                }
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

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Sponsorships
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track brand partnerships, campaign contracts, and payment status.
          </p>
        </div>

        <button
          onClick={() =>
            creatorId && fetchSponsorships(creatorId)
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#151515] px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-white"
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

          Refresh
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#151515] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Total Contract Value
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              ₹
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {formatCurrency(statistics.totalValue)}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Across all sponsorships
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151515] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Total Contracts
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              #
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {statistics.totalContracts}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Sponsorship agreements
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151515] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Active Sponsorships
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              ✓
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {statistics.activeCount}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Currently active
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151515] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Payments Received
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
              $
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {statistics.paidCount}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Paid or completed
          </p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* PAYMENT STATUS CHART */}
        <div className="rounded-xl border border-white/10 bg-[#151515] p-6 xl:col-span-1">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Payment Status
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Sponsorship payment distribution
            </p>
          </div>

          <div className="mt-6 h-64">
            {paymentChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No payment data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}-${index}`}
                        fill={
                          paymentChartColors[
                            index % paymentChartColors.length
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#ffffff",
                    }}
                    formatter={(value, name) => [
                      `${value} sponsorship${
                        Number(value) === 1 ? "" : "s"
                      }`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            {paymentChartData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-2 text-xs text-gray-400"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      paymentChartColors[
                        index % paymentChartColors.length
                      ],
                  }}
                />

                <span>{item.name}</span>

                <span className="font-semibold text-gray-300">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SPONSORSHIP SUMMARY */}
        <div className="rounded-xl border border-white/10 bg-[#151515] p-6 xl:col-span-2">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Sponsorship Overview
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Current partnership and payment snapshot
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
              <p className="text-sm text-gray-500">
                Contract Value
              </p>

              <p className="mt-2 text-2xl font-bold text-purple-400">
                {formatCurrency(statistics.totalValue)}
              </p>

              <p className="mt-2 text-xs text-gray-600">
                Across all sponsorship agreements
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
              <p className="text-sm text-gray-500">
                Average Contract Value
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-400">
                {formatCurrency(
                  statistics.totalContracts > 0
                    ? statistics.totalValue /
                        statistics.totalContracts
                    : null
                )}
              </p>

              <p className="mt-2 text-xs text-gray-600">
                Average value per sponsorship
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
              <p className="text-sm text-gray-500">
                Payments Received
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-400">
                {statistics.paidCount}
              </p>

              <p className="mt-2 text-xs text-gray-600">
                Paid or completed sponsorship payments
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
              <p className="text-sm text-gray-500">
                Payment Pending
              </p>

              <p className="mt-2 text-2xl font-bold text-yellow-400">
                {statistics.pendingCount}
              </p>

              <p className="mt-2 text-xs text-gray-600">
                Sponsorships awaiting payment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SPONSORSHIP TABLE */}
      <div className="rounded-xl border border-white/10 bg-[#151515]">
        <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Sponsorship Records
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Brand partnerships and contract details
            </p>
          </div>

          <div className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
            {sponsorships.length} record
            {sponsorships.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[950px] w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Brand
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Campaign
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Contract Value
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Duration
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Payment
                </th>
              </tr>
            </thead>

            <tbody>
              {sponsorships.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No sponsorship records found.
                  </td>
                </tr>
              ) : (
                sponsorships.map((sponsorship, index) => (
                  <tr
                    key={
                      sponsorship.id ??
                      `${sponsorship.brand_name}-${index}`
                    }
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >
                    {/* BRAND */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-sm font-bold text-purple-400">
                          {String(
                            sponsorship.brand_name || "B"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-white">
                            {sponsorship.brand_name ||
                              "Unknown Brand"}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-600">
                            Sponsorship #
                            {sponsorship.id ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CAMPAIGN */}
                    <td className="px-6 py-5">
                      <p className="max-w-[220px] truncate text-sm text-gray-300">
                        {sponsorship.campaign || "—"}
                      </p>
                    </td>

                    {/* CONTRACT VALUE */}
                    <td className="px-6 py-5">
                      <p className="font-semibold text-white">
                        {formatCurrency(
                          sponsorship.contract_value
                        )}
                      </p>
                    </td>

                    {/* DURATION */}
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-300">
                          {formatDate(
                            sponsorship.start_date
                          )}
                        </p>

                        <p className="text-xs text-gray-600">
                          to{" "}
                          {formatDate(
                            sponsorship.end_date
                          )}
                        </p>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          sponsorship.status
                        )}`}
                      >
                        {normalizeStatus(
                          sponsorship.status
                        )}
                      </span>
                    </td>

                    {/* PAYMENT STATUS */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getPaymentClasses(
                          sponsorship.payment_status
                        )}`}
                      >
                        {normalizeStatus(
                          sponsorship.payment_status
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Sponsorships;
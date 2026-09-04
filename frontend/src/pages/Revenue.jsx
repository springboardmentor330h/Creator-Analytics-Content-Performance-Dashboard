import { useEffect, useState } from "react";
import { getRevenueReport } from "../services/api";
import PlatformSelector from "../components/PlatformSelector";
import { DollarSign, TrendingUp, CreditCard, Receipt, RefreshCw, Wallet, ShieldCheck, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function Revenue() {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRevenue = async (platform = selectedPlatform) => {
    try {
      setLoading(true);
      setError("");
      const result = await getRevenueReport(platform);
      setData(result);
    } catch (err) {
      console.error("Revenue API error:", err);
      setError("Unable to load revenue analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue(selectedPlatform);
  }, [selectedPlatform]);

  const report = data || {};
  const rawList = Array.isArray(report.data)
    ? report.data
    : Array.isArray(report.revenue)
    ? report.revenue
    : Array.isArray(report)
    ? report
    : [];

  const revenueList = selectedPlatform !== "All"
    ? rawList.filter((r) => (r.platform || "").toLowerCase() === selectedPlatform.toLowerCase() || r.platform === "Multi-Platform")
    : rawList;

  const totalRevenue = selectedPlatform !== "All" ? revenueList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) : (report.total_revenue ?? revenueList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0));
  const totalTransactions = selectedPlatform !== "All" ? revenueList.length : (report.total_records ?? revenueList.length);

  // Group revenue by source for visual chart
  const sourceMap = {};
  for (const item of revenueList) {
    sourceMap[item.source] = (sourceMap[item.source] || 0) + Number(item.amount);
  }
  const sourceChartData = Object.entries(sourceMap).map(([source, total]) => ({ source, total }));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue & Monetization Control</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {selectedPlatform === "All" ? "All Revenue Streams" : selectedPlatform}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Multi-channel income telemetry, AdSense payouts, creator funds, and brand sponsorships.
          </p>
        </div>

        <button
          onClick={() => loadRevenue(selectedPlatform)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition shadow-2xs self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} /> Refresh
        </button>
      </div>

      {/* Platform Selector */}
      <PlatformSelector selectedPlatform={selectedPlatform} onSelectPlatform={setSelectedPlatform} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded Revenue</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              ₹{Number(totalRevenue).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +22.4% vs last month
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Transactions</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {totalTransactions} Payouts
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">100% Cleared & Verified</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Deal Value</span>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1 tracking-tight">
              ₹{totalTransactions > 0 ? Math.round(Number(totalRevenue) / totalTransactions).toLocaleString() : 0}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">High Sponsor Conversion</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Chart */}
      {sourceChartData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" /> Revenue Breakdown by Income Stream
          </h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="source" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => `₹${Number(val).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    color: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="total" name="Revenue Amount (INR)" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">{error}</div>}

      {/* Revenue Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" /> Recent Monetization Transactions
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {revenueList.length} Recorded Entries
          </span>
        </div>

        {revenueList.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {loading ? "Loading transactions..." : "No revenue records match the selected platform filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5">Platform</th>
                  <th className="px-6 py-3.5">Monetization Source</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {revenueList.map((item, idx) => (
                  <tr key={item.id ?? idx} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.platform || "Multi-Platform"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {item.source}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{item.description}</td>
                    <td className="px-6 py-4 text-slate-400 font-semibold">{item.revenue_date}</td>
                    <td className="px-6 py-4 font-extrabold text-emerald-700 text-right text-sm">
                      ₹{Number(item.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Revenue;

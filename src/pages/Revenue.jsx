import { useEffect, useState } from "react";
import { getRevenueReport } from "../services/api";
import { DollarSign, TrendingUp, CreditCard, Receipt, PlusCircle } from "lucide-react";

function Revenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRevenue = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getRevenueReport();
      setData(result);
    } catch (err) {
      console.error("Revenue API error:", err);
      setError("Unable to load revenue analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500">Loading monetization data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>;
  }

  const report = data || {};
  const revenueList = report.data || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue & Monetization</h1>
        <p className="text-sm text-slate-500 mt-1">Multi-channel income streams, AdSense payouts, and brand deals</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Recorded Revenue</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ₹{Number(report.total_revenue ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Transactions</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {report.total_records ?? 0}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Growth Velocity</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              +19.7%
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Revenue Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" /> Monetization Streams
          </h2>
          <span className="text-xs font-medium text-slate-400">{revenueList.length} Entries</span>
        </div>

        {revenueList.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No revenue data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Source</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {revenueList.map((item, idx) => (
                  <tr key={item.id ?? idx} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {item.source}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{item.description}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{item.revenue_date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-right">
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

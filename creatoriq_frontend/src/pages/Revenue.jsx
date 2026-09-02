import { useEffect, useState } from "react";

import {
  getCreatorRevenue,
  getRevenueSummary,
  getRevenueBySource,
  getMonthlyRevenue,
} from "../services/api";

import RevenueChart from "../components/charts/RevenueChart";
import RevenueBySourceChart from "../components/charts/RevenueBySourceChart";

function Revenue() {
  const creatorId = 2;

  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [bySource, setBySource] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        setLoading(true);
        setError("");

        const [summaryData, revenueData, sourceData, monthlyData] = await Promise.all([
          getRevenueSummary(creatorId),
          getCreatorRevenue(creatorId),
          getRevenueBySource(creatorId),
          getMonthlyRevenue(creatorId),
        ]);

        setSummary(summaryData);
        setRevenue(revenueData);
        setBySource(sourceData.revenue_by_source || []);
        setMonthly(monthlyData.monthly_revenue || []);
      } catch (err) {
        console.error("Revenue API error:", err);
        setError("Unable to load revenue data from the backend.");
      } finally {
        setLoading(false);
      }
    };

    loadRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="dashboard-hero">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Monetization</p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Revenue</h1>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <p className="text-slate-500">Loading revenue data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="dashboard-hero">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Monetization</p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Revenue</h1>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="font-medium text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="dashboard-hero">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Monetization</p>
              <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Revenue</h1>
              <p className="mt-2 text-sm text-indigo-100/90">Revenue analytics for Creator {creatorId}</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Revenue overview
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="stat-card stat-card-indigo">
            <p className="text-sm font-medium text-indigo-100">Total Revenue</p>
            <h2 className="mt-5 text-3xl font-bold text-white">₹{Number(summary?.total_revenue || 0).toLocaleString("en-IN")}</h2>
            <p className="mt-2 text-sm text-indigo-100/90">All revenue generated</p>
          </div>

          <div className="stat-card stat-card-sky">
            <p className="text-sm font-medium text-sky-50">Creator ID</p>
            <h2 className="mt-5 text-3xl font-bold text-white">{summary?.creator_id}</h2>
            <p className="mt-2 text-sm text-sky-50/90">Account reference</p>
          </div>

          <div className="stat-card stat-card-emerald">
            <p className="text-sm font-medium text-emerald-50">Transactions</p>
            <h2 className="mt-5 text-3xl font-bold text-white">{revenue.length}</h2>
            <p className="mt-2 text-sm text-emerald-50/90">Revenue entries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="dashboard-panel">
            <RevenueChart data={monthly} />
          </div>

          <div className="dashboard-panel dashboard-panel-violet">
            <RevenueBySourceChart data={bySource} />
          </div>
        </div>

        <div className="content-table-card">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Revenue Transactions</h2>
              <p className="mt-1 text-sm text-slate-500">Latest income activity</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="dashboard-table w-full text-left">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {revenue.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold text-slate-800">{item.source}</td>
                    <td>₹{Number(item.amount).toLocaleString("en-IN")}</td>
                    <td>{item.revenue_date}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Revenue;
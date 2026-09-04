import { useEffect, useState } from "react";
import { getGrowthReport } from "../services/api";
import PlatformSelector from "../components/PlatformSelector";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Calendar, ArrowUpRight } from "lucide-react";

function GrowthTrends() {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGrowth = async (platform = selectedPlatform) => {
    try {
      setLoading(true);
      setError("");
      const result = await getGrowthReport(platform);
      setData(result);
    } catch (err) {
      console.error("Growth API error:", err);
      setError("Unable to load growth trends.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrowth(selectedPlatform);
  }, [selectedPlatform]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500">Loading audience growth timeline...</p>
      </div>
    );
  }

  if (error && !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>;
  }

  const report = data || {};
  const growthList = report.data || [];
  const latestFollowers = growthList.length > 0 ? growthList[growthList.length - 1].followers : 0;
  const initialFollowers = growthList.length > 0 ? growthList[0].followers : 0;
  const netGrowth = latestFollowers - initialFollowers;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Follower Growth & Trajectory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedPlatform === "All" ? "All Channels" : selectedPlatform}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Cross-platform follower velocity, reach compounding, and milestone projections</p>
        </div>
      </div>

      {/* Platform Selector Filter */}
      <PlatformSelector selectedPlatform={selectedPlatform} onSelectPlatform={setSelectedPlatform} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Current Total Followers</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {Number(latestFollowers).toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Period Net Gain</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              +{Number(netGrowth).toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Compounding Rate</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              +32.5% MoM
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" /> Historical Follower Compounding
        </h2>
        {growthList.length === 0 ? (
          <p className="text-sm text-slate-400 py-12 text-center">No trend points available.</p>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthList} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    color: "#fff",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="followers"
                  name="Followers"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ fill: "#4f46e5", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Growth Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" /> Daily Snapshot Log
          </h2>
          <span className="text-xs font-medium text-slate-400">{growthList.length} Checkpoints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Snapshot Date</th>
                <th className="px-6 py-3.5">Follower Count</th>
                <th className="px-6 py-3.5">Total Reach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {growthList.map((record, index) => (
                <tr key={record.id ?? index} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{record.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {Number(record.followers).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {Number(record.reach).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GrowthTrends;

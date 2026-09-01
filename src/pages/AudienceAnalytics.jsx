import { useEffect, useState } from "react";
import { getAudienceReport } from "../services/api";
import { Users, Globe, Smartphone, PieChart } from "lucide-react";

function AudienceAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAudience = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getAudienceReport();
      setData(result);
    } catch (err) {
      console.error("Audience API error:", err);
      setError("Unable to load audience analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudience();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500">Loading audience demographics...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>;
  }

  const report = data || {};
  const audienceList = report.data || [];
  const totalFollowers = audienceList.reduce((sum, a) => sum + (Number(a.followers) || 0), 0);
  const totalImpressions = audienceList.reduce((sum, a) => sum + (Number(a.impressions) || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audience Demographics & Reach</h1>
        <p className="text-sm text-slate-500 mt-1">Geographic footprint, device distribution, and follower age clusters</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Tracked Audience</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalFollowers.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Impressions</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalImpressions.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Primary Channel Device</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              Mobile (84%)
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Audience Segments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" /> Geographic & Demographic Segments
          </h2>
          <span className="text-xs font-medium text-slate-400">{audienceList.length} Cohorts</span>
        </div>

        {audienceList.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No audience data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Platform</th>
                  <th className="px-6 py-3.5">Followers</th>
                  <th className="px-6 py-3.5">Reach</th>
                  <th className="px-6 py-3.5">Impressions</th>
                  <th className="px-6 py-3.5">Gender / Age</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audienceList.map((record, index) => (
                  <tr key={record.id ?? index} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{record.platform}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {Number(record.followers).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {Number(record.reach).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {Number(record.impressions).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      <span className="font-semibold">{record.gender}</span> ({record.age_group})
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      {record.city}, {record.country}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {record.device_type}
                      </span>
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

export default AudienceAnalytics;

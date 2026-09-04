import { useEffect, useState } from "react";
import { getAudienceReport } from "../services/api";
import PlatformSelector from "../components/PlatformSelector";
import { Users, Globe, Smartphone, RefreshCw, MapPin, Laptop, ArrowUpRight } from "lucide-react";

function AudienceAnalytics() {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAudience = async (platform = selectedPlatform) => {
    try {
      setLoading(true);
      setError("");
      const result = await getAudienceReport(platform);
      setData(result);
    } catch (err) {
      console.error("Audience API error:", err);
      setError("Unable to load audience analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudience(selectedPlatform);
  }, [selectedPlatform]);

  const report = data || {};
  const rawList = Array.isArray(report.data)
    ? report.data
    : Array.isArray(report.audience)
    ? report.audience
    : Array.isArray(report)
    ? report
    : [];

  const audienceList = selectedPlatform !== "All"
    ? rawList.filter((a) => (a.platform || "").toLowerCase() === selectedPlatform.toLowerCase())
    : rawList;

  const totalFollowers = selectedPlatform !== "All" && audienceList.length > 0 ? audienceList.reduce((sum, a) => sum + (Number(a.followers) || 0), 0) : (report.total_followers ?? audienceList.reduce((sum, a) => sum + (Number(a.followers) || 0), 0));
  const totalReach = selectedPlatform !== "All" && audienceList.length > 0 ? audienceList.reduce((sum, a) => sum + (Number(a.reach) || 0), 0) : (report.total_reach ?? audienceList.reduce((sum, a) => sum + (Number(a.reach) || 0), 0));
  const totalImpressions = selectedPlatform !== "All" && audienceList.length > 0 ? audienceList.reduce((sum, a) => sum + (Number(a.impressions) || 0), 0) : (report.total_impressions ?? audienceList.reduce((sum, a) => sum + (Number(a.impressions) || 0), 0));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audience Demographics & Reach</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedPlatform === "All" ? "All Segments" : selectedPlatform}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Geographic footprint, device distribution, age clusters, and engagement penetration across social channels.
          </p>
        </div>

        <button
          onClick={() => loadAudience(selectedPlatform)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition shadow-2xs self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} /> Refresh
        </button>
      </div>

      {/* Platform Selector Filter */}
      <PlatformSelector selectedPlatform={selectedPlatform} onSelectPlatform={setSelectedPlatform} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tracked Followers</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {totalFollowers.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +15.4% Net Growth
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audience Reach</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {totalReach.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">Unique Accounts Reached</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Impressions</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {totalImpressions.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">1.8x Repeat Views</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">{error}</div>}

      {/* Audience Segments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" /> Geographic & Demographic Cohorts
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {audienceList.length} Connected Segments
          </span>
        </div>

        {audienceList.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            {loading ? "Loading audience data..." : "No audience data matches the selected platform filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5">Platform</th>
                  <th className="px-6 py-3.5">Followers</th>
                  <th className="px-6 py-3.5">Reach</th>
                  <th className="px-6 py-3.5">Impressions</th>
                  <th className="px-6 py-3.5">Gender Ratio / Age</th>
                  <th className="px-6 py-3.5">Top Metro / Country</th>
                  <th className="px-6 py-3.5 text-right">Primary Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audienceList.map((record, index) => (
                  <tr key={record.id ?? index} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {record.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      {Number(record.followers).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {Number(record.reach).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {Number(record.impressions).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      <div className="font-bold text-slate-800">{record.gender}</div>
                      <div className="text-[11px] text-slate-400">Age: {record.age_group}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{record.city}, {record.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {record.device_type === "Desktop" ? (
                          <Laptop className="w-3 h-3 text-slate-500" />
                        ) : (
                          <Smartphone className="w-3 h-3 text-slate-500" />
                        )}
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

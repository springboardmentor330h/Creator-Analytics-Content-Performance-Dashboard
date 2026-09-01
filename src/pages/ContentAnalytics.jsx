import { useEffect, useState } from "react";
import { getContentReport } from "../services/api";
import { Video, Eye, Heart, MessageSquare, Share2, Search, Filter } from "lucide-react";

function ContentAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [error, setError] = useState("");

  const loadContent = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getContentReport();
      setData(result);
    } catch (err) {
      console.error("Content API error:", err);
      setError("Unable to load content analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500">Loading published content catalog...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>;
  }

  const report = data || {};
  const contentList = Array.isArray(report.content) ? report.content : [];

  const filteredContent = contentList.filter((item) => {
    const title = item.title || item.content_title || "";
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = selectedPlatform === "All" || item.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const platforms = ["All", ...Array.from(new Set(contentList.map((c) => c.platform).filter(Boolean)))];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Content Performance Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Deep-dive into video and post engagement, reach metrics, and distribution ratios</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Content</span>
            <Video className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{report.total_content ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{Number(report.total_views ?? 0).toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Likes</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{Number(report.total_likes ?? 0).toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Comments</span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{Number(report.total_comments ?? 0).toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Shares</span>
            <Share2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{Number(report.total_shares ?? 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Content Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search content title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition shrink-0 ${
                  selectedPlatform === p
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {filteredContent.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No content matches the selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Content Title</th>
                  <th className="px-6 py-3.5">Platform</th>
                  <th className="px-6 py-3.5">Views</th>
                  <th className="px-6 py-3.5">Likes</th>
                  <th className="px-6 py-3.5">Comments</th>
                  <th className="px-6 py-3.5">Shares</th>
                  <th className="px-6 py-3.5">Reach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContent.map((item, idx) => (
                  <tr key={item.id ?? idx} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {item.title || item.content_title || "Untitled"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                        {item.platform || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{Number(item.views).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">{Number(item.likes).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">{Number(item.comments).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">{Number(item.shares).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">{Number(item.reach || 0).toLocaleString()}</td>
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

export default ContentAnalytics;

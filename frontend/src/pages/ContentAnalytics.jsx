import { useEffect, useState } from "react";
import { getContentReport } from "../services/api";
import PlatformSelector from "../components/PlatformSelector";
import { Video, Eye, Heart, MessageSquare, Share2, Search, RefreshCw, Bookmark, Sparkles, Filter } from "lucide-react";

function ContentAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [error, setError] = useState("");

  const loadContent = async (platform = selectedPlatform) => {
    try {
      setLoading(true);
      setError("");
      const result = await getContentReport(platform);
      setData(result);
    } catch (err) {
      console.error("Content API error:", err);
      setError("Unable to load content analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(selectedPlatform);
  }, [selectedPlatform]);

  const report = data || {};
  const rawList = Array.isArray(report.content)
    ? report.content
    : Array.isArray(report.data)
    ? report.data
    : Array.isArray(report.items)
    ? report.items
    : [];

  const contentList = selectedPlatform !== "All"
    ? rawList.filter((item) => (item.platform || "").toLowerCase() === selectedPlatform.toLowerCase())
    : rawList;

  const totalPosts = selectedPlatform !== "All" ? contentList.length : (report.total_content ?? contentList.length);
  const totalViews = selectedPlatform !== "All" ? contentList.reduce((s, c) => s + (Number(c.views) || 0), 0) : (report.total_views ?? contentList.reduce((s, c) => s + (Number(c.views) || 0), 0));
  const totalLikes = selectedPlatform !== "All" ? contentList.reduce((s, c) => s + (Number(c.likes) || 0), 0) : (report.total_likes ?? contentList.reduce((s, c) => s + (Number(c.likes) || 0), 0));
  const totalComments = selectedPlatform !== "All" ? contentList.reduce((s, c) => s + (Number(c.comments) || 0), 0) : (report.total_comments ?? contentList.reduce((s, c) => s + (Number(c.comments) || 0), 0));
  const totalShares = selectedPlatform !== "All" ? contentList.reduce((s, c) => s + (Number(c.shares) || 0), 0) : (report.total_shares ?? contentList.reduce((s, c) => s + (Number(c.shares) || 0), 0));
  const totalReach = selectedPlatform !== "All" ? contentList.reduce((s, c) => s + (Number(c.reach) || 0), 0) : (report.total_reach ?? contentList.reduce((s, c) => s + (Number(c.reach) || 0), 0));

  const filteredContent = contentList.filter((item) => {
    const title = item.title || item.content_title || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Content Performance Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedPlatform === "All" ? "All Channels" : selectedPlatform}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Granular post engagement, reach metrics, interaction distributions, and viral velocity across platforms.
          </p>
        </div>

        <button
          onClick={() => loadContent(selectedPlatform)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition shadow-2xs self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} /> Refresh
        </button>
      </div>

      {/* Platform Selector Filter */}
      <PlatformSelector selectedPlatform={selectedPlatform} onSelectPlatform={setSelectedPlatform} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Total Posts</span>
            <Video className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalPosts}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {Number(totalViews).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Total Likes</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {Number(totalLikes).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Total Comments</span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {Number(totalComments).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Total Shares</span>
            <Share2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {Number(totalShares).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Audience Reach</span>
            <Bookmark className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {Number(totalReach).toLocaleString()}
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">{error}</div>}

      {/* Content Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Search Bar */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-88">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search content title, topic, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50/80 border border-slate-200/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-800">{filteredContent.length}</strong> of {contentList.length} items
          </span>
        </div>

        {filteredContent.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            {loading ? "Loading content items..." : "No content matches the selected platform filter or search term."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5">Content Title</th>
                  <th className="px-6 py-3.5">Platform</th>
                  <th className="px-6 py-3.5">Published Date</th>
                  <th className="px-6 py-3.5">Views</th>
                  <th className="px-6 py-3.5">Likes</th>
                  <th className="px-6 py-3.5">Comments</th>
                  <th className="px-6 py-3.5">Shares</th>
                  <th className="px-6 py-3.5">Reach</th>
                  <th className="px-6 py-3.5 text-right">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContent.map((item, idx) => {
                  const engagement =
                    item.reach > 0
                      ? (((Number(item.likes || 0) + Number(item.comments || 0) + Number(item.shares || 0)) / item.reach) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <tr key={item.id ?? idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                        {item.title || item.content_title || "Untitled"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {item.platform || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-semibold">{item.published_date || "2026-08"}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{Number(item.views).toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600">{Number(item.likes).toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600">{Number(item.comments).toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600">{Number(item.shares).toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600">{Number(item.reach || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {engagement}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentAnalytics;

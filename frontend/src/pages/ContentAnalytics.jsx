import { useEffect, useState } from "react";
import { getContentReport, fetchYouTubeChannel, fetchYouTubeVideos } from "../services/api";
import PlatformSelector from "../components/PlatformSelector";
import { Video, Eye, Heart, MessageSquare, Share2, Search, RefreshCw, Bookmark, Sparkles, Filter, CheckCircle2, Youtube, AlertCircle } from "lucide-react";

function ContentAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [error, setError] = useState("");
  const [refreshNotice, setRefreshNotice] = useState("");

  // Live YouTube Channel Lookup State
  const [ytInput, setYtInput] = useState("");
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState("");
  const [ytData, setYtData] = useState(null);
  const [ytVideos, setYtVideos] = useState([]);

  const loadContent = async (platform = selectedPlatform, isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      setRefreshNotice("");
      const result = await getContentReport(platform);
      setData(result);
      if (isManualRefresh) {
        const timeStr = new Date().toLocaleTimeString();
        setRefreshNotice(`Content performance analytics refreshed at ${timeStr}`);
        setTimeout(() => setRefreshNotice(""), 4000);
      }
    } catch (err) {
      console.error("Content API error:", err);
      setError("Unable to load content analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContent(selectedPlatform);
  }, [selectedPlatform]);

  const handleFetchYouTubeChannel = async (e) => {
    if (e) e.preventDefault();
    if (!ytInput || !ytInput.trim()) {
      setYtError("Please enter a YouTube Channel ID or Channel URL.");
      return;
    }
    try {
      setYtLoading(true);
      setYtError("");
      setYtData(null);
      setYtVideos([]);

      const [channelData, videosData] = await Promise.all([
        fetchYouTubeChannel(ytInput.trim()),
        fetchYouTubeVideos(ytInput.trim(), 10).catch(() => []),
      ]);

      setYtData(channelData);
      setYtVideos(Array.isArray(videosData) ? videosData : []);
    } catch (err) {
      console.error("Fetch YouTube Channel error:", err);
      const detail = err.response?.data?.detail || err.message || "Failed to fetch YouTube channel info.";
      setYtError(detail);
    } finally {
      setYtLoading(false);
    }
  };

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
          onClick={() => loadContent(selectedPlatform, true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition shadow-2xs self-start cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {refreshNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{refreshNotice}</span>
        </div>
      )}

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

      {/* Real YouTube Channel Lookup Card (Visible above table) */}
      {(selectedPlatform === "YouTube" || selectedPlatform === "All") && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Youtube className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live YouTube Channel Lookup</h3>
                <p className="text-[11px] text-slate-500 font-medium">Fetch real-time channel profile and statistics directly from YouTube Data API v3</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              Live API
            </span>
          </div>

          <div className="p-6 space-y-4">
            <form onSubmit={handleFetchYouTubeChannel} className="space-y-3">
              <div>
                <label htmlFor="yt-channel-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  YouTube Channel ID or URL
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    id="yt-channel-input"
                    type="text"
                    value={ytInput}
                    onChange={(e) => setYtInput(e.target.value)}
                    placeholder="e.g. UCX6OQ3DkcsbYNE6H8uQQuVA or https://www.youtube.com/@MrBeast"
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={ytLoading || !ytInput.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    {ytLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        Fetch Channel
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Loading State */}
            {ytLoading && (
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-slate-600 flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-rose-600 animate-spin shrink-0" />
                <span>Fetching real YouTube channel information from YouTube API...</span>
              </div>
            )}

            {/* Error State */}
            {ytError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{ytError}</span>
              </div>
            )}

            {/* Real Channel Data Display */}
            {ytData && (
              <div className="p-5 bg-gradient-to-br from-slate-50 to-rose-50/30 border border-slate-200/90 rounded-xl space-y-4">
                <div className="flex items-start gap-4">
                  {ytData.thumbnail ? (
                    <img
                      src={ytData.thumbnail}
                      alt={ytData.title}
                      className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                      {ytData.title ? ytData.title.charAt(0) : "Y"}
                    </div>
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900 truncate">{ytData.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                        REAL YOUTUBE DATA
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      Channel ID: <span className="text-slate-700 font-semibold">{ytData.channel_id}</span>
                    </p>
                    {ytData.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 italic">
                        "{ytData.description}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/80">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscribers</span>
                    <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                      {typeof ytData.subscribers === "number" ? ytData.subscribers.toLocaleString() : ytData.subscribers}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Videos</span>
                    <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                      {typeof ytData.videos === "number" ? ytData.videos.toLocaleString() : ytData.videos}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Views</span>
                    <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                      {typeof ytData.views === "number" ? ytData.views.toLocaleString() : ytData.views}
                    </span>
                  </div>
                </div>

                {/* Real YouTube Videos Table */}
                {ytVideos.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-rose-600" /> Real Videos from YouTube ({ytVideos.length})
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">Fetched live via YouTube Data API v3</span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-2.5">Thumbnail</th>
                            <th className="px-4 py-2.5">Video Title</th>
                            <th className="px-4 py-2.5">Published Date</th>
                            <th className="px-4 py-2.5">Views</th>
                            <th className="px-4 py-2.5">Likes</th>
                            <th className="px-4 py-2.5">Comments</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ytVideos.map((v, i) => (
                            <tr key={v.video_id || v.id || i} className="hover:bg-slate-50/70 transition">
                              <td className="px-4 py-2.5">
                                {v.thumbnail ? (
                                  <img src={v.thumbnail} alt={v.title} className="w-16 h-10 object-cover rounded-md border border-slate-200 shrink-0" />
                                ) : (
                                  <div className="w-16 h-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 font-bold text-[10px]">No Image</div>
                                )}
                              </td>
                              <td className="px-4 py-2.5 font-bold text-slate-900 max-w-xs truncate">
                                {v.title}
                              </td>
                              <td className="px-4 py-2.5 text-slate-500 font-medium">{v.published_date || "-"}</td>
                              <td className="px-4 py-2.5 font-bold text-slate-900">{typeof v.views === "number" ? v.views.toLocaleString() : v.views}</td>
                              <td className="px-4 py-2.5 text-slate-600 font-medium">{typeof v.likes === "number" ? v.likes.toLocaleString() : v.likes}</td>
                              <td className="px-4 py-2.5 text-slate-600 font-medium">{typeof v.comments === "number" ? v.comments.toLocaleString() : v.comments}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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

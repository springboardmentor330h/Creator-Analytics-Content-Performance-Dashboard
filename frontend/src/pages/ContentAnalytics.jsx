import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function ContentAnalytics() {
  const [summary, setSummary] = useState(null);
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [summaryRes, listRes] = await Promise.all([
        api.get("/content/summary"),
        api.get("/content/"),
      ]);
      setSummary(summaryRes.data);
      setVideos(listRes.data);
    } catch (err) {
      setError("Could not load content analytics");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/content/sync", { search_query: searchQuery, max_results: 10 });
      await loadData();
      setSearchQuery("");
    } catch (err) {
      setError(err.response?.data?.detail || "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-6">
          <h1 className="mb-4 text-2xl font-semibold">Content Analytics</h1>

          <form onSubmit={handleSync} className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="Search YouTube (e.g. 'react tutorial')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 rounded border px-3 py-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Syncing..." : "Sync from YouTube"}
            </button>
          </form>

          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          {summary && (
            <div className="mb-6 grid grid-cols-4 gap-4">
              <div className="rounded-xl bg-white p-4 shadow">
                <p className="text-sm text-gray-500">Total Videos</p>
                <p className="text-2xl font-bold">{summary.total_videos}</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow">
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold">{summary.total_views.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow">
                <p className="text-sm text-gray-500">Total Likes</p>
                <p className="text-2xl font-bold">{summary.total_likes.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow">
                <p className="text-sm text-gray-500">Avg Engagement</p>
                <p className="text-2xl font-bold">{summary.avg_engagement_rate}%</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <div key={v.id} className="rounded-xl bg-white p-4 shadow">
                {v.thumbnail_url && (
                  <img src={v.thumbnail_url} alt={v.title} className="mb-2 w-full rounded" />
                )}
                <p className="font-medium line-clamp-2">{v.title}</p>
                <p className="text-sm text-gray-500">{v.channel_title}</p>
                <div className="mt-2 flex justify-between text-sm text-gray-600">
                  <span>👁 {v.views.toLocaleString()}</span>
                  <span>👍 {v.likes.toLocaleString()}</span>
                  <span>💬 {v.comments.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {videos.length === 0 && !error && (
            <p className="text-gray-500">No content synced yet — search above to pull videos from YouTube.</p>
          )}
        </main>
      </div>
    </div>
  );
}
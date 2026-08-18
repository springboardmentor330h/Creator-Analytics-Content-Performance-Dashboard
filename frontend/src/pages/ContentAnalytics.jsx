import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCreator } from "../context/CreatorContext";

export default function ContentAnalytics() {
  const { creatorId } = useCreator();
  const [content, setContent] = useState([]);
  const [summary, setSummary] = useState(null);
  const [topContent, setTopContent] = useState([]);
  const [platformPerf, setPlatformPerf] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    platform: "YouTube", content_title: "", views: 0, likes: 0,
    comments: 0, shares: 0, saves: 0, watch_time: 0, reach: 0,
    published_date: new Date().toISOString().slice(0, 10),
  });

  const loadData = async () => {
    setError("");
    try {
      const [contentRes, summaryRes, topRes, platRes] = await Promise.all([
        api.get("/content"),
        api.get("/analytics/summary"),
        api.get("/analytics/top-content"),
        api.get("/analytics/platform-performance"),
      ]);
      setContent(contentRes.data);
      setSummary(summaryRes.data);
      setTopContent(topRes.data);
      setPlatformPerf(platRes.data);
    } catch (err) {
      setError("Could not load content analytics");
    }
  };

  useEffect(() => { loadData(); }, [creatorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/content", {
        ...form,
        creator_id: creatorId,
        views: Number(form.views), likes: Number(form.likes), comments: Number(form.comments),
        shares: Number(form.shares), saves: Number(form.saves), watch_time: Number(form.watch_time),
        reach: Number(form.reach),
      });
      await loadData();
      setForm({ ...form, content_title: "", views: 0, likes: 0, comments: 0, shares: 0, saves: 0, watch_time: 0, reach: 0 });
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || "Failed to add content");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Content Analytics</h1>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          {summary && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Stat label="Total Content" value={summary.total_content} />
              <Stat label="Total Views" value={summary.total_views?.toLocaleString()} />
              <Stat label="Total Reach" value={summary.total_reach?.toLocaleString()} />
              <Stat label="Avg Engagement" value={`${summary.average_engagement_rate}%`} />
              <Stat label="Best Platform" value={summary.best_platform || "—"} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-white p-4 shadow sm:grid-cols-4 lg:grid-cols-8">
            <input name="content_title" placeholder="Title" value={form.content_title} onChange={handleChange} className="col-span-2 rounded border px-2 py-1 text-sm" required minLength={3} />
            <input name="platform" placeholder="Platform" value={form.platform} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="views" type="number" placeholder="Views" value={form.views} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="likes" type="number" placeholder="Likes" value={form.likes} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="comments" type="number" placeholder="Comments" value={form.comments} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="reach" type="number" placeholder="Reach" value={form.reach} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="published_date" type="date" value={form.published_date} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <button type="submit" className="col-span-2 rounded bg-indigo-600 px-3 py-1 text-sm text-white sm:col-span-1">Add</button>
          </form>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-2 font-medium">Top Performing Content</p>
              {topContent.map((c) => (
                <div key={c.content_id} className="flex justify-between border-b py-1 text-sm">
                  <span>{c.content_title} ({c.platform})</span>
                  <span className="font-semibold">{c.engagement_rate}%</span>
                </div>
              ))}
              {topContent.length === 0 && <p className="text-sm text-gray-500">No data yet.</p>}
            </div>

            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-2 font-medium">Platform Performance</p>
              {platformPerf.map((p) => (
                <div key={p.platform} className="flex justify-between border-b py-1 text-sm">
                  <span>{p.platform}</span>
                  <span>{p.total_views.toLocaleString()} views · {p.average_engagement_rate}%</span>
                </div>
              ))}
              {platformPerf.length === 0 && <p className="text-sm text-gray-500">No data yet.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.map((c) => (
              <div key={c.id} className="rounded-xl bg-white p-4 shadow">
                <p className="font-medium">{c.content_title}</p>
                <p className="text-sm text-gray-500">{c.platform}</p>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-gray-600 sm:text-sm">
                  <span>👁 {c.views.toLocaleString()}</span>
                  <span>👍 {c.likes.toLocaleString()}</span>
                  <span>💬 {c.comments.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow sm:p-4">
      <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
      <p className="text-lg font-bold sm:text-2xl">{value}</p>
    </div>
  );
}
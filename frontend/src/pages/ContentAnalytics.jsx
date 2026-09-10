import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import api from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusMessage";

export default function ContentAnalytics() {
  const [content, setContent] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/content/"), api.get("/analytics/top-content")])
      .then(([contentRes, topRes]) => {
        setContent(contentRes.data.data ?? []);
        setTopContent(topRes.data ?? []);
      })
      .catch(() => setError("Couldn't load content analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading content..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Content Analytics</h1>
        <p className="text-sm text-slate-400">Per-post performance across every connected platform.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" /> Top 5 by Engagement Rate
        </h2>
        {topContent.length === 0 ? (
          <EmptyState message="Nothing to rank yet." />
        ) : (
          <div className="space-y-2">
            {topContent.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-slate-100 py-2 last:border-0">
                <div>
                  <p className="font-medium text-slate-800">{c.content_title}</p>
                  <p className="text-xs text-slate-400">{c.platform}</p>
                </div>
                <span className="text-brand-600 font-semibold">{c.engagement_rate}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Likes</th>
              <th className="px-4 py-3">Reach</th>
              <th className="px-4 py-3">Published</th>
            </tr>
          </thead>
          <tbody>
            {content.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No content yet.</td></tr>
            ) : content.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{c.content_title}</td>
                <td className="px-4 py-3 text-slate-500">{c.platform}</td>
                <td className="px-4 py-3">{(c.views ?? 0).toLocaleString()}</td>
<td className="px-4 py-3">{(c.likes ?? 0).toLocaleString()}</td>
<td className="px-4 py-3">
  {c.reach == null ? "—" : c.reach.toLocaleString()}
</td>
                <td className="px-4 py-3 text-slate-400">{c.published_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

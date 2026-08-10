import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function GrowthTrends() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/growth/summary").then((res) => setSummary(res.data));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-6">
          <h1 className="mb-4 text-2xl font-semibold">Growth & Trend Analysis</h1>

          {summary && (
            <>
              <div className="mb-6 grid grid-cols-4 gap-4">
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="text-sm text-gray-500">Content Published</p>
                  <p className="text-2xl font-bold">{summary.total_content_growth}</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="text-sm text-gray-500">Avg Views / Video</p>
                  <p className="text-2xl font-bold">{summary.avg_views_per_video}</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="text-sm text-gray-500">Trend</p>
                  <p className="text-2xl font-bold capitalize">{summary.trending_direction}</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="text-sm text-gray-500">Predicted Reach</p>
                  <p className="text-2xl font-bold">{summary.reach_prediction_next_period.toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow">
                <p className="mb-2 font-medium">Top Keywords / Hashtags</p>
                <div className="flex flex-wrap gap-2">
                  {summary.top_hashtags.map((h) => (
                    <span key={h.tag} className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700">
                      #{h.tag} ({h.count})
                    </span>
                  ))}
                  {summary.top_hashtags.length === 0 && (
                    <p className="text-sm text-gray-500">Sync some content first to see trending keywords.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
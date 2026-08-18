import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCreator } from "../context/CreatorContext";

export default function GrowthTrends() {
  const { creatorId } = useCreator();
  const [hashtags, setHashtags] = useState([]);
  const [reachPred, setReachPred] = useState(null);
  const [contentGrowth, setContentGrowth] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [trend, setTrend] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const [h, r, c, f, t] = await Promise.all([
        api.get("/growth-trends/hashtags"),
        api.get(`/growth-trends/reach-prediction/${creatorId}`),
        api.get(`/growth-trends/content-growth/${creatorId}`),
        api.get(`/growth-trends/audience-forecast/${creatorId}`),
        api.get(`/growth-trends/trend-direction/${creatorId}`),
      ]);
      setHashtags(h.data);
      setReachPred(r.data);
      setContentGrowth(c.data);
      setForecast(f.data);
      setTrend(t.data.trend);
    } catch {
      setError("Could not load growth & trend data");
    }
  };

  useEffect(() => { load(); }, [creatorId]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Growth & Trend Analysis</h1>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Trend" value={trend || "—"} />
            <Stat label="Predicted Reach" value={reachPred?.predicted_reach_next_period?.toLocaleString() || "—"} />
            <Stat label="Forecasted Followers" value={forecast?.forecasted_followers?.toLocaleString() || "—"} />
            <Stat label="Daily Growth Rate" value={forecast?.daily_growth_rate ?? "—"} />
          </div>

          <div className="mb-6 rounded-xl bg-white p-4 shadow">
            <p className="mb-2 font-medium">Top Keywords / Hashtags</p>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((h) => (
                <span key={h.tag} className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700 sm:text-sm">
                  #{h.tag} ({h.count})
                </span>
              ))}
              {hashtags.length === 0 && <p className="text-sm text-gray-500">No content yet.</p>}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <p className="mb-2 font-medium">Content Growth by Month</p>
            {contentGrowth.map((m) => (
              <div key={m.month} className="flex justify-between border-b py-1 text-sm">
                <span>{m.month}</span>
                <span>{m.content_count} items</span>
              </div>
            ))}
            {contentGrowth.length === 0 && <p className="text-sm text-gray-500">No data yet.</p>}
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
      <p className="text-lg font-bold capitalize sm:text-2xl">{value}</p>
    </div>
  );
}
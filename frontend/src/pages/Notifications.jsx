import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCreator } from "../context/CreatorContext";

export default function Notifications() {
  const { creatorId } = useCreator();
  const [perfAlerts, setPerfAlerts] = useState([]);
  const [revAlerts, setRevAlerts] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const [p, r, w] = await Promise.all([
          api.get(`/notifications/performance-alerts/${creatorId}`),
          api.get(`/notifications/revenue-alerts/${creatorId}`),
          api.get(`/notifications/weekly-report/${creatorId}`),
        ]);
        setPerfAlerts(p.data);
        setRevAlerts(r.data);
        setWeekly(w.data);
      } catch {
        setError("Could not load notifications");
      }
    })();
  }, [creatorId]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Notifications & Reports</h1>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          {weekly && (
            <div className="mb-6 rounded-xl bg-white p-4 shadow text-sm">
              <p className="mb-2 font-medium">Weekly Report ({weekly.period})</p>
              <p>New Content: {weekly.new_content_count}</p>
              <p>Total Views: {weekly.total_views.toLocaleString()}</p>
              <p>Follower Growth: {weekly.follower_growth}</p>
              <p>Total Revenue: ${weekly.total_revenue}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-2 font-medium">Performance Alerts</p>
              {perfAlerts.map((a, i) => (
                <div key={i} className={`mb-1 rounded p-2 text-sm ${a.type === "high_performance" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {a.content_title}: {a.message} ({a.engagement_rate}%)
                </div>
              ))}
              {perfAlerts.length === 0 && <p className="text-sm text-gray-500">No alerts.</p>}
            </div>

            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-2 font-medium">Revenue Alerts</p>
              {revAlerts.map((a, i) => (
                <div key={i} className={`mb-1 rounded p-2 text-sm ${a.type === "revenue_spike" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {a.date}: {a.change_percentage}% change (${a.amount})
                </div>
              ))}
              {revAlerts.length === 0 && <p className="text-sm text-gray-500">No alerts.</p>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
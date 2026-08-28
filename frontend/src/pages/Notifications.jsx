import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCreator } from "../context/CreatorContext";

export default function Notifications() {
  const { creatorId } = useCreator();
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({ total: 0, unread: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError("");
    try {
      const [listRes, countRes] = await Promise.all([
        api.get(`/notifications/creator/${creatorId}`),
        api.get(`/notifications/creator/${creatorId}/count`),
      ]);
      setNotifications(listRes.data);
      setCounts(countRes.data);
    } catch (err) {
      setError(err.response?.status === 403 ? "You can only view your own notifications" : "Could not load notifications");
    }
  };

  useEffect(() => { load(); }, [creatorId]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post(`/notifications/generate/${creatorId}`);
      await load();
    } catch {
      setError("Failed to generate notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      await load();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put(`/notifications/creator/${creatorId}/read-all`);
      await load();
    } catch {}
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-semibold sm:text-2xl">
              Notifications {counts.unread > 0 && <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{counts.unread} unread</span>}
            </h1>
            <div className="flex gap-2">
              <button onClick={handleGenerate} disabled={loading} className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50">
                {loading ? "Scanning..." : "Check for New Alerts"}
              </button>
              <button onClick={handleMarkAllRead} className="rounded bg-gray-200 px-3 py-1.5 text-sm text-gray-700">
                Mark All Read
              </button>
            </div>
          </div>

          {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl p-4 shadow ${n.is_read ? "bg-white" : "bg-indigo-50 border border-indigo-200"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {n.title}
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        n.type === "revenue_alert" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {n.type.replace("_", " ")}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">{n.message}</p>
                    <p className="mt-1 text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id)} className="whitespace-nowrap text-xs text-indigo-600">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
            {notifications.length === 0 && !error && (
              <p className="text-sm text-gray-500">No notifications yet. Click "Check for New Alerts" to scan your data.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
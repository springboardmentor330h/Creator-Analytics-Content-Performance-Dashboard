import { useEffect, useState } from "react";
import api from "../api/axios";
import { LoadingState, EmptyState } from "../components/LoadingState";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => { api.get("/notifications").then((res) => setNotifications(res.data)); };

  useEffect(() => { fetchNotifications(); setLoading(false); }, []);

  const markRead = async (id) => { await api.put(`/notifications/${id}/read`); fetchNotifications(); };
  const generateAlerts = async () => { await api.post("/notifications/generate"); fetchNotifications(); };

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
        <button onClick={generateAlerts} className="px-4 py-2 text-sm text-white transition rounded-lg bg-brand-600 hover:bg-brand-700">Check for New Alerts</button>
      </div>

      {notifications.length === 0 ? <EmptyState message="No notifications yet." /> : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 rounded-2xl shadow-sm border flex justify-between items-start ${
              n.is_read
                ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                : "bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30"
            }`}>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{n.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{n.created_at}</p>
              </div>
              {!n.is_read && (
                <button onClick={() => markRead(n.id)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Mark read</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
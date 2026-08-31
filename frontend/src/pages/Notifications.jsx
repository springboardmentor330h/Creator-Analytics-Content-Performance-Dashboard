import { useEffect, useState } from "react";
import api from "../api/axios";
import { LoadingState, EmptyState } from "../components/LoadingState";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    api.get("/notifications").then((res) => setNotifications(res.data));
  };

  useEffect(() => {
    fetchNotifications();
    setLoading(false);
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const generateAlerts = async () => {
    await api.post("/notifications/generate");
    fetchNotifications();
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <button
          onClick={generateAlerts}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Check for New Alerts
        </button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState message="No notifications yet." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-lg shadow flex justify-between items-start ${
                n.is_read ? "bg-white" : "bg-blue-50 border-l-4 border-blue-500"
              }`}
            >
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{n.created_at}</p>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
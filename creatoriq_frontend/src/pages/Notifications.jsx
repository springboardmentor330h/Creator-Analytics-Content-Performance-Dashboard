import { useEffect, useState } from "react";
import api from "../services/api";

function Notifications() {
  const creatorId = 2;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/notifications/creator/${creatorId}`);
      setNotifications(response.data);
    } catch (err) {
      console.error("Notification API error:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "performance":
        return "bg-blue-100 text-blue-700";
      case "engagement":
        return "bg-green-100 text-green-700";
      case "revenue":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="dashboard-hero">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Updates</p>
              <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Notifications</h1>
              <p className="mt-2 text-sm text-indigo-100/90">Stay updated with your creator performance, engagement, and revenue alerts.</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              {unreadCount} unread
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <p className="text-slate-500">Loading notifications...</p>
          </div>
        )}

        {error && (
          <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="font-medium text-red-700">{error}</p>
            <button onClick={fetchNotifications} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-10 text-center shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <div className="text-4xl">🔔</div>
            <h2 className="mt-4 text-lg font-semibold text-slate-800">No notifications</h2>
            <p className="mt-2 text-slate-500">You are all caught up.</p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-[24px] border p-5 shadow-[0_12px_28px_rgba(148,163,184,0.08)] transition hover:shadow-[0_16px_34px_rgba(79,70,229,0.12)] ${
                  notification.is_read ? "border-slate-200 bg-white/90" : "border-violet-200 bg-violet-50/60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl shadow-inner shadow-slate-200">
                      {notification.type === "performance" ? "📈" : notification.type === "engagement" ? "❤️" : notification.type === "revenue" ? "💰" : "🔔"}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-900">{notification.title}</h2>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getTypeStyle(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
                      <p className="mt-3 text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {notification.is_read ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Read</span>
                    ) : (
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">Unread</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;


import { useEffect, useState } from "react";
import api from "./api";
import { useAuth } from "./context/AuthContext";

function Notifications() {
  const { user, checkingSession } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertTriggering, setAlertTriggering] = useState(false);

  const creatorId = user?.id;

  useEffect(() => {
    if (checkingSession) return;

    if (!creatorId) {
      setError("Unable to identify the current creator.");
      setLoading(false);
      return;
    }

    fetchNotifications(creatorId);
  }, [creatorId, checkingSession]);

  const fetchNotifications = async (id) => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/notifications/${id}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setError(err.response?.data?.detail || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    if (!creatorId) return;

    try {
      await api.put(`/notifications/${notificationId}/read`, null, {
        params: { creator_id: creatorId },
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch (err) {
      console.error("Mark as read error:", err);
      alert(err.response?.data?.detail || "Failed to mark as read.");
    }
  };

  const handleDelete = async (notificationId) => {
    if (!creatorId) return;

    try {
      await api.delete(`/notifications/${notificationId}`, {
        params: { creator_id: creatorId },
      });

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error("Delete notification error:", err);
      alert(err.response?.data?.detail || "Failed to delete notification.");
    }
  };

  const handleTriggerRevenueAlert = async () => {
    if (!creatorId) return;

    try {
      setAlertTriggering(true);

      await api.post(`/notifications/alerts/revenue/${creatorId}`);
      await fetchNotifications(creatorId);
    } catch (err) {
      console.error("Trigger alert error:", err);
      alert(
        err.response?.data?.detail || "Threshold not reached for new alert.",
      );
    } finally {
      setAlertTriggering(false);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading || checkingSession) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Loading Notifications...
        </h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500 mt-2">
            Stay updated with your account performance, revenue, and system
            alerts.
          </p>
        </div>

        <button
          onClick={handleTriggerRevenueAlert}
          disabled={alertTriggering || !creatorId}
          className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition shadow-sm self-start sm:self-auto disabled:opacity-50 text-sm"
        >
          {alertTriggering ? "Checking Alerts..." : "Check Revenue Alert"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Total Notifications</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {notifications.length}
            </h2>
          </div>
          <span className="text-2xl">🔔</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Unread Alerts</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2 text-indigo-600">
              {unreadCount}
            </h2>
          </div>
          <span className="text-2xl">📩</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                filter === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-white border text-gray-700 hover:bg-gray-100"
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                filter === "unread"
                  ? "bg-gray-900 text-white"
                  : "bg-white border text-gray-700 hover:bg-gray-100"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {filteredNotifications.length > 0 ? (
          <div className="divide-y">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                  item.is_read ? "bg-white" : "bg-blue-50/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                    {item.notification_type?.toLowerCase().includes("revenue")
                      ? "💰"
                      : item.notification_type
                            ?.toLowerCase()
                            .includes("performance")
                        ? "📈"
                        : item.notification_type
                              ?.toLowerCase()
                              .includes("engagement")
                          ? "💬"
                          : "📣"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {item.title}
                      </h3>

                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}

                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {item.notification_type}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{item.message}</p>

                    <span className="text-xs text-gray-400 mt-2 block">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
                    >
                      Mark as Read
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium text-gray-700">
              No notifications found.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              You're all caught up! New alerts will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;

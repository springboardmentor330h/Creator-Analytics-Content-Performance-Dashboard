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

      const response = await api.get(
        `/notifications/creator/${creatorId}`
      );

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
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 md:p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Notifications
        </h1>

        <p className="mt-2 text-gray-600">
          Stay updated with your creator performance, engagement,
          and revenue alerts.
        </p>
      </div>

      {loading && (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-gray-500">
            Loading notifications...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            {error}
          </p>

          <button
            onClick={fetchNotifications}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="rounded-xl border bg-white p-10 text-center">
          <div className="text-4xl">
            🔔
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            No notifications
          </h2>

          <p className="mt-2 text-gray-500">
            You are all caught up.
          </p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-4">

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
                notification.is_read
                  ? "bg-white"
                  : "border-blue-200 bg-blue-50"
              }`}
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl">
                    {notification.type === "performance"
                      ? "📈"
                      : notification.type === "engagement"
                        ? "❤️"
                        : notification.type === "revenue"
                          ? "💰"
                          : "🔔"}
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="font-semibold text-gray-900">
                        {notification.title}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getTypeStyle(
                          notification.type
                        )}`}
                      >
                        {notification.type}
                      </span>

                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {notification.message}
                    </p>

                    <p className="mt-3 text-xs text-gray-400">
                      {new Date(
                        notification.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                </div>

                <div className="shrink-0">

                  {notification.is_read ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                      Read
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      Unread
                    </span>
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Notifications;


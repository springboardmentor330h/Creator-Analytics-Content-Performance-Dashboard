
import { useEffect, useState } from "react";
import api from "../api/axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        setNotifications(response.data);
      } catch (err) {
        console.error("Notifications API Error:", err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Notifications
        </h1>
        <p className="mt-3 text-slate-500">
          Loading notifications...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Notifications
        </h1>
        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Notifications
        </h1>

        <p className="mt-2 text-slate-500">
          Stay updated with your creator analytics and activities.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-slate-500">
            No notifications available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white p-5 shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-800">
                    {item.title || item.notification_type || "Notification"}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {item.message || item.description || ""}
                  </p>
                </div>

                {item.is_read !== undefined && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.is_read
                        ? "bg-slate-100 text-slate-600"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {item.is_read ? "Read" : "New"}
                  </span>
                )}
              </div>

              {item.created_at && (
                <p className="mt-3 text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;


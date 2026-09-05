import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICard from "../components/KPICard";
import PageState from "../components/PageState";
import { getNotifications, markNotificationRead, checkAlerts } from "../api/notifications";

// See note in Revenue.jsx — fixed test creator_id for now.
const TEST_CREATOR_ID = 1;

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const loadNotifications = () => {
    setLoading(true);
    getNotifications(TEST_CREATOR_ID)
      .then(setNotifications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadNotifications, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id, TEST_CREATOR_ID);
      loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckAlerts = async () => {
    setChecking(true);
    try {
      await checkAlerts(TEST_CREATOR_ID);
      loadNotifications();
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <button
              onClick={handleCheckAlerts}
              disabled={checking}
              className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {checking ? "Checking…" : "Check for New Alerts"}
            </button>
          </div>

          <PageState loading={loading} error={error}>
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <KPICard label="Total Notifications" value={notifications.length} />
                <KPICard label="Unread" value={unreadCount} />
              </div>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-400 shadow">
                    No notifications yet. Click "Check for New Alerts" to scan your latest data.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start justify-between rounded-xl p-4 shadow ${
                        n.is_read ? "bg-white" : "bg-indigo-50 border border-indigo-200"
                      }`}
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">{n.type}</p>
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-sm text-gray-600">{n.message}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="shrink-0 rounded border border-indigo-300 px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-100"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          </PageState>
        </main>
      </div>
    </div>
  );
}
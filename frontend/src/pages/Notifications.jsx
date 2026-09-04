import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  checkForNewAlerts,
} from "../services/api";
import {
  Bell,
  CheckCheck,
  Zap,
  TrendingUp,
  Award,
  DollarSign,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

function Notifications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAlerts, setCheckingAlerts] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getNotifications();
      setData(result);
    } catch (err) {
      console.error("Notifications API error:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setActionMessage("All notifications marked as read.");
      setTimeout(() => setActionMessage(""), 3000);
      loadNotifications();
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  const handleCheckAlerts = async () => {
    try {
      setCheckingAlerts(true);
      const res = await checkForNewAlerts();
      setActionMessage(res.message || "Alert check completed.");
      setTimeout(() => setActionMessage(""), 4000);
      loadNotifications();
    } catch (err) {
      console.error("Alert check error:", err);
    } finally {
      setCheckingAlerts(false);
    }
  };

  const notificationList = Array.isArray(data) ? data : data?.data || [];
  const unreadCount = notificationList.filter((n) => !n.is_read).length;

  const getTypeBadge = (type) => {
    switch (type) {
      case "performance":
        return {
          icon: Award,
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
          label: "Performance",
        };
      case "growth":
        return {
          icon: TrendingUp,
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "Growth",
        };
      case "revenue":
        return {
          icon: DollarSign,
          color: "bg-amber-50 text-amber-700 border-amber-200",
          label: "Revenue",
        };
      case "engagement":
        return {
          icon: Zap,
          color: "bg-purple-50 text-purple-700 border-purple-200",
          label: "Engagement",
        };
      case "sponsorship":
        return {
          icon: Award,
          color: "bg-blue-50 text-blue-700 border-blue-200",
          label: "Sponsorship",
        };
      case "report":
        return {
          icon: FileText,
          color: "bg-slate-100 text-slate-700 border-slate-200",
          label: "Report",
        };
      default:
        return {
          icon: Bell,
          color: "bg-slate-100 text-slate-700 border-slate-200",
          label: type || "Alert",
        };
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications & Alerts</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">Real-time alerts on content spikes, milestones, and brand deals</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCheckAlerts}
            disabled={checkingAlerts}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingAlerts ? "animate-spin" : ""}`} />
            {checkingAlerts ? "Checking..." : "Sync Live Alerts"}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-slate-600" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium">
          {actionMessage}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500">Loading alerts...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Notifications List */}
      {!loading && !error && notificationList.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">No Notifications</h3>
          <p className="text-xs text-slate-400 mt-1">You are all caught up on alerts and milestones.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificationList.map((notification) => {
            const badge = getTypeBadge(notification.notification_type);
            const Icon = badge.icon;
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border transition-all duration-150 flex items-start justify-between gap-4 ${
                  notification.is_read
                    ? "bg-white border-slate-200"
                    : "bg-indigo-50/40 border-indigo-200 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2 rounded-lg border shrink-0 ${badge.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{notification.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notification.message}</p>
                    <span className="text-[11px] text-slate-400 mt-2 block">
                      {new Date(notification.created_at || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 px-2.5 py-1 rounded hover:bg-indigo-100/50 transition"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;

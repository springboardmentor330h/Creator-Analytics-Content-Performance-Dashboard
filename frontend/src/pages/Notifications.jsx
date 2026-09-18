import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getCurrentUser } from "../services/auth";

function Notifications() {
  const [creatorId, setCreatorId] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [generating, setGenerating] = useState(false);

  // --------------------------------------------------
  // FETCH NOTIFICATIONS
  // --------------------------------------------------
  const fetchNotifications = async (currentCreatorId) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications/", {
        params: {
          creator_id: currentCreatorId,
        },
      });

      const result = response.data?.data ?? response.data;

      setNotifications(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load notifications. Please make sure the backend is running."
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD CURRENT USER
  // --------------------------------------------------
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const user = await getCurrentUser();
        const currentCreatorId = user?.id;

        if (!currentCreatorId) {
          throw new Error("Unable to determine the logged-in user.");
        }

        setCreatorId(currentCreatorId);

        await fetchNotifications(currentCreatorId);
      } catch (err) {
        console.error("Failed to load current user:", err);

        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Unable to load notifications."
        );

        setNotifications([]);
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------
  const statistics = useMemo(() => {
    const total = notifications.length;

    const unread = notifications.filter(
      (notification) => !notification.is_read
    ).length;

    const read = total - unread;

    const highPriority = notifications.filter((notification) => {
      const priority = String(
        notification.priority || ""
      ).toLowerCase();

      return (
        priority === "high" ||
        priority === "critical" ||
        priority === "urgent"
      );
    }).length;

    return {
      total,
      unread,
      read,
      highPriority,
    };
  }, [notifications]);

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------
  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --------------------------------------------------
  // PRIORITY STYLING
  // --------------------------------------------------
  const getPriorityClasses = (priority) => {
    const normalized = String(
      priority || ""
    ).toLowerCase();

    if (
      normalized === "critical" ||
      normalized === "urgent"
    ) {
      return "border-red-500/20 bg-red-500/10 text-red-400";
    }

    if (normalized === "high") {
      return "border-orange-500/20 bg-orange-500/10 text-orange-400";
    }

    if (normalized === "medium") {
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    }

    if (normalized === "low") {
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    }

    return "border-white/10 bg-white/5 text-gray-400";
  };

  // --------------------------------------------------
  // TYPE STYLING
  // --------------------------------------------------
  const getTypeClasses = (type) => {
    const normalized = String(type || "").toLowerCase();

    if (
      normalized.includes("revenue") ||
      normalized.includes("earning")
    ) {
      return "bg-emerald-500/10 text-emerald-400";
    }

    if (
      normalized.includes("audience") ||
      normalized.includes("growth")
    ) {
      return "bg-blue-500/10 text-blue-400";
    }

    if (
      normalized.includes("content") ||
      normalized.includes("engagement")
    ) {
      return "bg-purple-500/10 text-purple-400";
    }

    if (
      normalized.includes("sponsor") ||
      normalized.includes("brand")
    ) {
      return "bg-orange-500/10 text-orange-400";
    }

    return "bg-white/5 text-gray-400";
  };

  // --------------------------------------------------
  // MARK AS READ
  // --------------------------------------------------
  const markAsRead = async (notificationId) => {
    if (!creatorId || !notificationId) {
      return;
    }

    try {
      await api.put(
        `/notifications/${notificationId}/read`,
        {},
        {
          params: {
            creator_id: creatorId,
          },
        }
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );
    }
  };

  // --------------------------------------------------
  // MARK ALL AS READ
  // --------------------------------------------------
  const markAllAsRead = async () => {
    if (!creatorId || notifications.length === 0) {
      return;
    }

    try {
      await api.put(
        "/notifications/read-all",
        {},
        {
          params: {
            creator_id: creatorId,
          },
        }
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to mark all notifications as read."
      );
    }
  };

  // --------------------------------------------------
  // GENERATE ALERTS
  // --------------------------------------------------
  const generateAlerts = async () => {
    if (!creatorId) {
      return;
    }

    try {
      setGenerating(true);
      setError("");

      await api.post(
        `/notifications/generate/${creatorId}`
      );

      await fetchNotifications(creatorId);
    } catch (err) {
      console.error("Failed to generate alerts:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to generate alerts."
      );
    } finally {
      setGenerating(false);
    }
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-52 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-white/5" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl border border-white/10 bg-[#151515]"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-xl border border-white/10 bg-[#151515]" />
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------
  if (error && notifications.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Alerts and important updates from your creator
            dashboard.
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              !
            </div>

            <div>
              <h2 className="font-semibold text-red-400">
                Unable to load notifications
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {error}
              </p>

              <button
                onClick={() =>
                  creatorId &&
                  fetchNotifications(creatorId)
                }
                className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-medium text-purple-400">
            CREATOR ALERTS
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Stay updated with important changes across your
            creator analytics.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={() =>
              creatorId &&
              fetchNotifications(creatorId)
            }
            className="rounded-lg border border-white/10 bg-[#151515] px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-white"
          >
            Refresh
          </button>

          <button
            onClick={markAllAsRead}
            disabled={statistics.unread === 0}
            className="rounded-lg border border-white/10 bg-[#151515] px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark all as read
          </button>

          <button
            onClick={generateAlerts}
            disabled={generating || !creatorId}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating
              ? "Generating..."
              : "Generate Alerts"}
          </button>

        </div>
      </div>

      {/* INLINE ERROR */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}
        <div className="rounded-xl border border-white/10 bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Total Alerts
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              🔔
            </div>

          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {statistics.total}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            All notifications
          </p>

        </div>

        {/* UNREAD */}
        <div className="rounded-xl border border-white/10 bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Unread
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              ●
            </div>

          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {statistics.unread}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Require your attention
          </p>

        </div>

        {/* READ */}
        <div className="rounded-xl border border-white/10 bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Read
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              ✓
            </div>

          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {statistics.read}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Already reviewed
          </p>

        </div>

        {/* HIGH PRIORITY */}
        <div className="rounded-xl border border-white/10 bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              High Priority
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              !
            </div>

          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {statistics.highPriority}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Important notifications
          </p>

        </div>

      </div>

      {/* NOTIFICATION LIST */}
      <div className="rounded-xl border border-white/10 bg-[#151515]">

        <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-6 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Notifications
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Alerts generated from your creator activity.
            </p>
          </div>

          <div className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
            {statistics.unread} unread
          </div>

        </div>

        {notifications.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center px-6">

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-2xl">
                🔔
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-300">
                No notifications
              </h3>

              <p className="mt-1 text-xs text-gray-600">
                You currently have no alerts to review.
              </p>

            </div>

          </div>
        ) : (
          <div className="divide-y divide-white/5">

            {notifications.map((notification) => {

              const isUnread = !notification.is_read;

              return (
                <div
                  key={notification.id}
                  className={`p-5 transition hover:bg-white/[0.02] ${
                    isUnread
                      ? "bg-purple-500/[0.025]"
                      : ""
                  }`}
                >

                  <div className="flex gap-4">

                    {/* ICON */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getTypeClasses(
                        notification.type
                      )}`}
                    >
                      {String(
                        notification.type || "alert"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col justify-between gap-2 lg:flex-row">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-white">
                              {notification.title ||
                                notification.message ||
                                "Notification"}
                            </h3>

                            {isUnread && (
                              <span className="h-2 w-2 rounded-full bg-purple-400" />
                            )}

                          </div>

                          {notification.message &&
                            notification.title && (
                              <p className="mt-2 text-sm leading-6 text-gray-400">
                                {notification.message}
                              </p>
                            )}

                        </div>

                        <div className="shrink-0 text-xs text-gray-600">
                          {formatDate(
                            notification.created_at ||
                              notification.createdAt ||
                              notification.date
                          )}
                        </div>

                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">

                        {notification.type && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getTypeClasses(
                              notification.type
                            )}`}
                          >
                            {notification.type}
                          </span>
                        )}

                        {notification.priority && (
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getPriorityClasses(
                              notification.priority
                            )}`}
                          >
                            {notification.priority}
                          </span>
                        )}

                        {isUnread && (
                          <button
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                            className="ml-auto rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-400"
                          >
                            Mark as read
                          </button>
                        )}

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* FOOTER INFO */}
      <div className="rounded-xl border border-purple-500/10 bg-purple-500/[0.03] p-5">

        <div className="flex gap-3">

          <div className="mt-0.5 text-purple-400">
            ●
          </div>

          <div>

            <h3 className="text-sm font-semibold text-gray-200">
              Stay informed
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Notifications help surface important changes in
              your content performance, audience growth, revenue,
              sponsorships, and other creator activity.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Notifications;
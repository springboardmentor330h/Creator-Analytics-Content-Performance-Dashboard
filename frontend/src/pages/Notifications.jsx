import { useEffect, useState } from "react";
import { Bell, RefreshCw, DollarSign, TrendingUp } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusMessage";

const ICONS = { performance: TrendingUp, revenue: DollarSign, system: Bell };

export default function Notifications() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const load = () => {
    if (!user) return;
    api.get(`/notifications/creator/${user.id}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Couldn't load notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const generate = async () => {
    setGenerating(true);
    try {
      await api.post(`/notifications/generate/${user.id}`);
      load();
    } finally {
      setGenerating(false);
    }
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  if (loading) return <LoadingState label="Loading notifications..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-400">{data?.unread ?? 0} unread of {data?.total ?? 0} total</p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm px-3 py-2 rounded-lg"
        >
          <RefreshCw size={14} className={generating ? "animate-spin" : ""} /> Check for alerts
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {(data?.notifications?.length ?? 0) === 0 ? (
          <EmptyState message='No notifications yet — click "Check for alerts".' />
        ) : data.notifications.map((n) => {
          const Icon = ICONS[n.notification_type] || Bell;
          return (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.is_read ? "opacity-60" : ""}`}>
              <Icon size={18} className="text-brand-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-300 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && (
                <button onClick={() => markRead(n.id)} className="text-xs text-brand-600 hover:text-brand-700 shrink-0">
                  Mark read
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

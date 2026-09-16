import { useEffect, useState } from "react";
import { Activity, Clock, RefreshCw, ShieldCheck, UserX, Sparkles } from "lucide-react";

import api from "../../api/client";
import SpotlightCard from "../../components/SpotlightCard";
import { LoadingState, ErrorState, EmptyState } from "../../components/StatusMessage";
import { RoleBadge, ToastBanner, useAdminToast } from "../../components/admin/AdminUiKit";

export default function AdminActivity() {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);
  const [toast, showToast] = useAdminToast();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/recent-signups", { params: { limit: 20 } });
      setSignups(res.data ?? []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't load recent activity. Make sure you're signed in as an Administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const promote = async (u) => {
    setBusyUserId(u.id);
    try {
      await api.put(`/users/${u.id}`, { role: "Administrator" });
      setSignups((prev) => prev.map((s) => (s.id === u.id ? { ...s, role: "Administrator" } : s)));
      showToast("success", `${u.full_name} is now an Administrator.`);
    } catch (err) {
      showToast("error", err.response?.data?.detail || "Couldn't promote user.");
    } finally {
      setBusyUserId(null);
    }
  };

  const suspend = async (u) => {
    setBusyUserId(u.id);
    try {
      await api.put(`/users/${u.id}`, { is_active: false });
      setSignups((prev) => prev.map((s) => (s.id === u.id ? { ...s, is_active: false } : s)));
      showToast("success", `${u.full_name} was suspended.`);
    } catch (err) {
      showToast("error", err.response?.data?.detail || "Couldn't suspend user.");
    } finally {
      setBusyUserId(null);
    }
  };

  if (loading) return <LoadingState label="Loading recent activity..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6 pb-8">
      <ToastBanner toast={toast} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-2 text-white shadow-lg shadow-amber-500/30">
              <Activity size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recent Activity</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <Sparkles size={12} /> Administrator
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">The newest accounts on the platform, with quick moderation actions.</p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {signups.length === 0 ? (
          <EmptyState message="No signups yet." />
        ) : (
          <div className="space-y-2">
            {signups.map((u) => {
              const isBusy = busyUserId === u.id;
              return (
                <SpotlightCard
                  key={u.id}
                  tilt={false}
                  className="rounded-xl border border-slate-100 px-3 py-2.5 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                        {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{u.full_name}</p>
                        <p className="truncate text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <RoleBadge role={u.role} />
                      <span className="hidden items-center gap-1 text-xs text-slate-400 sm:inline-flex">
                        <Clock size={12} />
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </span>

                      {u.role !== "Administrator" && (
                        <button
                          disabled={isBusy}
                          onClick={() => promote(u)}
                          title="Promote to Administrator"
                          className="rounded-lg p-1.5 text-amber-600 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ShieldCheck size={16} />
                        </button>
                      )}
                      {u.is_active && (
                        <button
                          disabled={isBusy}
                          onClick={() => suspend(u)}
                          title="Suspend user"
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <UserX size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

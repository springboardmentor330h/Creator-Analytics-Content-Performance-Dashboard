import { useEffect, useState } from "react";
import { Trophy, RefreshCw, Sparkles } from "lucide-react";

import api from "../../api/client";
import SpotlightCard from "../../components/SpotlightCard";
import { LoadingState, ErrorState, EmptyState } from "../../components/StatusMessage";
import { formatNumber, platformColor, RankBadge } from "../../components/admin/AdminUiKit";

export default function AdminCreators() {
  const [topCreators, setTopCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/top-creators", { params: { limit: 20 } });
      setTopCreators(res.data ?? []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't load top creators. Make sure you're signed in as an Administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingState label="Loading top creators..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-2 text-white shadow-lg shadow-amber-500/30">
              <Trophy size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Top Content Creators</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <Sparkles size={12} /> Administrator
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Ranked by total views across everything each creator has published.
          </p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {topCreators.length === 0 ? (
          <EmptyState message="No creator content synced yet." />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {topCreators.map((c, i) => (
              <SpotlightCard
                key={c.creator_id}
                tilt={false}
                glowColor="99, 102, 241"
                className="rounded-xl border border-slate-100 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/20"
              >
                <div className="flex items-center gap-3">
                  <RankBadge rank={i} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{c.full_name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {c.content_count} posts · top on{" "}
                      <span style={{ color: platformColor(c.top_platform) }} className="font-medium">
                        {c.top_platform || "—"}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-600">{formatNumber(c.total_views)}</p>
                    <p className="text-[11px] text-slate-400">views</p>
                  </div>
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                    style={{ width: `${Math.min(c.average_engagement_rate * 4, 100)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{c.average_engagement_rate}% avg engagement</span>
                  <span>{formatNumber(c.total_likes)} likes</span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

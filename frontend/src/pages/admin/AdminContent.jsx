import { useEffect, useState } from "react";
import { Layers, Eye, Radio, RefreshCw, Sparkles } from "lucide-react";

import api from "../../api/client";
import SpotlightCard from "../../components/SpotlightCard";
import { LoadingState, ErrorState, EmptyState } from "../../components/StatusMessage";
import { formatNumber, platformColor } from "../../components/admin/AdminUiKit";

export default function AdminContent() {
  const [byPlatform, setByPlatform] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/top-content", { params: { limit_per_platform: 6 } });
      setByPlatform(res.data ?? []);
      setActiveTab(res.data?.[0]?.platform ?? null);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't load top content. Make sure you're signed in as an Administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingState label="Loading top content..." />;
  if (error) return <ErrorState message={error} />;

  const activeData = byPlatform.find((p) => p.platform === activeTab);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-2 text-white shadow-lg shadow-amber-500/30">
              <Layers size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Top Content by Platform</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <Sparkles size={12} /> Administrator
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">The best-performing content on each connected platform, across all creators.</p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {byPlatform.length === 0 ? (
          <EmptyState message="No content synced yet." />
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {byPlatform.map((p) => (
                <button
                  key={p.platform}
                  onClick={() => setActiveTab(p.platform)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTab === p.platform ? "text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  style={activeTab === p.platform ? { backgroundColor: platformColor(p.platform) } : {}}
                >
                  {p.platform}
                  <span className="ml-1.5 opacity-70">({p.content_count})</span>
                </button>
              ))}
            </div>

            {!activeData ? (
              <EmptyState message="No content on this platform yet." />
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activeData.top_content.map((item, idx) => (
                  <SpotlightCard
                    key={item.content_id}
                    tilt={false}
                    className="rounded-xl border border-slate-100 p-4 hover:border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          #{idx + 1} {item.content_title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">by {item.creator_name}</p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: `${platformColor(activeTab)}1a`, color: platformColor(activeTab) }}
                      >
                        {item.engagement_rate}%
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {formatNumber(item.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Radio size={12} /> {formatNumber(item.reach)}
                      </span>
                      {item.published_date && <span className="ml-auto text-slate-400">{item.published_date}</span>}
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { getAllContent } from "../services/api";
import { useAuth } from "../context/AuthContext";

const PLATFORM_STYLES = {
  YouTube: "bg-red-500/10 text-red-300 border-red-500/20",
  Instagram: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  TikTok: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  LinkedIn: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Facebook: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  X: "bg-slate-700/50 text-slate-200 border-slate-600",
};

function ContentAnalytics() {
  const { user } = useAuth();
  const creatorId = user?.id;
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [platform, setPlatform] = useState("All");

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllContent(creatorId);
        setContent(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Content analytics error:", err);
        setError("Unable to load content analytics from the backend.");
      } finally {
        setLoading(false);
      }
    };

    if (!creatorId) {
      setLoading(false);
      return;
    }

    loadContent();
  }, [creatorId]);

  const platforms = useMemo(() => {
    return ["All", ...Array.from(new Set(content.map((item) => item.platform).filter(Boolean)))];
  }, [content]);

  const filteredContent = useMemo(() => {
    if (platform === "All") return content;
    return content.filter((item) => item.platform === platform);
  }, [content, platform]);

  const metrics = useMemo(() => {
    const totalViews = filteredContent.reduce((sum, item) => sum + Number(item.views || 0), 0);
    const totalLikes = filteredContent.reduce((sum, item) => sum + Number(item.likes || 0), 0);
    const totalComments = filteredContent.reduce((sum, item) => sum + Number(item.comments || 0), 0);
    const totalShares = filteredContent.reduce((sum, item) => sum + Number(item.shares || 0), 0);
    const totalSaves = filteredContent.reduce((sum, item) => sum + Number(item.saves || 0), 0);
    const totalReach = filteredContent.reduce((sum, item) => sum + Number(item.reach || 0), 0);
    const engagementActions = totalLikes + totalComments + totalShares + totalSaves;
    const engagementRate = totalViews > 0 ? ((engagementActions / totalViews) * 100).toFixed(2) : "0.00";

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      totalReach,
      engagementActions,
      engagementRate,
    };
  }, [filteredContent]);

  const platformData = useMemo(() => {
    const grouped = {};

    filteredContent.forEach((item) => {
      const name = item.platform || "Unknown";

      if (!grouped[name]) {
        grouped[name] = {
          platform: name,
          content: 0,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          reach: 0,
        };
      }

      grouped[name].content += 1;
      grouped[name].views += Number(item.views || 0);
      grouped[name].likes += Number(item.likes || 0);
      grouped[name].comments += Number(item.comments || 0);
      grouped[name].shares += Number(item.shares || 0);
      grouped[name].saves += Number(item.saves || 0);
      grouped[name].reach += Number(item.reach || 0);
    });

    return Object.values(grouped).sort((a, b) => b.views - a.views);
  }, [filteredContent]);

  const topContent = useMemo(() => {
    return [...filteredContent]
      .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
      .slice(0, 5);
  }, [filteredContent]);

  const recentContent = useMemo(() => {
    return [...filteredContent]
      .sort((a, b) => new Date(b.published_date || 0) - new Date(a.published_date || 0))
      .slice(0, 5);
  }, [filteredContent]);

  if (loading) {
    return (
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="dashboard-hero">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Content insights</p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Content Analytics</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="stat-card stat-card-indigo opacity-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="dashboard-hero">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Content insights</p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Content Analytics</h1>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="font-medium text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="dashboard-hero">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Content insights</p>
              <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Content Analytics</h1>
              <p className="mt-2 text-sm text-indigo-100/90">Analyze content performance across platforms</p>
            </div>

          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(148,163,184,0.12)] backdrop-blur-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Platform</p>
          <div className="flex flex-wrap gap-2">
            {platforms.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPlatform(item)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  platform === item
                    ? "border-violet-500/50 bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filteredContent.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-10 text-center shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <div className="text-4xl">📭</div>
            <h2 className="mt-4 text-xl font-semibold text-slate-800">No content available</h2>
            <p className="mt-2 text-slate-500">There is no content for the selected platform.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Total Views" value={formatNumber(metrics.totalViews)} subtitle="Across selected content" icon="👁" tone="indigo" />
              <MetricCard title="Total Reach" value={formatNumber(metrics.totalReach)} subtitle="Combined audience reach" icon="🌐" tone="sky" />
              <MetricCard title="Total Likes" value={formatNumber(metrics.totalLikes)} subtitle="Audience appreciation" icon="❤️" tone="emerald" />
              <MetricCard title="Engagement Rate" value={`${metrics.engagementRate}%`} subtitle="Likes, comments, shares & saves" icon="⚡" tone="dark" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <MiniMetric title="Comments" value={metrics.totalComments} tone="slate" />
              <MiniMetric title="Shares" value={metrics.totalShares} tone="violet" />
              <MiniMetric title="Saves" value={metrics.totalSaves} tone="emerald" />
            </div>

            <section className="dashboard-panel">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Platform Performance</h2>
                  <p className="mt-1 text-sm text-slate-500">Compare total views and reach across platforms</p>
                </div>
                <span className="chart-badge chart-badge-live">Overview</span>
              </div>

              <div className="mt-6 space-y-6">
                {platformData.map((item) => {
                  const maxViews = Math.max(...platformData.map((p) => p.views), 1);
                  const width = (item.views / maxViews) * 100;
                  const engagement = item.views > 0 ? (((item.likes + item.comments + item.shares + item.saves) / item.views) * 100).toFixed(2) : "0.00";

                  return (
                    <div key={item.platform}>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <PlatformBadge platform={item.platform} />
                          <span className="text-sm text-slate-500">{item.content} content</span>
                        </div>

                        <div className="flex gap-4 text-sm">
                          <span className="font-semibold text-slate-800">{formatNumber(item.views)} views</span>
                          <span className="text-violet-600">{engagement}% engagement</span>
                        </div>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-500 transition-all duration-700" style={{ width: `${width}%` }} />
                      </div>

                      <div className="mt-2 flex justify-between text-xs text-slate-500">
                        <span>Reach: {formatNumber(item.reach)}</span>
                        <span>Likes: {formatNumber(item.likes)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <PerformanceTrend content={filteredContent} />
              <EngagementBreakdown metrics={metrics} />
            </div>

            <section className="content-table-card">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Top Performing Content</h2>
                  <p className="mt-1 text-sm text-slate-300">Your highest-reach content, ranked by views</p>
                </div>
                <span className="w-fit rounded-full border border-violet-300/30 bg-violet-400/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">Top 5</span>
              </div>

              <div className="overflow-x-auto">
                <table className="dashboard-table w-full text-left min-w-[850px]">
                  <thead>
                    <tr>
                      <th>Content</th>
                      <th>Platform</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Engagement</th>
                      <th>Reach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topContent.map((item, index) => {
                      const views = Number(item.views || 0);
                      const engagement = views > 0 ? (((Number(item.likes || 0) + Number(item.comments || 0) + Number(item.shares || 0) + Number(item.saves || 0)) / views) * 100).toFixed(2) : "0.00";

                      return (
                        <tr key={item.id} className="group">
                          <td>
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/30 bg-violet-400/15 text-sm font-bold text-violet-200">{index + 1}</span>
                              <div className="min-w-0">
                                <div className="max-w-[320px] truncate font-semibold text-white group-hover:text-violet-200">{item.content_title || "Untitled Content"}</div>
                                <div className="mt-1 text-xs text-slate-400">Published {item.published_date || "Unknown date"}</div>
                              </div>
                            </div>
                          </td>
                          <td><PlatformBadge platform={item.platform} /></td>
                          <td><span className="font-bold text-white">{formatNumber(item.views)}</span><span className="mt-1 block text-[11px] uppercase tracking-wide text-slate-400">Views</span></td>
                          <td><span className="font-semibold text-emerald-300">{formatNumber(item.likes)}</span><span className="mt-1 block text-[11px] uppercase tracking-wide text-slate-400">Likes</span></td>
                          <td><span className="inline-flex rounded-full bg-violet-400/15 px-2.5 py-1 font-bold text-violet-200">{engagement}%</span><span className="mt-1 block text-[11px] uppercase tracking-wide text-slate-400">Rate</span></td>
                          <td><span className="font-semibold text-sky-200">{formatNumber(item.reach)}</span><span className="mt-1 block text-[11px] uppercase tracking-wide text-slate-400">Reach</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="content-table-card mt-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Recent Content</h2>
                  <p className="mt-1 text-sm text-slate-300">Latest published content from your analytics</p>
                </div>
                <span className="w-fit rounded-full border border-sky-300/30 bg-sky-400/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">Latest 5</span>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {recentContent.map((item) => (
                  <div key={item.id} className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-600/70 bg-slate-800/70 p-4 shadow-lg shadow-slate-950/20 transition hover:border-sky-300/50 hover:bg-slate-800">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white group-hover:text-sky-200">{item.content_title || "Untitled Content"}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <PlatformBadge platform={item.platform} />
                        <span className="text-xs font-medium text-slate-300">{item.published_date || "Unknown date"}</span>
                      </div>
                    </div>
                    <div className="shrink-0 rounded-xl border border-sky-300/20 bg-sky-400/10 px-3 py-2 text-right">
                      <p className="text-lg font-bold text-sky-100">{formatNumber(item.views)}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">Views</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, tone }) {
  const toneStyles = {
    indigo: "stat-card stat-card-indigo",
    sky: "stat-card stat-card-sky",
    emerald: "stat-card stat-card-emerald",
    dark: "stat-card stat-card-dark",
  };

  return (
    <div className={toneStyles[tone] || toneStyles.indigo}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-white/90">{title}</p>
        <span className="stat-icon">{icon}</span>
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-white/80">{subtitle}</p>
    </div>
  );
}

function MiniMetric({ title, value, tone }) {
  const toneStyles = {
    slate: "border-slate-200 bg-white/90 text-slate-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  return (
    <div className={`rounded-[22px] border p-5 shadow-[0_12px_28px_rgba(148,163,184,0.08)] ${toneStyles[tone] || toneStyles.slate}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="mt-2 text-2xl font-bold">{formatNumber(value)}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function PlatformBadge({ platform }) {
  const style = PLATFORM_STYLES[platform] || "bg-slate-800 text-slate-300 border-slate-700";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${style}`}>{platform || "Unknown"}</span>;
}

function PerformanceTrend({ content }) {
  const sorted = [...content].sort((a, b) => new Date(a.published_date || 0) - new Date(b.published_date || 0)).slice(-10);
  const maxViews = Math.max(...sorted.map((item) => Number(item.views || 0)), 1);

  return (
    <section className="dashboard-panel">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Content Performance</h2>
          <p className="mt-1 text-sm text-slate-500">Views by recent published content</p>
        </div>
        <span className="chart-badge chart-badge-live">Views</span>
      </div>

      <div className="mt-6 space-y-5">
        {sorted.map((item) => {
          const views = Number(item.views || 0);
          const width = (views / maxViews) * 100;

          return (
            <div key={item.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <PlatformBadge platform={item.platform} />
                  <span className="truncate text-sm text-slate-600">{item.content_title || "Untitled Content"}</span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-violet-700">{formatNumber(views)}</span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EngagementBreakdown({ metrics }) {
  const items = [
    { label: "Likes", value: metrics.totalLikes },
    { label: "Comments", value: metrics.totalComments },
    { label: "Shares", value: metrics.totalShares },
    { label: "Saves", value: metrics.totalSaves },
  ];
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="dashboard-panel dashboard-panel-violet">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Engagement Breakdown</h2>
          <p className="mt-1 text-sm text-slate-500">How your audience interacts with content</p>
        </div>
        <span className="chart-badge chart-badge-revenue">Breakdown</span>
      </div>

      <div className="mt-6 space-y-6">
        {items.map((item) => {
          const width = (item.value / max) * 100;
          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="text-sm font-semibold text-slate-800">{formatNumber(item.value)}</span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
        <p className="text-sm text-slate-500">Overall engagement rate</p>
        <p className="mt-1 text-2xl font-bold text-violet-700">{metrics.engagementRate}%</p>
        <p className="mt-1 text-xs text-slate-500">Based on total views and audience interactions</p>
      </div>
    </section>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}

export default ContentAnalytics;


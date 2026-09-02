import { useEffect, useMemo, useState } from "react";
import { getAllContent } from "../services/api";

const CREATOR_ID = 2;

const PLATFORM_STYLES = {
  YouTube: "bg-red-500/10 text-red-300 border-red-500/20",
  Instagram: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  TikTok: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  LinkedIn: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Facebook: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  X: "bg-slate-700/50 text-slate-200 border-slate-600",
};

function ContentAnalytics() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [platform, setPlatform] = useState("All");

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllContent();
        const creatorContent = Array.isArray(data)
          ? data.filter((item) => Number(item.creator_id) === CREATOR_ID)
          : [];

        setContent(creatorContent);
      } catch (err) {
        console.error("Content analytics error:", err);
        setError("Unable to load content analytics from the backend.");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

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

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Creator {CREATOR_ID}
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
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Top Performing Content</h2>
                  <p className="mt-1 text-sm text-slate-500">Ranked by views</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Top 5</span>
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
                        <tr key={item.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-700">{index + 1}</span>
                              <div className="min-w-0">
                                <div className="max-w-[320px] truncate font-semibold text-slate-800">{item.content_title || "Untitled Content"}</div>
                                <div className="mt-1 text-xs text-slate-500">{item.published_date || "Unknown date"}</div>
                              </div>
                            </div>
                          </td>
                          <td><PlatformBadge platform={item.platform} /></td>
                          <td>{formatNumber(item.views)}</td>
                          <td>{formatNumber(item.likes)}</td>
                          <td><span className="font-semibold text-violet-700">{engagement}%</span></td>
                          <td>{formatNumber(item.reach)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="content-table-card mt-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Recent Content</h2>
                  <p className="mt-1 text-sm text-slate-500">Latest published content</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {recentContent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-800">{item.content_title || "Untitled Content"}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <PlatformBadge platform={item.platform} />
                        <span className="text-xs text-slate-500">{item.published_date}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-slate-800">{formatNumber(item.views)}</p>
                      <p className="text-xs text-slate-500">views</p>
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



// import { useEffect, useMemo, useState } from "react";

// import {
//   getAllContent,
// } from "../services/api";

// const CREATOR_ID = 2;

// function ContentAnalytics() {
//   const [content, setContent] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadContent = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const data = await getAllContent();

//         const creatorContent = Array.isArray(data)
//           ? data.filter(
//               (item) => Number(item.creator_id) === CREATOR_ID
//             )
//           : [];

//         setContent(creatorContent);
//       } catch (err) {
//         console.error("Content analytics error:", err);

//         setError(
//           "Unable to load content analytics from the backend."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadContent();
//   }, []);

//   const metrics = useMemo(() => {
//     const totalViews = content.reduce(
//       (sum, item) => sum + Number(item.views || 0),
//       0
//     );

//     const totalLikes = content.reduce(
//       (sum, item) => sum + Number(item.likes || 0),
//       0
//     );

//     const totalComments = content.reduce(
//       (sum, item) => sum + Number(item.comments || 0),
//       0
//     );

//     const totalShares = content.reduce(
//       (sum, item) => sum + Number(item.shares || 0),
//       0
//     );

//     const totalSaves = content.reduce(
//       (sum, item) => sum + Number(item.saves || 0),
//       0
//     );

//     const totalReach = content.reduce(
//       (sum, item) => sum + Number(item.reach || 0),
//       0
//     );

//     const engagementRate =
//       totalViews > 0
//         ? (
//             ((totalLikes +
//               totalComments +
//               totalShares +
//               totalSaves) /
//               totalViews) *
//             100
//           ).toFixed(2)
//         : "0.00";

//     return {
//       totalViews,
//       totalLikes,
//       totalComments,
//       totalShares,
//       totalSaves,
//       totalReach,
//       engagementRate,
//     };
//   }, [content]);

//   const topContent = useMemo(() => {
//     return [...content]
//       .sort(
//         (a, b) =>
//           Number(b.views || 0) -
//           Number(a.views || 0)
//       )
//       .slice(0, 5);
//   }, [content]);

//   const formatNumber = (value) => {
//     return new Intl.NumberFormat("en-IN").format(
//       Number(value || 0)
//     );
//   };

//   const formatPercentage = (value) => {
//     return `${value}%`;
//   };

//   if (loading) {
//     return (
//       <div className="p-8">
//         <h1 className="text-3xl font-bold text-white">
//           Content Analytics
//         </h1>

//         <p className="mt-3 text-slate-400">
//           Loading real content data from CreatorIQ...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-8">
//         <h1 className="text-3xl font-bold text-white">
//           Content Analytics
//         </h1>

//         <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-full bg-slate-950 p-6 text-white md:p-8">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold">
//           Content Analytics
//         </h1>

//         <p className="mt-2 text-slate-400">
//           Real content performance data for Creator {CREATOR_ID}
//         </p>
//       </div>

//       {/* Empty state */}
//       {content.length === 0 ? (
//         <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
//           <h2 className="text-xl font-semibold">
//             No content available
//           </h2>

//           <p className="mt-2 text-slate-400">
//             There is currently no content data for Creator{" "}
//             {CREATOR_ID}.
//           </p>
//         </div>
//       ) : (
//         <>
//           {/* KPI Cards */}
//           <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
//             <MetricCard
//               title="Total Views"
//               value={formatNumber(metrics.totalViews)}
//               subtitle="Across all content"
//             />

//             <MetricCard
//               title="Total Likes"
//               value={formatNumber(metrics.totalLikes)}
//               subtitle="Audience interactions"
//             />

//             <MetricCard
//               title="Comments"
//               value={formatNumber(metrics.totalComments)}
//               subtitle="Total comments"
//             />

//             <MetricCard
//               title="Engagement Rate"
//               value={formatPercentage(
//                 metrics.engagementRate
//               )}
//               subtitle="Calculated from content metrics"
//             />
//           </div>

//           {/* Secondary metrics */}
//           <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
//             <MetricCard
//               title="Total Reach"
//               value={formatNumber(metrics.totalReach)}
//               subtitle="Combined content reach"
//             />

//             <MetricCard
//               title="Shares"
//               value={formatNumber(metrics.totalShares)}
//               subtitle="Content shares"
//             />

//             <MetricCard
//               title="Saves"
//               value={formatNumber(metrics.totalSaves)}
//               subtitle="Content saves"
//             />
//           </div>

//           {/* Performance chart */}
//           <div className="mt-8">
//             <PerformanceSection content={content} />
//           </div>

//           {/* Top content table */}
//           <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
//             <div className="mb-6">
//               <h2 className="text-xl font-semibold">
//                 Top Performing Content
//               </h2>

//               <p className="mt-1 text-sm text-slate-400">
//                 Ranked by views using real backend data
//               </p>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[800px]">
//                 <thead>
//                   <tr className="border-b border-slate-800 text-left text-sm text-slate-400">
//                     <th className="px-4 py-3">
//                       Content
//                     </th>

//                     <th className="px-4 py-3">
//                       Platform
//                     </th>

//                     <th className="px-4 py-3">
//                       Views
//                     </th>

//                     <th className="px-4 py-3">
//                       Likes
//                     </th>

//                     <th className="px-4 py-3">
//                       Comments
//                     </th>

//                     <th className="px-4 py-3">
//                       Reach
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {topContent.map((item) => (
//                     <tr
//                       key={item.id}
//                       className="border-b border-slate-800/70 transition hover:bg-slate-800/40"
//                     >
//                       <td className="max-w-[300px] px-4 py-4">
//                         <div className="truncate font-medium text-white">
//                           {item.content_title ||
//                             "Untitled Content"}
//                         </div>

//                         <div className="mt-1 text-xs text-slate-500">
//                           {item.published_date || "Unknown date"}
//                         </div>
//                       </td>

//                       <td className="px-4 py-4">
//                         <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
//                           {item.platform || "Unknown"}
//                         </span>
//                       </td>

//                       <td className="px-4 py-4 font-medium">
//                         {formatNumber(item.views)}
//                       </td>

//                       <td className="px-4 py-4 text-slate-300">
//                         {formatNumber(item.likes)}
//                       </td>

//                       <td className="px-4 py-4 text-slate-300">
//                         {formatNumber(item.comments)}
//                       </td>

//                       <td className="px-4 py-4 text-slate-300">
//                         {formatNumber(item.reach)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// function MetricCard({
//   title,
//   value,
//   subtitle,
// }) {
//   return (
//     <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-purple-500/30">
//       <p className="text-sm font-medium text-slate-400">
//         {title}
//       </p>

//       <p className="mt-3 text-3xl font-bold tracking-tight text-white">
//         {value}
//       </p>

//       <p className="mt-2 text-xs text-slate-500">
//         {subtitle}
//       </p>
//     </div>
//   );
// }

// function PerformanceSection({ content }) {
//   const sortedContent = [...content]
//     .sort(
//       (a, b) =>
//         new Date(a.published_date || 0) -
//         new Date(b.published_date || 0)
//     )
//     .slice(-10);

//   const maxViews = Math.max(
//     ...sortedContent.map(
//       (item) => Number(item.views || 0)
//     ),
//     1
//   );

//   return (
//     <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
//       <div className="mb-6">
//         <h2 className="text-xl font-semibold">
//           Content Performance Trend
//         </h2>

//         <p className="mt-1 text-sm text-slate-400">
//           Views across recent published content
//         </p>
//       </div>

//       <div className="space-y-5">
//         {sortedContent.map((item) => {
//           const views = Number(item.views || 0);

//           const width =
//             (views / maxViews) * 100;

//           return (
//             <div key={item.id}>
//               <div className="mb-2 flex items-center justify-between gap-4">
//                 <span className="max-w-[70%] truncate text-sm text-slate-300">
//                   {item.content_title ||
//                     "Untitled Content"}
//                 </span>

//                 <span className="text-sm font-medium text-purple-300">
//                   {new Intl.NumberFormat("en-IN").format(
//                     views
//                   )}
//                 </span>
//               </div>

//               <div className="h-2 overflow-hidden rounded-full bg-slate-800">
//                 <div
//                   className="h-full rounded-full bg-purple-500 transition-all duration-500"
//                   style={{
//                     width: `${width}%`,
//                   }}
//                 />
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default ContentAnalytics;
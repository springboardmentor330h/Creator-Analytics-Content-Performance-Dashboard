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
          ? data.filter(
              (item) => Number(item.creator_id) === CREATOR_ID
            )
          : [];

        setContent(creatorContent);
      } catch (err) {
        console.error("Content analytics error:", err);
        setError(
          "Unable to load content analytics from the backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const platforms = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(content.map((item) => item.platform).filter(Boolean))
      ),
    ];
  }, [content]);

  const filteredContent = useMemo(() => {
    if (platform === "All") return content;

    return content.filter((item) => item.platform === platform);
  }, [content, platform]);

  const metrics = useMemo(() => {
    const totalViews = filteredContent.reduce(
      (sum, item) => sum + Number(item.views || 0),
      0
    );

    const totalLikes = filteredContent.reduce(
      (sum, item) => sum + Number(item.likes || 0),
      0
    );

    const totalComments = filteredContent.reduce(
      (sum, item) => sum + Number(item.comments || 0),
      0
    );

    const totalShares = filteredContent.reduce(
      (sum, item) => sum + Number(item.shares || 0),
      0
    );

    const totalSaves = filteredContent.reduce(
      (sum, item) => sum + Number(item.saves || 0),
      0
    );

    const totalReach = filteredContent.reduce(
      (sum, item) => sum + Number(item.reach || 0),
      0
    );

    const engagementActions =
      totalLikes +
      totalComments +
      totalShares +
      totalSaves;

    const engagementRate =
      totalViews > 0
        ? ((engagementActions / totalViews) * 100).toFixed(2)
        : "0.00";

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

    return Object.values(grouped).sort(
      (a, b) => b.views - a.views
    );
  }, [filteredContent]);

  const topContent = useMemo(() => {
    return [...filteredContent]
      .sort(
        (a, b) =>
          Number(b.views || 0) -
          Number(a.views || 0)
      )
      .slice(0, 5);
  }, [filteredContent]);

  const recentContent = useMemo(() => {
    return [...filteredContent]
      .sort(
        (a, b) =>
          new Date(b.published_date || 0) -
          new Date(a.published_date || 0)
      )
      .slice(0, 5);
  }, [filteredContent]);

  if (loading) {
    return (
      <div className="min-h-full bg-slate-950 p-6 text-white md:p-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 rounded bg-slate-800" />
          <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-800" />

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 rounded-2xl bg-slate-900"
              />
            ))}
          </div>

          <div className="mt-8 h-80 rounded-2xl bg-slate-900" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-slate-950 p-6 text-white md:p-8">
        <h1 className="text-3xl font-bold">
          Content Analytics
        </h1>

        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 p-6 text-white md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
              📊
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Content Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Analyze content performance across all platforms
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-purple-300">
              Creator {CREATOR_ID}
            </span>

            <span className="text-slate-500">
              {filteredContent.length} content items
            </span>
          </div>
        </div>

        {/* Platform filter */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Platform
          </p>

          <div className="flex flex-wrap gap-2">
            {platforms.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPlatform(item)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  platform === item
                    ? "border-purple-500/50 bg-purple-500 text-white shadow-lg shadow-purple-500/10"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredContent.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
          <div className="text-4xl">📭</div>

          <h2 className="mt-4 text-xl font-semibold">
            No content available
          </h2>

          <p className="mt-2 text-slate-400">
            There is no content for the selected platform.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total Views"
              value={formatNumber(metrics.totalViews)}
              subtitle="Across selected content"
              icon="👁"
            />

            <MetricCard
              title="Total Reach"
              value={formatNumber(metrics.totalReach)}
              subtitle="Combined audience reach"
              icon="🌐"
            />

            <MetricCard
              title="Total Likes"
              value={formatNumber(metrics.totalLikes)}
              subtitle="Audience appreciation"
              icon="❤️"
            />

            <MetricCard
              title="Engagement Rate"
              value={`${metrics.engagementRate}%`}
              subtitle="Likes, comments, shares & saves"
              icon="⚡"
            />
          </div>

          {/* Secondary KPI row */}
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <MiniMetric
              title="Comments"
              value={metrics.totalComments}
            />

            <MiniMetric
              title="Shares"
              value={metrics.totalShares}
            />

            <MiniMetric
              title="Saves"
              value={metrics.totalSaves}
            />
          </div>

          {/* Platform comparison */}
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <SectionHeader
              title="Platform Performance"
              subtitle="Compare total views and reach across platforms"
            />

            <div className="mt-6 space-y-6">
              {platformData.map((item) => {
                const maxViews = Math.max(
                  ...platformData.map((p) => p.views),
                  1
                );

                const width =
                  (item.views / maxViews) * 100;

                const engagement =
                  item.views > 0
                    ? (
                        ((item.likes +
                          item.comments +
                          item.shares +
                          item.saves) /
                          item.views) *
                        100
                      ).toFixed(2)
                    : "0.00";

                return (
                  <div key={item.platform}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <PlatformBadge
                          platform={item.platform}
                        />

                        <span className="text-sm text-slate-400">
                          {item.content} content
                        </span>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <span className="font-semibold text-white">
                          {formatNumber(item.views)} views
                        </span>

                        <span className="text-purple-300">
                          {engagement}% engagement
                        </span>
                      </div>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-700"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>
                        Reach: {formatNumber(item.reach)}
                      </span>

                      <span>
                        Likes: {formatNumber(item.likes)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Trend + Engagement */}
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <PerformanceTrend content={filteredContent} />

            <EngagementBreakdown metrics={metrics} />
          </div>

          {/* Top Content */}
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <SectionHeader
              title="Top Performing Content"
              subtitle="Ranked by views"
            />

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">
                      Content
                    </th>

                    <th className="px-4 py-3">
                      Platform
                    </th>

                    <th className="px-4 py-3">
                      Views
                    </th>

                    <th className="px-4 py-3">
                      Likes
                    </th>

                    <th className="px-4 py-3">
                      Engagement
                    </th>

                    <th className="px-4 py-3">
                      Reach
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {topContent.map((item, index) => {
                    const views = Number(item.views || 0);

                    const engagement =
                      views > 0
                        ? (
                            ((Number(item.likes || 0) +
                              Number(item.comments || 0) +
                              Number(item.shares || 0) +
                              Number(item.saves || 0)) /
                              views) *
                            100
                          ).toFixed(2)
                        : "0.00";

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-sm font-bold text-purple-300">
                              {index + 1}
                            </span>

                            <div className="min-w-0">
                              <div className="max-w-[320px] truncate font-medium text-white">
                                {item.content_title ||
                                  "Untitled Content"}
                              </div>

                              <div className="mt-1 text-xs text-slate-500">
                                {item.published_date ||
                                  "Unknown date"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <PlatformBadge
                            platform={item.platform}
                          />
                        </td>

                        <td className="px-4 py-4 font-semibold text-white">
                          {formatNumber(item.views)}
                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          {formatNumber(item.likes)}
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-medium text-purple-300">
                            {engagement}%
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          {formatNumber(item.reach)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Content */}
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <SectionHeader
              title="Recent Content"
              subtitle="Latest published content"
            />

            <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {recentContent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-purple-500/30"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">
                      {item.content_title ||
                        "Untitled Content"}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <PlatformBadge
                        platform={item.platform}
                      />

                      <span className="text-xs text-slate-500">
                        {item.published_date}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-white">
                      {formatNumber(item.views)}
                    </p>

                    <p className="text-xs text-slate-500">
                      views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition duration-200 hover:-translate-y-0.5 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-950/20">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-400">
          {title}
        </p>

        <span className="text-xl opacity-80">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function MiniMetric({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

function PlatformBadge({ platform }) {
  const style =
    PLATFORM_STYLES[platform] ||
    "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${style}`}
    >
      {platform || "Unknown"}
    </span>
  );
}

function PerformanceTrend({ content }) {
  const sorted = [...content]
    .sort(
      (a, b) =>
        new Date(a.published_date || 0) -
        new Date(b.published_date || 0)
    )
    .slice(-10);

  const maxViews = Math.max(
    ...sorted.map((item) => Number(item.views || 0)),
    1
  );

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <SectionHeader
        title="Content Performance"
        subtitle="Views by recent published content"
      />

      <div className="mt-6 space-y-5">
        {sorted.map((item) => {
          const views = Number(item.views || 0);

          const width =
            (views / maxViews) * 100;

          return (
            <div key={item.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <PlatformBadge
                    platform={item.platform}
                  />

                  <span className="truncate text-sm text-slate-300">
                    {item.content_title ||
                      "Untitled Content"}
                  </span>
                </div>

                <span className="shrink-0 text-sm font-medium text-purple-300">
                  {formatNumber(views)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-500"
                  style={{
                    width: `${width}%`,
                  }}
                />
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
    {
      label: "Likes",
      value: metrics.totalLikes,
    },
    {
      label: "Comments",
      value: metrics.totalComments,
    },
    {
      label: "Shares",
      value: metrics.totalShares,
    },
    {
      label: "Saves",
      value: metrics.totalSaves,
    },
  ];

  const max = Math.max(
    ...items.map((item) => item.value),
    1
  );

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <SectionHeader
        title="Engagement Breakdown"
        subtitle="How your audience interacts with content"
      />

      <div className="mt-6 space-y-6">
        {items.map((item) => {
          const width =
            (item.value / max) * 100;

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  {item.label}
                </span>

                <span className="text-sm font-semibold text-white">
                  {formatNumber(item.value)}
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-500"
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
        <p className="text-sm text-slate-400">
          Overall engagement rate
        </p>

        <p className="mt-1 text-2xl font-bold text-purple-300">
          {metrics.engagementRate}%
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Based on total views and audience interactions
        </p>
      </div>
    </section>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(
    Number(value || 0)
  );
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
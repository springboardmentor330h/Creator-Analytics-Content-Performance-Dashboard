import { useEffect, useState } from "react";
import api from "../services/api";
import Loading from "../components/Loading";

const formatNumber = (value) => {
  if (value === null || value === undefined) return "N/A";
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : "N/A";
};

const formatPercentage = (value) => {
  if (value === null || value === undefined) return "N/A";
  const number = Number(value);
  return Number.isFinite(number) ? `${number}%` : "N/A";
};

function ContentAnalytics() {
  const [topContent, setTopContent] = useState([]);
  const [platformData, setPlatformData] = useState([]);

  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const platforms = [
    "All Platforms",
    "YouTube",
    "Instagram",
    "TikTok",
    "Facebook",
    "LinkedIn",
    "X",
  ];

  useEffect(() => {
    const fetchContentAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const topContentParams =
          selectedPlatform === "All Platforms"
            ? {}
            : { platform: selectedPlatform };

        const [topContentResponse, platformResponse] =
          await Promise.all([
            api.get("/analytics/top-content", {
              params: topContentParams,
            }),
            api.get("/analytics/platform-comparison"),
          ]);

        /*
         * -----------------------------------------
         * Top Content
         * -----------------------------------------
         */

        const topContentResult =
          topContentResponse.data?.data ?? topContentResponse.data;

        if (Array.isArray(topContentResult)) {
          setTopContent(topContentResult);
        } else {
          setTopContent([]);
        }

        /*
         * -----------------------------------------
         * Platform Comparison
         * -----------------------------------------
         *
         * This endpoint always returns all platforms.
         * That is intentional because this section
         * compares platforms against one another.
         */

        const platformResult =
          platformResponse.data?.data ?? platformResponse.data;

        if (
          platformResult &&
          typeof platformResult === "object" &&
          !Array.isArray(platformResult)
        ) {
          const platformsResult = Object.entries(platformResult).map(
            ([platform, values]) => ({
              platform,
              ...values,
            })
          );

          setPlatformData(platformsResult);
        } else if (Array.isArray(platformResult)) {
          setPlatformData(platformResult);
        } else {
          setPlatformData([]);
        }
      } catch (err) {
        console.error("Content analytics API error:", err);

        setTopContent([]);
        setPlatformData([]);

        setError("Unable to load content analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchContentAnalytics();
  }, [selectedPlatform]);

  /*
   * -----------------------------------------
   * Loading
   * -----------------------------------------
   */

  if (loading) {
    return <Loading message="Loading content analytics..." />;
  }

  /*
   * -----------------------------------------
   * Error
   * -----------------------------------------
   */

  if (error) {
    return (
      <div className="w-full space-y-6">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
            Content Analytics
          </h1>

          <p className="mt-1.5 text-sm text-gray-500">
            Analyze your content performance across platforms.
          </p>
        </section>

        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-7">

      {/* =================================
          Page Heading + Platform Selector
      ================================= */}

      <section>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
              Content Analytics
            </h1>

            <p className="mt-1.5 text-sm text-gray-500">
              Analyze your content performance across platforms.
            </p>
          </div>

          {/* Platform Selector */}

          <div className="w-full sm:w-auto">
            <label
              htmlFor="content-platform"
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Platform
            </label>

            <select
              id="content-platform"
              value={selectedPlatform}
              onChange={(event) =>
                setSelectedPlatform(event.target.value)
              }
              className="w-full rounded-lg border border-white/10 bg-[#151515] px-4 py-2.5 text-sm font-medium text-white outline-none transition hover:border-white/20 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 sm:w-52"
            >
              {platforms.map((platform) => (
                <option
                  key={platform}
                  value={platform}
                  className="bg-[#151515] text-white"
                >
                  {platform}
                </option>
              ))}
            </select>
          </div>

        </div>
      </section>


      {/* =================================
          Selected Platform
      ================================= */}

      <div className="flex items-center gap-2 rounded-lg border border-purple-500/10 bg-purple-500/5 px-4 py-3">
        <span className="text-xs uppercase tracking-wider text-gray-500">
          Viewing
        </span>

        <span className="text-sm font-semibold text-purple-400">
          {selectedPlatform}
        </span>

        <span className="text-xs text-gray-500">
          content analytics
        </span>
      </div>


      {/* =================================
          Platform Comparison
      ================================= */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Platform Performance
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Compare content performance across your platforms.
          </p>
        </div>

        {platformData.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#151515] p-6 text-sm text-gray-500">
            No platform analytics available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {platformData.map((platform) => (
              <div
                key={platform.platform}
                className={`rounded-xl border bg-[#151515] p-5 transition ${
                  platform.platform === selectedPlatform
                    ? "border-purple-500/50 shadow-lg shadow-purple-500/5"
                    : "border-white/10 hover:border-purple-500/30"
                }`}
              >

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold text-white">
                    {platform.platform}
                  </h3>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    ↗
                  </div>

                </div>


                <div className="mt-5 space-y-3">

                  {/* Views */}

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Views
                    </span>

                    <span className="text-sm font-medium text-white">
                      {formatNumber(
                        platform.views ?? platform.total_views
                      )}
                    </span>
                  </div>


                  {/* Reach */}

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Reach
                    </span>

                    <span className="text-sm font-medium text-white">
                      {formatNumber(
                        platform.reach ?? platform.total_reach
                      )}
                    </span>
                  </div>


                  {/* Likes */}

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Likes
                    </span>

                    <span className="text-sm font-medium text-white">
                      {formatNumber(
                        platform.likes ?? platform.total_likes
                      )}
                    </span>
                  </div>


                  {/* Comments */}

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Comments
                    </span>

                    <span className="text-sm font-medium text-white">
                      {formatNumber(
                        platform.comments ?? platform.total_comments
                      )}
                    </span>
                  </div>


                  {/* Engagement Rate */}

                  <div className="mt-4 border-t border-white/5 pt-4">

                    <p className="text-xs text-gray-500">
                      Engagement Rate
                    </p>

                    <p className="mt-1 text-xl font-semibold text-purple-400">
                      {formatPercentage(
                        platform.engagement_rate ??
                          platform.average_engagement_rate
                      )}
                    </p>

                  </div>

                  {/* Growth */}

                  <div className="border-t border-white/5 pt-4">

                    <p className="text-xs text-gray-500">
                      Growth
                    </p>

                    <p
                      className={`mt-1 text-sm font-semibold ${
                        platform.growth === null ||
                        platform.growth === undefined
                          ? "text-gray-500"
                          : Number(platform.growth) > 0
                            ? "text-emerald-400"
                            : Number(platform.growth) < 0
                              ? "text-red-400"
                              : "text-gray-400"
                      }`}
                    >
                      {platform.growth === null ||
                      platform.growth === undefined
                        ? "N/A"
                        : `${Number(platform.growth) > 0 ? "+" : ""}${platform.growth}%`}
                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}
      </section>


      {/* =================================
          Top Content
      ================================= */}

      <section>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Top Performing Content
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {selectedPlatform === "All Platforms"
              ? "Your highest-performing content based on engagement rate."
              : `Highest-performing ${selectedPlatform} content based on engagement rate.`}
          </p>
        </div>


        {topContent.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#151515] p-6 text-sm text-gray-500">
            No content analytics available for{" "}
            {selectedPlatform}.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">

            {/* =================================
                Desktop Table
            ================================= */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full text-left">

                <thead className="border-b border-white/10 bg-white/[0.02]">

                  <tr>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      #
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Content
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Platform
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Views
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Reach
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Watch Time
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Engagement
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {topContent.map((content, index) => (

                    <tr
                      key={content.content_id ?? index}
                      className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]"
                    >

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>


                      <td className="max-w-[300px] px-6 py-4">

                        <p className="truncate text-sm font-medium text-white">
                          {content.content_title ||
                            "Untitled Content"}
                        </p>

                      </td>


                      <td className="px-6 py-4">

                        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                          {content.platform || "Unknown"}
                        </span>

                      </td>


                      <td className="px-6 py-4 text-right text-sm text-gray-300">
                        {formatNumber(content.views)}
                      </td>


                      <td className="px-6 py-4 text-right text-sm text-gray-300">
                        {formatNumber(content.reach)}
                      </td>


                      <td className="px-6 py-4 text-right text-sm text-gray-300">
                        {formatNumber(content.watch_time)}
                      </td>


                      <td className="px-6 py-4 text-right">

                        <span className="font-semibold text-purple-400">
                          {formatPercentage(content.engagement_rate)}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>


            {/* =================================
                Mobile Cards
            ================================= */}

            <div className="space-y-3 p-4 md:hidden">

              {topContent.map((content, index) => (

                <div
                  key={content.content_id ?? index}
                  className="rounded-lg border border-white/10 bg-[#111111] p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="text-xs text-gray-500">
                        #{index + 1}
                      </p>

                      <h3 className="mt-1 text-sm font-medium text-white">
                        {content.content_title ||
                          "Untitled Content"}
                      </h3>

                    </div>


                    <span className="shrink-0 rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-400">
                      {content.platform || "Unknown"}
                    </span>

                  </div>


                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div>
                      <p className="text-xs text-gray-500">
                        Views
                      </p>

                      <p className="mt-1 text-sm text-white">
                        {formatNumber(content.views)}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Reach
                      </p>

                      <p className="mt-1 text-sm text-white">
                        {formatNumber(content.reach)}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Watch Time
                      </p>

                      <p className="mt-1 text-sm text-white">
                        {formatNumber(content.watch_time)}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Engagement
                      </p>

                      <p className="mt-1 text-sm font-semibold text-purple-400">
                        {formatPercentage(content.engagement_rate)}
                      </p>
                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

      </section>

    </div>
  );
}

export default ContentAnalytics;
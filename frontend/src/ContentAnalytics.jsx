import { useEffect, useState } from "react";
import api from "./services/api";

function ContentAnalytics() {
  const [contents, setContents] = useState([]);
  const [platform, setPlatform] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentAnalytics();
  }, []);

  // =========================================================
  // FETCH CONTENT DATA FROM DATABASE
  // =========================================================
  const fetchContentAnalytics = async () => {
    try {
      setLoading(true);

      const response = await api.get("/content/");

      setContents(response.data);
    } catch (error) {
      console.error("Error fetching content analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SAFE NUMBER HELPER
  // =========================================================
  const safeNumber = (value) => {
    return Number(value) || 0;
  };

  // =========================================================
  // PROCESS DATABASE DATA
  // Calculate engagement and engagement rate
  // =========================================================
  const processedContents = contents.map((content) => {
    const total_engagement =
      safeNumber(content.likes) +
      safeNumber(content.comments) +
      safeNumber(content.shares) +
      safeNumber(content.saves);

    const engagement_rate =
      safeNumber(content.reach) > 0
        ? (total_engagement / safeNumber(content.reach)) * 100
        : 0;

    return {
      ...content,

      // Database field is "id"
      content_id: content.id,

      // Calculated analytics
      total_engagement,
      engagement_rate,
    };
  });

  // =========================================================
  // PLATFORM + SEARCH FILTER
  // =========================================================
  const filteredContents = processedContents.filter((content) => {
    const matchesPlatform = platform === "All" || content.platform === platform;

    const matchesSearch = String(content.content_id)
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesPlatform && matchesSearch;
  });

  // =========================================================
  // SUMMARY CALCULATIONS
  // =========================================================
  const totalEngagement = filteredContents.reduce(
    (total, item) => total + safeNumber(item.total_engagement),
    0,
  );

  const averageEngagementRate =
    filteredContents.length > 0
      ? (
          filteredContents.reduce(
            (total, item) => total + safeNumber(item.engagement_rate),
            0,
          ) / filteredContents.length
        ).toFixed(2)
      : "0.00";

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold text-gray-800">
          Loading Content Analytics...
        </h2>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================
  return (
    <div className="p-8">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Content Analytics</h1>

        <p className="text-gray-500 mt-2">
          Analyze your content performance and engagement.
        </p>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Platform Filter */}

          <div className="flex items-center gap-3">
            <label
              htmlFor="content-platform"
              className="text-sm font-medium text-gray-700"
            >
              Platform:
            </label>

            <select
              id="content-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="All">All Platforms</option>

              <option value="YouTube">YouTube</option>

              <option value="Instagram">Instagram</option>
            </select>
          </div>

          {/* Search */}

          <div>
            <input
              type="text"
              placeholder="Search Content ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Content Count */}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Content Analyzed</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {filteredContents.length}
          </h2>
        </div>

        {/* Total Engagement */}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Total Engagement</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {totalEngagement.toLocaleString()}
          </h2>
        </div>

        {/* Average Engagement */}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Average Engagement Rate</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {averageEngagementRate}%
          </h2>
        </div>
      </div>

      {/* =====================================================
          CONTENT TABLE
      ===================================================== */}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Content Performance
          </h2>

          <p className="text-gray-500 mt-1">
            Content performance retrieved from the database.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Content ID
                </th>

                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Platform
                </th>

                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Views
                </th>

                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Reach
                </th>

                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Engagement
                </th>

                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Engagement Rate
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredContents.length > 0 ? (
                filteredContents.map((content) => (
                  <tr
                    key={content.content_id}
                    className="border-t hover:bg-gray-50"
                  >
                    {/* Content ID */}

                    <td className="p-4 font-semibold text-gray-800">
                      #{content.content_id}
                    </td>

                    {/* Platform */}

                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                        {content.platform}
                      </span>
                    </td>

                    {/* Views */}

                    <td className="p-4 text-gray-700">
                      {safeNumber(content.views).toLocaleString()}
                    </td>

                    {/* Reach */}

                    <td className="p-4 text-gray-700">
                      {safeNumber(content.reach).toLocaleString()}
                    </td>

                    {/* Engagement */}

                    <td className="p-4 font-semibold text-gray-800">
                      {safeNumber(content.total_engagement).toLocaleString()}
                    </td>

                    {/* Engagement Rate */}

                    <td className="p-4 font-medium text-gray-700">
                      {safeNumber(content.engagement_rate).toFixed(2)}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No content found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ContentAnalytics;

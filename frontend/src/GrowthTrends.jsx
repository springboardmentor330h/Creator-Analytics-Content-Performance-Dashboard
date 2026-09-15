import { useEffect, useState } from "react";
import api from "./services/api";

function GrowthTrends() {
  const [followerData, setFollowerData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const [followersResponse, engagementResponse] = await Promise.all([
          api.get("/analytics/chart/followers"),
          api.get("/analytics/chart/engagement"),
        ]);

        setFollowerData(followersResponse.data);
        setEngagementData(engagementResponse.data);
      } catch (err) {
        console.error("Growth Trends Error:", err);
        setError("Unable to load growth trends.");
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Growth & Trends</h1>

        <p className="mt-4 text-gray-600">Loading growth data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Growth & Trends</h1>

        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  const followerLabels = followerData?.labels || [];
  const followerValues = followerData?.values || [];

  const engagementLabels = engagementData?.labels || [];
  const engagementValues = engagementData?.values || [];

  const currentFollowers =
    followerValues.length > 0 ? followerValues[followerValues.length - 1] : 0;

  const firstFollowers = followerValues.length > 0 ? followerValues[0] : 0;

  const followerGrowth = currentFollowers - firstFollowers;

  const latestEngagementRate =
    engagementValues.length > 0
      ? engagementValues[engagementValues.length - 1]
      : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Growth & Trends</h1>

        <p className="mt-2 text-gray-600">
          Track follower growth and engagement performance over time.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Current Followers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Current Followers</p>

          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            {currentFollowers.toLocaleString()}
          </h2>
        </div>

        {/* Follower Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Follower Growth</p>

          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            +{followerGrowth.toLocaleString()}
          </h2>
        </div>

        {/* Latest Engagement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">
            Latest Engagement Rate
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            {latestEngagementRate}%
          </h2>
        </div>
      </div>

      {/* Follower Growth */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Follower Growth</h2>

        <p className="text-sm text-gray-500 mt-1 mb-6">
          Follower count over time.
        </p>

        {followerLabels.length > 0 ? (
          <div className="space-y-3">
            {followerLabels.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="flex items-center justify-between border-b border-gray-100 pb-3"
              >
                <span className="text-sm text-gray-600">{label}</span>

                <span className="font-semibold text-gray-900">
                  {followerValues[index]?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No follower growth data available.</p>
        )}
      </div>

      {/* Engagement Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Engagement Trend
        </h2>

        <p className="text-sm text-gray-500 mt-1 mb-6">
          Engagement rate over time.
        </p>

        {engagementLabels.length > 0 ? (
          <div className="space-y-3">
            {engagementLabels.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="flex items-center justify-between border-b border-gray-100 pb-3"
              >
                <span className="text-sm text-gray-600">{label}</span>

                <span className="font-semibold text-gray-900">
                  {engagementValues[index]}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No engagement trend data available.</p>
        )}
      </div>
    </div>
  );
}

export default GrowthTrends;

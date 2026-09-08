import { useEffect, useState } from "react";
import api from "../api/axios";

function GrowthTrends() {
  const [growthData, setGrowthData] = useState([]);
  const [platform, setPlatform] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGrowth = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          platform === "All"
            ? "/analytics/growth"
            : `/analytics/growth?platform=${platform}`
        );

        setGrowthData(response.data);
      } catch (err) {
        console.error(
          "Growth Analytics API Error:",
          err
        );

        setError(
          "Failed to load growth analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadGrowth();
  }, [platform]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Growth & Trends
        </h1>

        <p className="mt-3 text-slate-500">
          Loading growth data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Growth & Trends
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Growth & Trends
        </h1>

        <p className="mt-2 text-slate-500">
          Track creator and platform-specific follower growth.
        </p>

        {/* Platform Selector */}
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            "All",
            "YouTube",
            "Instagram",
            "TikTok",
            "Facebook",
            "LinkedIn",
            "X",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setPlatform(item)}
              className={`rounded-lg px-4 py-2 font-medium transition ${
                platform === item
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Data Information */}
        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {platform === "All"
            ? "Showing creator-level follower growth."
            : `Showing ${platform} follower growth from platform-specific data.`}
        </div>

      </div>

      {/* Growth Table */}
      <div className="rounded-xl bg-white p-6 shadow">

        <h2 className="mb-6 text-xl font-semibold text-slate-800">
          Follower Growth
        </h2>

        {growthData.length === 0 ? (
          <p className="text-slate-500">
            No growth data available for {platform}.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead>
                <tr className="border-b border-slate-200">

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Date
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Followers
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Daily Growth
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Growth %
                  </th>

                </tr>
              </thead>

              <tbody>

                {growthData.map((item, index) => (
                  <tr
                    key={item.date || index}
                    className="border-b border-slate-100"
                  >

                    <td className="px-4 py-3 text-slate-700">
                      {item.date}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {Number(
                        item.followers || 0
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {Number(
                        item.daily_growth || 0
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {item.growth_percentage ?? 0}%
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default GrowthTrends;
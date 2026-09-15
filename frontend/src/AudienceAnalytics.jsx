import { useEffect, useState } from "react";
import api from "./api";

function AudienceAnalytics() {
  const [audienceData, setAudienceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAudienceData = async () => {
      try {
        const response = await api.get("/analytics/audience");
        setAudienceData(response.data);
      } catch (err) {
        console.error("Audience Analytics Error:", err);
        setError("Unable to load audience analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAudienceData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Loading Audience Analytics...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Audience Analytics</h1>

        <p className="text-gray-500 mt-2">
          Analyze your audience growth, reach and demographics.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Total Followers</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {audienceData?.total_followers ?? 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Total Reach</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {audienceData?.total_reach ?? 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Total Impressions</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {audienceData?.total_impressions ?? 0}
          </h2>
        </div>
      </div>

      {/* TOP INFORMATION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Top Country</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            {audienceData?.top_country || "N/A"}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Top City</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            {audienceData?.top_city || "N/A"}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Top Device</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            {audienceData?.top_device || "N/A"}
          </h2>
        </div>
      </div>

      {/* GENDER + AGE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Gender Distribution
          </h2>

          <div className="mt-5 space-y-4">
            {Object.entries(audienceData?.gender_distribution || {}).map(
              ([gender, percentage]) => (
                <div key={gender}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{gender}</span>

                    <span className="font-semibold">{percentage}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gray-800 h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Age Distribution
          </h2>

          <div className="mt-5 space-y-4">
            {Object.entries(audienceData?.age_distribution || {}).map(
              ([age, percentage]) => (
                <div key={age}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{age}</span>

                    <span className="font-semibold">{percentage}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gray-600 h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* DEVICE USAGE */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800">Device Usage</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {Object.entries(audienceData?.device_usage || {}).map(
            ([device, percentage]) => (
              <div key={device} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">{device}</span>

                  <span className="font-semibold">{percentage}%</span>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* TOP COUNTRIES */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800">Top Countries</h2>

        <div className="overflow-x-auto mt-5">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Country</th>
                <th className="text-left p-4">Audience Count</th>
              </tr>
            </thead>

            <tbody>
              {(audienceData?.top_countries || []).map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-4">{item.country}</td>

                  <td className="p-4 font-semibold">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AudienceAnalytics;

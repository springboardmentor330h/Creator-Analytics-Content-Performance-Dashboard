
import { useEffect, useState } from "react";
import api from "../api/axios";

function GrowthTrends() {
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGrowth = async () => {
      try {
        const response = await api.get("/analytics/growth");
        setGrowthData(response.data);
      } catch (err) {
        console.error("Growth Analytics API Error:", err);
        setError("Failed to load growth analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadGrowth();
  }, []);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Growth & Trends
        </h1>

        <p className="mt-2 text-slate-500">
          Track follower growth and daily performance.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-6 text-xl font-semibold text-slate-800">
          Follower Growth
        </h2>

        {growthData.length === 0 ? (
          <p className="text-slate-500">
            No growth data available.
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
                      {item.growth_percentage ??
                        item.growth_percent ??
                        item.growth_rate ??
                        0}
                      %
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


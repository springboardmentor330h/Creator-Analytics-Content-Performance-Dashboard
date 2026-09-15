import { useEffect, useState } from "react";
import api from "./api";

function Revenue() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [sourceData, setSourceData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const [totalResponse, sourceResponse, monthlyResponse, trendResponse] =
          await Promise.all([
            api.get("/revenue/analytics/total"),
            api.get("/revenue/analytics/by-source"),
            api.get("/revenue/analytics/monthly"),
            api.get("/revenue/analytics/trend"),
          ]);

        setTotalRevenue(totalResponse.data?.total_revenue || 0);
        setSourceData(sourceResponse.data?.revenue_by_source || []);
        setMonthlyData(monthlyResponse.data?.monthly_revenue || []);
        setTrendData(trendResponse.data?.revenue_trend || []);
      } catch (err) {
        console.error("Revenue Error:", err);

        if (err.response) {
          console.error("Status:", err.response.status);
          console.error("Response:", err.response.data);

          setError(
            `Revenue API Error: ${err.response.status} - ${
              err.response.data?.detail || "Unknown error"
            }`,
          );
        } else {
          console.error("Error Message:", err.message);

          setError(`Revenue API Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800">Loading Revenue...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Revenue</h1>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Revenue</h1>

        <p className="text-gray-500 mt-2">
          Track your revenue performance and earnings.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Total Revenue</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            ₹{Number(totalRevenue).toLocaleString()}
          </h2>
        </div>

        {/* Revenue Sources */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Revenue Sources</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {sourceData.length}
          </h2>
        </div>

        {/* Data Points */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Revenue Data Points</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {trendData.length}
          </h2>
        </div>
      </div>

      {/* Revenue By Source */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800">
          Revenue By Source
        </h2>

        <p className="text-gray-500 mt-1 mb-6">
          Revenue generated from different sources.
        </p>

        {sourceData.length > 0 ? (
          <div className="space-y-5">
            {sourceData.map((item, index) => {
              const amount = Number(item.total_amount) || 0;

              const percentage =
                totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">
                      {item.source}
                    </span>

                    <span className="font-semibold text-gray-800">
                      ₹{amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gray-800 h-4 rounded-full"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No revenue source data available.</p>
        )}
      </div>

      {/* Monthly Revenue */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800">Monthly Revenue</h2>

        <p className="text-gray-500 mt-1 mb-6">Revenue generated each month.</p>

        {monthlyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Year</th>

                  <th className="text-left p-4">Month</th>

                  <th className="text-left p-4">Total Revenue</th>
                </tr>
              </thead>

              <tbody>
                {monthlyData.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{item.year}</td>

                    <td className="p-4">{item.month}</td>

                    <td className="p-4 font-semibold">
                      ₹{Number(item.total_amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No monthly revenue data available.</p>
        )}
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800">Revenue Trend</h2>

        <p className="text-gray-500 mt-1 mb-6">
          Revenue performance over time.
        </p>

        {trendData.length > 0 ? (
          <div className="space-y-5">
            {trendData.map((item, index) => {
              const amount = Number(item.total_amount) || 0;

              const maxRevenue = Math.max(
                ...trendData.map((data) => Number(data.total_amount) || 0),
              );

              const width = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">
                      {item.date}
                    </span>

                    <span className="font-semibold text-gray-800">
                      ₹{amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gray-700 h-4 rounded-full"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No revenue trend data available.</p>
        )}
      </div>
    </div>
  );
}

export default Revenue;

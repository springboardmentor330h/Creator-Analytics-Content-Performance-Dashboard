import { useEffect, useState } from "react";
import api from "../api/axios";

function Revenue() {
  const [summary, setSummary] = useState(null);
  const [sources, setSources] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRevenue = async () => {
      try {
        const [summaryResponse, sourceResponse, monthlyResponse] =
          await Promise.all([
            api.get("/analytics/revenue/summary"),
            api.get("/analytics/revenue/by-source"),
            api.get("/analytics/revenue/monthly"),
          ]);

        setSummary(summaryResponse.data);
        setSources(sourceResponse.data);
        setMonthly(monthlyResponse.data);
      } catch (err) {
        console.error("Revenue API Error:", err);
        setError("Failed to load revenue analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadRevenue();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Revenue
        </h1>
        <p className="mt-3 text-slate-500">
          Loading revenue data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Revenue
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
          Revenue
        </h1>

        <p className="mt-2 text-slate-500">
          Track your revenue and income sources.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm text-slate-500">
          Total Revenue
        </p>

        <p className="mt-2 text-4xl font-bold text-slate-900">
          INR {Number(summary?.total_revenue || 0).toLocaleString()}
        </p>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-semibold text-slate-800">
          Revenue by Source
        </h2>

        <div className="space-y-4">
          {sources.map((item, index) => (
            <div
              key={item.source || index}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
            >
              <span className="font-medium text-slate-700">
                {item.source}
              </span>

              <span className="font-bold text-slate-900">
                INR {Number(item.total_revenue || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-semibold text-slate-800">
          Monthly Revenue
        </h2>

        {monthly.length === 0 ? (
          <p className="text-slate-500">
            No monthly revenue data available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Month
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Revenue
                  </th>
                </tr>
              </thead>

              <tbody>
                {monthly.map((item, index) => (
                  <tr
                    key={`${item.year}-${item.month}-${index}`}
                    className="border-b border-slate-100"
                  >
                    <td className="px-4 py-3 text-slate-700">
                      {item.month}/{item.year}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-800">
                      INR {Number(item.total_revenue || 0).toLocaleString()}
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

export default Revenue;
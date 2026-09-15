import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import api from "../api";

function EngagementChart({ platform = "All" }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        setLoading(true);
        setError("");

        const url =
          platform === "All"
            ? "/analytics/chart/engagement"
            : `/analytics/chart/engagement?platform=${platform}`;

        const response = await api.get(url);

        const { labels, values } = response.data;

        const formattedData = labels.map((label, index) => ({
          date: label,
          engagement: values[index],
        }));

        setChartData(formattedData);
      } catch (err) {
        console.error(err);
        setError("Unable to load engagement chart.");
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementData();
  }, [platform]);

  const copyTableData = async () => {
    const text = chartData
      .map((item) => `${item.date}\t${item.engagement}%`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(`Date\tEngagement Rate\n${text}`);
      alert("Chart data copied!");
    } catch (err) {
      console.error(err);
      alert("Unable to copy chart data.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
        <p className="text-gray-500">Loading engagement chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Engagement Trend
          </h3>

          <p className="text-sm text-gray-500">
            {platform === "All"
              ? "All Platforms"
              : `${platform} Engagement Rate`}
          </p>
        </div>

        <button
          onClick={copyTableData}
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700"
        >
          Copy Data
        </button>
      </div>

      {/* Graph */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis tickFormatter={(value) => `${value}%`} />

            <Tooltip formatter={(value) => [`${value}%`, "Engagement Rate"]} />

            <Line type="monotone" dataKey="engagement" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Copyable Data Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Engagement Rate
              </th>
            </tr>
          </thead>

          <tbody>
            {chartData.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-3 text-gray-600">{item.date}</td>

                <td className="px-4 py-3 text-gray-600">{item.engagement}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EngagementChart;

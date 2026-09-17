import { useEffect, useState } from "react";
import api from "../api/axios";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCompactNumber } from "../utils/format";

export default function Growth() {
  const [growthData, setGrowthData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [contentGrowth, setContentGrowth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Date range filter - empty strings mean "no filter, use default"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = () => {
    setLoading(true);
    setError(false);

    const dateParams = {};
    if (startDate) dateParams.start_date = startDate;
    if (endDate) dateParams.end_date = endDate;

    Promise.all([
      api.get("/analytics/growth", { params: dateParams }),
      api.get("/analytics/audience-trends"),
      api.get("/analytics/content-growth", { params: dateParams }),
    ])
      .then(([g, t, c]) => {
        setGrowthData(g.data);
        setTrendsData(t.data);
        // Reshape content-growth for the chart: [{date, count}, ...]
        const shaped = c.data.labels.map((label, i) => ({
          date: label,
          count: c.data.daily_content_count[i],
        }));
        setContentGrowth(shaped);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    // fetchData reads state directly, so clear then fetch on next tick
    setTimeout(fetchData, 0);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Growth & Trends</h2>

        <form onSubmit={handleApplyFilter} className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">From</label>
            <input
              type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">To</label>
            <input
              type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <button type="submit" className="px-4 py-1.5 text-sm font-medium text-white transition rounded-lg bg-brand-600 hover:bg-brand-700">
            Apply
          </button>
          {(startDate || endDate) && (
            <button type="button" onClick={handleClearFilter} className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Clear
            </button>
          )}
        </form>
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState /> : (
        <>
          <div className="p-6 mb-8 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Follower Growth</h3>
            {growthData.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={growthData}>
                  <XAxis dataKey="date" hide /><YAxis width={48} tickFormatter={formatCompactNumber} />
                  <Tooltip contentStyle={{ borderRadius: "12px" }} />
                  <Line type="monotone" dataKey="followers" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="p-6 mb-8 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Reach Trend</h3>
            {trendsData.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendsData}>
                  <XAxis dataKey="date" hide /><YAxis width={48} tickFormatter={formatCompactNumber} />
                  <Tooltip contentStyle={{ borderRadius: "12px" }} />
                  <Line type="monotone" dataKey="reach" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Content Published Over Time
              {contentGrowth && contentGrowth.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({contentGrowth.reduce((sum, d) => sum + d.count, 0)} pieces in range)
                </span>
              )}
            </h3>
            {!contentGrowth || contentGrowth.length === 0 ? <EmptyState message="No content published in this range." /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={contentGrowth}>
                  <XAxis dataKey="date" hide /><YAxis width={32} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px" }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}

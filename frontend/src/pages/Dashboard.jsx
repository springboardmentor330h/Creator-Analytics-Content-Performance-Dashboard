
import { useEffect, useState } from "react";
import api from "../api/axios";
import KpiCard from "../components/common/KpiCard";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [summaryResponse, growthResponse] =
          await Promise.all([
            api.get("/analytics/summary"),
            api.get("/analytics/growth"),
          ]);

        console.log("Dashboard summary:", summaryResponse.data);
        console.log("Growth data:", growthResponse.data);

        setSummary(summaryResponse.data);
        setGrowthData(growthResponse.data);
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-600">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-600">
          No dashboard data available.
        </p>
      </div>
    );
  }

  const followerChart = {
    labels: growthData.map((item) => item.date),
    datasets: [
      {
        label: "Followers",
        data: growthData.map((item) =>
          Number(item.followers || 0)
        ),
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-slate-500">
          Overview of your creator performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Views"
          value={Number(summary.total_views || 0).toLocaleString()}
        />

        <KpiCard
          title="Total Likes"
          value={Number(summary.total_likes || 0).toLocaleString()}
        />

        <KpiCard
          title="Total Comments"
          value={Number(summary.total_comments || 0).toLocaleString()}
        />

        <KpiCard
          title="Total Reach"
          value={Number(summary.total_reach || 0).toLocaleString()}
        />
      </div>

      {/* Follower Growth Chart */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-semibold text-slate-800">
          Follower Growth
        </h2>

        {growthData.length > 0 ? (
          <div className="h-[350px]">
            <Line
              data={followerChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="text-slate-500">
            No follower growth data available.
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;


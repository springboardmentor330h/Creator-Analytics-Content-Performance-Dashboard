import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import ContentAnalytics from "./ContentAnalytics";
import AudienceAnalytics from "./AudienceAnalytics";
import GrowthTrends from "./GrowthTrends";
import Revenue from "./Revenue";
import Sponsorships from "./Sponsorships";
import Notifications from "./Notifications";
import Reports from "./Reports";
import ProfileSettings from "./ProfileSettings";

import Login from "./Login";
import { useAuth } from "./context/AuthContext";

import api from "./api";

function DashboardView({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryRes, revRes] = await Promise.allSettled([
        api.get("/analytics/dashboard-summary"),
        api.get("/revenue/analytics/total"),
      ]);

      if (summaryRes.status === "fulfilled") {
        setSummary(summaryRes.value.data);
      }

      if (revRes.status === "fulfilled") {
        setTotalRevenue(revRes.value.data?.total_revenue || 0);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to fetch dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Loading Dashboard...
        </h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

          <p className="text-gray-500 mt-2">
            Overview of your CreatorIQ content, engagement, and revenue
            performance.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 border bg-white rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm self-start md:self-auto"
        >
          🔄 Refresh Summary
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm font-medium">Content Analyzed</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {summary?.total_contents ?? 0}
          </h2>

          <p className="text-xs text-gray-400 mt-2">Total published posts</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm font-medium">Total Views</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {Number(summary?.total_views || 0).toLocaleString()}
          </h2>

          <p className="text-xs text-gray-400 mt-2">Cross-platform views</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm font-medium">Total Engagement</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {Number(summary?.total_engagement || 0).toLocaleString()}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Avg Rate: {summary?.average_engagement_rate ?? 0}%
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm font-medium">Total Revenue</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            ₹{Number(totalRevenue || 0).toLocaleString()}
          </h2>

          <p className="text-xs text-gray-400 mt-2">Verified earnings</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Platform */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Platform Highlight
            </span>

            <h3 className="text-xl font-bold text-gray-800 mt-1">
              Top Performing Platform
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Highest average engagement rates.
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Platform Name
              </p>

              <h4 className="text-2xl font-bold text-gray-900 mt-1">
                {summary?.best_platform || "N/A"}
              </h4>
            </div>

            <span className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg">
              Best Reach
            </span>
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Content Highlight
            </span>

            <h3 className="text-xl font-bold text-gray-800 mt-1">
              Top Performing Content
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Post with maximum audience engagement.
            </p>
          </div>

          {summary?.top_content ? (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Content #{summary.top_content.content_id} (
                  {summary.top_content.platform})
                </p>

                <h4 className="text-lg font-bold text-gray-900 mt-1">
                  {summary.top_content.total_engagement} Total Engagements
                </h4>
              </div>

              <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                {summary.top_content.engagement_rate}% Rate
              </span>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mt-6">
              No top content data available.
            </p>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Quick Navigation
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Content Analytics",
              desc: "View detailed content views & reach",
              page: "Content Analytics",
            },
            {
              title: "Audience Analytics",
              desc: "Demographics & device breakdown",
              page: "Audience Analytics",
            },
            {
              title: "Growth & Trends",
              desc: "Follower growth & engagement chart",
              page: "Growth & Trends",
            },
            {
              title: "Revenue",
              desc: "Track earnings & monthly revenue",
              page: "Revenue",
            },
            {
              title: "Sponsorships",
              desc: "Manage brand deals & contracts",
              page: "Sponsorships",
            },
            {
              title: "Notifications",
              desc: "View alerts & system updates",
              page: "Notifications",
            },
            {
              title: "Reports",
              desc: "Export PDF & Excel summaries",
              page: "Reports",
            },
            {
              title: "Profile / Settings",
              desc: "Manage account profile details",
              page: "Profile / Settings",
            },
          ].map((card) => (
            <div
              key={card.page}
              onClick={() => onNavigate(card.page)}
              className="bg-white rounded-xl shadow-sm border p-5 hover:border-gray-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{card.title}</h3>

                <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
              </div>

              <span className="text-xs font-semibold text-gray-700 mt-4 block">
                Open Page →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, checkingSession } = useAuth();

  const [currentPage, setCurrentPage] = useState("Dashboard");

  const handleNavigate = (page) => {
    console.log("Selected page:", page);
    setCurrentPage(page);
  };

  // Wait until authentication check is completed
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>

          <p className="text-gray-500 mt-2">Checking your session.</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show Login page
  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "Content Analytics":
        return <ContentAnalytics />;

      case "Audience Analytics":
        return <AudienceAnalytics />;

      case "Growth & Trends":
        return <GrowthTrends />;

      case "Revenue":
        return <Revenue />;

      case "Sponsorships":
        return <Sponsorships />;

      case "Notifications":
        return <Notifications />;

      case "Reports":
        return <Reports />;

      case "Profile / Settings":
        return <ProfileSettings />;

      case "Dashboard":
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar onNavigate={handleNavigate} currentPage={currentPage} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentPage={currentPage} />

        <main className="flex-1">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;

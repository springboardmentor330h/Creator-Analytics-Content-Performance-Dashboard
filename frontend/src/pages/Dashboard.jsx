import { useEffect, useState } from 'react'

import KPICard from '../components/KPICard'
import EngagementChart from '../components/EngagementChart'
import FollowerChart from '../components/FollowerChart'
import TopContentTable from '../components/TopContentTable'
import PlatformPerformanceChart from '../components/PlatformPerformanceChart'

import api from '../services/api'

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [engagementData, setEngagementData] = useState([])
  const [followerData, setFollowerData] = useState([])
  const [topContent, setTopContent] = useState([])
  const [platformPerformance, setPlatformPerformance] = useState([])

  // Platform selector
  const [selectedPlatform, setSelectedPlatform] = useState('All')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError('')

        // Summary data
        const summaryResponse = await api.get(
          '/analytics/summary'
        )

        setSummary(summaryResponse.data)

        // Engagement chart data
        const engagementResponse = await api.get(
          '/analytics/chart/engagement'
        )

        const chartData =
          engagementResponse.data.labels.map(
            (date, index) => ({
              date,
              engagement:
                engagementResponse.data.values[index],
            })
          )

        setEngagementData(chartData)

        // Followers chart data
        const followerResponse = await api.get(
          '/analytics/chart/followers'
        )

        const followerChartData =
          followerResponse.data.labels.map(
            (date, index) => ({
              date,
              followers:
                followerResponse.data.values[index],
            })
          )

        setFollowerData(followerChartData)

        // Top content data
        const topContentResponse = await api.get(
          '/analytics/top-content'
        )

        setTopContent(topContentResponse.data)

        // Platform performance
        const platformResponse = await api.get(
          '/analytics/platform-performance',
          {
            params:
              selectedPlatform === 'All'
                ? {}
                : {
                    platform: selectedPlatform,
                  },
          }
        )

        setPlatformPerformance(platformResponse.data)

      } catch (err) {
        console.error(err)

        setError(
          'Failed to load dashboard data.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedPlatform])

  // Loading state
  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Creator Analytics Dashboard
        </h1>

        <p className="mt-4 text-gray-500">
          Loading dashboard data...
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Creator Analytics Dashboard
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    )
  }

  // Selected platform data
  const selectedData =
    selectedPlatform === 'All'
      ? summary
      : platformPerformance[0]

  return (
    <div>

      {/* Dashboard Heading + Platform Selector */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Creator Analytics Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Overview of your content performance and creator metrics
          </p>
        </div>

        {/* Platform Selector */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="platform"
            className="font-medium text-gray-700"
          >
            Platform:
          </label>

          <select
            id="platform"
            value={selectedPlatform}
            onChange={(e) =>
              setSelectedPlatform(e.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="All">
              All
            </option>

            <option value="YouTube">
              YouTube
            </option>

            <option value="Instagram">
              Instagram
            </option>
          </select>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

        <KPICard
          title="Total Views"
          value={
            (selectedData?.total_views || 0).toLocaleString()
          }
          description="Total content views"
        />

        <KPICard
          title="Total Likes"
          value={
            selectedPlatform === 'All'
              ? (summary?.total_likes || 0).toLocaleString()
              : (selectedData?.total_likes || 0).toLocaleString()
          }
          description="Total content likes"
        />

        <KPICard
          title="Total Comments"
          value={
            selectedPlatform === 'All'
              ? (summary?.total_comments || 0).toLocaleString()
              : (selectedData?.total_comments || 0).toLocaleString()
          }
          description="Total content comments"
        />

        <KPICard
          title="Engagement Rate"
          value={
            selectedPlatform === 'All'
              ? `${summary?.average_engagement_rate || 0}%`
              : `${selectedData?.average_engagement_rate || 0}%`
          }
          description="Average engagement rate"
        />

        <KPICard
          title="Total Reach"
          value={
            (selectedData?.total_reach || 0).toLocaleString()
          }
          description="Total audience reach"
        />

        <KPICard
          title="Total Followers"
          value={
            (summary?.total_followers || 0).toLocaleString()
          }
          description="Total followers"
        />

      </div>

      {/* Engagement Chart */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Engagement Rate Trend
        </h2>

        <EngagementChart
          data={engagementData}
        />

      </div>

      {/* Followers Chart */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Followers Growth Trend
        </h2>

        <FollowerChart
          data={followerData}
        />

      </div>

      {/* Top Performing Content */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Top Performing Content
        </h2>

        <TopContentTable
          data={topContent}
        />

      </div>

      {/* Platform Performance / Comparison */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          {selectedPlatform === 'All'
            ? 'Platform Comparison'
            : `${selectedPlatform} Performance`}
        </h2>

        <PlatformPerformanceChart
          data={platformPerformance}
        />

      </div>

    </div>
  )
}

export default Dashboard
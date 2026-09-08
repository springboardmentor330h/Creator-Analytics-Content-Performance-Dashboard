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

  const [selectedPlatform, setSelectedPlatform] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError('')

        const summaryResponse = await api.get('/analytics/summary')
        setSummary(summaryResponse.data)

        const engagementResponse = await api.get(
          '/analytics/chart/engagement'
        )

        const chartData = engagementResponse.data.labels.map(
          (date, index) => ({
            date,
            engagement: engagementResponse.data.values[index],
          })
        )

        setEngagementData(chartData)

        const followerResponse = await api.get(
          '/analytics/chart/followers'
        )

        const followerChartData = followerResponse.data.labels.map(
          (date, index) => ({
            date,
            followers: followerResponse.data.values[index],
          })
        )

        setFollowerData(followerChartData)

        const topContentResponse = await api.get(
          '/analytics/top-content'
        )

        setTopContent(topContentResponse.data)

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
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedPlatform])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-[#2563eb]">
          Creator Analytics Dashboard
        </h1>

        <p className="mt-4 text-gray-500">
          Loading dashboard data...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-[#2563eb]">
          Creator Analytics Dashboard
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    )
  }

  const selectedData =
    selectedPlatform === 'All'
      ? summary
      : platformPerformance[0]

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* Page Heading */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
            Creator Analytics Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Overview of your content performance and creator metrics
          </p>
        </div>

        {/* Platform Selector */}
        <div className="flex items-center gap-3">

          <label
            htmlFor="platform"
            className="text-sm font-semibold text-[#2563eb]"
          >
            Platform:
          </label>

          <select
            id="platform"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All</option>
            <option value="YouTube">YouTube</option>
            <option value="Instagram">Instagram</option>
          </select>

        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <KPICard
          title="Total Views"
          value={(selectedData?.total_views || 0).toLocaleString()}
          description="Total content views"
          icon="◉"
        />

        <KPICard
          title="Total Likes"
          value={
            selectedPlatform === 'All'
              ? (summary?.total_likes || 0).toLocaleString()
              : (selectedData?.total_likes || 0).toLocaleString()
          }
          description="Total content likes"
          icon="♥"
        />

        <KPICard
          title="Total Comments"
          value={
            selectedPlatform === 'All'
              ? (summary?.total_comments || 0).toLocaleString()
              : (selectedData?.total_comments || 0).toLocaleString()
          }
          description="Total content comments"
          icon="●"
        />

        <KPICard
          title="Engagement Rate"
          value={
            selectedPlatform === 'All'
              ? `${summary?.average_engagement_rate || 0}%`
              : `${selectedData?.average_engagement_rate || 0}%`
          }
          description="Average engagement rate"
          icon="↗"
        />

        <KPICard
          title="Total Reach"
          value={(selectedData?.total_reach || 0).toLocaleString()}
          description="Total audience reach"
          icon="◎"
        />

        <KPICard
          title="Total Followers"
          value={(summary?.total_followers || 0).toLocaleString()}
          description="Total followers"
          icon="♟"
        />

      </div>

      {/* Engagement Rate Trend */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <div className="mb-4">

          <h2 className="text-lg font-bold text-[#2563eb]">
            Engagement Rate Trend
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Track how engagement has changed over time
          </p>

        </div>

        <div className="h-[260px] w-full">
          <EngagementChart data={engagementData} />
        </div>

      </div>

      {/* Followers Growth Trend */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <div className="mb-4">

          <h2 className="text-lg font-bold text-[#2563eb]">
            Followers Growth Trend
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Monitor your audience growth over time
          </p>

        </div>

        <div className="h-[260px] w-full">
          <FollowerChart data={followerData} />
        </div>

      </div>

      {/* Top Performing Content */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <div className="mb-4">

          <h2 className="text-lg font-bold text-[#2563eb]">
            Top Performing Content
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Content generating the strongest performance
          </p>

        </div>

        <TopContentTable data={topContent} />

      </div>

      {/* Platform Comparison + Profile */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-stretch">

        {/* Platform Comparison */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md lg:w-[50%]">

          <div className="mb-4">

            <h2 className="text-lg font-bold text-[#2563eb]">
              {selectedPlatform === 'All'
                ? 'Platform Comparison'
                : `${selectedPlatform} Performance`}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {selectedPlatform === 'All'
                ? 'Compare performance across connected platforms'
                : `Performance metrics for ${selectedPlatform}`}
            </p>

          </div>

          <div className="h-[260px] w-full">
            <PlatformPerformanceChart
              data={platformPerformance}
            />
          </div>

        </div>

        {/* Profile */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md lg:w-[50%]">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-[#2563eb]">
              Profile
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Creator account information
            </p>

          </div>

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
              C
            </div>

            <div>

              <h3 className="text-xl font-bold text-[#2563eb]">
                Creator
              </h3>

              <p className="text-sm text-gray-500">
                CreatorIQ Account
              </p>

            </div>

          </div>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between border-b border-gray-100 pb-3">

              <span className="text-sm font-medium text-gray-500">
                Account Status
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Active
              </span>

            </div>

            <div className="flex items-center justify-between border-b border-gray-100 pb-3">

              <span className="text-sm font-medium text-gray-500">
                Connected Platforms
              </span>

              <span className="text-sm font-semibold text-gray-800">
                2
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm font-medium text-gray-500">
                Current View
              </span>

              <span className="text-sm font-semibold text-[#2563eb]">
                {selectedPlatform}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard
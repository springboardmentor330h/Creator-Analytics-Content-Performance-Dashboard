import { useEffect, useState } from 'react'
import KPICard from '../components/KPICard'
import api from '../services/api'

function ContentAnalytics() {
  const [summary, setSummary] = useState(null)
  const [topContent, setTopContent] = useState([])
  const [platformData, setPlatformData] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchContentAnalytics = async () => {
      try {
        setLoading(true)
        setError('')

        const summaryResponse = await api.get(
          '/analytics/summary'
        )

        const topContentResponse = await api.get(
          '/analytics/top-content'
        )

        const platformResponse = await api.get(
          '/analytics/platform-performance'
        )

        setSummary(summaryResponse.data)
        setTopContent(topContentResponse.data)
        setPlatformData(platformResponse.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load content analytics.')
      } finally {
        setLoading(false)
      }
    }

    fetchContentAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-[#2563eb]">
          Content Analytics
        </h1>

        <p className="mt-4 text-gray-500">
          Loading content analytics...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-[#2563eb]">
          Content Analytics
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Content Analytics
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Analyze your content performance across different platforms.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <KPICard
          title="Total Views"
          value={(summary?.total_views || 0).toLocaleString()}
          description="Total content views"
          icon="◉"
        />

        <KPICard
          title="Total Likes"
          value={(summary?.total_likes || 0).toLocaleString()}
          description="Total content likes"
          icon="♥"
        />

        <KPICard
          title="Total Comments"
          value={(summary?.total_comments || 0).toLocaleString()}
          description="Total content comments"
          icon="●"
        />

        <KPICard
          title="Engagement Rate"
          value={`${summary?.average_engagement_rate || 0}%`}
          description="Average engagement rate"
          icon="↗"
        />

        <KPICard
          title="Total Reach"
          value={(summary?.total_reach || 0).toLocaleString()}
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

      {/* Top Performing Content */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#2563eb]">
            Top Performing Content
          </h2>

          <p className="mt-1 text-xs text-[#2563eb]">
            Content generating the strongest performance
          </p>
        </div>

        {topContent.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No content data found.
          </p>
        ) : (
          <table className="w-full text-left">

            <thead>
              <tr className="border-b">

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Content
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Platform
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Views
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Reach
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Watch Time
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Engagement Rate
                </th>

              </tr>
            </thead>

            <tbody>
              {topContent.map((content, index) => (
                <tr
                  key={index}
                  className="border-b last:border-b-0"
                >

                  <td className="px-4 py-4 text-gray-700">
                    {content.content_title}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {content.platform}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {content.views?.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {content.reach?.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {content.watch_time?.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {content.engagement_rate}%
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

      {/* Platform Performance */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#2563eb]">
            Platform Performance
          </h2>

          <p className="mt-1 text-xs text-[#2563eb]">
            Compare content performance across platforms
          </p>
        </div>

        {platformData.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No platform data found.
          </p>
        ) : (
          <table className="w-full text-left">

            <thead>
              <tr className="border-b">

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Platform
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Views
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Likes
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Comments
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Reach
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Engagement Rate
                </th>

              </tr>
            </thead>

            <tbody>
              {platformData.map((platform, index) => (
                <tr
                  key={index}
                  className="border-b last:border-b-0"
                >

                  <td className="px-4 py-4 text-gray-700">
                    {platform.platform}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {platform.total_views?.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {platform.total_likes?.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {platform.total_comments?.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {platform.total_reach?.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {platform.average_engagement_rate}%
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

    </div>
  )
}

export default ContentAnalytics
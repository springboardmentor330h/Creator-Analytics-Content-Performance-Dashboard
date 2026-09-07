import { useEffect, useState } from 'react'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Content Analytics
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Content Analytics
        </h1>

        <p className="mt-2 text-gray-500">
          Analyze your content performance across
          different platforms.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

        {/* Views */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Views
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {summary?.total_views?.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total content views
          </p>
        </div>

        {/* Likes */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Likes
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {summary?.total_likes?.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total content likes
          </p>
        </div>

        {/* Comments */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Comments
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {summary?.total_comments?.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total content comments
          </p>
        </div>

        {/* Engagement */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Engagement Rate
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {summary?.average_engagement_rate}%
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Average engagement rate
          </p>
        </div>

      </div>

      {/* Additional Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Reach */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Reach
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {summary?.total_reach?.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total audience reach
          </p>
        </div>

        {/* Shares */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Shares
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {summary?.total_shares?.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total content shares
          </p>
        </div>

      </div>

      {/* Top Performing Content */}
      <div className="mb-8 overflow-x-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Top Performing Content
        </h2>

        {topContent.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No content data found.
          </p>
        ) : (
          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-sm text-gray-500">

                <th className="px-4 py-3">
                  Content
                </th>

                <th className="px-4 py-3">
                  Platform
                </th>

                <th className="px-4 py-3">
                  Views
                </th>

                <th className="px-4 py-3">
                  Reach
                </th>

                <th className="px-4 py-3">
                  Watch Time
                </th>

                <th className="px-4 py-3">
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

                  <td className="px-4 py-4 font-medium text-gray-800">
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

                  <td className="px-4 py-4 font-medium text-gray-800">
                    {content.engagement_rate}%
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

      {/* Platform Performance */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Platform Performance
        </h2>

        {platformData.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No platform data found.
          </p>
        ) : (
          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-sm text-gray-500">

                <th className="px-4 py-3">
                  Platform
                </th>

                <th className="px-4 py-3">
                  Views
                </th>

                <th className="px-4 py-3">
                  Likes
                </th>

                <th className="px-4 py-3">
                  Comments
                </th>

                <th className="px-4 py-3">
                  Reach
                </th>

                <th className="px-4 py-3">
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

                  <td className="px-4 py-4 font-medium text-gray-800">
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

                  <td className="px-4 py-4 font-medium text-gray-800">
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
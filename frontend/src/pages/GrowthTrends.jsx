import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import api from '../services/api'

function GrowthTrends() {
  const [growthData, setGrowthData] = useState([])
  const [audienceTrends, setAudienceTrends] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        // Get follower growth data
        const growthResponse = await api.get(
          '/analytics/growth'
        )

        setGrowthData(growthResponse.data)

        // Get audience trend data
        const audienceResponse = await api.get(
          '/analytics/audience-trends'
        )

        setAudienceTrends(audienceResponse.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load growth data.')
      } finally {
        setLoading(false)
      }
    }

    fetchGrowthData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Growth & Trends
        </h1>

        <p className="mt-4 text-gray-500">
          Loading growth data...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Growth & Trends
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
          Growth & Trends
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Track follower growth and audience reach over time.
        </p>
      </div>

      {/* Follower Growth Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Follower Growth
        </h2>

        <div className="h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart data={growthData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="followers"
                name="Followers"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />

            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Daily Growth Chart */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Daily Follower Growth
        </h2>

        <div className="h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart data={growthData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="daily_growth"
                name="Daily Growth"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />

            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Audience Reach Trend */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Audience Reach Trend
        </h2>

        <div className="h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart data={audienceTrends}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="followers"
                name="Followers"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="reach"
                name="Reach"
                stroke="#9333ea"
                strokeWidth={2}
                dot={false}
              />

            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Growth Details Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Growth Details
        </h2>

        <table className="w-full text-left">

          <thead>
            <tr className="border-b">

              <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                Date
              </th>

              <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                Followers
              </th>

              <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                Daily Growth
              </th>

              <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                Growth %
              </th>

            </tr>
          </thead>

          <tbody>

            {growthData.map((item, index) => (

              <tr
                key={index}
                className="border-b last:border-b-0"
              >

                <td className="px-4 py-4 text-gray-700">
                  {item.date}
                </td>

                <td className="px-4 py-4 text-gray-600">
                  {item.followers?.toLocaleString()}
                </td>

                <td className="px-4 py-4 text-gray-600">
                  {item.daily_growth?.toLocaleString()}
                </td>

                <td className="px-4 py-4 text-gray-600">
                  {item.growth_percentage}%
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default GrowthTrends
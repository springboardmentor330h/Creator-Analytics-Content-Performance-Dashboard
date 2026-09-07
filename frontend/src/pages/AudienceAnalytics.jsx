import { useEffect, useState } from 'react'
import api from '../services/api'

function AudienceAnalytics() {
  const [audienceData, setAudienceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAudienceData = async () => {
      try {
        const response = await api.get(
          '/analytics/audience'
        )

        console.log(
          'Audience API response:',
          response.data
        )

        setAudienceData(response.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load audience data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAudienceData()
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Audience Analytics
        </h1>

        <p className="mt-4 text-gray-500">
          Loading audience data...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Audience Analytics
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    )
  }

  if (!audienceData) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Audience Analytics
        </h1>

        <p className="mt-4 text-gray-500">
          No audience data found.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Audience Analytics
        </h1>

        <p className="mt-2 text-gray-500">
          Understand your audience demographics, reach,
          and distribution.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">

        {/* Total Followers */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Followers
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {audienceData.total_followers?.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total audience followers
          </p>
        </div>

        {/* Total Impressions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Impressions
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {audienceData.total_impressions?.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total audience impressions
          </p>
        </div>

        {/* Total Reach */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Reach
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {audienceData.total_reach?.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total audience reach
          </p>
        </div>

      </div>

      {/* Age Distribution */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Age Distribution
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {Object.entries(
            audienceData.age_distribution || {}
          ).map(([ageGroup, value]) => (
            <div
              key={ageGroup}
              className="rounded-lg bg-gray-50 p-5 text-center"
            >
              <p className="text-sm text-gray-500">
                {ageGroup}
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-800">
                {value}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* Gender Distribution */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Gender Distribution
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {Object.entries(
            audienceData.gender_distribution || {}
          ).map(([gender, value]) => (
            <div
              key={gender}
              className="rounded-lg bg-gray-50 p-5"
            >
              <div className="flex items-center justify-between">

                <p className="font-medium text-gray-700">
                  {gender}
                </p>

                <p className="text-2xl font-bold text-gray-800">
                  {value}%
                </p>

              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">

                <div
                  className="h-full rounded-full bg-gray-800"
                  style={{
                    width: `${value}%`,
                  }}
                />

              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Device Distribution */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Device Distribution
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {Object.entries(
            audienceData.device_distribution || {}
          ).map(([device, value]) => (
            <div
              key={device}
              className="rounded-lg bg-gray-50 p-5 text-center"
            >

              <p className="text-sm text-gray-500">
                {device}
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-800">
                {value}
              </p>

            </div>
          ))}

        </div>
      </div>

      {/* Top Countries */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Top Countries
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="px-4 py-3">
                  Country
                </th>

                <th className="px-4 py-3">
                  Audience
                </th>
              </tr>
            </thead>

            <tbody>

              {(audienceData.top_countries || []).map(
                ([country, value], index) => (
                  <tr
                    key={index}
                    className="border-b last:border-b-0"
                  >

                    <td className="px-4 py-4 font-medium text-gray-800">
                      {country}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {value}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* Top Cities */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Top Cities
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-sm text-gray-500">

                <th className="px-4 py-3">
                  City
                </th>

                <th className="px-4 py-3">
                  Audience
                </th>

              </tr>
            </thead>

            <tbody>

              {(audienceData.top_cities || []).map(
                ([city, value], index) => (
                  <tr
                    key={index}
                    className="border-b last:border-b-0"
                  >

                    <td className="px-4 py-4 font-medium text-gray-800">
                      {city}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {value}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  )
}

export default AudienceAnalytics
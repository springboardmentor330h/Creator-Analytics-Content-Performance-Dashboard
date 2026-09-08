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
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-[#2563eb]">
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
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-[#2563eb]">
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
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-[#2563eb]">
          Audience Analytics
        </h1>

        <p className="mt-4 text-gray-500">
          No audience data found.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Audience Analytics
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Understand your audience demographics, reach,
          and distribution.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Total Followers */}
        <div className="rounded-2xl bg-[#DBEAFE] p-6 shadow-sm transition duration-300 hover:shadow-md">

          <p className="text-sm font-bold text-[#2563eb]">
            Total Followers
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#2563eb]">
            {(audienceData.total_followers || 0).toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Total audience followers
          </p>

        </div>

        {/* Total Impressions */}
        <div className="rounded-2xl bg-[#DBEAFE] p-6 shadow-sm transition duration-300 hover:shadow-md">

          <p className="text-sm font-bold text-[#2563eb]">
            Total Impressions
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#2563eb]">
            {(audienceData.total_impressions || 0).toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Total audience impressions
          </p>

        </div>

        {/* Total Reach */}
        <div className="rounded-2xl bg-[#DBEAFE] p-6 shadow-sm transition duration-300 hover:shadow-md">

          <p className="text-sm font-bold text-[#2563eb]">
            Total Reach
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#2563eb]">
            {(audienceData.total_reach || 0).toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Total audience reach
          </p>

        </div>

      </div>

      {/* Age Distribution */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Age Distribution
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {Object.entries(
            audienceData.age_distribution || {}
          ).map(([ageGroup, value]) => (

            <div
              key={ageGroup}
              className="rounded-xl bg-[#DBEAFE] p-5 text-center shadow-sm"
            >

              <p className="text-sm font-medium text-[#2563eb]">
                {ageGroup}
              </p>

              <p className="mt-2 text-2xl font-bold text-[#2563eb]">
                {value}
              </p>

            </div>

          ))}

        </div>

      </div>

      {/* Gender Distribution */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Gender Distribution
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {Object.entries(
            audienceData.gender_distribution || {}
          ).map(([gender, value]) => (

            <div
              key={gender}
              className="rounded-xl bg-[#DBEAFE] p-5 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <p className="font-medium text-[#2563eb]">
                  {gender}
                </p>

                <p className="text-2xl font-bold text-[#2563eb]">
                  {value}%
                </p>

              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-blue-200">

                <div
                  className="h-full rounded-full bg-[#2563eb]"
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
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Device Distribution
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {Object.entries(
            audienceData.device_distribution || {}
          ).map(([device, value]) => (

            <div
              key={device}
              className="rounded-xl bg-[#DBEAFE] p-5 text-center shadow-sm"
            >

              <p className="text-sm font-medium text-[#2563eb]">
                {device}
              </p>

              <p className="mt-2 text-2xl font-bold text-[#2563eb]">
                {value}
              </p>

            </div>

          ))}

        </div>

      </div>

      {/* Top Countries */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Top Countries
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b">

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Country
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
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

                    <td className="px-4 py-4 text-gray-700">
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
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Top Cities
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b">

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  City
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
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

                    <td className="px-4 py-4 text-gray-700">
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
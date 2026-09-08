import { useEffect, useState } from 'react'
import api from '../services/api'

function Sponsorships() {
  const [sponsorships, setSponsorships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSponsorships = async () => {
      try {
        const response = await api.get('/sponsorships/')

        console.log(
          'Sponsorship API response:',
          response.data
        )

        if (Array.isArray(response.data)) {
          setSponsorships(response.data)
        } else if (Array.isArray(response.data.data)) {
          setSponsorships(response.data.data)
        } else {
          setSponsorships([])
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load sponsorship data.')
      } finally {
        setLoading(false)
      }
    }

    fetchSponsorships()
  }, [])

  const totalSponsorships = sponsorships.length

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Sponsorships
        </h1>

        <p className="mt-4 text-gray-500">
          Loading sponsorship data...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Sponsorships
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
          Sponsorships
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage and track your sponsorship campaigns.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Total Sponsorships */}
        <div className="rounded-2xl bg-[#DBEAFE] p-6 shadow-sm transition duration-300 hover:shadow-md">

          <p className="text-sm font-bold text-[#2563eb]">
            Total Sponsorships
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#2563eb]">
            {totalSponsorships}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Total sponsorship records
          </p>

        </div>

        {/* Active Campaigns */}
        <div className="rounded-2xl bg-[#DBEAFE] p-6 shadow-sm transition duration-300 hover:shadow-md">

          <p className="text-sm font-bold text-[#2563eb]">
            Active Campaigns
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#2563eb]">
            {
              sponsorships.filter(
                (item) =>
                  item.status?.toLowerCase() === 'active'
              ).length
            }
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Currently active sponsorships
          </p>

        </div>

      </div>

      {/* Sponsorship Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Sponsorship Details
        </h2>

        {sponsorships.length === 0 ? (

          <p className="py-8 text-center text-gray-500">
            No sponsorship records found.
          </p>

        ) : (

          <table className="w-full text-left">

            <thead>
              <tr className="border-b">

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Brand
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Campaign
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Amount
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Status
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Start Date
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  End Date
                </th>

              </tr>
            </thead>

            <tbody>

              {sponsorships.map((sponsorship, index) => (

                <tr
                  key={sponsorship.id || index}
                  className="border-b last:border-b-0"
                >

                  <td className="px-4 py-4 text-gray-700">
                    {sponsorship.brand_name ||
                      sponsorship.brand ||
                      '-'}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {sponsorship.campaign_name ||
                      sponsorship.campaign ||
                      '-'}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {sponsorship.amount != null
                      ? `₹${sponsorship.amount.toLocaleString()}`
                      : '-'}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {sponsorship.status || '-'}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {sponsorship.start_date || '-'}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {sponsorship.end_date || '-'}
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

export default Sponsorships
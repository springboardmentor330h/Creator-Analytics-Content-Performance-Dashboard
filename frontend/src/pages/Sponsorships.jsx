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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Sponsorships
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
          Sponsorships
        </h1>

        <p className="mt-2 text-gray-500">
          Manage and track your sponsorship campaigns.
        </p>
      </div>

      {/* Summary Card */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Sponsorships
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {totalSponsorships}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total sponsorship records
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Active Campaigns
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {
              sponsorships.filter(
                (item) =>
                  item.status?.toLowerCase() === 'active'
              ).length
            }
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Currently active sponsorships
          </p>
        </div>

      </div>

      {/* Sponsorship Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Sponsorship Details
        </h2>

        {sponsorships.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No sponsorship records found.
          </p>
        ) : (
          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-sm text-gray-500">

                <th className="px-4 py-3">
                  Brand
                </th>

                <th className="px-4 py-3">
                  Campaign
                </th>

                <th className="px-4 py-3">
                  Amount
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3">
                  Start Date
                </th>

                <th className="px-4 py-3">
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

                  <td className="px-4 py-4 font-medium text-gray-800">
                    {sponsorship.brand_name ||
                      sponsorship.brand ||
                      '-'}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {sponsorship.campaign_name ||
                      sponsorship.campaign ||
                      '-'}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
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
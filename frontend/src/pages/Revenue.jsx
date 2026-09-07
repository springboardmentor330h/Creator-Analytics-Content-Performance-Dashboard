import { useEffect, useState } from 'react'
import api from '../services/api'

function Revenue() {
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await api.get('/revenue/')

        setRevenueData(response.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load revenue data.')
      } finally {
        setLoading(false)
      }
    }

    fetchRevenue()
  }, [])

  const totalRevenue = revenueData.reduce(
    (total, revenue) => total + revenue.amount,
    0
  )

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Revenue
        </h1>

        <p className="mt-4 text-gray-500">
          Loading revenue data...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Revenue
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
          Revenue
        </h1>

        <p className="mt-2 text-gray-500">
          Track your creator revenue and income sources.
        </p>
      </div>

      {/* Total Revenue Card */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Revenue
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            ₹{totalRevenue.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total revenue from all sources
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Revenue Records
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {revenueData.length}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total revenue transactions
          </p>
        </div>

      </div>

      {/* Revenue Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Revenue Details
        </h2>

        {revenueData.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No revenue records found.
          </p>
        ) : (
          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-sm text-gray-500">

                <th className="px-4 py-3">
                  Source
                </th>

                <th className="px-4 py-3">
                  Amount
                </th>

                <th className="px-4 py-3">
                  Currency
                </th>

                <th className="px-4 py-3">
                  Description
                </th>

                <th className="px-4 py-3">
                  Revenue Date
                </th>

              </tr>
            </thead>

            <tbody>
              {revenueData.map((revenue) => (
                <tr
                  key={revenue.id}
                  className="border-b last:border-b-0"
                >

                  <td className="px-4 py-4 font-medium text-gray-800">
                    {revenue.source}
                  </td>

                  <td className="px-4 py-4 font-medium text-gray-800">
                    {revenue.amount.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {revenue.currency}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {revenue.description || '-'}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {revenue.revenue_date}
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

export default Revenue
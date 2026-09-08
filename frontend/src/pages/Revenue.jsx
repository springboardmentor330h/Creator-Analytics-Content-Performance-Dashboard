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
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
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
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Revenue
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
          Revenue
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Track your creator revenue and income sources.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Total Revenue */}
        <div className="rounded-2xl bg-[#DBEAFE] p-6 shadow-sm transition duration-300 hover:shadow-md">

          <p className="text-sm font-bold text-[#2563eb]">
            Total Revenue
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#2563eb]">
            ₹{totalRevenue.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Total revenue from all sources
          </p>

        </div>

        {/* Revenue Records */}
        <div className="rounded-2xl bg-[#DBEAFE] p-6 shadow-sm transition duration-300 hover:shadow-md">

          <p className="text-sm font-bold text-[#2563eb]">
            Revenue Records
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#2563eb]">
            {revenueData.length}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Total revenue transactions
          </p>

        </div>

      </div>

      {/* Revenue Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
          Revenue Details
        </h2>

        {revenueData.length === 0 ? (

          <p className="py-8 text-center text-gray-500">
            No revenue records found.
          </p>

        ) : (

          <table className="w-full text-left">

            <thead>
              <tr className="border-b">

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Source
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Amount
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Currency
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
                  Description
                </th>

                <th className="px-4 py-3 text-sm font-bold text-[#2563eb]">
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

                  <td className="px-4 py-4 text-gray-700">
                    {revenue.source}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
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
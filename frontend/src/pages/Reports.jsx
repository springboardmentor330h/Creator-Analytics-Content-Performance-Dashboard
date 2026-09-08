import { useEffect, useState } from 'react'
import api from '../services/api'

function Reports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState('')

  const creatorId = 1

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get(
          `/reports/creator/${creatorId}`
        )

        console.log(
          'Report API response:',
          response.data
        )

        setReport(response.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load report.')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [])

  const handlePdfExport = async () => {
    try {
      setExporting('pdf')

      const response = await api.get(
        `/reports/creator/${creatorId}/export/pdf`,
        {
          responseType: 'blob',
        }
      )

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: 'application/pdf',
        })
      )

      const link = document.createElement('a')
      link.href = url
      link.download = `creator_report_${creatorId}.pdf`

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Failed to export PDF report.')
    } finally {
      setExporting('')
    }
  }

  const handleExcelExport = async () => {
    try {
      setExporting('excel')

      const response = await api.get(
        `/reports/export/excel/${creatorId}`,
        {
          responseType: 'blob',
        }
      )

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
      )

      const link = document.createElement('a')
      link.href = url
      link.download = `creator_report_${creatorId}.xlsx`

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Failed to export Excel report.')
    } finally {
      setExporting('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Reports
        </h1>

        <p className="mt-4 text-gray-500">
          Loading report...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Reports
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
          Reports
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Generate and export your creator analytics reports.
        </p>
      </div>

      {/* Export Buttons */}
      <div className="mb-6 flex flex-wrap gap-4">

        <button
          onClick={handlePdfExport}
          disabled={exporting !== ''}
          className="rounded-xl bg-[#2563eb] px-6 py-3 font-medium text-white shadow-sm transition duration-300 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting === 'pdf'
            ? 'Generating PDF...'
            : 'Export PDF'}
        </button>

        <button
          onClick={handleExcelExport}
          disabled={exporting !== ''}
          className="rounded-xl border border-blue-200 bg-[#DBEAFE] px-6 py-3 font-medium text-[#2563eb] shadow-sm transition duration-300 hover:bg-blue-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting === 'excel'
            ? 'Generating Excel...'
            : 'Export Excel'}
        </button>

      </div>

      {/* Report */}
      {report ? (

        <div className="space-y-6">

          {/* Content Performance */}
          {report.content_performance && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

              <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
                Content Performance
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-[#DBEAFE] p-5">
                  <p className="text-sm font-bold text-[#2563eb]">
                    Total Views
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-[#2563eb]">
                    {report.content_performance.total_views?.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-[#DBEAFE] p-5">
                  <p className="text-sm font-bold text-[#2563eb]">
                    Total Reach
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-[#2563eb]">
                    {report.content_performance.total_reach?.toLocaleString()}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* Engagement */}
          {report.engagement && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

              <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
                Engagement
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-[#DBEAFE] p-5">
                  <p className="text-sm font-bold text-[#2563eb]">
                    Total Engagement
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-[#2563eb]">
                    {report.engagement.total_engagement?.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-[#DBEAFE] p-5">
                  <p className="text-sm font-bold text-[#2563eb]">
                    Engagement Rate
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-[#2563eb]">
                    {report.engagement.engagement_rate}%
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* Audience */}
          {report.audience && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

              <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
                Audience Analytics
              </h2>

              <div className="rounded-xl bg-[#DBEAFE] p-5">

                <p className="text-sm font-bold text-[#2563eb]">
                  Total Followers
                </p>

                <p className="mt-2 text-2xl font-extrabold text-[#2563eb]">
                  {report.audience.total_followers?.toLocaleString()}
                </p>

              </div>

            </div>
          )}

          {/* Revenue */}
          {report.revenue && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

              <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
                Revenue Analytics
              </h2>

              <div className="rounded-xl bg-[#DBEAFE] p-5">

                <p className="text-sm font-bold text-[#2563eb]">
                  Total Revenue
                </p>

                <p className="mt-2 text-2xl font-extrabold text-[#2563eb]">
                  ₹{report.revenue.total_revenue?.toLocaleString()}
                </p>

              </div>

            </div>
          )}

          {/* Growth */}
          {report.growth && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

              <h2 className="mb-5 text-lg font-bold text-[#2563eb]">
                Growth Trends
              </h2>

              <div className="rounded-xl bg-[#DBEAFE] p-5">

                <p className="text-sm font-bold text-[#2563eb]">
                  Latest Followers
                </p>

                <p className="mt-2 text-2xl font-extrabold text-[#2563eb]">
                  {report.growth.latest_followers?.toLocaleString()}
                </p>

              </div>

            </div>
          )}

        </div>

      ) : (

        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            No report data found.
          </p>
        </div>

      )}

    </div>
  )
}

export default Reports
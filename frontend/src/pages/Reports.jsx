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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Reports
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Reports
        </h1>

        <p className="mt-2 text-gray-500">
          Generate and export your creator analytics reports.
        </p>
      </div>

      {/* Export Buttons */}
      <div className="mb-8 flex flex-wrap gap-4">

        <button
          onClick={handlePdfExport}
          disabled={exporting !== ''}
          className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting === 'pdf'
            ? 'Generating PDF...'
            : 'Export PDF'}
        </button>

        <button
          onClick={handleExcelExport}
          disabled={exporting !== ''}
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting === 'excel'
            ? 'Generating Excel...'
            : 'Export Excel'}
        </button>

      </div>

      {/* Report */}
      {report ? (
        <div className="space-y-8">

          {/* Content Performance */}
          {report.content_performance && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-6 text-xl font-bold text-gray-800">
                Content Performance
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                <div>
                  <p className="text-sm text-gray-500">
                    Total Views
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {report.content_performance.total_views?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Total Reach
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {report.content_performance.total_reach?.toLocaleString()}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* Engagement */}
          {report.engagement && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-6 text-xl font-bold text-gray-800">
                Engagement
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                <div>
                  <p className="text-sm text-gray-500">
                    Total Engagement
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {report.engagement.total_engagement?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Engagement Rate
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {report.engagement.engagement_rate}%
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* Audience */}
          {report.audience && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-6 text-xl font-bold text-gray-800">
                Audience Analytics
              </h2>

              <div>
                <p className="text-sm text-gray-500">
                  Total Followers
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {report.audience.total_followers?.toLocaleString()}
                </p>
              </div>

            </div>
          )}

          {/* Revenue */}
          {report.revenue && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-6 text-xl font-bold text-gray-800">
                Revenue Analytics
              </h2>

              <div>
                <p className="text-sm text-gray-500">
                  Total Revenue
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-800">
                  ₹{report.revenue.total_revenue?.toLocaleString()}
                </p>
              </div>

            </div>
          )}

          {/* Growth */}
          {report.growth && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-6 text-xl font-bold text-gray-800">
                Growth Trends
              </h2>

              <div>
                <p className="text-sm text-gray-500">
                  Latest Followers
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {report.growth.latest_followers?.toLocaleString()}
                </p>
              </div>

            </div>
          )}

        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            No report data found.
          </p>
        </div>
      )}
    </div>
  )
}

export default Reports
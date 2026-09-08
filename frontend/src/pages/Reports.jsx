import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  getCreatorReport, downloadReportPdf, downloadReportExcel, triggerBrowserDownload,
} from '../services/reportService'

export default function Reports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState('')

  useEffect(() => {
    getCreatorReport()
      .then(setReport)
      .catch(() => setError('Could not load report. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDownloadPdf() {
    setDownloading('pdf')
    try {
      const blob = await downloadReportPdf()
      triggerBrowserDownload(blob, 'creatoriq-report.pdf')
    } catch (err) {
      setError('PDF download failed.')
    } finally {
      setDownloading('')
    }
  }

  async function handleDownloadExcel() {
    setDownloading('excel')
    try {
      const blob = await downloadReportExcel()
      triggerBrowserDownload(blob, 'creatoriq-report.xlsx')
    } catch (err) {
      setError('Excel download failed.')
    } finally {
      setDownloading('')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>Reports</h1>
        <p className="text-muted">
          A full analytics report combining content, audience, revenue, growth, and platform data.
        </p>

        {error && <div className="auth-error" style={{ marginTop: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn-small" onClick={handleDownloadPdf} disabled={downloading === 'pdf'}>
            {downloading === 'pdf' ? 'Generating...' : 'Download PDF'}
          </button>
          <button className="btn-small" onClick={handleDownloadExcel} disabled={downloading === 'excel'}>
            {downloading === 'excel' ? 'Generating...' : 'Download Excel'}
          </button>
        </div>

        {loading && <p className="text-muted" style={{ marginTop: '1.5rem' }}>Loading report...</p>}

        {!loading && report && (
          <>
            <div className="kpi-grid" style={{ maxWidth: 'none', marginTop: '1.5rem' }}>
              <div className="kpi-card">
                <span className="kpi-label">Total Content</span>
                <span className="kpi-value">{report.content.kpi_summary.total_content}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Total Followers</span>
                <span className="kpi-value">{report.audience.kpi_summary.total_followers.toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Total Revenue</span>
                <span className="kpi-value">${report.revenue.kpi_summary.total_revenue.toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Active Sponsorships</span>
                <span className="kpi-value">{report.revenue.kpi_summary.active_sponsorships}</span>
              </div>
            </div>

            <section className="table-section">
              <h2>Top Performing Content</h2>
              {report.content.top_performing.length === 0 ? (
                <p className="text-muted">No content yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Title</th><th>Platform</th><th>Engagement Rate</th></tr>
                  </thead>
                  <tbody>
                    {report.content.top_performing.map((c) => (
                      <tr key={c.id}>
                        <td>{c.title}</td>
                        <td className="capitalize">{c.platform}</td>
                        <td>{c.engagement_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

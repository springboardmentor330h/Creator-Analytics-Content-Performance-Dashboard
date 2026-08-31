import { useState } from 'react'
import { reportApi } from '../services/api'
import {
  FileText, Download, BarChart3, Users, TrendingUp, DollarSign,
  Globe, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react'
import PlatformIcon from '../components/PlatformIcon'

interface ReportCard {
  id: string; title: string; description: string; icon: any; color: string
}

const REPORT_CARDS: ReportCard[] = [
  { id: 'content', title: 'Content Performance', description: 'Views, likes, comments, shares, engagement rates', icon: BarChart3, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'audience', title: 'Audience Analytics', description: 'Followers, reach, demographics, locations', icon: Users, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'growth', title: 'Growth Trends', description: 'Follower growth, trend direction, daily growth', icon: TrendingUp, color: 'bg-amber-100 text-amber-600' },
  { id: 'revenue', title: 'Revenue Analytics', description: 'Total revenue, monthly breakdown, source analysis', icon: DollarSign, color: 'bg-violet-100 text-violet-600' },
  { id: 'platform', title: 'Platform Comparison', description: 'Views, reach, engagement per platform', icon: Globe, color: 'bg-blue-100 text-blue-600' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const [summaryStatus, setSummaryStatus] = useState<Status>('idle')
  const [pdfStatus, setPdfStatus] = useState<Status>('idle')
  const [xlsxStatus, setXlsxStatus] = useState<Status>('idle')
  const [summary, setSummary] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSummary = async () => {
    setSummaryStatus('loading'); setErrorMsg('')
    try {
      const res = await reportApi.summary()
      setSummary(res.data); setSummaryStatus('success')
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.detail || 'Failed to generate report')
      setSummaryStatus('error')
    }
  }

  const handlePdf = async () => {
    setPdfStatus('loading')
    try {
      const res = await reportApi.downloadPdf()
      downloadBlob(new Blob([res.data], { type: 'application/pdf' }), `creatoriq_report_${Date.now()}.pdf`)
      setPdfStatus('success')
    } catch { setPdfStatus('error') }
    finally { setTimeout(() => setPdfStatus('idle'), 3000) }
  }

  const handleExcel = async () => {
    setXlsxStatus('loading')
    try {
      const res = await reportApi.downloadExcel()
      downloadBlob(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `creatoriq_report_${Date.now()}.xlsx`)
      setXlsxStatus('success')
    } catch { setXlsxStatus('error') }
    finally { setTimeout(() => setXlsxStatus('idle'), 3000) }
  }

  const BtnIcon = ({ status }: { status: Status }) => {
    if (status === 'loading') return <Loader2 className="h-4 w-4 animate-spin" />
    if (status === 'success') return <CheckCircle2 className="h-4 w-4" />
    if (status === 'error') return <AlertCircle className="h-4 w-4" />
    return <Download className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500 mt-1">Generate and export comprehensive analytics reports from real data</p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_CARDS.map(card => {
          const Icon = card.icon
          return (
            <div key={card.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.color} mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{card.description}</p>
            </div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Generate & Export</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleSummary} disabled={summaryStatus === 'loading'}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition-all ${
              summaryStatus === 'success' ? 'bg-emerald-600 text-white' :
              summaryStatus === 'error' ? 'bg-red-600 text-white' :
              'bg-slate-900 text-white hover:bg-slate-800'
            } disabled:opacity-60`}>
            <BtnIcon status={summaryStatus} />
            Generate Report
          </button>

          <button onClick={handlePdf} disabled={pdfStatus === 'loading'}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition-all ${
              pdfStatus === 'success' ? 'bg-emerald-600 text-white' :
              pdfStatus === 'error' ? 'bg-red-600 text-white' :
              'bg-indigo-600 text-white hover:bg-indigo-700'
            } disabled:opacity-60`}>
            <BtnIcon status={pdfStatus} />
            Download PDF
          </button>

          <button onClick={handleExcel} disabled={xlsxStatus === 'loading'}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition-all ${
              xlsxStatus === 'success' ? 'bg-emerald-600 text-white' :
              xlsxStatus === 'error' ? 'bg-red-600 text-white' :
              'bg-emerald-600 text-white hover:bg-emerald-700'
            } disabled:opacity-60`}>
            <BtnIcon status={xlsxStatus} />
            Download Excel
          </button>
        </div>
        {errorMsg && <p className="mt-3 text-xs text-red-600">{errorMsg}</p>}
        <p className="mt-3 text-xs text-slate-400">Reports are generated from your real PostgreSQL analytics data</p>
      </div>

      {/* Summary Preview */}
      {summary && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Report Preview</h3>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-2"><BarChart3 className="h-3.5 w-3.5" /> Content Performance</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ['Total Views', summary.content?.total_views?.toLocaleString()],
                ['Total Likes', summary.content?.total_likes?.toLocaleString()],
                ['Total Comments', summary.content?.total_comments?.toLocaleString()],
                ['Total Shares', summary.content?.total_shares?.toLocaleString()],
                ['Total Reach', summary.content?.total_reach?.toLocaleString()],
                ['Avg. Engagement', `${summary.content?.average_engagement_rate?.toFixed(2)}%`],
              ].map(([l, v]) => (
                <div key={l} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{l}</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{v || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Audience</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ['Followers', summary.audience?.total_followers?.toLocaleString()],
                ['Reach', summary.audience?.total_reach?.toLocaleString()],
                ['Impressions', summary.audience?.total_impressions?.toLocaleString()],
              ].map(([l, v]) => (
                <div key={l} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{l}</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{v || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-3 flex items-center gap-2"><DollarSign className="h-3.5 w-3.5" /> Revenue</h4>
            <p className="text-2xl font-extrabold text-slate-900">
              {summary.revenue?.currency} {(summary.revenue?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            {summary.revenue?.revenue_by_source && (
              <div className="mt-3 space-y-1">
                {Object.entries(summary.revenue.revenue_by_source as Record<string, number>)
                  .filter(([, v]) => v > 0)
                  .map(([src, amt]) => (
                    <div key={src} className="flex justify-between text-xs">
                      <span className="text-slate-500">{src}</span>
                      <span className="font-bold text-slate-800">{summary.revenue.currency} {amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Platform Performance */}
          {summary.platform_performance?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Platform Performance</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                    <tr>
                      {['Platform','Views','Reach','Likes','Comments','Engagement'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.platform_performance.map((p: any) => (
                      <tr key={p.platform} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <PlatformIcon platform={p.platform} size={20} />
                            <span className="font-bold text-slate-800">{p.platform}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">{p.total_views?.toLocaleString()}</td>
                        <td className="px-4 py-2.5">{p.total_reach?.toLocaleString()}</td>
                        <td className="px-4 py-2.5">{p.total_likes?.toLocaleString()}</td>
                        <td className="px-4 py-2.5">{p.total_comments?.toLocaleString()}</td>
                        <td className="px-4 py-2.5 font-bold text-indigo-600">{p.average_engagement_rate?.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

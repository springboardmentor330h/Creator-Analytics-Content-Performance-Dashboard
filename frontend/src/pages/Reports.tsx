import { useState } from 'react'
import { analyticsApi, audienceApi, reportApi, revenueApi } from '../services/api'
import contentService from '../services/contentService'
import {
  FileText,
  Download,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import PlatformIcon from '../components/PlatformIcon'
import { KPICard, ChartCard, StatusBadge, ErrorState } from '../components/ui'
import { formatNumber, formatPercent } from '../utils/format'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ReportCardItem {
  id: string
  title: string
  description: string
  icon: typeof BarChart3
  category: string
  color: 'indigo' | 'emerald' | 'amber' | 'blue' | 'slate'
}

const REPORT_CATEGORIES: ReportCardItem[] = [
  {
    id: 'content',
    title: 'Content Performance Report',
    description: 'Detailed views, likes, comments, shares, engagement ratios, and top media rankings.',
    icon: BarChart3,
    category: 'Media',
    color: 'indigo',
  },
  {
    id: 'audience',
    title: 'Audience Demographics Report',
    description: 'Follower growth, reach distribution, gender ratios, age cohorts, and top metro cities.',
    icon: Users,
    category: 'Audience',
    color: 'emerald',
  },
  {
    id: 'growth',
    title: 'Growth & Reach Trajectory',
    description: 'Historical net follower velocity, viral velocity, and timeline milestones.',
    icon: TrendingUp,
    category: 'Growth',
    color: 'amber',
  },
  {
    id: 'revenue',
    title: 'Monetization & Revenue Report',
    description: 'Cumulative gross revenue, sponsorship contracts, AdSense payout run-rate, and pipeline.',
    icon: DollarSign,
    category: 'Financials',
    color: 'emerald',
  },
  {
    id: 'platform',
    title: 'Cross-Platform Benchmark',
    description: 'Relative reach and engagement efficiencies comparing YouTube, Instagram, TikTok, and X.',
    icon: Globe,
    category: 'Integrations',
    color: 'blue',
  },
]

type Status = 'idle' | 'loading' | 'success' | 'error'
type PreviewMode = 'summary' | 'content' | 'audience' | 'growth' | 'revenue' | 'platform'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function hasReportData(report: any) {
  if (!report) return false

  const content = report.content || {}
  const audience = report.audience || {}
  const revenue = report.revenue || {}
  const platformPerformance = Array.isArray(report.platform_performance) ? report.platform_performance : []

  return Boolean(
    Object.keys(content).length ||
      Object.keys(audience).length ||
      Object.keys(revenue).length ||
      platformPerformance.length
  )
}

function getNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default function Reports() {
  const [summaryStatus, setSummaryStatus] = useState<Status>('idle')
  const [pdfStatus, setPdfStatus] = useState<Status>('idle')
  const [xlsxStatus, setXlsxStatus] = useState<Status>('idle')
  const [summary, setSummary] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('summary')
  const [contentReport, setContentReport] = useState<any>(null)
  const [contentStatus, setContentStatus] = useState<Status>('idle')
  const [contentError, setContentError] = useState('')

  const [audienceReport, setAudienceReport] = useState<any>(null)
  const [audienceStatus, setAudienceStatus] = useState<Status>('idle')
  const [audienceError, setAudienceError] = useState('')

  const [growthReport, setGrowthReport] = useState<any>(null)
  const [growthStatus, setGrowthStatus] = useState<Status>('idle')
  const [growthError, setGrowthError] = useState('')

  const [revenueReport, setRevenueReport] = useState<any>(null)
  const [revenueStatus, setRevenueStatus] = useState<Status>('idle')
  const [revenueError, setRevenueError] = useState('')

  const [platformReport, setPlatformReport] = useState<any>(null)
  const [platformStatus, setPlatformStatus] = useState<Status>('idle')
  const [platformError, setPlatformError] = useState('')

  const handleGenerateSummary = async () => {
    setSummaryStatus('loading')
    setErrorMsg('')
    setSummary(null)

    try {
      const res = await reportApi.summary()
      const reportData = res?.data ?? null
      setSummary(reportData)
      setSummaryStatus('success')

      if (!reportData || !hasReportData(reportData)) {
        setErrorMsg('No analytics data available.')
      }
    } catch (e: any) {
      setSummary(null)
      setErrorMsg(e?.response?.data?.detail || 'Unable to generate live report. Please try again.')
      setSummaryStatus('error')
    }
  }

  const handleContentPerformancePreview = async () => {
    setPreviewMode('content')
    setContentStatus('loading')
    setContentError('')

    try {
      const [summaryResponse, topResponse, trendsResponse] = await Promise.all([
        contentService.summary(),
        contentService.topPerforming(10),
        contentService.trends(),
      ])

      setContentReport({
        summary: summaryResponse,
        top: topResponse,
        trends: trendsResponse,
      })
      setContentStatus('success')
    } catch (e: any) {
      setContentStatus('error')
      setContentError(
        e?.response?.data?.detail || 'Unable to load content performance report.'
      )
    }
  }

  const handleAudiencePreview = async () => {
    setPreviewMode('audience')
    setAudienceStatus('loading')
    setAudienceError('')

    try {
      const response = await audienceApi.analytics()
      setAudienceReport(response.data)
      setAudienceStatus('success')
    } catch (e: any) {
      setAudienceStatus('error')
      setAudienceError(e?.response?.data?.detail || 'Unable to load audience analytics report.')
    }
  }

  const handleGrowthPreview = async () => {
    setPreviewMode('growth')
    setGrowthStatus('loading')
    setGrowthError('')

    try {
      const [growthData, trendData] = await Promise.all([
        audienceApi.growth(),
        audienceApi.trends(),
      ])

      setGrowthReport({
        growth: growthData.data || [],
        trends: trendData.data || [],
      })
      setGrowthStatus('success')
    } catch (e: any) {
      setGrowthStatus('error')
      setGrowthError(e?.response?.data?.detail || 'Unable to load growth analytics report.')
    }
  }

  const handleRevenuePreview = async () => {
    setPreviewMode('revenue')
    setRevenueStatus('loading')
    setRevenueError('')

    try {
      const [summaryResponse, sourceResponse, monthlyResponse] = await Promise.all([
        analyticsApi.revenueSummary(),
        analyticsApi.revenueBySource(),
        analyticsApi.revenueMonthly(),
      ])

      setRevenueReport({
        summary: summaryResponse.data || {},
        bySource: sourceResponse.data || {},
        monthly: monthlyResponse.data || [],
      })
      setRevenueStatus('success')
    } catch (e: any) {
      setRevenueStatus('error')
      setRevenueError(e?.response?.data?.detail || 'Unable to load revenue analytics report.')
    }
  }

  const handlePlatformPreview = async () => {
    setPreviewMode('platform')
    setPlatformStatus('loading')
    setPlatformError('')

    try {
      const response = await analyticsApi.platformComparison()
      setPlatformReport(response.data || {})
      setPlatformStatus('success')
    } catch (e: any) {
      setPlatformStatus('error')
      setPlatformError(e?.response?.data?.detail || 'Unable to load platform comparison report.')
    }
  }

  const handlePdfDownload = async () => {
    setPdfStatus('loading')
    try {
      const res = await reportApi.downloadPdf()
      downloadBlob(
        new Blob([res.data], { type: 'application/pdf' }),
        `CreatorIQ_Performance_Report_${Date.now()}.pdf`
      )
      setPdfStatus('success')
    } catch {
      setPdfStatus('error')
    } finally {
      setTimeout(() => setPdfStatus('idle'), 3000)
    }
  }

  const handleExcelDownload = async () => {
    setXlsxStatus('loading')
    try {
      const res = await reportApi.downloadExcel()
      downloadBlob(
        new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        `CreatorIQ_Data_Export_${Date.now()}.xlsx`
      )
      setXlsxStatus('success')
    } catch {
      setXlsxStatus('error')
    } finally {
      setTimeout(() => setXlsxStatus('idle'), 3000)
    }
  }

  const reportContent = summary?.content || {}
  const reportAudience = summary?.audience || {}
  const reportRevenue = summary?.revenue || {}
  const platformPerformance = Array.isArray(summary?.platform_performance)
    ? summary.platform_performance
    : Array.isArray(summary?.platform_breakdown)
      ? summary.platform_breakdown
      : []

  const totalViews = getNumber(reportContent.total_views)
  const totalReach = getNumber(reportContent.total_reach)
  const averageEngagementRate = getNumber(reportContent.average_engagement_rate)
  const totalRevenue = getNumber(reportRevenue.total_revenue)

  const contentSummary = contentReport?.summary || {}
  const contentTop = Array.isArray(contentReport?.top) ? contentReport.top : []
  const contentTrends = Array.isArray(contentReport?.trends) ? contentReport.trends : []
  const audienceData = audienceReport || {}
  const growthData = growthReport || { growth: [], trends: [] }
  const revenueData = revenueReport || { summary: {}, bySource: {}, monthly: [] }
  const platformData = platformReport || {}

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Reports & Analytics Exports
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Generate executive summaries, export PDF decks, and download complete XLSX datasets.
          </p>
        </div>

        {/* Global Action Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            disabled={summaryStatus === 'loading'}
            onClick={handleGenerateSummary}
            className="ciq-btn-primary"
          >
            {summaryStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{summaryStatus === 'loading' ? 'Generating...' : 'Generate Live Report'}</span>
          </button>

          <button
            type="button"
            disabled={pdfStatus === 'loading'}
            onClick={handlePdfDownload}
            className="ciq-btn-secondary"
          >
            {pdfStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            ) : pdfStatus === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <FileText className="h-4 w-4 text-rose-600" />
            )}
            <span>{pdfStatus === 'loading' ? 'Exporting...' : 'Export PDF'}</span>
          </button>

          <button
            type="button"
            disabled={xlsxStatus === 'loading'}
            onClick={handleExcelDownload}
            className="ciq-btn-secondary"
          >
            {xlsxStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            ) : xlsxStatus === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            )}
            <span>{xlsxStatus === 'loading' ? 'Exporting...' : 'Export Excel'}</span>
          </button>
        </div>
      </div>

      {summaryStatus === 'loading' && previewMode === 'summary' && (
        <div className="ciq-card border-indigo-200 bg-indigo-50/70 p-6 text-center text-sm font-semibold text-indigo-700">
          Generating report...
        </div>
      )}

      {summaryStatus === 'error' && previewMode === 'summary' && (
        <ErrorState message={errorMsg || 'Unable to generate live report. Please try again.'} onRetry={handleGenerateSummary} />
      )}

      {summaryStatus === 'success' && previewMode === 'summary' && summary && !hasReportData(summary) && (
        <div className="ciq-card border-slate-200 bg-slate-50/80 p-6 text-center text-sm font-medium text-slate-600">
          No analytics data available.
        </div>
      )}

      {contentStatus === 'loading' && previewMode === 'content' && (
        <div className="ciq-card border-indigo-200 bg-indigo-50/70 p-6 text-center text-sm font-semibold text-indigo-700">
          Loading content performance report...
        </div>
      )}

      {contentStatus === 'error' && previewMode === 'content' && (
        <div className="ciq-card border-rose-200 bg-rose-50/50 p-6 text-center">
          <h4 className="text-sm font-bold text-rose-900">Unable to load content performance report.</h4>
          <p className="mt-2 text-xs text-rose-700">{contentError}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={handleContentPerformancePreview} className="ciq-btn-secondary py-1.5 text-xs">
              Retry
            </button>
            <button type="button" onClick={() => setPreviewMode('summary')} className="ciq-btn-secondary py-1.5 text-xs">
              Close
            </button>
          </div>
        </div>
      )}

      {audienceStatus === 'loading' && previewMode === 'audience' && (
        <div className="ciq-card border-indigo-200 bg-indigo-50/70 p-6 text-center text-sm font-semibold text-indigo-700">
          Loading audience analytics report...
        </div>
      )}

      {audienceStatus === 'error' && previewMode === 'audience' && (
        <div className="ciq-card border-rose-200 bg-rose-50/50 p-6 text-center">
          <h4 className="text-sm font-bold text-rose-900">Unable to load audience analytics report.</h4>
          <p className="mt-2 text-xs text-rose-700">{audienceError}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={handleAudiencePreview} className="ciq-btn-secondary py-1.5 text-xs">Retry</button>
            <button type="button" onClick={() => setPreviewMode('summary')} className="ciq-btn-secondary py-1.5 text-xs">Close</button>
          </div>
        </div>
      )}

      {growthStatus === 'loading' && previewMode === 'growth' && (
        <div className="ciq-card border-indigo-200 bg-indigo-50/70 p-6 text-center text-sm font-semibold text-indigo-700">
          Loading growth analytics report...
        </div>
      )}

      {growthStatus === 'error' && previewMode === 'growth' && (
        <div className="ciq-card border-rose-200 bg-rose-50/50 p-6 text-center">
          <h4 className="text-sm font-bold text-rose-900">Unable to load growth analytics report.</h4>
          <p className="mt-2 text-xs text-rose-700">{growthError}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={handleGrowthPreview} className="ciq-btn-secondary py-1.5 text-xs">Retry</button>
            <button type="button" onClick={() => setPreviewMode('summary')} className="ciq-btn-secondary py-1.5 text-xs">Close</button>
          </div>
        </div>
      )}

      {revenueStatus === 'loading' && previewMode === 'revenue' && (
        <div className="ciq-card border-indigo-200 bg-indigo-50/70 p-6 text-center text-sm font-semibold text-indigo-700">
          Loading revenue analytics report...
        </div>
      )}

      {revenueStatus === 'error' && previewMode === 'revenue' && (
        <div className="ciq-card border-rose-200 bg-rose-50/50 p-6 text-center">
          <h4 className="text-sm font-bold text-rose-900">Unable to load revenue analytics report.</h4>
          <p className="mt-2 text-xs text-rose-700">{revenueError}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={handleRevenuePreview} className="ciq-btn-secondary py-1.5 text-xs">Retry</button>
            <button type="button" onClick={() => setPreviewMode('summary')} className="ciq-btn-secondary py-1.5 text-xs">Close</button>
          </div>
        </div>
      )}

      {platformStatus === 'loading' && previewMode === 'platform' && (
        <div className="ciq-card border-indigo-200 bg-indigo-50/70 p-6 text-center text-sm font-semibold text-indigo-700">
          Loading platform comparison report...
        </div>
      )}

      {platformStatus === 'error' && previewMode === 'platform' && (
        <div className="ciq-card border-rose-200 bg-rose-50/50 p-6 text-center">
          <h4 className="text-sm font-bold text-rose-900">Unable to load platform comparison report.</h4>
          <p className="mt-2 text-xs text-rose-700">{platformError}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={handlePlatformPreview} className="ciq-btn-secondary py-1.5 text-xs">Retry</button>
            <button type="button" onClick={() => setPreviewMode('summary')} className="ciq-btn-secondary py-1.5 text-xs">Close</button>
          </div>
        </div>
      )}

      {/* Report Types Catalog Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Available Report Suites
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_CATEGORIES.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.id} className="ciq-card flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {card.category}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 group-hover:scale-105 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">{card.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">{card.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600">● Ready to generate</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (card.id === 'content') return handleContentPerformancePreview()
                      if (card.id === 'audience') return handleAudiencePreview()
                      if (card.id === 'growth') return handleGrowthPreview()
                      if (card.id === 'revenue') return handleRevenuePreview()
                      if (card.id === 'platform') return handlePlatformPreview()
                      return handleGenerateSummary()
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Preview
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {previewMode === 'audience' && audienceStatus === 'success' && audienceData && (
        <div className="ciq-card space-y-6 animate-fade-in border-indigo-200">
          <div className="ciq-card-header">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 mb-1">
                <Users className="h-3.5 w-3.5" />
                Audience Demographics Report
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Audience Analytics</h3>
              <p className="text-xs text-slate-500">Demographic breakdowns, reach distribution, and geographic density.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Followers</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber(audienceData.total_followers,0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Reach</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber(audienceData.total_reach,0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Impressions</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber(audienceData.total_impressions,0))}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Top Countries</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {(audienceData.top_countries || []).map((country: string, index: number) => (
                  <li key={`${country}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
                    <span>{country}</span>
                    <span className="font-bold text-slate-900">#{index + 1}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Top Cities</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {(audienceData.top_cities || []).map((city: string, index: number) => (
                  <li key={`${city}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
                    <span>{city}</span>
                    <span className="font-bold text-slate-900">#{index + 1}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {previewMode === 'content' && contentStatus === 'success' && contentReport && (
        <div className="ciq-card space-y-6 animate-fade-in border-indigo-200">
          <div className="ciq-card-header">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700 mb-1">
                <BarChart3 className="h-3.5 w-3.5" />
                Content Performance Report
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Content Performance</h3>
              <p className="text-xs text-slate-500">Detailed analysis of published content performance and engagement.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handlePdfDownload} className="ciq-btn-secondary py-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>PDF</span>
              </button>
              <button type="button" onClick={handleExcelDownload} className="ciq-btn-secondary py-1.5 text-xs">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>XLSX</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Content</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber(contentSummary.content_count, 0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Views</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber(contentSummary.total_views, 0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Likes</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber(contentSummary.total_likes, 0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Comments</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber(contentSummary.total_comments, 0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Shares</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber(contentSummary.total_shares, 0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Reach</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber(contentSummary.total_reach, 0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Avg Engagement</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatPercent(getNumber(contentSummary.average_engagement_rate, 0))}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Top Performing Content</h4>
            <div className="overflow-x-auto">
              <table className="ciq-table min-w-[900px]">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Content Title</th>
                    <th>Platform</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Comments</th>
                    <th>Shares</th>
                    <th>Reach</th>
                    <th>Watch Time</th>
                    <th>Engagement Rate</th>
                    <th>Published Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contentTop.map((item: any, index: number) => (
                    <tr key={`${item.title}-${item.platform}-${index}`}>
                      <td className="font-bold text-slate-900">#{index + 1}</td>
                      <td className="font-semibold text-slate-700">{item.title || item.content_title || 'Untitled'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={item.platform} className="h-3.5 w-3.5" />
                          <span>{item.platform}</span>
                        </div>
                      </td>
                      <td>{formatNumber(getNumber(item.views, 0))}</td>
                      <td>{formatNumber(getNumber(item.likes, 0))}</td>
                      <td>{formatNumber(getNumber(item.comments, 0))}</td>
                      <td>{formatNumber(getNumber(item.shares, 0))}</td>
                      <td>{formatNumber(getNumber(item.reach, 0))}</td>
                      <td>{formatNumber(getNumber(item.watch_time, 0))}</td>
                      <td className="font-bold text-emerald-600">{formatPercent(getNumber(item.engagement_rate, 0))}</td>
                      <td>{item.published_at ? new Date(item.published_at).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {contentTrends.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Content Engagement</h4>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={contentTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                      formatter={(value: number) => [`${Number(value).toFixed(2)}%`, 'Engagement Rate']}
                    />
                    <Line type="monotone" dataKey="engagement_rate" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {previewMode === 'content' && contentStatus === 'success' && (!contentReport || !contentReport.summary) && (
        <div className="ciq-card border-slate-200 bg-slate-50/80 p-6 text-center text-sm font-medium text-slate-600">
          No content performance data available.
        </div>
      )}

      {previewMode === 'growth' && growthStatus === 'success' && growthData && (
        <div className="ciq-card space-y-6 animate-fade-in border-indigo-200">
          <div className="ciq-card-header">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700 mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Growth & Reach Trajectory
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Growth Analytics</h3>
              <p className="text-xs text-slate-500">Historical follower velocity, growth percentages, and audience expansion trend.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Current Followers</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber((growthData.growth || []).at(-1)?.followers, 0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Net Growth</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatNumber(getNumber(((growthData.growth || []).at(-1)?.followers ?? 0) - ((growthData.growth || [])[0]?.followers ?? 0), 0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Growth Rate</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatPercent(getNumber((growthData.growth || []).at(-1)?.growth_percentage, 0))}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="ciq-table min-w-[700px]">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Followers</th>
                  <th>Daily Growth</th>
                  <th>Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {(growthData.growth || []).slice().reverse().map((point: any, index: number) => (
                  <tr key={`${point.date}-${index}`}>
                    <td>{point.date}</td>
                    <td>{formatNumber(getNumber(point.followers, 0))}</td>
                    <td>{formatNumber(getNumber(point.daily_growth, 0))}</td>
                    <td className="font-bold text-emerald-600">{formatPercent(getNumber(point.growth_percentage, 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {previewMode === 'revenue' && revenueStatus === 'success' && revenueData && (
        <div className="ciq-card space-y-6 animate-fade-in border-indigo-200">
          <div className="ciq-card-header">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 mb-1">
                <DollarSign className="h-3.5 w-3.5" />
                Monetization & Revenue Report
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Revenue Analytics</h3>
              <p className="text-xs text-slate-500">Total accumulated revenue, source mix, and monthly run-rate.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Revenue</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">₹{formatNumber(getNumber(revenueData.summary.total_revenue, 0))}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Currency</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{revenueData.summary.currency || 'INR'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Revenue Sources</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{Object.keys(revenueData.bySource || {}).length}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="ciq-table min-w-[600px]">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(revenueData.bySource || {}).map(([source, amount]: [string, any]) => (
                  <tr key={source}>
                    <td>{source}</td>
                    <td className="font-bold text-slate-900">₹{formatNumber(getNumber(amount, 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {previewMode === 'platform' && platformStatus === 'success' && platformData && (
        <div className="ciq-card space-y-6 animate-fade-in border-indigo-200">
          <div className="ciq-card-header">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700 mb-1">
                <Globe className="h-3.5 w-3.5" />
                Cross-Platform Benchmark
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Platform Comparison</h3>
              <p className="text-xs text-slate-500">Relative channel performance across content reach and engagement efficiency.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="ciq-table min-w-[700px]">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Views</th>
                  <th>Reach</th>
                  <th>Engagement Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(platformData).map(([platform, data]: [string, any]) => (
                  <tr key={platform}>
                    <td>
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={platform} className="h-3.5 w-3.5" />
                        <span>{platform}</span>
                      </div>
                    </td>
                    <td>{formatNumber(getNumber(data.total_views ?? data.views, 0))}</td>
                    <td>{formatNumber(getNumber(data.total_reach ?? data.reach, 0))}</td>
                    <td className="font-bold text-emerald-600">{formatPercent(getNumber(data.average_engagement_rate ?? data.engagement_rate, 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Generated Summary Section */}
      {summaryStatus === 'success' && previewMode === 'summary' && summary && hasReportData(summary) && (
        <div className="ciq-card space-y-6 animate-fade-in border-indigo-200">
          <div className="ciq-card-header">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live Generated Dataset
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Executive Summary Report</h3>
              <p className="text-xs text-slate-500">
                Generated from verified analytics data on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handlePdfDownload} className="ciq-btn-secondary py-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>PDF</span>
              </button>
              <button type="button" onClick={handleExcelDownload} className="ciq-btn-secondary py-1.5 text-xs">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>XLSX</span>
              </button>
            </div>
          </div>

          {/* KPI Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Views</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatNumber(totalViews)}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Reach</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatNumber(totalReach)}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Avg Engagement</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">
                {formatPercent(averageEngagementRate)}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Revenue</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Platform Performance Breakdown */}
          {platformPerformance.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Platform Performance Matrix
              </h4>
              <div className="ciq-table-wrapper">
                <table className="ciq-table">
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Views</th>
                      <th>Reach</th>
                      <th>Engagement Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformPerformance.map((data: any, index: number) => {
                      const platform = data.platform || data.name || `Platform ${index + 1}`
                      const views = getNumber(data.total_views ?? data.views)
                      const reach = getNumber(data.total_reach ?? data.reach)
                      const engagementRate = getNumber(data.average_engagement_rate ?? data.engagement_rate)

                      return (
                        <tr key={`${platform}-${index}`}>
                          <td>
                            <div className="flex items-center gap-2">
                              <PlatformIcon platform={platform} className="h-3.5 w-3.5" />
                              <span className="font-bold">{platform}</span>
                            </div>
                          </td>
                          <td className="font-bold text-slate-900">{formatNumber(views)}</td>
                          <td className="text-slate-600">{formatNumber(reach)}</td>
                          <td className="font-bold text-emerald-600">{formatPercent(engagementRate)}</td>
                        </tr>
                      )
                    })}
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

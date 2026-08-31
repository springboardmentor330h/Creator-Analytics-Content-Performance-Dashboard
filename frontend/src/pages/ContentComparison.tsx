import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowLeftRight, BarChart3, CheckCircle2, Layers, Sparkles, Zap } from 'lucide-react'
import PlatformIcon from '../components/PlatformIcon'
import contentService, { ContentItem } from '../services/contentService'
import { formatNumber, formatPercent } from '../utils/format'

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { detail?: string } } }).response
    if (response?.status === 403) return "You don't have permission to compare this content."
    if (response?.data?.detail) return String(response.data.detail)
  }
  return fallback
}

const PLATFORM_BADGES: Record<string, string> = {
  YouTube: 'bg-red-50 text-red-700 border-red-200',
  Instagram: 'bg-pink-50 text-pink-700 border-pink-200',
  TikTok: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Facebook: 'bg-blue-50 text-blue-700 border-blue-200',
  X: 'bg-slate-100 text-slate-800 border-slate-200',
  LinkedIn: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

export default function ContentComparison() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [compareRows, setCompareRows] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [compareError, setCompareError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await contentService.list({ page: 1, page_size: 100 })
        setContent(response.items)
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load content items for comparison.'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadComparison = async () => {
      if (selectedIds.length === 0) {
        setCompareRows([])
        setCompareError('')
        return
      }
      try {
        const response = await contentService.compare(selectedIds)
        setCompareRows(response)
        setCompareError('')
      } catch (err) {
        setCompareError(getApiErrorMessage(err, 'Unable to compare selected content.'))
      }
    }
    loadComparison()
  }, [selectedIds])

  const toggleSelection = (id: number) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= 5) return current
      return [...current, id]
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Side-by-Side Content Benchmarking
        </div>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Content Comparison Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Compare views, likes, comments, shares, saves, watch time, reach, and engagement rate across up to 5 items.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span>Loading content selection...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-medium">{error}</div>
      ) : (
        <>
          {/* Selection Box */}
          <div className="ciq-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Select Content to Compare</h3>
                <p className="mt-0.5 text-xs text-slate-500">Choose between 1 and 5 items to build a comparative chart.</p>
              </div>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                {selectedIds.length} / 5 Selected
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {content.map((item) => {
                const isSelected = selectedIds.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 text-slate-900 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={item.platform} size={20} />
                        <span className="text-xs font-semibold text-slate-600">{item.platform}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-600" />}
                    </div>
                    <p className="mt-2 font-bold text-slate-900 text-sm truncate">{item.title}</p>
                    <p className="mt-1 text-xs font-semibold text-brand-700">Engagement: {formatPercent(item.engagement_rate)}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {compareError && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-medium">{compareError}</div>}

          {compareRows.length === 0 ? (
            <div className="ciq-card text-center py-12 text-slate-400 font-medium">
              Select content cards above to view comparison metrics and visual graphs.
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {/* Bar Chart */}
              <div className="ciq-card">
                <h3 className="text-lg font-extrabold text-slate-900">Views & Reach Comparison</h3>
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={compareRows}>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                      <XAxis dataKey="title" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Legend />
                      <Bar dataKey="views" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Views" />
                      <Bar dataKey="likes" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Likes" />
                      <Bar dataKey="reach" fill="#ec4899" radius={[6, 6, 0, 0]} name="Reach" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Metric Comparison List */}
              <div className="ciq-card space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900">Detailed Metrics Breakdown</h3>
                {compareRows.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-sm truncate">{row.title}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <PlatformIcon platform={row.platform} size={18} />
                        <span className="text-[10px] font-bold text-slate-500">{row.platform}</span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-slate-400 font-semibold">Total Reach</p>
                        <p className="font-extrabold text-slate-900 text-base">{formatNumber(row.reach)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold">Watch Time</p>
                        <p className="font-extrabold text-slate-900 text-base">{formatNumber(row.watch_time)}s</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold">Engagement</p>
                        <p className="font-extrabold text-brand-600 text-base">{formatPercent(row.engagement_rate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

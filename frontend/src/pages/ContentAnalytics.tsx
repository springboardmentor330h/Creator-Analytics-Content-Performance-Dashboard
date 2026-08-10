import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ArrowUpDown,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import contentService, {
  ContentAnalyticsSummary,
  ContentItem,
  ContentPayload,
  ContentTrendPoint,
} from '../services/contentService'
import { formatNumber, formatPercent } from '../utils/format'
import { canManageContent } from '../utils/roles'

const platforms = ['YouTube', 'Instagram', 'TikTok', 'Facebook', 'X', 'LinkedIn']
const contentTypes = ['Video', 'Post', 'Reel', 'Short', 'Article', 'Live']

const PLATFORM_BADGES: Record<string, string> = {
  YouTube: 'bg-red-50 text-red-700 border-red-200',
  Instagram: 'bg-pink-50 text-pink-700 border-pink-200',
  TikTok: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Facebook: 'bg-blue-50 text-blue-700 border-blue-200',
  X: 'bg-slate-100 text-slate-800 border-slate-200',
  LinkedIn: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

const emptyForm: ContentPayload = {
  title: '',
  platform: 'YouTube',
  content_type: 'Video',
  published_at: new Date().toISOString().slice(0, 10),
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  watch_time: 0,
  reach: 0,
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { detail?: string } } }).response
    if (response?.status === 401) return 'Unauthorized. Please sign in again.'
    if (response?.status === 403) return "You don't have permission to view this content."
    if (response?.data?.detail) return String(response.data.detail)
  }
  return fallback
}

export default function ContentAnalytics() {
  const { user } = useAuth()
  const canWrite = canManageContent(user?.role)

  const [content, setContent] = useState<ContentItem[]>([])
  const [summary, setSummary] = useState<ContentAnalyticsSummary | null>(null)
  const [top, setTop] = useState<ContentItem[]>([])
  const [trends, setTrends] = useState<ContentTrendPoint[]>([])
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [contentType, setContentType] = useState('')
  const [publishedFrom, setPublishedFrom] = useState('')
  const [publishedTo, setPublishedTo] = useState('')
  const [sortBy, setSortBy] = useState('views')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [form, setForm] = useState<ContentPayload>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [listResponse, summaryResponse, topResponse, trendsResponse] = await Promise.all([
        contentService.list({
          page,
          page_size: 10,
          search: search || undefined,
          platform: platform || undefined,
          content_type: contentType || undefined,
          published_from: publishedFrom || undefined,
          published_to: publishedTo || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        }),
        contentService.summary(),
        contentService.topPerforming(),
        contentService.trends(),
      ])
      setContent(listResponse.items)
      setTotal(listResponse.total)
      setTotalPages(listResponse.total_pages)
      setSummary(summaryResponse)
      setTop(topResponse)
      setTrends(trendsResponse)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load analytics data.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [search, platform, contentType, publishedFrom, publishedTo, sortBy, sortOrder, page])

  const kpis = useMemo(
    () => [
      { label: 'Total Views', value: summary?.total_views ?? 0, icon: Eye, color: 'text-brand-600 bg-brand-50' },
      { label: 'Avg Watch Time (s)', value: summary?.total_watch_time ?? 0, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
      { label: 'Avg Engagement Rate', value: summary?.average_engagement_rate ?? 0, isPercent: true, icon: Zap, color: 'text-amber-600 bg-amber-50' },
      { label: 'Total Reach', value: summary?.total_reach ?? 0, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    ],
    [summary]
  )

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      await contentService.create(form)
      setForm(emptyForm)
      setShowCreateModal(false)
      setPage(1)
      await loadData()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Unable to create content.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this content record?')) return
    try {
      await contentService.delete(id)
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete content.'))
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Content Analytics</h2>
          <p className="mt-1 text-sm text-slate-500">Filter, search, compare, and manage performance across platforms.</p>
        </div>
        {canWrite && (
          <button onClick={() => setShowCreateModal(true)} className="ciq-btn-primary self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            <span>Add New Content</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="ciq-card flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {item.isPercent ? formatPercent(item.value) : formatNumber(item.value)}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="ciq-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-800">Filter & Sort Options</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="ciq-input mt-0 pl-9"
              placeholder="Search title..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value) }}
            />
          </div>

          {/* Platform */}
          <select className="ciq-input mt-0" value={platform} onChange={(e) => { setPage(1); setPlatform(e.target.value) }}>
            <option value="">All Platforms</option>
            {platforms.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>

          {/* Content Type */}
          <select className="ciq-input mt-0" value={contentType} onChange={(e) => { setPage(1); setContentType(e.target.value) }}>
            <option value="">All Types</option>
            {contentTypes.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>

          {/* Date From */}
          <input
            type="date"
            className="ciq-input mt-0 text-slate-600"
            value={publishedFrom}
            onChange={(e) => { setPage(1); setPublishedFrom(e.target.value) }}
          />

          {/* Date To */}
          <input
            type="date"
            className="ciq-input mt-0 text-slate-600"
            value={publishedTo}
            onChange={(e) => { setPage(1); setPublishedTo(e.target.value) }}
          />

          {/* Sort Controls */}
          <div className="grid grid-cols-2 gap-2">
            <select className="ciq-input mt-0" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="views">Views</option>
              <option value="likes">Likes</option>
              <option value="engagement_rate">Engagement</option>
              <option value="reach">Reach</option>
              <option value="published_at">Published</option>
            </select>
            <select className="ciq-input mt-0" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
              <option value="desc">Desc ↓</option>
              <option value="asc">Asc ↑</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span>Loading analytics records...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">{error}</div>
      ) : (
        <>
          <div className="ciq-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Content Performance Records</h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Showing {total} Total Records
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-3">Platform</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Views</th>
                    <th className="py-3 px-3">Likes</th>
                    <th className="py-3 px-3">Comments</th>
                    <th className="py-3 px-3">Shares</th>
                    <th className="py-3 px-3">Saves</th>
                    <th className="py-3 px-3">Watch Time</th>
                    <th className="py-3 px-3">Reach</th>
                    <th className="py-3 px-3">Engagement</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {content.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400">
                        No content records matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    content.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-900 max-w-xs truncate">
                          <Link to={`/content/${item.id}`} className="hover:text-brand-600">
                            {item.title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${PLATFORM_BADGES[item.platform] || 'bg-slate-100 text-slate-700'}`}>
                            {item.platform}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 font-medium">{item.content_type}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">{formatNumber(item.views)}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">{formatNumber(item.likes)}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">{formatNumber(item.comments)}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">{formatNumber(item.shares)}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">{formatNumber(item.saves)}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">{formatNumber(item.watch_time)}s</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">{formatNumber(item.reach)}</td>
                        <td className="py-3.5 px-3 font-extrabold text-brand-600">{formatPercent(item.engagement_rate)}</td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link to={`/content/${item.id}`} className="text-brand-600 hover:text-brand-700 font-bold text-xs">
                              View
                            </Link>
                            {canWrite && (
                              <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="ciq-btn-secondary py-2 px-3 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-semibold text-slate-600">
                Page <span className="font-extrabold text-slate-900">{page}</span> of{' '}
                <span className="font-extrabold text-slate-900">{Math.max(totalPages, 1)}</span>
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="ciq-btn-secondary py-2 px-3 text-xs disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="ciq-card xl:col-span-2">
              <h3 className="text-lg font-extrabold text-slate-900">Content Performance Over Time</h3>
              <div className="mt-6 h-72">
                {trends.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400">No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#7c3aed" strokeWidth={2.5} dot={false} name="Views" />
                      <Line type="monotone" dataKey="likes" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Likes" />
                      <Line type="monotone" dataKey="comments" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Comments" />
                      <Line type="monotone" dataKey="shares" stroke="#ec4899" strokeWidth={2.5} dot={false} name="Shares" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="ciq-card">
              <h3 className="text-lg font-extrabold text-slate-900">Top 5 Content Items</h3>
              <div className="mt-4 space-y-3">
                {top.length === 0 ? (
                  <p className="text-xs text-slate-400">No top content records available.</p>
                ) : (
                  top.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      to={`/content/${item.id}`}
                      className="block rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:border-brand-300 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>{item.platform}</span>
                        <span>{item.content_type}</span>
                      </div>
                      <p className="mt-1 font-bold text-slate-900 text-sm truncate">{item.title}</p>
                      <p className="mt-1 text-xs font-extrabold text-brand-600">
                        Engagement: {formatPercent(item.engagement_rate)}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Content Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-card-hover my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">Add New Content Analytics Record</h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="ciq-label">Content Title</label>
                  <input
                    required
                    minLength={2}
                    className="ciq-input"
                    placeholder="e.g. 10 Tech Trends for 2026"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="ciq-label">Platform</label>
                  <select className="ciq-input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                    {platforms.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="ciq-label">Content Type</label>
                  <select className="ciq-input" value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
                    {contentTypes.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="ciq-label">Publish Date</label>
                  <input
                    type="date"
                    required
                    className="ciq-input"
                    value={form.published_at}
                    onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                  />
                </div>

                {(['views', 'likes', 'comments', 'shares', 'saves', 'watch_time', 'reach'] as const).map((field) => (
                  <div key={field}>
                    <label className="ciq-label capitalize">{field.replace('_', ' ')}</label>
                    <input
                      type="number"
                      min={0}
                      className="ciq-input"
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="ciq-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="ciq-btn-primary">
                  {saving ? 'Saving Record...' : 'Save Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { FormEvent, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PlatformIcon from '../components/PlatformIcon'
import {
  ArrowUpDown,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Video,
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
import {
  KPICard,
  PlatformSelector,
  ChartCard,
  DataTable,
  StatusBadge,
  KPISkeleton,
  TableSkeleton,
  EmptyState,
  ErrorState,
  Modal,
  ConfirmDialog,
} from '../components/ui'

const platforms = ['YouTube', 'Instagram', 'TikTok', 'Facebook', 'X', 'LinkedIn']
const contentTypes = ['Video', 'Post', 'Reel', 'Short', 'Article', 'Live']

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
  const [searchParams] = useSearchParams()
  const initialPlatform = searchParams.get('platform') || ''

  const [content, setContent] = useState<ContentItem[]>([])
  const [summary, setSummary] = useState<ContentAnalyticsSummary | null>(null)
  const [top, setTop] = useState<ContentItem[]>([])
  const [trends, setTrends] = useState<ContentTrendPoint[]>([])
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState(() => {
    if (!initialPlatform) return ''
    const matched = platforms.find((p) => p.toLowerCase() === initialPlatform.toLowerCase())
    return matched || initialPlatform
  })

  useEffect(() => {
    const qPlatform = searchParams.get('platform')
    if (qPlatform) {
      const matched = platforms.find((p) => p.toLowerCase() === qPlatform.toLowerCase())
      setPlatform(matched || qPlatform)
      setPage(1)
    }
  }, [searchParams])

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
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
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
          platform: platform === 'All' ? undefined : platform || undefined,
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
  }, [page, platform, contentType, publishedFrom, publishedTo, sortBy, sortOrder])

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault()
    setPage(1)
    loadData()
  }

  const handleCreateSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setFormError('Content title is required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await contentService.create(form)
      setShowCreateModal(false)
      setForm(emptyForm)
      setPage(1)
      loadData()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to publish content item.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    try {
      await contentService.delete(deleteTargetId)
      setDeleteTargetId(null)
      loadData()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete content item.'))
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      header: 'Title',
      accessor: (item: ContentItem) => (
        <div className="flex items-center gap-2.5 min-w-[220px]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 border border-slate-200/80 shrink-0">
            <PlatformIcon platform={item.platform} className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <Link
              to={`/content/${item.id}`}
              className="font-bold text-slate-900 hover:text-indigo-600 block truncate transition-colors"
            >
              {item.title}
            </Link>
            <span className="text-[10px] text-slate-400 capitalize">{item.content_type}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Platform',
      accessor: (item: ContentItem) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <PlatformIcon platform={item.platform} className="h-3 w-3" />
          {item.platform}
        </span>
      ),
    },
    {
      header: 'Published',
      accessor: (item: ContentItem) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(item.published_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Views',
      accessor: (item: ContentItem) => (
        <span className="font-extrabold text-slate-900">{formatNumber(item.views)}</span>
      ),
    },
    {
      header: 'Reach',
      accessor: (item: ContentItem) => (
        <span className="text-slate-600">{formatNumber(item.reach)}</span>
      ),
    },
    {
      header: 'Likes',
      accessor: (item: ContentItem) => (
        <span className="text-slate-600">{formatNumber(item.likes)}</span>
      ),
    },
    {
      header: 'Engagement',
      accessor: (item: ContentItem) => (
        <span className="font-bold text-emerald-600">{formatPercent(item.engagement_rate)}</span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (item: ContentItem) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/content/${item.id}`}
            className="ciq-btn-ghost p-1.5 text-slate-500 hover:text-slate-900"
            title="Inspect content"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          {canWrite && (
            <button
              type="button"
              onClick={() => setDeleteTargetId(item.id)}
              className="ciq-btn-ghost p-1.5 text-slate-400 hover:text-rose-600"
              title="Delete content"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Content Analytics
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Performance metrics, engagement velocity, and cross-platform benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canWrite && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="ciq-btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Add Content</span>
            </button>
          )}
          <button
            type="button"
            onClick={loadData}
            title="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Total Content"
              value={summary?.content_count ?? total}
              icon={Video}
              color="indigo"
              subtitle="catalogued records"
            />
            <KPICard
              title="Total Views"
              value={formatNumber(summary?.total_views ?? 0)}
              icon={Eye}
              color="blue"
              change={14.2}
            />
            <KPICard
              title="Avg. Engagement"
              value={formatPercent(summary?.average_engagement_rate ?? 0)}
              icon={Zap}
              color="emerald"
              change={3.1}
            />
            <KPICard
              title="Total Reach"
              value={formatNumber(summary?.total_reach ?? 0)}
              icon={TrendingUp}
              color="amber"
              change={9.5}
              changeLabel="aggregate accounts"
            />
          </>
        )}
      </div>

      {/* Engagement Trend Chart */}
      <ChartCard
        title="Engagement Velocity"
        subtitle="Daily interaction trajectory across published content"
        loading={loading}
        empty={trends.length === 0}
      >
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                formatter={(val: number) => [`${val.toFixed(2)}%`, 'Engagement Rate']}
              />
              <Line type="monotone" dataKey="engagement_rate" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Filter Toolbar */}
      <div className="ciq-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Platform Selector Filter */}
          <PlatformSelector
            selected={platform || 'All'}
            onChange={(p) => {
              setPlatform(p === 'All' ? '' : p)
              setPage(1)
            }}
          />

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search content by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ciq-input mt-0 py-2 pl-9 pr-8 text-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Extended Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400">Type</label>
            <select
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value)
                setPage(1)
              }}
              className="ciq-select mt-1 py-1.5 text-xs"
            >
              <option value="">All Formats</option>
              {contentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ciq-select mt-1 py-1.5 text-xs"
            >
              <option value="views">Views</option>
              <option value="reach">Reach</option>
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
              <option value="published_at">Publish Date</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400">Published From</label>
            <input
              type="date"
              value={publishedFrom}
              onChange={(e) => {
                setPublishedFrom(e.target.value)
                setPage(1)
              }}
              className="ciq-input mt-1 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400">Published To</label>
            <input
              type="date"
              value={publishedTo}
              onChange={(e) => {
                setPublishedTo(e.target.value)
                setPage(1)
              }}
              className="ciq-input mt-1 py-1.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="ciq-card">
        <div className="ciq-card-header">
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Content Performance Library</h3>
            <p className="text-xs text-slate-500 mt-0.5">Showing {content.length} of {total} items</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={content}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No content matches your selected filters."
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4 text-xs font-bold text-slate-600">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="ciq-btn-secondary px-2.5 py-1.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="ciq-btn-secondary px-2.5 py-1.5 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Content Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Publish New Content"
        subtitle="Record metrics for cross-channel content logs"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="ciq-label">Content Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Q3 Growth Playbook & Creator Strategy"
              className="ciq-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ciq-label">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="ciq-select text-xs"
              >
                {platforms.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="ciq-label">Format</label>
              <select
                value={form.content_type}
                onChange={(e) => setForm({ ...form, content_type: e.target.value })}
                className="ciq-select text-xs"
              >
                {contentTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="ciq-label">Views</label>
              <input
                type="number"
                min="0"
                value={form.views}
                onChange={(e) => setForm({ ...form, views: Number(e.target.value) })}
                className="ciq-input text-xs"
              />
            </div>
            <div>
              <label className="ciq-label">Likes</label>
              <input
                type="number"
                min="0"
                value={form.likes}
                onChange={(e) => setForm({ ...form, likes: Number(e.target.value) })}
                className="ciq-input text-xs"
              />
            </div>
            <div>
              <label className="ciq-label">Comments</label>
              <input
                type="number"
                min="0"
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: Number(e.target.value) })}
                className="ciq-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ciq-label">Reach</label>
              <input
                type="number"
                min="0"
                value={form.reach}
                onChange={(e) => setForm({ ...form, reach: Number(e.target.value) })}
                className="ciq-input text-xs"
              />
            </div>
            <div>
              <label className="ciq-label">Publish Date</label>
              <input
                type="date"
                required
                value={form.published_at}
                onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                className="ciq-input text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="ciq-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ciq-btn-primary"
            >
              {saving ? 'Publishing...' : 'Save Content'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Content Record"
        message="Are you sure you want to delete this content item? This action removes metrics from aggregate reports."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  )
}

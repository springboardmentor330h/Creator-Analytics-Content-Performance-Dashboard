import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  Calendar,
  Eye,
  MessageSquare,
  Pencil,
  Share2,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import contentService, { ContentItem, ContentPayload } from '../services/contentService'
import { formatNumber, formatPercent } from '../utils/format'
import { canManageContent } from '../utils/roles'

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { detail?: string } } }).response
    if (response?.status === 403) return "You don't have permission to view this content."
    if (response?.status === 404) return 'Content not found.'
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

export default function ContentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = canManageContent(user?.role)

  const [content, setContent] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<ContentPayload>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!id) {
        navigate('/content-analytics')
        return
      }
      setLoading(true)
      setError('')
      try {
        const response = await contentService.get(Number(id))
        setContent(response)
        setForm({
          title: response.title,
          platform: response.platform,
          content_type: response.content_type,
          published_at: response.published_at,
          views: response.views,
          likes: response.likes,
          comments: response.comments,
          shares: response.shares,
          saves: response.saves,
          watch_time: response.watch_time,
          reach: response.reach,
        })
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load content details.'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!content) return
    setSaving(true)
    try {
      const updated = await contentService.update(content.id, form)
      setContent(updated)
      setEditing(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update content.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!content) return
    if (!window.confirm('Delete this content record?')) return
    try {
      await contentService.delete(content.id)
      navigate('/content-analytics')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete content.'))
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <span>Loading content item...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-medium">{error}</div>
    )
  }

  if (!content) return <div className="ciq-card text-slate-500">Content not found.</div>

  const metrics = [
    { label: 'Total Views', value: formatNumber(content.views), icon: Eye, color: 'text-brand-600 bg-brand-50' },
    { label: 'Likes', value: formatNumber(content.likes), icon: ThumbsUp, color: 'text-blue-600 bg-blue-50' },
    { label: 'Comments', value: formatNumber(content.comments), icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
    { label: 'Shares', value: formatNumber(content.shares), icon: Share2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Saves', value: formatNumber(content.saves), icon: Bookmark, color: 'text-purple-600 bg-purple-50' },
    { label: 'Watch Time', value: `${formatNumber(content.watch_time)}s`, icon: BarChart3, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Total Reach', value: formatNumber(content.reach), icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Engagement Rate', value: formatPercent(content.engagement_rate), icon: Zap, color: 'text-pink-600 bg-pink-50' },
  ]

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to="/content-analytics" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Content Analytics</span>
      </Link>

      {/* Header Banner */}
      <div className="ciq-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${PLATFORM_BADGES[content.platform] || 'bg-slate-100 text-slate-700'}`}>
                {content.platform}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {content.content_type}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{content.title}</h2>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Published on {new Date(content.published_at).toLocaleDateString()}</span>
            </div>
          </div>

          {canWrite && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing(!editing)}
                className="ciq-btn-secondary py-2.5 px-4 text-xs"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>{editing ? 'Cancel Edit' : 'Edit Details'}</span>
              </button>
              <button
                onClick={remove}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Record</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form or View Grid */}
      {editing ? (
        <form onSubmit={save} className="ciq-card space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900">Edit Content Metrics</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <label className="ciq-label">Title</label>
              <input className="ciq-input" value={String(form.title ?? '')} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="ciq-label">Platform</label>
              <input className="ciq-input" value={String(form.platform ?? '')} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
            </div>
            <div>
              <label className="ciq-label">Content Type</label>
              <input className="ciq-input" value={String(form.content_type ?? '')} onChange={(e) => setForm({ ...form, content_type: e.target.value })} />
            </div>
            <div>
              <label className="ciq-label">Publish Date</label>
              <input type="date" className="ciq-input" value={String(form.published_at ?? '').slice(0, 10)} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
            </div>
            {(['views', 'likes', 'comments', 'shares', 'saves', 'watch_time', 'reach'] as const).map((field) => (
              <div key={field}>
                <label className="ciq-label capitalize">{field.replace('_', ' ')}</label>
                <input
                  type="number"
                  min={0}
                  className="ciq-input"
                  value={Number(form[field] ?? 0)}
                  onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setEditing(false)} className="ciq-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="ciq-btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="ciq-card flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{item.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

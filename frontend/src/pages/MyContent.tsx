import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import contentService, { ContentItem, ContentPayload } from '../services/contentService'
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

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { detail?: string } } }).response
    if (response?.status === 403) return "You don't have permission to manage this content."
    if (response?.data?.detail) return String(response.data.detail)
  }
  return fallback
}

export default function MyContent() {
  const { user } = useAuth()
  const canWrite = canManageContent(user?.role)
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<ContentPayload>>({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await contentService.list({ page: 1, page_size: 100, sort_by: 'published_at', sort_order: 'desc' })
      setItems(response.items)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load content.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const startEdit = (item: ContentItem) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      platform: item.platform,
      content_type: item.content_type,
      published_at: item.published_at,
      views: item.views,
      likes: item.likes,
      comments: item.comments,
      shares: item.shares,
      saves: item.saves,
      watch_time: item.watch_time,
      reach: item.reach,
    })
    setMessage('')
  }

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingId) return
    setSaving(true)
    try {
      await contentService.update(editingId, form)
      setEditingId(null)
      setMessage('Content record updated successfully.')
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update content.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this content record?')) return
    try {
      await contentService.delete(id)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete content.'))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            <FileText className="h-3.5 w-3.5" />
            Content Library
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">My Content</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your published content and edit performance data.</p>
        </div>
        <Link to="/content-analytics" className="ciq-btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Analytics Overview</span>
        </Link>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span>Loading content library...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-medium">{error}</div>
      ) : items.length === 0 ? (
        <div className="ciq-card text-center py-12 text-slate-400 font-medium">No content records in your library.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="ciq-card">
              {editingId === item.id ? (
                <form onSubmit={saveEdit} className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Edit Content</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="md:col-span-3">
                      <label className="ciq-label">Title</label>
                      <input className="ciq-input mt-0" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="ciq-label">Platform</label>
                      <select className="ciq-input mt-0" value={form.platform || 'YouTube'} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                        {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="ciq-label">Type</label>
                      <select className="ciq-input mt-0" value={form.content_type || 'Video'} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
                        {contentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {(['views', 'likes', 'comments', 'shares', 'saves', 'watch_time', 'reach'] as const).map((field) => (
                      <div key={field}>
                        <label className="ciq-label capitalize">{field.replace('_', ' ')}</label>
                        <input type="number" min={0} className="ciq-input mt-0" value={Number(form[field] ?? 0)} onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button type="button" onClick={() => setEditingId(null)} className="ciq-btn-secondary">Cancel</button>
                    <button type="submit" disabled={saving} className="ciq-btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${PLATFORM_BADGES[item.platform] || 'bg-slate-100 text-slate-700'}`}>
                        {item.platform}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{item.content_type}</span>
                    </div>
                    <h3 className="mt-2 text-xl font-extrabold text-slate-900">{item.title}</h3>
                    <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-slate-400" />{formatNumber(item.views)} views</span>
                      <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-brand-600" />{formatPercent(item.engagement_rate)} engagement</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link to={`/content/${item.id}`} className="ciq-btn-secondary py-2 px-3 text-xs">
                      View Details
                    </Link>
                    {canWrite && (
                      <>
                        <button onClick={() => startEdit(item)} className="ciq-btn-secondary py-2 px-3 text-xs">
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => remove(item.id)} className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

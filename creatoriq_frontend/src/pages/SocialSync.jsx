import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { socialAPI, contentAPI } from '../services/api'
import ErrorBox from '../components/ui/ErrorBox'
import Loading from '../components/ui/Loading'

const MOCK = ['Facebook', 'LinkedIn', 'TikTok', 'Twitter']

const inputClass =
  'mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500'

function normalizePlatformList(data) {
  if (!data) return []
  if (Array.isArray(data.accounts)) {
    return data.accounts.map((a) => ({
      platform: a.platform || a.name || '—',
      account_name: a.account_name || a.account || '—',
    }))
  }
  if (Array.isArray(data.platforms)) {
    return data.platforms.map((p) =>
      typeof p === 'string'
        ? { platform: p, account_name: '—' }
        : {
            platform: p.platform || p.name || '—',
            account_name: p.account_name || p.account || '—',
          }
    )
  }
  return []
}

export default function SocialSync() {
  const { user } = useAuth()
  const creatorId = user?.id
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState('')

  const [channelId, setChannelId] = useState('')
  const [ytLimit, setYtLimit] = useState(10)
  const [igUsername, setIgUsername] = useState('')
  const [igLimit, setIgLimit] = useState(12)
  const [mockCount, setMockCount] = useState(3)

  const loadPlatforms = () => {
    socialAPI
      .platforms()
      .then((res) => setPlatforms(normalizePlatformList(res.data)))
      .catch(() => setPlatforms([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPlatforms()
  }, [])

  const onYoutubeSync = async (e) => {
    e.preventDefault()
    if (!creatorId) return setError('User id missing — log in again')
    setError('')
    setMsg('')
    setBusy('YouTube')
    try {
      const res = await socialAPI.youtubeSync(creatorId, channelId.trim(), ytLimit)
      const d = res.data || {}
      setMsg(
        `YouTube: ${d.records_created ?? d.created ?? 0} created, ${d.records_updated ?? d.updated ?? 0} updated`
      )
      loadPlatforms()
    } catch (err) {
      setError(err.response?.data?.detail || 'YouTube sync failed')
    } finally {
      setBusy('')
    }
  }

  const onInstagramSync = async (e) => {
    e.preventDefault()
    if (!creatorId) return setError('User id missing — log in again')
    setError('')
    setMsg('')
    setBusy('Instagram')
    try {
      const res = await socialAPI.instagramSync(
        creatorId,
        igUsername.trim().replace(/^@/, ''),
        igLimit
      )
      const d = res.data || {}
      setMsg(
        `Instagram: ${d.created ?? d.records_created ?? 0} created, ${d.updated ?? d.records_updated ?? 0} updated`
      )
      loadPlatforms()
    } catch (err) {
      setError(err.response?.data?.detail || 'Instagram sync failed')
    } finally {
      setBusy('')
    }
  }

  const onMockSync = async (platform) => {
    if (!creatorId) return setError('User id missing — log in again')
    setError('')
    setMsg('')
    setBusy(platform)
    try {
      const res = await socialAPI.mockSync(creatorId, platform, mockCount)
      const d = res.data || {}
      setMsg(
        d.message ||
          `${platform} mock: ${d.records_created ?? 0} created, ${d.records_updated ?? 0} updated`
      )
      loadPlatforms()
    } catch (err) {
      setError(err.response?.data?.detail || `${platform} mock sync failed`)
    } finally {
      setBusy('')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Social Sync</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sync each platform into CreatorIQ
          {creatorId ? ` (creator id: ${creatorId})` : ''}.
          YouTube &amp; Instagram use live APIs; other platforms use mentor-ready mock data.
        </p>
      </div>

      {error && <ErrorBox message={String(error)} />}
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900">
          {msg}
        </div>
      )}

      {/* Connected list */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-800 mb-3 dark:text-slate-200">
          Connected / synced platforms
        </h2>
        {platforms.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            None yet — use the platform cards below.
          </p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-2">
            {platforms.map((p, i) => (
              <li
                key={`${p.platform}-${i}`}
                className="flex justify-between text-sm border border-slate-100 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">{p.platform}</span>
                <span className="text-slate-500 dark:text-slate-400">{p.account_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* YouTube */}
      <form
        onSubmit={onYoutubeSync}
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">YouTube</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium dark:text-red-400 dark:bg-red-950/40">
            Live API
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Channel ID</label>
            <input
              required
              className={inputClass}
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="UCxxxxxxxx"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Max videos</label>
            <input
              type="number"
              min={1}
              max={50}
              className={inputClass}
              value={ytLimit}
              onChange={(e) => setYtLimit(Number(e.target.value))}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy === 'YouTube'}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm disabled:opacity-50"
        >
          {busy === 'YouTube' ? 'Syncing...' : 'Sync YouTube'}
        </button>
      </form>

      {/* Instagram */}
      <form
        onSubmit={onInstagramSync}
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Instagram</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-medium dark:text-pink-400 dark:bg-pink-950/40">
            Live API
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Username</label>
            <input
              required
              className={inputClass}
              value={igUsername}
              onChange={(e) => setIgUsername(e.target.value)}
              placeholder="madhu_0006"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Media limit</label>
            <input
              type="number"
              min={1}
              max={25}
              className={inputClass}
              value={igLimit}
              onChange={(e) => setIgLimit(Number(e.target.value))}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy === 'Instagram'}
          className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm disabled:opacity-50"
        >
          {busy === 'Instagram' ? 'Syncing...' : 'Sync Instagram'}
        </button>
      </form>

      {/* Mock platforms */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Other platforms (mock / manual)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No live API yet — inserts sample content under your creator id for dashboard analytics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Posts per sync</label>
            <input
              type="number"
              min={1}
              max={10}
              className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              value={mockCount}
              onChange={(e) => setMockCount(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {MOCK.map((platform) => (
            <div
              key={platform}
              className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{platform}</p>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium dark:text-amber-400 dark:bg-amber-950/40">
                  Mock data
                </span>
              </div>
              <p className="text-xs text-slate-500 flex-1 dark:text-slate-400">
                Generate sample {platform} posts with views, likes, comments, shares, and reach.
              </p>
              <button
                type="button"
                disabled={busy === platform}
                onClick={() => onMockSync(platform)}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {busy === platform ? 'Syncing...' : `Sync ${platform}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
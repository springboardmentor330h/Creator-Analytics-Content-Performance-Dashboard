import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CheckCircle2, RefreshCw, AlertCircle, ExternalLink, BarChart2, 
  Key, Settings2, X, PlusCircle, Globe, Info, RotateCcw, Edit3
} from 'lucide-react'
import { socialService, SocialConnectionStatus } from '../services/socialService'
import { useAuth } from '../context/AuthContext'

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const PLATFORMS = [
  { 
    key: 'youtube', 
    name: 'YouTube', 
    iconColor: 'text-red-600', 
    Icon: YoutubeIcon,
    isManual: false,
    isImplemented: true,
    desc: 'Connect your YouTube channel using your API Key or OAuth to sync live videos and real-time metrics.' 
  },
  { 
    key: 'instagram', 
    name: 'Instagram', 
    iconColor: 'text-pink-600', 
    Icon: InstagramIcon,
    isManual: true,
    isImplemented: true,
    desc: 'Track Instagram Reels, posts, and engagement via automated platform ingestion.' 
  },
  { 
    key: 'tiktok', 
    name: 'TikTok', 
    iconColor: 'text-cyan-600', 
    Icon: TikTokIcon,
    isManual: true,
    isImplemented: true,
    desc: 'Short-form viral video performance, sound analytics, and trends.' 
  },
  { 
    key: 'facebook', 
    name: 'Facebook', 
    iconColor: 'text-blue-600', 
    Icon: FacebookIcon,
    isManual: true,
    isImplemented: true,
    desc: 'Monitor Facebook page reach, video views, and audience interactions.' 
  },
  { 
    key: 'twitter', 
    name: 'X (Twitter)', 
    iconColor: 'text-slate-800', 
    Icon: TwitterIcon,
    isManual: true,
    isImplemented: true,
    desc: 'Micro-blogging reach, retweets, and conversational metrics.' 
  },
  { 
    key: 'linkedin', 
    name: 'LinkedIn', 
    iconColor: 'text-blue-700', 
    Icon: LinkedinIcon,
    isManual: true,
    isImplemented: true,
    desc: 'Track professional articles, reaction rates, and corporate reach metrics.' 
  },
]

export default function SocialIntegrationManager() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [connections, setConnections] = useState<SocialConnectionStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  // YouTube Connection Modal State
  const [showYtModal, setShowYtModal] = useState(false)
  const [ytChannelId, setYtChannelId] = useState('')
  const [ytQuery, setYtQuery] = useState('')
  const [ytApiKey, setYtApiKey] = useState('')
  const [ytAccountName, setYtAccountName] = useState('')
  const [ytMaxResults, setYtMaxResults] = useState(10)
  const [ytConnecting, setYtConnecting] = useState(false)

  // Generic Platform Connect Modal State (Instagram / Facebook / LinkedIn / etc.)
  const [genericModalPlatform, setGenericModalPlatform] = useState<string | null>(null)
  const [genericAccountName, setGenericAccountName] = useState('')
  const [genericConnecting, setGenericConnecting] = useState(false)

  // Edit Account Modal State
  const [editModalPlatform, setEditModalPlatform] = useState<string | null>(null)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editProfileUrl, setEditProfileUrl] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // Info Modal State
  const [infoModalPlatform, setInfoModalPlatform] = useState<string | null>(null)

  useEffect(() => {
    fetchConnections()
    
    // Check URL for OAuth callback messages
    const params = new URLSearchParams(window.location.search)
    if (params.get('error')) {
      setError(`Connection message: ${params.get('error')}`)
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('connected')) {
      setSuccessMsg(`Successfully connected to ${params.get('connected')}!`)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchConnections = async () => {
    try {
      setLoading(true)
      const data = await socialService.getStatus()
      setConnections(data)
    } catch {
      setError('Unable to load social media connections.')
    } finally {
      setLoading(false)
    }
  }

  const getConnection = (platformKey: string) => {
    return connections.find(c => c.platform?.toLowerCase() === platformKey.toLowerCase())
  }

  const handleOpenConnectModal = (platformKey: string) => {
    setError(null)
    setSuccessMsg(null)
    if (platformKey === 'youtube') {
      const existing = getConnection('youtube')
      setYtAccountName(existing?.display_name || `${user?.full_name || 'Creator'} Channel`)
      setShowYtModal(true)
    } else {
      const existing = getConnection(platformKey)
      setGenericAccountName(existing?.display_name || `${user?.full_name || 'Creator'} on ${platformKey.charAt(0).toUpperCase() + platformKey.slice(1)}`)
      setGenericModalPlatform(platformKey)
    }
  }

  const handleOpenEditModal = (platformKey: string) => {
    const conn = getConnection(platformKey)
    setEditModalPlatform(platformKey)
    setEditDisplayName(conn?.display_name || '')
    setEditUsername(conn?.platform_username || '')
    setEditProfileUrl(conn?.profile_url || '')
  }

  const handleSaveEditAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModalPlatform) return
    setEditSaving(true)
    setError(null)

    try {
      await socialService.updateAccount(editModalPlatform, {
        display_name: editDisplayName.trim() || undefined,
        platform_username: editUsername.trim() || undefined,
        profile_url: editProfileUrl.trim() || undefined,
      })
      setEditModalPlatform(null)
      setSuccessMsg(`Account details for ${editModalPlatform} updated successfully!`)
      await fetchConnections()
    } catch (err: any) {
      setError(err?.response?.data?.detail || `Failed to update account for ${editModalPlatform}.`)
    } finally {
      setEditSaving(false)
    }
  }

  const handleConnectYoutubeWithApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setYtConnecting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await socialService.syncYoutube({
        channel_id: ytChannelId.trim() || undefined,
        query: ytQuery.trim() || undefined,
        api_key: ytApiKey.trim() || undefined,
        account_name: ytAccountName.trim() || undefined,
        max_results: Number(ytMaxResults) || 10,
      })

      setShowYtModal(false)
      setSuccessMsg(`Connected to YouTube! Synchronized ${res.records_synced || 0} videos into database.`)
      await fetchConnections()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to connect YouTube with the provided API key or Channel ID.')
    } finally {
      setYtConnecting(false)
    }
  }

  const handleConnectOAuth = async (platformKey: string) => {
    try {
      setError(null)
      const url = await socialService.getConnectUrl(platformKey)
      if (url) {
        window.location.href = url
      } else {
        setError(`OAuth client credentials for ${platformKey} not configured in .env. Use direct connection modal instead.`)
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || `Failed to initiate OAuth for ${platformKey}.`)
    }
  }

  const handleConnectGeneric = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!genericModalPlatform) return
    setGenericConnecting(true)
    setError(null)

    try {
      await socialService.connectPlatformAccount(genericModalPlatform, genericAccountName)
      setGenericModalPlatform(null)
      setSuccessMsg(`Connected ${genericModalPlatform} account successfully!`)
      await fetchConnections()
    } catch (err: any) {
      setError(err?.response?.data?.detail || `Failed to connect ${genericModalPlatform}.`)
    } finally {
      setGenericConnecting(false)
    }
  }

  const handleDisconnect = async (platformKey: string) => {
    try {
      if (!confirm(`Are you sure you want to disconnect ${platformKey}?`)) return
      setError(null)
      await socialService.disconnect(platformKey)
      await fetchConnections()
      setSuccessMsg(`Disconnected ${platformKey} successfully.`)
    } catch (err: any) {
      setError(err?.response?.data?.detail || `Failed to disconnect ${platformKey}.`)
    }
  }

  const handleSync = async (platformKey: string) => {
    try {
      setError(null)
      setSuccessMsg(null)
      setSyncing(platformKey)
      if (platformKey === 'youtube') {
        const res = await socialService.syncYoutube({ max_results: 10 })
        setSuccessMsg(`YouTube synchronized: ${res.records_synced || 0} videos updated.`)
      } else {
        await socialService.sync(platformKey)
        setSuccessMsg(`${platformKey.toUpperCase()} data refreshed successfully.`)
      }
      await fetchConnections()
    } catch (err: any) {
      setError(err?.response?.data?.detail || `Platform data is already up to date for ${platformKey}.`)
    } finally {
      setSyncing(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="ciq-card p-6 h-[280px] animate-pulse bg-slate-50 border border-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Platform Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const conn = getConnection(platform.key)
          const isYt = platform.key === 'youtube'
          // Backend is the single source of truth for connection status
          const isConnected = conn?.status === 'connected'
          const isComingSoon = !platform.isImplemented
          const Icon = platform.Icon

          let statusBadgeText = 'Not connected'
          let statusBadgeColor = 'text-slate-500 bg-slate-100 border-slate-200'

          if (isComingSoon && !isConnected) {
            statusBadgeText = 'Coming Soon'
            statusBadgeColor = 'text-amber-600 bg-amber-50 border-amber-200'
          } else if (isConnected) {
            statusBadgeText = isYt ? 'Connected (Live API)' : 'Connected'
            statusBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }

          return (
            <div key={platform.key} className="ciq-card flex flex-col border border-slate-200 rounded-2xl p-6 bg-white shadow-sm h-full hover:border-slate-300 transition-all">
              {/* Header: Icon & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 ${platform.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusBadgeColor}`}>
                    {statusBadgeText}
                  </span>
                  {isConnected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
              </div>

              {/* Title & Body */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-slate-900">{platform.name}</h3>
                  {isYt && (
                    <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      API Key Ready
                    </span>
                  )}
                </div>
                
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {platform.desc}
                </p>

                {isConnected ? (
                  /* Connected account information */
                  <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {conn?.display_name || (isYt ? 'YouTube Live Channel' : `${user?.full_name || 'Creator'} Channel`)}
                      </p>
                      {isYt && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <Globe className="h-2.5 w-2.5" /> Live API
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 truncate">
                      {conn?.platform_username || (isYt ? 'YouTube Data API v3 Active' : 'Ingestion Active')}
                    </p>
                    {conn?.last_synced_at ? (
                      <p className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60 mt-1">
                        Last sync: {new Date(conn.last_synced_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60 mt-1">
                        Last sync: Never
                      </p>
                    )}
                  </div>
                ) : (
                  !isComingSoon && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-600 font-medium flex items-start gap-2">
                      <Key className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
                      <span>Ready to link. Click Connect below to link and synchronize performance metrics.</span>
                    </div>
                  )
                )}
              </div>

              {/* Actions Section */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
                {isComingSoon && !isConnected ? (
                  /* Unimplemented Coming Soon Roadmap Link */
                  <button 
                    onClick={() => navigate(`/platform/${platform.key}`)}
                    className="w-full ciq-btn-secondary py-2.5 text-xs flex items-center justify-center gap-1.5 font-bold"
                  >
                    <span>View Roadmap</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                ) : !isConnected ? (
                  /* DISCONNECTED STATE: ONLY ONE ACTION VISIBLE: CONNECT */
                  <button
                    onClick={() => handleOpenConnectModal(platform.key)}
                    className="w-full ciq-btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5 font-bold shadow-xs hover:shadow-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Connect</span>
                  </button>
                ) : (
                  /* CONNECTED STATE: ALL 6 ACTIONS VISIBLE */
                  <>
                    {/* Row 1: View Analytics & Sync / Refresh */}
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => navigate(`/analytics?platform=${encodeURIComponent(platform.name)}`)}
                        className="ciq-btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 font-bold"
                        title="View platform analytics"
                      >
                        <BarChart2 className="h-3.5 w-3.5 text-indigo-600" />
                        <span>View Analytics</span>
                      </button>
                      <button 
                        onClick={() => handleSync(platform.key)}
                        disabled={syncing === platform.key}
                        className="ciq-btn-primary py-2 px-3 text-xs flex items-center justify-center gap-1.5 font-bold"
                        title="Synchronize platform data"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${syncing === platform.key ? 'animate-spin' : ''}`} />
                        <span>{syncing === platform.key ? 'Syncing...' : 'Sync'}</span>
                      </button>
                    </div>

                    {/* Row 2: Reconnect & Info */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenConnectModal(platform.key)}
                        className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <RotateCcw className="h-3 w-3 text-slate-500" />
                        <span>Reconnect</span>
                      </button>
                      <button
                        onClick={() => setInfoModalPlatform(platform.key)}
                        className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Info className="h-3 w-3 text-slate-500" />
                        <span>Info</span>
                      </button>
                    </div>

                    {/* Row 3: Edit Account & Disconnect */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => handleOpenEditModal(platform.key)}
                        className="font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit Account</span>
                      </button>

                      <button 
                        onClick={() => handleDisconnect(platform.key)}
                        className="font-bold text-slate-400 hover:text-red-600 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Modal */}
      {infoModalPlatform && (() => {
        const plat = PLATFORMS.find(p => p.key === infoModalPlatform)
        const conn = getConnection(infoModalPlatform)
        const Icon = plat?.Icon || Globe
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="ciq-card w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-slate-50 border border-slate-100 ${plat?.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{plat?.name} Connection Info</h3>
                    <p className="text-xs text-slate-500">Platform status and metadata</p>
                  </div>
                </div>
                <button
                  onClick={() => setInfoModalPlatform(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Status</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Connected
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Display Name</span>
                  <span className="font-bold text-slate-900">{conn?.display_name || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Username / Handle</span>
                  <span className="font-bold text-slate-900">{conn?.platform_username || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Profile URL</span>
                  <span className="font-bold text-slate-900 truncate max-w-[200px]">{conn?.profile_url || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Last Synced</span>
                  <span className="font-bold text-slate-900">
                    {conn?.last_synced_at ? new Date(conn.last_synced_at).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInfoModalPlatform(null)}
                  className="ciq-btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Edit Account Modal */}
      {editModalPlatform && (() => {
        const plat = PLATFORMS.find(p => p.key === editModalPlatform)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="ciq-card w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit {plat?.name} Account</h3>
                  <p className="text-xs text-slate-500">Update display name and account details</p>
                </div>
                <button
                  onClick={() => setEditModalPlatform(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditAccount} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    placeholder="e.g. CreatorIQ Studio"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="e.g. @creatoriq"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Profile URL
                  </label>
                  <input
                    type="text"
                    value={editProfileUrl}
                    onChange={(e) => setEditProfileUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditModalPlatform(null)}
                    className="flex-1 ciq-btn-secondary py-2.5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="flex-1 ciq-btn-primary py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5"
                  >
                    {editSaving ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    <span>{editSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      })()}

      {/* YouTube Connection Modal */}
      {showYtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="ciq-card w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <YoutubeIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Connect YouTube Channel</h3>
                  <p className="text-xs text-slate-500">Live synchronization with YouTube Data API v3</p>
                </div>
              </div>
              <button
                onClick={() => setShowYtModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConnectYoutubeWithApiKey} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube Channel Handle, Channel ID, or Query
                </label>
                <input
                  type="text"
                  value={ytChannelId}
                  onChange={(e) => setYtChannelId(e.target.value)}
                  placeholder="e.g. @YourChannel, UC_x5XG1OV2P6uZZ5FSM9Ttw, or React Tutorial"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank to synchronize trending / popular videos, or specify your handle / channel ID.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Channel Display Name
                </label>
                <input
                  type="text"
                  value={ytAccountName}
                  onChange={(e) => setYtAccountName(e.target.value)}
                  placeholder="e.g. Suresh Tech Channel"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube API Key (Optional Override)
                </label>
                <input
                  type="text"
                  value={ytApiKey}
                  onChange={(e) => setYtApiKey(e.target.value)}
                  placeholder="Leave empty to use active key configured in .env"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Active API key already configured in backend (.env)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Search Keyword (Optional)</label>
                  <input
                    type="text"
                    value={ytQuery}
                    onChange={(e) => setYtQuery(e.target.value)}
                    placeholder="e.g. tutorials, coding"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Videos to Fetch</label>
                  <select
                    value={ytMaxResults}
                    onChange={(e) => setYtMaxResults(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none bg-white"
                  >
                    <option value={5}>5 videos</option>
                    <option value={10}>10 videos</option>
                    <option value={25}>25 videos</option>
                    <option value={50}>50 videos</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={ytConnecting}
                  className="flex-1 ciq-btn-primary py-2.5 text-xs font-extrabold flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${ytConnecting ? 'animate-spin' : ''}`} />
                  <span>{ytConnecting ? 'Connecting & Fetching...' : 'Connect & Sync Real YouTube Data'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleConnectOAuth('youtube')}
                  className="ciq-btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                  <span>Use Google OAuth</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generic Modal (Instagram, TikTok, Facebook, X, LinkedIn) */}
      {genericModalPlatform && (() => {
        const plat = PLATFORMS.find(p => p.key === genericModalPlatform)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="ciq-card w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">
                  Connect {plat?.name || genericModalPlatform} Account
                </h3>
                <button
                  onClick={() => setGenericModalPlatform(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleConnectGeneric} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account / Page / Profile Name
                  </label>
                  <input
                    type="text"
                    required
                    value={genericAccountName}
                    onChange={(e) => setGenericAccountName(e.target.value)}
                    placeholder="e.g. CreatorIQ Official"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Connects your creator account to the CreatorIQ multi-platform ingestion engine.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGenericModalPlatform(null)}
                    className="flex-1 ciq-btn-secondary py-2.5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={genericConnecting}
                    className="flex-1 ciq-btn-primary py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{genericConnecting ? 'Connecting...' : 'Save & Connect'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      })()}

      {/* Informational Architecture Banner */}
      <div className="ciq-card border border-indigo-100 bg-indigo-50/50 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-indigo-950">Live Social Media Integration & Ingestion Architecture</h4>
          <p className="mt-1 text-xs text-indigo-800 leading-relaxed">
            Live API integration is used where credentials/access are available (YouTube Data API v3). Creators can connect real YouTube channels using their API keys or OAuth to pull real video statistics directly into the database. For platforms where live third-party API keys are not configured, realistic platform data is synchronized and calculated using the standardized CreatorIQ data format.
          </p>
        </div>
      </div>
    </div>
  )
}

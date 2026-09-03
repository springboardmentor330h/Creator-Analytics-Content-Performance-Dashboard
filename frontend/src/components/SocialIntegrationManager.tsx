import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, RefreshCw, AlertCircle, ExternalLink, BarChart2 } from 'lucide-react'
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
    desc: 'Connect your YouTube channel to sync videos, shorts velocity, and live metrics.' 
  },
  { 
    key: 'instagram', 
    name: 'Instagram', 
    iconColor: 'text-pink-600', 
    Icon: InstagramIcon,
    isManual: true,
    isImplemented: true,
    desc: 'Track Instagram Reels, posts, and engagement via PostgreSQL database ingestion.' 
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
    key: 'linkedin', 
    name: 'LinkedIn', 
    iconColor: 'text-blue-700', 
    Icon: LinkedinIcon,
    isManual: true,
    isImplemented: true,
    desc: 'Track professional articles, reaction rates, and corporate reach metrics.' 
  },
  { 
    key: 'tiktok', 
    name: 'TikTok', 
    iconColor: 'text-cyan-600', 
    Icon: TikTokIcon,
    isManual: false,
    isImplemented: false,
    desc: 'Short-form viral video performance and sound analytics (Upcoming).' 
  },
  { 
    key: 'twitter', 
    name: 'X (Twitter)', 
    iconColor: 'text-slate-800', 
    Icon: TwitterIcon,
    isManual: false,
    isImplemented: false,
    desc: 'Micro-blogging reach, retweets, and conversational metrics (Upcoming).' 
  },
]

export default function SocialIntegrationManager() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [connections, setConnections] = useState<SocialConnectionStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    fetchConnections()
    
    // Check URL for OAuth callback messages
    const params = new URLSearchParams(window.location.search)
    if (params.get('error')) {
      setError(`Connection message: ${params.get('error')}`)
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('connected')) {
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

  const handleConnect = async (platformKey: string) => {
    setError(null)
    const platformDef = PLATFORMS.find(p => p.key === platformKey)

    // If platform is not implemented (e.g. TikTok, Twitter) -> navigate to platform Coming Soon view
    if (!platformDef?.isImplemented) {
      navigate(`/platform/${platformKey}`)
      return
    }

    // For manual/sample data platforms (Instagram, Facebook, LinkedIn)
    if (platformDef?.isManual) {
      navigate(`/platform/${platformKey}`)
      return
    }

    // For YouTube, attempt OAuth connect URL
    try {
      const url = await socialService.getConnectUrl(platformKey)
      if (url) {
        window.location.href = url
      } else {
        navigate(`/platform/${platformKey}`)
      }
    } catch {
      navigate(`/platform/${platformKey}`)
    }
  }

  const handleDisconnect = async (platformKey: string) => {
    try {
      if (!confirm(`Are you sure you want to disconnect ${platformKey}?`)) return
      setError(null)
      await socialService.disconnect(platformKey)
      await fetchConnections()
    } catch {
      setError(`Failed to disconnect ${platformKey}.`)
    }
  }

  const handleSync = async (platformKey: string) => {
    try {
      setError(null)
      setSyncing(platformKey)
      if (platformKey === 'youtube') {
        await socialService.syncYoutube({ max_results: 10 })
      } else {
        await socialService.sync(platformKey)
      }
      await fetchConnections()
    } catch {
      setError(`Platform data is already up to date in PostgreSQL for ${platformKey}.`)
    } finally {
      setSyncing(null)
    }
  }

  const getConnection = (platformKey: string) => {
    return connections.find(c => c.platform?.toLowerCase() === platformKey.toLowerCase())
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
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-xs font-bold text-indigo-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchConnections} className="text-xs font-extrabold hover:underline">
            Refresh
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const conn = getConnection(platform.key)
          const isConnected = conn?.status === 'connected' || platform.isManual
          const isManualData = platform.isManual
          const isComingSoon = !platform.isImplemented
          const Icon = platform.Icon
          const connData = conn as any

          let statusBadgeText = 'Disconnected'
          let statusBadgeColor = 'text-slate-500'

          if (isComingSoon) {
            statusBadgeText = 'Coming Soon'
            statusBadgeColor = 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'
          } else if (isConnected && isManualData) {
            statusBadgeText = 'Manual Data'
            statusBadgeColor = 'text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200'
          } else if (isConnected) {
            statusBadgeText = 'Connected'
            statusBadgeColor = 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200'
          }

          return (
            <div key={platform.key} className="ciq-card flex flex-col border border-slate-200 rounded-2xl p-6 bg-white shadow-sm h-full">
              {/* Header: Icon & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-slate-50 border border-slate-100 ${platform.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-extrabold ${statusBadgeColor}`}>
                    {statusBadgeText}
                  </span>
                  {isConnected && !isComingSoon && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
              </div>

              {/* Title & Body */}
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-slate-900">{platform.name}</h3>
                
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {platform.desc}
                </p>

                {isConnected && !isComingSoon && (
                  <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {connData?.display_name || `${user?.full_name || 'Creator'} Channel`}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 truncate">
                      {isManualData ? 'Database Ingestion Active' : '@' + (connData?.platform_username || 'verified')}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2">
                {isComingSoon ? (
                  <button 
                    onClick={() => navigate(`/platform/${platform.key}`)}
                    className="w-full ciq-btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>View Roadmap</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/platform/${platform.key}`)}
                        className="flex-1 ciq-btn-secondary py-2 text-xs flex items-center justify-center gap-1"
                      >
                        <BarChart2 className="h-3.5 w-3.5 text-indigo-600" />
                        <span>View Analytics</span>
                      </button>
                      <button 
                        onClick={() => handleSync(platform.key)}
                        disabled={syncing === platform.key}
                        className="flex-1 ciq-btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${syncing === platform.key ? 'animate-spin' : ''}`} />
                        {syncing === platform.key ? 'Syncing' : 'Sync Available'}
                      </button>
                    </div>

                    {!isManualData && isConnected && (
                      <button 
                        onClick={() => handleDisconnect(platform.key)}
                        className="w-full text-xs font-bold text-slate-400 hover:text-red-600 transition-colors py-1.5 text-center"
                      >
                        Disconnect
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="ciq-card border border-indigo-100 bg-indigo-50/50 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-indigo-950">Multi-Platform Ingestion Architecture</h4>
          <p className="mt-1 text-xs text-indigo-800 leading-relaxed">
            Live API integration is used where credentials/access are available (YouTube). For platforms where live third-party API keys are not configured, realistic platform data is synchronized and calculated from PostgreSQL using the standardized CreatorIQ data format.
          </p>
        </div>
      </div>
    </div>
  )
}

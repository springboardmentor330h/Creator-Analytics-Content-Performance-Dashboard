import { useEffect, useState } from 'react'
import { CheckCircle2, RefreshCw, Unplug, AlertCircle } from 'lucide-react'
import { socialService, SocialConnectionStatus } from '../services/socialService'
import { useAuth } from '../context/AuthContext'

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

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

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const PLATFORMS = [
  { 
    key: 'youtube', 
    name: 'YouTube', 
    iconColor: 'text-red-600', 
    Icon: YoutubeIcon,
    desc: 'Connect your YouTube channel to sync videos and performance metrics.' 
  },
  { 
    key: 'instagram', 
    name: 'Instagram', 
    iconColor: 'text-pink-600', 
    Icon: InstagramIcon,
    desc: 'Connect your Instagram account to track posts, reels and engagement.' 
  },
  { 
    key: 'tiktok', 
    name: 'TikTok', 
    iconColor: 'text-cyan-600', 
    Icon: TikTokIcon,
    desc: 'Connect your TikTok account to analyze videos and engagement.' 
  },
  { 
    key: 'facebook', 
    name: 'Facebook', 
    iconColor: 'text-blue-600', 
    Icon: FacebookIcon,
    desc: 'Connect your Facebook Page to monitor content and performance.' 
  },
  { 
    key: 'twitter', 
    name: 'X (Twitter)', 
    iconColor: 'text-slate-800', 
    Icon: TwitterIcon,
    desc: 'Connect your X account to track posts and engagement.' 
  },
  { 
    key: 'linkedin', 
    name: 'LinkedIn', 
    iconColor: 'text-blue-700', 
    Icon: LinkedinIcon,
    desc: 'Connect your LinkedIn account to track supported content metrics.' 
  },
]

export default function SocialIntegrationManager() {
  const { user } = useAuth()
  const [connections, setConnections] = useState<SocialConnectionStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    fetchConnections()
    
    // Check URL for OAuth callback messages
    const params = new URLSearchParams(window.location.search)
    if (params.get('error')) {
      setError(`Connection failed: ${params.get('error')}`)
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
    } catch (err: any) {
      setError('Unable to load social media connections.')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (platform: string) => {
    try {
      setError(null)
      const url = await socialService.getConnectUrl(platform)
      window.location.href = url
    } catch (err: any) {
      setError(`Failed to initiate connection for ${platform}. Please check API credentials.`)
    }
  }

  const handleDisconnect = async (platform: string) => {
    try {
      if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return
      setError(null)
      await socialService.disconnect(platform)
      await fetchConnections()
    } catch (err: any) {
      setError(`Failed to disconnect ${platform}.`)
    }
  }

  const handleSync = async (platform: string) => {
    try {
      setError(null)
      setSyncing(platform)
      await socialService.sync(platform)
      await fetchConnections()
    } catch (err: any) {
      setError(`Failed to sync data for ${platform}.`)
    } finally {
      setSyncing(null)
    }
  }

  const getConnection = (platform: string) => {
    return connections.find(c => c.platform === platform)
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
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <button onClick={fetchConnections} className="text-xs font-extrabold hover:underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const conn = getConnection(platform.key)
          const status = conn?.status || 'not_configured'
          const isConnected = status === 'connected'
          const needsReconnect = status === 'expired' || status === 'error'
          const Icon = platform.Icon

          // Use cast to any since schema on frontend might not reflect full backend return type exactly
          const connData = conn as any

          return (
            <div key={platform.key} className="ciq-card flex flex-col border border-slate-200 rounded-2xl p-6 bg-white shadow-sm h-full">
              {/* Header: Icon & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-slate-50 border border-slate-100 ${platform.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${isConnected ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {isConnected ? 'Connected' : needsReconnect ? status : 'Disconnected'}
                  </span>
                  {isConnected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
              </div>

              {/* Title & Body */}
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-slate-900">{platform.name}</h3>
                
                {!isConnected ? (
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    {platform.desc}
                  </p>
                ) : (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {connData?.display_name || 'Authorized Account'}
                    </p>
                    <p className="text-sm font-medium text-slate-500 truncate">
                      {connData?.platform_username ? `@${connData.platform_username}` : 'Integration active'}
                    </p>
                    {conn?.last_synced_at && (
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        Last synced: {new Date(conn.last_synced_at).toLocaleString(undefined, {
                          hour: 'numeric',
                          minute: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2">
                {isConnected ? (
                  <>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleConnect(platform.key)}
                        className="flex-1 ciq-btn-secondary py-2 text-xs"
                      >
                        Reconnect
                      </button>
                      <button 
                        onClick={() => handleSync(platform.key)}
                        disabled={syncing === platform.key}
                        className="flex-1 ciq-btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${syncing === platform.key ? 'animate-spin' : ''}`} />
                        {syncing === platform.key ? 'Syncing' : 'Sync'}
                      </button>
                    </div>
                    <button 
                      onClick={() => handleDisconnect(platform.key)}
                      className="w-full text-xs font-bold text-slate-500 hover:text-red-600 transition-colors py-2"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleConnect(platform.key)}
                    className="w-full ciq-btn-primary py-2.5 text-sm"
                  >
                    {needsReconnect ? 'Reconnect' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="ciq-card mt-8 border border-brand-100 bg-brand-50 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-brand-100 text-brand-700 rounded-lg shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-brand-900">Secure & Private</h4>
          <p className="mt-1 text-sm text-brand-700 leading-relaxed">
            We never post on your behalf. Your connection data is securely protected and you can disconnect at any time.
          </p>
        </div>
      </div>
    </div>
  )
}

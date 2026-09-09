import React, { useEffect, useState, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { socialService, SocialConnectionStatus } from '../services/socialService'
import PlatformConnectionCard, { PlatformConfig } from '../components/social/PlatformConnectionCard'
import ConnectionInfoModal, { PlatformInfoData } from '../components/social/ConnectionInfoModal'
import DisconnectConfirmation from '../components/social/DisconnectConfirmation'
import ConnectPlatformModal from '../components/social/ConnectPlatformModal'
import ToastNotification, { ToastMessage } from '../components/social/ToastNotification'

// The 6 platforms in the exact order shown in the reference image: YouTube, Instagram, TikTok, Facebook, X (Twitter), LinkedIn
const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    key: 'youtube',
    displayName: 'YouTube',
    isImplemented: true,
    defaultScopes: 'https://www.googleapis.com/auth/youtube.readonly',
  },
  {
    key: 'instagram',
    displayName: 'Instagram',
    isImplemented: true,
    defaultScopes: 'instagram_basic, pages_show_list',
  },
  {
    key: 'tiktok',
    displayName: 'TikTok',
    isImplemented: true,
    defaultScopes: 'user.info.basic, video.list',
  },
  {
    key: 'facebook',
    displayName: 'Facebook',
    isImplemented: true,
    defaultScopes: 'pages_read_engagement, pages_show_list',
  },
  {
    key: 'twitter',
    displayName: 'X (Twitter)',
    isImplemented: true,
    defaultScopes: 'tweet.write, users.read, tweet.read, offline.access',
  },
  {
    key: 'linkedin',
    displayName: 'LinkedIn',
    isImplemented: true,
    defaultScopes: 'email, openid, profile, w_member_social',
  },
]

export default function SocialConnections() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [connections, setConnections] = useState<SocialConnectionStatus[]>([])
  const [loading, setLoading] = useState(true)

  // Loading indicator states per platform
  const [refreshingPlatform, setRefreshingPlatform] = useState<string | null>(null)
  const [reconnectingPlatform, setReconnectingPlatform] = useState<string | null>(null)
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null)

  // Modals state
  const [infoModalData, setInfoModalData] = useState<PlatformInfoData | null>(null)
  const [disconnectModalPlatform, setDisconnectModalPlatform] = useState<PlatformConfig | null>(null)
  const [connectModalConfig, setConnectModalConfig] = useState<{
    config: PlatformConfig
    isUnavailable?: boolean
  } | null>(null)

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5)
    setToasts((prev) => [...prev, { id, type, message }])
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  useEffect(() => {
    fetchConnections()

    // Check URL parameters for OAuth messages and handle cleanly without page navigation
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    const connected = params.get('connected')

    if (err) {
      addToast('error', `Connection error: ${err}`)
      window.history.replaceState({}, '', window.location.pathname)
    } else if (connected) {
      const pKey = connected.toLowerCase()
      socialService.sync(pKey).then((syncRes) => {
        addToast(
          'success',
          `Successfully connected and synchronized ${syncRes.records_synced || 0} records for ${pKey.toUpperCase()}!`
        )
        fetchConnections()
      }).catch(() => {
        addToast('success', `Successfully connected ${pKey.toUpperCase()}!`)
        fetchConnections()
      })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchConnections = async () => {
    try {
      setLoading(true)
      const data = await socialService.getStatus()
      setConnections(Array.isArray(data) ? data : [])
    } catch {
      addToast('error', 'Unable to retrieve social media connections. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  // Find connection record by platform key (supports 'twitter' / 'x' aliasing)
  const getConnection = (platformKey: string) => {
    const key = platformKey.toLowerCase()
    return connections.find((c) => {
      const p = (c.platform || '').toLowerCase()
      if (key === 'twitter' || key === 'x') {
        return p === 'twitter' || p === 'x'
      }
      return p === key
    })
  }

  // Handle Connect Click
  const handleConnect = (config: PlatformConfig) => {
    setConnectModalConfig({ config, isUnavailable: false })
  }

  // Handle Reconnect Click
  const handleReconnect = (config: PlatformConfig) => {
    setConnectModalConfig({ config, isUnavailable: false })
  }

  // Handle Sync Click with records synced feedback
  const handleSync = async (config: PlatformConfig) => {
    try {
      setRefreshingPlatform(config.key)
      const res = await socialService.sync(config.key)
      await fetchConnections()
      const count = res?.records_synced ?? 0
      addToast(
        'success',
        `Synced successfully! ${count} ${config.displayName} content records updated.`
      )
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        `Synchronization failed for ${config.displayName}. Please verify connection.`
      addToast('error', typeof msg === 'string' ? msg : 'Synchronization failed.')
    } finally {
      setRefreshingPlatform(null)
    }
  }

  // Handle Info Click
  const handleInfo = (config: PlatformConfig) => {
    const conn = getConnection(config.key)
    const isConnected = conn?.status === 'connected'

    setInfoModalData({
      platformKey: config.key,
      displayName: config.displayName,
      accountName: conn?.display_name || conn?.account_name || (isConnected ? (user?.full_name || 'Creator Account') : 'Not connected'),
      username: conn?.platform_username || null,
      email: user?.email || null,
      status: conn?.status || 'disconnected',
      lastSync: conn?.last_synced_at || null,
      permissions: conn?.scopes || config.defaultScopes || null,
      profileUrl: conn?.profile_url || null,
    })
  }

  // Handle Disconnect Initiation
  const handleInitiateDisconnect = (config: PlatformConfig) => {
    setDisconnectModalPlatform(config)
  }

  // Handle Disconnect Confirmation
  const handleConfirmDisconnect = async () => {
    if (!disconnectModalPlatform) return
    const config = disconnectModalPlatform
    setDisconnectingPlatform(config.key)

    try {
      await socialService.disconnect(config.key)
      // Update state immediately so card reflects Disconnected state
      setConnections((prev) =>
        prev.map((c) => {
          const p = (c.platform || '').toLowerCase()
          if (p === config.key.toLowerCase() || (config.key === 'twitter' && p === 'x')) {
            return { ...c, status: 'disconnected', access_token_encrypted: null }
          }
          return c
        })
      )
      setDisconnectModalPlatform(null)
      addToast('success', `${config.displayName} disconnected successfully.`)
      await fetchConnections()
    } catch {
      addToast('error', `Failed to disconnect ${config.displayName}. Please try again.`)
    } finally {
      setDisconnectingPlatform(null)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-[1280px] mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Connect Apps
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your social media platform connections.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs h-[260px] animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-200" />
                    <div className="w-20 h-5 rounded-full bg-slate-200" />
                  </div>
                  <div className="mt-4 w-28 h-6 bg-slate-200 rounded-md" />
                  <div className="mt-4 space-y-2">
                    <div className="w-36 h-4 bg-slate-100 rounded" />
                    <div className="w-44 h-3.5 bg-slate-100 rounded" />
                    <div className="w-24 h-3.5 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="w-24 h-7 bg-slate-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Platform Responsive Grid: Desktop 3 cols, Tablet 2 cols, Mobile 1 col */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {PLATFORM_CONFIGS.map((platform) => {
              const conn = getConnection(platform.key)
              const isConnected = conn?.status === 'connected'

              // Resolve display account name
              const accountName = isConnected
                ? conn?.display_name || conn?.account_name || user?.full_name || `${platform.displayName} Channel`
                : null

              // Resolve handle / identifier
              const email = isConnected
                ? (conn?.platform_username || user?.email)
                : null

              // Resolve scopes
              const permissions = isConnected
                ? (conn?.scopes || platform.defaultScopes)
                : null

              return (
                <PlatformConnectionCard
                  key={platform.key}
                  platform={platform}
                  status={isConnected ? 'connected' : 'disconnected'}
                  accountName={accountName}
                  email={email}
                  lastSync={conn?.last_synced_at || null}
                  connectionMode={conn?.connection_mode || (platform.key === 'youtube' ? 'live' : 'manual')}
                  permissions={permissions}
                  profileUrl={conn?.profile_url || null}
                  onConnect={() => handleConnect(platform)}
                  onReconnect={() => handleReconnect(platform)}
                  onRefresh={() => handleSync(platform)}
                  onInfo={() => handleInfo(platform)}
                  onDisconnect={() => handleInitiateDisconnect(platform)}
                  onLiveAnalytics={platform.key === 'youtube' ? () => navigate('/dashboard?source=live&platform=YouTube') : undefined}
                  isRefreshing={refreshingPlatform === platform.key}
                  isReconnecting={reconnectingPlatform === platform.key}
                  isDisconnecting={disconnectingPlatform === platform.key}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Info Modal */}
      <ConnectionInfoModal
        data={infoModalData}
        onClose={() => setInfoModalData(null)}
      />

      {/* Disconnect Confirmation Modal */}
      <DisconnectConfirmation
        isOpen={Boolean(disconnectModalPlatform)}
        platformName={disconnectModalPlatform?.displayName || ''}
        isDisconnecting={Boolean(disconnectingPlatform)}
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setDisconnectModalPlatform(null)}
      />

      {/* Connect Platform Modal */}
      <ConnectPlatformModal
        platformKey={connectModalConfig?.config.key || null}
        displayName={connectModalConfig?.config.displayName || ''}
        isUnavailable={connectModalConfig?.isUnavailable}
        defaultAccountName={user?.full_name || ''}
        onClose={() => setConnectModalConfig(null)}
        onSuccess={(msg: string) => {
          addToast('success', msg)
          fetchConnections()
        }}
        onError={(err: string) => addToast('error', err)}
      />
    </div>
  )
}

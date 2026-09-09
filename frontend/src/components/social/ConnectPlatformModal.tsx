import React, { useState } from 'react'
import { X, Globe, ArrowRight, Loader2, Database, CheckCircle2, ShieldCheck } from 'lucide-react'
import PlatformIcon from '../PlatformIcon'
import { socialService } from '../../services/socialService'

export interface ConnectPlatformModalProps {
  platformKey: string | null
  displayName: string
  isUnavailable?: boolean
  defaultAccountName?: string
  onClose: () => void
  onSuccess: (msg: string) => void
  onError: (err: string) => void
}

export const ConnectPlatformModal: React.FC<ConnectPlatformModalProps> = ({
  platformKey,
  displayName,
  defaultAccountName = '',
  onClose,
  onSuccess,
  onError,
}) => {
  const [accountName, setAccountName] = useState(defaultAccountName)
  const [channelId, setChannelId] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  if (!platformKey) return null

  const isYouTube = platformKey.toLowerCase() === 'youtube'

  // Handle OAuth Redirect
  const handleOAuthConnect = async () => {
    try {
      setOauthLoading(true)
      const url = await socialService.getConnectUrl(platformKey)
      if (url) {
        window.location.href = url
      } else {
        onError(`Live OAuth is not configured for ${displayName}. You can connect directly using your account handle below.`)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || `Could not initialize ${displayName} OAuth. Please connect using account handle.`
      onError(typeof msg === 'string' ? msg : 'OAuth initiation failed. Please use account handle.')
    } finally {
      setOauthLoading(false)
    }
  }

  // Handle Connect and Initial Auto-Sync
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountName.trim()) {
      onError('Please enter an account or channel name.')
      return
    }

    try {
      setLoading(true)
      // 1. Establish connection record in backend
      await socialService.connectPlatformAccount(platformKey, accountName.trim())

      // 2. Automatically execute initial synchronization into PostgreSQL
      let syncedCount = 0
      try {
        if (isYouTube) {
          const res = await socialService.syncYoutube({
            account_name: accountName.trim(),
            channel_id: channelId.trim() || undefined,
            max_results: 10,
          })
          syncedCount = res.records_synced || 0
        } else {
          const res = await socialService.sync(platformKey)
          syncedCount = res.records_synced || 0
        }
      } catch (syncErr: any) {
        console.warn('Initial sync warning:', syncErr)
      }

      onSuccess(
        `Successfully connected ${displayName} and synchronized ${syncedCount} records!`
      )
      onClose()
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        `Failed to connect ${displayName}. Please verify and retry.`
      onError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <PlatformIcon platform={platformKey} size={38} variant="subtle" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Connect {displayName}</h3>
              <p className="text-xs text-slate-500">Enable live analytics synchronization</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Options */}
        <div className="mt-5 space-y-4">
          {/* OAuth Option */}
          <button
            type="button"
            onClick={handleOAuthConnect}
            disabled={oauthLoading || loading}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800 transition-all font-semibold text-xs disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <PlatformIcon platform={platformKey} size={22} variant="solid" />
              <span>Continue with {displayName} OAuth</span>
            </div>
            {oauthLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or connect account
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account / Channel Handle <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder={isYouTube ? "e.g. Suresh Tech" : `e.g. @${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}_creator`}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                {isYouTube
                  ? 'Connects your channel and synchronizes video performance metrics.'
                  : 'Enables analytics synchronization and stores records in the database.'}
              </p>
            </div>

            {isYouTube && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Channel ID <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="e.g. UCxxxxxxxx"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || oauthLoading}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting & Syncing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connect & Sync</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ConnectPlatformModal

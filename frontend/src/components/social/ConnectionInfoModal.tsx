import React from 'react'
import { X, ShieldCheck, Clock, User, Mail, Globe, CheckCircle2 } from 'lucide-react'
import PlatformIcon from '../PlatformIcon'
import ConnectionStatusBadge from './ConnectionStatusBadge'

export interface PlatformInfoData {
  platformKey: string
  displayName: string
  accountName?: string | null
  username?: string | null
  email?: string | null
  status: string
  lastSync?: string | null
  permissions?: string | null
  profileUrl?: string | null
}

interface ConnectionInfoModalProps {
  data: PlatformInfoData | null
  onClose: () => void
}

export const ConnectionInfoModal: React.FC<ConnectionInfoModalProps> = ({ data, onClose }) => {
  if (!data) return null

  const formatLastSync = (isoString?: string | null) => {
    if (!isoString) return 'Never synced'
    try {
      const d = new Date(isoString)
      return d.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <PlatformIcon platform={data.platformKey} size={36} variant="subtle" />
            <div>
              <h3 id="info-modal-title" className="text-base font-bold text-slate-900">
                {data.displayName}
              </h3>
              <p className="text-xs text-slate-500">Connection details & scopes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details list */}
        <div className="mt-4 space-y-3.5 text-xs">
          {/* Status */}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="font-medium text-slate-500">Status</span>
            <ConnectionStatusBadge status={data.status} />
          </div>

          {/* Account Name */}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="font-medium text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Connected Account
            </span>
            <span className="font-semibold text-slate-900 text-right">
              {data.accountName || 'Primary Account'}
            </span>
          </div>

          {/* Email / Username */}
          {(data.email || data.username) && (
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Identifier
              </span>
              <span className="font-medium text-slate-700 text-right truncate max-w-[200px]">
                {data.email || data.username}
              </span>
            </div>
          )}

          {/* Last Sync */}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="font-medium text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Last Sync
            </span>
            <span className="font-semibold text-slate-700">
              {formatLastSync(data.lastSync)}
            </span>
          </div>

          {/* Profile URL if available */}
          {data.profileUrl && (
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Profile
              </span>
              <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline truncate max-w-[200px]"
              >
                {data.profileUrl}
              </a>
            </div>
          )}

          {/* Permissions / Scopes */}
          <div className="pt-2">
            <span className="font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Authorized Scopes & Permissions
            </span>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 font-mono text-[11px] text-slate-600 break-words leading-relaxed">
              {data.permissions || 'Standard read & engagement metrics'}
            </div>
          </div>
        </div>

        {/* Security / Info Note */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>Connection is secured using OAuth standard tokens and encrypted storage.</span>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectionInfoModal

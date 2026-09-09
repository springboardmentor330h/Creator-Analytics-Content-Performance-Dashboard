import React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface DisconnectConfirmationProps {
  isOpen: boolean
  platformName: string
  isDisconnecting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const DisconnectConfirmation: React.FC<DisconnectConfirmationProps> = ({
  isOpen,
  platformName,
  isDisconnecting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-modal-title"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="disconnect-modal-title" className="text-base font-bold text-slate-900">
              Disconnect {platformName}?
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              This will remove the connection from CreatorIQ.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDisconnecting}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDisconnecting}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Disconnecting...</span>
              </>
            ) : (
              'Disconnect'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DisconnectConfirmation

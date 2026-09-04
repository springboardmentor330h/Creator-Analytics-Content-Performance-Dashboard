import { Loader2, Inbox, AlertTriangle, RefreshCw } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="flex items-center gap-3 text-indigo-600">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}

export function EmptyState({ message = "No data yet." }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
      <Inbox size={40} strokeWidth={1.25} />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Unable to load data.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-red-500 gap-3">
      <AlertTriangle size={40} strokeWidth={1.25} />
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-1.5 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}

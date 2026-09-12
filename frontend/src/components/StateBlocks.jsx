export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="state-block state-loading">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ title, description }) {
  return (
    <div className="state-block state-empty">
      <div className="state-title">{title}</div>
      {description && <div className="text-muted">{description}</div>}
    </div>
  )
}

export function ErrorState({ message }) {
  return (
    <div className="auth-error">{message}</div>
  )
}

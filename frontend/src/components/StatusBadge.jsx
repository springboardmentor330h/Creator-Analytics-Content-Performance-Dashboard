const VARIANT_CLASS = {
  live: 'badge-live',
  mock: 'badge-mock',
  active: 'badge-live',
  pending: 'badge-mock',
  completed: 'badge-live',
  cancelled: 'badge-mock',
  read: 'badge-mock',
  unread: 'badge-live',
}

export default function StatusBadge({ label, variant }) {
  const className = VARIANT_CLASS[variant] || 'badge-mock'
  return <span className={className}>{label}</span>
}

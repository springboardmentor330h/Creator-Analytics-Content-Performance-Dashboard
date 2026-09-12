import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/analytics/content', label: 'Content Analytics' },
  { to: '/analytics/audience', label: 'Audience Analytics' },
  { to: '/growth-trends', label: 'Growth & Trends' },
  { to: '/analytics/platforms', label: 'Platform Comparison' },
  { to: '/revenue', label: 'Revenue' },
  { to: '/sponsorships', label: 'Sponsorships' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/reports', label: 'Reports' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">CreatorIQ</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

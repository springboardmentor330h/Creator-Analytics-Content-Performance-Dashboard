import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">CreatorIQ</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
          Dashboard
        </NavLink>
        <NavLink to="/analytics/content" className={({ isActive }) => (isActive ? 'active' : '')}>
          Content Analytics
        </NavLink>
        <NavLink to="/analytics/audience" className={({ isActive }) => (isActive ? 'active' : '')}>
          Audience Analytics
        </NavLink>
        <NavLink to="/analytics/platforms" className={({ isActive }) => (isActive ? 'active' : '')}>
          Platform Comparison
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        {user && <div className="sidebar-user">{user.name}</div>}
        <button onClick={handleLogout} className="btn-logout">Log out</button>
      </div>
    </aside>
  )
}

import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NotificationBell from './NotificationBell'

export default function TopHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="top-header">
      <div className="top-header-spacer" />
      <div className="top-header-actions">
        <NotificationBell />
        <Link to="/profile" className="top-header-user">
          <span className="top-header-avatar">{user?.name?.charAt(0).toUpperCase() || '?'}</span>
          <span className="top-header-username">{user?.name}</span>
        </Link>
        <button onClick={handleLogout} className="btn-logout">Log out</button>
      </div>
    </header>
  )
}

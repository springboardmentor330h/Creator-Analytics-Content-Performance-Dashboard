import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Film, Users, TrendingUp, DollarSign, Handshake,
  Bell, FileText, Settings, LogOut, Menu, X, Share2, BarChart3,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { notificationAPI } from '../../services/api'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/content', label: 'Content', icon: Film },
  { to: '/audience', label: 'Audience', icon: Users },
  { to: '/growth', label: 'Growth', icon: TrendingUp },
  { to: '/platform-comparison', label: 'Platforms', icon: BarChart3 },
  { to: '/social', label: 'Social Sync', icon: Share2 },
  { to: '/revenue', label: 'Revenue', icon: DollarSign },
  { to: '/sponsorships', label: 'Sponsorships', icon: Handshake },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState([])
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef(null)

  const loadUnread = useCallback(() => {
    notificationAPI
      .list()
      .then((res) => {
        const data = res.data || {}
        setUnread(data.unread_count || 0)
        setItems(Array.isArray(data.items) ? data.items.slice(0, 8) : [])
      })
      .catch(() => {
        setUnread(0)
        setItems([])
      })
  }, [])

  useEffect(() => {
    loadUnread()
    const id = setInterval(loadUnread, 30000)
    return () => clearInterval(id)
  }, [loadUnread])

  useEffect(() => {
    const onClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="min-h-screen flex bg-slate-50">
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed lg:static z-50 inset-y-0 left-0 w-64 bg-white border-r border-slate-200 transform transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              CIQ
            </div>
            <span className="font-semibold text-slate-900">CreatorIQ</span>
          </div>
          <button className="lg:hidden text-slate-500" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
          {nav.map(({ to, label, icon: Icon }) => {
            const isNotif = label === 'Notifications'
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <span className="relative">
                  <Icon size={18} />
                  {isNotif && unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </span>
                <span className="flex-1 flex items-center gap-2">
                  {label}
                  {isNotif && unread > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </span>
              </NavLink>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <p className="text-sm font-medium truncate text-slate-900">{user?.full_name || user?.email || 'Creator'}</p>
          <p className="text-xs text-slate-500 capitalize mb-2">{user?.role || 'user'}</p>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-slate-200 px-4 flex items-center gap-3 sticky top-0 bg-white/90 backdrop-blur z-20">
          <button className="lg:hidden text-slate-500" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <p className="text-sm text-slate-500 flex-1">Creator analytics</p>

          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => { setBellOpen((v) => !v); loadUnread() }}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white border border-slate-200 rounded-2xl shadow-lg z-50">
                <div className="px-3 py-2 border-b border-slate-100 flex justify-between">
                  <p className="text-sm font-medium">Notifications</p>
                  {unread > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">{unread} unread</span>}
                </div>
                {items.length === 0 && <p className="px-3 py-6 text-sm text-slate-400 text-center">No notifications</p>}
                {items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => { setBellOpen(false); navigate('/notifications') }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-50 ${!n.is_read ? 'bg-red-50/50' : ''}`}
                  >
                    <p className={`text-sm truncate ${!n.is_read ? 'font-semibold' : 'text-slate-700'}`}>{n.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                  </button>
                ))}
                <button type="button" onClick={() => { setBellOpen(false); navigate('/notifications') }} className="w-full text-center text-xs text-sky-600 py-2.5 hover:bg-slate-50">
                  View all
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 lg:p-6 flex-1 overflow-auto">
          <Outlet context={{ refreshNotifications: loadUnread }} />
        </main>
      </div>
    </div>
  )
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Film, Users, TrendingUp, DollarSign, Handshake,
  Bell, FileText, Settings, LogOut, Menu, X, Share2, BarChart3, Search,
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

const PAGE_HINTS = [
  { q: 'dashboard', to: '/', label: 'Dashboard' },
  { q: 'content', to: '/content', label: 'Content' },
  { q: 'audience', to: '/audience', label: 'Audience' },
  { q: 'growth', to: '/growth', label: 'Growth' },
  { q: 'platform', to: '/platform-comparison', label: 'Platforms' },
  { q: 'social', to: '/social', label: 'Social Sync' },
  { q: 'youtube', to: '/social', label: 'Social Sync' },
  { q: 'instagram', to: '/social', label: 'Social Sync' },
  { q: 'revenue', to: '/revenue', label: 'Revenue' },
  { q: 'sponsorship', to: '/sponsorships', label: 'Sponsorships' },
  { q: 'notification', to: '/notifications', label: 'Notifications' },
  { q: 'report', to: '/reports', label: 'Reports' },
  { q: 'settings', to: '/settings', label: 'Settings' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState([])
  const [bellOpen, setBellOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const bellRef = useRef(null)
  const searchRef = useRef(null)

  const loadUnread = useCallback(() => {
    notificationAPI
      .list()
      .then((res) => {
        const data = res.data || {}
        setUnread(Number(data.unread_count) || 0)
        const list = data.items || data.notifications || data || []
        setItems(Array.isArray(list) ? list.slice(0, 6) : [])
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
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const runSearch = (e) => {
    e?.preventDefault?.()
    const q = query.trim().toLowerCase()
    if (!q) return
    const hit = PAGE_HINTS.find((p) => q.includes(p.q) || p.q.includes(q) || p.label.toLowerCase().includes(q))
    if (hit) navigate(hit.to)
    else navigate(`/content?q=${encodeURIComponent(query.trim())}`)
    setSearchOpen(false)
  }

  const initials = (user?.full_name || user?.email || 'C')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const suggestions = PAGE_HINTS.filter(
    (p) =>
      !query.trim() ||
      p.label.toLowerCase().includes(query.toLowerCase()) ||
      p.q.includes(query.toLowerCase())
  ).slice(0, 6)

  return (
    <div className="min-h-screen flex bg-[#f1f5f9]">
      {open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-[260px] bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-sky-500/30">
              CIQ
            </div>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">CreatorIQ</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">ANALYTICS</p>
            </div>
          </div>
          <button type="button" className="lg:hidden text-slate-400" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Overview</p>
          {nav.slice(0, 6).map(({ to, label, icon: Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} onClick={() => setOpen(false)} badge={label === 'Notifications' ? unread : 0} />
          ))}
          <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Business</p>
          {nav.slice(6).map(({ to, label, icon: Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} onClick={() => setOpen(false)} badge={label === 'Notifications' ? unread : 0} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate text-slate-900">{user?.full_name || user?.email || 'Creator'}</p>
              <p className="text-[11px] text-slate-400 capitalize">{user?.role || 'creator'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl py-2 transition"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-slate-200/80 px-4 lg:px-6 flex items-center gap-3 sticky top-0 bg-white/80 backdrop-blur-md z-20">
          <button type="button" className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>

          {/* Working search */}
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <form
              onSubmit={runSearch}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100"
            >
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search pages or content…"
                className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 min-w-0"
              />
            </form>
            {searchOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {suggestions.map((p) => (
                  <button
                    key={p.to + p.label}
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 text-slate-700"
                    onClick={() => {
                      navigate(p.to)
                      setQuery('')
                      setSearchOpen(false)
                    }}
                  >
                    {p.label}
                  </button>
                ))}
                {query.trim() && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-sm text-sky-600 hover:bg-sky-50 border-t border-slate-100"
                    onClick={() => {
                      navigate(`/content?q=${encodeURIComponent(query.trim())}`)
                      setSearchOpen(false)
                    }}
                  >
                    Search content for “{query.trim()}”
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bell — pinned right */}
          <div className="ml-auto relative shrink-0" ref={bellRef}>
            <button
              type="button"
              onClick={() => {
                setBellOpen((v) => !v)
                loadUnread()
              }}
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50">
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  {unread > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                      {unread} new
                    </span>
                  )}
                </div>
                {items.length === 0 && (
                  <p className="px-4 py-8 text-sm text-slate-400 text-center">No notifications</p>
                )}
                {items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setBellOpen(false)
                      navigate('/notifications')
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 ${
                      !n.is_read ? 'bg-sky-50/60' : ''
                    }`}
                  >
                    <p className={`text-sm truncate ${!n.is_read ? 'font-semibold' : 'text-slate-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setBellOpen(false)
                    navigate('/notifications')
                  }}
                  className="w-full text-center text-xs font-medium text-sky-600 py-3 hover:bg-slate-50"
                >
                  View all
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 lg:p-6 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ refreshNotifications: loadUnread }} />
          </div>
        </main>
      </div>
    </div>
  )
}

function NavItem({ to, label, Icon, onClick, badge = 0 }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
          isActive
            ? 'bg-sky-50 text-sky-700 font-semibold shadow-sm shadow-sky-100'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      <span className="relative">
        <Icon size={18} strokeWidth={1.75} />
        {badge > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />}
      </span>
      <span className="flex-1 flex items-center gap-2">
        {label}
        {badge > 0 && (
          <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
    </NavLink>
  )
}

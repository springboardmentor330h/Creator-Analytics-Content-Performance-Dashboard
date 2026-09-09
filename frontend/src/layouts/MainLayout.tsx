import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Share2,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { notificationApi } from '../services/api'
import { ROLES } from '../utils/roles'

type NavItem = {
  label: string
  path: string
  roles: string[]
  icon: typeof LayoutDashboard
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: LayoutDashboard },
  { label: 'Content Analytics', path: '/content-analytics', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: BarChart3 },
  { label: 'Audience Analytics', path: '/audience-analytics', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: Users },
  { label: 'Growth & Trends', path: '/growth-trends', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: TrendingUp },
  { label: 'Revenue', path: '/revenue', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.ADMIN], icon: DollarSign },
  { label: 'Sponsorships', path: '/sponsorships', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.ADMIN], icon: Zap },
  { label: 'Notifications', path: '/notifications', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: Bell },
  { label: 'Reports', path: '/reports', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: FileText },
  { label: 'My Content', path: '/content', roles: [ROLES.CREATOR, ROLES.ADMIN], icon: FileText },
  { label: 'Content Comparison', path: '/content-comparison', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: ArrowLeftRight },
  { label: 'Agency Creators', path: '/agency', roles: [ROLES.AGENCY, ROLES.ADMIN], icon: Users },
  { label: 'Connected Apps', path: '/social-connections', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.ADMIN], icon: Share2 },
  { label: 'Profile', path: '/profile', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: User },
  { label: 'Settings', path: '/settings', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: Settings },
]

const ROUTE_TITLES: Record<string, { title: string; subtitle: string; category: string }> = {
  '/dashboard': { title: 'Workspace Dashboard', subtitle: 'Overview of multi-platform performance metrics', category: 'Overview' },
  '/content-analytics': { title: 'Content Analytics', subtitle: 'Deep dive into content engagement, views, and reach', category: 'Analytics' },
  '/analytics': { title: 'Content Analytics', subtitle: 'Deep dive into content engagement, views, and reach', category: 'Analytics' },
  '/audience-analytics': { title: 'Audience Analytics', subtitle: 'Demographics, location, and follower distribution', category: 'Analytics' },
  '/audience': { title: 'Audience Analytics', subtitle: 'Demographics, location, and follower distribution', category: 'Analytics' },
  '/growth-trends': { title: 'Growth & Trends', subtitle: 'Historical audience growth and reach trajectories', category: 'Analytics' },
  '/growth': { title: 'Growth & Trends', subtitle: 'Historical audience growth and reach trajectories', category: 'Analytics' },
  '/revenue': { title: 'Revenue Analytics', subtitle: 'Track earnings across sponsorships, ads, and affiliate streams', category: 'Financials' },
  '/sponsorships': { title: 'Sponsorships Pipeline', subtitle: 'Manage brand deals, contracts, and payment statuses', category: 'Financials' },
  '/notifications': { title: 'Notification Center', subtitle: 'System alerts, performance updates, and activity logs', category: 'Operations' },
  '/reports': { title: 'Reports & Exports', subtitle: 'Generate and export PDF/Excel analytical reports', category: 'Operations' },
  '/content': { title: 'My Content Library', subtitle: 'Catalogue and inspect published cross-platform content', category: 'Content' },
  '/content-comparison': { title: 'Content Comparison', subtitle: 'Benchmark posts against each other', category: 'Content' },
  '/agency': { title: 'Agency Management', subtitle: 'Manage assigned creators and roster portfolios', category: 'Agency' },
  '/social-connections': { title: 'Connected Apps', subtitle: 'Social platforms, connection statuses, and credentials', category: 'Integrations' },
  '/social': { title: 'Connected Apps', subtitle: 'Social platforms, connection statuses, and credentials', category: 'Integrations' },
  '/social-media': { title: 'Connected Apps', subtitle: 'Social platforms, connection statuses, and credentials', category: 'Integrations' },
  '/profile': { title: 'User Profile', subtitle: 'Personal details, bio, and social channel URLs', category: 'Settings' },
  '/settings': { title: 'Account Settings', subtitle: 'Email, password, and security preferences', category: 'Settings' },
}

export default function MainLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Filter links for current role
  const links = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role))

  // Fetch unread count
  useEffect(() => {
    let isMounted = true
    const fetchUnread = async () => {
      try {
        const res = await notificationApi.unreadCount()
        if (isMounted) {
          setUnreadCount(res.data.unread_count ?? 0)
        }
      } catch {
        /* silent */
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 60_000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [location.pathname])

  // Get current page metadata
  const currentRouteMeta = ROUTE_TITLES[location.pathname] || {
    title: 'Workspace',
    subtitle: 'CreatorIQ Analytics Suite',
    category: 'Dashboard',
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans antialiased">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-white border-r border-slate-200/80 text-slate-900 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 mb-6">
            <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs group-hover:bg-slate-800 transition-colors">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
                  CreatorIQ
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Analytics SaaS
                </span>
              </div>
            </NavLink>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Menu
            </p>
            {links.map((link) => {
              const Icon = link.icon
              const isNotif = link.path === '/notifications'

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 relative ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
                      <span className="flex-1 truncate">{link.label}</span>
                      {isNotif && unreadCount > 0 && (
                        <span
                          className={`ml-auto flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                            isActive ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white'
                          }`}
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-extrabold text-white shrink-0">
              {(user?.full_name || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-medium text-slate-500 capitalize">{user?.role}</span>
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 py-3.5 backdrop-blur-md lg:px-8">
          {/* Left Title & Mobile Menu */}
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <span>{currentRouteMeta.category}</span>
                <span>/</span>
                <span className="text-slate-800">{currentRouteMeta.title}</span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                {currentRouteMeta.title}
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Current Month Badge */}
            <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              <span>{new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Notification Bell */}
            <NavLink
              to="/notifications"
              className="relative flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-2xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-1 pr-2 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-extrabold text-white">
                  {(user?.full_name || 'U').slice(0, 1).toUpperCase()}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg z-50 animate-fade-in"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="mt-1 inline-block text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {user?.role}
                    </span>
                  </div>
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 mt-1"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>My Profile</span>
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Account Settings</span>
                  </NavLink>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

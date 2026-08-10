import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Share2,
  ShieldAlert,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/roles'

type NavItem = { label: string; path: string; roles: string[]; icon: typeof LayoutDashboard }

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: LayoutDashboard },
  { label: 'Content Analytics', path: '/content-analytics', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: BarChart3 },
  { label: 'My Content', path: '/content', roles: [ROLES.CREATOR, ROLES.ADMIN], icon: FileText },
  { label: 'Content Comparison', path: '/content-comparison', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: ArrowLeftRight },
  { label: 'Agency Creators', path: '/agency', roles: [ROLES.AGENCY, ROLES.ADMIN], icon: Users },
  { label: 'Social Media', path: '/social-connections', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.ADMIN], icon: Share2 },
  { label: 'Profile', path: '/profile', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: User },
  { label: 'Account Settings', path: '/settings', roles: [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN], icon: Settings },
]

export default function MainLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const links = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* White Minimalist Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between bg-white border-r border-slate-200/80 text-slate-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col px-6 py-6 overflow-y-auto">
          {/* Logo & Mobile Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  CreatorIQ
                </span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">System Active</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Active User Scope Card */}
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workspace User</p>
            <p className="mt-0.5 text-sm font-extrabold text-slate-900 truncate">{user?.full_name}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-700">
                {user?.role}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Scope Active" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main Navigation</p>
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer Sign Out */}
        <div className="p-6 border-t border-slate-200/80 space-y-3">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-500">Workspace Dashboard</p>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {user?.full_name ? `Welcome, ${user.full_name}` : 'Welcome back'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              <span>May 2026</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-extrabold text-white">
                  {(user?.full_name || 'U').slice(0, 1).toUpperCase()}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-card-hover z-50 animate-fade-in"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="mt-1 inline-block text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {user?.role}
                    </span>
                  </div>
                  <NavLink to="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 mt-1">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>My Profile</span>
                  </NavLink>
                  <NavLink to="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Account Settings</span>
                  </NavLink>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

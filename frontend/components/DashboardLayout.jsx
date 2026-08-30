import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  User, 
  LogOut, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function DashboardLayout({ user, onLogout }) {
  const navigate = useNavigate();

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogoutClick = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Content Manager', path: '/content', icon: FileText },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'Profile Settings', path: '/profile', icon: User },
  ];

  const userName = user?.full_name || user?.name || 'Creator';
  const userRole = user?.role || 'CREATOR';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div style={styles.appShell}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div>
          {/* Brand Header */}
          <div style={styles.brandContainer}>
            <div style={styles.brandIconWrapper}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <span style={styles.brandName}>CreatorIQ</span>
          </div>

          {/* Nav Links */}
          <nav style={styles.navGroup}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout at Sidebar Bottom */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userCard}>
            <div style={styles.avatar}>{userInitials}</div>
            <div style={styles.userInfo}>
              <p style={styles.userNameText}>{userName}</p>
              <div style={styles.roleBadge}>
                {userRole === 'ADMIN' && <ShieldCheck size={12} color="#2563eb" />}
                <span>{userRole}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogoutClick} 
            style={styles.logoutButton}
            title="Sign out of account"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.mainWrapper}>
        {/* Top Navigation Bar */}
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.greetingTitle}>
              {getGreeting()}, <span style={styles.highlightName}>{userName}</span> 👋
            </h1>
            <p style={styles.subtitle}>
              Here is your multi-platform performance summary for today.
            </p>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main style={styles.contentBody}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  appShell: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#0f172a',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.5rem 1rem',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem',
    marginBottom: '2rem',
  },
  brandIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.025em',
    color: '#0f172a',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#64748b',
    textDecoration: 'none',
    transition: 'all 0.15s ease-in-out',
  },
  navLinkActive: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontWeight: '600',
  },
  sidebarFooter: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    borderRadius: '6px',
    backgroundColor: '#f8fafc',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userNameText: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.625rem 0.75rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
  },
  mainWrapper: {
    marginLeft: '260px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topBar: {
    height: '76px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 5,
  },
  greetingTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  highlightName: {
    color: '#2563eb',
  },
  subtitle: {
    margin: '0.125rem 0 0 0',
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  contentBody: {
    padding: '2rem',
    flex: 1,
  },
};
// src/App.jsx
import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  HandCoins,
  Bell,
  FileText,
  UserRound,
  LogOut,
} from 'lucide-react';

import DashboardOverview from './pages/DashboardOverview.jsx';
import ContentManager from './pages/ContentManager.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Content Analytics', path: '/content', icon: BarChart3 },
  { label: 'Audience Analytics', path: '/audience', icon: Users },
  { label: 'Growth & Trends', path: '/growth', icon: TrendingUp },
  { label: 'Revenue', path: '/revenue', icon: DollarSign },
  { label: 'Sponsorships', path: '/sponsorships', icon: HandCoins },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Profile', path: '/profile', icon: UserRound },
];

function StructuredSectionPage({ title, subtitle, metrics = [], insights = [], tableRows = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div style={{
        background: '#fff',
        borderRadius: '18px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        maxWidth: '1120px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
              CreatorIQ
            </p>
            <h2 style={{ margin: '0.7rem 0 0.4rem', fontSize: '2rem', color: '#0f172a' }}>{title}</h2>
          </div>

          <div style={{
            background: '#eff6ff',
            color: '#1d4ed8',
            borderRadius: '999px',
            padding: '0.55rem 0.9rem',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}>
            Updated today
          </div>
        </div>

        <p style={{ margin: '0.8rem 0 0', color: '#475569', fontSize: '1rem' }}>{subtitle}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', maxWidth: '1120px' }}>
        {metrics.map(([label, value, tone = '#2563eb']) => (
          <div key={label} style={{ background: '#fff', borderRadius: '14px', padding: '1.1rem 1rem', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.05)', borderTop: `4px solid ${tone}` }}>
            <div style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            <div style={{ marginTop: '0.65rem', fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', maxWidth: '1120px' }}>
        <div style={{ background: '#fff', borderRadius: '18px', padding: '1.5rem 1.25rem', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#0f172a' }}>Key highlights</h3>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', lineHeight: '1.9' }}>
            {insights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div style={{ background: '#fff', borderRadius: '18px', padding: '1.5rem 1.25rem', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#0f172a' }}>Recent activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tableRows.map(([label, value, strength], index) => (
              <div key={`${label}-${index}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.3rem', color: '#334155', fontSize: '0.92rem' }}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${strength}%`, height: '100%', background: index % 2 === 0 ? '#2563eb' : '#10b981', borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Protected Layout Frame
function DashboardLayout({ children, onLogout }) {
  return (
    <div style={styles.appWrapper}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <span style={styles.brandTitle}>CreatorIQ</span>
          </div>

          <nav style={styles.navGroup}>
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={label}
                to={path}
                end={path === '/dashboard'}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  ...(isActive ? styles.navActive : {}),
                })}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <button onClick={onLogout} style={styles.sidebarLogout}>
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      <main style={styles.mainContent}>{children}</main>
    </div>
  );
}

// Route Guard Component
function ProtectedRoute({ isAuthenticated, children, onLogout }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout onLogout={onLogout}>{children}</DashboardLayout>;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token')
  );

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Protected Application Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <DashboardOverview />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/content" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <ContentManager />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/audience"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <StructuredSectionPage
                title="Audience Analytics"
                subtitle="Your strongest audience segments, engagement quality, and geographic reach are summarized below."
                metrics={[
                  ['Audience size', '184.2K', '#2563eb'],
                  ['Avg. engagement', '7.8%', '#10b981'],
                  ['Top country', 'United States', '#8b5cf6'],
                  ['Repeat viewers', '42%', '#f59e0b'],
                ]}
                insights={[
                  'Women ages 25-34 are the largest segment across YouTube and Instagram.',
                  'The United States drives the highest engagement rate and strongest repeat-viewer behavior.',
                  'Short-form content is converting best for saves and shares, especially in the 18-24 cohort.',
                ]}
                tableRows={[
                  ['US audience', '68%', 68],
                  ['UK audience', '52%', 52],
                  ['Canada reach', '46%', 46],
                  ['Female segment', '61%', 61],
                ]}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/growth"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <StructuredSectionPage
                title="Growth & Trends"
                subtitle="Follower growth and performance trends show how your content momentum is evolving over time."
                metrics={[
                  ['Monthly growth', '+18.4%', '#10b981'],
                  ['Follower gain', '+24.6K', '#2563eb'],
                  ['Best performing week', 'Week 4', '#8b5cf6'],
                  ['Content velocity', '14 posts', '#f59e0b'],
                ]}
                insights={[
                  'Follower growth accelerated after your creator-led product feature content launched.',
                  'Total views increased 21% in the last 30 days compared with the previous period.',
                  'Instagram Reels and YouTube Shorts are outperforming static posts by the largest margin.',
                ]}
                tableRows={[
                  ['Follower lift', '+18.4%', 84],
                  ['View velocity', '21%', 75],
                  ['Brand recall', '67%', 67],
                  ['Trend momentum', '88%', 88],
                ]}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/revenue"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <StructuredSectionPage
                title="Revenue"
                subtitle="This section tracks your monetization streams and performance against recent campaigns."
                metrics={[
                  ['Net revenue', '$42.8K', '#10b981'],
                  ['Affiliate sales', '$12.1K', '#2563eb'],
                  ['Brand deals', '$18.7K', '#8b5cf6'],
                  ['Conversion rate', '3.4%', '#f59e0b'],
                ]}
                insights={[
                  'Affiliate revenue is strongest on educational and creator-tool content.',
                  'Brand sponsorships contributed the largest share of total income this quarter.',
                  'Campaign performance is improving after tightening the audience-fit and CTA strategy.',
                ]}
                tableRows={[
                  ['Affiliate', '$12.1K', 58],
                  ['Brand deals', '$18.7K', 72],
                  ['Merch', '$7.4K', 40],
                  ['Paid content', '$4.6K', 33],
                ]}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sponsorships"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <StructuredSectionPage
                title="Sponsorships"
                subtitle="Current and upcoming brand opportunities are tracked here with deal value and deliverables."
                metrics={[
                  ['Active deals', '6', '#8b5cf6'],
                  ['Avg. deal', '$8.7K', '#2563eb'],
                  ['Completed deals', '4', '#10b981'],
                  ['Renewal rate', '75%', '#f59e0b'],
                ]}
                insights={[
                  'Top-performing brand fit remains in lifestyle, wellness, and creator-education categories.',
                  'Three deals are pending approval and one is in final contract review.',
                  'Average sponsor retention has improved after building a stronger content package mix.',
                ]}
                tableRows={[
                  ['Wellness', '2 deals', 78],
                  ['Tech', '2 deals', 74],
                  ['Lifestyle', '1 deal', 63],
                  ['Education', '1 deal', 58],
                ]}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <StructuredSectionPage
                title="Notifications"
                subtitle="Recent updates, approvals, and performance triggers are grouped here for quick action."
                metrics={[
                  ['Unread', '12', '#ef4444'],
                  ['Needs action', '3', '#f59e0b'],
                  ['Approved', '8', '#10b981'],
                  ['New alerts', '5', '#2563eb'],
                ]}
                insights={[
                  'One sponsorship contract needs your approval before Friday.',
                  'Two campaign reports are ready for review and download from the Reports section.',
                  'Platform performance alerts are active for a notable spike in YouTube engagement this week.',
                ]}
                tableRows={[
                  ['Pending approvals', '3 items', 44],
                  ['New comments', '5 items', 68],
                  ['Campaign alerts', '2 items', 58],
                  ['Market updates', '4 items', 62],
                ]}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <StructuredSectionPage
                title="Reports"
                subtitle="Export your key metrics and executive view as a PDF or Excel sheet for sharing and planning."
                metrics={[
                  ['Executive PDF', 'Ready', '#2563eb'],
                  ['Excel workbook', 'Ready', '#10b981'],
                  ['Last export', 'Today', '#8b5cf6'],
                  ['Report types', '3', '#f59e0b'],
                ]}
                insights={[
                  'The PDF report captures total views, likes, comments, revenue, and sponsorship summary in one view.',
                  'The Excel workbook is suitable for deeper analysis, sharing with your team, or downstream reporting.',
                  'Use the export buttons in the dashboard to download the latest files instantly.',
                ]}
                tableRows={[
                  ['Executive overview', 'PDF ready', 92],
                  ['Performance workbook', 'XLSX ready', 90],
                  ['Campaign summary', 'Prepared', 76],
                  ['Quarter review', 'Draft', 53],
                ]}
              />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <Profile onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

const styles = {
  appWrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#071827',
    color: '#e2e8f0',
    padding: '1.5rem 1rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRight: '1px solid #0e2238',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem 1.5rem',
    marginBottom: '0.5rem',
  },
  brandTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: '-0.04em',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    marginTop: '0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.9rem 0.8rem',
    borderRadius: '0.5rem',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '1.15rem',
    fontWeight: '500',
    backgroundColor: 'transparent',
    borderLeft: '3px solid transparent',
    transition: 'all 0.2s ease',
  },
  navActive: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    color: '#f8fafc',
    fontWeight: '600',
    borderLeft: '3px solid #5fa8ff',
  },
  sidebarLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 0.875rem',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fca5a5',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  mainContent: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
};
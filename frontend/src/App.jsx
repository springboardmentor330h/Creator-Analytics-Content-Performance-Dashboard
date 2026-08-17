import React, { useState, useEffect } from 'react';
import StatCard from './components/StatCard';
import LineChart from './components/LineChart';
import DeviceChart from './components/DeviceChart';
import AgeChart from './components/AgeChart';
import TopCountries from './components/TopCountries';
import AudienceModal from './components/AudienceModal';
import ContentModal from './components/ContentModal';
import AuthView from './pages/AuthView';
import { api } from './api';
import { formatNumber, rawNumber } from './utils/format';
import { Plus, Edit2, Trash2, RefreshCw, LogOut, User as UserIcon } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Backend States (Realtime Data Only)
  const [summary, setSummary] = useState(null);
  const [audienceReport, setAudienceReport] = useState(null);
  const [audienceRecords, setAudienceRecords] = useState([]);
  const [contents, setContents] = useState([]);
  const [growthTrends, setGrowthTrends] = useState([]);
  const [audienceTrends, setAudienceTrends] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals for CRUD
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [editingAudience, setEditingAudience] = useState(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  // Check login session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('creatoriq_token');
    const savedUser = localStorage.getItem('creatoriq_user');
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser({ email: 'creator@creatoriq.com' });
      }
    }
  }, []);

  // Fetch all realtime backend data
  const fetchAllBackendData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, audReportRes, audRecsRes, contentRes, growthRes, trendsRes] = await Promise.all([
        api.getDashboardSummary().catch(() => null),
        api.getAudienceReport().catch(() => null),
        api.getAudience().catch(() => []),
        api.getContent().catch(() => []),
        api.getGrowthReport().catch(() => []),
        api.getAudienceTrends().catch(() => [])
      ]);

      setSummary(sumRes);
      setAudienceReport(audReportRes);
      setAudienceRecords(Array.isArray(audRecsRes) ? audRecsRes : []);
      setContents(Array.isArray(contentRes) ? contentRes : []);
      setGrowthTrends(Array.isArray(growthRes) ? growthRes : []);
      setAudienceTrends(Array.isArray(trendsRes) ? trendsRes : []);
    } catch (err) {
      setError(err.message || 'Failed to connect to CreatorIQ backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBackendData();
  }, []);

  const handleLoginSuccess = (email) => {
    setUser({ email });
    setShowAuthModal(false);
    fetchAllBackendData();
  };

  const handleLogout = () => {
    localStorage.removeItem('creatoriq_token');
    localStorage.removeItem('creatoriq_user');
    setUser(null);
  };

  // Audience Handlers
  const handleSaveAudience = async (data) => {
    try {
      if (editingAudience) {
        await api.updateAudience(editingAudience.id, data);
      } else {
        await api.createAudience(data);
      }
      await fetchAllBackendData();
    } catch (err) {
      alert(`Backend Error: ${err.message}`);
    }
  };

  const handleDeleteAudience = async (id) => {
    if (!window.confirm('Delete this audience record?')) return;
    try {
      await api.deleteAudience(id);
      await fetchAllBackendData();
    } catch (err) {
      alert(`Backend Error: ${err.message}`);
    }
  };

  // Content Handlers
  const handleSaveContent = async (data) => {
    try {
      if (editingContent) {
        await api.updateContent(editingContent.id, data);
      } else {
        await api.createContent(data);
      }
      await fetchAllBackendData();
    } catch (err) {
      alert(`Backend Error: ${err.message}`);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Delete this content record?')) return;
    try {
      await api.deleteContent(id);
      await fetchAllBackendData();
    } catch (err) {
      alert(`Backend Error: ${err.message}`);
    }
  };

  const totalFollowers = summary?.total_followers ?? audienceReport?.total_followers ?? 0;
  const totalReach = summary?.total_reach ?? audienceReport?.total_reach ?? 0;
  const totalImpressions = audienceReport?.total_impressions ?? 0;
  const avgEngagement = summary?.average_engagement_rate ?? 0;

  return (
    <div className="page-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="brand-box">
          <span className="brand-logo">IQ</span>
          <span className="brand-title">CreatorIQ Dashboard</span>
        </div>

        <nav className="nav-links">
          <a href="#summary" className="nav-btn">Summary</a>
          <a href="#trends" className="nav-btn">Trends</a>
          <a href="#audience" className="nav-btn">Audience</a>
          <a href="#content" className="nav-btn">Content</a>
          <a href="#growth" className="nav-btn">Growth</a>
        </nav>

        <div className="user-box">
          {user ? (
            <>
              <div className="user-avatar">{user.email?.charAt(0).toUpperCase()}</div>
              <span>{user.email?.split('@')[0]}</span>
              <button className="nav-btn" onClick={handleLogout} style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                <LogOut size={14} style={{ marginRight: '4px' }} /> Logout
              </button>
            </>
          ) : (
            <button className="btn-add" onClick={() => setShowAuthModal(true)}>
              Sign In / Register
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
            <button
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: '#e5e7eb', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', zIndex: 100 }}
            >
              ✕
            </button>
            <AuthView onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      {/* Connection Error Banner */}
      {error && (
        <div className="section-card" style={{ backgroundColor: '#fee2e2', color: '#991b1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>Backend Error:</strong> {error}</span>
          <button className="btn-add" onClick={fetchAllBackendData}>Retry Backend</button>
        </div>
      )}

      {/* SECTION 1: STAT SUMMARY CARDS (Formatted with K, M, B and raw figure tooltips) */}
      <section id="summary" className="section-card">
        <div className="section-header">
          <h2 className="section-title">Overview Statistics (Hover for exact figures)</h2>
          <button className="nav-btn" onClick={fetchAllBackendData} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} /> Refresh Data
          </button>
        </div>

        <div className="stat-grid">
          <StatCard label="Total Followers" value={totalFollowers} trend="Realtime PostgreSQL" />
          <StatCard label="Total Organic Reach" value={totalReach} trend="Realtime PostgreSQL" />
          <StatCard label="Total Impressions" value={totalImpressions} trend="Realtime PostgreSQL" />
          <StatCard label="Avg Engagement Rate" value={`${avgEngagement}%`} trend="Realtime Calculation" />
        </div>
      </section>

      {/* SECTION 2: REALTIME TRENDS CHART */}
      <section id="trends">
        <LineChart title="Audience Growth & Reach Realtime Trends" data={audienceTrends} />
      </section>

      {/* SECTION 3: DEMOGRAPHICS GRID */}
      <div className="dashboard-layout">
        <DeviceChart title="Device Breakdown" distribution={audienceReport?.device_distribution} />
        <AgeChart title="Age Group Breakdown" distribution={audienceReport?.age_distribution} />
      </div>

      {/* SECTION 4: AUDIENCE DEMOGRAPHIC RECORDS TABLE */}
      <section id="audience" className="section-card">
        <div className="section-header">
          <h2 className="section-title">Audience Records (audience table)</h2>
          <button className="btn-add" onClick={() => { setEditingAudience(null); setIsAudienceModalOpen(true); }}>
            + Add Audience Record
          </button>
        </div>

        <div className="table-responsive">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Gender</th>
                <th>Age Group</th>
                <th>Location</th>
                <th>Device</th>
                <th>Active Hour</th>
                <th>Followers</th>
                <th>Reach</th>
                <th>Impressions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {audienceRecords && audienceRecords.length > 0 ? (
                audienceRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td>#{rec.id}</td>
                    <td>{rec.gender || 'N/A'}</td>
                    <td>{rec.age_group || 'N/A'}</td>
                    <td>{rec.country}, {rec.city}</td>
                    <td>{rec.device_type}</td>
                    <td>{rec.active_hour}:00 HRS</td>
                    <td className="has-tooltip" title={`Exact: ${rawNumber(rec.followers)}`}>
                      {formatNumber(rec.followers)}
                      <span className="number-tooltip">Raw: {rawNumber(rec.followers)}</span>
                    </td>
                    <td className="has-tooltip" title={`Exact: ${rawNumber(rec.reach)}`}>
                      {formatNumber(rec.reach)}
                      <span className="number-tooltip">Raw: {rawNumber(rec.reach)}</span>
                    </td>
                    <td className="has-tooltip" title={`Exact: ${rawNumber(rec.impressions)}`}>
                      {formatNumber(rec.impressions)}
                      <span className="number-tooltip">Raw: {rawNumber(rec.impressions)}</span>
                    </td>
                    <td>
                      <button className="btn-small btn-edit" onClick={() => { setEditingAudience(rec); setIsAudienceModalOpen(true); }}>Edit</button>
                      <button className="btn-small btn-delete" onClick={() => handleDeleteAudience(rec.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                    No audience records found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 5: CONTENT PERFORMANCE LIBRARY TABLE */}
      <section id="content" className="section-card">
        <div className="section-header">
          <h2 className="section-title">Content Performance Library (contents table)</h2>
          <button className="btn-add" onClick={() => { setEditingContent(null); setIsContentModalOpen(true); }}>
            + Create Content Item
          </button>
        </div>

        <div className="table-responsive">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Platform</th>
                <th>Title</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Reach</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contents && contents.length > 0 ? (
                contents.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td><strong>{item.platform}</strong></td>
                    <td>{item.content_title}</td>
                    <td className="has-tooltip" title={`Exact: ${rawNumber(item.views)}`}>
                      {formatNumber(item.views)}
                      <span className="number-tooltip">Raw: {rawNumber(item.views)}</span>
                    </td>
                    <td className="has-tooltip" title={`Exact: ${rawNumber(item.likes)}`}>
                      {formatNumber(item.likes)}
                      <span className="number-tooltip">Raw: {rawNumber(item.likes)}</span>
                    </td>
                    <td className="has-tooltip" title={`Exact: ${rawNumber(item.comments)}`}>
                      {formatNumber(item.comments)}
                      <span className="number-tooltip">Raw: {rawNumber(item.comments)}</span>
                    </td>
                    <td className="has-tooltip" title={`Exact: ${rawNumber(item.reach)}`}>
                      {formatNumber(item.reach)}
                      <span className="number-tooltip">Raw: {rawNumber(item.reach)}</span>
                    </td>
                    <td>{item.published_date || 'N/A'}</td>
                    <td>
                      <button className="btn-small btn-edit" onClick={() => { setEditingContent(item); setIsContentModalOpen(true); }}>Edit</button>
                      <button className="btn-small btn-delete" onClick={() => handleDeleteContent(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                    No content records found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 6: 30-DAY HISTORICAL GROWTH TABLE */}
      <section id="growth" className="section-card">
        <div className="section-header">
          <h2 className="section-title">30-Day Historical Growth Log (growth table)</h2>
        </div>

        <div className="table-responsive">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Followers</th>
                <th>Reach</th>
                <th>Daily Growth</th>
                <th>Growth Percentage</th>
              </tr>
            </thead>
            <tbody>
              {growthTrends && growthTrends.length > 0 ? (
                growthTrends.map((g, idx) => (
                  <tr key={idx}>
                    <td>{g.date}</td>
                    <td className="has-tooltip" title={`Exact: ${rawNumber(g.followers)}`}>
                      {formatNumber(g.followers)}
                      <span className="number-tooltip">Raw: {rawNumber(g.followers)}</span>
                    </td>
                    <td className="has-tooltip" title={`Exact: ${rawNumber(g.reach)}`}>
                      {formatNumber(g.reach)}
                      <span className="number-tooltip">Raw: {rawNumber(g.reach)}</span>
                    </td>
                    <td>+{formatNumber(g.daily_growth || 0)}</td>
                    <td>{g.growth_percentage || 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                    No historical growth logs found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CRUD Modals */}
      <AudienceModal
        isOpen={isAudienceModalOpen}
        onClose={() => setIsAudienceModalOpen(false)}
        onSave={handleSaveAudience}
        initialData={editingAudience}
      />

      <ContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSave={handleSaveContent}
        initialData={editingContent}
      />
    </div>
  );
}

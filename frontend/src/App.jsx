import React, { useState, useEffect } from 'react';
import StatCard from './components/StatCard';
import LineChart from './components/LineChart';
import DeviceChart from './components/DeviceChart';
import AgeChart from './components/AgeChart';
import TopCountries from './components/TopCountries';
import AudienceModal from './components/AudienceModal';
import ContentModal from './components/ContentModal';
import YouTubeSyncModal from './components/YouTubeSyncModal';
import PlatformReachBreakdown from './components/PlatformReachBreakdown';
import PlatformComparison from './components/PlatformComparison';
import PlatformPieChart from './components/PlatformPieChart';
import PlatformBarChart from './components/PlatformBarChart';
import SocialConnectModal from './components/SocialConnectModal';
import AnalyticsChart from './components/AnalyticsChart';
import AuthView from './pages/AuthView';
import ContentView from './pages/ContentView';
import GrowthView from './pages/GrowthView';
import { YoutubeIcon } from './components/PlatformIcons';
import { api } from './api';
import { formatNumber, rawNumber } from './utils/format';
import { Plus, Edit2, Trash2, RefreshCw, LogOut, User as UserIcon, Filter, Link2, BarChart2 } from 'lucide-react';

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
  const [reachBreakdown, setReachBreakdown] = useState(null);

  // Sprint 4 Chart & Social Media States
  const [engagementChartData, setEngagementChartData] = useState(null);
  const [followerGrowthChartData, setFollowerGrowthChartData] = useState(null);
  const [platformComparison, setPlatformComparison] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  // Platform Filter State
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [editingAudience, setEditingAudience] = useState(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

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
      const [
        sumRes,
        audReportRes,
        audRecsRes,
        contentRes,
        growthRes,
        trendsRes,
        reachRes,
        engChartRes,
        folChartRes,
        platCompRes,
        connPlatRes
      ] = await Promise.all([
        api.getDashboardSummary().catch(() => null),
        api.getAudienceReport().catch(() => null),
        api.getAudience().catch(() => []),
        api.getContent().catch(() => []),
        api.getGrowthReport().catch(() => []),
        api.getAudienceTrends().catch(() => []),
        api.getReachBreakdown().catch(() => null),
        api.getEngagementChart().catch(() => null),
        api.getFollowerGrowthChart().catch(() => null),
        api.getPlatformComparison().catch(() => null),
        api.getConnectedSocialPlatforms().catch(() => null)
      ]);

      setSummary(sumRes);
      setAudienceReport(audReportRes);
      setAudienceRecords(Array.isArray(audRecsRes) ? audRecsRes : []);
      setContents(Array.isArray(contentRes) ? contentRes : []);
      setGrowthTrends(Array.isArray(growthRes) ? growthRes : []);
      setAudienceTrends(Array.isArray(trendsRes) ? trendsRes : []);
      setReachBreakdown(reachRes);
      setEngagementChartData(engChartRes);
      setFollowerGrowthChartData(folChartRes);
      setPlatformComparison(platCompRes);
      if (connPlatRes && connPlatRes.platforms) {
        setConnectedPlatforms(connPlatRes.platforms);
      }
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

  const handleSyncYouTube = async (channelId) => {
    const res = await api.syncYouTube(channelId);
    await fetchAllBackendData();
    return res;
  };

  const handleConnectSocial = async (platform, accountName) => {
    const res = await api.connectSocialPlatform(platform, accountName);
    await fetchAllBackendData();
    return res;
  };

  const handleSyncSocial = async (platform) => {
    const res = await api.syncSocialPlatform(platform);
    await fetchAllBackendData();
    return res;
  };

  // Audience Handlers
  const handleSaveAudience = async (data, targetId = null) => {
    try {
      const recordId = targetId || data?.id || editingAudience?.id;
      if (recordId) {
        const { id, ...payload } = data;
        await api.updateAudience(recordId, payload);
      } else {
        await api.createAudience(data);
      }
      setEditingAudience(null);
      setIsAudienceModalOpen(false);
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
  const handleSaveContent = async (data, targetId = null) => {
    try {
      const recordId = targetId || data?.id || editingContent?.id;
      if (recordId) {
        const { id, ...payload } = data;
        await api.updateContent(recordId, payload);
      } else {
        await api.createContent(data);
      }
      setEditingContent(null);
      setIsContentModalOpen(false);
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

  const totalViews = summary?.total_views ?? 0;
  const totalLikes = summary?.total_likes ?? 0;
  const totalComments = summary?.total_comments ?? 0;
  const totalShares = summary?.total_shares ?? 0;
  const totalReach = summary?.total_reach ?? reachBreakdown?.combined_total_reach ?? 0;
  const totalFollowers = summary?.total_followers ?? audienceReport?.total_followers ?? 0;
  const avgEngagement = summary?.average_engagement_rate ?? 0;
  const totalContent = summary?.total_content ?? (contents || []).length;
  const bestPlatform = summary?.best_platform || 'YouTube';
  const topContentTitle = summary?.top_content || 'N/A';

  return (
    <div className="page-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="brand-box">
          <span className="brand-logo">IQ</span>
          <div>
            <span className="brand-title">Creator Analytics Pro</span>
            <span style={{ display: 'block', fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
              ● Live Analytics Engine
            </span>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#visualizations" className="nav-btn">Charts</a>
          <a href="#summary" className="nav-btn">Executive Summary</a>
          <a href="#comparison" className="nav-btn">Comparison</a>
          <a href="#trends" className="nav-btn">Trends</a>
          <a href="#content" className="nav-btn">Content</a>
          <a href="#growth" className="nav-btn">Growth</a>
        </nav>

        <div className="user-box">
          <button
            className="nav-btn"
            onClick={() => setIsSocialModalOpen(true)}
            style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Link2 size={16} /> Social Connect & Sync
          </button>

          <button
            className="nav-btn"
            onClick={() => setIsYouTubeModalOpen(true)}
            style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <YoutubeIcon size={16} color="#dc2626" /> Sync YouTube
          </button>

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

      {/* SECTION 0: INDIVIDUAL PLATFORM REACH VS COMBINED REACH BREAKDOWN */}
      <section id="reach-breakdown" className="section-card">
        <PlatformReachBreakdown
          reachBreakdown={reachBreakdown}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
        />
      </section>

      {/* SECTION 0.5: DONUT & BAR GRAPH VISUALIZATIONS GRID */}
      <section id="visualizations" className="dashboard-layout">
        <PlatformPieChart
          reachBreakdown={reachBreakdown}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
        />
        <PlatformBarChart
          platformComparison={platformComparison}
        />
      </section>

      {/* Executive Overview & KPI Summary */}
      <section id="summary" className="section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="#2563eb" />
              <span>Executive Overview & Key Performance Indicators</span>
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Realtime aggregated analytics summary from GET /analytics/summary
            </p>
          </div>
          <button className="nav-btn" onClick={fetchAllBackendData} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} /> Refresh Overview
          </button>
        </div>

        {/* Top Highlight Banner: Best Platform & Top Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px'
            }}>
              🔥
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
                Top Performing Platform
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                {bestPlatform}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px'
            }}>
              🏆
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                Top Performing Content
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#064e3b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {topContentTitle}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              backgroundColor: '#d97706',
              color: '#ffffff',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px'
            }}>
              📚
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Published Items
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#78350f', marginTop: '2px' }}>
                {totalContent} Posts / Videos
              </div>
            </div>
          </div>
        </div>

        {/* 8-Card Stat Grid */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <StatCard label="Total Views" value={totalViews} trend="Live Stream" />
          <StatCard label="Total Likes" value={totalLikes} trend="Reactions" />
          <StatCard label="Total Comments" value={totalComments} trend="Feedback" />
          <StatCard label="Total Shares" value={totalShares} trend="Virality" />
          <StatCard label="Total Organic Reach" value={totalReach} trend="Audience Reach" />
          <StatCard label="Total Followers" value={totalFollowers} trend="Community" />
          <StatCard label="Avg Engagement Rate" value={`${avgEngagement}%`} trend="Overall Rate" />
          <StatCard label="Total Content" value={totalContent} trend="Library Items" />
        </div>
      </section>

      {/* SECTION 2: SPRINT 4 PLATFORM COMPARISON ANALYTICS */}
      <section id="comparison">
        <PlatformComparison platformComparison={platformComparison} />
      </section>

      {/* SECTION 3: REALTIME TRENDS CHART & SPRINT 4 CHARTS */}
      <section id="trends" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AnalyticsChart engagementData={engagementChartData} followerGrowthData={followerGrowthChartData} />
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

      {/* SECTION 5: CONTENT PERFORMANCE LIBRARY */}
      <section id="content">
        <ContentView
          contents={contents}
          onAdd={handleSaveContent}
          onUpdate={(id, data) => handleSaveContent({ ...data, id })}
          onDelete={handleDeleteContent}
          onSyncYouTube={handleSyncYouTube}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
        />
      </section>

      {/* SECTION 6: 30-DAY HISTORICAL GROWTH LOG */}
      <section id="growth" className="section-card">
        <GrowthView
          growthTrends={growthTrends}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
        />
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

      <YouTubeSyncModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
        onSync={handleSyncYouTube}
      />

      <SocialConnectModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        onConnect={handleConnectSocial}
        onSync={handleSyncSocial}
        connectedPlatforms={connectedPlatforms}
      />
    </div>
  );
}

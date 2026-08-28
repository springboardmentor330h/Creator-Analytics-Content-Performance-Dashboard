import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';

import DashboardView from './pages/DashboardView';
import ContentView from './pages/ContentView';
import AudienceView from './pages/AudienceView';
import GrowthView from './pages/GrowthView';
import RevenueView from './pages/RevenueView';
import NotificationsView from './pages/NotificationsView';
import ReportsView from './pages/ReportsView';
import SettingsView from './pages/SettingsView';
import AuthView from './pages/AuthView';

import AudienceModal from './components/AudienceModal';
import ContentModal from './components/ContentModal';
import YouTubeSyncModal from './components/YouTubeSyncModal';
import SocialConnectModal from './components/SocialConnectModal';
import RevenueModal from './components/RevenueModal';
import SponsorshipModal from './components/SponsorshipModal';

import { api } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

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

  // Sprint 6 Revenue & Sponsorship States
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [revenueRecords, setRevenueRecords] = useState([]);
  const [sponsorshipRecords, setSponsorshipRecords] = useState([]);

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

  // Sprint 6 Modals
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState(null);

  const [isSponsorshipModalOpen, setIsSponsorshipModalOpen] = useState(false);
  const [editingSponsorship, setEditingSponsorship] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

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
        connPlatRes,
        revSumRes,
        revListRes,
        spListRes
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
        api.getConnectedSocialPlatforms().catch(() => null),
        api.getRevenueSummary().catch(() => null),
        api.getRevenue().catch(() => []),
        api.getSponsorships().catch(() => [])
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

      setRevenueSummary(revSumRes);
      setRevenueRecords(Array.isArray(revListRes) ? revListRes : []);
      setSponsorshipRecords(Array.isArray(spListRes) ? spListRes : []);

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
    showToast(`Welcome back, ${email.split('@')[0]}!`, 'success');
    fetchAllBackendData();
  };

  const handleLogout = () => {
    localStorage.removeItem('creatoriq_token');
    localStorage.removeItem('creatoriq_user');
    setUser(null);
    showToast('Signed out successfully', 'info');
  };

  const handleSyncYouTube = async (channelId) => {
    try {
      const res = await api.syncYouTube(channelId);
      await fetchAllBackendData();
      showToast('YouTube channel metrics synced successfully!', 'success');
      return res;
    } catch (err) {
      showToast(`YouTube Sync Error: ${err.message}`, 'error');
    }
  };

  const handleConnectSocial = async (platform, accountName) => {
    try {
      const res = await api.connectSocialPlatform(platform, accountName);
      await fetchAllBackendData();
      showToast(`${platform} channel connected!`, 'success');
      return res;
    } catch (err) {
      showToast(`Connection Error: ${err.message}`, 'error');
    }
  };

  const handleSyncSocial = async (platform) => {
    try {
      const res = await api.syncSocialPlatform(platform);
      await fetchAllBackendData();
      showToast(`${platform} data refreshed!`, 'success');
      return res;
    } catch (err) {
      showToast(`Sync Error: ${err.message}`, 'error');
    }
  };

  // Audience Handlers
  const handleSaveAudience = async (data, targetId = null) => {
    try {
      const recordId = targetId || data?.id || editingAudience?.id;
      if (recordId) {
        const { id, ...payload } = data;
        await api.updateAudience(recordId, payload);
        showToast('Audience demographic record updated!', 'success');
      } else {
        await api.createAudience(data);
        showToast('New audience demographic record created!', 'success');
      }
      setEditingAudience(null);
      setIsAudienceModalOpen(false);
      await fetchAllBackendData();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteAudience = async (id) => {
    if (!window.confirm('Delete this audience record?')) return;
    try {
      await api.deleteAudience(id);
      await fetchAllBackendData();
      showToast('Audience record deleted', 'info');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Content Handlers
  const handleSaveContent = async (data, targetId = null) => {
    try {
      const recordId = targetId || data?.id || editingContent?.id;
      if (recordId) {
        const { id, ...payload } = data;
        await api.updateContent(recordId, payload);
        showToast('Content item updated successfully!', 'success');
      } else {
        await api.createContent(data);
        showToast('New content item published to library!', 'success');
      }
      setEditingContent(null);
      setIsContentModalOpen(false);
      await fetchAllBackendData();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Delete this content record?')) return;
    try {
      await api.deleteContent(id);
      await fetchAllBackendData();
      showToast('Content record removed', 'info');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Sprint 6 Revenue Handlers
  const handleSaveRevenue = async (data, targetId = null) => {
    try {
      const recordId = targetId || data?.id || editingRevenue?.id;
      if (recordId) {
        const { id, ...payload } = data;
        await api.updateRevenue(recordId, payload);
        showToast('Revenue record updated!', 'success');
      } else {
        await api.createRevenue(data);
        showToast('New revenue stream entry saved!', 'success');
      }
      setEditingRevenue(null);
      setIsRevenueModalOpen(false);
      await fetchAllBackendData();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteRevenue = async (id) => {
    if (!window.confirm('Delete this revenue record?')) return;
    try {
      await api.deleteRevenue(id);
      await fetchAllBackendData();
      showToast('Revenue stream entry removed', 'info');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Sprint 6 Sponsorship Handlers
  const handleSaveSponsorship = async (data, targetId = null) => {
    try {
      const recordId = targetId || data?.id || editingSponsorship?.id;
      if (recordId) {
        const { id, ...payload } = data;
        await api.updateSponsorship(recordId, payload);
        showToast('Sponsorship deal updated!', 'success');
      } else {
        await api.createSponsorship(data);
        showToast('New sponsorship contract deal logged!', 'success');
      }
      setEditingSponsorship(null);
      setIsSponsorshipModalOpen(false);
      await fetchAllBackendData();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteSponsorship = async (id) => {
    if (!window.confirm('Delete this sponsorship deal record?')) return;
    try {
      await api.deleteSponsorship(id);
      await fetchAllBackendData();
      showToast('Sponsorship contract removed', 'info');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const getHeaderTitles = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Realtime KPIs, performance charts, and top platform metrics' };
      case 'content':
        return { title: 'Content Performance', subtitle: 'Manage library items, views, likes, shares & engagement rates' };
      case 'audience':
        return { title: 'Audience Analytics', subtitle: 'Demographics, device distribution, and demographic database records' };
      case 'growth':
        return { title: 'Growth & Trends', subtitle: '30-day historical follower growth, virality, and impression logs' };
      case 'revenue':
        return { title: 'Revenue & Sponsorships', subtitle: 'Financial stream breakdown, monthly revenue & brand deal contracts' };
      case 'notifications':
        return { title: 'Notifications & Alerts Hub', subtitle: 'Contextual performance milestones, engagement warnings & revenue alerts' };
      case 'reports':
        return { title: 'Analytics Reports & Export', subtitle: 'Generate structured report summaries and download PDF & Excel exports' };
      case 'settings':
        return { title: 'Profile & Account Settings', subtitle: 'Manage creator account details, social connections & API status' };
      default:
        return { title: 'CreatorIQ Dashboard', subtitle: 'Realtime creator analytics platform' };
    }
  };

  const headerInfo = getHeaderTitles();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            summary={summary}
            audienceReport={audienceReport}
            audienceTrends={audienceTrends}
            reachBreakdown={reachBreakdown}
            engagementChartData={engagementChartData}
            followerGrowthChartData={followerGrowthChartData}
            platformComparison={platformComparison}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            onRefresh={fetchAllBackendData}
            onNavigateTab={setActiveTab}
            loading={loading}
          />
        );
      case 'content':
        return (
          <ContentView
            contents={contents}
            onAdd={handleSaveContent}
            onUpdate={(id, data) => handleSaveContent({ ...data, id })}
            onDelete={handleDeleteContent}
            onSyncYouTube={handleSyncYouTube}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
          />
        );
      case 'audience':
        return (
          <AudienceView
            records={audienceRecords}
            report={audienceReport}
            onAdd={(data) => handleSaveAudience(data)}
            onUpdate={(id, data) => handleSaveAudience({ ...data, id })}
            onDelete={handleDeleteAudience}
          />
        );
      case 'growth':
        return (
          <GrowthView
            growthTrends={growthTrends}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
          />
        );
      case 'revenue':
        return (
          <RevenueView
            revenueSummary={revenueSummary}
            revenueRecords={revenueRecords}
            sponsorshipRecords={sponsorshipRecords}
            onAddRevenue={() => { setEditingRevenue(null); setIsRevenueModalOpen(true); }}
            onUpdateRevenue={(rev) => { setEditingRevenue(rev); setIsRevenueModalOpen(true); }}
            onDeleteRevenue={handleDeleteRevenue}
            onAddSponsorship={() => { setEditingSponsorship(null); setIsSponsorshipModalOpen(true); }}
            onUpdateSponsorship={(sp) => { setEditingSponsorship(sp); setIsSponsorshipModalOpen(true); }}
            onDeleteSponsorship={handleDeleteSponsorship}
          />
        );
      case 'notifications':
        return <NotificationsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return (
          <SettingsView
            user={user}
            onUpdateUser={(upUser) => setUser(upUser)}
            onOpenSocialModal={() => setIsSocialModalOpen(true)}
          />
        );
      default:
        return (
          <DashboardView
            summary={summary}
            audienceReport={audienceReport}
            audienceTrends={audienceTrends}
            reachBreakdown={reachBreakdown}
            engagementChartData={engagementChartData}
            followerGrowthChartData={followerGrowthChartData}
            platformComparison={platformComparison}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            onRefresh={fetchAllBackendData}
            onNavigateTab={setActiveTab}
            loading={loading}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Toast Popup Notification Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Left Sidebar Navigation (Desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="main-content">
        {/* Top Header Bar */}
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          user={user}
          onLogout={handleLogout}
          onOpenYouTubeModal={() => setIsYouTubeModalOpen(true)}
          onOpenSocialModal={() => setIsSocialModalOpen(true)}
          onOpenNotificationsTab={() => setActiveTab('notifications')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Backend Connection Error Banner */}
        {error && (
          <div className="section-card" style={{ backgroundColor: '#fee2e2', color: '#991b1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 32px 0 32px' }}>
            <span><strong>Backend Connection Notice:</strong> {error}</span>
            <button className="btn-add" onClick={fetchAllBackendData}>Retry Backend Connection</button>
          </div>
        )}

        {/* Active Page View Body */}
        <main className="content-area">
          {renderActiveView()}
        </main>
      </div>

      {/* Smartphone Bottom Navbar (< 768px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

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

      {/* CRUD & Workflow Modals */}
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

      <RevenueModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        onSave={handleSaveRevenue}
        initialData={editingRevenue}
      />

      <SponsorshipModal
        isOpen={isSponsorshipModalOpen}
        onClose={() => setIsSponsorshipModalOpen(false)}
        onSave={handleSaveSponsorship}
        initialData={editingSponsorship}
      />
    </div>
  );
}

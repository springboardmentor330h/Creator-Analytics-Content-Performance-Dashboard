import React from 'react';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import DeviceChart from '../components/DeviceChart';
import AgeChart from '../components/AgeChart';
import PlatformReachBreakdown from '../components/PlatformReachBreakdown';
import PlatformComparison from '../components/PlatformComparison';
import PlatformPieChart from '../components/PlatformPieChart';
import PlatformBarChart from '../components/PlatformBarChart';
import AnalyticsChart from '../components/AnalyticsChart';
import { StatCardSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import { BarChart2, RefreshCw, DollarSign, FileText, Bell, Video } from 'lucide-react';

export default function DashboardView({
  summary,
  audienceReport,
  audienceTrends,
  reachBreakdown,
  engagementChartData,
  followerGrowthChartData,
  platformComparison,
  selectedPlatform,
  onSelectPlatform,
  onRefresh,
  onNavigateTab,
  loading = false
}) {
  const totalViews = summary?.total_views ?? 0;
  const totalLikes = summary?.total_likes ?? 0;
  const totalComments = summary?.total_comments ?? 0;
  const totalShares = summary?.total_shares ?? 0;
  const totalReach = summary?.total_reach ?? reachBreakdown?.combined_total_reach ?? 0;
  const totalFollowers = summary?.total_followers ?? audienceReport?.total_followers ?? 0;
  const avgEngagement = summary?.average_engagement_rate ?? 0;
  const totalContent = summary?.total_content ?? 0;
  const bestPlatform = summary?.best_platform || 'YouTube';
  const topContentTitle = summary?.top_content || 'N/A';

  const deviceDistribution = audienceReport?.device_distribution || {};
  const ageDistribution = audienceReport?.age_distribution || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Executive Overview Header Card */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={22} color="#2563eb" />
              <span>Executive Overview & Key Performance Indicators</span>
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Realtime aggregated analytics summary from GET /analytics/summary
            </p>
          </div>

          <button className="nav-btn" onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Refresh Overview'}
          </button>
        </div>

        {/* Highlight Banner Cards */}
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
              width: '42px',
              height: '42px',
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
              width: '42px',
              height: '42px',
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
              width: '42px',
              height: '42px',
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

        {/* 8-Card Stat Grid (with Skeleton Fallback) */}
        {loading && !summary ? (
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : (
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
        )}
      </div>

      {/* Quick Action Navigation Shortcuts */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', marginRight: '8px' }}>
          Quick Shortcuts:
        </span>

        <button
          onClick={() => onNavigateTab('revenue')}
          style={{
            backgroundColor: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <DollarSign size={15} /> Revenue & Sponsorships
        </button>

        <button
          onClick={() => onNavigateTab('reports')}
          style={{
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileText size={15} /> Reports & Export
        </button>

        <button
          onClick={() => onNavigateTab('notifications')}
          style={{
            backgroundColor: '#fefce8',
            color: '#a16207',
            border: '1px solid #fef08a',
            borderRadius: '8px',
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Bell size={15} /> Notifications & Alerts
        </button>

        <button
          onClick={() => onNavigateTab('content')}
          style={{
            backgroundColor: '#fdf2f8',
            color: '#be185d',
            border: '1px solid #fbcfe8',
            borderRadius: '8px',
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Video size={15} /> Content Library
        </button>
      </div>

      {/* Platform Reach Breakdown Section */}
      <section className="section-card">
        <PlatformReachBreakdown
          reachBreakdown={reachBreakdown}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={onSelectPlatform}
        />
      </section>

      {/* Cross-Platform Comparison Section */}
      <PlatformComparison platformComparison={platformComparison} />

      {/* Visualizations Donut & Bar Charts Grid */}
      <div className="dashboard-layout">
        <PlatformPieChart
          reachBreakdown={reachBreakdown}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={onSelectPlatform}
        />
        <PlatformBarChart
          platformComparison={platformComparison}
        />
      </div>

      {/* Trends Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AnalyticsChart engagementData={engagementChartData} followerGrowthData={followerGrowthChartData} />
        <LineChart title="Audience Growth & Reach Realtime Trends" data={audienceTrends} />
      </div>

      {/* Demographics Grid */}
      <div className="dashboard-layout">
        <DeviceChart title="Device Usage Breakdown" distribution={deviceDistribution} />
        <AgeChart title="Age Group Breakdown" distribution={ageDistribution} />
      </div>
    </div>
  );
}

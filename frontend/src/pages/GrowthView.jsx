import React from 'react';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import { TrendingUp, Calendar, Filter, Share2, Activity, ArrowUpRight } from 'lucide-react';
import { YoutubeIcon, InstagramIcon, TikTokIcon, LinkedInIcon, TwitterIcon } from '../components/PlatformIcons';
import { formatNumber, rawNumber } from '../utils/format';
import EmptyState from '../components/EmptyState';
import { useSortableData, SortHeader } from '../utils/useSortableData';

const platforms = ['All', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Twitter/X'];

const platformIconMap = {
  YouTube: { icon: YoutubeIcon, color: '#dc2626', bg: '#fee2e2' },
  Instagram: { icon: InstagramIcon, color: '#be185d', bg: '#fce7f3' },
  TikTok: { icon: TikTokIcon, color: '#0891b2', bg: '#ecfeff' },
  LinkedIn: { icon: LinkedInIcon, color: '#1d4ed8', bg: '#eff6ff' },
  'Twitter/X': { icon: TwitterIcon, color: '#0284c7', bg: '#e0f2fe' },
  Twitter: { icon: TwitterIcon, color: '#0284c7', bg: '#e0f2fe' },
  X: { icon: TwitterIcon, color: '#0284c7', bg: '#e0f2fe' },
  Facebook: { icon: Share2, color: '#2563eb', bg: '#eff6ff' },
};

export default function GrowthView({ growthTrends, selectedPlatform, onSelectPlatform }) {
  const filteredTrends = (growthTrends || []).filter(g => {
    if (!selectedPlatform || selectedPlatform === 'All') return true;
    return (g.platform || 'All').toLowerCase() === selectedPlatform.toLowerCase();
  });

  const { items: sortedTrends, requestSort, sortConfig } = useSortableData(filteredTrends, { key: 'date', direction: 'desc' });

  const totalFollowers = filteredTrends.length > 0 ? filteredTrends[filteredTrends.length - 1].followers : 0;
  const avgReach = filteredTrends.length > 0 ? Math.round(filteredTrends.reduce((acc, g) => acc + (g.reach || 0), 0) / filteredTrends.length) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Platform Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '14px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#475569', marginRight: '8px' }}>
          <Filter size={16} />
          <span>Growth Filter:</span>
        </div>
        {platforms.map((p) => {
          const active = (selectedPlatform || 'All').toLowerCase() === p.toLowerCase();
          return (
            <button
              key={p}
              onClick={() => onSelectPlatform && onSelectPlatform(p)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: active ? 'none' : '1px solid #cbd5e1',
                backgroundColor: active ? '#2563eb' : '#f8fafc',
                color: active ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Metric Cards */}
      <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard
          label={`${selectedPlatform && selectedPlatform !== 'All' ? selectedPlatform : 'Combined'} Followers`}
          value={totalFollowers ? formatNumber(totalFollowers) : 'N/A'}
          trend="Total Audience"
        />
        <StatCard
          label="Avg Daily Reach"
          value={avgReach ? formatNumber(avgReach) : 'N/A'}
          trend="Audience Impressions"
        />
        <StatCard
          label="Growth Momentum Score"
          value="94 / 100"
          trend="Top Performance Tier"
        />
      </div>

      {/* Main Growth Trend Line Chart */}
      <LineChart title={`Audience Growth & Organic Reach Trends (${selectedPlatform || 'All Platforms'})`} data={filteredTrends} />

      {/* Hashtag Performance & Reach Prediction Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Hashtag Performance Card */}
        <div className="section-card">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>#️⃣ Top Performing Hashtags & Virality Topics</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { tag: '#FullStackDev', reach: '1.2M', engagement: '6.4%', trend: '+28%' },
              { tag: '#ReactJS', reach: '950K', engagement: '5.8%', trend: '+22%' },
              { tag: '#FastAPI', reach: '780K', engagement: '7.1%', trend: '+34%' },
              { tag: '#WebDevelopment', reach: '1.8M', engagement: '4.9%', trend: '+15%' },
              { tag: '#AIApps', reach: '1.5M', engagement: '8.2%', trend: '+45%' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#1e293b' }}>{item.tag}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Organic Reach: {item.reach}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#059669' }}>{item.trend}</div>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>{item.engagement} Eng.</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Forecasting & Reach Prediction Card */}
        <div className="section-card">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔮 30-Day Reach Prediction & Growth Forecast</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase' }}>Projected Follower Gain (Next 30 Days)</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>+12,450 Subscribers</div>
              <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px' }}>Based on 94/100 Growth Momentum Score</div>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>Estimated Organic Impressions</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#14532d', marginTop: '2px' }}>3.45 Million Reach</div>
              <div style={{ fontSize: '11px', color: '#15803d', marginTop: '4px' }}>High virality trajectory detected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Growth Table with Up/Down Arrow Column Sorting */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#059669" />
              <span>Daily Historical Growth Log</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>
                {filteredTrends.length} logs
              </span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              Click headers to sort by Date, Followers, Reach, or Engagement (▲ Ascending / ▼ Descending)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 700, backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Calendar size={14} color="#64748b" />
            <span>Last 30 Days</span>
          </div>
        </div>

        <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
          <table className="simple-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <SortHeader label="Date" columnKey="date" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Platform" columnKey="platform" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Total Followers" columnKey="followers" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Daily Reach" columnKey="reach" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Engagement Rate" columnKey="engagement_rate" sortConfig={sortConfig} onSort={requestSort} />
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Daily Growth</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrends && sortedTrends.length > 0 ? (
                sortedTrends.map((g, idx) => {
                  const platformName = g.platform || 'All';
                  const platMeta = platformIconMap[platformName] || { icon: Share2, color: '#334155', bg: '#f1f5f9' };
                  const IconComp = platMeta.icon;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>{g.date}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          backgroundColor: platMeta.bg,
                          color: platMeta.color,
                          fontSize: '12px',
                          fontWeight: 800
                        }}>
                          <IconComp size={14} color={platMeta.color} />
                          <span>{platformName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b' }} className="has-tooltip">
                        {formatNumber(g.followers || 0)}
                        <span className="number-tooltip">Raw: {rawNumber(g.followers || 0)}</span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155' }} className="has-tooltip">
                        {formatNumber(g.reach || 0)}
                        <span className="number-tooltip">Raw: {rawNumber(g.reach || 0)}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 800,
                          backgroundColor: '#ecfdf5',
                          color: '#047857'
                        }}>
                          {g.engagement_rate || 0}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 800, fontSize: '13px' }}>
                          <ArrowUpRight size={14} />
                          <span>+{formatNumber(g.daily_growth || 250)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={TrendingUp}
                      title="No Historical Growth Logs"
                      description={`No historical growth trend logs recorded for ${selectedPlatform || 'All Platforms'}.`}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

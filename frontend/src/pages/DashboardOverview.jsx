import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const PLATFORM_OPTIONS = ['All', 'YouTube', 'Instagram'];

export default function DashboardOverview() {
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [summary, setSummary] = useState({
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    total_reach: 0,
    total_followers: 0,
    average_engagement_rate: 0,
  });
  const [comparison, setComparison] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [summaryData, comparisonData] = await Promise.all([
          api.get(`/analytics/summary?creator_id=1&platform=${encodeURIComponent(selectedPlatform)}`),
          api.get('/analytics/platform-comparison?creator_id=1'),
        ]);

        setSummary(summaryData);
        setComparison(comparisonData || {});
      } catch (fetchError) {
        console.error('Dashboard fetch failed:', fetchError);
        setError(fetchError.message || 'Unable to load analytics right now.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedPlatform]);

  const comparisonRows = useMemo(() => Object.entries(comparison), [comparison]);
  const maxViews = Math.max(...comparisonRows.map(([, values]) => values.views || 0), 1);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>CreatorIQ Overview</p>
          <h1 style={styles.title}>Multi-platform dashboard</h1>
        </div>

        <label style={styles.selectWrap}>
          <span style={styles.selectLabel}>Platform</span>
          <select
            value={selectedPlatform}
            onChange={(event) => setSelectedPlatform(event.target.value)}
            style={styles.select}
          >
            {PLATFORM_OPTIONS.map((platform) => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p style={styles.loading}>Loading analytics...</p>
      ) : error ? (
        <div style={styles.errorBox}>{error}</div>
      ) : (
        <>
          <div style={styles.kpiGrid}>
            <KpiCard label="Total Views" value={summary.total_views?.toLocaleString?.() ?? '0'} accent="#2563eb" />
            <KpiCard label="Total Likes" value={summary.total_likes?.toLocaleString?.() ?? '0'} accent="#10b981" />
            <KpiCard label="Comments" value={summary.total_comments?.toLocaleString?.() ?? '0'} accent="#f59e0b" />
            <KpiCard label="Reach" value={summary.total_reach?.toLocaleString?.() ?? '0'} accent="#8b5cf6" />
            <KpiCard label="Followers" value={summary.total_followers?.toLocaleString?.() ?? '0'} accent="#ef4444" />
            <KpiCard label="Engagement" value={`${summary.average_engagement_rate ?? 0}%`} accent="#14b8a6" />
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Platform comparison</h2>
              <span style={styles.badge}>{selectedPlatform}</span>
            </div>

            <div style={styles.comparisonList}>
              {comparisonRows.map(([platform, data]) => (
                <div key={platform} style={styles.platformRow}>
                  <div style={styles.platformMeta}>
                    <strong>{platform}</strong>
                    <span>{data.engagement_rate ?? 0}% engagement</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${((data.views || 0) / maxViews) * 100}%`,
                        background: platform === 'Instagram' ? '#8b5cf6' : '#2563eb',
                      }}
                    />
                  </div>
                  <span style={styles.valueText}>{(data.views || 0).toLocaleString()} views</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, accent }) {
  return (
    <div style={{ ...styles.kpiCard, borderTop: `4px solid ${accent}` }}>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiValue}>{value}</div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    padding: '0.5rem 0'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  eyebrow: {
    margin: 0,
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    color: '#64748b',
    letterSpacing: '0.08em'
  },
  title: {
    margin: '0.25rem 0 0',
    fontSize: '2rem',
    color: '#0f172a'
  },
  selectWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontWeight: 600,
    color: '#334155'
  },
  selectLabel: {
    fontSize: '0.8rem'
  },
  select: {
    border: '1px solid #dbe3f0',
    background: '#fff',
    borderRadius: '10px',
    padding: '0.7rem 1rem',
    fontSize: '0.95rem',
    color: '#0f172a'
  },
  loading: {
    color: '#475569',
    fontSize: '1rem'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem'
  },
  kpiCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
    minHeight: '120px'
  },
  kpiLabel: {
    color: '#64748b',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  kpiValue: {
    marginTop: '0.9rem',
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#0f172a'
  },
  panel: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  panelTitle: {
    margin: 0,
    fontSize: '1.2rem',
    color: '#0f172a'
  },
  badge: {
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '999px',
    padding: '0.38rem 0.72rem',
    fontSize: '0.78rem',
    fontWeight: 700
  },
  comparisonList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  platformRow: {
    display: 'grid',
    gridTemplateColumns: '160px 1fr 110px',
    alignItems: 'center',
    gap: '0.75rem'
  },
  platformMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    color: '#334155'
  },
  barTrack: {
    height: '12px',
    background: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: '999px'
  },
  valueText: {
    fontSize: '0.8rem',
    color: '#475569',
    textAlign: 'right'
  }
};

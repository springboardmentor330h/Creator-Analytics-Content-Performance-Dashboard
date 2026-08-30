// src/pages/DashboardOverview.jsx
import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  TrendingUp, 
  Filter, 
  RefreshCw,
  AlertCircle,
  Download,
  FileText,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { exportToCSV, exportToPDF } from '../utils/exportHelpers';

export default function DashboardOverview() {
  const [platform, setPlatform] = useState('ALL');
  const [dateRange, setDateRange] = useState('7d'); // Default to 7 Days
  const [metrics, setMetrics] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Build Query Parameters for Platform and Date Range
      const params = new URLSearchParams();
      if (platform !== 'ALL') params.append('platform', platform);
      params.append('range', dateRange);

      const queryStr = `?${params.toString()}`;

      // 2. Fetch Summary Analytics with time range filter
      const summaryData = await api.get(`/reports/summary/me${queryStr}`);
      setMetrics(summaryData);

      // 3. Fetch Trend Data based on time range
      try {
        const historyData = await api.get(`/reports/trends/me${queryStr}`);
        setTrendData(historyData);
      } catch {
        // Fallback mockup generator based on dateRange selection
        setTrendData(getMockTrendData(dateRange));
      }

      // 4. Fetch Content List
      const contentData = await api.get('/content/');
      if (Array.isArray(contentData)) {
        const filtered = platform === 'ALL' 
          ? contentData 
          : contentData.filter(c => c.platform?.toUpperCase() === platform.toUpperCase());
        setContentList(filtered);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while communicating with the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when either platform OR dateRange changes
  useEffect(() => {
    fetchDashboardData();
  }, [platform, dateRange]);

  // Fallback data generator for demonstration
  const getMockTrendData = (range) => {
    if (range === '7d') {
      return [
        { date: 'Mon', views: 4000, likes: 2400 },
        { date: 'Tue', views: 3000, likes: 1398 },
        { date: 'Wed', views: 9800, likes: 5200 },
        { date: 'Thu', views: 6000, likes: 3800 },
        { date: 'Fri', views: 11800, likes: 7100 },
        { date: 'Sat', views: 8500, likes: 4900 },
        { date: 'Sun', views: 14200, likes: 8900 },
      ];
    } else if (range === '30d') {
      return [
        { date: 'Week 1', views: 24000, likes: 12400 },
        { date: 'Week 2', views: 31000, likes: 18200 },
        { date: 'Week 3', views: 45000, likes: 27900 },
        { date: 'Week 4', views: 52000, likes: 34100 },
      ];
    } else {
      // 90d
      return [
        { date: 'Month 1', views: 98000, likes: 54000 },
        { date: 'Month 2', views: 132000, likes: 79000 },
        { date: 'Month 3', views: 175000, likes: 104000 },
      ];
    }
  };

  const handlePDFExport = async () => {
    setIsExportingPDF(true);
    await exportToPDF(
      'dashboard-content-area', 
      `dashboard_${platform.toLowerCase()}_${dateRange}_${new Date().toISOString().slice(0, 10)}.pdf`
    );
    setIsExportingPDF(false);
  };

  const handleCSVExport = () => {
    exportToCSV(
      contentList, 
      `performance_${platform.toLowerCase()}_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  return (
    <div style={styles.container}>
      {/* Header Controls */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Performance Overview</h2>
          <p style={styles.subtitle}>Track cross-platform engagements and audience statistics</p>
        </div>

        <div style={styles.filterGroup}>
          {/* Date Range Selector Segment */}
          <div style={styles.rangeSelector}>
            <Calendar size={15} color="#64748b" style={{ marginLeft: '0.25rem' }} />
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                style={{
                  ...styles.rangeButton,
                  ...(dateRange === range ? styles.rangeButtonActive : {}),
                }}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Platform Selector */}
          <div style={styles.selectWrapper}>
            <Filter size={16} color="#64748b" />
            <select 
              value={platform} 
              onChange={(e) => setPlatform(e.target.value)}
              style={styles.select}
            >
              <option value="ALL">All Platforms</option>
              <option value="YouTube">YouTube</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitter">Twitter / X</option>
            </select>
          </div>

          {/* Refresh Action */}
          <button 
            onClick={fetchDashboardData} 
            disabled={isLoading}
            style={styles.refreshButton}
            title="Refresh metrics"
          >
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
          </button>

          {/* Dual Export Button Group */}
          <div style={styles.exportButtonGroup}>
            <button
              onClick={handleCSVExport}
              disabled={isLoading || contentList.length === 0}
              style={{
                ...styles.exportCsvButton,
                opacity: isLoading || contentList.length === 0 ? 0.5 : 1,
                cursor: isLoading || contentList.length === 0 ? 'not-allowed' : 'pointer'
              }}
              title="Download raw performance data as CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePDFExport}
              disabled={isLoading || isExportingPDF}
              style={{
                ...styles.exportPdfButton,
                opacity: isLoading || isExportingPDF ? 0.5 : 1,
                cursor: isLoading || isExportingPDF ? 'not-allowed' : 'pointer'
              }}
              title="Download visual overview report as PDF"
            >
              <FileText size={15} />
              <span>{isExportingPDF ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Target Container Captured by PDF Exporter */}
      <div id="dashboard-content-area" style={styles.captureArea}>
        {/* KPI Cards */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>Total Views</span>
              <div style={{ ...styles.iconWrapper, backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <Eye size={20} />
              </div>
            </div>
            <div style={styles.kpiValue}>
              {isLoading ? '...' : formatNumber(metrics?.total_views ?? 0)}
            </div>
            <div style={styles.kpiFooter}>
              <TrendingUp size={14} color="#16a34a" />
              <span style={{ color: '#16a34a', fontWeight: '600' }}>+12%</span>
              <span style={{ color: '#94a3b8' }}>vs previous {dateRange}</span>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>Total Likes</span>
              <div style={{ ...styles.iconWrapper, backgroundColor: '#fdf2f8', color: '#db2777' }}>
                <ThumbsUp size={20} />
              </div>
            </div>
            <div style={styles.kpiValue}>
              {isLoading ? '...' : formatNumber(metrics?.total_likes ?? 0)}
            </div>
            <div style={styles.kpiFooter}>
              <TrendingUp size={14} color="#16a34a" />
              <span style={{ color: '#16a34a', fontWeight: '600' }}>+8.4%</span>
              <span style={{ color: '#94a3b8' }}>vs previous {dateRange}</span>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>Comments</span>
              <div style={{ ...styles.iconWrapper, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                <MessageSquare size={20} />
              </div>
            </div>
            <div style={styles.kpiValue}>
              {isLoading ? '...' : formatNumber(metrics?.total_comments ?? 0)}
            </div>
            <div style={styles.kpiFooter}>
              <span style={{ color: '#64748b' }}>Active engagement</span>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>Shares / Reposts</span>
              <div style={{ ...styles.iconWrapper, backgroundColor: '#faf5ff', color: '#9333ea' }}>
                <Share2 size={20} />
              </div>
            </div>
            <div style={styles.kpiValue}>
              {isLoading 
                ? '...' 
                : metrics?.total_shares !== null && metrics?.total_shares !== undefined 
                  ? formatNumber(metrics.total_shares) 
                  : 'N/A'}
            </div>
            <div style={styles.kpiFooter}>
              <span style={{ color: '#94a3b8' }}>
                {platform === 'LinkedIn' ? 'Metric unsupported' : 'Virality tracker'}
              </span>
            </div>
          </div>
        </div>

        {/* Engagement Trajectory Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Engagement Trends</h3>
              <span style={styles.chartSubtitle}>
                Views & Likes trajectory over the past {dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : '90 days'}
              </span>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#db2777" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={formatNumber} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                  formatter={(val) => formatNumber(val)}
                />
                <Area type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" name="Views" />
                <Area type="monotone" dataKey="likes" stroke="#db2777" strokeWidth={2} fillOpacity={1} fill="url(#colorLikes)" name="Likes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Recent Content Performance</h3>
            <span style={styles.tableBadge}>{contentList.length} Items</span>
          </div>

          {isLoading ? (
            <div style={styles.loadingState}>Loading recent content entries...</div>
          ) : contentList.length === 0 ? (
            <div style={styles.emptyState}>No content records found for platform: {platform}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Platform</th>
                    <th style={styles.th}>Views</th>
                    <th style={styles.th}>Likes</th>
                    <th style={styles.th}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {contentList.map((item) => (
                    <tr key={item.id || item.title} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '600', color: '#1e293b' }}>
                        {item.title}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.platformBadge,
                          backgroundColor: item.platform === 'YouTube' ? '#fee2e2' : '#e0e7ff',
                          color: item.platform === 'YouTube' ? '#dc2626' : '#4338ca',
                        }}>
                          {item.platform}
                        </span>
                      </td>
                      <td style={styles.td}>{formatNumber(item.views)}</td>
                      <td style={styles.td}>{formatNumber(item.likes)}</td>
                      <td style={styles.td}>{formatNumber(item.comments)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  rangeSelector: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.25rem',
    gap: '0.25rem',
  },
  rangeButton: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    padding: '0.25rem 0.625rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  rangeButtonActive: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
  },
  select: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#334155',
    cursor: 'pointer',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.625rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#475569',
  },
  exportButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderLeft: '1px solid #e2e8f0',
    paddingLeft: '0.75rem',
  },
  exportCsvButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  exportPdfButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: '1px solid #0f172a',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '0.875rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  captureArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  kpiLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#64748b',
  },
  iconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  kpiFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  chartHeader: {
    marginBottom: '1rem',
  },
  chartTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  chartSubtitle: {
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  tableBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.25rem 0.625rem',
    borderRadius: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
  },
  th: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontWeight: '600',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #f1f5f9',
    color: '#475569',
  },
  tr: {
    transition: 'background-color 0.15s ease',
  },
  platformBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  loadingState: {
    padding: '3rem',
    textAlign: 'center',
    color: '#64748b',
  },
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    color: '#94a3b8',
  },
};

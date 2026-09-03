import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../services/api';

const PLATFORMS = [['ALL', 'All Platforms'], ['YouTube', 'YouTube'], ['Instagram', 'Instagram'], ['LinkedIn', 'LinkedIn'], ['Twitter', 'Twitter']];
const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const formatNumber = (value) => compactNumber.format(Number(value || 0));

function Metric({ label, value, color }) {
  return <div style={{ ...styles.metric, borderTopColor: color }}><span>{label}</span><strong>{value}</strong></div>;
}

export default function DashboardOverview() {
  const [platform, setPlatform] = useState('ALL');
  const [range, setRange] = useState('30d');
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [nextSummary, nextTrends, nextComparison] = await Promise.all([
        api.get(`/reports/summary/me?platform=${encodeURIComponent(platform)}`),
        api.get(`/reports/trends/me?platform=${encodeURIComponent(platform)}&range=${range}`),
        api.get('/reports/platform-comparison'),
      ]);
      setSummary(nextSummary);
      setTrends(nextTrends.data || []);
      setComparison(Array.isArray(nextComparison) ? nextComparison : []);
    } catch (requestError) {
      console.error('Unable to load analytics:', requestError);
      // Offline fallback deliberately contains no invented analytics values.
      setSummary(null); setTrends([]); setComparison([]);
      setError('Live analytics are unavailable. Start the API and seed the database, then retry.');
    } finally { setLoading(false); }
  }, [platform, range]);

  useEffect(() => {
    // Schedule the async request after render; this avoids a synchronous effect update.
    const timer = window.setTimeout(() => { void loadAnalytics(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  return <div style={styles.page}>
    <header style={styles.header}>
      <div><p style={styles.eyebrow}>CreatorIQ analytics</p><h1 style={styles.title}>Multi-platform performance</h1><p style={styles.subtitle}>Every value is calculated by FastAPI from PostgreSQL content records.</p></div>
      <div style={styles.filters}>
        <label>Platform<select value={platform} onChange={(e) => setPlatform(e.target.value)}>{PLATFORMS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Date range<select value={range} onChange={(e) => setRange(e.target.value)}>{['7d', '30d', '90d'].map((value) => <option key={value} value={value}>Last {value.replace('d', ' days')}</option>)}</select></label>
        <button type="button" onClick={loadAnalytics} disabled={loading}><RefreshCw size={16} /> Refresh</button>
      </div>
    </header>
    {error && <div role="status" style={styles.offline}><WifiOff size={18} />{error}</div>}
    <section style={styles.metrics} aria-busy={loading}>
      <Metric label="Total views" value={summary ? formatNumber(summary.total_views) : '—'} color="#2563eb" />
      <Metric label="Total reach" value={summary ? formatNumber(summary.total_reach) : '—'} color="#7c3aed" />
      <Metric label="Likes" value={summary ? formatNumber(summary.total_likes) : '—'} color="#db2777" />
      <Metric label="Comments" value={summary ? formatNumber(summary.total_comments) : '—'} color="#0891b2" />
      <Metric label="Engagement rate" value={summary ? `${summary.avg_engagement_rate}%` : '—'} color="#059669" />
      <Metric label="Content items" value={summary ? summary.total_content_count.toLocaleString() : '—'} color="#ea580c" />
    </section>
    <section style={styles.card}>
      <h2>Performance trend</h2><p>Daily views and reach for the selected filters.</p>
      <div style={styles.trendChart}>{trends.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={trends}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tickFormatter={(date) => date.slice(5)} /><YAxis tickFormatter={formatNumber} /><Tooltip formatter={(value) => Number(value).toLocaleString()} /><Legend /><Area type="monotone" dataKey="views" name="Views" stroke="#2563eb" fill="#bfdbfe" strokeWidth={2} /><Area type="monotone" dataKey="reach" name="Reach" stroke="#7c3aed" fill="none" strokeWidth={2} /></AreaChart></ResponsiveContainer> : <Empty text="No published content exists in this time range." />}</div>
    </section>
    <section style={styles.comparison}>
      <div style={styles.card}><h2>Platform comparison</h2><p>Views across all recorded content.</p><div style={styles.barChart}>{comparison.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={comparison}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="platform" /><YAxis tickFormatter={formatNumber} /><Tooltip formatter={(value) => Number(value).toLocaleString()} /><Bar dataKey="total_views" name="Total views" fill="#2563eb" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <Empty text="Comparison data will appear after content is seeded." />}</div></div>
      <div style={{ ...styles.card, overflowX: 'auto' }}><h2>Platform totals</h2><table style={styles.table}><thead><tr><th>Platform</th><th>Views</th><th>Engagement</th><th>Posts</th></tr></thead><tbody>{comparison.map((row) => <tr key={row.platform}><td>{row.platform}</td><td>{formatNumber(row.total_views)}</td><td>{row.avg_engagement_rate}%</td><td>{row.post_count}</td></tr>)}</tbody></table></div>
    </section>
  </div>;
}

function Empty({ text }) { return <p style={styles.empty}>{text}</p>; }

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1240px' }, header: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '1rem', flexWrap: 'wrap' },
  eyebrow: { margin: 0, color: '#2563eb', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }, title: { margin: '0.35rem 0', color: '#0f172a', fontSize: 'clamp(1.7rem, 4vw, 2.35rem)' }, subtitle: { margin: 0, color: '#64748b' },
  filters: { display: 'flex', gap: '0.65rem', alignItems: 'end', flexWrap: 'wrap' },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '0.8rem' }, metric: { background: '#fff', borderRadius: '14px', borderTop: '4px solid', padding: '1rem', boxShadow: '0 6px 18px rgba(15,23,42,.06)' },
  card: { background: '#fff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 8px 22px rgba(15,23,42,.06)' }, trendChart: { height: '320px', marginTop: '1rem' }, barChart: { height: '270px', marginTop: '1rem' }, comparison: { display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(300px,1fr)', gap: '1.25rem' },
  offline: { display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.8rem 1rem', borderRadius: '10px', background: '#fff7ed', color: '#9a3412' }, empty: { display: 'grid', placeItems: 'center', height: '100%', color: '#64748b', textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '.8rem', color: '#334155' },
};

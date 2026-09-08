import { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const sectionConfig = {
  audience: { title: 'Audience Analytics', endpoint: '/analytics/audience', subtitle: 'Audience demographics calculated from your stored records.' },
  growth: { title: 'Growth & Trends', endpoint: '/analytics/growth', subtitle: 'Follower growth calculated from your stored growth records.' },
  revenue: { title: 'Revenue', endpoint: null, subtitle: 'Revenue records stored for the authenticated creator.' },
  sponsorships: { title: 'Sponsorships', endpoint: null, subtitle: 'Sponsorship records stored for the authenticated creator.' },
  notifications: { title: 'Notifications', endpoint: null, subtitle: 'Notifications assigned to the authenticated creator.' },
};

function getUserId() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}').user_id || JSON.parse(localStorage.getItem('user') || '{}').id;
  } catch {
    return null;
  }
}

export default function LiveSectionPage({ section }) {
  const config = sectionConfig[section];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = config.endpoint || `/${section === 'sponsorships' ? 'sponsorship' : section}/creator/${getUserId()}`;
      setData(await api.get(endpoint));
    } catch (requestError) {
      setData(null);
      setError(requestError.message || 'Unable to load live data.');
    } finally {
      setLoading(false);
    }
  }, [config, section]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const rows = Array.isArray(data) ? data : [];
  const metrics = Array.isArray(data) ? [
    ['Records', rows.length],
    ['Latest', rows[rows.length - 1]?.date || rows[rows.length - 1]?.earned_date || 'None'],
  ] : Object.entries(data || {}).filter(([key, value]) => typeof value === 'number' && key !== 'id').slice(0, 4).map(([key, value]) => [key.replaceAll('_', ' '), value]);

  const submitRecord = async (event) => {
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.creator_id = Number(getUserId());
    payload.amount = Number(payload.amount);
    if (section === 'revenue') await api.post('/revenue/', payload);
    else await api.post('/sponsorship/', payload);
    event.currentTarget.reset();
    await load();
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div><p style={styles.eyebrow}>CreatorIQ live data</p><h1 style={styles.title}>{config.title}</h1><p style={styles.subtitle}>{config.subtitle}</p></div>
        <button type="button" onClick={load} disabled={loading} style={styles.button}><RefreshCw size={16} /> Refresh</button>
      </header>
      {error && <p role="status" style={styles.error}>{error}</p>}
      {loading ? <p style={styles.empty}>Loading live records...</p> : (
        <>
          {!data && section !== 'revenue' && section !== 'sponsorships' && <p style={styles.empty}>No records are available yet.</p>}
          <section style={styles.metrics}>{metrics.map(([label, value]) => <div key={label} style={styles.metric}><span>{label}</span><strong>{String(value)}</strong></div>)}</section>
          {(section === 'revenue' || section === 'sponsorships') && <RecordForm section={section} onSubmit={submitRecord} />}
          {rows.length > 0 && <div style={styles.tableWrap}><table style={styles.table}><thead><tr>{Object.keys(rows[0]).filter((key) => !['id', 'creator_id'].includes(key)).map((key) => <th key={key}>{key.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id || row.date || row.created_at}>{Object.entries(row).filter(([key]) => !['id', 'creator_id'].includes(key)).map(([key, value]) => <td key={key}>{String(value ?? 'Unavailable')}</td>)}</tr>)}</tbody></table></div>}
        </>
      )}
    </div>
  );
}

function RecordForm({ section, onSubmit }) {
  const sponsorship = section === 'sponsorships';
  return <form onSubmit={onSubmit} style={styles.form}>
    <h2>{sponsorship ? 'Add sponsorship' : 'Add revenue'}</h2>
    {sponsorship ? <label>Sponsor name<input name="sponsor_name" required /></label> : <label>Source<input name="source" placeholder="ads, affiliate, merchandise" required /></label>}
    <label>Amount<input name="amount" type="number" min="0" step="0.01" required /></label>
    <label>Description<input name="description" /></label>
    {sponsorship ? <><label>Start date<input name="start_date" type="date" required /></label><label>End date<input name="end_date" type="date" /></label><label>Status<select name="payment_status" defaultValue="pending"><option>pending</option><option>completed</option><option>failed</option></select></label></> : <label>Earned date<input name="earned_date" type="date" required /></label>}
    <button type="submit" style={styles.button}>Save {sponsorship ? 'sponsorship' : 'revenue'}</button>
  </form>;
}

export function ReportsPage() {
  const creatorId = getUserId();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get(`/reports/summary/${creatorId}`).then(setReport).catch((requestError) => setError(requestError.message));
  }, [creatorId]);
  const download = (format) => api.downloadFile(`/reports/export/${format}/${creatorId}`, `creator_${creatorId}_report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
  return <div style={styles.page}><header style={styles.header}><div><p style={styles.eyebrow}>CreatorIQ exports</p><h1 style={styles.title}>Reports</h1><p style={styles.subtitle}>Generate reports from the authenticated creator's stored data.</p></div></header>{error && <p role="status" style={styles.error}>{error}</p>}<section style={styles.exportRow}><button type="button" style={styles.button} onClick={() => void download('pdf')}><Download size={16} /> Download PDF</button><button type="button" style={styles.button} onClick={() => void download('excel')}><Download size={16} /> Download Excel</button></section>{report && <section style={styles.report}><h2>Financial report</h2><p>Direct revenue: ${Number(report.revenue_summary.total_direct_revenue).toFixed(2)}</p><p>Sponsorship value: ${Number(report.revenue_summary.total_sponsorship_value).toFixed(2)}</p><p>Combined total: ${Number(report.revenue_summary.combined_total).toFixed(2)}</p><h3>Revenue and sponsorship records</h3><ul>{[...(report.revenue_records || []), ...(report.sponsorship_records || [])].map((item) => <li key={`${item.id}-${item.amount}`}>{item.source || item.sponsor_name}: ${Number(item.amount).toFixed(2)} ({item.earned_date || item.start_date})</li>)}</ul></section>}</div>;
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '1120px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '1rem', flexWrap: 'wrap' },
  eyebrow: { margin: 0, color: '#2563eb', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' },
  title: { margin: '0.35rem 0', color: '#0f172a', fontSize: '2rem' },
  subtitle: { margin: 0, color: '#64748b' },
  button: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 0, borderRadius: '8px', padding: '0.7rem 0.9rem', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.8rem' },
  metric: { background: '#fff', borderTop: '4px solid #2563eb', borderRadius: '10px', padding: '1rem', boxShadow: '0 6px 18px rgba(15,23,42,.06)' },
  tableWrap: { overflowX: 'auto', background: '#fff', borderRadius: '10px', padding: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse', color: '#334155' },
  empty: { color: '#64748b' },
  error: { color: '#b91c1c', background: '#fef2f2', padding: '0.8rem', borderRadius: '8px' },
  exportRow: { display: 'flex', gap: '0.8rem', flexWrap: 'wrap' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', background: '#fff', borderRadius: '10px', padding: '1rem' },
  report: { background: '#fff', borderRadius: '10px', padding: '1rem' },
};
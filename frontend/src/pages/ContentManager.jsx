import { useEffect, useState } from 'react';
import { BarChart3, Download, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ContentManager() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingVideo, setFetchingVideo] = useState(false);
  const [youtubeLoaded, setYoutubeLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    platform: 'YouTube', content_id: '', title: '', url: '', views: 0,
    likes: 0, comments: 0, shares: 0, reach: 0,
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await api.get('/content/');
        setPosts(data.slice(0, 6));
      } catch (error) {
        console.error('Load content failed:', error);
        // Do not show fabricated content metrics when the API is unavailable.
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    if (name === 'content_id' || name === 'platform') setYoutubeLoaded(false);
    setForm((current) => ({ ...current, [name]: ['views', 'likes', 'comments', 'shares', 'reach'].includes(name) ? Number(value) : value }));
  };

  const fetchYouTubeVideo = async () => {
    if (!form.content_id.trim()) {
      setMessage('Enter a YouTube video ID first.');
      return;
    }
    setFetchingVideo(true);
    setMessage('');
    try {
      const result = await api.get(`/social/youtube/video?video_id=${encodeURIComponent(form.content_id.trim())}`);
      if (result.status !== 'success' || !result.video) throw new Error(result.error || 'YouTube video was not found.');
      const video = result.video;
      setForm((current) => ({
        ...current,
        content_id: video.id,
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        shares: video.shares,
        reach: video.reach,
        published_at: video.published_date ? `${video.published_date}T00:00:00Z` : undefined,
      }));
      setYoutubeLoaded(true);
      setMessage('Live YouTube data loaded. Save it to include it in analytics.');
    } catch (error) {
      setMessage(error.message || 'Unable to fetch YouTube data.');
    } finally {
      setFetchingVideo(false);
    }
  };

  const submitContent = async (event) => {
    event.preventDefault();
    if (form.platform === 'YouTube' && !youtubeLoaded) {
      setMessage('Fetch the YouTube video data before saving.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await api.post('/content-items', form);
      navigate(`/dashboard?platform=${encodeURIComponent(form.platform)}`);
    } catch (error) {
      setMessage(error.message || 'Unable to save this content.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>Content Operations</p>
          <h1 style={styles.title}>Content Manager</h1>
        </div>
        <button type="button" style={styles.primaryButton} onClick={() => { setShowForm((current) => !current); setMessage(''); }}>
          {showForm ? <X size={17} /> : <Plus size={17} />}
          {showForm ? 'Close' : 'Enter content metrics'}
        </button>
      </div>

      {showForm && <form style={styles.form} onSubmit={submitContent}>
        <div style={styles.formHeader}><div><h2 style={styles.formTitle}>Add content performance</h2><p style={styles.formHint}>Enter the metrics for one post or video.</p></div></div>
        <div style={styles.formGrid}>
          <label style={styles.field}>Platform<select name="platform" value={form.platform} onChange={updateField}>{['YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok', 'Facebook'].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label style={styles.field}>Content ID<input name="content_id" value={form.content_id} onChange={updateField} placeholder={form.platform === 'YouTube' ? 'YouTube video ID' : 'post-123'} required /></label>
          {form.platform === 'YouTube' && <button type="button" style={styles.fetchButton} onClick={fetchYouTubeVideo} disabled={fetchingVideo}><Download size={16} />{fetchingVideo ? 'Fetching...' : 'Fetch video data'}</button>}
          <label style={styles.field}>Title<input name="title" value={form.title} onChange={updateField} placeholder="Post title" required readOnly={form.platform === 'YouTube'} /></label>
          <label style={styles.field}>URL<input name="url" value={form.url} onChange={updateField} placeholder="https://..." /></label>
          {['views', 'likes', 'comments', 'shares', 'reach'].map((field) => <label style={styles.field} key={field}>{field[0].toUpperCase() + field.slice(1)}<input type="number" min="0" name={field} value={form[field]} onChange={updateField} readOnly={form.platform === 'YouTube'} /></label>)}
        </div>
        <div style={styles.formActions}><button type="submit" style={styles.primaryButton} disabled={saving}>{saving ? 'Saving...' : 'Save and view analytics'}</button>{message && <span role="status" style={styles.message}>{message}</span>}</div>
      </form>}

      {loading ? (
        <p style={styles.loading}>Loading content...</p>
      ) : (
        <div style={styles.cardTableWrap}>
          {!posts.length && <p style={styles.empty}>No content is available while the API is offline.</p>}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Platform</th>
                <th style={styles.th}>Views</th>
                <th style={styles.th}>Likes</th>
                <th style={styles.th}>Comments</th>
                <th style={styles.th}>Reach</th>
                <th style={styles.th}>Analytics</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} style={styles.tr}>
                  <td style={styles.td}>{post.content_title || post.title || 'Untitled content'}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.platformBadge, background: post.platform === 'Instagram' ? '#ede9fe' : '#dbeafe' }}>
                      {post.platform || 'YouTube'}
                    </span>
                  </td>
                  <td style={styles.td}>{(post.views || 0).toLocaleString()}</td>
                  <td style={styles.td}>{(post.likes || 0).toLocaleString()}</td>
                  <td style={styles.td}>{(post.comments || 0).toLocaleString()}</td>
                  <td style={styles.td}>{(post.reach || 0).toLocaleString()}</td>
                  <td style={styles.td}><button type="button" style={styles.analyticsButton} onClick={() => navigate(`/dashboard?platform=${encodeURIComponent(post.platform || 'YouTube')}`)}><BarChart3 size={15} /> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#64748b'
  },
  title: {
    margin: '0.25rem 0 0',
    color: '#0f172a',
    fontSize: '2rem'
  },
  primaryButton: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.8rem 1rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  form: { background: '#fff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' },
  formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  formTitle: { margin: 0, color: '#0f172a', fontSize: '1.2rem' },
  formHint: { margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.9rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '0.8rem', marginTop: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#475569', fontSize: '0.8rem', fontWeight: 700 },
  formActions: { display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginTop: '1rem' },
  message: { color: '#166534', fontSize: '0.85rem' },
  analyticsButton: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', borderRadius: '7px', padding: '0.4rem 0.55rem', cursor: 'pointer', fontWeight: 700 },
  fetchButton: { alignSelf: 'end', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', border: '1px solid #99f6e4', background: '#f0fdfa', color: '#0f766e', borderRadius: '8px', padding: '0.65rem 0.7rem', cursor: 'pointer', fontWeight: 700 },
  loading: {
    color: '#475569'
  },
  empty: {
    margin: 0,
    padding: '1rem',
    color: '#64748b'
  },
  cardTableWrap: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    background: '#f8fafc',
    color: '#475569',
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #eef2f7',
    color: '#0f172a'
  },
  tr: {
    background: '#fff'
  },
  platformBadge: {
    display: 'inline-flex',
    borderRadius: '999px',
    padding: '0.35rem 0.7rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#1e293b'
  }
};

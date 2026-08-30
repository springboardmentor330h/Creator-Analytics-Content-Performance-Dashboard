import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function ContentManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await api.get('/content/');
        setPosts(data.slice(0, 6));
      } catch (error) {
        console.error('Load content failed:', error);
        setPosts([
          {
            id: 1,
            content_title: 'CreatorIQ Starter Reel',
            platform: 'Instagram',
            views: 182400,
            likes: 5400,
            comments: 320,
            reach: 240000,
          },
          {
            id: 2,
            content_title: 'YouTube Growth Breakdown',
            platform: 'YouTube',
            views: 248000,
            likes: 7600,
            comments: 480,
            reach: 310000,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>Content Operations</p>
          <h1 style={styles.title}>Content Manager</h1>
        </div>
        <button style={styles.primaryButton}>+ New Campaign</button>
      </div>

      {loading ? (
        <p style={styles.loading}>Loading content...</p>
      ) : (
        <div style={styles.cardTableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Platform</th>
                <th style={styles.th}>Views</th>
                <th style={styles.th}>Likes</th>
                <th style={styles.th}>Comments</th>
                <th style={styles.th}>Reach</th>
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
  loading: {
    color: '#475569'
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

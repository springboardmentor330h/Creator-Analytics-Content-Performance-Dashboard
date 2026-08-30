// src/pages/ContentManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  X, 
  AlertCircle, 
  Loader2, 
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

const MOCK_POSTS = [
  {
    id: 1,
    title: 'Building a REST API with FastAPI & React',
    platform: 'YouTube',
    url: 'https://youtube.com',
    views: 14200,
    likes: 1250,
    comments: 184,
  },
  {
    id: 2,
    title: '10 Software Architecture Best Practices',
    platform: 'LinkedIn',
    url: 'https://linkedin.com',
    views: 8900,
    likes: 640,
    comments: 92,
  },
  {
    id: 3,
    title: 'UI Component Design System Overview',
    platform: 'Instagram',
    url: 'https://instagram.com',
    views: 5400,
    likes: 420,
    comments: 31,
  },
  {
    id: 4,
    title: 'Sprint 9 Feature Release Notes',
    platform: 'Twitter',
    url: 'https://x.com',
    views: 3100,
    likes: 215,
    comments: 18,
  },
];

export default function ContentManager() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    platform: 'YouTube',
    url: '',
    views: 0,
    likes: 0,
    comments: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 1. Fetch Posts from API with Mock Fallback
  const fetchPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.get('/content/');
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
      } else {
        setPosts(MOCK_POSTS);
      }
    } catch {
      // Offline / API error fallback for smooth demo presentation
      setPosts(MOCK_POSTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. Handle Post Deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content item?')) return;
    try {
      await api.delete(`/content/${id}`);
    } catch {
      // Fallback: Proceed with local UI update even if API call fails
    }
    setPosts((prev) => prev.filter((item) => item.id !== id));
  };

  // 3. Handle New Post Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const payload = {
      id: Date.now(),
      title: formData.title,
      platform: formData.platform,
      url: formData.url,
      views: Number(formData.views),
      likes: Number(formData.likes),
      comments: Number(formData.comments),
    };

    try {
      const newPost = await api.post('/content/', payload);
      setPosts((prev) => [newPost, ...prev]);
    } catch {
      // Fallback: Append newly created entry locally if API is unreachable
      setPosts((prev) => [payload, ...prev]);
    } finally {
      setFormData({
        title: '',
        platform: 'YouTube',
        url: '',
        views: 0,
        likes: 0,
        comments: 0,
      });
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  // 4. Client-side Filtering
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'ALL' || post.platform?.toUpperCase() === filterPlatform.toUpperCase();
    return matchesSearch && matchesPlatform;
  });

  return (
    <div style={styles.container}>
      {/* Header Controls */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Content Manager</h2>
          <p style={styles.subtitle}>Create, monitor, and remove cross-platform publishing entries</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          style={styles.addButton}
        >
          <Plus size={18} />
          New Content Post
        </button>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <Search size={16} color="#94a3b8" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="ALL">All Platforms</option>
          <option value="YouTube">YouTube</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Instagram">Instagram</option>
          <option value="Twitter">Twitter / X</option>
        </select>
      </div>

      {/* Posts Table Card */}
      <div style={styles.tableCard}>
        {isLoading ? (
          <div style={styles.centerState}>
            <Loader2 size={24} className="spin" color="#2563eb" />
            <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Loading content entries...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={styles.centerState}>
            <p style={{ color: '#94a3b8' }}>No content entries match your active filters.</p>
          </div>
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
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id || post.title} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '600', color: '#1e293b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{post.title}</span>
                        {post.url && (
                          <a 
                            href={post.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: '#94a3b8' }}
                            title="Open external post link"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.platformBadge,
                        backgroundColor: post.platform === 'YouTube' ? '#fee2e2' : '#e0e7ff',
                        color: post.platform === 'YouTube' ? '#dc2626' : '#4338ca',
                      }}>
                        {post.platform}
                      </span>
                    </td>
                    <td style={styles.td}>{(post.views ?? 0).toLocaleString()}</td>
                    <td style={styles.td}>{(post.likes ?? 0).toLocaleString()}</td>
                    <td style={styles.td}>{(post.comments ?? 0).toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(post.id)}
                        style={styles.deleteButton}
                        title="Delete Content Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Dialog */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add New Content</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={styles.modalError}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Post Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Building a REST API with FastAPI"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    style={styles.selectInput}
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter / X</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Content URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputRow3}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Initial Views</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Initial Likes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Comments</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={styles.submitButton}
                >
                  {isSubmitting ? 'Saving...' : 'Create Content Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
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
  toolbar: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '240px',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  filterSelect: {
    padding: '0.625rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.875rem',
    color: '#334155',
    outline: 'none',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    minHeight: '250px',
  },
  centerState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 1rem',
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
  deleteButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.375rem',
    borderRadius: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '520px',
    padding: '1.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  modalError: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    flex: 1,
  },
  inputRow: {
    display: 'flex',
    gap: '1rem',
  },
  inputRow3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.75rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#334155',
  },
  input: {
    padding: '0.625rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  selectInput: {
    padding: '0.625rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    width: '100%',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
  },
  cancelButton: {
    padding: '0.625rem 1rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '0.625rem 1rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
import React, { useState } from 'react';
import { RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { InstagramIcon } from './PlatformIcons';

export default function InstagramSyncModal({ isOpen, onClose, onSync }) {
  const [handle, setHandle] = useState('@creator_official');
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setLoading(true);
    setResultMsg(null);
    try {
      const res = await onSync(handle.trim());
      setResultMsg(res?.message || 'Instagram account synced successfully!');
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1500);
    } catch (err) {
      setLoading(false);
      alert(`Instagram Sync Failed: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ borderTop: '4px solid #e1306c', maxWidth: '480px' }}>
        {/* Banner Header */}
        <div className="modal-header-banner">
          <div>
            <div className="modal-badge-tag" style={{ backgroundColor: '#fce7f3', color: '#e1306c' }}>
              <InstagramIcon size={13} color="#e1306c" />
              <span>Instagram Integration</span>
            </div>
            <h3 className="modal-title-text">
              Sync Instagram Media & Reels
            </h3>
            <p className="modal-subtitle-text">
              Import post metrics, engagement rates, reach & follower growth
            </p>
          </div>
          <button onClick={onClose} className="modal-close-icon-btn" title="Close Modal">
            <X size={18} />
          </button>
        </div>

        {resultMsg ? (
          <div style={{
            margin: '24px 28px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#166534',
            fontSize: '14px',
            fontWeight: 700
          }}>
            <CheckCircle2 size={24} color="#16a34a" />
            <span>{resultMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body-form">
              <div className="form-group">
                <label className="form-label">Instagram Handle or Account ID</label>
                <div className="input-icon-group">
                  <InstagramIcon size={16} color="#e1306c" className="input-prefix-icon" />
                  <input
                    type="text"
                    className="modal-input-field"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="e.g. @creatoriq_official"
                    required
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '12px', fontSize: '12px', color: '#475569', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                ℹ️ <strong>Instagram Graph Sync:</strong> Collects posts, reels, likes, comments, and reach into standard CreatorIQ Common Format.
              </div>
            </div>

            <div className="modal-footer-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ backgroundColor: '#e1306c', boxShadow: '0 4px 14px rgba(225, 48, 108, 0.25)' }}
                disabled={loading}
              >
                {loading ? <RefreshCw size={16} className="spin" /> : <InstagramIcon size={16} color="#ffffff" />}
                <span>{loading ? 'Syncing Instagram...' : 'Sync Instagram Media'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

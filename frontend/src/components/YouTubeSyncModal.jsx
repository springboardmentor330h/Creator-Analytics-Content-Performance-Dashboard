import React, { useState } from 'react';
import { RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { YoutubeIcon } from './PlatformIcons';

export default function YouTubeSyncModal({ isOpen, onClose, onSync }) {
  const [channelId, setChannelId] = useState('UC_CreatorIQ_Official');
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channelId.trim()) return;
    setLoading(true);
    setResultMsg(null);
    try {
      const res = await onSync(channelId.trim());
      setResultMsg(res?.message || 'YouTube channel synced successfully!');
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1500);
    } catch (err) {
      setLoading(false);
      alert(`YouTube Sync Failed: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ borderTop: '4px solid #dc2626', maxWidth: '480px' }}>
        {/* Banner Header */}
        <div className="modal-header-banner">
          <div>
            <div className="modal-badge-tag" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <YoutubeIcon size={13} color="#dc2626" />
              <span>YouTube Integration</span>
            </div>
            <h3 className="modal-title-text">
              Sync YouTube Channel
            </h3>
            <p className="modal-subtitle-text">
              Import video metrics, view counts & subscriber growth
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
                <label className="form-label">YouTube Channel ID or Handle</label>
                <div className="input-icon-group">
                  <YoutubeIcon size={16} color="#dc2626" className="input-prefix-icon" />
                  <input
                    type="text"
                    className="modal-input-field"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="e.g. UC_x5XG1OV2P6uZZ5FSM9Ttw"
                    required
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '12px', fontSize: '12px', color: '#475569', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                ℹ️ <strong>Automated Sync:</strong> Pulls video titles, view counts, likes, comments, and subscriber growth logs directly into CreatorIQ.
              </div>
            </div>

            <div className="modal-footer-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ backgroundColor: '#dc2626', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)' }}
                disabled={loading}
              >
                {loading ? <RefreshCw size={16} className="spin" /> : <YoutubeIcon size={16} color="#ffffff" />}
                <span>{loading ? 'Syncing Channel...' : 'Sync YouTube Channel'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContentModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    creator_id: 1,
    platform: 'YouTube',
    content_title: '',
    views: 1000,
    likes: 100,
    comments: 20,
    shares: 10,
    saves: 5,
    watch_time: 500,
    reach: 1200,
    published_date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusAlert, setStatusAlert] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        creator_id: initialData.creator_id || 1,
        platform: initialData.platform || 'YouTube',
        content_title: initialData.content_title || '',
        views: initialData.views ?? 0,
        likes: initialData.likes ?? 0,
        comments: initialData.comments ?? 0,
        shares: initialData.shares ?? 0,
        saves: initialData.saves ?? 0,
        watch_time: initialData.watch_time ?? 0,
        reach: initialData.reach ?? 0,
        published_date: initialData.published_date || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        creator_id: 1,
        platform: 'YouTube',
        content_title: '',
        views: 1000,
        likes: 100,
        comments: 20,
        shares: 10,
        saves: 5,
        watch_time: 500,
        reach: 1200,
        published_date: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
    setStatusAlert(null);
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.content_title || formData.content_title.trim().length < 3) {
      errs.content_title = "Title must be at least 3 characters";
    }
    if (formData.views < 0) errs.views = "Cannot be negative";
    if (formData.likes < 0) errs.likes = "Cannot be negative";
    if (formData.reach < 0) errs.reach = "Cannot be negative";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setStatusAlert(null);

    try {
      const cleanData = {
        ...formData,
        published_date: formData.published_date ? formData.published_date : null
      };

      await onSave(cleanData);

      setStatusAlert({ type: 'success', text: initialData ? 'Content record updated successfully!' : 'Content record created successfully!' });
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 600);
    } catch (err) {
      setIsSubmitting(false);
      setStatusAlert({ type: 'error', text: `Failed: ${err.message}` });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {initialData ? `Edit Content Record #${initialData.id}` : 'Create New Content Record'}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {initialData ? 'Update views, likes, reach, and title' : 'Add new video or post performance metrics'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} color="#64748b" />
          </button>
        </div>

        {statusAlert && (
          <div style={{
            backgroundColor: statusAlert.type === 'success' ? '#f0fdf4' : '#ffe4e6',
            border: `1px solid ${statusAlert.type === 'success' ? '#bbf7d0' : '#fecdd3'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: statusAlert.type === 'success' ? '#166534' : '#be123c',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {statusAlert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusAlert.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full">
            <label className="form-label">Content Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.content_title}
              onChange={(e) => setFormData({ ...formData, content_title: e.target.value })}
              placeholder="e.g. Pawan Kalyan Powerful Speech"
              required
            />
            {errors.content_title && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.content_title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Platform Channel</label>
            <select
              className="form-input"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            >
              <option value="YouTube">YouTube</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="TikTok">TikTok</option>
              <option value="Twitter/X">Twitter/X</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Published Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.published_date || ''}
              onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Views</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={formData.views}
              onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Likes</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={formData.likes}
              onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Comments</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Organic Reach</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={formData.reach}
              onChange={(e) => setFormData({ ...formData, reach: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="modal-actions form-group full">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <RefreshCw size={16} className="spin" /> : null}
              <span>{isSubmitting ? 'Saving Changes...' : initialData ? 'Update Record' : 'Create Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


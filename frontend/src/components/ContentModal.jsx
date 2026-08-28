import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, Video, Eye, ThumbsUp, MessageSquare, Share2, Clock, Globe } from 'lucide-react';

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
      <div className="modal-card" style={{ borderTop: '4px solid #2563eb' }}>
        {/* Banner Header */}
        <div className="modal-header-banner">
          <div>
            <div className="modal-badge-tag" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Video size={13} />
              <span>Content Performance</span>
            </div>
            <h3 className="modal-title-text">
              {initialData ? `Edit Content #${initialData.id}` : 'Create Content Record'}
            </h3>
            <p className="modal-subtitle-text">
              {initialData ? 'Update views, likes, comments & reach metrics' : 'Add new video or social media post performance metrics'}
            </p>
          </div>
          <button onClick={onClose} className="modal-close-icon-btn" title="Close Modal">
            <X size={18} />
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusAlert && (
          <div style={{
            margin: '20px 28px 0 28px',
            backgroundColor: statusAlert.type === 'success' ? '#f0fdf4' : '#ffe4e6',
            border: `1px solid ${statusAlert.type === 'success' ? '#bbf7d0' : '#fecdd3'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: statusAlert.type === 'success' ? '#166534' : '#be123c',
            fontSize: '13px',
            fontWeight: 700
          }}>
            {statusAlert.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{statusAlert.text}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body-form">
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label">Content Title</label>
                <div className="input-icon-group">
                  <Video size={16} className="input-prefix-icon" />
                  <input
                    type="text"
                    className="modal-input-field"
                    value={formData.content_title}
                    onChange={(e) => setFormData({ ...formData, content_title: e.target.value })}
                    placeholder="e.g. 10 Tech Hacks Every Creator Needs"
                    required
                  />
                </div>
                {errors.content_title && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 700 }}>{errors.content_title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Platform Channel</label>
                <div className="input-icon-group">
                  <Globe size={16} className="input-prefix-icon" />
                  <select
                    className="modal-input-field"
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
              </div>

              <div className="form-group">
                <label className="form-label">Published Date</label>
                <div className="input-icon-group">
                  <Clock size={16} className="input-prefix-icon" />
                  <input
                    type="date"
                    className="modal-input-field"
                    value={formData.published_date || ''}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Views</label>
                <div className="input-icon-group">
                  <Eye size={16} className="input-prefix-icon" />
                  <input
                    type="number"
                    className="modal-input-field"
                    min="0"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Likes</label>
                <div className="input-icon-group">
                  <ThumbsUp size={16} className="input-prefix-icon" />
                  <input
                    type="number"
                    className="modal-input-field"
                    min="0"
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Comments</label>
                <div className="input-icon-group">
                  <MessageSquare size={16} className="input-prefix-icon" />
                  <input
                    type="number"
                    className="modal-input-field"
                    min="0"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Organic Reach</label>
                <div className="input-icon-group">
                  <Share2 size={16} className="input-prefix-icon" />
                  <input
                    type="number"
                    className="modal-input-field"
                    min="0"
                    value={formData.reach}
                    onChange={(e) => setFormData({ ...formData, reach: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ backgroundColor: '#2563eb', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }} disabled={isSubmitting}>
              {isSubmitting ? <RefreshCw size={16} className="spin" /> : null}
              <span>{isSubmitting ? 'Saving Changes...' : initialData ? 'Update Content Record' : 'Save Content Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

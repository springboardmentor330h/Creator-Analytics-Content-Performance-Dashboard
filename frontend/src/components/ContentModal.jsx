import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
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
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.content_title || formData.content_title.length < 3) {
      errs.content_title = "Title must be at least 3 characters";
    }
    if (formData.views < 0) errs.views = "Cannot be negative";
    if (formData.likes < 0) errs.likes = "Cannot be negative";
    if (formData.reach < 0) errs.reach = "Cannot be negative";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">{initialData ? 'Edit Content Item' : 'Add Content Item'}</h3>
          <button className="action-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full">
            <label className="form-label">Content Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.content_title}
              onChange={(e) => setFormData({ ...formData, content_title: e.target.value })}
              placeholder="e.g. They Call Him OG - Firestorm Lyric Video"
              required
            />
            {errors.content_title && <span style={{ color: 'red', fontSize: '11px' }}>{errors.content_title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Platform</label>
            <select
              className="form-input"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            >
              <option value="YouTube">YouTube</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="TikTok">TikTok</option>
              <option value="Twitter">Twitter</option>
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
            <label className="form-label">Reach</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={formData.reach}
              onChange={(e) => setFormData({ ...formData, reach: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="modal-actions form-group full">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Content</button>
          </div>
        </form>
      </div>
    </div>
  );
}

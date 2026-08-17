import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AudienceModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    creator_id: 1,
    age_group: '18-30',
    gender: 'Male',
    country: 'United States',
    city: 'New York',
    device_type: 'Desktop',
    active_hour: 18,
    followers: 10000,
    impressions: 50000,
    reach: 40000
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        creator_id: 1,
        age_group: '18-30',
        gender: 'Male',
        country: 'United States',
        city: 'New York',
        device_type: 'Desktop',
        active_hour: 18,
        followers: 10000,
        impressions: 50000,
        reach: 40000
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (formData.followers < 0) errs.followers = "Followers cannot be negative";
    if (formData.reach < 0) errs.reach = "Reach cannot be negative";
    if (formData.impressions < 0) errs.impressions = "Impressions cannot be negative";
    if (formData.active_hour < 0 || formData.active_hour > 23) {
      errs.active_hour = "Active hour must be between 0 and 23";
    }
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
          <h3 className="modal-title">{initialData ? 'Edit Audience Record' : 'Add Audience Record'}</h3>
          <button className="action-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Creator ID</label>
            <input
              type="number"
              className="form-input"
              value={formData.creator_id}
              onChange={(e) => setFormData({ ...formData, creator_id: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Age Group</label>
            <select
              className="form-input"
              value={formData.age_group}
              onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
            >
              <option value="<18">&lt;18</option>
              <option value="18-30">18-30</option>
              <option value="30-45">30-45</option>
              <option value=">45">&gt;45</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-input"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Device Type</label>
            <select
              className="form-input"
              value={formData.device_type}
              onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
            >
              <option value="Desktop">Desktop</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Country</label>
            <input
              type="text"
              className="form-input"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-input"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Active Hour (0-23)</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="23"
              value={formData.active_hour}
              onChange={(e) => setFormData({ ...formData, active_hour: parseInt(e.target.value) || 0 })}
            />
            {errors.active_hour && <span style={{ color: 'red', fontSize: '11px' }}>{errors.active_hour}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Followers</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={formData.followers}
              onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
            />
            {errors.followers && <span style={{ color: 'red', fontSize: '11px' }}>{errors.followers}</span>}
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
            {errors.reach && <span style={{ color: 'red', fontSize: '11px' }}>{errors.reach}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Impressions</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={formData.impressions}
              onChange={(e) => setFormData({ ...formData, impressions: parseInt(e.target.value) || 0 })}
            />
            {errors.impressions && <span style={{ color: 'red', fontSize: '11px' }}>{errors.impressions}</span>}
          </div>

          <div className="modal-actions form-group full">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}

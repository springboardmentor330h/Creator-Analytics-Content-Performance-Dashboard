import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusAlert, setStatusAlert] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        creator_id: initialData.creator_id || 1,
        age_group: initialData.age_group || '18-30',
        gender: initialData.gender || 'Male',
        country: initialData.country || 'United States',
        city: initialData.city || 'New York',
        device_type: initialData.device_type || 'Desktop',
        active_hour: initialData.active_hour ?? 18,
        followers: initialData.followers ?? 10000,
        impressions: initialData.impressions ?? 50000,
        reach: initialData.reach ?? 40000
      });
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
    setStatusAlert(null);
    setIsSubmitting(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setStatusAlert(null);

    try {
      await onSave(formData);
      setStatusAlert({ type: 'success', text: initialData ? 'Audience record updated successfully!' : 'Audience record created successfully!' });
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
              {initialData ? `Edit Audience Record #${initialData.id}` : 'Create Audience Demographic Record'}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {initialData ? 'Update demographics, location, and device metrics' : 'Add new demographic segment'}
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
            <label className="form-label">Active Hour (0-23)</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="23"
              value={formData.active_hour}
              onChange={(e) => setFormData({ ...formData, active_hour: parseInt(e.target.value) || 0 })}
            />
            {errors.active_hour && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.active_hour}</span>}
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
            {errors.followers && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.followers}</span>}
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
            {errors.reach && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.reach}</span>}
          </div>

          <div className="form-group full">
            <label className="form-label">Impressions</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={formData.impressions}
              onChange={(e) => setFormData({ ...formData, impressions: parseInt(e.target.value) || 0 })}
            />
            {errors.impressions && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.impressions}</span>}
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


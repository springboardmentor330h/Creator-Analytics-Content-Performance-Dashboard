import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, Users, Globe, MapPin, Smartphone, Clock, UserCheck, Eye } from 'lucide-react';

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
      <div className="modal-card" style={{ borderTop: '4px solid #8b5cf6' }}>
        {/* Banner Header */}
        <div className="modal-header-banner">
          <div>
            <div className="modal-badge-tag" style={{ backgroundColor: '#f3e8ff', color: '#8b5cf6' }}>
              <Users size={13} />
              <span>Audience Demographics</span>
            </div>
            <h3 className="modal-title-text">
              {initialData ? `Edit Audience Segment #${initialData.id}` : 'Add Audience Record'}
            </h3>
            <p className="modal-subtitle-text">
              {initialData ? 'Update location, age group, device & follower metrics' : 'Add new target audience demographic segment'}
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
              <div className="form-group">
                <label className="form-label">Gender</label>
                <div className="input-icon-group">
                  <UserCheck size={16} className="input-prefix-icon" />
                  <select
                    className="modal-input-field"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Age Group</label>
                <div className="input-icon-group">
                  <Users size={16} className="input-prefix-icon" />
                  <select
                    className="modal-input-field"
                    value={formData.age_group}
                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                  >
                    <option value="<18">&lt;18</option>
                    <option value="18-30">18-30</option>
                    <option value="30-45">30-45</option>
                    <option value=">45">&gt;45</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <div className="input-icon-group">
                  <Globe size={16} className="input-prefix-icon" />
                  <input
                    type="text"
                    className="modal-input-field"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <div className="input-icon-group">
                  <MapPin size={16} className="input-prefix-icon" />
                  <input
                    type="text"
                    className="modal-input-field"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Device Type</label>
                <div className="input-icon-group">
                  <Smartphone size={16} className="input-prefix-icon" />
                  <select
                    className="modal-input-field"
                    value={formData.device_type}
                    onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                  >
                    <option value="Desktop">Desktop</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Tablet">Tablet</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Active Hour (0-23 HRS)</label>
                <div className="input-icon-group">
                  <Clock size={16} className="input-prefix-icon" />
                  <input
                    type="number"
                    className="modal-input-field"
                    min="0"
                    max="23"
                    value={formData.active_hour}
                    onChange={(e) => setFormData({ ...formData, active_hour: parseInt(e.target.value) || 0 })}
                  />
                </div>
                {errors.active_hour && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 700 }}>{errors.active_hour}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Followers Segment</label>
                <div className="input-icon-group">
                  <Users size={16} className="input-prefix-icon" />
                  <input
                    type="number"
                    className="modal-input-field"
                    min="0"
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
                  />
                </div>
                {errors.followers && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 700 }}>{errors.followers}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Reach</label>
                <div className="input-icon-group">
                  <Eye size={16} className="input-prefix-icon" />
                  <input
                    type="number"
                    className="modal-input-field"
                    min="0"
                    value={formData.reach}
                    onChange={(e) => setFormData({ ...formData, reach: parseInt(e.target.value) || 0 })}
                  />
                </div>
                {errors.reach && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 700 }}>{errors.reach}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ backgroundColor: '#8b5cf6', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)' }} disabled={isSubmitting}>
              {isSubmitting ? <RefreshCw size={16} className="spin" /> : null}
              <span>{isSubmitting ? 'Saving Changes...' : initialData ? 'Update Audience Segment' : 'Save Audience Segment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

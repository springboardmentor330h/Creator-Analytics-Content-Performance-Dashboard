import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, Briefcase } from 'lucide-react';

export default function SponsorshipModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    brand_name: '',
    campaign_name: '',
    contract_value: 3000,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'Active',
    payment_status: 'Unpaid',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusAlert, setStatusAlert] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        brand_name: initialData.brand_name || '',
        campaign_name: initialData.campaign_name || '',
        contract_value: initialData.contract_value ?? 3000,
        start_date: initialData.start_date ? initialData.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
        end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
        status: initialData.status || 'Active',
        payment_status: initialData.payment_status || 'Unpaid',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        brand_name: '',
        campaign_name: '',
        contract_value: 3000,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'Active',
        payment_status: 'Unpaid',
        notes: ''
      });
    }
    setErrors({});
    setStatusAlert(null);
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.brand_name.trim()) errs.brand_name = 'Brand name is required';
    if (!formData.campaign_name.trim()) errs.campaign_name = 'Campaign name is required';
    if (!formData.contract_value || Number(formData.contract_value) <= 0) {
      errs.contract_value = 'Contract value must be greater than $0';
    }
    if (!formData.start_date) errs.start_date = 'Start date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setStatusAlert(null);

    try {
      const payload = {
        ...formData,
        contract_value: parseFloat(formData.contract_value),
        end_date: formData.end_date ? formData.end_date : null
      };

      await onSave(payload, initialData?.id);
      setStatusAlert({
        type: 'success',
        text: initialData ? 'Sponsorship contract updated successfully!' : 'Sponsorship deal added successfully!'
      });
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 500);
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
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="#2563eb" />
              <span>{initialData ? `Edit Sponsorship Contract #${initialData.id}` : 'Create Sponsorship Deal'}</span>
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {initialData ? 'Update contract details, status, and payment tracking' : 'Add brand sponsorship contract details and value'}
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
            <label className="form-label">Brand Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Nike, Sony, NordVPN"
              value={formData.brand_name}
              onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
              required
            />
            {errors.brand_name && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.brand_name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Campaign Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Fall Tech Showcase 2026"
              value={formData.campaign_name}
              onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
              required
            />
            {errors.campaign_name && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.campaign_name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contract Value ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              value={formData.contract_value}
              onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
              required
            />
            {errors.contract_value && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.contract_value}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            {errors.start_date && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.start_date}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">End Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deal Status</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Status</label>
            <select
              className="form-input"
              value={formData.payment_status}
              onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
            </select>
          </div>

          <div className="form-group full">
            <label className="form-label">Notes & Deliverables</label>
            <textarea
              className="form-input"
              rows="2"
              placeholder="e.g. 60-second video mid-roll + Instagram Story swipe up"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="modal-actions form-group full">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <RefreshCw size={16} className="spin" /> : null}
              <span>{isSubmitting ? 'Saving Deal...' : initialData ? 'Update Deal' : 'Add Sponsorship Deal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

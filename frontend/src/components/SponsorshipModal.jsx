import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, Briefcase, Award, DollarSign, Calendar, FileText, CheckSquare, CreditCard } from 'lucide-react';

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
      <div className="modal-card" style={{ borderTop: '4px solid #4f46e5' }}>
        {/* Banner Header */}
        <div className="modal-header-banner">
          <div>
            <div className="modal-badge-tag" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
              <Briefcase size={13} />
              <span>Sponsorship Deal</span>
            </div>
            <h3 className="modal-title-text">
              {initialData ? `Edit Sponsorship #${initialData.id}` : 'Create Sponsorship Deal'}
            </h3>
            <p className="modal-subtitle-text">
              {initialData ? 'Update contract terms, campaign dates & payment tracking' : 'Log new brand partnership deal and contract terms'}
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
                <label className="form-label">Brand Name</label>
                <div className="input-icon-group">
                  <Award size={16} className="input-prefix-icon" />
                  <input
                    type="text"
                    className="modal-input-field"
                    placeholder="e.g. Nike, Sony, NordVPN"
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    required
                  />
                </div>
                {errors.brand_name && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 700 }}>{errors.brand_name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Campaign Title</label>
                <div className="input-icon-group">
                  <FileText size={16} className="input-prefix-icon" />
                  <input
                    type="text"
                    className="modal-input-field"
                    placeholder="e.g. Fall Tech Showcase 2026"
                    value={formData.campaign_name}
                    onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                    required
                  />
                </div>
                {errors.campaign_name && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 700 }}>{errors.campaign_name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Contract Value ($)</label>
                <div className="input-icon-group">
                  <DollarSign size={16} className="input-prefix-icon" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="modal-input-field"
                    value={formData.contract_value}
                    onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                    placeholder="3000.00"
                    required
                  />
                </div>
                {errors.contract_value && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 700 }}>{errors.contract_value}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <div className="input-icon-group">
                  <Calendar size={16} className="input-prefix-icon" />
                  <input
                    type="date"
                    className="modal-input-field"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                {errors.start_date && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 700 }}>{errors.start_date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">End Date (Optional)</label>
                <div className="input-icon-group">
                  <Calendar size={16} className="input-prefix-icon" />
                  <input
                    type="date"
                    className="modal-input-field"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deal Status</label>
                <div className="input-icon-group">
                  <CheckSquare size={16} className="input-prefix-icon" />
                  <select
                    className="modal-input-field"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <div className="input-icon-group">
                  <CreditCard size={16} className="input-prefix-icon" />
                  <select
                    className="modal-input-field"
                    value={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                  </select>
                </div>
              </div>

              <div className="form-group full">
                <label className="form-label">Notes & Deliverables</label>
                <div className="input-icon-group">
                  <FileText size={16} className="input-prefix-icon" style={{ top: '16px' }} />
                  <textarea
                    className="modal-input-field"
                    rows="2"
                    placeholder="e.g. 60-second video mid-roll + Instagram Story swipe up"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ resize: 'vertical', paddingTop: '10px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ backgroundColor: '#4f46e5', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }} disabled={isSubmitting}>
              {isSubmitting ? <RefreshCw size={16} className="spin" /> : null}
              <span>{isSubmitting ? 'Saving Deal...' : initialData ? 'Update Sponsorship Deal' : 'Save Sponsorship Deal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

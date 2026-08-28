import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, DollarSign, Calendar, Layers, FileText, Globe } from 'lucide-react';

export default function RevenueModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    source: 'Sponsorships',
    amount: 1500,
    currency: 'USD',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusAlert, setStatusAlert] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        source: initialData.source || 'Sponsorships',
        amount: initialData.amount ?? 1500,
        currency: initialData.currency || 'USD',
        description: initialData.description || '',
        date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        source: 'Sponsorships',
        amount: 1500,
        currency: 'USD',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
    setStatusAlert(null);
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.amount || Number(formData.amount) <= 0) {
      errs.amount = 'Amount must be greater than $0';
    }
    if (!formData.date) {
      errs.date = 'Date is required';
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
      await onSave({
        ...formData,
        amount: parseFloat(formData.amount)
      }, initialData?.id);
      setStatusAlert({
        type: 'success',
        text: initialData ? 'Revenue entry updated successfully!' : 'Revenue entry recorded successfully!'
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
      <div className="modal-card" style={{ borderTop: '4px solid #10b981' }}>
        {/* Banner Header */}
        <div className="modal-header-banner">
          <div>
            <div className="modal-badge-tag" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
              <DollarSign size={13} />
              <span>Revenue Entry</span>
            </div>
            <h3 className="modal-title-text">
              {initialData ? `Edit Revenue #${initialData.id}` : 'Record Revenue Earnings'}
            </h3>
            <p className="modal-subtitle-text">
              {initialData ? 'Modify financial revenue entry details' : 'Log income from ad revenue, sponsorships, affiliates or subscriptions'}
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
                <label className="form-label">Source Stream</label>
                <div className="input-icon-group">
                  <Layers size={16} className="input-prefix-icon" />
                  <select
                    className="modal-input-field"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  >
                    <option value="Sponsorships">Sponsorships</option>
                    <option value="Ad Revenue">Ad Revenue</option>
                    <option value="Affiliate Marketing">Affiliate Marketing</option>
                    <option value="Brand Collaborations">Brand Collaborations</option>
                    <option value="Subscription Revenue">Subscription Revenue</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <div className="input-icon-group">
                  <DollarSign size={16} className="input-prefix-icon" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="modal-input-field"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="1500.00"
                    required
                  />
                </div>
                {errors.amount && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 700 }}>{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <div className="input-icon-group">
                  <Globe size={16} className="input-prefix-icon" />
                  <select
                    className="modal-input-field"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Earnings Date</label>
                <div className="input-icon-group">
                  <Calendar size={16} className="input-prefix-icon" />
                  <input
                    type="date"
                    className="modal-input-field"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                {errors.date && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 700 }}>{errors.date}</span>}
              </div>

              <div className="form-group full">
                <label className="form-label">Description / Notes</label>
                <div className="input-icon-group">
                  <FileText size={16} className="input-prefix-icon" />
                  <input
                    type="text"
                    className="modal-input-field"
                    placeholder="e.g. YouTube AdSense August Payout or Nike Campaign Integration"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ backgroundColor: '#10b981', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }} disabled={isSubmitting}>
              {isSubmitting ? <RefreshCw size={16} className="spin" /> : null}
              <span>{isSubmitting ? 'Saving Earnings...' : initialData ? 'Update Revenue Entry' : 'Save Revenue Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';

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
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="#10b981" />
              <span>{initialData ? `Edit Revenue #${initialData.id}` : 'Record Revenue Earnings'}</span>
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {initialData ? 'Modify financial revenue entry details' : 'Add earnings from sponsorships, ads, affiliates, or subscriptions'}
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
            <label className="form-label">Revenue Source Stream</label>
            <select
              className="form-input"
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

          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            {errors.amount && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Currency</label>
            <select
              className="form-input"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Earnings Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            {errors.date && <span style={{ color: '#be123c', fontSize: '11px', fontWeight: 600 }}>{errors.date}</span>}
          </div>

          <div className="form-group full">
            <label className="form-label">Description / Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. YouTube AdSense August Payout or Nike Campaign Integration"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-actions form-group full">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <RefreshCw size={16} className="spin" /> : null}
              <span>{isSubmitting ? 'Saving Earnings...' : initialData ? 'Update Revenue' : 'Add Revenue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

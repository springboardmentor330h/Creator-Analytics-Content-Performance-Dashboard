import React, { useState, useEffect } from 'react';
import { RefreshCw, X, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { InstagramIcon } from './PlatformIcons';
import { api } from '../api';

export default function InstagramSyncModal({ isOpen, onClose, onSync }) {
  const [handleInput, setHandleInput] = useState('');
  const [savedHandles, setSavedHandles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchHandles = async () => {
    setFetching(true);
    try {
      const accs = await api.getSavedAccounts('Instagram');
      setSavedHandles(Array.isArray(accs) ? accs : []);
    } catch (err) {
      console.error('Failed to load saved Instagram handles', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHandles();
      setResultMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddHandle = async (e) => {
    e.preventDefault();
    if (!handleInput.trim()) return;
    if (savedHandles.length >= 5) {
      setErrorMsg('Maximum limit of 5 saved Instagram handles reached. Delete an existing handle to add a new one.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResultMsg(null);

    try {
      await api.saveSocialAccount('Instagram', handleInput.trim());
      setHandleInput('');
      setResultMsg('Instagram handle saved and synchronized successfully!');
      await fetchHandles();
      if (onSync) onSync(handleInput.trim());
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save Instagram handle');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSingle = async (handle) => {
    setLoading(true);
    setErrorMsg(null);
    setResultMsg(null);
    try {
      if (onSync) await onSync(handle);
      setResultMsg(`Instagram account ${handle} synchronized successfully!`);
      await fetchHandles();
    } catch (err) {
      setErrorMsg(`Sync Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, handle) => {
    if (!window.confirm(`Remove saved Instagram handle ${handle}?`)) return;
    try {
      await api.deleteSavedAccount(id);
      await fetchHandles();
    } catch (err) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ borderTop: '4px solid #e1306c', maxWidth: '540px' }}>
        {/* Banner Header */}
        <div className="modal-header-banner">
          <div>
            <div className="modal-badge-tag" style={{ backgroundColor: '#fce7f3', color: '#e1306c' }}>
              <InstagramIcon size={13} color="#e1306c" />
              <span>Instagram Integration ({savedHandles.length}/5 Saved)</span>
            </div>
            <h3 className="modal-title-text">
              Saved Instagram Handles & Sync
            </h3>
            <p className="modal-subtitle-text">
              Save up to 5 Instagram handles & auto-sync post/reel engagement metrics
            </p>
          </div>
          <button onClick={onClose} className="modal-close-icon-btn" title="Close Modal">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ margin: '16px 24px 0 24px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {resultMsg && (
          <div style={{ margin: '16px 24px 0 24px', backgroundColor: '#f0fdf4', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#16a34a" /> {resultMsg}
          </div>
        )}

        <div className="modal-body-form" style={{ gap: '16px' }}>
          {/* Saved Handles List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Connected Handles ({savedHandles.length}/5)
              </span>
              {fetching && <RefreshCw size={12} className="spin" color="#64748b" />}
            </div>

            {savedHandles.length === 0 ? (
              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px border-dashed #cbd5e1', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                No saved Instagram handles yet. Add your profile handle below.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedHandles.map((acc) => (
                  <div
                    key={acc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <InstagramIcon size={18} color="#e1306c" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {acc.account_name || acc.account_handle}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {acc.account_handle}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleSyncSingle(acc.account_handle)}
                        disabled={loading}
                        style={{
                          backgroundColor: '#fce7f3',
                          color: '#e1306c',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Sync Handle Now"
                      >
                        <RefreshCw size={12} className={loading ? 'spin' : ''} /> Sync
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(acc.id, acc.account_handle)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer'
                        }}
                        title="Delete Handle"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Handle Form */}
          {savedHandles.length < 5 && (
            <form onSubmit={handleAddHandle} style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Add Instagram Handle (or Profile Link)</label>
                <div className="input-icon-group">
                  <InstagramIcon size={16} color="#e1306c" className="input-prefix-icon" />
                  <input
                    type="text"
                    className="modal-input-field"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    placeholder="e.g. @creatoriq_official"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ backgroundColor: '#e1306c', boxShadow: '0 4px 14px rgba(225, 48, 108, 0.25)', width: '100%', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? <RefreshCw size={16} className="spin" /> : <Plus size={16} />}
                <span>{loading ? 'Saving & Syncing...' : 'Save & Connect Handle'}</span>
              </button>
            </form>
          )}
        </div>

        <div className="modal-footer-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

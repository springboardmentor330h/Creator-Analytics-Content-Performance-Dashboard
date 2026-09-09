import React, { useState, useEffect } from 'react';
import { RefreshCw, X, CheckCircle2, Trash2, Plus, Share2 } from 'lucide-react';
import { YoutubeIcon, InstagramIcon, TikTokIcon, LinkedInIcon, TwitterIcon } from './PlatformIcons';
import { api } from '../api';

const PLATFORM_CONFIGS = {
  YouTube: { icon: YoutubeIcon, color: '#dc2626', bg: '#fee2e2', placeholder: 'e.g. @mkbhd or https://youtube.com/@mkbhd' },
  Instagram: { icon: InstagramIcon, color: '#be185d', bg: '#fce7f3', placeholder: 'e.g. @cristiano or https://instagram.com/cristiano' },
  LinkedIn: { icon: LinkedInIcon, color: '#1d4ed8', bg: '#eff6ff', placeholder: 'e.g. satyanadella or https://linkedin.com/in/satyanadella' },
  Facebook: { icon: Share2, color: '#2563eb', bg: '#eff6ff', placeholder: 'e.g. zuck or https://facebook.com/zuck' },
  X: { icon: TwitterIcon, color: '#0284c7', bg: '#e0f2fe', placeholder: 'e.g. @openai or https://x.com/openai' }
};

export default function PlatformSyncModal({ isOpen, onClose, platform = 'YouTube', onSync }) {
  const [handleInput, setHandleInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.YouTube;
  const IconComp = config.icon;

  const fetchAccounts = async () => {
    if (!platform) return;
    setFetching(true);
    try {
      const accs = await api.getSavedAccounts(platform);
      setSavedAccounts(Array.isArray(accs) ? accs : []);
    } catch (err) {
      console.error(`Failed to load saved ${platform} accounts`, err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      setResultMsg(null);
      setErrorMsg(null);
      setHandleInput('');
      setNameInput('');
    }
  }, [isOpen, platform]);

  if (!isOpen) return null;

  const handleAddAccount = async (e) => {
    e.preventDefault();
    const handleClean = handleInput.trim();
    if (!handleClean) return;

    if (savedAccounts.length >= 5) {
      setErrorMsg(`Maximum limit of 5 saved ${platform} channels/handles reached. Delete an existing account to add a new one.`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResultMsg(null);

    try {
      await api.saveSocialAccount(platform, handleClean, nameInput.trim() || undefined);
      setHandleInput('');
      setNameInput('');
      setResultMsg(`${platform} account '${handleClean}' saved & synchronized successfully!`);
      await fetchAccounts();
      if (onSync) onSync(platform, handleClean);
    } catch (err) {
      setErrorMsg(err.message || `Failed to save ${platform} account`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSingle = async (handle) => {
    setLoading(true);
    setErrorMsg(null);
    setResultMsg(null);
    try {
      if (onSync) await onSync(platform, handle);
      setResultMsg(`${platform} account '${handle}' synchronized successfully!`);
      await fetchAccounts();
    } catch (err) {
      setErrorMsg(`Sync Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, handle) => {
    if (!window.confirm(`Remove saved ${platform} account ${handle}?`)) return;
    try {
      await api.deleteSavedAccount(id);
      await fetchAccounts();
    } catch (err) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-card" style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '540px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        position: 'relative',
        borderTop: `4px solid ${config.color}`
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: config.bg,
              color: config.color,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '6px'
            }}>
              <IconComp size={14} color={config.color} />
              <span>{platform} Integration ({savedAccounts.length}/5 Saved)</span>
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Add & Sync {platform} Account
            </h3>
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

        {/* Notifications */}
        {resultMsg && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '14px',
            color: '#166534',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>{resultMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '14px',
            color: '#991b1b',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {errorMsg}
          </div>
        )}

        {/* Add Account Form */}
        <form onSubmit={handleAddAccount} style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            Add New {platform} User ID, Handle or Link
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                User ID / Handle / Profile URL
              </label>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder={config.placeholder}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Optional Custom Display Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={`e.g. My Official ${platform}`}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '4px',
                padding: '9px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: config.color,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {loading ? <RefreshCw size={14} className="spin" /> : <Plus size={14} />}
              <span>Save & Sync {platform} Channel</span>
            </button>
          </div>
        </form>

        {/* Saved Accounts List */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            Saved {platform} Accounts ({savedAccounts.length}/5)
          </h4>

          {fetching ? (
            <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '13px' }}>
              Loading saved accounts...
            </div>
          ) : savedAccounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '13px' }}>
              No saved {platform} accounts yet. Add your user ID or profile link above to start tracking.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {savedAccounts.map((acc) => (
                <div
                  key={acc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconComp size={18} color={config.color} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {acc.account_name || acc.account_handle}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Handle/ID: {acc.account_handle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleSyncSingle(acc.account_handle)}
                      disabled={loading}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#334155',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RefreshCw size={12} className={loading ? 'spin' : ''} />
                      <span>Sync</span>
                    </button>

                    <button
                      onClick={() => handleDelete(acc.id, acc.account_handle)}
                      style={{
                        padding: '5px',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        cursor: 'pointer'
                      }}
                      title="Delete account"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

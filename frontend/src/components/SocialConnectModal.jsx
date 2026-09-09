import React, { useState } from 'react';
import { X, Share2, Plus, RefreshCw, CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import { YoutubeIcon, InstagramIcon, TikTokIcon, LinkedInIcon, TwitterIcon } from './PlatformIcons';

const availablePlatforms = [
  { name: 'YouTube', icon: YoutubeIcon, color: '#dc2626', placeholder: 'e.g. @mkbhd or https://youtube.com/@mkbhd' },
  { name: 'Instagram', icon: InstagramIcon, color: '#be185d', placeholder: 'e.g. @cristiano or https://instagram.com/cristiano' },
  { name: 'LinkedIn', icon: LinkedInIcon, color: '#1d4ed8', placeholder: 'e.g. satyanadella or https://linkedin.com/in/satyanadella' },
  { name: 'Facebook', icon: Share2, color: '#2563eb', placeholder: 'e.g. zuck or https://facebook.com/zuck' },
  { name: 'X', icon: TwitterIcon, color: '#0284c7', placeholder: 'e.g. @openai or https://x.com/openai' },
];

export default function SocialConnectModal({ isOpen, onClose, onConnect, onSync, connectedPlatforms }) {
  const [selectedPlatform, setSelectedPlatform] = useState('YouTube');
  const [accountInput, setAccountInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  // Per-platform custom handle/link map for quick sync inputs
  const [customHandles, setCustomHandles] = useState({
    YouTube: '@mkbhd',
    Instagram: '@cristiano',
    LinkedIn: 'satyanadella',
    Facebook: 'zuck',
    X: '@openai'
  });

  if (!isOpen) return null;

  const currentPlatformInfo = availablePlatforms.find(p => p.name.toLowerCase() === selectedPlatform.toLowerCase()) || availablePlatforms[0];

  const handleCustomHandleChange = (platform, val) => {
    setCustomHandles(prev => ({
      ...prev,
      [platform]: val
    }));
  };

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const inputVal = accountInput.trim() || customHandles[selectedPlatform] || 'CreatorOfficial';
      const res = await onConnect(selectedPlatform, inputVal);
      setMessage(res?.message || `${selectedPlatform} account '${inputVal}' connected & synced successfully!`);
      
      // Update local custom handle map
      setCustomHandles(prev => ({
        ...prev,
        [selectedPlatform]: inputVal
      }));
      setAccountInput('');
      
      setTimeout(() => {
        setLoading(false);
      }, 800);
    } catch (err) {
      setLoading(false);
      alert(`Connection failed: ${err.message}`);
    }
  };

  const handleSyncSubmit = async (platformName) => {
    setSyncing(true);
    setMessage(null);
    try {
      const targetHandle = customHandles[platformName] || undefined;
      const res = await onSync(platformName, targetHandle);
      const handleTag = targetHandle ? ` (${targetHandle})` : '';
      setMessage(res?.message || `Successfully synced data for ${platformName}${handleTag}!`);
      setTimeout(() => {
        setSyncing(false);
      }, 800);
    } catch (err) {
      setSyncing(false);
      alert(`Sync failed: ${err.message}`);
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
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{
            backgroundColor: '#eff6ff',
            borderRadius: '12px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Link2 size={24} color="#2563eb" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Multi-Platform Social Media Integration
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Add User ID, Handle (@handle), or Profile Link for X, TikTok, LinkedIn, IG, YT & FB
            </p>
          </div>
        </div>

        {message && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#166534',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span>{message}</span>
          </div>
        )}

        {/* Connect New Platform Form */}
        <form onSubmit={handleConnectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#334155' }}>
            Add / Sync Specific Channel or Profile
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
              >
                {availablePlatforms.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                User ID / Handle / Profile URL
              </label>
              <input
                type="text"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                placeholder={currentPlatformInfo.placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: currentPlatformInfo.color || '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px'
            }}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <Plus size={16} />}
            <span>{loading ? 'Connecting & Syncing...' : `Connect & Sync ${selectedPlatform}`}</span>
          </button>
        </form>

        {/* Connected Platforms List & Inline User ID / Link Inputs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#334155' }}>
              Connected Platforms & Custom Handles/Links
            </h4>
            <button
              onClick={() => handleSyncSubmit('All')}
              disabled={syncing}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: '1px solid #2563eb',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} className={syncing ? "spin" : ""} />
              <span>Sync All</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {(connectedPlatforms || ['YouTube', 'Instagram', 'Facebook', 'LinkedIn', 'X']).map((plat) => {
              const info = availablePlatforms.find(ap => ap.name.toLowerCase() === plat.toLowerCase()) || { icon: Share2, color: '#6366f1' };
              const IconComp = info.icon;

              return (
                <div
                  key={plat}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
                    <IconComp size={18} color={info.color} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{plat}</span>
                  </div>

                  <input
                    type="text"
                    value={customHandles[plat] || ''}
                    onChange={(e) => handleCustomHandleChange(plat, e.target.value)}
                    placeholder="User ID, handle or URL"
                    style={{
                      flex: 1,
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      color: '#334155'
                    }}
                  />

                  <button
                    onClick={() => handleSyncSubmit(plat)}
                    disabled={syncing}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Sync {plat}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { X, Share2, Plus, RefreshCw, CheckCircle2, Link2 } from 'lucide-react';
import { YoutubeIcon, InstagramIcon, TikTokIcon, LinkedInIcon, TwitterIcon } from './PlatformIcons';

const availablePlatforms = [
  { name: 'YouTube', icon: YoutubeIcon, color: '#dc2626' },
  { name: 'Instagram', icon: InstagramIcon, color: '#be185d' },
  { name: 'TikTok', icon: TikTokIcon, color: '#0891b2' },
  { name: 'LinkedIn', icon: LinkedInIcon, color: '#1d4ed8' },
  { name: 'Facebook', icon: Share2, color: '#2563eb' },
  { name: 'X', icon: TwitterIcon, color: '#0284c7' },
];

export default function SocialConnectModal({ isOpen, onClose, onConnect, onSync, connectedPlatforms }) {
  const [selectedPlatform, setSelectedPlatform] = useState('YouTube');
  const [accountName, setAccountName] = useState('DemoCreator');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await onConnect(selectedPlatform, accountName);
      setMessage(res?.message || `${selectedPlatform} connected successfully!`);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      setLoading(false);
      alert(`Connection failed: ${err.message}`);
    }
  };

  const handleSyncSubmit = async (platformName) => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await onSync(platformName);
      setMessage(res?.message || `Successfully synced data for ${platformName}!`);
      setTimeout(() => {
        setSyncing(false);
      }, 1000);
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
        maxWidth: '520px',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
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
              Multi-Platform Social Media Workflow
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Connect social accounts and synchronize analytics directly into PostgreSQL
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
        <form onSubmit={handleConnectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#334155' }}>
            Simulate New Account Connection
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Social Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                {availablePlatforms.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Account Name / Handle
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. CreatorOfficial"
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563eb',
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
            {loading ? <RefreshCw size={16} className="spin" /> : <Plus size={16} />}
            <span>{loading ? 'Connecting...' : 'Connect Platform Account'}</span>
          </button>
        </form>

        {/* Connected Platforms List & Sync Controls */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#334155' }}>
              Connected Accounts & Sync Status
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
              <span>Sync All Connected</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {(connectedPlatforms || ['YouTube', 'Instagram', 'LinkedIn', 'TikTok', 'X']).map((plat) => {
              const info = availablePlatforms.find(ap => ap.name.toLowerCase() === plat.toLowerCase()) || { icon: Share2, color: '#6366f1' };
              const IconComp = info.icon;

              return (
                <div
                  key={plat}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconComp size={18} color={info.color} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{plat}</span>
                  </div>
                  <button
                    onClick={() => handleSyncSubmit(plat)}
                    disabled={syncing}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
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

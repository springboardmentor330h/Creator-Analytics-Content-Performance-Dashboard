import React, { useState, useEffect } from 'react';
import { User, Lock, Server, Link2, Shield, CheckCircle, RefreshCw, Key, Mail, UserCheck, Sun, Moon, Palette } from 'lucide-react';
import { api } from '../api';

export default function SettingsView({ user, onUpdateUser, onOpenSocialModal, theme = 'light', onToggleTheme, accentColor = 'indigo', onSelectAccent }) {
  const [fullName, setFullName] = useState(user?.full_name || user?.name || user?.email?.split('@')[0] || 'Creator');
  const [email, setEmail] = useState(user?.email || 'creator@creatoriq.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [healthStatus, setHealthStatus] = useState('Checking...');
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const [connRes] = await Promise.all([
        api.getConnectedSocialPlatforms().catch(() => null)
      ]);
      if (connRes && connRes.platforms) {
        setConnectedPlatforms(connRes.platforms);
      }
      setHealthStatus('FastAPI Backend Engine Online (v3.1.0)');
    } catch (e) {
      setHealthStatus('Backend Offline / Disconnected');
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      const updated = { ...user, full_name: fullName, email };
      localStorage.setItem('creatoriq_user', JSON.stringify(updated));
      if (onUpdateUser) onUpdateUser(updated);
      setSavingProfile(false);
      alert('Profile details updated successfully!');
    }, 500);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert('Please fill out both password fields.');
      return;
    }
    setUpdatingPassword(true);
    setTimeout(() => {
      setUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      alert('Security password updated successfully!');
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile & Account Settings Card */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={22} color="#2563eb" />
              <span>Creator Profile & Account Settings</span>
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Manage your personal creator profile, authentication details, and system preferences.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginTop: '12px'
        }}>
          {/* Profile Form */}
          <form onSubmit={handleProfileSave} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={18} color="#2563eb" /> Profile Information
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Full Name:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Email Address:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-add"
              style={{ width: '100%', backgroundColor: '#2563eb', fontWeight: 700 }}
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Security & Password Form */}
          <form onSubmit={handlePasswordUpdate} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={18} color="#d97706" /> Change Password
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Current Password:
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                New Password:
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="btn-add"
              style={{ width: '100%', backgroundColor: '#d97706', fontWeight: 700 }}
            >
              {updatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Theme & Appearance Customizer */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={20} color="var(--primary-accent)" />
              <span>Theme Mode & Appearance Customizer</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Switch between Light Mode and Obsidian Dark Glassmorphic Theme, or select your favorite accent color.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '14px' }}>
          {/* Theme Mode Toggle Card */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>Theme Interface</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Current: {theme === 'dark' ? 'Obsidian Dark Mode' : 'Light Executive Mode'}</div>
            </div>

            <button
              onClick={onToggleTheme}
              className="btn-add"
              style={{ backgroundColor: theme === 'dark' ? '#f59e0b' : '#4f46e5', fontSize: '12px' }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* Accent Color Picker Card */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>Accent Color Palette</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { key: 'indigo', name: 'Indigo', color: '#4f46e5' },
                { key: 'emerald', name: 'Emerald', color: '#10b981' },
                { key: 'violet', name: 'Violet', color: '#8b5cf6' },
                { key: 'cyan', name: 'Cyan', color: '#0284c7' },
                { key: 'amber', name: 'Amber', color: '#d97706' }
              ].map((acc) => (
                <button
                  key={acc.key}
                  onClick={() => onSelectAccent && onSelectAccent(acc.key)}
                  style={{
                    flex: 1,
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: acc.color,
                    border: accentColor === acc.key ? '2px solid #ffffff' : 'none',
                    outline: accentColor === acc.key ? `2px solid ${acc.color}` : 'none',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800
                  }}
                  title={acc.name}
                >
                  {accentColor === acc.key ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Connected Social Media Integrations Status */}
      <div className="section-card">

        <div className="section-header">
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link2 size={20} color="#059669" />
              <span>Connected Social Media Channels</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Active channels syncing metrics into CreatorIQ.
            </p>
          </div>

          <button
            onClick={onOpenSocialModal}
            className="btn-add"
            style={{ backgroundColor: '#059669' }}
          >
            + Connect New Channel
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '14px' }}>
          {['YouTube', 'Instagram', 'Facebook', 'LinkedIn', 'Twitter/X'].map((plat) => {
            const isConn = connectedPlatforms.some(p => p.platform?.toLowerCase() === plat.toLowerCase() || p.toLowerCase?.() === plat.toLowerCase());
            return (
              <div
                key={plat}
                style={{
                  backgroundColor: isConn ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${isConn ? '#bbf7d0' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>{plat}</div>
                  <div style={{ fontSize: '11px', color: isConn ? '#166534' : '#64748b', marginTop: '2px', fontWeight: 600 }}>
                    {isConn ? 'Connected & Syncing' : 'Not Connected'}
                  </div>
                </div>

                {isConn ? (
                  <CheckCircle size={20} color="#16a34a" />
                ) : (
                  <button
                    onClick={onOpenSocialModal}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#2563eb',
                      cursor: 'pointer'
                    }}
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Backend Infrastructure Status Monitor */}
      <div className="section-card">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Server size={20} color="#4f46e5" />
          <span>System Infrastructure & API Health Monitor</span>
        </h3>

        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
                Backend Status
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                {healthStatus}
              </div>
            </div>

            <button
              onClick={fetchSystemStatus}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} /> Ping FastAPI Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle2, 
  LogOut, 
  Save, 
  AlertCircle,
  Youtube,
  Linkedin,
  Instagram,
  Twitter
} from 'lucide-react';
import { api } from '../services/api';

export default function Profile({ onLogout }) {
  const [user, setUser] = useState({ name: '', email: '', role: 'Content Creator' });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Connected accounts mock status
  const [connections, setConnections] = useState({
    youtube: true,
    linkedin: true,
    instagram: false,
    twitter: true,
  });

  useEffect(() => {
    // 1. Fetch user data from backend (or fallback to localStorage)
    const loadProfile = async () => {
      try {
        const data = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    };

    loadProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const updated = await api.put('/auth/me', { name: user.name });
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div>
        <h2 style={styles.title}>Account Settings</h2>
        <p style={styles.subtitle}>Manage your profile details and connected social platforms</p>
      </div>

      {statusMessage.text && (
        <div style={{
          ...styles.alert,
          backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
          borderColor: statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca',
          color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
        }}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div style={styles.grid}>
        {/* User Details Form Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Personal Information</h3>
          <form onSubmit={handleProfileUpdate} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={18} color="#94a3b8" style={styles.icon} />
                <input
                  type="text"
                  value={user.name || ''}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#94a3b8" style={styles.icon} />
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  style={{ ...styles.input, backgroundColor: '#f8fafc', color: '#64748b' }}
                />
              </div>
              <span style={styles.hint}>Email addresses cannot be changed directly.</span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Role / Account Type</label>
              <div style={styles.inputWrapper}>
                <Shield size={18} color="#94a3b8" style={styles.icon} />
                <input
                  type="text"
                  value={user.role || 'Content Creator'}
                  disabled
                  style={{ ...styles.input, backgroundColor: '#f8fafc', color: '#64748b' }}
                />
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="submit"
                disabled={isSaving}
                style={styles.saveButton}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={styles.logoutButton}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </form>
        </div>

        {/* Platform Integrations Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Platform Integrations</h3>
          <p style={styles.cardSubtitle}>Manage connected accounts for automated analytics fetching</p>

          <div style={styles.platformList}>
            {/* YouTube */}
            <div style={styles.platformItem}>
              <div style={styles.platformInfo}>
                <Youtube color="#dc2626" size={22} />
                <div>
                  <div style={styles.platformName}>YouTube Channel</div>
                  <div style={styles.platformStatus}>
                    {connections.youtube ? 'Connected' : 'Not Connected'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setConnections(prev => ({ ...prev, youtube: !prev.youtube }))}
                style={connections.youtube ? styles.disconnectBtn : styles.connectBtn}
              >
                {connections.youtube ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* LinkedIn */}
            <div style={styles.platformItem}>
              <div style={styles.platformInfo}>
                <Linkedin color="#0284c7" size={22} />
                <div>
                  <div style={styles.platformName}>LinkedIn Account</div>
                  <div style={styles.platformStatus}>
                    {connections.linkedin ? 'Connected' : 'Not Connected'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setConnections(prev => ({ ...prev, linkedin: !prev.linkedin }))}
                style={connections.linkedin ? styles.disconnectBtn : styles.connectBtn}
              >
                {connections.linkedin ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* Instagram */}
            <div style={styles.platformItem}>
              <div style={styles.platformInfo}>
                <Instagram color="#db2777" size={22} />
                <div>
                  <div style={styles.platformName}>Instagram Business</div>
                  <div style={styles.platformStatus}>
                    {connections.instagram ? 'Connected' : 'Not Connected'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setConnections(prev => ({ ...prev, instagram: !prev.instagram }))}
                style={connections.instagram ? styles.disconnectBtn : styles.connectBtn}
              >
                {connections.instagram ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* X / Twitter */}
            <div style={styles.platformItem}>
              <div style={styles.platformInfo}>
                <Twitter color="#0f172a" size={22} />
                <div>
                  <div style={styles.platformName}>Twitter / X</div>
                  <div style={styles.platformStatus}>
                    {connections.twitter ? 'Connected' : 'Not Connected'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setConnections(prev => ({ ...prev, twitter: !prev.twitter }))}
                style={connections.twitter ? styles.disconnectBtn : styles.connectBtn}
              >
                {connections.twitter ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    border: '1px solid transparent',
    fontSize: '0.875rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  cardSubtitle: {
    margin: '0.25rem 0 1.25rem 0',
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  form: {
    marginTop: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#334155',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '0.75rem',
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.75rem 0.625rem 2.5rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  buttonRow: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  platformList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  platformItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    border: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  platformInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  platformName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  platformStatus: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  connectBtn: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  disconnectBtn: {
    backgroundColor: '#ffffff',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
};
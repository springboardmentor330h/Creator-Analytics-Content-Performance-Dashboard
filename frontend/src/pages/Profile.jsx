import { useEffect, useState } from 'react';

export default function Profile({ onLogout }) {
  const [user, setUser] = useState({
    full_name: 'Demo Creator',
    email: 'demo@creatoriq.com',
    role: 'Creator',
    bio: 'Helping brands turn storytelling into measurable growth across YouTube and Instagram.',
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Could not parse saved user:', error);
      }
    }
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <p style={styles.eyebrow}>Creator Settings</p>
            <h1 style={styles.title}>Profile</h1>
          </div>
          {onLogout && (
            <button onClick={onLogout} style={styles.logoutButton}>Sign Out</button>
          )}
        </div>

        <div style={styles.profileBody}>
          <div style={styles.avatar}>{user.full_name?.charAt(0)?.toUpperCase() || 'C'}</div>

          <div style={styles.infoGrid}>
            <ProfileField label="Full Name" value={user.full_name} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Role" value={user.role} />
          </div>
        </div>

        <div style={styles.bioCard}>
          <h3 style={styles.bioTitle}>Bio</h3>
          <p style={styles.bioText}>{user.bio}</p>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{label}</div>
      <div style={styles.fieldValue}>{value || 'Not available'}</div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0.5rem 0'
  },
  card: {
    width: '100%',
    maxWidth: '900px',
    background: '#fff',
    borderRadius: '18px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
    padding: '1.5rem'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  eyebrow: {
    margin: 0,
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#64748b'
  },
  title: {
    margin: '0.25rem 0 0',
    color: '#0f172a',
    fontSize: '2rem'
  },
  logoutButton: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.8rem 1rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  profileBody: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    marginTop: '1.5rem',
    flexWrap: 'wrap'
  },
  avatar: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 700
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    flex: 1
  },
  field: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '0.9rem 1rem'
  },
  fieldLabel: {
    color: '#64748b',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.4rem'
  },
  fieldValue: {
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: 600
  },
  bioCard: {
    marginTop: '1.5rem',
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '1rem 1.2rem'
  },
  bioTitle: {
    margin: '0 0 0.5rem',
    color: '#0f172a'
  },
  bioText: {
    margin: 0,
    color: '#475569',
    lineHeight: 1.6
  }
};

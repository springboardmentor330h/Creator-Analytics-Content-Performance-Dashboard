import React, { useState } from 'react';
import { api } from '../api';
import { LogIn, UserPlus, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function AuthView({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('creator');

  // Status & Errors
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLoginMode) {
        // Login Flow
        const res = await api.login(email, password);
        if (res && res.access_token) {
          localStorage.setItem('creatoriq_token', res.access_token);
          localStorage.setItem('creatoriq_user', JSON.stringify({ email }));
          onLoginSuccess(email);
        }
      } else {
        // Registration Flow
        const res = await api.register(fullName, email, password, role);
        setSuccessMsg('Account created successfully! Please sign in with your credentials.');
        setIsLoginMode(true);
        setPassword('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '680px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRadius: '24px',
      padding: '40px 20px'
    }}>
      <div className="modal-card" style={{ maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(15,23,42,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div className="brand-icon" style={{ margin: '0 auto 12px auto', width: '48px', height: '48px', fontSize: '22px' }}>IQ</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
            {isLoginMode ? 'Welcome Back to CreatorIQ' : 'Create Your Creator Account'}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            {isLoginMode ? 'Sign in to access your live analytics dashboard' : 'Join thousands of creators tracking growth trends'}
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#ffe4e6',
            color: '#be123c',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#047857',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="search-bar" style={{ width: '100%' }}>
                <UserIcon size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="e.g. Siriki Revanth"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-bar" style={{ width: '100%' }}>
              <Mail size={16} color="#94a3b8" />
              <input
                type="email"
                placeholder="creator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="search-bar" style={{ width: '100%' }}>
              <Lock size={16} color="#94a3b8" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="creator">Content Creator</option>
                <option value="agency">Influencer Agency</option>
                <option value="marketing">Marketing Team</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', fontSize: '15px' }}
          >
            {loading ? (
              <span>Connecting to Backend...</span>
            ) : isLoginMode ? (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }}
          >
            {isLoginMode ? 'Register Now' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

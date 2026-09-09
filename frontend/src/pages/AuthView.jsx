import React, { useState } from 'react';
import { api } from '../api';
import { LogIn, UserPlus, ShieldCheck, Mail, Lock, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { Spinner } from '../components/Loader';

export default function AuthView({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('creator');
  const [rememberMe, setRememberMe] = useState(true);

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
          const userObj = res.user || { email, name: email.split('@')[0] };
          onLoginSuccess(userObj);
        } else {
          throw new Error('Invalid authentication response from server');
        }
      } else {
        // Registration Flow
        const res = await api.register(fullName, email, password, role);
        if (res && res.access_token) {
          setSuccessMsg('Account registered successfully! Signing you in...');
          setTimeout(() => {
            const userObj = res.user || { email, name: fullName || email.split('@')[0] };
            onLoginSuccess(userObj);
          }, 800);
        } else {
          setSuccessMsg('Account created successfully! Please sign in with your credentials.');
          setIsLoginMode(true);
          setPassword('');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 70%)',
      padding: '24px',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      overflowY: 'auto'
    }}>
      {/* Outer Card */}
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        animation: 'slideUpScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            className="brand-icon pulse-glow"
            style={{
              margin: '0 auto 14px auto',
              width: '56px',
              height: '56px',
              fontSize: '24px',
              borderRadius: '16px'
            }}
          >
            IQ
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {isLoginMode ? 'Welcome Back to CreatorIQ' : 'Create Your Account'}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
            {isLoginMode
              ? 'Sign in to access your live multi-platform creator analytics'
              : 'Join thousands of creators tracking real-time growth performance'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '10px',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '9px',
              cursor: 'pointer',
              background: isLoginMode ? '#ffffff' : 'transparent',
              color: isLoginMode ? '#4f46e5' : '#64748b',
              boxShadow: isLoginMode ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '10px',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '9px',
              cursor: 'pointer',
              background: !isLoginMode ? '#ffffff' : 'transparent',
              color: !isLoginMode ? '#4f46e5' : '#64748b',
              boxShadow: !isLoginMode ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#fff1f2',
            color: '#be123c',
            border: '1px solid #fecdd3',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            backgroundColor: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLoginMode && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Full Name
              </label>
              <div className="input-icon-group">
                <UserIcon size={18} className="input-prefix-icon" />
                <input
                  type="text"
                  className="modal-input-field"
                  placeholder="e.g. Siriki Revanth"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLoginMode}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Email Address
            </label>
            <div className="input-icon-group">
              <Mail size={18} className="input-prefix-icon" />
              <input
                type="email"
                className="modal-input-field"
                placeholder="creator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div className="input-icon-group">
              <Lock size={18} className="input-prefix-icon" />
              <input
                type="password"
                className="modal-input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLoginMode && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Account Role
              </label>
              <select
                className="modal-input-field"
                style={{ paddingLeft: '16px' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="creator">Content Creator</option>
                <option value="agency">Influencer Agency</option>
                <option value="marketing">Marketing Specialist</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          )}

          {/* 30-Day Session Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#4f46e5', cursor: 'pointer' }}
              />
              <span>Remember me (30-day JWT session)</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justify: 'center',
              padding: '13px',
              marginTop: '8px',
              fontSize: '15px',
              borderRadius: '12px'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spinner size="sm" color="#ffffff" />
                <span>{isLoginMode ? 'Signing In...' : 'Creating Account...'}</span>
              </div>
            ) : isLoginMode ? (
              <>
                <LogIn size={18} />
                <span>Sign In to Workspace</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Complete Registration</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#10b981' }} />
          <span>Secured with 256-bit JWT authentication & SSL</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('demo@creatoriq.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = registering
        ? await api.post('/auth/register', { email, password, full_name: fullName, role: 'Creator' })
        : await api.post('/auth/login', { email, password });
      onLoginSuccess(result.access_token, {
        id: result.user_id,
        name: result.full_name || result.name,
        role: result.role,
      });
    } catch (requestError) {
      setError(requestError.message || (registering ? 'Unable to create account.' : 'Unable to sign in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>{registering ? 'Create account' : 'Login'}</h2>
        {registering && <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          Full name
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required style={{ width: '100%', marginTop: '0.25rem', padding: '0.75rem' }} />
        </label>}
        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={{ width: '100%', marginTop: '0.25rem', padding: '0.75rem' }} />
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ width: '100%', marginTop: '0.25rem', padding: '0.75rem' }} />
        </label>
        {error && <p role="alert" style={{ color: '#b91c1c', margin: '0 0 1rem' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px' }}>
          {loading ? (registering ? 'Creating account...' : 'Signing in...') : (registering ? 'Create account' : 'Sign In')}
        </button>
        <button type="button" onClick={() => { setRegistering((current) => !current); setError(''); }} style={{ width: '100%', marginTop: '0.75rem', padding: '0.65rem', background: 'transparent', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer' }}>
          {registering ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </form>
    </div>
  );
}

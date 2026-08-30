export default function Login({ onLoginSuccess }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess('demo-token', { name: 'Demo User' });
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
        <h2 style={{ marginBottom: '1rem' }}>Login</h2>
        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          Email
          <input type="email" defaultValue="demo@creatoriq.com" style={{ width: '100%', marginTop: '0.25rem', padding: '0.75rem' }} />
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Password
          <input type="password" defaultValue="password" style={{ width: '100%', marginTop: '0.25rem', padding: '0.75rem' }} />
        </label>
        <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px' }}>
          Sign In
        </button>
      </form>
    </div>
  );
}

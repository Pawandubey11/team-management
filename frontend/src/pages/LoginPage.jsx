import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-200px', right: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '56px', height: '56px', background: 'var(--accent)',
            borderRadius: '14px', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)',
            boxShadow: '0 0 40px var(--accent-glow)'
          }}>N</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '28px', letterSpacing: '-0.5px' }}>
            NexusTeam
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '14px' }}>
            Secure team management platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--ink-2)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '36px',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', marginBottom: '24px' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                EMAIL
              </label>
              <input
                name="email" type="email" value={form.email}
                onChange={handleChange} required autoComplete="email"
                placeholder="you@company.com"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                PASSWORD
              </label>
              <input
                name="password" type="password" value={form.password}
                onChange={handleChange} required autoComplete="current-password"
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
                color: '#fca5a5', fontSize: '13px'
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? 'var(--surface-3)' : 'var(--accent)',
              color: 'white', borderRadius: '10px',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 0 20px var(--accent-glow)',
            }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: '24px', background: 'var(--ink-2)',
          border: '1px solid var(--border)', borderRadius: '12px', padding: '16px'
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
            DEMO CREDENTIALS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Admin', email: 'admin@nexuscorp.com', password: 'admin123' },
              { label: 'Frontend', email: 'alice@nexuscorp.com', password: 'emp123' },
              { label: 'Backend', email: 'carol@nexuscorp.com', password: 'emp123' },
              { label: 'Sales', email: 'eva@nexuscorp.com', password: 'emp123' },
            ].map(({ label, email, password }) => (
              <button key={email} onClick={() => fillDemo(email, password)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: '6px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'var(--font-mono)',
                transition: 'all 0.15s',
                cursor: 'pointer'
              }}>
                <span style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{label}</span>
                <span>{email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '8px', color: 'var(--text-primary)',
  fontSize: '14px', transition: 'border-color 0.2s',
  outline: 'none',
};

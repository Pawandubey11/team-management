import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--ink)', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{
        width: '40px', height: '40px', border: '2px solid var(--border-light)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
        loading...
      </span>
    </div>
  );
}

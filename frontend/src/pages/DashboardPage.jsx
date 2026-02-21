import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { companyAPI, departmentAPI, userAPI, groupAPI } from '../services/api';

const DEPT_COLORS = {
  Frontend: 'var(--dept-frontend)',
  Backend: 'var(--dept-backend)',
  Sales: 'var(--dept-sales)',
  Production: 'var(--dept-production)',
  HR: 'var(--dept-hr)',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ company: null, departments: [], users: [], groups: [] });
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const load = async () => {
      try {
        const companyId = user?.companyId?._id || user?.companyId;
        const [compRes, deptRes, userRes, groupRes] = await Promise.all([
          companyAPI.getCompany(companyId),
          departmentAPI.getDepartments(),
          userAPI.getUsers(),
          groupAPI.getGroups(),
        ]);
        setData({
          company: compRes.data.data,
          departments: deptRes.data.data.departments,
          users: userRes.data.data.users,
          groups: groupRes.data.data.groups,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (user) load();
  }, [user]);

  if (loading) return <PageLoader />;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }} className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px', letterSpacing: '-0.5px' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
          {data.company?.company?.name} · {isAdmin ? 'Administrator' : user?.departmentId?.name + ' Department'}
        </p>
      </div>

      {/* Stats Row */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '36px' }}>
          <StatCard label="Total Departments" value={data.departments.length} icon="⊞" />
          <StatCard label="Total Employees" value={data.users.filter(u => u.role === 'EMPLOYEE').length} icon="◎" />
          <StatCard label="Active Groups" value={data.groups.length} icon="◈" />
          <StatCard label="Company" value={data.company?.company?.name} icon="⬡" small />
        </div>
      )}

      {/* Departments Section */}
      <section style={{ marginBottom: '36px' }}>
        <SectionHeader title={isAdmin ? 'All Departments' : 'Your Department'} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {data.departments.map(dept => (
            <DepartmentCard
              key={dept._id} dept={dept}
              group={data.groups.find(g => g.departmentId?._id === dept._id || g.departmentId === dept._id)}
              onNavigate={navigate}
            />
          ))}
          {data.departments.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '20px 0' }}>
              No departments found.
            </div>
          )}
        </div>
      </section>

      {/* Team Members */}
      <section>
        <SectionHeader title={isAdmin ? 'All Team Members' : 'Your Team'} />
        <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {data.users.map((u, i) => (
            <div key={u._id} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 20px',
              borderBottom: i < data.users.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.15s'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: u.role === 'ADMIN' ? 'var(--accent)' : (DEPT_COLORS[u.departmentId?.name] || 'var(--surface-3)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700, color: 'white', flexShrink: 0
              }}>{u.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>{u.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {u.departmentId?.name && (
                  <span style={{
                    fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '3px 8px',
                    background: 'var(--surface-3)', borderRadius: '4px',
                    color: DEPT_COLORS[u.departmentId.name] || 'var(--text-muted)'
                  }}>{u.departmentId.name}</span>
                )}
                <span style={{
                  fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '3px 8px',
                  background: u.role === 'ADMIN' ? 'var(--accent-dim)' : 'var(--surface)',
                  borderRadius: '4px',
                  color: u.role === 'ADMIN' ? 'var(--text-accent)' : 'var(--text-muted)'
                }}>{u.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, small }) {
  return (
    <div style={{
      background: 'var(--ink-2)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '20px 24px',
    }}>
      <div style={{ fontSize: '20px', marginBottom: '10px' }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: small ? '18px' : '28px', lineHeight: 1.1, marginBottom: '4px'
      }}>{value ?? '—'}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</div>
    </div>
  );
}

function DepartmentCard({ dept, group, onNavigate }) {
  const color = DEPT_COLORS[dept.name] || 'var(--accent)';
  return (
    <div style={{
      background: 'var(--ink-2)', border: `1px solid var(--border)`,
      borderRadius: '12px', padding: '20px',
      cursor: 'pointer', transition: 'border-color 0.2s, transform 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      onClick={() => onNavigate(`/departments/${dept._id}`)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: `${color}20`, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px'
        }}>⬡</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px' }}>{dept.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dept.memberCount ?? 0} members</div>
        </div>
      </div>
      {dept.description && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>{dept.description}</p>
      )}
      {group && (
        <button
          onClick={e => { e.stopPropagation(); onNavigate(`/chat/${group._id}`); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
            color: color, fontFamily: 'var(--font-mono)',
            padding: '5px 10px', background: `${color}15`, borderRadius: '6px',
            border: `1px solid ${color}30`, transition: 'all 0.15s'
          }}
        >
          ◈ Open Group Chat
        </button>
      )}
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px' }}>{title}</h2>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: '32px', height: '32px', border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );
}

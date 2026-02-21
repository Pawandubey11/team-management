import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupAPI, departmentAPI } from '../services/api';

const DEPT_COLORS = {
  Frontend: 'var(--dept-frontend)',
  Backend: 'var(--dept-backend)',
  Sales: 'var(--dept-sales)',
  Production: 'var(--dept-production)',
  HR: 'var(--dept-hr)',
};

const DEPT_ICONS = {
  Frontend: '⬡',
  Backend: '⬢',
  Sales: '◈',
  Production: '◉',
  HR: '◎',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [g, d] = await Promise.all([groupAPI.getGroups(), departmentAPI.getDepartments()]);
        setGroups(g.data.data.groups);
        setDepartments(d.data.data.departments);
      } catch (e) { /* silent */ }
    };
    load();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 'var(--sidebar-w)' : '64px',
        background: 'var(--ink-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? '24px 20px 20px' : '24px 16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '32px', height: '32px', flexShrink: 0,
            background: 'var(--accent)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)'
          }}>N</div>
          {sidebarOpen && (
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', whiteSpace: 'nowrap' }}>
              NexusTeam
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(p => !p)}
            style={{
              marginLeft: 'auto', color: 'var(--text-muted)',
              fontSize: '18px', padding: '2px', flexShrink: 0,
              transition: 'color 0.2s'
            }}
            title="Toggle sidebar"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {/* Main Links */}
          <SidebarLabel label="Main" visible={sidebarOpen} />
          <SidebarLink to="/dashboard" icon="⊞" label="Dashboard" collapsed={!sidebarOpen} />
          {isAdmin && <SidebarLink to="/admin" icon="⊛" label="Admin Panel" collapsed={!sidebarOpen} />}

          {/* Departments */}
          {departments.length > 0 && (
            <>
              <SidebarLabel label="Departments" visible={sidebarOpen} />
              {departments.map(dept => (
                <SidebarLink
                  key={dept._id}
                  to={`/departments/${dept._id}`}
                  icon={DEPT_ICONS[dept.name] || '○'}
                  label={dept.name}
                  collapsed={!sidebarOpen}
                  color={DEPT_COLORS[dept.name]}
                />
              ))}
            </>
          )}

          {/* Groups / Chat */}
          {groups.length > 0 && (
            <>
              <SidebarLabel label="Chat Groups" visible={sidebarOpen} />
              {groups.map(group => (
                <SidebarLink
                  key={group._id}
                  to={`/chat/${group._id}`}
                  icon="◈"
                  label={group.name}
                  collapsed={!sidebarOpen}
                  color={DEPT_COLORS[group.departmentId?.name]}
                />
              ))}
            </>
          )}
        </nav>

        {/* User Info */}
        <div style={{
          padding: sidebarOpen ? '16px 20px' : '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '34px', height: '34px', flexShrink: 0,
            background: isAdmin ? 'var(--accent)' : 'var(--surface-3)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: 'white',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, truncate: true, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {user?.role}
              </div>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={handleLogout} style={{
              color: 'var(--text-muted)', fontSize: '18px',
              transition: 'color 0.2s', padding: '4px',
            }} title="Logout">⊗</button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--ink)' }}>
        <Outlet />
      </main>
    </div>
  );
}

function SidebarLabel({ label, visible }) {
  if (!visible) return <div style={{ height: '8px' }} />;
  return (
    <div style={{
      fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
      padding: '12px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.1em'
    }}>{label}</div>
  );
}

function SidebarLink({ to, icon, label, collapsed, color }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: collapsed ? '10px 16px' : '8px 12px',
        borderRadius: '8px', margin: '2px 0',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: isActive ? 'var(--surface-2)' : 'transparent',
        transition: 'all 0.15s ease',
        fontSize: '14px',
        whiteSpace: 'nowrap',
        justifyContent: collapsed ? 'center' : 'flex-start',
      })}
      title={collapsed ? label : ''}
    >
      <span style={{ fontSize: '16px', color: color || 'inherit', flexShrink: 0 }}>{icon}</span>
      {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
    </NavLink>
  );
}

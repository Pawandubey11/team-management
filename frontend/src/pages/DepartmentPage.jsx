import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { departmentAPI, groupAPI } from '../services/api';

const DEPT_COLORS = {
  Frontend: 'var(--dept-frontend)',
  Backend: 'var(--dept-backend)',
  Sales: 'var(--dept-sales)',
  Production: 'var(--dept-production)',
  HR: 'var(--dept-hr)',
};

export default function DepartmentPage() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [dept, setDept] = useState(null);
  const [members, setMembers] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [deptRes, groupRes] = await Promise.all([
          departmentAPI.getDepartment(departmentId),
          groupAPI.getGroups(),
        ]);
        setDept(deptRes.data.data.department);
        setMembers(deptRes.data.data.members);
        const allGroups = groupRes.data.data.groups;
        const g = allGroups.find(gr =>
          gr.departmentId?._id === departmentId || gr.departmentId === departmentId
        );
        setGroup(g);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load department.');
      } finally { setLoading(false); }
    };
    load();
  }, [departmentId]);

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '32px', height: '32px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>;

  if (error) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>{error}</div>;

  const color = DEPT_COLORS[dept?.name] || 'var(--accent)';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '36px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '14px',
          background: `${color}20`, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', flexShrink: 0
        }}>⬡</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '28px' }}>
            {dept?.name} Department
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {dept?.description || `Official ${dept?.name} team`}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <Chip label={`${members.length} Members`} color={color} />
            {group && (
              <button
                onClick={() => navigate(`/chat/${group._id}`)}
                style={{
                  padding: '5px 14px', borderRadius: '6px', fontSize: '13px',
                  background: color, color: 'white', fontFamily: 'var(--font-display)',
                  fontWeight: 600, transition: 'opacity 0.2s', cursor: 'pointer'
                }}
              >
                Open Group Chat →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px' }}>Team Members</h2>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {members.map(member => (
            <div key={member._id} style={{
              background: 'var(--ink-2)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '16px',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: `${color}30`, border: `1px solid ${color}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: 700, color: color, flexShrink: 0
              }}>{member.name[0]}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>{member.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{member.email}</div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: color, marginTop: '4px' }}>
                  {member.isActive ? '● online' : '○ offline'}
                </div>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '10px 0', gridColumn: '1 / -1' }}>
              No members in this department yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ label, color }) {
  return (
    <span style={{
      fontSize: '12px', fontFamily: 'var(--font-mono)', padding: '4px 10px',
      background: `${color}15`, border: `1px solid ${color}30`,
      borderRadius: '6px', color: color
    }}>{label}</span>
  );
}

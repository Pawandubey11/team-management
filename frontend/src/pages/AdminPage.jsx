import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { departmentAPI, userAPI, companyAPI } from '../services/api';

const DEPT_OPTIONS = ['Frontend', 'Backend', 'Sales', 'Production', 'HR'];

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('employees');
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newEmp, setNewEmp] = useState({ name: '', email: '', password: '', departmentId: '' });
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [empMsg, setEmpMsg] = useState('');
  const [deptMsg, setDeptMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [dRes, uRes] = await Promise.all([departmentAPI.getDepartments(), userAPI.getUsers()]);
      setDepartments(dRes.data.data.departments);
      setUsers(uRes.data.data.users);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true); setEmpMsg('');
    try {
      await userAPI.createUser(newEmp);
      setEmpMsg('✅ Employee created successfully!');
      setNewEmp({ name: '', email: '', password: '', departmentId: '' });
      load();
    } catch (err) { setEmpMsg('❌ ' + (err.response?.data?.message || 'Failed to create employee.')); }
    finally { setSubmitting(false); }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setSubmitting(true); setDeptMsg('');
    try {
      await departmentAPI.createDepartment(newDept);
      setDeptMsg('✅ Department and group created!');
      setNewDept({ name: '', description: '' });
      load();
    } catch (err) { setDeptMsg('❌ ' + (err.response?.data?.message || 'Failed to create department.')); }
    finally { setSubmitting(false); }
  };

  const handleAssignDept = async (userId, departmentId) => {
    try {
      await userAPI.assignDepartment(userId, { departmentId });
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed to assign department.'); }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await userAPI.toggleStatus(userId);
      load();
    } catch (e) { alert('Failed to update status.'); }
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const employees = users.filter(u => u.role === 'EMPLOYEE');

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }} className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <span style={{ fontSize: '20px' }}>⊛</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '28px' }}>Admin Panel</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Manage employees, departments, and company settings.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {[
          { id: 'employees', label: 'Employees', icon: '◎' },
          { id: 'departments', label: 'Departments', icon: '⬡' },
          { id: 'create-emp', label: 'Add Employee', icon: '+' },
          { id: 'create-dept', label: 'Add Department', icon: '⊞' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 18px', fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: 500,
            color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
            marginBottom: '-1px', transition: 'all 0.15s', cursor: 'pointer',
            display: 'flex', gap: '6px', alignItems: 'center'
          }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Employees */}
      {tab === 'employees' && (
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {employees.length} employees
          </div>
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {employees.map((emp, i) => (
              <div key={emp._id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 20px',
                borderBottom: i < employees.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: emp.isActive ? 'var(--accent-dim)' : 'var(--surface-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: emp.isActive ? 'var(--text-accent)' : 'var(--text-muted)', flexShrink: 0
                }}>{emp.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{emp.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.email}</div>
                </div>
                {/* Dept assignment dropdown */}
                <select
                  value={emp.departmentId?._id || ''}
                  onChange={e => handleAssignDept(emp._id, e.target.value || null)}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '5px 10px', color: 'var(--text-primary)',
                    fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer'
                  }}
                >
                  <option value="">Unassigned</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <button
                  onClick={() => handleToggleStatus(emp._id)}
                  style={{
                    padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                    background: emp.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    color: emp.isActive ? 'var(--danger)' : 'var(--success)',
                    border: `1px solid ${emp.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                    cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.15s'
                  }}
                >
                  {emp.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
            {employees.length === 0 && (
              <div style={{ padding: '24px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '14px' }}>
                No employees yet. Add one using the "Add Employee" tab.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Departments */}
      {tab === 'departments' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
            {departments.map(dept => (
              <div key={dept._id} style={{
                background: 'var(--ink-2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '20px'
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>
                  {dept.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {dept.description}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {dept.memberCount ?? 0} members
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Create Employee */}
      {tab === 'create-emp' && (
        <div style={{ maxWidth: '480px' }}>
          <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Full Name" name="name" value={newEmp.name}
              onChange={e => setNewEmp(p => ({ ...p, name: e.target.value }))} required />
            <FormField label="Email" name="email" type="email" value={newEmp.email}
              onChange={e => setNewEmp(p => ({ ...p, email: e.target.value }))} required />
            <FormField label="Password" name="password" type="password" value={newEmp.password}
              onChange={e => setNewEmp(p => ({ ...p, password: e.target.value }))} required />
            <div>
              <label style={labelStyle}>DEPARTMENT</label>
              <select value={newEmp.departmentId} onChange={e => setNewEmp(p => ({ ...p, departmentId: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select department (optional)</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            {empMsg && <StatusMsg msg={empMsg} />}
            <button type="submit" disabled={submitting} style={submitBtnStyle}>
              {submitting ? 'Creating...' : '+ Create Employee'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Create Department */}
      {tab === 'create-dept' && (
        <div style={{ maxWidth: '480px' }}>
          <form onSubmit={handleCreateDept} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>DEPARTMENT NAME</label>
              <select value={newDept.name} onChange={e => setNewDept(p => ({ ...p, name: e.target.value }))}
                required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select a department</option>
                {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <FormField label="Description" name="description" value={newDept.description}
              onChange={e => setNewDept(p => ({ ...p, description: e.target.value }))} />
            {deptMsg && <StatusMsg msg={deptMsg} />}
            <button type="submit" disabled={submitting} style={submitBtnStyle}>
              {submitting ? 'Creating...' : '+ Create Department'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function FormField({ label, name, type = 'text', value, onChange, required }) {
  return (
    <div>
      <label style={labelStyle}>{label.toUpperCase()}</label>
      <input
        name={name} type={type} value={value} onChange={onChange} required={required}
        style={inputStyle}
      />
    </div>
  );
}

function StatusMsg({ msg }) {
  const isSuccess = msg.startsWith('✅');
  return (
    <div style={{
      padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
      background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
      color: isSuccess ? 'var(--success)' : '#fca5a5'
    }}>{msg}</div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)',
  color: 'var(--text-muted)', marginBottom: '6px'
};

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
};

const submitBtnStyle = {
  padding: '12px', background: 'var(--accent)', color: 'white',
  borderRadius: '8px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px',
  cursor: 'pointer', transition: 'opacity 0.2s'
};

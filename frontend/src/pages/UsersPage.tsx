import { useState, type FormEvent } from 'react';
import { api, type Role } from '../api';

export default function UsersPage() {
  const [form, setForm] = useState({ email: '', fullName: '', password: '', role: 'cashier' as Role });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api('/auth/users', { method: 'POST', body: JSON.stringify(form) });
      setSuccess(`Created ${form.email}`);
      setForm({ email: '', fullName: '', password: '', role: 'cashier' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create user');
    }
  }

  return (
    <>
      <h2>Staff accounts</h2>
      <form onSubmit={submit} className="form-grid">
        <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password (min 8 chars)" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <button>Create user</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </>
  );
}
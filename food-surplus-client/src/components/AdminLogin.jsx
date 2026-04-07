import { useState } from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import api from '../api';

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.user?.role !== 'ADMIN') {
          throw { response: { data: { msg: 'Access Denied: Standard users cannot access the Admin Portal.' } } };
      }
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Authenticaton failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--accent)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <ShieldAlert size={28} /> Secure Admin Portal
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Restricted Access Area</p>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Admin Username</label>
            <input required placeholder="Enter admin username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Secure Key</label>
            <input required type="password" placeholder="Enter security passphrase" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '16px', background: 'var(--accent)', color: 'white' }}>
            <LogIn size={18} /> Authenticate Admin
          </button>
        </form>
      </div>
    </div>
  );
}

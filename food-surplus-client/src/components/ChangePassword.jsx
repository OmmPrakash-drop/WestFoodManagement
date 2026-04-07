import { useState } from 'react';
import { Key, Settings, X } from 'lucide-react';
import api from '../api';

export default function ChangePassword() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    if (form.newPassword.length < 6) {
      return setStatus({ type: 'error', msg: 'New password must be at least 6 characters' });
    }

    try {
      const res = await api.put('/users/change-password', form);
      setStatus({ type: 'success', msg: res.data.msg || 'Password updated successfully' });
      setForm({ currentPassword: '', newPassword: '' }); // Clear form
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error changing password' });
    }
  };

  if (!isOpen) {
    return (
      <div style={{ marginTop: '32px', textAlign: 'right' }}>
        <button 
          onClick={() => setIsOpen(true)} 
          className="btn btn-outline" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
        >
          <Settings size={18} /> Security Settings
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={{ marginTop: '32px', position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(false)}
        style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
      >
        <X size={20} />
      </button>

      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Key size={20} color="var(--primary)" /> Update Security Settings
      </h3>
      
      {status.msg && (
        <div style={{ 
          background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          color: status.type === 'success' ? '#10b981' : '#ef4444', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px', 
          fontSize: '0.9rem' 
        }}>
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto', gap: '16px', alignItems: 'end' }}>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: '0.85rem' }}>Current Password</label>
          <input 
            type="password" 
            required 
            value={form.currentPassword} 
            onChange={e => setForm({...form, currentPassword: e.target.value})} 
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: '0.85rem' }}>New Password</label>
          <input 
            type="password" 
            required 
            placeholder="Min 6 characters"
            value={form.newPassword} 
            onChange={e => setForm({...form, newPassword: e.target.value})} 
            style={{ padding: '8px 12px' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 24px' }}>
          Update
        </button>
      </form>
    </div>
  );
}

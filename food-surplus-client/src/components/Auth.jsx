import { useState } from 'react';
import { Store, HeartHandshake, LogIn } from 'lucide-react';
import api from '../api';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true); // Default to Login mode
  const [step, setStep] = useState(1); // Multistep for registration
  const [role, setRole] = useState('RESTAURANT'); // RESTAURANT or NGO
  const [form, setForm] = useState({ username: '', password: '', email: '', contactNumber: '', address: '', registrationCertificate: '' });
  const [documentFile, setDocumentFile] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && step === 1) {
      try {
        await api.post('/auth/check-duplicates', { email: form.email, contactNumber: form.contactNumber });
        setStep(2);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error checking details');
      }
      return;
    }

    if (!isLogin && step === 2) {
      try {
        await api.post('/auth/check-duplicates', { username: form.username, password: form.password });
        setStep(3);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error checking credentials');
      }
      return;
    }
    
    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', form);
        if (data.user?.role === 'ADMIN') {
            throw { response: { data: { msg: 'Administrators must log in through the secure /admin secure portal.' } } };
        }
        onLogin(data);
      } else {
        const formData = new FormData();
        formData.append('username', form.username);
        formData.append('password', form.password);
        formData.append('email', form.email);
        formData.append('contactNumber', form.contactNumber);
        formData.append('role', role);
        formData.append('address', form.address);
        formData.append('registrationCertificate', form.registrationCertificate);
        if (documentFile) {
            formData.append('document', documentFile);
        }

        const { data } = await api.post('/auth/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Handle pending state
        setSuccessMsg('Registration successful! Please allow 24-48 hours for Admin verification before you can post/claim food.');
        setIsLogin(true); // Switch to login screen
        setStep(1); // Reset step
        setDocumentFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Authentication failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
          {isLogin ? 'Welcome Back!' : 'Join Food Surplus Network'}
        </h2>
        
        {successMsg && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{successMsg}</div>}
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isLogin ? (
            /* ================= LOGIN MODE ================= */
            <>
              <div className="input-group">
                <label>Username / Entity Name</label>
                <input required placeholder="Enter name" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Secure Password</label>
                <input required type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                <LogIn size={18} /> Login to Account
              </button>
            </>
          ) : (
            /* ================= REGISTRATION MODE ================= */
            <>
              {/* Step Progress indicators */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 1 ? 'var(--primary)' : 'var(--border)' }}></div>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 2 ? 'var(--primary)' : 'var(--border)' }}></div>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 3 ? 'var(--primary)' : 'var(--border)' }}></div>
              </div>

              {step === 1 && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <div 
                      onClick={() => setRole('RESTAURANT')}
                      style={{ flex: 1, padding: '16px', borderRadius: '12px', border: role === 'RESTAURANT' ? '2px solid var(--primary)' : '2px solid var(--border)', background: role === 'RESTAURANT' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <Store size={32} color={role === 'RESTAURANT' ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: role === 'RESTAURANT' ? 'white' : 'var(--text-muted)' }}>Restaurant</span>
                    </div>
                    <div 
                      onClick={() => setRole('NGO')}
                      style={{ flex: 1, padding: '16px', borderRadius: '12px', border: role === 'NGO' ? '2px solid var(--accent)' : '2px solid var(--border)', background: role === 'NGO' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <HeartHandshake size={32} color={role === 'NGO' ? 'var(--accent)' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: role === 'NGO' ? 'white' : 'var(--text-muted)' }}>NGO Partner</span>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input required type="email" placeholder="Contact Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Contact Number (Phone)</label>
                    <input required type="tel" placeholder="Phone Number" value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Continue to Next Step</button>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <h3 style={{ marginBottom: '16px' }}>Account Credentials</h3>
                  <div className="input-group">
                    <label>Entity Name (Username)</label>
                    <input required placeholder="Enter name" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Secure Password</label>
                    <input required type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Continue to Verification</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in">
                  <h3 style={{ marginBottom: '16px' }}>Verification Documents</h3>
                  <div className="input-group">
                    <label>Full Physical Address</label>
                    <input required placeholder="Operations base address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Govt. Registration / Certificate ID</label>
                    <input required placeholder="Enter official ID" value={form.registrationCertificate} onChange={e => setForm({...form, registrationCertificate: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Upload Certificate Document (PDF/Image)</label>
                    <input required type="file" accept=".pdf,image/*" onChange={e => setDocumentFile(e.target.files[0])} style={{ padding: '8px', cursor: 'pointer' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Accounts take 24-48hrs to be manually verified by Admins using this document.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>Back</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Create Free Account</button>
                  </div>
                </div>
              )}
            </>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setIsLogin(!isLogin); setStep(1); }}>
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: '24px', width: '100%', textAlign: 'center' }}>
        <a href="/admin-login" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>Administrator Access</a>
      </div>
    </div>
  );
}

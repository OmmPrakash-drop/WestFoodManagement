import { useState, useEffect } from 'react';
import { ShieldCheck, UserX, UserCheck } from 'lucide-react';
import api from '../api';
import ChangePassword from './ChangePassword';

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [allNgos, setAllNgos] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'INACTIVE'

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const res = await api.get('/admin/verifications');
      setRestaurants(res.data.restaurants);
      setNgos(res.data.ngos);
      
      const allRes = await api.get('/admin/entities');
      setAllRestaurants(allRes.data.restaurants);
      setAllNgos(allRes.data.ngos);

      setLoading(false);
    } catch (err) {
      alert('Failed to load admin data');
      setLoading(false);
    }
  };

  const handleVerify = async (type, id, status) => {
    try {
      const message = messages[`${type}-${id}`] || '';
      if ((status === 'REVERTED' || status === 'REJECTED') && !message) {
          return alert('Please provide an Admin Feedback message to Revert or Reject.');
      }
      await api.put(`/admin/verify/${type}/${id}`, { status, message });
      
      let successMsg = '';
      if (status === 'APPROVED') successMsg = '✅ Application successfully approved. The user has been notified.';
      else if (status === 'REVERTED') successMsg = '⚠️ Application successfully reverted. The user has been asked to provide the requested info via email.';
      else if (status === 'REJECTED') successMsg = '❌ Application has been cleanly rejected.';
      alert(successMsg);

      fetchPendingVerifications();
      setMessages(prev => ({ ...prev, [`${type}-${id}`]: '' }));
    } catch (err) {
      alert(err.response?.data?.msg || 'Error updating verification');
    }
  };

  if (loading) return <div>Loading Admin Panel...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))', padding: '24px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: '32px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f59e0b' }}>
          <ShieldCheck size={28} /> Admin Control Panel
        </h2>
        <p style={{ marginTop: '8px', color: 'lightgray' }}>Review and securely authorize new network entities before they can post or claim surplus food.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          className="btn" 
          onClick={() => setActiveTab('pending')}
          style={{ 
            background: activeTab === 'pending' ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${activeTab === 'pending' ? 'var(--primary)' : 'var(--border)'}`,
            color: 'white'
          }}
        >
          Pending Verifications
        </button>
        <button 
          className="btn" 
          onClick={() => setActiveTab('all')}
          style={{ 
            background: activeTab === 'all' ? 'linear-gradient(135deg, var(--accent), #2563eb)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${activeTab === 'all' ? 'var(--accent)' : 'var(--border)'}`,
            color: 'white'
          }}
        >
          Entity Database
        </button>
      </div>

      {activeTab === 'pending' ? (
        <div className="dashboard-grid animate-fade-in">
        {/* Pending Restaurants */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Pending Restaurants</h3>
          {restaurants.length === 0 ? (
            <p>No restaurants pending verification.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {restaurants.map(rest => (
                <div key={rest.restaurantId} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: '4px' }}>{rest.restaurantName}</h4>
                  <p style={{ fontSize: '0.85rem', marginBottom: '2px' }}>Registered by user: {rest.User?.username}</p>
                  <p style={{ fontSize: '0.85rem', marginBottom: '2px' }}><strong>Address:</strong> {rest.address}</p>
                  <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}><strong>Govt Cert ID:</strong> {rest.registrationCertificate}</p>
                  {rest.documentUrl && (
                    <a href={`http://localhost:5000${rest.documentUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '12px', display: 'inline-block' }}>📄 View Uploaded Document</a>
                  )}
                  
                  <div style={{ marginBottom: '12px' }}>
                    <textarea 
                      placeholder="Optional Admin Feedback (Required for Revert/Reject)..." 
                      value={messages[`restaurant-${rest.restaurantId}`] || ''}
                      onChange={(e) => setMessages({...messages, [`restaurant-${rest.restaurantId}`]: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', fontSize: '0.85rem' }}
                      rows={2}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleVerify('restaurant', rest.restaurantId, 'APPROVED')}
                      className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981' }}
                    >
                      <UserCheck size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => handleVerify('restaurant', rest.restaurantId, 'REVERTED')}
                      className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b' }}
                    >
                      Revert
                    </button>
                    <button 
                      onClick={() => handleVerify('restaurant', rest.restaurantId, 'REJECTED')}
                      className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #ef4444' }}
                    >
                      <UserX size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending NGOs */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>Pending NGOs</h3>
          {ngos.length === 0 ? (
            <p>No NGOs pending verification.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ngos.map(ngo => (
                <div key={ngo.ngoId} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: '4px' }}>{ngo.ngoName}</h4>
                  <p style={{ fontSize: '0.85rem', marginBottom: '2px' }}>Registered by user: {ngo.User?.username}</p>
                  <p style={{ fontSize: '0.85rem', marginBottom: '2px' }}><strong>Address:</strong> {ngo.address}</p>
                  <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}><strong>Govt Cert ID:</strong> {ngo.registrationCertificate}</p>
                  {ngo.documentUrl && (
                    <a href={`http://localhost:5000${ngo.documentUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '12px', display: 'inline-block' }}>📄 View Uploaded Document</a>
                  )}
                  
                  <div style={{ marginBottom: '12px' }}>
                    <textarea 
                      placeholder="Optional Admin Feedback (Required for Revert/Reject)..." 
                      value={messages[`ngo-${ngo.ngoId}`] || ''}
                      onChange={(e) => setMessages({...messages, [`ngo-${ngo.ngoId}`]: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', fontSize: '0.85rem' }}
                      rows={2}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleVerify('ngo', ngo.ngoId, 'APPROVED')}
                      className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981' }}
                    >
                      <UserCheck size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => handleVerify('ngo', ngo.ngoId, 'REVERTED')}
                      className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b' }}
                    >
                      Revert
                    </button>
                    <button 
                      onClick={() => handleVerify('ngo', ngo.ngoId, 'REJECTED')}
                      className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #ef4444' }}
                    >
                      <UserX size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      ) : (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--accent)' }}>System Entity Database</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Filter Entities:</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', outline: 'none' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active (Approved)</option>
                <option value="INACTIVE">Inactive (Pending/Reverted/Rejected)</option>
              </select>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* All Restaurants */}
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>Restaurants Directory</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allRestaurants
                  .filter(rest => {
                    if (statusFilter === 'ALL') return true;
                    const isActive = rest.verificationStatus === 'APPROVED';
                    return statusFilter === 'ACTIVE' ? isActive : !isActive;
                  })
                  .map(rest => (
                  <div key={rest.restaurantId} className="list-item" style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ marginBottom: '4px' }}>{rest.restaurantName}</h4>
                        <p style={{ fontSize: '0.85rem' }}>{rest.User?.email}</p>
                      </div>
                      <span className={`badge ${rest.verificationStatus === 'APPROVED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                        {rest.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {allRestaurants.filter(rest => {
                    const isActive = rest.verificationStatus === 'APPROVED';
                    return statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? isActive : !isActive);
                }).length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No restaurants found matching filter.</p>}
              </div>
            </div>

            {/* All NGOs */}
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>NGOs Directory</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allNgos
                  .filter(ngo => {
                    if (statusFilter === 'ALL') return true;
                    const isActive = ngo.verificationStatus === 'APPROVED';
                    return statusFilter === 'ACTIVE' ? isActive : !isActive;
                  })
                  .map(ngo => (
                  <div key={ngo.ngoId} className="list-item" style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ marginBottom: '4px' }}>{ngo.ngoName}</h4>
                        <p style={{ fontSize: '0.85rem' }}>{ngo.User?.email}</p>
                      </div>
                      <span className={`badge ${ngo.verificationStatus === 'APPROVED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                        {ngo.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {allNgos.filter(ngo => {
                    const isActive = ngo.verificationStatus === 'APPROVED';
                    return statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? isActive : !isActive);
                }).length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No NGOs found matching filter.</p>}
              </div>
            </div>
          </div>

        </div>
      )}

      <ChangePassword />
    </div>
  );
}

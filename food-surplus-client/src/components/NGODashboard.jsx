import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Navigation2 } from 'lucide-react';
import api from '../api';
import ChangePassword from './ChangePassword';

export default function NGODashboard() {
  const [availableFood, setAvailableFood] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [profile, setProfile] = useState(null);

  // Re-registration state
  const [updateForm, setUpdateForm] = useState({ address: '', registrationCertificate: '' });
  const [updateDoc, setUpdateDoc] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userRes = await api.get('/auth/user');
      const ngoData = userRes.data?.NGO;
      setProfile(ngoData);

      if (ngoData) {
          setUpdateForm({ address: ngoData.address, registrationCertificate: ngoData.registrationCertificate });
      }

      if (ngoData?.verificationStatus === 'APPROVED') {
          // Get all food from the paginated endpoint
          const foodRes = await api.get('/food-posts');
          if (foodRes.data && foodRes.data.data) {
            setAvailableFood(foodRes.data.data);
          } else {
            setAvailableFood(foodRes.data || []);
          }
          
          const reqRes = await api.get('/food-requests/my-requests');
          setMyRequests(reqRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestFood = async (foodId) => {
    try {
      await api.post('/food-requests', { foodId });
      alert('Request sent successfully!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error requesting food');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/food-requests/${id}`, { status });
      fetchDashboardData();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleUpdateRegistration = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('address', updateForm.address);
      formData.append('registrationCertificate', updateForm.registrationCertificate);
      if (updateDoc) formData.append('document', updateDoc);
      
      await api.put('/auth/update-registration', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Application Re-submitted successfully!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error updating registration');
    }
  };

  if (profile && profile.verificationStatus !== 'APPROVED') {
    return (
      <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '40px auto' }}>
        <h2 style={{ marginBottom: '16px' }}>
          {profile.verificationStatus === 'PENDING' && <span style={{ color: 'white' }}>Verification Pending</span>}
          {profile.verificationStatus === 'REVERTED' && <span style={{ color: '#f59e0b' }}>Action Required</span>}
          {profile.verificationStatus === 'REJECTED' && <span style={{ color: '#ef4444' }}>Application Rejected</span>}
        </h2>
        
        {profile.verificationStatus === 'PENDING' && (
          <p style={{ color: 'var(--text-muted)' }}>We are reviewing your NGO registration and documents. Please allow 24-48 hours. We will email you the moment you are approved!</p>
        )}
        
        {profile.verificationStatus === 'REVERTED' && (
          <div>
             <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>An admin has reviewed your application and requested further information before we can approve you.</p>
             <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '8px', color: '#f59e0b', textAlign: 'left' }}>
                 <strong style={{ display: 'block', marginBottom: '8px' }}>Admin Feedback:</strong> 
                 {profile.adminMessage || 'Please update your details or reach out to support.'}
             </div>
             <p style={{ color: 'var(--text-muted)', marginTop: '24px', fontSize: '0.9rem' }}>Reply to the email we sent you or contact support with the requested details.</p>
          </div>
        )}
        
        {profile.verificationStatus === 'REJECTED' && (
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Unfortunately, your application could not be verified.</p>
            {profile.adminMessage && (
               <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '8px', color: '#f87171', textAlign: 'left', marginTop: '16px' }}>
                   <strong style={{ display: 'block', marginBottom: '8px' }}>Reason:</strong> 
                   {profile.adminMessage}
               </div>
            )}
          </div>
        )}

        {/* Re-registration Form */}
        {(profile.verificationStatus === 'REVERTED' || profile.verificationStatus === 'REJECTED') && (
            <div style={{ marginTop: '32px', textAlign: 'left', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '16px' }}>Update Application Details</h3>
              <form onSubmit={handleUpdateRegistration}>
                <div className="input-group">
                  <label>Full Physical Address</label>
                  <input required value={updateForm.address} onChange={e => setUpdateForm({...updateForm, address: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Govt. Registration / Certificate ID</label>
                  <input required value={updateForm.registrationCertificate} onChange={e => setUpdateForm({...updateForm, registrationCertificate: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Update Certificate Document (PDF/Image)</label>
                  <input type="file" accept=".pdf,image/*" onChange={e => setUpdateDoc(e.target.files[0])} style={{ padding: '8px', cursor: 'pointer' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Leave blank to keep your original document.</p>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Re-Submit Application</button>
              </form>
            </div>
        )}

        <div style={{ marginTop: '32px' }}>
          <ChangePassword />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '32px' }} className="animate-fade-in">
      
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Surplus Food Available Near You</h3>
        
        {availableFood.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No surplus food available right now. We will notify you when restaurants post!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {availableFood.map(post => (
              <div key={post.foodId} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ color: 'var(--primary)', fontSize: '1.2rem', marginBottom: '8px' }}>{post.foodName}</h4>
                  <span className="badge badge-success">{post.status}</span>
                </div>
                
                <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>{post.quantity} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{post.quantityUnit}</span></h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '0.9rem', color: 'lightgray' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} color="var(--accent)" /> Pickup at: {post.pickupAddress || post.Restaurant?.address}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Navigation2 size={16} color="var(--primary)" /> Pickup by {new Date(post.pickupTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => handleRequestFood(post.foodId)}
                >
                  <CheckCircle size={18} /> Claim Food Box
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Your Claim History</h3>
        
        {myRequests.length === 0 ? (
          <p>You haven't claimed any food yet.</p>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            {myRequests.map(req => (
              <div key={req.requestId} className="list-item">
                <div>
                  <h4>Requested: {req.FoodPost?.foodName || 'Unknown Food'}</h4>
                  <p style={{ fontSize: '0.9rem' }}>From {req.FoodPost?.Restaurant?.restaurantName || 'Unknown'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {req.requestStatus === 'PENDING' && <span className="badge badge-warning">Waiting for Host</span>}
                  {req.requestStatus === 'APPROVED' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className="badge badge-success">Approved! Go Pick Up</span>
                      <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => handleUpdateStatus(req.requestId, 'TAKEN')}>Mark as Taken</button>
                    </div>
                  )}
                  {req.requestStatus === 'TAKEN' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Food Taken</span>
                      <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#10b981', borderColor: '#10b981' }} onClick={() => handleUpdateStatus(req.requestId, 'DELIVERED')}>Mark Delivered</button>
                    </div>
                  )}
                  {req.requestStatus === 'DELIVERED' && <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#059669' }}>Successfully Delivered</span>}
                  {req.requestStatus === 'REJECTED' && <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Rejected</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ChangePassword />

    </div>
  );
}

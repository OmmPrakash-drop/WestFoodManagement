import { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle } from 'lucide-react';
import api from '../api';
import ChangePassword from './ChangePassword';

export default function RestaurantDashboard() {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('KG');
  const [pickupTime, setPickupTime] = useState('');
  
  const [myPosts, setMyPosts] = useState([]);
  const [requests, setRequests] = useState([]);
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
      const restData = userRes.data?.Restaurant;
      setProfile(restData);
      
      if (restData) {
          setUpdateForm({ address: restData.address, registrationCertificate: restData.registrationCertificate });
      }

      if (restData?.verificationStatus === 'APPROVED') {
          const postsRes = await api.get('/food-posts/my-posts');
          setMyPosts(postsRes.data);
          
          const reqRes = await api.get('/food-requests/restaurant-requests');
          setRequests(reqRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostFood = async (e) => {
    e.preventDefault();
    try {
      // API expects ISO8601 formatting for time, but input datetime-local can be transformed easily
      const isoTime = new Date(pickupTime).toISOString();
      await api.post('/food-posts', { foodName, quantity: parseFloat(quantity), quantityUnit, pickupTime: isoTime });
      fetchDashboardData();
      setFoodName(''); setQuantity(''); setPickupTime('');
    } catch (err) {
      alert(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error posting food');
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
          <p style={{ color: 'var(--text-muted)' }}>We are reviewing your registration and documents. Please allow 24-48 hours. We will email you the moment you are approved!</p>
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
    <div className="dashboard-grid animate-fade-in">
      {/* Sidebar: Add Food Post */}
      <div>
        <div className="glass-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Plus size={20} color="var(--primary)" /> Post Surplus Food
          </h3>
          <form onSubmit={handlePostFood}>
            <div className="input-group">
              <label>Food Item Description</label>
              <input required value={foodName} onChange={e=>setFoodName(e.target.value)} placeholder="e.g. 50 Loaves of Bread" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>Quantity</label>
                <input required type="number" step="0.1" value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="0.0" />
              </div>
              <div className="input-group">
                <label>Unit</label>
                <select value={quantityUnit} onChange={e=>setQuantityUnit(e.target.value)}>
                  <option>KG</option>
                  <option>L</option>
                  <option>Boxes</option>
                  <option>Plates</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>Available Pickup Time</label>
              <input required type="datetime-local" value={pickupTime} onChange={e=>setPickupTime(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Publish to NGOs</button>
          </form>
        </div>
      </div>

      {/* Main Column: Requests and Active Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Incoming NGO Requests */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Incoming NGO Requests</h3>
          {requests.length === 0 ? (
             <p>No new requests from NGOs yet.</p>
          ) : (
             <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                {requests.map(req => (
                  <div key={req.requestId} className="list-item">
                    <div>
                      <h4 style={{ color: 'var(--accent)' }}>{req.NGO ? req.NGO.ngoName : 'Unknown NGO'}</h4>
                      <p style={{ fontSize: '0.9rem' }}>Requested your <strong>{req.FoodPost?.foodName}</strong></p>
                      <div style={{ marginTop: '4px' }}>
                        {req.requestStatus === 'PENDING' && <span className="badge badge-warning">Pending Review</span>}
                        {req.requestStatus === 'APPROVED' && <span className="badge badge-success">Approved for Pickup</span>}
                        {req.requestStatus === 'TAKEN' && <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Food Taken (In Transit)</span>}
                        {req.requestStatus === 'DELIVERED' && <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#059669' }}>Successfully Delivered</span>}
                        {req.requestStatus === 'REJECTED' && <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Rejected</span>}
                      </div>
                    </div>
                    {req.requestStatus === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => handleUpdateStatus(req.requestId, 'APPROVED')}>Approve</button>
                        <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleUpdateStatus(req.requestId, 'REJECTED')}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
             </div>
          )}
        </div>

        {/* Your Active Listings */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Your Active Listings</h3>
          {myPosts.length === 0 ? (
             <p>You have not posted any food yet.</p>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              {myPosts.map(post => (
                <div key={post.foodId} className="list-item">
                  <div>
                    <h4>{post.foodName}</h4>
                    <p style={{ fontSize: '0.9rem' }}>{post.quantity} {post.quantityUnit}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {new Date(post.pickupTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: post.status === 'AVAILABLE' ? '#34d399' : '#94a3b8' }}>
                      {post.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <ChangePassword />
    </div>
  );
}

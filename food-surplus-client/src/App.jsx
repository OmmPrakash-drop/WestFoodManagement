import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { socket } from './socket';
import Auth from './components/Auth';
import AdminLogin from './components/AdminLogin';
import RestaurantDashboard from './components/RestaurantDashboard';
import NGODashboard from './components/NGODashboard';
import AdminDashboard from './components/AdminDashboard';
import api from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if logged in already on refresh
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/user');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleNewPost = (post) => toast.success(`New Food Available: ${post.foodName}!`);
    const handleNewRequest = () => toast('New food request received!', { icon: '👏' });
    const handleRequestUpdate = (req) => toast(`Request status changed to ${req.requestStatus}`);

    socket.on('newFoodPost', handleNewPost);
    socket.on('newFoodRequest', handleNewRequest);
    socket.on('requestStatusUpdated', handleRequestUpdate);

    return () => {
      socket.off('newFoodPost', handleNewPost);
      socket.off('newFoodRequest', handleNewRequest);
      socket.off('requestStatusUpdated', handleRequestUpdate);
    };
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading System...</div>;

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' } }} />
      <div className="container">
        {/* Universal Navigation */}
        <nav className="nav-bar">
          <div className="logo">
            <LayoutDashboard size={28} />
            FoodSurplus<span style={{ fontWeight: 300 }}>Network</span>
          </div>
          
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Logged in as <strong>{user.username || 'User'}</strong>
              </span>
              <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </nav>

        {/* Dynamic Route Switching Based on Role */}
        <div style={{ paddingBottom: '60px' }}>
          {!user ? (
            <Routes>
              <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />
              <Route path="*" element={<Auth onLogin={handleLogin} />} />
            </Routes>
          ) : user.role === 'RESTAURANT' ? (
            <RestaurantDashboard />
          ) : user.role === 'NGO' ? (
            <NGODashboard />
          ) : user.role === 'ADMIN' ? (
            <AdminDashboard />
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', color: '#ef4444' }}>
              Unknown Role Detected
            </div>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

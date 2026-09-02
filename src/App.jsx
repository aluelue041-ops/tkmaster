import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Heart, Ticket, DollarSign, User, MapPin, Calendar, Menu, 
  Settings, Bell, ChevronRight, Share, Heart as HeartOutline, MoreVertical, CheckCircle
} from 'lucide-react';
import './App.css';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const socket = io(API);

// Pages
import Discover from './pages/Discover';
import ForYou from './pages/ForYou';
import MyTickets from './pages/MyTickets';
import Sell from './pages/Sell';
import MyAccount from './pages/MyAccount';
import EventDetails from './pages/EventDetails';
import SeatSelection from './pages/SeatSelection';
import SignIn from './pages/SignIn';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword';
import Pricing from './pages/Pricing';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Discover', icon: Search },
    { path: '/foryou', label: 'For You', icon: Heart },
    { path: '/mytickets', label: 'My Tickets', icon: Ticket },
    { path: '/sell', label: 'Sell', icon: DollarSign },
    { path: '/account', label: 'My Account', icon: User },
  ];

  if (location.pathname.startsWith('/event/') || location.pathname.startsWith('/seat-selection/')) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button 
            key={item.path} 
            className={`nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={24} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const token = localStorage.getItem('token');
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const handler = (data) => {
      setNotifications(prev => [{ ...data, read: false }, ...prev]);
      toast.info(`🎟️ ${data.message}`, { onClick: () => navigate(`/event/${data.eventId}`) });
    };
    socket.on('new_event', handler);
    return () => socket.off('new_event', handler);
  }, [navigate]);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    if (!token) return;
    await fetch(`${API}/api/notifications/read-all`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id) => {
    if (!token) return;
    await fetch(`${API}/api/notifications/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const handleClick = (n) => {
    markRead(n._id);
    if (n.eventId) navigate(`/event/${n.eventId}`);
    setOpen(false);
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!token) return null;

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px', display: 'flex', alignItems: 'center' }}
      >
        <Bell size={22} color="var(--primary-color)" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            background: '#ff3b30', color: 'white', borderRadius: '50%',
            fontSize: '10px', fontWeight: 700,
            width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '36px', right: 0,
          width: '320px', maxHeight: '420px', overflowY: 'auto',
          background: '#ffffff', borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 1000, border: '1px solid #eee'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #eee' }}>
            <span style={{ color: '#111', fontWeight: 700, fontSize: '15px' }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#666' }}>
              <Bell size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '12px 16px', cursor: n.eventId ? 'pointer' : 'default',
                  background: n.read ? 'transparent' : 'rgba(2,108,223,0.08)',
                  borderBottom: '1px solid #eee'
                }}
              >
                {n.eventImage ? (
                  <img src={n.eventImage} alt="" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'linear-gradient(135deg,#026cdf,#004aad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={18} color="white" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, color: '#111', fontWeight: n.read ? 400 : 700, fontSize: '13px', lineHeight: 1.4 }}>{n.title}</p>
                  <p style={{ margin: '3px 0 0', color: '#666', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</p>
                  <p style={{ margin: '4px 0 0', color: '#999', fontSize: '11px' }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)', flexShrink: 0, marginTop: '4px' }} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Discover' },
    { path: '/foryou', label: 'For You' },
    { path: '/mytickets', label: 'My Tickets' },
    { path: '/sell', label: 'Sell' },
    { path: '/account', label: 'My Account' },
  ];

  return (
    <header className="global-header">
      <div className="logo-container" onClick={() => navigate('/')}>
        <img src="/logo.svg" alt="logo" className="logo-img" />
        <h1 className="logo-text">Ticketmaster</h1>
      </div>
      
      {/* Desktop Nav Links */}
      <nav className="desktop-nav">
        {navItems.map(item => (
          <button 
            key={item.path} 
            className={`desktop-nav-btn ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <NotificationBell />
    </header>
  );
}

function App() {
  React.useEffect(() => {
    const handleAuth = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.id) {
            socket.emit('join', user.id);
          }
        } catch (e) {}
      }
    };
    handleAuth();

    socket.on('ticket_bought', (data) => toast.success(data.message));
    socket.on('ticket_sold', (data) => toast.info(data.message));
    socket.on('ticket_received', (data) => toast.success(data.message));
    socket.on('ticket_approved', (data) => toast.success(data.message));
    socket.on('ticket_rejected', (data) => toast.error(data.message));
    socket.on('subscription_success', (data) => {
      toast.success(data.message);
      // Reload the page to reflect the new subscription status across the app
      setTimeout(() => window.location.reload(), 2000);
    });

    return () => {
      socket.off('ticket_bought');
      socket.off('ticket_sold');
      socket.off('ticket_received');
      socket.off('ticket_approved');
      socket.off('ticket_rejected');
      socket.off('subscription_success');
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <ToastContainer position="top-center" autoClose={4000} />
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Discover />} />
            <Route path="/foryou" element={<ForYou />} />
            <Route path="/mytickets" element={<MyTickets />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/account" element={<MyAccount />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/seat-selection/:id" element={<SeatSelection />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;

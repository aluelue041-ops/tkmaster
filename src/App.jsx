import React, { useState } from 'react';
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

    return () => {
      socket.off('ticket_bought');
      socket.off('ticket_sold');
      socket.off('ticket_received');
      socket.off('ticket_approved');
      socket.off('ticket_rejected');
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
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;

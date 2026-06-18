import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Heart, Ticket, DollarSign, User, MapPin, Calendar, Menu, 
  Settings, Bell, ChevronRight, Share, Heart as HeartOutline, MoreVertical, CheckCircle
} from 'lucide-react';
import './App.css';

// Pages
import Discover from './pages/Discover';
import ForYou from './pages/ForYou';
import MyTickets from './pages/MyTickets';
import Sell from './pages/Sell';
import MyAccount from './pages/MyAccount';
import EventDetails from './pages/EventDetails';
import SeatSelection from './pages/SeatSelection';
import SignIn from './pages/SignIn';

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

function App() {
  return (
    <Router>
      <div className="app-container">
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
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;

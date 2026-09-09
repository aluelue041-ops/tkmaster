import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Ticket, Calendar, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('events'); // events, users, tickets
  const DEFAULT_EVENT = {
    title: '', date: '', eventDate: '', location: '', image: '',
    category: 'Concerts', currency: '$', basePrice: 80, mapLink: '', rowLabelType: 'numbers',
    venueLayout: 'concert-oval',
    seatConfig: {
      vipStanding:  { rows: 0,  seats: 0,  enabled: true  },
      vipSeated:    { rows: 8,  seats: 20, enabled: true  },
      cat1:         { rows: 10, seats: 30, enabled: true  },
      cat2:         { rows: 12, seats: 35, enabled: true  },
      cat3:         { rows: 13, seats: 40, enabled: true  },
      cat4:         { rows: 13, seats: 35, enabled: true  },
      cat5:         { rows: 10, seats: 30, enabled: true  },
      cat6:         { rows: 8,  seats: 25, enabled: false },
    }
  };
  const [newEvent, setNewEvent] = useState(DEFAULT_EVENT);
  const [editingEventId, setEditingEventId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');
  const [ticketFilter, setTicketFilter] = useState('All');
  const [newPassword, setNewPassword] = useState('');
  
  const [cryptoPayments, setCryptoPayments] = useState([]);
  const [cryptoSettings, setCryptoSettings] = useState({ usdtTrc20Address: '', usdtErc20Address: '', btcAddress: '', mpesaEnabled: true, cryptoEnabled: true });
  
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        const meRes = await fetch(`${API}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        const meData = await meRes.json();

        if (!meRes.ok || !['admin', 'superadmin', 'event_manager'].includes(meData.role)) {
          toast.error('Admin access denied!');
          navigate('/');
          return;
        }

        setCurrentUser(meData);

        const isEventManagerOnly = meData.role === 'event_manager';

        const [usersRes, ticketsRes, eventsRes] = await Promise.all([
          meData.role === 'superadmin'
            ? fetch(`${API}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } })
            : Promise.resolve({ ok: false }),
          !isEventManagerOnly
            ? fetch(`${API}/api/tickets`, { headers: { 'Authorization': `Bearer ${token}` } })
            : Promise.resolve({ ok: false }),
          fetch(`${API}/api/events`)
        ]);

        const eventsData = await eventsRes.json();

        let usersData = [];
        if (usersRes.ok) usersData = await usersRes.json();

        let ticketsData = [];
        if (ticketsRes.ok) ticketsData = await ticketsRes.json();
        
        let cryptoData = [];
        if (!isEventManagerOnly) {
          const cryptoRes = await fetch(`${API}/api/admin/crypto-payments`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (cryptoRes.ok) cryptoData = await cryptoRes.json();
          
          const settingsRes = await fetch(`${API}/api/settings/crypto`);
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            setCryptoSettings(settingsData);
          }
        }

        setUsers(usersData);
        setTickets(ticketsData);
        setEvents(eventsData);
        setCryptoPayments(cryptoData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, API]);

  const getEventMeta = (title) => events.find(e => e.title === title) || null;

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(userSearchTerm.toLowerCase()));

  const filteredTickets = tickets.filter(t => {
    const term = ticketSearchTerm.toLowerCase();
    const userStr = t.user?.email || t.guestEmail || '';
    const matchesSearch = 
      t.eventTitle.toLowerCase().includes(term) || 
      userStr.toLowerCase().includes(term) ||
      t._id.toLowerCase().includes(term);
      
    const currentStatus = t.status || 'Pending';
    const matchesFilter = ticketFilter === 'All' || currentStatus === ticketFilter;
    
    return matchesSearch && matchesFilter;
  });

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB.');
      return;
    }
    setUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setNewEvent(prev => ({ ...prev, image: data.url }));
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed. Please try a URL instead.');
    } finally {
      setUploading(false);
    }
  };

  const handleApproveCrypto = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/admin/crypto-payments/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Crypto payment approved! User subscription upgraded.');
        setCryptoPayments(prev => prev.map(p => p._id === id ? { ...p, status: 'approved' } : p));
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to approve payment');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const handleRejectCrypto = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/admin/crypto-payments/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Crypto payment rejected.');
        setCryptoPayments(prev => prev.map(p => p._id === id ? { ...p, status: 'rejected' } : p));
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to reject payment');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const handleSaveCryptoSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/settings/crypto`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cryptoSettings)
      });
      if (res.ok) {
        toast.success('Payment settings saved successfully.');
      } else {
        toast.error('Failed to save settings.');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const isEditing = !!editingEventId;
      const url = isEditing ? `${API}/api/events/${editingEventId}` : `${API}/api/events`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEvent)
      });
      const data = await res.json();
      if (res.ok) {
        if (isEditing) {
          setEvents(events.map(ev => ev._id === editingEventId ? data : ev));
          toast.success('Event updated successfully!');
        } else {
          setEvents([data, ...events]);
          toast.success('Event created successfully!');
        }
        setNewEvent(DEFAULT_EVENT);
        setEditingEventId(null);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (event) => {
    setEditingEventId(event._id);
    setNewEvent({
      title: event.title || '',
      date: event.date || '',
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
      location: event.location || '',
      image: event.image || '',
      category: event.category || 'Concerts',
      currency: event.currency || '$',
      basePrice: event.basePrice || 80,
      mapLink: event.mapLink || '',
      rowLabelType: event.rowLabelType || 'numbers',
      venueLayout: event.venueLayout || 'concert-oval',
      seatConfig: event.seatConfig || DEFAULT_EVENT.seatConfig,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEvents(events.filter(e => e._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveTicket = async (id) => {
    const ticketType = window.prompt(
      "Enter Ticket Type for Approval (e.g., Verified Fan Presale, ARMY MEMBERSHIP PRESALE):",
      "Verified Fan Presale"
    );
    if (ticketType === null) return; // cancelled

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/tickets/${id}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketType })
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t._id === id ? updated : t));
        toast.success('✅ Ticket approved! Client has been notified by email.');
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectTicket = async (id) => {
    if (!window.confirm('Are you sure you want to reject this ticket booking?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/tickets/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t._id === id ? updated : t));
        toast.success('❌ Ticket rejected. Client has been notified by email.');
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransferTicket = async (id) => {
    const newEmail = window.prompt("Enter the email address of the user to transfer this ticket to:");
    if (!newEmail) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/tickets/${id}/transfer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail })
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t._id === id ? updated : t));
        toast.success(`Ticket successfully transferred to ${newEmail}!`);
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubscription = async (userId, newSubscription) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription: newSubscription })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u._id === userId ? updatedUser : u));
        toast.success(`Subscription updated to ${newSubscription}!`);
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update subscription');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u._id === userId ? updatedUser : u));
        toast.success(`Role updated to ${newRole}!`);
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update role');
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    const token = localStorage.getItem('token');
    let bannedReason = '';
    if (!isBanned) {
      bannedReason = window.prompt('Enter a reason for banning this user (optional):') || '';
      if (bannedReason === null) return; // cancelled
    } else {
      if (!window.confirm('Are you sure you want to unban this user?')) return;
    }
    try {
      const res = await fetch(`${API}/api/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ banned: !isBanned, bannedReason })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u._id === userId ? updatedUser : u));
        toast.success(isBanned ? '✅ User unbanned!' : '🚫 User banned!');
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update ban status');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading Dashboard...</div>;

  return (
    <div className="page admin-dashboard dark-mode" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <div className="header" style={{ backgroundColor: 'var(--dark-bg)' }}>
        <h1 className="header-title" style={{ color: 'white', fontSize: '18px' }}>Admin Dashboard</h1>
      </div>

      <div style={{ display: 'flex', gap: '16px', padding: '16px', overflowX: 'auto' }}>
        <div style={{ flex: 1, minWidth: '120px', backgroundColor: '#323232', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
          <Calendar color="var(--primary-color)" size={24} style={{ marginBottom: '8px' }} />
          <h3 style={{ fontSize: '24px', margin: 0, color: 'white' }}>{events.length}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>Events</p>
        </div>
        {currentUser?.role === 'superadmin' && (
          <div style={{ flex: 1, minWidth: '120px', backgroundColor: '#323232', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
            <Users color="#00c853" size={24} style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '24px', margin: 0, color: 'white' }}>{users.length}</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>Users</p>
          </div>
        )}
        {currentUser?.role !== 'event_manager' && (
          <div style={{ flex: 1, minWidth: '120px', backgroundColor: '#323232', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
            <Ticket color="#ff9800" size={24} style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '24px', margin: 0, color: 'white' }}>{tickets.length}</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>Tickets Sold</p>
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px' }}>
        <button onClick={() => setActiveTab('events')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'events' ? 'var(--primary-color)' : '#323232', color: 'white', fontWeight: 600 }}>Events</button>
        {currentUser?.role === 'superadmin' && (
          <button onClick={() => setActiveTab('users')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'users' ? 'var(--primary-color)' : '#323232', color: 'white', fontWeight: 600 }}>Users</button>
        )}
        {currentUser?.role !== 'event_manager' && (
          <button onClick={() => setActiveTab('tickets')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'tickets' ? 'var(--primary-color)' : '#323232', color: 'white', fontWeight: 600 }}>Tickets</button>
        )}
        {currentUser?.role !== 'event_manager' && (
          <button onClick={() => setActiveTab('crypto')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'crypto' ? 'var(--primary-color)' : '#323232', color: 'white', fontWeight: 600 }}>Crypto</button>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        {activeTab === 'events' && (
          <div>
            <div style={{ backgroundColor: '#323232', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
              <h3 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} /> {editingEventId ? 'Edit Event' : 'Add New Event'}
              </h3>
              <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder="Event Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required style={{ padding: '10px', borderRadius: '8px', border: 'none' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Display Date (e.g. Fri, Sep 19 • 7:00 PM)" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none' }} />
                  <input type="datetime-local" title="Event date/time for expiry" value={newEvent.eventDate} onChange={e => setNewEvent({...newEvent, eventDate: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Currency (e.g. $, £, €)" value={newEvent.currency} onChange={e => setNewEvent({...newEvent, currency: e.target.value})} required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }} />
                  <input type="number" placeholder="Base Price (e.g. 80)" value={newEvent.basePrice} onChange={e => setNewEvent({...newEvent, basePrice: Number(e.target.value)})} required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }} />
                  <input type="text" placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} required style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none' }} />
                </div>
                <input type="text" placeholder="Live Location URL (Google Maps link)" value={newEvent.mapLink} onChange={e => setNewEvent({...newEvent, mapLink: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: 'none' }} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Image URL (or upload →)"
                    value={newEvent.image.startsWith('data:') ? '📎 File uploaded (Base64)' : newEvent.image}
                    onChange={e => setNewEvent({...newEvent, image: e.target.value})}
                    required
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }}
                  />
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="banner-upload" />
                  <label htmlFor="banner-upload" style={{
                    padding: '10px 16px', borderRadius: '8px',
                    backgroundColor: uploading ? '#666' : '#444',
                    color: 'white', cursor: uploading ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap'
                  }}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </label>
                  {newEvent.image && !newEvent.image.startsWith('data:') && (
                    <img src={newEvent.image} alt="preview" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }}>
                    <option value="Concerts">Concerts</option>
                    <option value="Sports">Sports</option>
                    <option value="Arts & Theater">Arts & Theater</option>
                    <option value="Family">Family</option>
                  </select>
                  <select value={newEvent.rowLabelType} onChange={e => setNewEvent({...newEvent, rowLabelType: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }}>
                    <option value="numbers">Rows: Numbers (1, 2, 3...)</option>
                    <option value="letters">Rows: Letters (A, B, C...)</option>
                  </select>
                </div>
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#ccc' }}>Stadium Layout & Seat Config</h3>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <select 
                      value={newEvent.venueLayout} 
                      onChange={e => setNewEvent({...newEvent, venueLayout: e.target.value})} 
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }}
                    >
                      <option value="concert-oval">Concert Oval (e.g., Stadium with Stage)</option>
                      <option value="arena">Sports Arena</option>
                      <option value="theater">Theater</option>
                      <option value="flat">General Admission (Flat)</option>
                    </select>
                  </div>
                  
                  {newEvent.venueLayout === 'concert-oval' && newEvent.seatConfig && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      {Object.keys(newEvent.seatConfig).map((cat) => (
                        <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'capitalize', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {cat.replace(/([A-Z])/g, ' $1').trim()}
                            <input 
                              type="checkbox" 
                              title="Enable Zone"
                              checked={newEvent.seatConfig[cat].enabled}
                              onChange={(e) => setNewEvent(prev => ({
                                ...prev, 
                                seatConfig: { 
                                  ...prev.seatConfig, 
                                  [cat]: { ...prev.seatConfig[cat], enabled: e.target.checked }
                                }
                              }))}
                              style={{ cursor: 'pointer' }}
                            />
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '10px', color: '#999' }}>Rows</label>
                              <input type="number" title="Rows" value={newEvent.seatConfig[cat].rows} onChange={(e) => setNewEvent(prev => ({
                                  ...prev, seatConfig: { ...prev.seatConfig, [cat]: { ...prev.seatConfig[cat], rows: Number(e.target.value) } }
                                }))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white', fontSize: '12px' }} disabled={!newEvent.seatConfig[cat].enabled} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '10px', color: '#999' }}>Seats/Row</label>
                              <input type="number" title="Seats per row" value={newEvent.seatConfig[cat].seats} onChange={(e) => setNewEvent(prev => ({
                                  ...prev, seatConfig: { ...prev.seatConfig, [cat]: { ...prev.seatConfig[cat], seats: Number(e.target.value) } }
                                }))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white', fontSize: '12px' }} disabled={!newEvent.seatConfig[cat].enabled} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                    {editingEventId ? 'Update Event' : 'Add Event'}
                  </button>
                  {editingEventId && (
                    <button type="button" onClick={() => {
                      setEditingEventId(null);
                      setNewEvent(DEFAULT_EVENT);
                    }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#555', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <h3 style={{ color: 'white' }}>Live Events</h3>
            {events.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No events currently live. Add one above!</p>
            ) : (
              events.map(event => (
                <div key={event._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#323232', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
                  <img src={event.image} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', color: 'white', fontSize: '16px' }}>{event.title}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{event.date}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditClick(event)} style={{ background: '#026cdf22', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '16px' }}>✏️</span>
                    </button>
                    <button onClick={() => handleDeleteEvent(event._id)} style={{ background: '#ff3b3022', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                      <Trash2 color="#ff3b30" size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ color: 'white', margin: 0 }}>Registered Users</h3>
              <input 
                type="text" 
                placeholder="Search email..." 
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white', width: '250px' }}
              />
            </div>
            {filteredUsers.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No users found.</p>
            ) : (
              filteredUsers.map(user => (
                <div key={user._id} style={{ backgroundColor: user.banned ? '#3a1a1a' : '#323232', padding: '16px', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', border: user.banned ? '1px solid #ff3b3044' : 'none' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ margin: 0, color: user.banned ? '#ff6b6b' : 'white', fontWeight: 600 }}>{user.email}</p>
                      {user.banned && <span style={{ background: '#ff3b30', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>BANNED</span>}
                    </div>
                    <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '12px' }}>Role: {user.role} • Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                    {user.banned && user.bannedReason && (
                      <p style={{ margin: '4px 0 0', color: '#ff6b6b', fontSize: '11px' }}>Reason: {user.bannedReason}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
                      <span style={{ color: '#aaa', fontSize: '13px' }}>Role:</span>
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white', outline: 'none' }}
                        disabled={currentUser?.role !== 'superadmin' || user._id === (currentUser?._id || currentUser?.id)}
                      >
                        <option value="user">User</option>
                        <option value="event_manager">Event Manager</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#aaa', fontSize: '13px' }}>Package:</span>
                      <select
                        value={user.subscription || 'Free'}
                        onChange={(e) => handleUpdateSubscription(user._id, e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white', outline: 'none' }}
                      >
                        <option value="Free">Free (2 tickets)</option>
                        <option value="VIP">VIP (Unlimited)</option>
                      </select>
                    </div>
                    {user._id !== (currentUser?._id || currentUser?.id) && (
                      <button
                        onClick={() => handleBanUser(user._id, user.banned)}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                          backgroundColor: user.banned ? '#34c75922' : '#ff3b3022',
                          color: user.banned ? '#34c759' : '#ff3b30'
                        }}
                      >
                        {user.banned ? '✅ Unban' : '🚫 Ban'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ color: 'white', margin: 0 }}>All Tickets Sold</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Event, Email, Order ID..." 
                  value={ticketSearchTerm}
                  onChange={e => setTicketSearchTerm(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white', minWidth: '220px' }}
                />
                <select 
                  value={ticketFilter}
                  onChange={e => setTicketFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Active">Active</option>
                  <option value="For Sale">For Sale</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
            {filteredTickets.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No tickets found matching your criteria.</p>
            ) : (
              filteredTickets.map(ticket => {
                const meta = getEventMeta(ticket.eventTitle);
                return (
                <div key={ticket._id} style={{ backgroundColor: '#323232', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden' }}>
                  {/* Event Banner */}
                  {meta?.image
                    ? <img src={meta.image} alt={ticket.eventTitle} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', height: '80px', background: 'linear-gradient(135deg, #026cdf, #004aad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600 }}>{ticket.eventTitle}</span>
                      </div>
                  }
                  <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: '15px' }}>{ticket.eventTitle}</p>
                      <p style={{ margin: '4px 0', color: 'var(--primary-color)', fontSize: '13px' }}>👤 {ticket.user?.email || ticket.guestEmail || 'Unknown'}</p>
                      <p style={{ margin: '2px 0', color: '#aaa', fontSize: '12px' }}>🎟️ {ticket.seats?.length} seat(s) • {ticket.currency || '$'}{ticket.totalPrice}</p>
                      <p style={{ margin: '2px 0 0', color: '#aaa', fontSize: '11px', wordBreak: 'break-all' }}>{ticket.seats?.join(' | ')}</p>
                      {/* Status badge */}
                      <span style={{
                        display: 'inline-block', marginTop: '8px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                        backgroundColor:
                          ticket.status === 'Approved' ? 'rgba(52,199,89,0.15)' :
                          ticket.status === 'Rejected' ? 'rgba(255,59,48,0.15)' :
                          'rgba(255,149,0,0.15)',
                        color:
                          ticket.status === 'Approved' ? '#34c759' :
                          ticket.status === 'Rejected' ? '#ff3b30' :
                          '#ff9500'
                      }}>
                        {ticket.status === 'Approved' ? '✅ Approved' : ticket.status === 'Rejected' ? '❌ Rejected' : '⏳ Pending'}
                      </span>
                    </div>

                    {/* Action buttons */}
                    {(!ticket.status || ['Pending', 'Active', 'Transferred'].includes(ticket.status)) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleApproveTicket(ticket._id)}
                          style={{ padding: '8px 16px', backgroundColor: '#34c759', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleRejectTicket(ticket._id)}
                          style={{ padding: '8px 16px', backgroundColor: '#ff3b30', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {/* Transfer button always visible */}
                    {ticket.status === 'Approved' && (
                      <button
                        onClick={() => handleTransferTicket(ticket._id)}
                        style={{ padding: '8px 16px', backgroundColor: '#026cdf', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                      >
                        🔄 Transfer
                      </button>
                    )}
                  </div>
                </div>
                </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'crypto' && (
          <div>

            {/* Payment Method Toggles */}
            <div style={{ backgroundColor: '#323232', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: '0 0 4px' }}>Payment Method Availability</h2>
              <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 20px' }}>Toggle a payment method off when it is unavailable or under maintenance. Users will see a maintenance notice instead.</p>
              
              {/* M-Pesa Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#222', padding: '14px 16px', borderRadius: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>📱 M-Pesa</div>
                  <div style={{ color: '#aaa', fontSize: '12px', marginTop: '2px' }}>{cryptoSettings.mpesaEnabled ? '✅ Active — users can pay via M-Pesa' : '🔧 Under Maintenance — hidden from users'}</div>
                </div>
                <div
                  onClick={() => setCryptoSettings({ ...cryptoSettings, mpesaEnabled: !cryptoSettings.mpesaEnabled })}
                  style={{
                    width: '52px', height: '28px', borderRadius: '14px', cursor: 'pointer', transition: 'background 0.3s',
                    backgroundColor: cryptoSettings.mpesaEnabled ? '#34c759' : '#555', position: 'relative', flexShrink: 0
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '4px', transition: 'left 0.3s',
                    left: cryptoSettings.mpesaEnabled ? '28px' : '4px',
                    width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white'
                  }} />
                </div>
              </div>

              {/* Crypto Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#222', padding: '14px 16px', borderRadius: '12px', marginBottom: '20px' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>₿ Crypto / USDT</div>
                  <div style={{ color: '#aaa', fontSize: '12px', marginTop: '2px' }}>{cryptoSettings.cryptoEnabled ? '✅ Active — users can pay via Crypto' : '🔧 Under Maintenance — hidden from users'}</div>
                </div>
                <div
                  onClick={() => setCryptoSettings({ ...cryptoSettings, cryptoEnabled: !cryptoSettings.cryptoEnabled })}
                  style={{
                    width: '52px', height: '28px', borderRadius: '14px', cursor: 'pointer', transition: 'background 0.3s',
                    backgroundColor: cryptoSettings.cryptoEnabled ? '#34c759' : '#555', position: 'relative', flexShrink: 0
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '4px', transition: 'left 0.3s',
                    left: cryptoSettings.cryptoEnabled ? '28px' : '4px',
                    width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white'
                  }} />
                </div>
              </div>

              <button
                onClick={handleSaveCryptoSettings}
                style={{ alignSelf: 'flex-start', padding: '10px 24px', backgroundColor: '#026cdf', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Availability Settings
              </button>
            </div>

            {/* Crypto Addresses Card */}
            <div style={{ backgroundColor: '#323232', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: '0 0 16px' }}>Crypto Addresses</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#aaa', marginBottom: '8px' }}>USDT Address — TRC20 (Tron)</label>
                  <input
                    type="text"
                    placeholder="USDT TRC20 wallet address"
                    value={cryptoSettings.usdtTrc20Address}
                    onChange={e => setCryptoSettings({ ...cryptoSettings, usdtTrc20Address: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#222', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#aaa', marginBottom: '8px' }}>USDT Address — ERC20 (Ethereum)</label>
                  <input
                    type="text"
                    placeholder="USDT ERC20 wallet address"
                    value={cryptoSettings.usdtErc20Address}
                    onChange={e => setCryptoSettings({ ...cryptoSettings, usdtErc20Address: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#222', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#aaa', marginBottom: '8px' }}>Bitcoin (BTC) Address</label>
                  <input
                    type="text"
                    placeholder="BTC wallet address"
                    value={cryptoSettings.btcAddress}
                    onChange={e => setCryptoSettings({ ...cryptoSettings, btcAddress: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#222', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  onClick={handleSaveCryptoSettings}
                  style={{ alignSelf: 'flex-start', padding: '10px 24px', backgroundColor: '#34c759', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Addresses
                </button>
              </div>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: '0 0 16px' }}>Pending Crypto Payments</h2>
            {cryptoPayments.filter(p => p.status === 'pending').length === 0 ? (
              <p style={{ color: '#aaa' }}>No pending crypto payments.</p>
            ) : (
              cryptoPayments.filter(p => p.status === 'pending').map(payment => (
                <div key={payment._id} style={{ backgroundColor: '#323232', padding: '16px', borderRadius: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>{payment.user?.email || 'Unknown User'}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ccc', lineHeight: 1.7 }}>
                      Plan: <span style={{ color: '#026cdf', fontWeight: 'bold' }}>{payment.plan}</span>
                      <br />
                      Amount: <strong style={{ color: '#34c759' }}>{payment.amount} {payment.currency || 'USDT'}</strong>
                      <br />
                      TX Hash:{' '}
                      {payment.txHash && payment.txHash !== 'N/A' ? (
                        <a
                          href={
                            payment.currency === 'BTC'
                              ? `https://www.blockchain.com/explorer/transactions/btc/${payment.txHash}`
                              : `https://tronscan.org/#/transaction/${payment.txHash}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#f0b429', fontSize: '11px', wordBreak: 'break-all', fontFamily: 'monospace' }}
                        >
                          {payment.txHash} 🔍
                        </a>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '11px' }}>{payment.txHash || 'N/A'}</span>
                      )}
                      <br />
                      <span style={{ color: '#888', fontSize: '11px' }}>{new Date(payment.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApproveCrypto(payment._id)}
                      style={{ padding: '8px 16px', backgroundColor: '#34c759', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectCrypto(payment._id)}
                      style={{ padding: '8px 16px', backgroundColor: '#ff3b30', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}

            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: '32px 0 16px' }}>Payment History</h2>
            {cryptoPayments.filter(p => p.status !== 'pending').length === 0 ? (
              <p style={{ color: '#aaa' }}>No history found.</p>
            ) : (
              cryptoPayments.filter(p => p.status !== 'pending').map(payment => (
                <div key={payment._id} style={{ backgroundColor: '#323232', padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>{payment.user?.email || 'Unknown User'}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#ccc', lineHeight: 1.7 }}>
                    Plan: <strong>{payment.plan}</strong> | Amount: <strong style={{ color: '#34c759' }}>{payment.amount} {payment.currency || 'USDT'}</strong>
                    <br />
                    TX Hash:{' '}
                    {payment.txHash ? (
                      <a
                        href={
                          payment.currency === 'BTC'
                            ? `https://www.blockchain.com/explorer/transactions/btc/${payment.txHash}`
                            : `https://tronscan.org/#/transaction/${payment.txHash}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#f0b429', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all' }}
                      >
                        {payment.txHash} 🔍
                      </a>
                    ) : <span style={{ color: '#888' }}>N/A</span>}
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', fontWeight: 700, color: payment.status === 'approved' ? '#34c759' : '#ff3b30' }}>
                    Status: {payment.status.toUpperCase()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

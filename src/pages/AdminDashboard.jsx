import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Ticket, Calendar, Trash2, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('events'); // events, users, tickets
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', image: '', category: 'Concerts', currency: '$', mapLink: '' });
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, ticketsRes, eventsRes] = await Promise.all([
          fetch(`${API}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API}/api/tickets`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API}/api/events`)
        ]);

        if (usersRes.status === 403) {
          alert('Admin access denied!');
          navigate('/');
          return;
        }

        const usersData = await usersRes.json();
        const ticketsData = await ticketsRes.json();
        const eventsData = await eventsRes.json();

        setUsers(usersData);
        setTickets(ticketsData);
        setEvents(eventsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, API]);

  const getEventMeta = (title) => events.find(e => e.title === title) || null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEvent)
      });
      const data = await res.json();
      if (res.ok) {
        setEvents([data, ...events]);
        setNewEvent({ title: '', date: '', location: '', image: '', category: 'Concerts', currency: '$', mapLink: '' });
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/tickets/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t._id === id ? updated : t));
        alert('✅ Ticket approved! Client has been notified by email.');
      } else {
        const data = await res.json();
        alert(data.error);
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
        alert('❌ Ticket rejected. Client has been notified by email.');
      } else {
        const data = await res.json();
        alert(data.error);
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
        alert(`Ticket successfully transferred to ${newEmail}!`);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
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
        <div style={{ flex: 1, minWidth: '120px', backgroundColor: '#323232', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
          <Users color="#00c853" size={24} style={{ marginBottom: '8px' }} />
          <h3 style={{ fontSize: '24px', margin: 0, color: 'white' }}>{users.length}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>Users</p>
        </div>
        <div style={{ flex: 1, minWidth: '120px', backgroundColor: '#323232', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
          <Ticket color="#ff9800" size={24} style={{ marginBottom: '8px' }} />
          <h3 style={{ fontSize: '24px', margin: 0, color: 'white' }}>{tickets.length}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>Tickets Sold</p>
        </div>
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px' }}>
        <button onClick={() => setActiveTab('events')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'events' ? 'var(--primary-color)' : '#323232', color: 'white', fontWeight: 600 }}>Events</button>
        <button onClick={() => setActiveTab('users')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'users' ? 'var(--primary-color)' : '#323232', color: 'white', fontWeight: 600 }}>Users</button>
        <button onClick={() => setActiveTab('tickets')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'tickets' ? 'var(--primary-color)' : '#323232', color: 'white', fontWeight: 600 }}>Tickets</button>
      </div>

      <div style={{ padding: '16px' }}>
        {activeTab === 'events' && (
          <div>
            <div style={{ backgroundColor: '#323232', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
              <h3 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={20} /> Add New Event</h3>
              <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder="Event Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required style={{ padding: '10px', borderRadius: '8px', border: 'none' }} />
                <input type="text" placeholder="Date & Time (e.g. Fri, Sep 19 • 7:00 PM)" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required style={{ padding: '10px', borderRadius: '8px', border: 'none' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Currency (e.g. $, £, €)" value={newEvent.currency} onChange={e => setNewEvent({...newEvent, currency: e.target.value})} required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }} />
                  <input type="text" placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} required style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none' }} />
                </div>
                <input type="text" placeholder="Live Location URL (Google Maps link)" value={newEvent.mapLink} onChange={e => setNewEvent({...newEvent, mapLink: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: 'none' }} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" placeholder="Image URL (or upload ->)" value={newEvent.image} onChange={e => setNewEvent({...newEvent, image: e.target.value})} required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }} />
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="banner-upload" />
                  <label htmlFor="banner-upload" style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#444', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
                    Upload Image
                  </label>
                </div>
                <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: 'none' }}>
                  <option value="Concerts">Concerts</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts & Theater">Arts & Theater</option>
                  <option value="Family">Family</option>
                </select>
                <button type="submit" style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Add Event</button>
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
                  <button onClick={() => handleDeleteEvent(event._id)} style={{ background: '#ff3b3022', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                    <Trash2 color="#ff3b30" size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3 style={{ color: 'white' }}>Registered Users</h3>
            {users.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No users registered yet.</p>
            ) : (
              users.map(user => (
                <div key={user._id} style={{ backgroundColor: '#323232', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                  <p style={{ margin: 0, color: 'white', fontWeight: 600 }}>{user.email}</p>
                  <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '12px' }}>Role: {user.role} • Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div>
            <h3 style={{ color: 'white' }}>All Tickets Sold</h3>
            {tickets.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No tickets have been sold yet.</p>
            ) : (
              tickets.map(ticket => {
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
                    {(!ticket.status || ticket.status === 'Pending') && (
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
      </div>
    </div>
  );
}

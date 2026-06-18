import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket as TicketIcon } from 'lucide-react';

export default function MyTickets() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/tickets/my-tickets', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTickets(data);
        }
      } catch (err) {
        console.error("Failed to fetch tickets", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="page my-tickets-page">
      <div className="header">
        <h1 className="header-title">My Tickets</h1>
      </div>

      <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', backgroundColor: '#e0e0e0', borderRadius: '8px', padding: '4px', width: '100%', maxWidth: '300px' }}>
          {['Upcoming', 'Past'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === tab ? '#fff' : 'transparent',
                fontWeight: activeTab === tab ? 600 : 500,
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading tickets...</div>
        ) : tickets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tickets.map(ticket => (
              <div key={ticket._id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TicketIcon size={30} color="var(--primary-color)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{ticket.eventTitle}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                    {ticket.seats.length} Seats • ${ticket.totalPrice}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Purchased on {new Date(ticket.purchaseDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '24px' }}>
            <div style={{ marginBottom: '24px', padding: '24px', backgroundColor: '#fff', borderRadius: '50%', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <TicketIcon size={48} color="var(--primary-color)" />
            </div>
            
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
              No {activeTab.toLowerCase()} tickets
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
              When you buy tickets, they will show up here.
            </p>
            
            <button className="btn-primary" style={{ maxWidth: '200px' }} onClick={() => navigate('/')}>Find Tickets</button>
          </div>
        )}
      </div>
    </div>
  );
}

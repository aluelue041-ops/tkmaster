import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Ticket as TicketIcon, ArrowUpRight, RefreshCw, MapPin, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Parse seat string into section/row/seat
function parseSeat(seatString) {
  if (!seatString) return { section: '-', row: '-', seat: '-', type: 'Standard Ticket' };

  if (seatString.includes('General Admission')) {
    const secMatch = seatString.match(/Section:\s*([^,]+)/);
    const tktMatch = seatString.match(/Ticket Number:\s*(\d+)/);
    return {
      section: secMatch ? secMatch[1].trim() : 'GA',
      row: 'GA',
      seat: tktMatch ? tktMatch[1] : '-',
      type: 'General Admission'
    };
  }

  const secMatch = seatString.match(/Section:\s*([^,]+)/);
  const rowMatch = seatString.match(/Row:\s*([^,]+)/);
  const seatMatch = seatString.match(/Seat Number:\s*(\d+)/);
  return {
    section: secMatch ? secMatch[1].trim() : '-',
    row: rowMatch ? rowMatch[1].trim() : '-',
    seat: seatMatch ? seatMatch[1] : '-',
    type: 'Full Price Ticket'
  };
}

// Custom Transfer Modal — no browser prompt
function TransferModal({ onConfirm, onCancel }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setSending(true);
    await onConfirm(email);
    setSending(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px', padding: '28px 24px',
        width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Transfer Ticket</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} color="#666" />
          </button>
        </div>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
          Enter the email address of the person you'd like to transfer this ticket to.
        </p>
        <input
          type="email"
          autoFocus
          placeholder="recipient@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: '10px',
            border: '1.5px solid #ddd', fontSize: '16px', outline: 'none',
            boxSizing: 'border-box', marginBottom: '20px',
            transition: 'border-color 0.2s'
          }}
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '14px', border: '1.5px solid #ddd', borderRadius: '10px',
              backgroundColor: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', color: '#333'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!email || sending}
            style={{
              flex: 1, padding: '14px', border: 'none', borderRadius: '10px',
              backgroundColor: email ? '#026cdf' : '#ccc',
              color: 'white', fontSize: '15px', fontWeight: 700, cursor: email ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s'
            }}
          >
            {sending ? 'Sending...' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketStub({ seatString, ticketId, onTransfer }) {
  const [showActions, setShowActions] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const parsed = parseSeat(seatString);

  return (
    <div style={{ marginBottom: '12px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e8e8e8' }}>
      {/* Ticket type header */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px 16px', fontWeight: 700, fontSize: '13px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {parsed.type}
      </div>

      {/* Section / Row / Seat row */}
      <div
        style={{ backgroundColor: 'white', padding: '16px', display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}
        onClick={() => setShowActions(!showActions)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#888', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>SECTION</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#111' }}>{parsed.section}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>ROW</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#111' }}>{parsed.row}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#888', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>SEAT</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#111' }}>{parsed.seat}</div>
        </div>
      </div>

      {/* Action buttons - shown on tap */}
      {showActions && (
        <div style={{ backgroundColor: '#fafafa', borderTop: '1px solid #eee', display: 'flex', gap: '12px', padding: '12px 16px', justifyContent: 'center' }}>
          <button
            onClick={() => { setShowTransferModal(true); setShowActions(false); }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px',
              padding: '14px 28px', cursor: 'pointer', flex: 1, maxWidth: '140px'
            }}
          >
            <ArrowUpRight size={22} color="#333" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Transfer</span>
          </button>
          {showTransferModal && (
            <TransferModal
              onConfirm={async (email) => { await onTransfer(ticketId, email); setShowTransferModal(false); }}
              onCancel={() => setShowTransferModal(false)}
            />
          )}

          <button
            onClick={() => alert('Sell feature coming soon!')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px',
              padding: '14px 28px', cursor: 'pointer', flex: 1, maxWidth: '140px',
              opacity: 0.5
            }}
          >
            <RefreshCw size={22} color="#333" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Sell</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyTickets() {
  const [activeTab, setActiveTab] = useState('Tickets');
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const [ticketRes, eventRes] = await Promise.all([
          token ? fetch(`${API}/api/tickets/my-tickets`, { headers: { 'Authorization': `Bearer ${token}` } }) : Promise.resolve({ ok: false }),
          fetch(`${API}/api/events`)
        ]);
        if (ticketRes.ok) {
          const tData = await ticketRes.json();
          setTickets(tData);
        }
        if (eventRes.ok) {
          const eData = await eventRes.json();
          setEvents(eData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEventImage = (eventTitle) => {
    const match = events.find(e => e.title === eventTitle);
    return match?.image || null;
  };

  const getEventMeta = (eventTitle) => {
    return events.find(e => e.title === eventTitle) || null;
  };

  const handleTransfer = async (ticketId, newEmail) => {
    if (!newEmail) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/tickets/${ticketId}/transfer-to`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newEmail })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Ticket successfully transferred to ${newEmail}!`);
        setTickets(prev => prev.filter(t => t._id !== ticketId));
        setSelectedOrder(null);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      alert('Transfer failed. Please try again.');
    }
  };

  // Detailed ticket order view
  if (selectedOrder) {
    const eventMeta = getEventMeta(selectedOrder.eventTitle);
    const image = eventMeta?.image;

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f8f8' }}>
        {/* Banner */}
        <div style={{ position: 'relative' }}>
          {image
            ? <img src={image} alt={selectedOrder.eventTitle} style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '220px', background: 'linear-gradient(135deg, #026cdf, #004aad)' }} />
          }
          {/* Back button */}
          <button
            onClick={() => setSelectedOrder(null)}
            style={{ position: 'absolute', top: '16px', left: '16px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <button style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Help</button>
        </div>

        {/* Event Info */}
        <div style={{ backgroundColor: 'white', padding: '16px 20px 0' }}>
          <p style={{ color: '#026cdf', fontSize: '13px', fontWeight: 600, margin: '0 0 6px' }}>
            {eventMeta?.date || 'Upcoming Event'}
          </p>
          <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 6px', textTransform: 'uppercase', lineHeight: 1.2 }}>{selectedOrder.eventTitle}</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#555', fontSize: '13px' }}>
              <MapPin size={14} />
              <span>{eventMeta?.location || 'Venue'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#333', fontSize: '13px', fontWeight: 600 }}>
              <TicketIcon size={16} />
              <span>x{selectedOrder.seats.length}</span>
            </div>
          </div>

          {/* View Tickets CTA */}
          <button style={{ width: '100%', backgroundColor: '#026cdf', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <TicketIcon size={18} />
            View Tickets
          </button>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5' }}>
            {['Tickets', 'Extras'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '15px', fontWeight: 700,
                  color: activeTab === tab ? '#111' : '#aaa',
                  borderBottom: activeTab === tab ? '3px solid #111' : '3px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Stubs */}
        <div style={{ padding: '16px' }}>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>x{selectedOrder.seats.length} Tickets</p>
          {activeTab === 'Tickets' && selectedOrder.seats.map((seatStr, idx) => (
            <TicketStub
              key={idx}
              seatString={seatStr}
              ticketId={selectedOrder._id}
              onTransfer={handleTransfer}
            />
          ))}
          {activeTab === 'Extras' && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>No extras available for this order.</div>
          )}
        </div>
      </div>
    );
  }

  // Orders list view
  return (
    <div className="page my-tickets-page" style={{ backgroundColor: '#f8f8f8', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', padding: '20px 16px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>My Tickets</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>Loading tickets...</div>
      ) : tickets.length > 0 ? (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tickets.map(ticket => {
            const image = getEventImage(ticket.eventTitle);
            const meta = getEventMeta(ticket.eventTitle);
            return (
              <div
                key={ticket._id}
                onClick={() => setSelectedOrder(ticket)}
                style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.15s', ':hover': { transform: 'translateY(-2px)' } }}
              >
                {/* Event Banner */}
                {image
                  ? <img src={image} alt={ticket.eventTitle} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '140px', background: 'linear-gradient(135deg, #026cdf, #004aad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TicketIcon size={48} color="rgba(255,255,255,0.4)" />
                    </div>
                }

                {/* Order Info */}
                <div style={{ padding: '14px 16px' }}>
                  {meta?.date && <p style={{ color: '#026cdf', fontSize: '12px', fontWeight: 600, margin: '0 0 4px' }}>{meta.date}</p>}
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', textTransform: 'uppercase' }}>{ticket.eventTitle}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666', fontSize: '13px' }}>{meta?.location || 'View Order'}</span>
                    <span style={{ color: '#333', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TicketIcon size={14} /> x{ticket.seats.length}
                    </span>
                  </div>
                  {/* Status badge */}
                  <div style={{ marginTop: '10px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                      backgroundColor: ticket.status === 'Approved' ? '#e8f5e9' : '#fff8e1',
                      color: ticket.status === 'Approved' ? '#2e7d32' : '#f57f17'
                    }}>
                      {ticket.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#f0f5ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <TicketIcon size={40} color="#026cdf" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No tickets yet</h2>
          <p style={{ color: '#888', marginBottom: '32px' }}>When you buy tickets, they'll show up here.</p>
          <button className="btn-primary" style={{ maxWidth: '200px' }} onClick={() => navigate('/')}>Find Tickets</button>
        </div>
      )}
    </div>
  );
}

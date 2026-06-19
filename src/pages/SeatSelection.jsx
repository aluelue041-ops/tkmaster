import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Check, Plus, Minus } from 'lucide-react';

export default function SeatSelection() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const event = location.state?.event;
  const eventTitle = event?.title || 'Selected Event';
  
  const [selectedSection, setSelectedSection] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const sections = [
    { id: 'pits', name: 'Pits', price: 350, color: '#ff3b30', available: true },
    { id: 'front_standing', name: 'Front Standing', price: 250, color: '#007aff', available: true },
    { id: 'level_1', name: 'Level 1', price: 200, color: '#34c759', available: true },
    { id: 'rear_standing', name: 'Rear Standing', price: 150, color: '#ffcc00', available: true },
    { id: 'level_2', name: 'Level 2', price: 120, color: '#af52de', available: true },
    { id: 'level_5', name: 'Level 5', price: 80, color: '#ff9500', available: true },
  ];

  const totalPrice = selectedSection ? selectedSection.price * quantity : 0;

  const handleCheckout = async () => {
    if (!selectedSection) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to book tickets!');
      navigate('/signin');
      return;
    }

    // Generate simulated seat IDs based on section
    const seats = Array.from({ length: quantity }, (_, i) => `${selectedSection.name} - Tkt ${i + 1}`);

    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/tickets/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: id || 'trending',
          eventTitle: eventTitle,
          seats: seats,
          totalPrice
        })
      });

      if (!res.ok) throw new Error('Failed to book tickets');
      
      alert(`Successfully booked ${quantity} ticket(s) in ${selectedSection.name} for $${totalPrice}!`);
      navigate('/mytickets');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page seat-selection-page" style={{ paddingBottom: '120px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', cursor: 'pointer', flexShrink: 0 }}
        >
          <ChevronLeft size={24} color="#333" />
        </button>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Select Tickets</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{eventTitle}</p>
        </div>
      </div>

      {/* Simplified Stadium Map Illustration */}
      <div style={{ padding: '24px 16px', backgroundColor: 'white', marginBottom: '8px', borderBottom: '1px solid #eaeaea' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', textAlign: 'center', color: '#555' }}>Stadium Layout</h3>
        <svg viewBox="0 0 300 220" style={{ width: '100%', maxWidth: '350px', margin: '0 auto', display: 'block' }}>
          {/* Level 5 */}
          <path d="M 60 20 A 130 100 0 0 1 60 200" fill="none" stroke="#ff9500" strokeWidth="16" strokeLinecap="round" />
          {/* Level 2 */}
          <path d="M 80 45 A 100 75 0 0 1 80 175" fill="none" stroke="#af52de" strokeWidth="14" strokeLinecap="round" />
          {/* Level 1 */}
          <path d="M 100 70 A 70 50 0 0 1 100 150" fill="none" stroke="#34c759" strokeWidth="14" strokeLinecap="round" />
          
          {/* Stage */}
          <rect x="20" y="90" width="30" height="40" fill="#333" rx="4" />
          <text x="35" y="114" fill="white" fontSize="9" textAnchor="middle" fontWeight="bold" transform="rotate(-90, 35, 110)">STAGE</text>
          
          {/* Front Standing */}
          <rect x="60" y="55" width="50" height="30" fill="#007aff" rx="4" />
          <rect x="60" y="135" width="50" height="30" fill="#007aff" rx="4" />

          {/* Pits */}
          <rect x="60" y="90" width="22" height="18" fill="#ff3b30" rx="3" />
          <rect x="60" y="112" width="22" height="18" fill="#ff3b30" rx="3" />
          <rect x="86" y="90" width="22" height="18" fill="#ff3b30" rx="3" />
          <rect x="86" y="112" width="22" height="18" fill="#ff3b30" rx="3" />
          
          {/* Rear Standing */}
          <rect x="120" y="55" width="40" height="110" fill="#ffcc00" rx="4" />
        </svg>
      </div>

      {/* Sections List */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Available Sections</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sections.map(section => (
            <div 
              key={section.id}
              onClick={() => setSelectedSection(section)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: `2px solid ${selectedSection?.id === section.id ? '#026cdf' : 'transparent'}`,
                boxShadow: selectedSection?.id === section.id ? '0 4px 12px rgba(2,108,223,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: section.color }}></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{section.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>General Admission</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary-color)' }}>${section.price}</div>
                {selectedSection?.id === section.id && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <Check size={16} color="#026cdf" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Footer */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px', 
        backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 100,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
      }}>
        {selectedSection && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600, color: '#333' }}>Quantity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Minus size={16} color="#333" />
              </button>
              <span style={{ fontSize: '18px', fontWeight: 700, width: '20px', textAlign: 'center' }}>{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Plus size={16} color="#333" />
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {selectedSection ? `${quantity} x ${selectedSection.name}` : 'Select a section'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>${totalPrice}</div>
          </div>
          <button 
            className="btn-primary" 
            style={{ 
              width: 'auto', padding: '14px 32px', margin: 0, 
              opacity: !selectedSection ? 0.5 : 1, 
              cursor: !selectedSection ? 'not-allowed' : 'pointer',
              backgroundColor: '#026cdf', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px'
            }} 
            onClick={handleCheckout}
            disabled={!selectedSection}
          >
            Checkout
          </button>
        </div>
      </div>

    </div>
  );
}

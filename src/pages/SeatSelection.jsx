import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Check, Plus, Minus } from 'lucide-react';

export default function SeatSelection() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const event = location.state?.event;
  const eventTitle = event?.title || 'Selected Event';
  const currency = event?.currency || '$';
  
  const [selectedSection, setSelectedSection] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSpecificSeats, setSelectedSpecificSeats] = useState([]);
  const [viewMode, setViewMode] = useState('sections'); // 'sections' or 'seats'

  const basePrice = event?.basePrice || 80;

  const sections = [
    { id: 'vip_pit', name: 'VIP Pit (Floor A–D)', price: Math.round(basePrice * 4.5), color: '#ff3b30', isGA: false, config: { rows: 20, seats: 30 } },
    { id: 'premium_floor', name: 'Premium Floor (Floor E–L)', price: Math.round(basePrice * 4), color: '#ff2d55', isGA: false, config: { rows: 25, seats: 40 } },
    { id: 'gold_1', name: 'Gold (110–114, 128–132)', price: Math.round(basePrice * 3), color: '#ffcc00', isGA: false, config: { rows: 25, seats: 35 } },
    { id: 'gold_2', name: 'Gold (115–127)', price: Math.round(basePrice * 3), color: '#ffc107', isGA: false, config: { rows: 30, seats: 40 } },
    { id: 'silver', name: 'Silver (105–109, 133–138)', price: Math.round(basePrice * 2.5), color: '#a1a1aa', isGA: false, config: { rows: 30, seats: 35 } },
    { id: 'bronze', name: 'Bronze (102–104, 139–156)', price: Math.round(basePrice * 2), color: '#cd7f32', isGA: false, config: { rows: 35, seats: 40 } },
    { id: 'club_london', name: 'Club London (M1–M16)', price: Math.round(basePrice * 6), color: '#000000', isGA: false, config: { rows: 15, seats: 25 } },
    { id: 'upper_gold', name: 'Upper Gold (210–214, 228–232)', price: Math.round(basePrice * 2.5), color: '#f59e0b', isGA: false, config: { rows: 20, seats: 30 } },
    { id: 'upper_silver', name: 'Upper Silver (205–209, 233–240)', price: Math.round(basePrice * 1.8), color: '#d4d4d8', isGA: false, config: { rows: 25, seats: 35 } },
    { id: 'upper_bronze', name: 'Upper Bronze (201–204, 241–256)', price: basePrice, color: '#b45309', isGA: false, config: { rows: 30, seats: 40 } },
  ];

  const getSeatedRows = (section) => {
    if (!section || !section.config) return [];
    return Array.from({ length: section.config.rows }, (_, rIndex) => ({
      id: String(rIndex + 1),
      seats: Array.from({ length: section.config.seats }, (_, sIndex) => sIndex + 1)
    }));
  };

  const seatedRows = getSeatedRows(selectedSection);

  // Randomly pre-book some seats for realism
  const [bookedSeats] = useState(new Set([
    '1-3', '1-4', '2-7', '3-1', '3-2', '5-10', '4-5', '4-6', '5-12'
  ]));

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setSelectedSpecificSeats([]);
    setQuantity(1);
    if (!section.isGA) {
      setViewMode('seats');
    }
  };

  const toggleSeat = (rowId, seatNum) => {
    const seatId = `${rowId}-${seatNum}`;
    if (bookedSeats.has(seatId)) return;

    setSelectedSpecificSeats(prev => {
      const exists = prev.find(s => s.id === seatId);
      if (exists) {
        return prev.filter(s => s.id !== seatId);
      } else {
        return [...prev, { id: seatId, row: rowId, num: seatNum }];
      }
    });
  };

  const totalPrice = selectedSection 
    ? (selectedSection.isGA ? selectedSection.price * quantity : selectedSection.price * selectedSpecificSeats.length) 
    : 0;

  const handleCheckout = async () => {
    if (!selectedSection) return;
    if (!selectedSection.isGA && selectedSpecificSeats.length === 0) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to book tickets!');
      navigate('/signin');
      return;
    }

    // Generate seat IDs
    const seats = selectedSection.isGA 
      ? Array.from({ length: quantity }, (_, i) => `Section: ${selectedSection.name}, Ticket Number: ${i + 1} (General Admission)`)
      : selectedSpecificSeats.map(s => `Section: ${selectedSection.name}, Row: ${s.row}, Seat Number: ${s.num}`);

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
          totalPrice,
          currency
        })
      });

      if (!res.ok) throw new Error('Failed to book tickets');
      
      const numTickets = selectedSection.isGA ? quantity : selectedSpecificSeats.length;
      alert(`Successfully booked ${numTickets} ticket(s) in ${selectedSection.name} for $${totalPrice}!`);
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
          onClick={() => {
            if (viewMode === 'seats') {
              setViewMode('sections');
              setSelectedSection(null);
            } else {
              navigate(-1);
            }
          }}
          style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', cursor: 'pointer', flexShrink: 0 }}
        >
          <ChevronLeft size={24} color="#333" />
        </button>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Select Tickets</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{eventTitle}</p>
        </div>
      </div>

      {viewMode === 'sections' ? (
        <>
          {/* Simplified Stadium Map Placeholder */}
          <div style={{ padding: '24px 16px', backgroundColor: 'white', marginBottom: '8px', borderBottom: '1px solid #eaeaea' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', textAlign: 'center', color: '#555' }}>Stadium Map</h3>
            <div style={{ width: '100%', height: '140px', backgroundColor: '#f9f9f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Select a Zone Below</span>
            </div>
          </div>

          {/* Sections List */}
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Available Sections</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sections.map(section => (
                <div 
                  key={section.id}
                  onClick={() => handleSectionSelect(section)}
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
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {section.isGA ? 'General Admission' : 'Reserved Seating'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary-color)' }}>{currency}{section.price}</div>
                    {selectedSection?.id === section.id && section.isGA && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <Check size={16} color="#026cdf" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Detailed Seat Map for Seated Sections */
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: selectedSection.color }}>{selectedSection.name}</h3>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Select your exact seats</p>
          </div>

          <div style={{ 
            width: '80%', height: '40px', margin: '0 auto 40px', 
            backgroundColor: '#e0e0e0', borderRadius: '8px 8px 50% 50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#666', fontWeight: 600, fontSize: '14px', letterSpacing: '2px'
          }}>
            STAGE DIRECTION
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', overflowX: 'auto', padding: '0 16px 32px' }}>
            {seatedRows.map(row => (
              <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '14px' }}>{row.id}</div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {row.seats.map(seat => {
                    const seatId = `${row.id}-${seat}`;
                    const isBooked = bookedSeats.has(seatId);
                    const isSelected = selectedSpecificSeats.some(s => s.id === seatId);
                    
                    let bgColor = '#fff';
                    let borderColor = '#ccc';
                    let color = 'transparent';

                    if (isBooked) {
                      bgColor = '#e0e0e0';
                      borderColor = '#e0e0e0';
                    } else if (isSelected) {
                      bgColor = selectedSection.color;
                      borderColor = selectedSection.color;
                      color = '#fff';
                    }

                    return (
                      <button
                        key={seat}
                        onClick={() => toggleSeat(row.id, seat)}
                        disabled={isBooked}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          backgroundColor: bgColor, border: `1px solid ${borderColor}`,
                          color: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: isBooked ? 'not-allowed' : 'pointer', transition: 'all 0.1s',
                          padding: 0
                        }}
                      >
                        {isSelected ? <Check size={16} color="white" /> : <span style={{ fontSize: '10px', color: isBooked ? '#999' : '#666' }}>{seat}</span>}
                      </button>
                    );
                  })}
                </div>
                
                <div style={{ width: '20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '14px' }}>{row.id}</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '16px', borderTop: '1px solid #eaeaea', backgroundColor: '#f8f9fa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}></div>
              <span style={{ fontSize: '13px', color: '#666' }}>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: selectedSection.color }}></div>
              <span style={{ fontSize: '13px', color: '#666' }}>Selected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#e0e0e0' }}></div>
              <span style={{ fontSize: '13px', color: '#666' }}>Taken</span>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Footer */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px', 
        backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 100,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
      }}>
        {selectedSection && selectedSection.isGA && (
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
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {selectedSection 
                ? (selectedSection.isGA 
                    ? `${quantity} x Section: ${selectedSection.name}` 
                    : selectedSpecificSeats.length > 0 
                      ? selectedSpecificSeats.map(s => `Sec: ${selectedSection.name}, Row: ${s.row}, Seat: ${s.num}`).join(' • ')
                      : `Section: ${selectedSection.name} (Select seats)`) 
                : 'Select a section'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{currency}{totalPrice}</div>
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
            disabled={!selectedSection || (!selectedSection.isGA && selectedSpecificSeats.length === 0)}
          >
            Checkout
          </button>
        </div>
      </div>

    </div>
  );
}

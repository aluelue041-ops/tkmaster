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
    { id: 'pits', name: 'Pits', price: Math.round(basePrice * 4.375), color: '#ff3b30', isGA: true },
    { id: 'front_standing', name: 'Front Standing', price: Math.round(basePrice * 3.125), color: '#007aff', isGA: true },
    { id: 'level_1', name: 'Level 1', price: Math.round(basePrice * 2.5), color: '#34c759', isGA: false },
    { id: 'rear_standing', name: 'Rear Standing', price: Math.round(basePrice * 1.875), color: '#ffcc00', isGA: true },
    { id: 'level_2', name: 'Level 2', price: Math.round(basePrice * 1.5), color: '#af52de', isGA: false },
    { id: 'level_5', name: 'Level 5', price: basePrice, color: '#ff9500', isGA: false },
  ];

  // Mock rows for seated sections
  const seatedRows = [
    { id: 'A', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 'B', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { id: 'C', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
    { id: 'D', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
    { id: 'E', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
  ];

  // Randomly pre-book some seats for realism
  const [bookedSeats] = useState(new Set([
    'A-3', 'A-4', 'B-7', 'C-1', 'C-2', 'E-10', 'D-5', 'D-6', 'E-12'
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
          {/* Simplified Stadium Map Illustration */}
          <div style={{ padding: '24px 16px', backgroundColor: 'white', marginBottom: '8px', borderBottom: '1px solid #eaeaea' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', textAlign: 'center', color: '#555' }}>Stadium Layout</h3>
            <svg viewBox="0 0 300 220" style={{ width: '100%', maxWidth: '350px', margin: '0 auto', display: 'block' }}>
          {/* Level 5 */}
          <path d="M 60 20 A 130 100 0 0 1 60 200" fill="transparent" stroke="#ff9500" strokeWidth="16" strokeLinecap="round" style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onClick={() => handleSectionSelect(sections.find(s => s.id === 'level_5'))} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'} />
          {/* Level 2 */}
          <path d="M 80 45 A 100 75 0 0 1 80 175" fill="transparent" stroke="#af52de" strokeWidth="14" strokeLinecap="round" style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onClick={() => handleSectionSelect(sections.find(s => s.id === 'level_2'))} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'} />
          {/* Level 1 */}
          <path d="M 100 70 A 70 50 0 0 1 100 150" fill="transparent" stroke="#34c759" strokeWidth="14" strokeLinecap="round" style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onClick={() => handleSectionSelect(sections.find(s => s.id === 'level_1'))} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'} />
          
          {/* Stage */}
          <rect x="20" y="90" width="30" height="40" fill="#333" rx="4" />
          <text x="35" y="114" fill="white" fontSize="9" textAnchor="middle" fontWeight="bold" transform="rotate(-90, 35, 110)">STAGE</text>
          
          {/* Front Standing */}
          <g style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onClick={() => handleSectionSelect(sections.find(s => s.id === 'front_standing'))} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
            <rect x="60" y="55" width="50" height="30" fill="#007aff" rx="4" />
            <rect x="60" y="135" width="50" height="30" fill="#007aff" rx="4" />
          </g>

          {/* Pits */}
          <g style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onClick={() => handleSectionSelect(sections.find(s => s.id === 'pits'))} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
            <rect x="60" y="90" width="22" height="18" fill="#ff3b30" rx="3" />
            <rect x="60" y="112" width="22" height="18" fill="#ff3b30" rx="3" />
            <rect x="86" y="90" width="22" height="18" fill="#ff3b30" rx="3" />
            <rect x="86" y="112" width="22" height="18" fill="#ff3b30" rx="3" />
          </g>
          
          {/* Rear Standing */}
          <rect x="120" y="55" width="40" height="110" fill="#ffcc00" rx="4" style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onClick={() => handleSectionSelect(sections.find(s => s.id === 'rear_standing'))} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'} />
            </svg>
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

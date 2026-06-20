import React, { useState, useEffect } from 'react';
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

  const generateSections = (base) => {
    const list = [];
    const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const charRange = (startChar, endChar) => {
      const start = startChar.charCodeAt(0);
      const end = endChar.charCodeAt(0);
      return Array.from({ length: end - start + 1 }, (_, i) => String.fromCharCode(start + i));
    };

    // 1. VIP (Floor A-D)
    charRange('A', 'D').forEach(char => {
      list.push({ id: `vip_floor_${char}`, name: `VIP - Floor ${char}`, ticketName: `VIP - Floor ${char}`, price: Math.round(base * 4.5), color: '#ff3b30', isGA: false, config: { rows: 20, seats: 30 } });
    });

    // 2. Premium Floor (Floor E-L)
    charRange('E', 'L').forEach(char => {
      list.push({ id: `premium_floor_${char}`, name: `Premium Floor - Floor ${char}`, ticketName: `Floor ${char}`, price: Math.round(base * 4), color: '#ff2d55', isGA: false, config: { rows: 25, seats: 40 } });
    });

    // 3. Gold (110-114, 128-132)
    [...range(110, 114), ...range(128, 132)].forEach(num => {
      list.push({ id: `gold_${num}`, name: `Gold - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 3), color: '#ffcc00', isGA: false, config: { rows: 25, seats: 35 } });
    });
    
    // 4. Gold (115-127)
    range(115, 127).forEach(num => {
      list.push({ id: `gold_${num}`, name: `Gold - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 3), color: '#ffc107', isGA: false, config: { rows: 30, seats: 40 } });
    });

    // 5. Silver (105-109, 133-138)
    [...range(105, 109), ...range(133, 138)].forEach(num => {
      list.push({ id: `silver_${num}`, name: `Silver - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 2.5), color: '#a1a1aa', isGA: false, config: { rows: 30, seats: 35 } });
    });

    // 6. Bronze (102-104, 139-156)
    [...range(102, 104), ...range(139, 156)].forEach(num => {
      list.push({ id: `bronze_${num}`, name: `Bronze - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 2), color: '#cd7f32', isGA: false, config: { rows: 35, seats: 40 } });
    });

    // 7. Club London (M1-M16)
    range(1, 16).forEach(num => {
      list.push({ id: `club_london_m${num}`, name: `Club London - M${num}`, ticketName: `Section M${num}`, price: Math.round(base * 6), color: '#000000', isGA: false, config: { rows: 15, seats: 25 } });
    });

    // 8. Upper Gold (210-214, 228-232)
    [...range(210, 214), ...range(228, 232)].forEach(num => {
      list.push({ id: `upper_gold_${num}`, name: `Upper Gold - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 2.5), color: '#f59e0b', isGA: false, config: { rows: 20, seats: 30 } });
    });

    // 9. Upper Silver (205-209, 233-240)
    [...range(205, 209), ...range(233, 240)].forEach(num => {
      list.push({ id: `upper_silver_${num}`, name: `Upper Silver - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 1.8), color: '#d4d4d8', isGA: false, config: { rows: 25, seats: 35 } });
    });

    // 10. Upper Bronze (201-204, 241-256)
    [...range(201, 204), ...range(241, 256)].forEach(num => {
      list.push({ id: `upper_bronze_${num}`, name: `Upper Bronze - Section ${num}`, ticketName: `Section ${num}`, price: base, color: '#b45309', isGA: false, config: { rows: 30, seats: 40 } });
    });

    return list;
  };

  const sections = generateSections(basePrice);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState('All');

  const filteredSections = sections.filter(sec => {
    // Search filter
    if (searchQuery && !sec.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // Zone filter
    if (activeZone === 'All') return true;
    if (activeZone === 'VIP' && sec.name.includes('VIP')) return true;
    if (activeZone === 'Floor' && sec.name.includes('Floor') && !sec.name.includes('VIP')) return true;
    if (activeZone === 'Level 100' && (sec.name.includes('1') && sec.name.length <= 15)) return true; // section 1xx
    if (activeZone === 'Level 200' && sec.name.includes('2')) return true;
    return false;
  });

  const getSeatedRows = (section) => {
    if (!section || !section.config) return [];
    return Array.from({ length: section.config.rows }, (_, rIndex) => ({
      id: String(rIndex + 1),
      seats: Array.from({ length: section.config.seats }, (_, sIndex) => sIndex + 1)
    }));
  };

  const seatedRows = getSeatedRows(selectedSection);

  // Real-time booked seats loaded from server
  const [bookedSeats, setBookedSeats] = useState(new Set());
  const [resaleTickets, setResaleTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('Standard');

  useEffect(() => {
    if (!id || id === 'trending') return;
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Fetch booked seats
    fetch(`${API}/api/events/${id}/booked-seats`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // seats stored as full strings like "Section: VIP - Floor A, Row: 1, Seat Number: 5"
          // Build a set of row-seat keys using section+row+seat
          const seatSet = new Set();
          data.forEach(s => {
            const rowMatch = s.match(/Row:\s*([^,]+)/);
            const seatMatch = s.match(/Seat Number:\s*(\d+)/);
            if (rowMatch && seatMatch) {
              seatSet.add(`${rowMatch[1].trim()}-${seatMatch[1]}`);
            }
          });
          setBookedSeats(seatSet);
        }
      })
      .catch(() => {});

    // Fetch resale tickets
    fetch(`${API}/api/events/${id}/resale-tickets`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setResaleTickets(data);
      })
      .catch(() => {});
  }, [id]);

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
      ? Array.from({ length: quantity }, (_, i) => `Section: ${selectedSection.ticketName}, Ticket Number: ${i + 1} (General Admission)`)
      : selectedSpecificSeats.map(s => `Section: ${selectedSection.ticketName}, Row: ${s.row}, Seat Number: ${s.num}`);

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

  const [resaleLoading, setResaleLoading] = useState(null);

  const handleResaleCheckout = async (ticketId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to book tickets!');
      navigate('/signin');
      return;
    }

    setResaleLoading(ticketId);
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/tickets/${ticketId}/buy-resale`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to buy resale ticket');
      
      // Real-time toast will handle the success message from App.jsx socket
      navigate('/mytickets');
    } catch (err) {
      alert(err.message);
      setResaleLoading(null);
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

      {/* Ticket Type Tabs */}
      {viewMode === 'sections' && (
        <div style={{ display: 'flex', backgroundColor: 'white', borderBottom: '1px solid #eaeaea', position: 'sticky', top: '72px', zIndex: 90 }}>
          {['Standard', 'Resale'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '16px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '15px', fontWeight: 700,
                color: activeTab === tab ? '#111' : '#888',
                borderBottom: activeTab === tab ? '3px solid #026cdf' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab} {tab === 'Resale' && `(${resaleTickets.length})`}
            </button>
          ))}
        </div>
      )}

      {viewMode === 'sections' ? (
        activeTab === 'Standard' ? (
          <>
            {/* Interactive Stadium Map */}
          <div style={{ padding: '24px 16px', backgroundColor: 'white', borderBottom: '1px solid #eaeaea' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px', textAlign: 'center', color: '#111' }}>Interactive Stadium Map</h3>
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px', margin: '0 auto', height: '220px' }}>
              <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.05))' }}>
                {/* Stage */}
                <rect x="70" y="10" width="60" height="20" rx="4" fill="#333" />
                <text x="100" y="23" fontSize="8" fill="white" fontWeight="bold" textAnchor="middle">STAGE</text>
                
                {/* VIP / Pit */}
                <path d="M 60 40 L 140 40 Q 145 60 140 70 L 60 70 Q 55 60 60 40" fill={activeZone === 'VIP' ? '#ff3b30' : '#ffebee'} stroke="#ff3b30" strokeWidth="2" cursor="pointer" onClick={() => setActiveZone('VIP')} />
                <text x="100" y="58" fontSize="10" fill={activeZone === 'VIP' ? 'white' : '#ff3b30'} fontWeight="bold" textAnchor="middle" pointerEvents="none">VIP</text>

                {/* Floor */}
                <path d="M 50 80 L 150 80 Q 155 110 145 130 L 55 130 Q 45 110 50 80" fill={activeZone === 'Floor' ? '#026cdf' : '#e3f2fd'} stroke="#026cdf" strokeWidth="2" cursor="pointer" onClick={() => setActiveZone('Floor')} />
                <text x="100" y="108" fontSize="10" fill={activeZone === 'Floor' ? 'white' : '#026cdf'} fontWeight="bold" textAnchor="middle" pointerEvents="none">FLOOR</text>

                {/* Level 100 */}
                <path d="M 35 140 C 35 140, 100 170, 165 140 L 180 160 C 180 160, 100 195, 20 160 Z" fill={activeZone === 'Level 100' ? '#f5a623' : '#fff8e1'} stroke="#f5a623" strokeWidth="2" cursor="pointer" onClick={() => setActiveZone('Level 100')} />
                <text x="100" y="165" fontSize="9" fill={activeZone === 'Level 100' ? 'white' : '#f5a623'} fontWeight="bold" textAnchor="middle" pointerEvents="none">LEVEL 100</text>

                {/* Level 200 */}
                <path d="M 10 170 C 10 170, 100 210, 190 170 L 195 180 C 195 180, 100 225, 5 180 Z" fill={activeZone === 'Level 200' ? '#8e8e93' : '#f5f5f5'} stroke="#8e8e93" strokeWidth="2" cursor="pointer" onClick={() => setActiveZone('Level 200')} />
                <text x="100" y="190" fontSize="8" fill={activeZone === 'Level 200' ? 'white' : '#8e8e93'} fontWeight="bold" textAnchor="middle" pointerEvents="none">LEVEL 200</text>
              </svg>
            </div>
            
            {/* Zone Filter Chips */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '16px 0 4px', scrollbarWidth: 'none' }}>
              {['All', 'VIP', 'Floor', 'Level 100', 'Level 200'].map(zone => (
                <button
                  key={zone}
                  onClick={() => setActiveZone(zone)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: activeZone === zone ? '#111' : '#f0f0f0',
                    color: activeZone === zone ? 'white' : '#555'
                  }}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ padding: '16px 16px 0' }}>
            <input
              type="text"
              placeholder="Search sections (e.g., '109', 'VIP')..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #eaeaea',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
            />
          </div>

          {/* Sections List */}
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Available Sections ({filteredSections.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredSections.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#888' }}>No sections match your search.</div>
              )}
              {filteredSections.map(section => (
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
          <div style={{ padding: '16px' }}>
            <div style={{ backgroundColor: '#f0f6ff', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #c8def5' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#026cdf' }}>Fan-to-Fan Resale</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>These tickets are being sold by other fans. Prices are set by the seller.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resaleTickets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#888' }}>No resale tickets available right now.</div>
              )}
              {resaleTickets.map(ticket => (
                <div 
                  key={ticket._id}
                  style={{
                    padding: '16px', backgroundColor: 'white', borderRadius: '12px',
                    border: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ backgroundColor: '#ff3b30', color: 'white', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Resale</span>
                      <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>{ticket.seats.length} Ticket(s)</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>
                      {ticket.seats.length > 0 ? ticket.seats[0].split(',')[0] : 'General Admission'}
                    </div>
                    {ticket.seats.length > 1 && (
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>+ {ticket.seats.length - 1} more seat(s)</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: '#111' }}>{ticket.currency || '$'}{ticket.resalePrice} <span style={{ fontSize: '12px', fontWeight: 400, color: '#888' }}>ea</span></div>
                    <button 
                      onClick={() => handleResaleCheckout(ticket._id)}
                      disabled={resaleLoading === ticket._id}
                      style={{ marginTop: '8px', padding: '6px 16px', backgroundColor: resaleLoading === ticket._id ? '#e0e0e0' : '#026cdf', color: resaleLoading === ticket._id ? '#999' : 'white', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: resaleLoading === ticket._id ? 'not-allowed' : 'pointer' }}
                    >
                      {resaleLoading === ticket._id ? 'Buying...' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
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
                    ? `${quantity} x ${selectedSection.ticketName}` 
                    : selectedSpecificSeats.length > 0 
                      ? selectedSpecificSeats.map(s => `Sec: ${selectedSection.ticketName.replace('Section ', '')}, Row: ${s.row}, Seat: ${s.num}`).join(' • ')
                      : `${selectedSection.ticketName} (Select seats)`) 
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

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Check, Plus, Minus } from 'lucide-react';
import { toast } from 'react-toastify';

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
  const [viewMode, setViewMode] = useState('sections');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Limit modal state
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');

  const basePrice = event?.basePrice || 80;

  const generateSections = (base) => {
    const list = [];
    
    if (event?.venueLayout === 'concert-oval' && event?.seatConfig) {
      const c = event.seatConfig;
      if (c.vipStanding?.enabled) {
        list.push({ id: 'vip_standing_a', name: 'VIP STANDING PEN A', ticketName: 'VIP STANDING PEN A', price: Math.round(base * 4.6), color: '#e040fb', isGA: true, config: c.vipStanding });
        list.push({ id: 'vip_standing_b', name: 'VIP STANDING PEN B', ticketName: 'VIP STANDING PEN B', price: Math.round(base * 4.6), color: '#e040fb', isGA: true, config: c.vipStanding });
      }
      if (c.vipSeated?.enabled) {
        list.push({ id: 'vip_seated', name: 'VIP Seated', ticketName: 'VIP Seated', price: Math.round(base * 4.7), color: '#06b6d4', isGA: false, config: c.vipSeated });
      }
      if (c.cat1?.enabled) list.push({ id: 'cat1', name: 'CAT 1', ticketName: 'CAT 1', price: Math.round(base * 3.7), color: '#fdd835', isGA: false, config: c.cat1 });
      if (c.cat2?.enabled) list.push({ id: 'cat2', name: 'CAT 2', ticketName: 'CAT 2', price: Math.round(base * 3.8), color: '#42a5f5', isGA: false, config: c.cat2 });
      if (c.cat3?.enabled) list.push({ id: 'cat3', name: 'CAT 3', ticketName: 'CAT 3', price: Math.round(base * 3.2), color: '#ef5350', isGA: false, config: c.cat3 });
      if (c.cat4?.enabled) list.push({ id: 'cat4', name: 'CAT 4', ticketName: 'CAT 4', price: Math.round(base * 2.3), color: '#66bb6a', isGA: false, config: c.cat4 });
      if (c.cat5?.enabled) list.push({ id: 'cat5', name: 'CAT 5 (Restricted)', ticketName: 'CAT 5', price: Math.round(base * 3.2), color: '#ff9800', isGA: false, config: c.cat5 });
      if (c.cat6?.enabled) list.push({ id: 'cat6', name: 'CAT 6 (Restricted)', ticketName: 'CAT 6', price: Math.round(base * 2.1), color: '#ab47bc', isGA: false, config: c.cat6 });
      return list;
    }

    const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const charRange = (startChar, endChar) => {
      const start = startChar.charCodeAt(0);
      const end = endChar.charCodeAt(0);
      return Array.from({ length: end - start + 1 }, (_, i) => String.fromCharCode(start + i));
    };

    // 1. VIP (Floor A-D)
    charRange('A', 'D').forEach(char => {
      list.push({ id: `vip_floor_${char}`, name: `VIP - Floor ${char}`, ticketName: `VIP - Floor ${char}`, price: Math.round(base * 4.5), color: '#ff3b30', isGA: false, config: { rows: 13, seats: 30 } });
    });

    // 2. Premium Floor (Floor E-L)
    charRange('E', 'L').forEach(char => {
      list.push({ id: `premium_floor_${char}`, name: `Premium Floor - Floor ${char}`, ticketName: `Floor ${char}`, price: Math.round(base * 4), color: '#ff2d55', isGA: false, config: { rows: 13, seats: 40 } });
    });

    // 3. Gold (110-114, 128-132)
    [...range(110, 114), ...range(128, 132)].forEach(num => {
      list.push({ id: `gold_${num}`, name: `Gold - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 3), color: '#ffcc00', isGA: false, config: { rows: 13, seats: 35 } });
    });
    
    // 4. Gold (115-127)
    range(115, 127).forEach(num => {
      list.push({ id: `gold_${num}`, name: `Gold - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 3), color: '#ffc107', isGA: false, config: { rows: 13, seats: 40 } });
    });

    // 5. Silver (105-109, 133-138)
    [...range(105, 109), ...range(133, 138)].forEach(num => {
      list.push({ id: `silver_${num}`, name: `Silver - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 2.5), color: '#a1a1aa', isGA: false, config: { rows: 13, seats: 35 } });
    });

    // 6. Bronze (102-104, 139-156)
    [...range(102, 104), ...range(139, 156)].forEach(num => {
      list.push({ id: `bronze_${num}`, name: `Bronze - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 2), color: '#cd7f32', isGA: false, config: { rows: 13, seats: 40 } });
    });

    // 7. Club London (M1-M16)
    range(1, 16).forEach(num => {
      list.push({ id: `club_london_m${num}`, name: `Club London - M${num}`, ticketName: `Section M${num}`, price: Math.round(base * 6), color: '#000000', isGA: false, config: { rows: 13, seats: 25 } });
    });

    // 8. Upper Gold (210-214, 228-232)
    [...range(210, 214), ...range(228, 232)].forEach(num => {
      list.push({ id: `upper_gold_${num}`, name: `Upper Gold - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 2.5), color: '#f59e0b', isGA: false, config: { rows: 13, seats: 30 } });
    });

    // 9. Upper Silver (205-209, 233-240)
    [...range(205, 209), ...range(233, 240)].forEach(num => {
      list.push({ id: `upper_silver_${num}`, name: `Upper Silver - Section ${num}`, ticketName: `Section ${num}`, price: Math.round(base * 1.8), color: '#d4d4d8', isGA: false, config: { rows: 13, seats: 35 } });
    });

    // 10. Upper Bronze (201-204, 241-256)
    [...range(201, 204), ...range(241, 256)].forEach(num => {
      list.push({ id: `upper_bronze_${num}`, name: `Upper Bronze - Section ${num}`, ticketName: `Section ${num}`, price: base, color: '#b45309', isGA: false, config: { rows: 13, seats: 40 } });
    });

    return list;
  };

  const sections = generateSections(basePrice);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState('All');

  const filteredSections = sections.filter(sec => {
    if (searchQuery && !sec.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeZone === 'All') return true;
    
    if (event?.venueLayout === 'concert-oval') {
      return sec.id.includes(activeZone);
    }
    
    // Fallback filters for legacy layout
    if (activeZone === 'VIP' && sec.name.includes('VIP')) return true;
    if (activeZone === 'Floor' && sec.name.includes('Floor') && !sec.name.includes('VIP')) return true;
    if (activeZone === 'Level 100' && (sec.name.includes('1') && sec.name.length <= 15)) return true;
    if (activeZone === 'Level 200' && sec.name.includes('2')) return true;
    return false;
  });

  const getSeatedRows = (section) => {
    if (!section || !section.config) return [];
    
    const useLetters = event?.rowLabelType === 'letters' && !section.id.toLowerCase().includes('vip') && !section.id.toLowerCase().includes('floor');
    
    return Array.from({ length: section.config.rows }, (_, rIndex) => {
      let rowId;
      if (useLetters) {
        let n = rIndex;
        rowId = '';
        while (n >= 0) {
          rowId = String.fromCharCode((n % 26) + 65) + rowId;
          n = Math.floor(n / 26) - 1;
        }
      } else {
        rowId = String(rIndex + 1);
      }

      return {
        id: rowId,
        seats: Array.from({ length: section.config.seats }, (_, sIndex) => sIndex + 1)
      };
    });
  };

  const seatedRows = getSeatedRows(selectedSection);

  // Real-time booked seats loaded from server
  const [bookedSeats, setBookedSeats] = useState(new Set());
  const [resaleTickets, setResaleTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('Standard');

  useEffect(() => {
    if (!id || id === 'trending') return;
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    fetch(`${API}/api/events/${id}/booked-seats`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // seats stored as full strings like "Section: VIP - Floor A, Row: 1, Seat Number: 5"
          // Build a set of section-row-seat keys
          const seatSet = new Set();
          data.forEach(s => {
            const secMatch = s.match(/Section:\s*([^,]+)/);
            const rowMatch = s.match(/Row:\s*([^,]+)/);
            const seatMatch = s.match(/Seat Number:\s*(\d+)/);
            if (secMatch && rowMatch && seatMatch) {
              seatSet.add(`${secMatch[1].trim()}-${rowMatch[1].trim()}-${seatMatch[1]}`);
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
    const seatId = `${selectedSection.ticketName}-${rowId}-${seatNum}`;
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
    if (checkoutLoading) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in to book tickets!');
      navigate('/signin');
      return;
    }

    // Generate seat IDs
    const seats = selectedSection.isGA 
      ? Array.from({ length: quantity }, (_, i) => `Section: ${selectedSection.ticketName}, Ticket Number: ${i + 1} (General Admission)`)
      : selectedSpecificSeats.map(s => `Section: ${selectedSection.ticketName}, Row: ${s.row}, Seat Number: ${s.num}`);

    setCheckoutLoading(true);
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
          eventImage: event?.image || null,
          seats: seats,
          totalPrice,
          currency
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.limitExceeded) {
          setLimitMessage(errData.error);
          setShowLimitModal(true);
          return;
        }
        throw new Error(errData.error || `Server error (${res.status})`);
      }
      
      const numTickets = selectedSection.isGA ? quantity : selectedSpecificSeats.length;
      toast.success(`Successfully booked ${numTickets} ticket(s)!`);
      navigate('/mytickets');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const [resaleLoading, setResaleLoading] = useState(null);

  const handleResaleCheckout = async (ticketId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in to book tickets!');
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
      toast.error(err.message);
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
            {/* Interactive Stadium Map — Oval Concert Layout */}
          <div style={{ padding: '20px 16px 16px', backgroundColor: 'white', borderBottom: '1px solid #eaeaea' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px', textAlign: 'center', color: '#111' }}>Interactive Stadium Map</h3>
            <div style={{ position: 'relative', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
              <svg viewBox="0 0 480 310" style={{ width: '100%', height: 'auto', display: 'block' }}>
                {/* Stadium oval background */}
                <ellipse cx="240" cy="155" rx="225" ry="140" fill="#1e1e2e" stroke="#444" strokeWidth="1.5"/>

                {/* Compass labels */}
                <text x="240" y="16" textAnchor="middle" fill="#666" fontFamily="sans-serif" fontSize="9" fontWeight="700" letterSpacing="2">NORTH</text>
                <text x="240" y="304" textAnchor="middle" fill="#666" fontFamily="sans-serif" fontSize="9" fontWeight="700" letterSpacing="2">SOUTH</text>
                <text x="11" y="159" textAnchor="middle" fill="#666" fontFamily="sans-serif" fontSize="9" fontWeight="700" letterSpacing="2" transform="rotate(-90,11,159)">WEST</text>
                <text x="469" y="159" textAnchor="middle" fill="#666" fontFamily="sans-serif" fontSize="9" fontWeight="700" letterSpacing="2" transform="rotate(90,469,159)">EAST</text>

                {/* 🏟️ STAGE (left / west side) ── */}
                <rect x="62" y="122" width="100" height="62" rx="4" fill="#f0f0f0"/>
                <rect x="162" y="137" width="130" height="32" rx="3" fill="#f0f0f0"/>
                <rect x="200" y="108" width="52" height="29" rx="3" fill="#f0f0f0"/>
                <rect x="200" y="173" width="52" height="29" rx="3" fill="#f0f0f0"/>
                <rect x="236" y="202" width="28" height="24" rx="3" fill="#f0f0f0"/>
                <text x="112" y="157" textAnchor="middle" fill="#333" fontFamily="sans-serif" fontSize="10" fontWeight="900" letterSpacing="1.5">STAGE</text>

                {/* ── VIP STANDING PEN A (magenta, right of catwalk) ── */}
                <rect x="296" y="133" width="38" height="46" rx="4"
                  fill={activeZone === 'vip_standing' ? '#e040fb' : 'rgba(224,64,251,0.25)'}
                  stroke="#e040fb" strokeWidth="1.5" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'vip_standing' ? 'All' : 'vip_standing')}/>
                <text x="315" y="153" textAnchor="middle" fill={activeZone === 'vip_standing' ? '#fff' : '#e040fb'} fontFamily="sans-serif" fontSize="6.5" fontWeight="700" pointerEvents="none">STANDING</text>
                <text x="315" y="163" textAnchor="middle" fill={activeZone === 'vip_standing' ? '#fff' : '#e040fb'} fontFamily="sans-serif" fontSize="6.5" fontWeight="700" pointerEvents="none">PEN A</text>

                {/* VIP STANDING PEN B (magenta, above/below catwalk) */}
                <rect x="174" y="107" width="32" height="28" rx="3"
                  fill={activeZone === 'vip_standing' ? '#e040fb' : 'rgba(224,64,251,0.25)'}
                  stroke="#e040fb" strokeWidth="1.5" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'vip_standing' ? 'All' : 'vip_standing')}/>
                <rect x="174" y="175" width="32" height="28" rx="3"
                  fill={activeZone === 'vip_standing' ? '#e040fb' : 'rgba(224,64,251,0.25)'}
                  stroke="#e040fb" strokeWidth="1.5" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'vip_standing' ? 'All' : 'vip_standing')}/>
                <text x="190" y="120" textAnchor="middle" fill={activeZone === 'vip_standing' ? '#fff' : '#e040fb'} fontFamily="sans-serif" fontSize="5.5" fontWeight="700" pointerEvents="none">PEN B</text>

                {/* ── CAT 1 — YELLOW (VIP Seated inner strip) ── */}
                <rect x="174" y="90" width="162" height="16" rx="3"
                  fill={activeZone === 'cat1' ? '#fdd835' : 'rgba(253,216,53,0.3)'}
                  stroke="#fdd835" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat1' ? 'All' : 'cat1')}/>
                <rect x="174" y="204" width="162" height="16" rx="3"
                  fill={activeZone === 'cat1' ? '#fdd835' : 'rgba(253,216,53,0.3)'}
                  stroke="#fdd835" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat1' ? 'All' : 'cat1')}/>
                <text x="255" y="101" textAnchor="middle" fill={activeZone === 'cat1' ? '#333' : '#fdd835'} fontFamily="sans-serif" fontSize="6" fontWeight="700" pointerEvents="none">CAT 1</text>

                {/* ── CAT 2 — BLUE (mid ring) ── */}
                <rect x="160" y="71" width="180" height="17" rx="3"
                  fill={activeZone === 'cat2' ? '#42a5f5' : 'rgba(66,165,245,0.25)'}
                  stroke="#42a5f5" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat2' ? 'All' : 'cat2')}/>
                <rect x="160" y="222" width="180" height="17" rx="3"
                  fill={activeZone === 'cat2' ? '#42a5f5' : 'rgba(66,165,245,0.25)'}
                  stroke="#42a5f5" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat2' ? 'All' : 'cat2')}/>
                <text x="250" y="83" textAnchor="middle" fill={activeZone === 'cat2' ? '#fff' : '#42a5f5'} fontFamily="sans-serif" fontSize="6" fontWeight="700" pointerEvents="none">CAT 2</text>

                {/* ── CAT 3 — RED (outer ring top/bottom) ── */}
                {[144, 212, 280].map((x, i) => (
                  <rect key={`cat3t-${i}`} x={x} y="51" width="62" height="18" rx="3"
                    fill={activeZone === 'cat3' ? '#ef5350' : 'rgba(239,83,80,0.25)'}
                    stroke="#ef5350" strokeWidth="1.2" cursor="pointer"
                    onClick={() => setActiveZone(activeZone === 'cat3' ? 'All' : 'cat3')}/>
                ))}
                {[144, 212, 280].map((x, i) => (
                  <rect key={`cat3b-${i}`} x={x} y="241" width="62" height="18" rx="3"
                    fill={activeZone === 'cat3' ? '#ef5350' : 'rgba(239,83,80,0.25)'}
                    stroke="#ef5350" strokeWidth="1.2" cursor="pointer"
                    onClick={() => setActiveZone(activeZone === 'cat3' ? 'All' : 'cat3')}/>
                ))}
                <text x="238" y="63" textAnchor="middle" fill={activeZone === 'cat3' ? '#fff' : '#ef5350'} fontFamily="sans-serif" fontSize="6" fontWeight="700" pointerEvents="none">CAT 3</text>

                {/* ── CAT 4 — GREEN (outer sides) ── */}
                {/* Left / West side */}
                <rect x="82" y="58" width="60" height="36" rx="4"
                  fill={activeZone === 'cat4' ? '#66bb6a' : 'rgba(102,187,106,0.25)'}
                  stroke="#66bb6a" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat4' ? 'All' : 'cat4')}/>
                <rect x="54" y="100" width="88" height="30" rx="4"
                  fill={activeZone === 'cat4' ? '#66bb6a' : 'rgba(102,187,106,0.25)'}
                  stroke="#66bb6a" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat4' ? 'All' : 'cat4')}/>
                <rect x="40" y="135" width="22" height="42" rx="4"
                  fill={activeZone === 'cat4' ? '#66bb6a' : 'rgba(102,187,106,0.25)'}
                  stroke="#66bb6a" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat4' ? 'All' : 'cat4')}/>
                <rect x="54" y="180" width="88" height="30" rx="4"
                  fill={activeZone === 'cat4' ? '#66bb6a' : 'rgba(102,187,106,0.25)'}
                  stroke="#66bb6a" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat4' ? 'All' : 'cat4')}/>
                <rect x="82" y="215" width="60" height="36" rx="4"
                  fill={activeZone === 'cat4' ? '#66bb6a' : 'rgba(102,187,106,0.25)'}
                  stroke="#66bb6a" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat4' ? 'All' : 'cat4')}/>
                <text x="66" y="158" textAnchor="middle" fill={activeZone === 'cat4' ? '#fff' : '#66bb6a'} fontFamily="sans-serif" fontSize="6" fontWeight="700" pointerEvents="none">CAT 4</text>
                {/* Right / East side */}
                <rect x="346" y="58" width="60" height="36" rx="4"
                  fill={activeZone === 'cat4' ? '#66bb6a' : 'rgba(102,187,106,0.25)'}
                  stroke="#66bb6a" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat4' ? 'All' : 'cat4')}/>
                <rect x="346" y="100" width="78" height="30" rx="4"
                  fill={activeZone === 'cat4' ? '#66bb6a' : 'rgba(102,187,106,0.25)'}
                  stroke="#66bb6a" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat4' ? 'All' : 'cat4')}/>
                <rect x="424" y="135" width="22" height="42" rx="4"
                  fill={activeZone === 'cat4' ? '#66bb6a' : 'rgba(102,187,106,0.25)'}
                  stroke="#66bb6a" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat4' ? 'All' : 'cat4')}/>
                <rect x="346" y="180" width="78" height="30" rx="4"
                  fill={activeZone === 'cat4' ? '#66bb6a' : 'rgba(102,187,106,0.25)'}
                  stroke="#66bb6a" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat4' ? 'All' : 'cat4')}/>
                <rect x="346" y="215" width="60" height="36" rx="4"
                  fill={activeZone === 'cat4' ? '#66bb6a' : 'rgba(102,187,106,0.25)'}
                  stroke="#66bb6a" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat4' ? 'All' : 'cat4')}/>

                {/* ── CAT 5 — ORANGE restricted (corner ellipses) ── */}
                <ellipse cx="106" cy="40" rx="36" ry="18"
                  fill={activeZone === 'cat5' ? '#fb8c00' : 'rgba(251,140,0,0.3)'}
                  stroke="#fb8c00" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat5' ? 'All' : 'cat5')}/>
                <ellipse cx="106" cy="272" rx="36" ry="18"
                  fill={activeZone === 'cat5' ? '#fb8c00' : 'rgba(251,140,0,0.3)'}
                  stroke="#fb8c00" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat5' ? 'All' : 'cat5')}/>
                <ellipse cx="374" cy="40" rx="36" ry="18"
                  fill={activeZone === 'cat5' ? '#fb8c00' : 'rgba(251,140,0,0.3)'}
                  stroke="#fb8c00" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat5' ? 'All' : 'cat5')}/>
                <ellipse cx="374" cy="272" rx="36" ry="18"
                  fill={activeZone === 'cat5' ? '#fb8c00' : 'rgba(251,140,0,0.3)'}
                  stroke="#fb8c00" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat5' ? 'All' : 'cat5')}/>
                <text x="106" y="43" textAnchor="middle" fill={activeZone === 'cat5' ? '#fff' : '#fb8c00'} fontFamily="sans-serif" fontSize="6" fontWeight="700" pointerEvents="none">CAT 5</text>

                {/* ── CAT 6 — PURPLE restricted (far end ellipses) ── */}
                <ellipse cx="28" cy="130" rx="18" ry="24"
                  fill={activeZone === 'cat6' ? '#ab47bc' : 'rgba(171,71,188,0.3)'}
                  stroke="#ab47bc" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat6' ? 'All' : 'cat6')}/>
                <ellipse cx="28" cy="182" rx="18" ry="24"
                  fill={activeZone === 'cat6' ? '#ab47bc' : 'rgba(171,71,188,0.3)'}
                  stroke="#ab47bc" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat6' ? 'All' : 'cat6')}/>
                <ellipse cx="452" cy="130" rx="18" ry="24"
                  fill={activeZone === 'cat6' ? '#ab47bc' : 'rgba(171,71,188,0.3)'}
                  stroke="#ab47bc" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat6' ? 'All' : 'cat6')}/>
                <ellipse cx="452" cy="182" rx="18" ry="24"
                  fill={activeZone === 'cat6' ? '#ab47bc' : 'rgba(171,71,188,0.3)'}
                  stroke="#ab47bc" strokeWidth="1.2" cursor="pointer"
                  onClick={() => setActiveZone(activeZone === 'cat6' ? 'All' : 'cat6')}/>
                <text x="28" y="156" textAnchor="middle" fill={activeZone === 'cat6' ? '#fff' : '#ab47bc'} fontFamily="sans-serif" fontSize="5.5" fontWeight="700" pointerEvents="none" transform="rotate(-90,28,156)">CAT 6</text>
              </svg>
            </div>

            {/* Color Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center', marginTop: '12px' }}>
              {[
                { label: 'VIP STANDING', color: '#e040fb' },
                { label: 'VIP Seated', color: '#06b6d4' },
                { label: 'CAT 1', color: '#fdd835' },
                { label: 'CAT 2', color: '#42a5f5' },
                { label: 'CAT 3', color: '#ef5350' },
                { label: 'CAT 4', color: '#66bb6a' },
                { label: 'CAT 5', color: '#ff9800' },
                { label: 'CAT 6', color: '#ab47bc' }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#333' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>

            {/* Zone Filter Chips */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '14px 0 4px', scrollbarWidth: 'none' }}>
              {(event?.venueLayout === 'concert-oval' 
                ? ['All', 'vip_standing', 'vip_seated', 'cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6'] 
                : ['All', 'VIP', 'Floor', 'Level 100', 'Level 200']
              ).map(zone => {
                let label = zone;
                if (zone === 'vip_standing') label = 'VIP STANDING';
                else if (zone === 'vip_seated') label = 'VIP Seated';
                else if (zone.startsWith('cat')) label = zone.replace('cat', 'CAT ');
                
                return (
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
                    {label}
                  </button>
                );
              })}
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
              <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', fontWeight: 700, color: '#555', fontSize: '13px', textAlign: 'right' }}>{row.id}</div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {row.seats.map(seat => {
                    const seatId = `${selectedSection.ticketName}-${row.id}-${seat}`;
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
                        title={`Row ${row.id}, Seat ${seat}`}
                        onClick={() => toggleSeat(row.id, seat)}
                        disabled={isBooked}
                        style={{
                          width: '40px', height: '40px', borderRadius: '8px',
                          backgroundColor: bgColor, border: `1.5px solid ${borderColor}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: isBooked ? 'not-allowed' : 'pointer', transition: 'all 0.1s',
                          padding: 0, flexShrink: 0
                        }}
                      >
                        {isSelected 
                          ? <Check size={16} color="white" /> 
                          : <span style={{ fontSize: '11px', color: isBooked ? '#bbb' : '#333', fontWeight: 700, lineHeight: 1 }}>{row.id}{seat}</span>
                        }
                      </button>
                    );
                  })}
                </div>
                
                <div style={{ width: '28px', fontWeight: 700, color: '#555', fontSize: '13px', textAlign: 'left' }}>{row.id}</div>
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
              opacity: (!selectedSection || checkoutLoading) ? 0.7 : 1, 
              cursor: (!selectedSection || checkoutLoading) ? 'not-allowed' : 'pointer',
              backgroundColor: '#026cdf', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px',
              transition: 'opacity 0.2s'
            }} 
            onClick={handleCheckout}
            disabled={!selectedSection || (!selectedSection.isGA && selectedSpecificSeats.length === 0) || checkoutLoading}
          >
            {checkoutLoading ? 'Booking...' : 'Checkout'}
          </button>
        </div>
      </div>

      {/* Limit Exceeded / Upgrade Modal */}
      {showLimitModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '36px 28px', width: '100%', maxWidth: '380px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔒</div>
            <h3 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 900, color: '#111' }}>Booking Limit Reached</h3>
            <p style={{ margin: '0 0 28px', color: '#666', fontSize: '14px', lineHeight: 1.6 }}>
              {limitMessage}
            </p>
            <p style={{ margin: '0 0 24px', color: '#026cdf', fontWeight: 700, fontSize: '14px' }}>
              Upgrade your plan to book more tickets this month.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/pricing')}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#026cdf', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(2,108,223,0.3)' }}
              >
                View Packages & Upgrade ✨ </button>
              <button
                onClick={() => setShowLimitModal(false)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e0e0e0', backgroundColor: 'white', color: '#666', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

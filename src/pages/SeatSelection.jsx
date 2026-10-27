import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Check, Plus, Minus, Smartphone, X, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { STADIUM_LAYOUTS, getLayoutById, generateSectionsForLayout } from '../utils/stadiumLayouts';
import VenueSeatMap from '../components/VenueSeatMap';

export default function SeatSelection() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [currentEvent, setCurrentEvent] = useState(location.state?.event || null);
  const event = currentEvent;
  const eventTitle = event?.title || 'Selected Event';
  const currency = event?.currency || '$';
  
  const [currentUserRole, setCurrentUserRole] = useState('user');
  const [userSubscription, setUserSubscription] = useState('Free');
  const [existingEventTickets, setExistingEventTickets] = useState(0); // user's existing tickets for THIS event
  const [lifetimeTickets, setLifetimeTickets] = useState(0); // user's total tickets ever purchased (lifetime)
  const isSuperAdmin = currentUserRole === 'superadmin';

  // Extra ticket M-Pesa STK push payment state
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState('idle'); // 'idle' | 'sending' | 'waiting' | 'confirmed'
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [createdTicketId, setCreatedTicketId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d && d.role) setCurrentUserRole(d.role);
        if (d && d.subscription) setUserSubscription(d.subscription);
        if (d && d.phoneNumber) setMpesaPhone(d.phoneNumber);
      })
      .catch(() => {});
  }, []);

  // Free tier: strictly 2 tickets lifetime across all events
  const FREE_LIFETIME_LIMIT = 2;
  // Paid plans: 2 tickets per event included; KES 50 surcharge per extra ticket beyond 2
  const EXTRA_TICKET_FEE = 50; // KES
  const EVENT_TICKET_ALLOWANCE = 2; // free tickets per event before surcharge
  const isPaidPlan = isSuperAdmin || userSubscription !== 'Free';

  const [selectedSection, setSelectedSection] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSpecificSeats, setSelectedSpecificSeats] = useState([]);
  const [viewMode, setViewMode] = useState('sections');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Limit modal state
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [limitType, setLimitType] = useState('daily_event_limit');

  const basePrice = event?.basePrice || 80;

  const generateSections = (base) => {
    const layoutKey = event?.venueLayout || 'indoor-runway';
    if (STADIUM_LAYOUTS[layoutKey]) {
      return generateSectionsForLayout(layoutKey, base, event?.seatConfig);
    }
    return generateSectionsForLayout('indoor-runway', base, event?.seatConfig);
  };

  const sections = generateSections(basePrice);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState('All');

  const filteredSections = sections.filter(sec => {
    if (searchQuery && !sec.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeZone === 'All') return true;
    
    return sec.id === activeZone || sec.id.startsWith(activeZone) || activeZone.startsWith(sec.id);
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

    if (!currentEvent && id && id !== 'trending') {
      fetch(`${API}/api/events`)
        .then(r => r.json())
        .then(events => {
          if (Array.isArray(events)) {
            const found = events.find(e => e._id === id);
            if (found) setCurrentEvent(found);
          }
        })
        .catch(() => {});
    }
    
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

    // Fetch user's existing tickets for THIS event and LIFETIME total
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API}/api/tickets/my-tickets`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(myTickets => {
          if (Array.isArray(myTickets)) {
            let eventCount = 0;
            let totalLifetime = 0;
            myTickets.forEach(t => {
              if (t.status === 'Cancelled' || t.status === 'Rejected') return;
              const seatCount = t.seats ? t.seats.length : 1;
              totalLifetime += seatCount;
              const matchById = id && id !== 'trending' && t.eventId === String(id);
              const matchByTitle = event?.title && t.eventTitle?.toLowerCase().trim() === event.title.toLowerCase().trim();
              if (matchById || matchByTitle) {
                eventCount += seatCount;
              }
            });
            setExistingEventTickets(eventCount);
            setLifetimeTickets(totalLifetime);
          }
        })
        .catch(() => {});
    }
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
        // For Free users: hard cap at 2 tickets lifetime across all events
        if (!isSuperAdmin && !isPaidPlan && (lifetimeTickets + prev.length) >= FREE_LIFETIME_LIMIT) {
          toast.warning(`Free plan limit: Maximum ${FREE_LIFETIME_LIMIT} tickets allowed lifetime. Upgrade to VIP to book more.`);
          return prev;
        }
        return [...prev, { id: seatId, row: rowId, num: seatNum }];
      }
    });
  };

  const numTickets = selectedSection
    ? (selectedSection.isGA ? quantity : selectedSpecificSeats.length)
    : 0;

  const baseTicketTotal = selectedSection
    ? (selectedSection.isGA ? selectedSection.price * quantity : selectedSection.price * selectedSpecificSeats.length)
    : 0;

  // Per-event surcharge: (existing tickets for this event + tickets in this order) - EVENT_TICKET_ALLOWANCE
  const totalEventTickets = existingEventTickets + numTickets;
  const extraTickets = (!isSuperAdmin && isPaidPlan) ? Math.max(0, totalEventTickets - EVENT_TICKET_ALLOWANCE) : 0;
  const surchargeFee = extraTickets * EXTRA_TICKET_FEE;
  const totalPrice = baseTicketTotal + surchargeFee;

  const handleCheckout = async () => {
    if (!selectedSection) return;
    if (!selectedSection.isGA && selectedSpecificSeats.length === 0) return;
    if (checkoutLoading) return;

    // Free users: hard block at 2 tickets lifetime
    if (!isSuperAdmin && !isPaidPlan) {
      const numRequested = selectedSection.isGA ? quantity : selectedSpecificSeats.length;
      if (lifetimeTickets + numRequested > FREE_LIFETIME_LIMIT) {
        toast.warning(`Free plan limit: You have already booked ${lifetimeTickets} of your ${FREE_LIFETIME_LIMIT} lifetime tickets. Upgrade to VIP to book more.`);
        return;
      }
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in to book tickets!');
      navigate('/signin');
      return;
    }

    // For paid plans with extra tickets beyond 2: require STK Push payment before approval (Super Admin bypassed)
    if (!isSuperAdmin && isPaidPlan && surchargeFee > 0) {
      setMpesaStatus('idle');
      setMpesaMessage('');
      setShowMpesaModal(true);
      return;
    }

    // Generate seat IDs (using unique sequential ticket numbers for General Admission)
    const gaBaseNumber = Math.floor(Date.now() % 90000) + 10000;
    const seats = selectedSection.isGA 
      ? Array.from({ length: quantity }, (_, i) => `Section: ${selectedSection.ticketName}, Ticket Number: ${gaBaseNumber + i} (General Admission)`)
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
          currency,
          extraTickets,
          surchargeFee
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.limitExceeded) {
          setLimitMessage(errData.error);
          setLimitType(errData.limitType || 'daily_event_limit');
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
  
  const handleMpesaSTKCheckout = async () => {
    const cleanPhone = mpesaPhone.trim().replace(/[\s+-]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      toast.error('Please enter a valid M-Pesa phone number (e.g. 0712345678)');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in to complete payment');
      navigate('/signin');
      return;
    }

    const gaBaseNumber = Math.floor(Date.now() % 90000) + 10000;
    const seats = selectedSection.isGA 
      ? Array.from({ length: quantity }, (_, i) => `Section: ${selectedSection.ticketName}, Ticket Number: ${gaBaseNumber + i} (General Admission)`)
      : selectedSpecificSeats.map(s => `Section: ${selectedSection.ticketName}, Row: ${s.row}, Seat Number: ${s.num}`);

    setMpesaLoading(true);
    setMpesaStatus('sending');
    setMpesaMessage('Initiating M-Pesa STK Push...');

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
          currency,
          extraTickets,
          surchargeFee,
          phoneNumber: cleanPhone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate booking');
      }

      setCreatedTicketId(data._id);
      setMpesaStatus('waiting');
      setMpesaMessage(`STK Push sent to ${cleanPhone}. Please check your phone and enter your M-Pesa PIN for KES ${surchargeFee}.`);

      // Poll for ticket approval status every 2 seconds
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API}/api/tickets/${data._id}/payment-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const statusData = await statusRes.json();
          if (statusData && (statusData.status === 'Approved' || statusData.paymentStatus === 'Paid')) {
            clearInterval(pollInterval);
            setMpesaStatus('confirmed');
            setMpesaMessage('Payment confirmed! Your extra tickets have been approved.');
            toast.success('M-Pesa payment confirmed! Tickets approved.');
            setTimeout(() => {
              navigate('/mytickets');
            }, 1800);
          }
        } catch (_) {}
      }, 2000);

      // Safety timeout after 60s
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 60000);

    } catch (err) {
      setMpesaStatus('idle');
      setMpesaLoading(false);
      toast.error(err.message || 'Payment initiation failed');
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
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px', textAlign: 'center', color: '#111' }}>
              Interactive Stadium Map
            </h3>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: '540px', margin: '0 auto' }}>
              <VenueSeatMap
                layout={event?.venueLayout || 'indoor-runway'}
                basePrice={basePrice}
                currency={currency}
                seatConfig={event?.seatConfig}
                activeZone={activeZone}
                onZoneClick={setActiveZone}
                interactive={true}
                showLegend={true}
              />
            </div>

            {/* Zone Filter Chips */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '14px 0 4px', scrollbarWidth: 'none' }}>
              {['All', ...(getLayoutById(event?.venueLayout || 'indoor-runway').categories || []).map(c => c.id)].map(zone => {
                const layoutCats = getLayoutById(event?.venueLayout || 'indoor-runway').categories || [];
                const catObj = layoutCats.find(c => c.id === zone);
                const label = zone === 'All' ? 'All Sections' : (catObj ? catObj.name : zone);
                
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
                onClick={() => {
                  if (!isSuperAdmin && !isPaidPlan && (lifetimeTickets + quantity + 1) > FREE_LIFETIME_LIMIT) {
                    toast.warning(`Free plan limit: Maximum ${FREE_LIFETIME_LIMIT} tickets allowed lifetime. Upgrade to VIP to book more.`);
                    return;
                  }
                  setQuantity(Math.min(10, quantity + 1));
                }}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Plus size={16} color="#333" />
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, marginRight: '16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {selectedSection 
                ? (selectedSection.isGA 
                    ? `${quantity} x ${selectedSection.ticketName}` 
                    : selectedSpecificSeats.length > 0 
                      ? selectedSpecificSeats.map(s => `Sec: ${selectedSection.ticketName.replace('Section ', '')}, Row: ${s.row}, Seat: ${s.num}`).join(' • ')
                      : `${selectedSection.ticketName} (Select seats)`) 
                : 'Select a section'}
            </div>

            {/* Surcharge notice for paid plans with >2 tickets for this event */}
            {surchargeFee > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginTop: '4px', padding: '4px 10px',
                backgroundColor: '#fff8e1', borderRadius: '8px',
                border: '1px solid #ffe082'
              }}>
                <span style={{ fontSize: '13px' }}>⚠️</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#b45309' }}>
                  +KES {surchargeFee} surcharge ({extraTickets} extra ticket{extraTickets !== 1 ? 's' : ''} for this event × KES {EXTRA_TICKET_FEE})
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              {surchargeFee > 0 && (
                <span style={{ fontSize: '14px', color: '#888', textDecoration: 'line-through' }}>
                  {currency}{baseTicketTotal}
                </span>
              )}
              <div style={{ fontSize: '24px', fontWeight: 800 }}>
                {currency}{baseTicketTotal}
                {surchargeFee > 0 && (
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#b45309', marginLeft: '4px' }}>
                    + KES {surchargeFee}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            className="btn-primary" 
            style={{ 
              width: 'auto', padding: '14px 32px', margin: 0, 
              opacity: (!selectedSection || checkoutLoading) ? 0.7 : 1, 
              cursor: (!selectedSection || checkoutLoading) ? 'not-allowed' : 'pointer',
              backgroundColor: '#026cdf', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px',
              transition: 'opacity 0.2s',
              flexShrink: 0
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

      {/* M-Pesa STK Push Payment Modal for Extra Tickets */}
      {showMpesaModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', padding: '32px 24px',
            width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Close button if not currently sending / waiting */}
            {mpesaStatus !== 'sending' && mpesaStatus !== 'waiting' && (
              <button
                onClick={() => { setShowMpesaModal(false); setMpesaStatus('idle'); }}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#888', padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            )}

            {/* Header with M-Pesa Branding */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', backgroundColor: '#e8f5e9',
                borderRadius: '20px', color: '#00843d', fontWeight: 800,
                fontSize: '12px', letterSpacing: '0.5px', marginBottom: '12px'
              }}>
                <Smartphone size={16} /> M-PESA EXPRESS (STK PUSH)
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 900, color: '#111' }}>
                Payment for Extra Tickets
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
                Your VIP plan includes 2 tickets for this event. Extra tickets require payment via STK Push before approval.
              </p>
            </div>

            {/* Surcharge Breakdown Card */}
            <div style={{
              backgroundColor: '#f8fafc', borderRadius: '16px', padding: '16px',
              border: '1px solid #e2e8f0', marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Event:</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{eventTitle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Tickets in order:</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{numTickets} ticket(s)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Extra tickets:</span>
                <span style={{ fontWeight: 700, color: '#b45309' }}>{extraTickets} × KES {EXTRA_TICKET_FEE}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '10px', borderTop: '1px dashed #cbd5e1', marginTop: '6px'
              }}>
                <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>Amount via STK Push:</span>
                <span style={{ fontWeight: 900, fontSize: '20px', color: '#00843d' }}>KES {surchargeFee}</span>
              </div>
            </div>

            {/* Form State */}
            {mpesaStatus === 'idle' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase' }}>
                  M-Pesa Mobile Number
                </label>
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <input
                    type="tel"
                    placeholder="e.g. 0712345678 or 254..."
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: '12px',
                      border: '1.5px solid #cbd5e1', fontSize: '16px', fontWeight: 600,
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  onClick={handleMpesaSTKCheckout}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                    backgroundColor: '#00843d', color: 'white', fontSize: '16px', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 4px 16px rgba(0,132,61,0.3)', transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#007033'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#00843d'}
                >
                  <Smartphone size={18} /> Pay KES {surchargeFee} via M-Pesa
                </button>
              </div>
            )}

            {mpesaStatus === 'sending' && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: '40px', height: '40px', border: '4px solid #e2e8f0',
                  borderTopColor: '#00843d', borderRadius: '50%', margin: '0 auto 16px',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Sending STK Push...
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  Connecting with Safaricom M-Pesa gateway...
                </div>
              </div>
            )}

            {mpesaStatus === 'waiting' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 16px',
                  boxShadow: '0 0 0 10px rgba(0, 132, 61, 0.1)'
                }}>
                  <Smartphone size={32} color="#00843d" />
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                  Check your phone!
                </div>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  {mpesaMessage}
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f1f5f9', borderRadius: '20px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  <span style={{ fontSize: '13px' }}>⏳</span>
                  Awaiting M-Pesa PIN confirmation...
                </div>
              </div>
            )}

            {mpesaStatus === 'confirmed' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  backgroundColor: '#00843d', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 16px'
                }}>
                  <Check size={36} color="white" />
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>
                  Payment Confirmed!
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#00843d', fontWeight: 700 }}>
                  All {numTickets} ticket(s) have been APPROVED!
                </p>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Redirecting to My Tickets...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

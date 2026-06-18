import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Info, Check } from 'lucide-react';

export default function SeatSelection() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Mock stage and seat rows
  const rows = [
    { id: 'A', price: 150, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 'B', price: 150, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 'C', price: 120, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { id: 'D', price: 120, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { id: 'E', price: 85, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
    { id: 'F', price: 85, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
    { id: 'G', price: 50, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
  ];

  // Randomly pre-book some seats for realism
  const [bookedSeats] = useState(new Set([
    'A-3', 'A-4', 'B-7', 'C-1', 'C-2', 'E-10', 'F-5', 'F-6', 'G-12'
  ]));

  const toggleSeat = (rowId, seatNum, price) => {
    const seatId = `${rowId}-${seatNum}`;
    if (bookedSeats.has(seatId)) return;

    setSelectedSeats(prev => {
      const existing = prev.find(s => s.id === seatId);
      if (existing) {
        return prev.filter(s => s.id !== seatId);
      } else {
        return [...prev, { id: seatId, row: rowId, num: seatNum, price }];
      }
    });
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to book tickets!');
      navigate('/signin');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/tickets/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: id || 'trending',
          eventTitle: 'Selected Event',
          seats: selectedSeats,
          totalPrice
        })
      });

      if (!res.ok) throw new Error('Failed to book tickets');
      
      alert(`Successfully booked ${selectedSeats.length} seats for $${totalPrice}!`);
      navigate('/mytickets');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page seat-selection-page" style={{ paddingBottom: '100px', backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', cursor: 'pointer' }}
        >
          <ChevronLeft size={24} color="#333" />
        </button>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Select Seats</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Section 102 • General Admission</p>
        </div>
      </div>

      {/* Stage Area */}
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ 
          width: '80%', height: '40px', margin: '0 auto 40px', 
          backgroundColor: '#e0e0e0', borderRadius: '8px 8px 50% 50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#666', fontWeight: 600, fontSize: '14px', letterSpacing: '2px'
        }}>
          STAGE
        </div>

        {/* Seats Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', overflowX: 'auto', padding: '0 16px' }}>
          {rows.map(row => (
            <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '14px' }}>{row.id}</div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {row.seats.map(seat => {
                  const seatId = `${row.id}-${seat}`;
                  const isBooked = bookedSeats.has(seatId);
                  const isSelected = selectedSeats.some(s => s.id === seatId);
                  
                  let bgColor = '#fff';
                  let borderColor = '#ccc';
                  let color = 'transparent';

                  if (isBooked) {
                    bgColor = '#e0e0e0';
                    borderColor = '#e0e0e0';
                  } else if (isSelected) {
                    bgColor = 'var(--primary-color)';
                    borderColor = 'var(--primary-color)';
                    color = '#fff';
                  }

                  return (
                    <button
                      key={seat}
                      onClick={() => toggleSeat(row.id, seat, row.price)}
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
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '16px', borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}></div>
          <span style={{ fontSize: '13px', color: '#666' }}>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'var(--primary-color)' }}></div>
          <span style={{ fontSize: '13px', color: '#666' }}>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#e0e0e0' }}></div>
          <span style={{ fontSize: '13px', color: '#666' }}>Taken</span>
        </div>
      </div>

      {/* Checkout Footer */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px', 
        backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
      }}>
        <div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>${totalPrice}</div>
        </div>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '14px 32px', margin: 0, opacity: selectedSeats.length === 0 ? 0.5 : 1, cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer' }} 
          onClick={handleCheckout}
          disabled={selectedSeats.length === 0}
        >
          Checkout
        </button>
      </div>

    </div>
  );
}

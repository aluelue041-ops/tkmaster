import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Ticket as TicketIcon, ArrowUpRight, RefreshCw, MapPin, X, Download, Smartphone, MoreVertical, ScanBarcode, Navigation } from 'lucide-react';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

const CustomBarcodeIcon = ({ size = 24, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="8" x2="7" y2="16" />
    <line x1="9" y1="8" x2="9" y2="16" />
    <line x1="11" y1="8" x2="11" y2="16" />
    <line x1="13" y1="8" x2="13" y2="16" />
    <line x1="15" y1="8" x2="15" y2="16" />
    <line x1="17" y1="8" x2="17" y2="16" />
  </svg>
);

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

  let sectionName = secMatch ? secMatch[1].trim() : '-';
  if (sectionName.includes('-') && !sectionName.toLowerCase().includes('vip')) {
    sectionName = sectionName.split('-').pop().trim();
  }
  
  if (sectionName.toLowerCase().startsWith('section ')) {
    sectionName = sectionName.replace(/section\s+/i, '').trim();
  }

  return {
    section: sectionName,
    row: rowMatch ? rowMatch[1].trim() : '-',
    seat: seatMatch ? seatMatch[1] : '-',
    type: 'Full Price Ticket'
  };
}

export function generateOrderStr(ticketId, location, orderNumber) {
  if (!ticketId) return '#00-000000VEN';
  let idStr = String(ticketId);
  const orderNum = orderNumber ? orderNumber : (parseInt(idStr.slice(-4), 16) || Math.floor(Math.random() * 9999));
  
  let dateObj = new Date();
  if (idStr.length === 24) {
    const timestamp = parseInt(idStr.slice(0, 8), 16);
    if (!isNaN(timestamp)) {
      dateObj = new Date(timestamp * 1000);
    }
  }
  
  const yy = String(dateObj.getFullYear()).slice(-2);
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${yy}${mm}${dd}`;

  let venueStr = "XXX";
  if (location) {
    const letters = location.replace(/[^A-Za-z]/g, '');
    if (letters.length >= 3) venueStr = letters.substring(0, 3).toUpperCase();
  }
  
  return `#${orderNum}-${dateStr}${venueStr}`;
}

// Custom Transfer Modal — no browser prompt
function TransferModal({ ticketId, seatString, eventTitle, allSeats, onConfirm, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);

  const maxQuantity = allSeats ? allSeats.length : 1;

  const handleSubmit = async () => {
    if (!name || !email || !phone) return;
    setSending(true);
    const success = await onConfirm(name, email, phone, quantity, note);
    setSending(false);
    if (success) {
      setTransferComplete(true);
    }
  };

  if (transferComplete) {
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px'
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '24px', padding: '32px 24px', textAlign: 'center',
          width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: 'white', fontSize: '28px' }}>✓</span>
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800 }}>Transfer Complete</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
            {quantity} ticket(s) securely transferred to <strong>{name}</strong>.
          </p>
          
          <div style={{ padding: '16px', backgroundColor: '#f8f8f8', borderRadius: '16px', marginBottom: '24px', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <QRCodeSVG value={`TICKET:${ticketId}`} size={180} />
            </div>
            <p style={{ fontSize: '11px', color: '#888', marginTop: '12px', fontWeight: 600 }}>SCAN TO VERIFY TRANSFER</p>
          </div>

          <button
            onClick={onCancel}
            style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: '12px',
              backgroundColor: '#026cdf', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const isFormValid = name.trim() && email.trim() && phone.trim();

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '24px', padding: '32px 24px',
        width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Transfer Ticket</h3>
          <button onClick={onCancel} style={{ background: '#f0f0f0', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color="#333" />
          </button>
        </div>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
          Please enter the details of the person receiving this ticket.
        </p>

        {/* Ticket summary */}
        {(() => {
          const p = parseSeat(seatString);
          return (
            <div style={{
              backgroundColor: '#f0f6ff', border: '1px solid #c8def5', borderRadius: '12px',
              padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{ fontSize: '28px' }}>🎟️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#111', marginBottom: '2px' }}>
                  {eventTitle || 'Event Ticket'}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  Section <strong>{p.section}</strong> &nbsp;·&nbsp; Row <strong>{p.row}</strong> &nbsp;·&nbsp; Seat <strong>{p.seat}</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#026cdf', fontWeight: 600, marginTop: '4px' }}>{quantity} ticket(s) selected</div>
              </div>
            </div>
          );
        })()}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {maxQuantity > 1 && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '6px', textTransform: 'uppercase' }}>Number of Tickets</label>
                <select
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.5px solid #ddd', fontSize: '15px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                >
                  {Array.from({ length: maxQuantity }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
            <input
              type="text"
              autoFocus
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.5px solid #ddd', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.5px solid #ddd', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '6px', textTransform: 'uppercase' }}>Phone Number</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.5px solid #ddd', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '6px', textTransform: 'uppercase' }}>Optional Note</label>
            <textarea
              placeholder="Enjoy the show!"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows="2"
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.5px solid #ddd', fontSize: '15px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid || sending}
          style={{
            width: '100%', padding: '16px', border: 'none', borderRadius: '12px',
            backgroundColor: isFormValid ? '#026cdf' : '#e0e0e0',
            color: isFormValid ? 'white' : '#999', fontSize: '16px', fontWeight: 700, cursor: isFormValid ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }}
        >
          {sending ? 'Processing...' : 'Transfer Ticket'}
        </button>
      </div>
    </div>
  );
}

// Custom Sell Modal
function SellModal({ ticketId, seatString, eventTitle, allSeats, onConfirm, onCancel }) {
  const [quantity, setQuantity] = useState(1);
  const [resalePrice, setResalePrice] = useState('');
  const [sending, setSending] = useState(false);
  const [sellComplete, setSellComplete] = useState(false);

  const maxQuantity = allSeats ? allSeats.length : 1;

  const handleSubmit = async () => {
    if (!resalePrice) return;
    setSending(true);
    const success = await onConfirm(quantity, Number(resalePrice));
    setSending(false);
    if (success) {
      setSellComplete(true);
    }
  };

  if (sellComplete) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: 'white', fontSize: '28px' }}>✓</span>
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800 }}>Listed for Sale</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
            {quantity} ticket(s) listed on the marketplace for <strong>${resalePrice}</strong> each.
          </p>
          <button onClick={onCancel} style={{ width: '100%', padding: '16px', border: 'none', borderRadius: '12px', backgroundColor: '#026cdf', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px 24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Sell Ticket</h3>
          <button onClick={onCancel} style={{ background: '#f0f0f0', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color="#333" />
          </button>
        </div>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>List your ticket on the marketplace.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {maxQuantity > 1 && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '6px', textTransform: 'uppercase' }}>Number of Tickets</label>
              <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1.5px solid #ddd', fontSize: '15px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}>
                {Array.from({ length: maxQuantity }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '6px', textTransform: 'uppercase' }}>Asking Price (per ticket)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '14px', fontSize: '15px', color: '#555', fontWeight: 600 }}>$</span>
              <input type="number" placeholder="0.00" value={resalePrice} onChange={e => setResalePrice(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 32px', borderRadius: '10px', border: '1.5px solid #ddd', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!resalePrice || sending} style={{ width: '100%', padding: '16px', border: 'none', borderRadius: '12px', backgroundColor: resalePrice ? '#026cdf' : '#e0e0e0', color: resalePrice ? 'white' : '#999', fontSize: '16px', fontWeight: 700, cursor: resalePrice ? 'pointer' : 'not-allowed' }}>
          {sending ? 'Processing...' : 'List for Sale'}
        </button>
      </div>
    </div>
  );
}

function TicketStub({ seatString, ticketId, orderNumber, onTransfer, onSell, eventImage, eventTitle, currency, totalPrice, status, allSeats, ticketType }) {
  const [showActions, setShowActions] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const parsed = parseSeat(seatString);

  const downloadPDF = async () => {
    // A5 landscape: 210mm x 148mm — plenty of room
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
    const W = 210;
    const H = 148;

    // Blue header bar
    doc.setFillColor(2, 108, 223);
    doc.rect(0, 0, W, 28, 'F');

    // Ticketmaster branding
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Ticketmaster', 14, 19);

    // Status badge in header
    const statusLabel = (status || 'Active').toUpperCase();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(W - 46, 10, 32, 10, 3, 3, 'F');
    doc.setTextColor(2, 108, 223);
    doc.text(statusLabel, W - 30, 16.5, { align: 'center' });

    // Event title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    const title = (eventTitle || 'Event').toUpperCase();
    doc.text(title, 14, 42, { maxWidth: 120 });

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(14, 50, W - 14, 50);

    // Three columns: SECTION | ROW | SEAT
    const cols = [
      { label: 'SECTION', value: parsed.section, x: 14 },
      { label: 'ROW',     value: String(parsed.row),  x: 80 },
      { label: 'SEAT',    value: String(parsed.seat),  x: 130 },
    ];

    cols.forEach(col => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text(col.label, col.x, 60);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text(col.value, col.x, 76);
    });

    // Second divider
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 84, W - 14, 84);

    // Price & Booking ID row
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text('TOTAL PAID', 14, 93);
    doc.text('ORDER #', 80, 93);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(2, 108, 223);
    doc.text(`${currency || '$'}${totalPrice || ''}`, 14, 102);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(String(orderNumber || ticketId), 80, 102, { maxWidth: 80 });

    // QR code box on the right
    const rawQrData = `TICKET:${ticketId}`;
    const qrDataUrl = await QRCode.toDataURL(rawQrData, { width: 200, margin: 1 });
    doc.addImage(qrDataUrl, 'PNG', W - 52, 32, 38, 38);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(160, 160, 160);
    doc.text('SCAN TO VERIFY', W - 33, 73, { align: 'center' });

    // Footer
    doc.setFillColor(248, 248, 248);
    doc.rect(0, H - 16, W, 16, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text('© 2026 Ticketmaster — Present this ticket at the entrance', W / 2, H - 6, { align: 'center' });

    doc.save(`ticket-${parsed.section || 'ticket'}.pdf`);
  };

  return (
    <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      {/* Ticket type header */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px 16px', fontWeight: 700, fontSize: '13px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {ticketType || parsed.type}
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
              padding: '14px 20px', cursor: 'pointer', flex: 1, maxWidth: '120px'
            }}
          >
            <ArrowUpRight size={22} color="#333" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>Transfer</span>
          </button>
          {showTransferModal && (
            <TransferModal
              ticketId={ticketId}
              seatString={seatString}
              eventTitle={eventTitle}
              allSeats={allSeats}
              onConfirm={async (name, email, phone, quantity, note) => { 
                return await onTransfer(ticketId, email, name, phone, quantity, note, seatString); 
              }}
              onCancel={() => setShowTransferModal(false)}
            />
          )}

          <button
            onClick={downloadPDF}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px',
              padding: '14px 20px', cursor: 'pointer', flex: 1, maxWidth: '120px'
            }}
          >
            <Download size={22} color="#026cdf" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#026cdf' }}>Save PDF</span>
          </button>

          <button
            onClick={() => {
              toast.success('Ticket added to Wallet!');
              setShowActions(false);
            }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              backgroundColor: 'black', border: 'none', borderRadius: '12px',
              padding: '14px 20px', cursor: 'pointer', flex: 1, maxWidth: '120px'
            }}
          >
            <Smartphone size={22} color="white" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>Wallet</span>
          </button>

          <button
            onClick={() => { setShowSellModal(true); setShowActions(false); }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px',
              padding: '14px 20px', cursor: 'pointer', flex: 1, maxWidth: '120px'
            }}
          >
            <RefreshCw size={22} color="#333" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>Sell</span>
          </button>
          {showSellModal && (
            <SellModal
              ticketId={ticketId}
              seatString={seatString}
              eventTitle={eventTitle}
              allSeats={allSeats}
              onConfirm={async (quantity, resalePrice) => {
                return await onSell(ticketId, quantity, resalePrice, seatString);
              }}
              onCancel={() => setShowSellModal(false)}
            />
          )}
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

  const fallbackEvents = [
    {
      title: "Benson Boone",
      date: "Fri, Sep 19 • 7:00 PM",
      location: "Madison Square Garden • New York, NY",
      image: "/images/benson_boone.png",
      category: "Concerts"
    },
    {
      title: "The Weeknd: After Hours Tour",
      date: "Sat, Oct 12 • 8:00 PM",
      location: "MetLife Stadium • East Rutherford, NJ",
      image: "/images/weeknd.png",
      category: "Concerts"
    },
    {
      title: "New York Knicks vs. Boston Celtics",
      date: "Wed, Nov 5 • 7:30 PM",
      location: "Madison Square Garden • New York, NY",
      image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Sports"
    },
    {
      title: "Summer Music Festival",
      date: "Sat, Oct 12 • 8:00 PM",
      location: "Various Artists • City Park",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Concerts"
    }
  ];

  const getEventImage = (eventTitle) => {
    const safeTitle = eventTitle ? eventTitle.toLowerCase() : '';
    const match = events.find(e => e.title?.toLowerCase() === safeTitle) || fallbackEvents.find(e => e.title?.toLowerCase() === safeTitle);
    return match?.image || null;
  };

  const getEventMeta = (eventTitle) => {
    const safeTitle = eventTitle ? eventTitle.toLowerCase() : '';
    return events.find(e => e.title?.toLowerCase() === safeTitle) || fallbackEvents.find(e => e.title?.toLowerCase() === safeTitle) || null;
  };

  const handleTransfer = async (ticketId, newEmail, name, phone, quantity, note, selectedSeat) => {
    if (!newEmail) return false;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/tickets/${ticketId}/transfer-to`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newEmail, name, phone, quantity, note, selectedSeat })
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(prev => prev.filter(t => t._id !== ticketId));
        return true;
      } else {
        toast.error(`❌ ${data.error}`);
        return false;
      }
    } catch (err) {
      toast.error('Transfer failed. Please try again.');
      return false;
    }
  };

  const handleSell = async (ticketId, quantity, resalePrice, selectedSeat) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/tickets/${ticketId}/sell`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantity, resalePrice, selectedSeat })
      });
      if (res.ok) {
        // Refresh tickets
        fetch(`${API}/api/tickets/my-tickets`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.json())
          .then(setTickets);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Detailed ticket order view
  if (selectedOrder) {
    const eventMeta = getEventMeta(selectedOrder.eventTitle);
    const image = eventMeta?.image;

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f8f8' }}>
        {/* Banner Container */}
        <div style={{ position: 'relative', minHeight: '380px' }}>
          {/* Background Image */}
          {image
            ? <img src={image} alt={selectedOrder.eventTitle} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, #026cdf, #004aad)' }} />
          }
          
          {/* Back button */}
          <button
            onClick={() => setSelectedOrder(null)}
            style={{ position: 'absolute', top: '24px', left: '16px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            <ChevronLeft size={24} color="white" />
          </button>
          <button style={{ position: 'absolute', top: '24px', right: '16px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '24px', padding: '8px 20px', border: 'none', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', zIndex: 10 }}>Help</button>

          {/* Floating Event Info Card */}
          <div style={{ position: 'absolute', bottom: '0', left: '20px', right: '20px', zIndex: 10 }}>
            {/* Date Tab */}
            <div style={{ display: 'inline-block', backgroundColor: '#282828', padding: '12px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {eventMeta?.date || 'Upcoming Event'}
            </div>
            
            {/* Event Info (Dark section) */}
            <div style={{ backgroundColor: '#282828', padding: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 16px', textTransform: 'uppercase', lineHeight: 1.2, color: 'white' }}>{selectedOrder.eventTitle}</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#fff', fontSize: '15px' }}>
                  {eventMeta?.location || 'Venue'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '18px', fontWeight: 800 }}>
                  <TicketIcon size={20} color="white" />
                  <span>x{selectedOrder.seats.length}</span>
                </div>
              </div>
            </div>

            {/* View Tickets button */}
            <button className="interactive-btn" style={{ width: '100%', backgroundColor: '#026cdf', color: 'white', border: 'none', margin: 0, padding: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxSizing: 'border-box' }}>
              <CustomBarcodeIcon size={24} color="white" />
              View Tickets
            </button>
          </div>
        </div>


        {/* White background section below */}
        <div style={{ backgroundColor: 'white' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
            {['Tickets', 'Extras'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '16px', border: 'none', background: 'none', cursor: 'pointer',
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

          {/* Order ID & Tickets List */}
          <div style={{ padding: '24px 16px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Order {generateOrderStr(selectedOrder._id, eventMeta?.location, selectedOrder.orderNumber)}</h3>
              <MoreVertical size={20} color="#333" />
            </div>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px' }}>x{selectedOrder.seats.length} Tickets</p>

          {activeTab === 'Tickets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                {['Approved', 'Active', 'Transferred'].includes(selectedOrder.status) ? (
                  selectedOrder.seats.map((seatStr, idx) => (
                    <TicketStub
                      key={idx}
                      seatString={seatStr}
                      ticketId={selectedOrder._id}
                      orderNumber={generateOrderStr(selectedOrder._id, eventMeta?.location, selectedOrder.orderNumber)}
                      onTransfer={handleTransfer}
                      onSell={handleSell}
                      eventImage={image}
                      eventTitle={selectedOrder.eventTitle}
                      currency={selectedOrder.currency}
                      totalPrice={selectedOrder.totalPrice}
                      status={selectedOrder.status}
                      allSeats={selectedOrder.seats}
                      ticketType={selectedOrder.ticketType}
                    />
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fff8e1', borderRadius: '12px', border: '1px solid #ffe082', marginTop: '16px' }}>
                    <p style={{ margin: 0, color: '#f57f17', fontWeight: 600, fontSize: '15px' }}>⏳ Pending Approval</p>
                    <p style={{ margin: '8px 0 0', color: '#666', fontSize: '13px', lineHeight: 1.5 }}>Your ticket order is currently being processed. The ticket contents and QR code will be available here once approved by the administrator.</p>
                  </div>
                )}
              </div>

              {/* Map & Directions */}
              <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>
                <iframe
                  width="100%"
                  height="180"
                  frameBorder="0"
                  style={{ border: 0, display: 'block' }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(eventMeta?.location || 'New York')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                  title="Event Location"
                ></iframe>
                <button 
                  className="interactive-btn"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventMeta?.location || 'New York')}`, '_blank')}
                  style={{ width: '100%', padding: '16px', border: 'none', backgroundColor: '#f0f0f0', color: '#111', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                >
                  <Navigation size={18} color="#111" />
                  Get Directions
                </button>
              </div>

              {/* Promotion Banner */}
              <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', backgroundColor: '#111', color: 'white', minHeight: '160px' }}>
                   {/* Left side: Image and details */}
                   <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                     {image ? (
                       <img src={image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                     ) : (
                       <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #026cdf, #004aad)', opacity: 0.4 }}></div>
                     )}
                     <div style={{ position: 'relative', zIndex: 1, padding: '20px 16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', boxSizing: 'border-box' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#ccc', marginBottom: '6px', letterSpacing: '0.5px' }}>{eventMeta?.date?.toUpperCase() || 'UPCOMING EVENT'}</div>
                        <div style={{ fontSize: '15px', fontWeight: 800, lineHeight: 1.3, marginBottom: '6px', textTransform: 'uppercase' }}>{selectedOrder.eventTitle}</div>
                        <div style={{ fontSize: '11px', color: '#aaa' }}>{eventMeta?.location || 'Venue'}</div>
                     </div>
                   </div>
                   {/* Right side: YOU GOT TICKETS! */}
                   <div style={{ flex: '0 0 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: '#1a1a1a', borderLeft: '1px solid #333' }}>
                     <div style={{ textAlign: 'center', letterSpacing: '0.5px' }}>
                       <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.4 }}>YOU GOT</div>
                       <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.4, borderBottom: '3px solid white', display: 'inline-block' }}>TICKETS!</div>
                     </div>
                   </div>
                </div>
                <div style={{ padding: '20px 16px', backgroundColor: '#f0f0f0' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800, color: '#111' }}>Post on Social Media</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: 1.5 }}>
                    Build hype for the event, and share that you got tickets with your friends and family
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'Extras' && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>No extras available for this order.</div>
          )}
          </div>
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
                      display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                      backgroundColor:
                        ticket.status === 'Active' ? '#e8f5e9' :
                        ticket.status === 'Approved' ? '#e8f5e9' :
                        ticket.status === 'Transferred' ? '#e3f2fd' :
                        ticket.status === 'Expired' ? '#f3f3f3' :
                        ticket.status === 'Rejected' ? '#fce4ec' : '#fff8e1',
                      color:
                        ticket.status === 'Active' ? '#2e7d32' :
                        ticket.status === 'Approved' ? '#2e7d32' :
                        ticket.status === 'Transferred' ? '#1565c0' :
                        ticket.status === 'Expired' ? '#9e9e9e' :
                        ticket.status === 'Rejected' ? '#c62828' : '#f57f17'
                    }}>
                      {ticket.status || 'Active'}
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

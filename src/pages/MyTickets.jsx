import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Ticket as TicketIcon, ArrowUpRight, RefreshCw, MapPin, X, Download, Smartphone, MoreVertical, ScanBarcode, Navigation } from 'lucide-react';
import { getMapIframeSrc, getDirectionsUrl } from '../utils/mapUtils';
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

// Cutoff timestamp: All existing free-tier tickets up to this point are immediately blurred.
// Newly booked Free-tier tickets will blur after 24 hours.
const EXISTING_FREE_CUTOFF = new Date('2026-10-27T13:30:00+03:00').getTime();

// Returns true if a Free-tier ticket is an existing ticket or older than 24 hours
function isTicketBlurred(ticket, userSubscription) {
  if (userSubscription !== 'Free') return false;
  const rawDate = ticket?.purchaseDate || ticket?.createdAt;
  // If there is no purchase date, it is an existing ticket and blurred
  if (!rawDate) return true;
  const purchaseTime = new Date(rawDate).getTime();
  if (isNaN(purchaseTime)) return true;
  // All existing Free-tier tickets are immediately blurred
  if (purchaseTime <= EXISTING_FREE_CUTOFF) return true;
  // Any newly booked tickets blur after 24 hours
  const ageMs = Date.now() - purchaseTime;
  return ageMs > 24 * 60 * 60 * 1000; // 24 hours
}

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
            <span style={{ color: 'white', fontSize: '28px' }}>{"\u2714"}</span>
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
              <div style={{ fontSize: '28px' }}>🎫</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#111', marginBottom: '2px' }}>
                  {eventTitle || 'Event Ticket'}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  Section <strong>{p.section}</strong> &nbsp;Â·&nbsp; Row <strong>{p.row}</strong> &nbsp;Â·&nbsp; Seat <strong>{p.seat}</strong>
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
            <span style={{ color: 'white', fontSize: '28px' }}>{"\u2714"}</span>
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

// Paywall overlay shown over blurred Free-tier tickets
function BlurPaywall({ onUpgrade }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(2,108,223,0.18) 0%, rgba(0,0,0,0.55) 100%)',
      backdropFilter: 'blur(2px)',
      borderRadius: 'inherit',
      padding: '16px',
      textAlign: 'center',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: '18px',
        padding: '20px 22px',
        boxShadow: '0 8px 40px rgba(2,108,223,0.18)',
        maxWidth: '300px',
        width: '100%',
        border: '1.5px solid rgba(2,108,223,0.15)',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #026cdf, #004aad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', fontSize: '22px'
        }}>🔒</div>
        <div style={{ fontWeight: 800, fontSize: '15px', color: '#111', marginBottom: '6px', lineHeight: 1.3 }}>
          Free Preview Expired
        </div>
        <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.55, marginBottom: '16px' }}>
          Free-tier tickets are viewable for <strong>24 hours</strong> after purchase.
          Upgrade to keep full access to your tickets anytime.
        </div>
        <button
          onClick={onUpgrade}
          style={{
            width: '100%', padding: '11px 0',
            background: 'linear-gradient(135deg, #026cdf, #004aad)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            letterSpacing: '0.3px',
            boxShadow: '0 4px 16px rgba(2,108,223,0.35)',
            transition: 'opacity 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          ✨ Upgrade to Unlock
        </button>
      </div>
    </div>
  );
}

function TicketStub({ seatString, ticketId, orderNumber, onTransfer, onSell, eventImage, eventTitle, currency, totalPrice, status, allSeats, ticketType, userSubscription, seatIndex, purchaseDate }) {
  const navigate = useNavigate();
  const blurred = isTicketBlurred({ purchaseDate }, userSubscription);
  const [showActions, setShowActions] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const parsed = parseSeat(seatString);

  const downloadPDF = async () => {
    if (status === 'Pending') {
      toast.warning('Tickets cannot be downloaded while pending approval.');
      return;
    }
    if (blurred) {
      toast.warning('Free preview expired. Please upgrade to download tickets.');
      navigate('/pricing');
      return;
    }
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
      const W = 210;
      const H = 148;

              const fetchBase64 = async (url) => {
          // Cloudinary auto-converts formats if we change the extension
          // jsPDF natively supports JPEG, so we enforce it
          const jpgUrl = url.replace(/\.webp$/i, '.jpg');
          
          const loadImg = (src) => new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = () => resolve(null);
            img.src = src;
          });

          let data = await loadImg(jpgUrl + (jpgUrl.includes('?') ? '&' : '?') + '_cb=' + Date.now());
          if (data) return data;
          
          console.log('Direct image load failed, trying CORS proxy...');
          data = await loadImg('https://api.allorigins.win/raw?url=' + encodeURIComponent(jpgUrl));
          return data;
        };

      let imgData = null;
      if (eventImage) {
        imgData = await fetchBase64(eventImage);
      }

      // Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, W, H, 'F');

      // Blue Header
      doc.setFillColor(2, 108, 223);
      doc.rect(0, 0, W, 25, 'F');
      
      // Brand
      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('Ticketmaster', 14, 17);
      
      // Status
      const statusLabel = (status || 'Active').toUpperCase();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(W - 46, 7.5, 32, 10, 2, 2, 'F');
      doc.setTextColor(2, 108, 223);
      doc.text(statusLabel, W - 30, 14, { align: 'center' });

      // Ticket Image (Left side)
      if (imgData) {
        doc.addImage(imgData, 'JPEG', 14, 30, 58, 58);
      } else {
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 30, 58, 58, 'F');
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Ticket Image', 43, 58, { align: 'center' });
      }

      // Event Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(20, 20, 20);
      const title = (eventTitle || 'Event').toUpperCase();
      const titleLines = doc.splitTextToSize(title, 92);
      doc.text(titleLines, 96, 34);
      const titleEndY = 34 + titleLines.length * 6;

      // Ticket Type
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(ticketType || parsed.type || 'Standard Ticket', 96, titleEndY + 5);
      const typeEndY = titleEndY + 14;

      // Seats Box
      const boxY = Math.max(typeEndY, 56);
      let mainSec = (parsed.section || '-').trim();
      let subSec = '';
      const parenMatch = mainSec.match(/^(.*?)\s*(\(.*?\))\s*$/);
      if (parenMatch) {
        mainSec = parenMatch[1].trim();
        subSec = parenMatch[2].trim();
      }

      const boxH = subSec ? 30 : 28;
      doc.setFillColor(248, 248, 248);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(96, boxY, 99, boxH, 3, 3, 'FD');
      
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text('SECTION', 102, boxY + 8);
      doc.text('ROW',     156, boxY + 8);
      doc.text('SEAT',    178, boxY + 8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 20, 20);
      if (subSec) {
        doc.setFontSize(11);
        doc.text(mainSec, 102, boxY + 16, { maxWidth: 50 });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(80, 80, 80);
        doc.text(subSec, 102, boxY + 22, { maxWidth: 50 });
      } else {
        const secFontSize = mainSec.length > 15 ? 9 : 11;
        doc.setFontSize(secFontSize);
        doc.text(mainSec, 102, boxY + 18, { maxWidth: 50 });
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(String(parsed.row),  156, boxY + 18);
      doc.text(String(parsed.seat), 178, boxY + 18);

      // Order Details
      const orderLabelY = boxY + boxH + 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text('ORDER ID', 96, orderLabelY);
      doc.text('TOTAL PAID', 148, orderLabelY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(String(orderNumber || ticketId), 96, orderLabelY + 8, { maxWidth: 48 });
      doc.text(`${currency || '$'}${totalPrice || ''}`, 148, orderLabelY + 8);

      // QR Code
      const rawQrData = `TICKET:${ticketId}`;
      const qrDataUrl = await QRCode.toDataURL(rawQrData, { width: 250, margin: 1 });
      const qrY = 95;
      doc.addImage(qrDataUrl, 'PNG', 14, qrY, 32, 32);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(2, 108, 223);
      doc.text('SCAN AT ENTRANCE', 14, qrY + 36, { maxWidth: 32, align: 'center' });
      doc.setFillColor(250, 250, 250);
      doc.rect(0, H - 12, W, 12, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('(c) 2026 Ticketmaster - Valid for one entry only. Present this ticket at the venue.', W / 2, H - 4, { align: 'center' });

      doc.save(`ticket-${parsed.section || 'std'}-${parsed.seat || 'seat'}.pdf`);
    } catch (e) {
      console.error('PDF gen err', e);
      toast.error('Failed to create PDF. Please try again.');
    }
  };

  return (
    <div style={{ marginBottom: '0', borderRadius: '0', overflow: 'hidden', borderBottom: '1px solid #e8e8e8', borderLeft: 'none', position: 'relative', borderTop: '0' }}>
      {/* Hidden always-mounted download trigger — used by "Download All" */}
      <button
        id={`stub-dl-btn-${ticketId}-${seatIndex ?? 0}`}
        onClick={downloadPDF}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      {blurred && (
        <BlurPaywall onUpgrade={() => navigate('/pricing')} />
      )}
      {!blurred && userSubscription === 'Free' && (
        <div style={{ padding: '6px', backgroundColor: '#ffcc00', color: '#111', fontSize: '11px', fontWeight: 700, textAlign: 'center', letterSpacing: '0.5px' }}>
          🚫 SCREEN RECORDING / SCREENSHOTS PROHIBITED ON FREE TIER
        </div>
      )}
      {/* Ticket type header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '10px 16px', fontWeight: 700, fontSize: '12px', color: '#cdd6f4', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', filter: blurred ? 'blur(4px)' : 'none', userSelect: blurred ? 'none' : 'auto' }}>
        {ticketType || parsed.type}
      </div>

      {/* Section / Row / Seat row */}
      <div
        style={{ backgroundColor: 'white', padding: '16px', display: 'flex', alignItems: 'center', cursor: blurred ? 'default' : 'pointer', position: 'relative', transition: 'all 0.2s', filter: blurred ? 'blur(6px)' : 'none', userSelect: blurred ? 'none' : 'auto' }}
        onClick={() => !blurred && setShowActions(!showActions)}
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
            onClick={() => {
              if (blurred) {
                toast.warning('Upgrade to transfer tickets');
                navigate('/pricing');
                return;
              }
              if (status === 'Pending') {
                toast.warning('Tickets cannot be transferred while pending approval.');
                return;
              }
              setShowTransferModal(true);
              setShowActions(false);
            }}
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
              if (blurred) {
                toast.warning('Upgrade to add tickets to wallet');
                navigate('/pricing');
                return;
              }
              if (status === 'Pending') {
                toast.warning('Tickets cannot be saved to wallet while pending approval.');
                return;
              }
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
            onClick={() => {
              if (blurred) {
                toast.warning('Upgrade to sell tickets');
                navigate('/pricing');
                return;
              }
              if (status === 'Pending') {
                toast.warning('Tickets cannot be listed for resale while pending approval.');
                return;
              }
              setShowSellModal(true);
              setShowActions(false);
            }}
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
  const [userSubscription, setUserSubscription] = useState('Free');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [retryPhone, setRetryPhone] = useState('');
  const [retryLoading, setRetryLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayPendingExtra = async (ticketId, surchargeFee) => {
    const phone = retryPhone.trim().replace(/[\s+-]/g, '');
    if (!phone || phone.length < 9) {
      toast.error('Please enter a valid M-Pesa phone number (e.g. 0712345678)');
      return;
    }
    const token = localStorage.getItem('token');
    setRetryLoading(true);
    try {
      const res = await fetch(`${API}/api/tickets/${ticketId}/pay-extra-stk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phoneNumber: phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send STK push');
      toast.info(`STK Push sent to ${phone}. Enter your M-Pesa PIN!`);

      const interval = setInterval(async () => {
        try {
          const sRes = await fetch(`${API}/api/tickets/${ticketId}/payment-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const sData = await sRes.json();
          if (sData && (sData.status === 'Approved' || sData.paymentStatus === 'Paid')) {
            clearInterval(interval);
            toast.success('M-Pesa payment confirmed! Tickets approved! 🎉');
            const updated = await fetch(`${API}/api/tickets/my-tickets`, { headers: { 'Authorization': `Bearer ${token}` } });
            const list = await updated.json();
            setTickets(list);
            const current = list.find(t => t._id === ticketId);
            if (current) setSelectedOrder(current);
            setRetryLoading(false);
          }
        } catch (_) {}
      }, 2000);

      setTimeout(() => clearInterval(interval), 60000);
    } catch (err) {
      setRetryLoading(false);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const [ticketRes, eventRes, userRes] = await Promise.all([
          token ? fetch(`${API}/api/tickets/my-tickets`, { headers: { 'Authorization': `Bearer ${token}` } }) : Promise.resolve({ ok: false }),
          fetch(`${API}/api/events`),
          token ? fetch(`${API}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } }) : Promise.resolve({ ok: false })
        ]);
        if (ticketRes.ok) {
          const tData = await ticketRes.json();
          setTickets(tData);
        }
        if (eventRes.ok) {
          const eData = await eventRes.json();
          setEvents(eData);
        }
        if (userRes.ok) {
          const uData = await userRes.json();
          setUserSubscription(uData.subscription || 'Free');
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

  const getEventImage = (ticket) => {
    // Use the image stored directly on the ticket first (survives transfers)
    if (ticket?.eventImage) return ticket.eventImage;
    const eventId = ticket?.eventId;
    const safeTitle = ticket?.eventTitle ? ticket.eventTitle.toLowerCase().trim() : '';
    let match = null;
    if (eventId) match = events.find(e => e._id === eventId);
    if (!match) match = events.find(e => e.title?.toLowerCase().trim() === safeTitle);
    if (!match) match = fallbackEvents.find(e => e.title?.toLowerCase().trim() === safeTitle);
    return match?.image || null;
  };

  const getEventMeta = (ticket) => {
    const eventId = ticket?.eventId;
    const safeTitle = ticket?.eventTitle ? ticket.eventTitle.toLowerCase().trim() : '';
    let match = null;
    if (eventId) match = events.find(e => e._id === eventId);
    if (!match) match = events.find(e => e.title?.toLowerCase().trim() === safeTitle);
    if (!match) match = fallbackEvents.find(e => e.title?.toLowerCase().trim() === safeTitle);
    return match || null;
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
        toast.error(`âŒ ${data.error}`);
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
    if (isTicketBlurred(selectedOrder, userSubscription)) {
      setSelectedOrder(null);
      return null;
    }
    const eventMeta = getEventMeta(selectedOrder);
    const image = eventMeta?.image;

    return (
      <div className="premium-gradient-bg" style={{ minHeight: "100vh" }}>
        {/* Banner Container */}
        <div style={{ position: 'relative', minHeight: '380px' }}>
          {/* Background Image */}
          <div className="ticket-image-container" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>{image ? <img src={image} alt={selectedOrder.eventTitle} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; }} />
            : <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, #0f172a, #1e293b)" }} />
          }</div>
          
          {/* Back button */}
          <button
            onClick={() => setSelectedOrder(null)}
            style={{ position: 'absolute', top: '24px', left: '16px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            <ChevronLeft size={24} color="white" />
          </button>
          <button style={{ position: 'absolute', top: '24px', right: '16px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '24px', padding: '8px 20px', border: 'none', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', zIndex: 10 }}>Help</button>

          {/* Floating Event Info Card */}
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', zIndex: 10 }}>
            {/* Date Tab */}
            <div style={{ display: 'inline-block', background: "#111", color: "#ffffff", padding: "10px 20px", borderRadius: "10px 10px 0 0", fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
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
                  <span>x{selectedOrder.seatsOriginalCount || selectedOrder.seats?.length || 1}</span>
                </div>
              </div>
            </div>

            {/* View Tickets button or Pending indicator */}
            {selectedOrder.status === 'Pending' ? (
              <div style={{
                width: '100%', backgroundColor: '#fff8e1', color: '#b45309',
                border: 'none', margin: 0, padding: '16px', fontSize: '15px',
                fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', boxSizing: 'border-box', borderTop: '2px solid #ffe082'
              }}>
                <span>⏳</span>
                <span>Pending Approval — Tickets Hidden</span>
              </div>
            ) : (
              <button className="interactive-btn" style={{ width: '100%', backgroundColor: '#026cdf', color: 'white', border: 'none', margin: 0, padding: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxSizing: 'border-box' }}>
                <CustomBarcodeIcon size={24} color="white" />
                View Tickets
              </button>
            )}
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
          <div style={{ padding: '12px 0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', padding: '0 16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Order {generateOrderStr(selectedOrder._id, eventMeta?.location, selectedOrder.orderNumber)}</h3>
              <MoreVertical size={20} color="#333" />
            </div>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 8px', padding: '0 16px' }}>x{selectedOrder.seatsOriginalCount || selectedOrder.seats?.length || 1} Tickets</p>

            {/* Download All button for multi-seat approved orders */}
            {(selectedOrder.seats?.length || 0) > 1 && ['Approved', 'Active'].includes(selectedOrder.status) && !isTicketBlurred(selectedOrder, userSubscription) && (
              <button
                onClick={async () => {
                  toast.info('Generating your tickets... Please wait.');
                  try {
                    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
                    const W = 210;
                    const H = 148;

                    const fetchBase64 = async (url) => {
                      if (!url) return null;
                      const jpgUrl = url.replace(/\.webp$/i, '.jpg');
                      const loadImg = (src) => new Promise((resolve) => {
                        const img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          canvas.width = img.width;
                          canvas.height = img.height;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0);
                          resolve(canvas.toDataURL('image/jpeg', 0.9));
                        };
                        img.onerror = () => resolve(null);
                        img.src = src;
                      });
                      let data = await loadImg(jpgUrl + (jpgUrl.includes('?') ? '&' : '?') + '_cb=' + Date.now());
                      if (data) return data;
                      return await loadImg('https://api.allorigins.win/raw?url=' + encodeURIComponent(jpgUrl));
                    };

                    const imgData = await fetchBase64(image);

                    for (let i = 0; i < selectedOrder.seats.length; i++) {
                      if (i > 0) doc.addPage();
                      
                      const seatStr = selectedOrder.seats[i];
                      const parsed = parseSeat(seatStr);
                      const tId = selectedOrder._id;
                      const oNum = generateOrderStr(tId, eventMeta?.location, selectedOrder.orderNumber);

                      // Background
                      doc.setFillColor(255, 255, 255);
                      doc.rect(0, 0, W, H, 'F');

                      // Blue Header
                      doc.setFillColor(2, 108, 223);
                      doc.rect(0, 0, W, 25, 'F');
                      
                      // Brand
                      doc.setFont('helvetica', 'bolditalic');
                      doc.setFontSize(22);
                      doc.setTextColor(255, 255, 255);
                      doc.text('Ticketmaster', 14, 17);
                      
                      // Status
                      const statusLabel = (selectedOrder.status || 'Active').toUpperCase();
                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(8);
                      doc.setFillColor(255, 255, 255);
                      doc.roundedRect(W - 46, 7.5, 32, 10, 2, 2, 'F');
                      doc.setTextColor(2, 108, 223);
                      doc.text(statusLabel, W - 30, 14, { align: 'center' });

                      // Ticket Image
                      if (imgData) {
                        doc.addImage(imgData, 'JPEG', 14, 30, 58, 58);
                      } else {
                        doc.setFillColor(240, 240, 240);
                        doc.rect(14, 30, 58, 58, 'F');
                        doc.setFontSize(10);
                        doc.setTextColor(150, 150, 150);
                        doc.text('Ticket Image', 43, 58, { align: 'center' });
                      }

                      // Event Title
                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(13);
                      doc.setTextColor(20, 20, 20);
                      const title = (selectedOrder.eventTitle || 'Event').toUpperCase();
                      const titleLines = doc.splitTextToSize(title, 92);
                      doc.text(titleLines, 96, 34);
                      const titleEndY = 34 + titleLines.length * 6;

                      // Ticket Type
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(9);
                      doc.setTextColor(100, 100, 100);
                      doc.text(selectedOrder.ticketType || parsed.type || 'Standard Ticket', 96, titleEndY + 5);
                      const typeEndY = titleEndY + 14;

                      // Seats Box
                      const boxY = Math.max(typeEndY, 56);
                      let mainSec = (parsed.section || '-').trim();
                      let subSec = '';
                      const parenMatch = mainSec.match(/^(.*?)\s*(\(.*?\))\s*$/);
                      if (parenMatch) {
                        mainSec = parenMatch[1].trim();
                        subSec = parenMatch[2].trim();
                      }

                      const boxH = subSec ? 30 : 28;
                      doc.setFillColor(248, 248, 248);
                      doc.setDrawColor(220, 220, 220);
                      doc.roundedRect(96, boxY, 99, boxH, 3, 3, 'FD');
                      
                      doc.setFontSize(7);
                      doc.setTextColor(130, 130, 130);
                      doc.text('SECTION', 102, boxY + 8);
                      doc.text('ROW',     156, boxY + 8);
                      doc.text('SEAT',    178, boxY + 8);

                      doc.setFont('helvetica', 'bold');
                      doc.setTextColor(20, 20, 20);
                      if (subSec) {
                        doc.setFontSize(11);
                        doc.text(mainSec, 102, boxY + 16, { maxWidth: 50 });
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(6);
                        doc.setTextColor(80, 80, 80);
                        doc.text(subSec, 102, boxY + 22, { maxWidth: 50 });
                      } else {
                        const secFontSize = mainSec.length > 15 ? 9 : 11;
                        doc.setFontSize(secFontSize);
                        doc.text(mainSec, 102, boxY + 18, { maxWidth: 50 });
                      }

                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(11);
                      doc.setTextColor(20, 20, 20);
                      doc.text(String(parsed.row),  156, boxY + 18);
                      doc.text(String(parsed.seat), 178, boxY + 18);

                      // Order Details
                      const orderLabelY = boxY + boxH + 8;
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(7);
                      doc.setTextColor(130, 130, 130);
                      doc.text('ORDER ID', 96, orderLabelY);
                      doc.text('TOTAL PAID', 148, orderLabelY);

                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(11);
                      doc.setTextColor(20, 20, 20);
                      doc.text(String(oNum), 96, orderLabelY + 8, { maxWidth: 48 });
                      doc.text(`${selectedOrder.currency || '$'}${selectedOrder.totalPrice || ''}`, 148, orderLabelY + 8);

                      // QR Code
                      const rawQrData = `TICKET:${tId}`;
                      const qrDataUrl = await QRCode.toDataURL(rawQrData, { width: 250, margin: 1 });
                      const qrY = 95;
                      doc.addImage(qrDataUrl, 'PNG', 14, qrY, 32, 32);

                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(7);
                      doc.setTextColor(2, 108, 223);
                      doc.text('SCAN AT ENTRANCE', 14, qrY + 36, { maxWidth: 32, align: 'center' });
                      
                      doc.setFillColor(250, 250, 250);
                      doc.rect(0, H - 12, W, 12, 'F');
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(7);
                      doc.setTextColor(150, 150, 150);
                      doc.text('(c) 2026 Ticketmaster - Valid for one entry only. Present this ticket at the venue.', W / 2, H - 4, { align: 'center' });
                    }
                    
                    doc.save(`order-${selectedOrder.orderNumber || selectedOrder._id}.pdf`);
                    toast.success('Tickets downloaded successfully!');
                  } catch (e) {
                    console.error('PDF gen err', e);
                    toast.error('Failed to generate tickets. Please try again.');
                  }
                }}
                style={{
                  width: '100%', padding: '14px', border: '2px solid #026cdf',
                  borderRadius: '12px', backgroundColor: '#f0f6ff',
                  color: '#026cdf', fontSize: '15px', fontWeight: 700,
                  cursor: 'pointer', display: 'none', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', marginBottom: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => { e.currentTarget.style.backgroundColor = '#026cdf'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f0f6ff'; e.currentTarget.style.color = '#026cdf'; }}
              >
                <Download size={18} />
                Download All {selectedOrder.seats.length} Tickets
              </button>
            )}

          {activeTab === 'Tickets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div>
                {['Approved', 'Active', 'Transferred'].includes(selectedOrder.status) ? (
                  selectedOrder.seats.map((seatStr, idx) => (
                    <TicketStub
                      key={idx}
                      seatIndex={idx}
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
                      userSubscription={userSubscription}
                      purchaseDate={selectedOrder.purchaseDate}
                    />
                  ))
                ) : (
                  <div style={{ padding: '28px 20px', backgroundColor: '#fffdf5', borderRadius: '16px', border: '1.5px solid #ffe082', margin: '16px 0', textAlign: 'center' }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '50%',
                      backgroundColor: '#fff8e1', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px'
                    }}>
                      ⏳
                    </div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '19px', fontWeight: 800, color: '#b45309' }}>
                      {selectedOrder.surchargeFee > 0 && selectedOrder.paymentStatus !== 'Paid' 
                        ? 'M-Pesa Payment Required to Reveal Tickets' 
                        : 'Tickets Pending Approval'}
                    </h3>
                    <p style={{ margin: '0 0 16px', color: '#666', fontSize: '13px', lineHeight: 1.6, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                      {selectedOrder.surchargeFee > 0 && selectedOrder.paymentStatus !== 'Paid'
                        ? `This order includes ${selectedOrder.extraTickets || 0} extra ticket(s). Tickets, barcodes, and entry QR codes remain hidden until the KES ${selectedOrder.surchargeFee} surcharge is paid.`
                        : 'Tickets, seat allocations, barcodes, and QR codes are hidden until your order is reviewed and approved. Once approved, full ticket access will appear here.'}
                    </p>

                    {selectedOrder.surchargeFee > 0 && selectedOrder.paymentStatus !== 'Paid' && (
                      <div style={{ maxWidth: '360px', margin: '0 auto', textAlign: 'left', backgroundColor: 'white', padding: '18px', borderRadius: '14px', border: '1px solid #ffd54f', boxShadow: '0 4px 12px rgba(245,158,11,0.1)' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '6px', textTransform: 'uppercase' }}>
                          M-Pesa Mobile Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 0712345678"
                          value={retryPhone}
                          onChange={e => setRetryPhone(e.target.value)}
                          style={{
                            width: '100%', padding: '12px 14px', borderRadius: '8px',
                            border: '1.5px solid #cbd5e1', fontSize: '15px', outline: 'none',
                            marginBottom: '12px', boxSizing: 'border-box'
                          }}
                        />
                        <button
                          onClick={() => handlePayPendingExtra(selectedOrder._id, selectedOrder.surchargeFee)}
                          disabled={retryLoading}
                          style={{
                            width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                            backgroundColor: '#00843d', color: 'white', fontSize: '15px', fontWeight: 800,
                            cursor: retryLoading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: '0 4px 12px rgba(0,132,61,0.25)'
                          }}
                        >
                          {retryLoading ? 'Sending STK Push...' : `Pay KES ${selectedOrder.surchargeFee} via M-Pesa`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Map & Directions */}
              <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>
                <iframe
                  width="100%"
                  height="220"
                  frameBorder="0"
                  style={{ border: 0, display: 'block' }}
                  src={getMapIframeSrc(eventMeta?.location, eventMeta?.mapLink)}
                  allowFullScreen
                  title="Event Location"
                ></iframe>
                <button 
                  className="interactive-btn"
                  onClick={() => window.open(getDirectionsUrl(eventMeta?.location, eventMeta?.mapLink), '_blank')}
                  style={{ width: '100%', padding: '16px', border: 'none', backgroundColor: '#f0f0f0', color: '#111', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                >
                  <Navigation size={18} color="white" />
                  Get Directions
                </button>
              </div>



              {/* Promotion Banner */}
              <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', backgroundColor: '#111', color: 'white', minHeight: '160px' }}>
                   {/* Left side: Image and details */}
                   <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                     {image ? (
                       <img src={image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; }} />
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
                        {selectedOrder.status === 'Pending' ? (
                          <>
                            <div style={{ fontSize: '14px', fontWeight: 800, lineHeight: 1.4, color: '#f59e0b' }}>AWAITING</div>
                            <div style={{ fontSize: '14px', fontWeight: 800, lineHeight: 1.4, borderBottom: "3px solid #f59e0b", paddingBottom: "4px", display: 'inline-block', color: '#f59e0b' }}>APPROVAL</div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.4 }}>YOU GOT</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.4, borderBottom: "3px solid #026cdf", paddingBottom: "4px", display: 'inline-block' }}>TICKETS!</div>
                          </>
                        )}
                      </div>
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
  const FREE_LIFETIME_LIMIT = 2;
  const isVIP = userSubscription === 'VIP';
  const isFree = userSubscription === 'Free';

  // Free: count all tickets ever purchased (lifetime)
  const lifetimeUsed = tickets.reduce((total, ticket) => {
    return total + (ticket.seatsOriginalCount || (ticket.seats ? ticket.seats.length : 1));
  }, 0);

  const usagePercent = isFree ? Math.min(100, (lifetimeUsed / FREE_LIFETIME_LIMIT) * 100) : 0;

  return (
    <div className="page my-tickets-page premium-gradient-bg" style={{ minHeight: "100vh" }}>
      <div style={{ backgroundColor: 'white', padding: '20px 16px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 16px' }}>My Tickets</h1>
        
        {/* Usage Progress */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {isFree ? 'Lifetime Free Usage' : 'Subscription Plan'}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#111', marginTop: '2px' }}>
                {isVIP ? `${lifetimeUsed} Tickets (VIP Plan)` : `${lifetimeUsed} of ${FREE_LIFETIME_LIMIT} Lifetime Tickets`}
              </div>
            </div>
            {!isVIP && (
              <button 
                onClick={() => navigate('/pricing')}
                style={{ background: 'none', border: 'none', color: '#026cdf', fontSize: '13px', fontWeight: 700, padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Upgrade Plan
              </button>
            )}
          </div>
          {!isVIP && (
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${usagePercent}%`, height: '100%', backgroundColor: usagePercent >= 100 ? '#ef4444' : usagePercent >= 80 ? '#f59e0b' : '#026cdf', transition: 'width 0.3s' }}></div>
            </div>
          )}
          {!isVIP && FREE_LIFETIME_LIMIT - lifetimeUsed === 1 && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>⚠️ Only 1 free ticket left for your account!</p>
          )}
          {!isVIP && FREE_LIFETIME_LIMIT - lifetimeUsed <= 0 && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>⚠️ You have reached your 2 free lifetime tickets limit. Upgrade to VIP to book more.</p>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>Loading tickets...</div>
      ) : tickets.length > 0 ? (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tickets.map(ticket => {
            const image = getEventImage(ticket);
            const meta = getEventMeta(ticket);
            const blurred = isTicketBlurred(ticket, userSubscription);
            return (
              <div
                key={ticket._id}
                onClick={() => !blurred && setSelectedOrder(ticket)}
                className="ticket-card-premium"
                style={{ position: 'relative', cursor: blurred ? 'default' : 'pointer' }}
              >
                {/* Blur paywall overlay for Free-tier expired tickets */}
                {blurred && (
                  <BlurPaywall onUpgrade={() => navigate('/pricing')} />
                )}

                {/* Event Banner */}
                <div className="ticket-image-container" style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden', filter: blurred ? 'blur(5px)' : 'none' }}>{image ? <img src={image} alt={ticket.eventTitle} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; }} />
                  : <div style={{ width: '100%', height: '140px', background: 'linear-gradient(135deg, #026cdf, #004aad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TicketIcon size={48} color="rgba(255,255,255,0.4)" /></div>}</div>

                {/* Order Info */}
                <div style={{ padding: '14px 16px', filter: blurred ? 'blur(5px)' : 'none', userSelect: blurred ? 'none' : 'auto' }}>
                  {meta?.date && <p style={{ color: '#026cdf', fontSize: '12px', fontWeight: 600, margin: '0 0 4px' }}>{meta.date}</p>}
                  <h3 style={{ fontSize: "18px", fontWeight: 900, margin: "0 0 8px", letterSpacing: "0.5px" }}>{ticket.eventTitle}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: ticket.status === 'Pending' ? '#b45309' : '#666', fontSize: '13px', fontWeight: ticket.status === 'Pending' ? 700 : 400 }}>
                      {ticket.status === 'Pending' ? '🔒 Tickets hidden until approved' : (meta?.location || 'View Order')}
                    </span>
                    <span style={{ color: '#333', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TicketIcon size={14} /> x{ticket.seatsOriginalCount || ticket.seats?.length || 1}
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
                      {ticket.status === 'Pending' && ticket.surchargeFee > 0 && ticket.paymentStatus !== 'Paid'
                        ? 'Pending M-Pesa Payment'
                        : (ticket.status || 'Active')}
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

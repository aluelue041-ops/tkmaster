const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/MyTickets.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix corrupted emoji in Free tier banner
content = content.replace(
  /[^\x20-\x7E\r\n]+ SCREEN RECORDING/g,
  '\uD83D\uDEAB SCREEN RECORDING'
);

// 2. Fix corrupted emoji in TransferModal ticket summary  
content = content.replace(
  /\{ fontSize: '28px' \}}\>[^\x20-\x7E]*\<\/div\>/g,
  `{ fontSize: '28px' }}>\uD83C\uDFAB</div>`
);

// 3. Fix corrupted separator · in seat display (appears as A? or similar)
content = content.replace(
  /\&nbsp;A[^\w<&]+\&nbsp;/g,
  ' &nbsp;\u00B7&nbsp; '
);

// 4. Fix corrupted PDF footer copyright
content = content.replace(
  /Ac 2026 Ticketmaster [^\-'"\n]*/g,
  '\u00A9 2026 Ticketmaster \u2013 Valid for one entry only. Present this ticket at the venue.'
);

// 5. Polish TicketStub header - gradient instead of flat grey
content = content.replace(
  `{ backgroundColor: '#f0f0f0', padding: '10px 16px', fontWeight: 700, fontSize: '13px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }`,
  `{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '10px 16px', fontWeight: 700, fontSize: '12px', color: '#cdd6f4', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }`
);

// 6. Color-code action buttons
// Transfer - blue
content = content.replace(
  `onClick={() => { setShowTransferModal(true); setShowActions(false); }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px',
              padding: '14px 20px', cursor: 'pointer', flex: 1, maxWidth: '120px'
            }}
          >
            <ArrowUpRight size={22} color="#333" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>Transfer</span>`,
  `onClick={() => { setShowTransferModal(true); setShowActions(false); }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg, #026cdf, #004aad)', border: 'none', borderRadius: '12px',
              padding: '14px 20px', cursor: 'pointer', flex: 1, maxWidth: '120px'
            }}
          >
            <ArrowUpRight size={22} color="white" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>Transfer</span>`
);

// Sell - red/orange
content = content.replace(
  `onClick={() => { setShowSellModal(true); setShowActions(false); }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px',
              padding: '14px 20px', cursor: 'pointer', flex: 1, maxWidth: '120px'
            }}
          >
            <RefreshCw size={22} color="#333" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>Sell</span>`,
  `onClick={() => { setShowSellModal(true); setShowActions(false); }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg, #ff6b35, #e63000)', border: 'none', borderRadius: '12px',
              padding: '14px 20px', cursor: 'pointer', flex: 1, maxWidth: '120px'
            }}
          >
            <RefreshCw size={22} color="white" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>Sell</span>`
);

// 7. Polish the ticket card itself - stronger left accent border
content = content.replace(
  `{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'relative' }`,
  `{ marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', position: 'relative', borderLeft: '4px solid #026cdf' }`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Extra polish applied');

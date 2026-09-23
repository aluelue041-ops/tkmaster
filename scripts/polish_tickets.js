const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/MyTickets.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix corrupted Pending emoji
content = content.replace(
  /[^\x00-\x7F]*3 Pending Approval/g,
  '\u23F3 Pending Approval'
);

// 2. Make map taller
content = content.replace(
  'height="180"',
  'height="220"'
);

// 3. Polish "Get Directions" button — blue branded look
content = content.replace(
  `style={{ width: '100%', padding: '16px', border: 'none', backgroundColor: '#f0f0f0', color: '#111', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}`,
  `style={{ width: '100%', padding: '14px 16px', border: 'none', background: 'linear-gradient(135deg, #026cdf, #004aad)', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s', letterSpacing: '0.3px' }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}`
);

// 4. Update Navigation icon color in Get Directions to white
content = content.replace(
  `<Navigation size={18} color="#111" />`,
  `<Navigation size={18} color="white" />`
);

// 5. Add venue name header above the map
content = content.replace(
  `{/* Map & Directions */}
              <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>`,
  `{/* Map & Directions */}
              <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>
                {/* Venue header */}
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <MapPin size={16} color="#026cdf" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{eventMeta?.location || 'Event Venue'}</span>
                </div>`
);

// 6. Polish Post on Social Media section
content = content.replace(
  `<div style={{ padding: '20px 16px', backgroundColor: '#f0f0f0' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800, color: '#111' }}>Post on Social Media</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: 1.5 }}>
                    Build hype for the event, and share that you got tickets with your friends and family
                  </p>
                </div>`,
  `<div style={{ padding: '16px', background: 'linear-gradient(135deg, #f8f9ff, #f0f4ff)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#111' }}>Share with your friends!</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '12px', lineHeight: 1.5 }}>Build hype and let everyone know you got tickets</p>
                  </div>
                  <button style={{ flexShrink: 0, background: 'linear-gradient(135deg, #026cdf, #004aad)', color: 'white', border: 'none', borderRadius: '24px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Share Now</button>
                </div>`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Polish applied successfully');

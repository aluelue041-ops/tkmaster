const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/MyTickets.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the date badge: remove the duplicate color:'#fff' that makes text invisible on white bg
// Change to a solid dark background with white text so it's clearly visible
content = content.replace(
  `style={{ display: 'inline-block', background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", color: "#111", padding: "12px 24px", borderRadius: "12px 12px 0 0", boxShadow: "0 -4px 16px rgba(0,0,0,0.1)", color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}`,
  `style={{ display: 'inline-block', background: "#111", color: "#ffffff", padding: "10px 20px", borderRadius: "10px 10px 0 0", fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Date badge fixed');

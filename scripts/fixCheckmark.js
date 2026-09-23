const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/MyTickets.jsx';
let content = fs.readFileSync(path, 'utf8');

// The corrupted checkmark usually looks like 'âœ”' or 'o"' in the source code due to reading/writing in wrong encodings.
// We'll look for the green circle styling to safely replace whatever is inside it.

// The circle has styling like: width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#34c759'
content = content.replace(
  /<div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>\s*<span style={{ color: 'white', fontSize: '28px' }}>[^<]*<\/span>\s*<\/div>/,
  `<div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: 'white', fontSize: '28px' }}>\\u2714</span>
          </div>`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed corrupted checkmark on Transfer Complete modal');

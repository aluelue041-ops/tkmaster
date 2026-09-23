const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/SignIn.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix syntax error in SignIn.jsx
content = content.replace(
  /marginTop:\s*'8px'[^<]*Waking up server/g,
  `marginTop: '8px' }}>⏳ Waking up server`
);

fs.writeFileSync(path, content, 'utf8');
console.log('SignIn syntax error fixed');

const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/MyTickets.jsx';
let content = fs.readFileSync(path, 'utf8');

const newFetchFunc = `        const fetchBase64 = async (url) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = (e) => {
              console.error('PDF image load error', e);
              resolve(null);
            };
            // Append cache buster to prevent CORS cache issues
            img.src = url.includes('?') ? url + '&_cb=' + Date.now() : url + '?_cb=' + Date.now();
          });
        };`;

// Regex to match the current fetchBase64 definition and replace it
content = content.replace(
  /const fetchBase64 = async \(url\) => \{[\s\S]*?img\.src = url;\s*\}\);\s*\};/,
  newFetchFunc
);

fs.writeFileSync(path, content, 'utf8');
console.log('PDF image cache-buster fix applied');

const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/MyTickets.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the fetchBase64 function with a canvas-based approach
const oldFetchFunc = `        const fetchBase64 = async (url) => {
          try {
            const res = await fetch(url);
            const blob = await res.blob();
            return new Promise(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          } catch { return null; }
        };`;

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
            img.onerror = () => resolve(null);
            img.src = url;
          });
        };`;

content = content.replace(oldFetchFunc, newFetchFunc);

// Remove the explicit 'JPEG' format parameter if it's there
content = content.replace(/doc\.addImage\(imgData,\s*'JPEG',\s*14,\s*30,\s*58,\s*58\);/g, "doc.addImage(imgData, 'JPEG', 14, 30, 58, 58);");

fs.writeFileSync(path, content, 'utf8');
console.log('PDF image fix applied');

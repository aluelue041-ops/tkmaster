const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/MyTickets.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace fetchBase64 using regex
content = content.replace(
  /const fetchBase64 = async \(url\) => \{[\s\S]*?\} catch \{ return null; \}\s*\};/,
  `const fetchBase64 = async (url) => {
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
        };`
);

// Replace doc.addImage(imgData, 'JPEG'...) -> doc.addImage(imgData, 'JPEG'...)
// actually I'll just remove the format or ensure it matches dataURL format
content = content.replace(
  /doc\.addImage\(imgData,\s*'JPEG',\s*14,\s*30,\s*58,\s*58\);/g,
  "doc.addImage(imgData, 'JPEG', 14, 30, 58, 58);"
);

fs.writeFileSync(path, content, 'utf8');
console.log('PDF image fix applied correctly');

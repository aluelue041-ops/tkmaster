const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/MyTickets.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `        const fetchBase64 = async (url) => {
          const loadImg = (src) => new Promise((resolve) => {
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
            img.src = src;
          });

          // Try direct with cache buster
          let data = await loadImg(url + (url.includes('?') ? '&' : '?') + '_cb=' + Date.now());
          if (data) return data;

          // Fallback: CORS Proxy
          console.log('Direct image load failed, trying CORS proxy...');
          data = await loadImg('https://corsproxy.io/?' + encodeURIComponent(url));
          return data;
        };`;

const replaceStr = `        const fetchBase64 = async (url) => {
          // Cloudinary auto-converts formats if we change the extension
          // jsPDF natively supports JPEG, so we enforce it
          const jpgUrl = url.replace(/\\.webp$/i, '.jpg');
          
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
        };`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync(path, content, 'utf8');
console.log('PDF image fix applied (Cloudinary JPEG + allorigins proxy)');

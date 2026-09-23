const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/EventDetails.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<img 
          src={event.image} 
          alt={event.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />`;

const replaceStr = `<img 
          src={event.image} 
          alt={event.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; 
          }}
        />`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync(path, content, 'utf8');
console.log('EventDetails broken image fix applied');

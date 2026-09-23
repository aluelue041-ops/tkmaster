const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/server/server.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/title: '.*? New Event Posted!'/g, "title: '?? New Event Posted!'");
content = content.replace(/message: \\\\$\{newEvent\.title\}.*?\\\$\{newEvent\.date\} at \\\$\{newEvent\.location\}\/g, "message: \\ – \ at \\");
fs.writeFileSync(path, content, 'utf8');

const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/server/server.js';
let lines = fs.readFileSync(path, 'utf8').split('\n');
lines[911] = "      title: '🎫 New Event Posted!',";
lines[912] = "      message: `${newEvent.title} - ${newEvent.date} at ${newEvent.location}`,";
fs.writeFileSync(path, lines.join('\n'), 'utf8');

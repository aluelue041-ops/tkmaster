const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/MyTickets.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/const getEventImage = \(eventTitle\) => \{([\s\S]*?)\};/, 
`const getEventImage = (ticket) => {
    const eventId = ticket?.eventId;
    const safeTitle = ticket?.eventTitle ? ticket.eventTitle.toLowerCase().trim() : '';
    let match = null;
    if (eventId) match = events.find(e => e._id === eventId);
    if (!match) match = events.find(e => e.title?.toLowerCase().trim() === safeTitle);
    if (!match) match = fallbackEvents.find(e => e.title?.toLowerCase().trim() === safeTitle);
    return match?.image || null;
  };`);

content = content.replace(/const getEventMeta = \(eventTitle\) => \{([\s\S]*?)\};/, 
`const getEventMeta = (ticket) => {
    const eventId = ticket?.eventId;
    const safeTitle = ticket?.eventTitle ? ticket.eventTitle.toLowerCase().trim() : '';
    let match = null;
    if (eventId) match = events.find(e => e._id === eventId);
    if (!match) match = events.find(e => e.title?.toLowerCase().trim() === safeTitle);
    if (!match) match = fallbackEvents.find(e => e.title?.toLowerCase().trim() === safeTitle);
    return match || null;
  };`);

content = content.replace(/getEventMeta\(selectedOrder\.eventTitle\)/g, "getEventMeta(selectedOrder)");
content = content.replace(/getEventMeta\(ticket\.eventTitle\)/g, "getEventMeta(ticket)");
content = content.replace(/getEventImage\(ticket\.eventTitle\)/g, "getEventImage(ticket)");

fs.writeFileSync(path, content, 'utf8');

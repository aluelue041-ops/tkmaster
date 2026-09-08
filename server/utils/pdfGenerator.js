const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

async function fetchImageBuffer(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error('Error fetching image for PDF:', err.message);
    return null;
  }
}

function parseSeat(seatString) {
  if (!seatString) return { section: '-', row: '-', seat: '-', type: 'Standard Ticket' };

  if (seatString.includes('General Admission')) {
    const secMatch = seatString.match(/Section:\s*([^,]+)/);
    const tktMatch = seatString.match(/Ticket Number:\s*(\d+)/);
    return {
      section: secMatch ? secMatch[1].trim() : 'GA',
      row: 'GA',
      seat: tktMatch ? tktMatch[1] : '-',
      type: 'General Admission'
    };
  }

  const secMatch = seatString.match(/Section:\s*([^,]+)/);
  const rowMatch = seatString.match(/Row:\s*([^,]+)/);
  const seatMatch = seatString.match(/Seat Number:\s*(\d+)/);

  let sectionName = secMatch ? secMatch[1].trim() : '-';
  if (sectionName.includes('-') && !sectionName.toLowerCase().includes('vip')) {
    sectionName = sectionName.split('-').pop().trim();
  }
  
  if (sectionName.toLowerCase().startsWith('section ')) {
    sectionName = sectionName.replace(/section\s+/i, '').trim();
  }

  return {
    section: sectionName,
    row: rowMatch ? rowMatch[1].trim() : '-',
    seat: seatMatch ? seatMatch[1] : '-',
    type: 'Full Price Ticket'
  };
}

async function generateTicketPDF({ ticketId, eventTitle, eventImage, seatString, orderNumber, currency, totalPrice, status, ticketType }) {
  return new Promise(async (resolve, reject) => {
    try {
      const parsed = parseSeat(seatString);
      const W = 595.28; // A5 Landscape width in points
      const H = 419.53; // A5 Landscape height in points

      const doc = new PDFDocument({ size: 'A5', layout: 'landscape', margin: 0 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Background
      doc.rect(0, 0, W, H).fillColor('#ffffff').fill();

      // Blue Header
      doc.rect(0, 0, W, 70).fillColor('#026cdf').fill();

      // Brand
      doc.fillColor('#ffffff')
         .font('Helvetica-BoldOblique')
         .fontSize(30)
         .text('Ticketmaster', 40, 25);

      // Status
      const statusLabel = (status || 'Active').toUpperCase();
      doc.roundedRect(W - 130, 20, 90, 28, 5).fillColor('#ffffff').fill();
      doc.fillColor('#026cdf')
         .font('Helvetica-Bold')
         .fontSize(12)
         .text(statusLabel, W - 130, 28, { width: 90, align: 'center' });

      // Fetch Event Image
      let imgBuffer = null;
      if (eventImage) {
        imgBuffer = await fetchImageBuffer(eventImage);
      }

      // Ticket Image (Left side)
      if (imgBuffer) {
        try {
          doc.image(imgBuffer, 40, 100, { width: 212, height: 212 });
        } catch (e) {
          console.error('Failed to draw image in PDF:', e);
          doc.rect(40, 100, 212, 212).fillColor('#f0f0f0').fill();
          doc.fillColor('#969696').font('Helvetica').fontSize(14).text('Ticket Image', 40, 190, { width: 212, align: 'center' });
        }
      } else {
        doc.rect(40, 100, 212, 212).fillColor('#f0f0f0').fill();
        doc.fillColor('#969696').font('Helvetica').fontSize(14).text('Ticket Image', 40, 190, { width: 212, align: 'center' });
      }

      // Event Title
      doc.fillColor('#141414')
         .font('Helvetica-Bold')
         .fontSize(24)
         .text((eventTitle || 'Event').toUpperCase(), 280, 115, { width: 270 });

      // Ticket Type
      doc.fillColor('#646464')
         .font('Helvetica')
         .fontSize(14)
         .text(ticketType || parsed.type || 'Standard Ticket', 280, 145);

      // Seats Box
      doc.roundedRect(280, 175, 270, 85, 8).fillColor('#f8f8f8').fill();
      doc.roundedRect(280, 175, 270, 85, 8).lineWidth(1).strokeColor('#dcdcdc').stroke();

      doc.fillColor('#828282').font('Helvetica').fontSize(10);
      doc.text('SECTION', 310, 195);
      doc.text('ROW', 420, 195);
      doc.text('SEAT', 495, 195);

      doc.fillColor('#141414').font('Helvetica-Bold').fontSize(22);
      doc.text(parsed.section, 310, 220);
      doc.text(String(parsed.row), 420, 220);
      doc.text(String(parsed.seat), 495, 220);

      // Order Details
      doc.fillColor('#828282').font('Helvetica').fontSize(10);
      doc.text('ORDER ID', 280, 290);
      doc.text('TOTAL PAID', 420, 290);

      doc.fillColor('#141414').font('Helvetica-Bold').fontSize(16);
      doc.text(String(orderNumber || ticketId), 280, 315, { width: 130 });
      doc.text(`${currency || '$'}${totalPrice || ''}`, 420, 315);

      // QR Code
      const rawQrData = `TICKET:${ticketId}`;
      const qrDataUrl = await QRCode.toDataURL(rawQrData, { width: 200, margin: 1 });
      const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, 40, 325, { width: 70, height: 70 });

      doc.fillColor('#026cdf').font('Helvetica-Bold').fontSize(10);
      doc.text('SCAN AT ENTRANCE', 120, 360);

      // Footer
      doc.rect(0, H - 34, W, 34).fillColor('#fafafa').fill();
      doc.fillColor('#969696')
         .font('Helvetica')
         .fontSize(10)
         .text('© 2026 Ticketmaster — Valid for one entry only. Present this ticket at the venue.', 0, H - 22, { align: 'center', width: W });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateTicketPDF };

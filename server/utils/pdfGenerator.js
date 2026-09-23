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

      // ── Background ────────────────────────────────────
      doc.rect(0, 0, W, H).fillColor('#ffffff').fill();

      // ── Subtle diagonal watermark pattern ─────────────
      doc.save();
      doc.opacity(0.04);
      doc.fillColor('#026cdf').font('Helvetica-Bold').fontSize(11);
      for (let wy = -20; wy < H + 40; wy += 55) {
        for (let wx = -60; wx < W + 80; wx += 160) {
          doc.save();
          doc.translate(wx, wy);
          doc.rotate(-30, { origin: [0, 0] });
          doc.text('TICKETMASTER', 0, 0);
          doc.restore();
        }
      }
      doc.restore();

      // ── Blue Header ───────────────────────────────────
      doc.rect(0, 0, W, 65).fillColor('#026cdf').fill();
      // Premium accent stripe below header
      doc.rect(0, 65, W, 3).fillColor('#0055bb').fill();
      doc.rect(0, 68, W, 1).fillColor('#004499').fill();

      // Brand
      doc.fillColor('#ffffff')
         .font('Helvetica-BoldOblique')
         .fontSize(28)
         .text('Ticketmaster', 40, 20);

      // Status badge
      const statusLabel = (status || 'Active').toUpperCase();
      doc.roundedRect(W - 120, 17, 85, 26, 5).fillColor('#ffffff').fill();
      doc.fillColor('#026cdf')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text(statusLabel, W - 120, 24, { width: 85, align: 'center' });

      // ── Fetch Event Image ─────────────────────────────
      let imgBuffer = null;
      if (eventImage) {
        imgBuffer = await fetchImageBuffer(eventImage);
      }

      // ── Left column: Event Image (smaller, fits neatly) ──
      const imgX = 30, imgY = 80, imgW = 185, imgH = 185;
      if (imgBuffer) {
        try {
          doc.image(imgBuffer, imgX, imgY, { width: imgW, height: imgH });
        } catch (e) {
          console.error('Failed to draw image in PDF:', e);
          doc.rect(imgX, imgY, imgW, imgH).fillColor('#f0f0f0').fill();
          doc.fillColor('#969696').font('Helvetica').fontSize(12)
             .text('Ticket Image', imgX, imgY + imgH / 2 - 8, { width: imgW, align: 'center' });
        }
      } else {
        doc.rect(imgX, imgY, imgW, imgH).fillColor('#f0f0f0').fill();
        doc.fillColor('#969696').font('Helvetica').fontSize(12)
           .text('Ticket Image', imgX, imgY + imgH / 2 - 8, { width: imgW, align: 'center' });
      }

      // ── Right column: Event info ───────────────────────
      const rx = 248; // right-column x start
      const rw = W - rx - 20; // right-column width

      // Event Title
      const titleText = (eventTitle || 'Event').toUpperCase();
      doc.fillColor('#141414')
         .font('Helvetica-Bold')
         .fontSize(18);
      doc.text(titleText, rx, 85, { width: rw });

      // Dynamically place ticket type below the title
      const titleHeight = doc.heightOfString(titleText, { width: rw, fontSize: 18 });
      const typeY = 85 + titleHeight + 8;

      doc.fillColor('#646464')
         .font('Helvetica')
         .fontSize(12)
         .text(ticketType || parsed.type || 'Standard Ticket', rx, typeY);

      // ── Seats Box ─────────────────────────────────────
      const boxY = typeY + 24;
      const boxH = 78;
      doc.roundedRect(rx, boxY, rw, boxH, 8).fillColor('#f8f8f8').fill();
      doc.roundedRect(rx, boxY, rw, boxH, 8).lineWidth(1).strokeColor('#dcdcdc').stroke();

      // Column positions inside the box
      const col1 = rx + 28, col2 = rx + rw * 0.40, col3 = rx + rw * 0.68;

      doc.fillColor('#828282').font('Helvetica').fontSize(9);
      doc.text('SECTION', col1, boxY + 16);
      doc.text('ROW',     col2, boxY + 16);
      doc.text('SEAT',    col3, boxY + 16);

      doc.fillColor('#141414').font('Helvetica-Bold').fontSize(18);
      doc.text(parsed.section,       col1, boxY + 36, { width: col2 - col1 - 4 });
      doc.text(String(parsed.row),   col2, boxY + 36, { width: col3 - col2 - 4 });
      doc.text(String(parsed.seat),  col3, boxY + 36, { width: rw - (col3 - rx) });

      // ── Order Details ─────────────────────────────────
      const orderY = boxY + boxH + 18;
      doc.fillColor('#828282').font('Helvetica').fontSize(9);
      doc.text('ORDER ID',   rx,           orderY);
      doc.text('TOTAL PAID', rx + rw * 0.46, orderY);

      doc.fillColor('#141414').font('Helvetica-Bold').fontSize(15);
      doc.text(String(orderNumber || ticketId), rx, orderY + 18, { width: rw * 0.42 });
      doc.text(`${currency || '$'}${totalPrice || ''}`, rx + rw * 0.46, orderY + 18);

      // ── QR Code ───────────────────────────────────────
      const qrSize = 88;
      const qrX = 30;
      const qrY = imgY + imgH + 12; // just below the image
      const rawQrData = `TICKET:${ticketId}`;
      const qrDataUrl = await QRCode.toDataURL(rawQrData, { width: 220, margin: 1 });
      const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      doc.fillColor('#026cdf').font('Helvetica-Bold').fontSize(9);
      doc.text('SCAN AT ENTRANCE', qrX + qrSize + 10, qrY + (qrSize / 2) - 6);

      // ── Footer ────────────────────────────────────────
      doc.rect(0, H - 32, W, 32).fillColor('#fafafa').fill();
      doc.fillColor('#969696')
         .font('Helvetica')
         .fontSize(9)
         .text('\u00a9 2026 Ticketmaster \u2014 Valid for one entry only. Present this ticket at the venue.', 0, H - 20, { align: 'center', width: W });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateTicketPDF };

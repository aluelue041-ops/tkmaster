const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function fetchImageBuffer(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. Base64 Data URL (e.g. data:image/png;base64,...)
  if (trimmed.startsWith('data:image/')) {
    try {
      const base64Data = trimmed.split(',')[1];
      if (base64Data) return Buffer.from(base64Data, 'base64');
    } catch (e) {
      console.error('Error parsing base64 image for PDF:', e.message);
    }
  }

  // 2. Local File System Path (e.g. /images/benson_boone.png or public/images/...)
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    try {
      const clean = trimmed.replace(/^\/?(public\/)?/, '');
      const candidates = [
        path.resolve(process.cwd(), 'public', clean),
        path.resolve(__dirname, '../../public', clean),
        path.resolve(__dirname, '../public', clean),
        path.resolve(__dirname, clean)
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          return fs.readFileSync(p);
        }
      }
    } catch (e) {
      console.error('Error loading local image for PDF:', e.message);
    }
  }

  // 3. Remote URL (Cloudinary, Unsplash, external CDN)
  try {
    let fetchUrl = trimmed;
    // PDFKit only parses JPEG/PNG; request JPEG from Cloudinary instead of WebP
    if (fetchUrl.includes('cloudinary.com')) {
      fetchUrl = fetchUrl
        .replace(/\/f_auto\//, '/f_jpg/')
        .replace(/\.webp($|\?)/, '.jpg$1');
    }

    const res = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.error(`Error fetching remote image for PDF: HTTP ${res.status}`);
      return null;
    }
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
          doc.image(imgBuffer, imgX, imgY, { fit: [imgW, imgH], align: 'center', valign: 'center' });
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

      // Column positions inside the box: give SECTION generous width (58%)
      const col1 = rx + 20;
      const col2 = rx + rw * 0.58;
      const col3 = rx + rw * 0.79;
      const secColWidth = col2 - col1 - 8;

      // Parse section into main category (e.g. "CAT 1") and optional sub-detail (e.g. "(Inner Floor PA/PB/PC/PD)")
      let mainSec = (parsed.section || '-').trim();
      let subSec = '';
      const parenMatch = mainSec.match(/^(.*?)\s*(\(.*?\))\s*$/);
      if (parenMatch) {
        mainSec = parenMatch[1].trim();
        subSec = parenMatch[2].trim();
      }

      // Determine main font size based on text length
      let mainFontSize = 17;
      if (mainSec.length > 20) mainFontSize = 11;
      else if (mainSec.length > 14) mainFontSize = 13;
      else if (mainSec.length > 9) mainFontSize = 15;

      doc.font('Helvetica-Bold').fontSize(mainFontSize);
      const mainHeight = doc.heightOfString(mainSec, { width: secColWidth });

      let subHeight = 0;
      if (subSec) {
        doc.font('Helvetica').fontSize(8.5);
        subHeight = doc.heightOfString(subSec, { width: secColWidth }) + 2;
      }
      const totalSecHeight = mainHeight + subHeight;
      const boxH = Math.max(78, 34 + totalSecHeight + 12);

      doc.roundedRect(rx, boxY, rw, boxH, 8).fillColor('#f8f8f8').fill();
      doc.roundedRect(rx, boxY, rw, boxH, 8).lineWidth(1).strokeColor('#dcdcdc').stroke();

      // Labels
      doc.fillColor('#828282').font('Helvetica').fontSize(9);
      doc.text('SECTION', col1, boxY + 14);
      doc.text('ROW',     col2, boxY + 14);
      doc.text('SEAT',    col3, boxY + 14);

      // Section values: main category in bold, detail subtitle underneath in neat smaller font
      doc.fillColor('#141414').font('Helvetica-Bold').fontSize(mainFontSize);
      doc.text(mainSec, col1, boxY + 32, { width: secColWidth });
      if (subSec) {
        doc.fillColor('#555555').font('Helvetica').fontSize(8.5);
        doc.text(subSec, col1, boxY + 32 + mainHeight + 2, { width: secColWidth });
      }

      // Row and Seat values
      doc.fillColor('#141414').font('Helvetica-Bold').fontSize(17);
      doc.text(String(parsed.row),  col2, boxY + 32, { width: col3 - col2 - 6 });
      doc.text(String(parsed.seat), col3, boxY + 32, { width: rw - (col3 - rx) - 6 });

      // ── Order Details (positioned safely below dynamic box) ──
      const orderY = boxY + boxH + 16;
      doc.fillColor('#828282').font('Helvetica').fontSize(9);
      doc.text('ORDER ID',   rx,           orderY);
      doc.text('TOTAL PAID', rx + rw * 0.46, orderY);

      doc.fillColor('#141414').font('Helvetica-Bold').fontSize(15);
      doc.text(String(orderNumber || ticketId), rx, orderY + 16, { width: rw * 0.42 });
      doc.text(`${currency || '$'}${totalPrice || ''}`, rx + rw * 0.46, orderY + 16);

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
         .text('(c) 2026 Ticketmaster - Valid for one entry only. Present this ticket at the venue.', 0, H - 20, { align: 'center', width: W });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateTicketPDF };

const fs = require('fs');
let code = fs.readFileSync('src/pages/MyTickets.jsx', 'utf8');

const downloadAllLogic = `                onClick={async () => {
                  toast.info('Generating your tickets... Please wait.');
                  try {
                    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
                    const W = 210;
                    const H = 148;

                    const fetchBase64 = async (url) => {
                      if (!url) return null;
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
                      return await loadImg('https://api.allorigins.win/raw?url=' + encodeURIComponent(jpgUrl));
                    };

                    const imgData = await fetchBase64(image);

                    for (let i = 0; i < selectedOrder.seats.length; i++) {
                      if (i > 0) doc.addPage();
                      
                      const seatStr = selectedOrder.seats[i];
                      const parsed = parseSeat(seatStr);
                      const tId = selectedOrder._id;
                      const oNum = generateOrderStr(tId, eventMeta?.location, selectedOrder.orderNumber);

                      // Background
                      doc.setFillColor(255, 255, 255);
                      doc.rect(0, 0, W, H, 'F');

                      // Blue Header
                      doc.setFillColor(2, 108, 223);
                      doc.rect(0, 0, W, 25, 'F');
                      
                      // Brand
                      doc.setFont('helvetica', 'bolditalic');
                      doc.setFontSize(22);
                      doc.setTextColor(255, 255, 255);
                      doc.text('Ticketmaster', 14, 17);
                      
                      // Status
                      const statusLabel = (selectedOrder.status || 'Active').toUpperCase();
                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(8);
                      doc.setFillColor(255, 255, 255);
                      doc.roundedRect(W - 46, 7.5, 32, 10, 2, 2, 'F');
                      doc.setTextColor(2, 108, 223);
                      doc.text(statusLabel, W - 30, 14, { align: 'center' });

                      // Ticket Image
                      if (imgData) {
                        doc.addImage(imgData, 'JPEG', 14, 30, 58, 58);
                      } else {
                        doc.setFillColor(240, 240, 240);
                        doc.rect(14, 30, 58, 58, 'F');
                        doc.setFontSize(10);
                        doc.setTextColor(150, 150, 150);
                        doc.text('Ticket Image', 43, 58, { align: 'center' });
                      }

                      // Event Title
                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(13);
                      doc.setTextColor(20, 20, 20);
                      const title = (selectedOrder.eventTitle || 'Event').toUpperCase();
                      const titleLines = doc.splitTextToSize(title, 92);
                      doc.text(titleLines, 96, 34);
                      const titleEndY = 34 + titleLines.length * 6;

                      // Ticket Type
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(9);
                      doc.setTextColor(100, 100, 100);
                      doc.text(selectedOrder.ticketType || parsed.type || 'Standard Ticket', 96, titleEndY + 5);
                      const typeEndY = titleEndY + 14;

                      // Seats Box
                      const boxY = Math.max(typeEndY, 56);
                      doc.setFillColor(248, 248, 248);
                      doc.setDrawColor(220, 220, 220);
                      doc.roundedRect(96, boxY, 99, 28, 3, 3, 'FD');
                      
                      doc.setFontSize(7);
                      doc.setTextColor(130, 130, 130);
                      doc.text('SECTION', 104, boxY + 9);
                      doc.text('ROW', 148, boxY + 9);
                      doc.text('SEAT', 173, boxY + 9);

                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(12);
                      doc.setTextColor(20, 20, 20);
                      doc.text(parsed.section, 104, boxY + 20, { maxWidth: 40 });
                      doc.text(String(parsed.row), 148, boxY + 20);
                      doc.text(String(parsed.seat), 173, boxY + 20);

                      // Order Details
                      const orderLabelY = boxY + 36;
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(7);
                      doc.setTextColor(130, 130, 130);
                      doc.text('ORDER ID', 96, orderLabelY);
                      doc.text('TOTAL PAID', 148, orderLabelY);

                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(11);
                      doc.setTextColor(20, 20, 20);
                      doc.text(String(oNum), 96, orderLabelY + 9, { maxWidth: 48 });
                      doc.text(\`\${selectedOrder.currency || '$'}\${selectedOrder.totalPrice || ''}\`, 148, orderLabelY + 9);

                      // QR Code
                      const rawQrData = \`TICKET:\${tId}\`;
                      const qrDataUrl = await QRCode.toDataURL(rawQrData, { width: 250, margin: 1 });
                      const qrY = 95;
                      doc.addImage(qrDataUrl, 'PNG', 14, qrY, 32, 32);

                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(7);
                      doc.setTextColor(2, 108, 223);
                      doc.text('SCAN AT ENTRANCE', 14, qrY + 36, { maxWidth: 32, align: 'center' });
                      
                      doc.setFillColor(250, 250, 250);
                      doc.rect(0, H - 12, W, 12, 'F');
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(7);
                      doc.setTextColor(150, 150, 150);
                      doc.text('(c) 2026 Ticketmaster - Valid for one entry only. Present this ticket at the venue.', W / 2, H - 4, { align: 'center' });
                    }
                    
                    doc.save(\`order-\${selectedOrder.orderNumber || selectedOrder._id}.pdf\`);
                    toast.success('Tickets downloaded successfully!');
                  } catch (e) {
                    console.error('PDF gen err', e);
                    toast.error('Failed to generate tickets. Please try again.');
                  }
                }}`;

const oldLogicRegex = /onClick=\{\s*async\s*\(\)\s*=>\s*\{\s*toast\.info\([^;]+\);\s*for\s*\([^\{]+\{\s*[^}]+\}\s*const\s*btn[^}]+\}\s*\}\s*\}/s;
if (oldLogicRegex.test(code)) {
  code = code.replace(oldLogicRegex, downloadAllLogic);
  fs.writeFileSync('src/pages/MyTickets.jsx', code, 'utf8');
  console.log('Successfully updated Download All logic');
} else {
  console.error('Could not find old Download All logic');
}

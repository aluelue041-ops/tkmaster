require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const QRCode = require('qrcode');

const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Event = require('./models/Event');

// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ticketsmaster.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ticketsmaster.app';

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer — store upload in memory, then stream to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Email Helpers
async function sendWelcomeEmail(toEmail) {
  try {
    await sgMail.send({
      to: toEmail,
      from: FROM_EMAIL,
      subject: 'Welcome to ticketsmaster! 🎟️',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;border-radius:12px;overflow:hidden">
          <div style="background:#026cdf;padding:32px;text-align:center">
            <h1 style="color:white;font-style:italic;margin:0;font-size:32px">ticketsmaster</h1>
          </div>
          <div style="padding:32px">
            <h2 style="color:#1a1a1a">Welcome aboard! 🎉</h2>
            <p style="color:#555;line-height:1.6">Your account has been created successfully. Start discovering and booking tickets for the best live events near you.</p>
            <a href="https://tkmaster.onrender.com" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#026cdf;color:white;border-radius:8px;text-decoration:none;font-weight:bold">Browse Events</a>
          </div>
          <div style="padding:16px 32px;background:#eee;font-size:12px;color:#999;text-align:center">
            &copy; 2026 ticketsmaster. All rights reserved.
          </div>
        </div>
      `
    });
  } catch (err) {
    console.error('SendGrid welcome email error:', err.response?.body || err.message);
  }
}

async function sendBookingConfirmationEmail(toEmail, ticket) {
  try {
    const qrData = `TICKET:${ticket._id}`;
    const qrImageBase64 = await QRCode.toDataURL(qrData);
    const base64Data = qrImageBase64.split(',')[1];
    
    const seatsList = ticket.seats.map(s => `<li style="margin:4px 0">${s}</li>`).join('');
    await sgMail.send({
      to: toEmail,
      from: FROM_EMAIL,
      subject: `Booking Confirmed: ${ticket.eventTitle} 🎟️`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;border-radius:12px;overflow:hidden">
          <div style="background:#026cdf;padding:32px;text-align:center">
            <h1 style="color:white;font-style:italic;margin:0;font-size:32px">ticketsmaster</h1>
          </div>
          <div style="padding:32px;background:white">
            <h2 style="color:#1a1a1a;margin-top:0">Booking Confirmed! ✅</h2>
            <p style="color:#555">Here are your booking details:</p>
            <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e5e5e5">
              <p style="margin:0 0 8px"><strong>Event:</strong> ${ticket.eventTitle}</p>
              <p style="margin:0 0 8px"><strong>Total Paid:</strong> <span style="color:#026cdf;font-size:18px">${ticket.currency || '$'}${ticket.totalPrice}</span></p>
              <p style="margin:0 0 8px"><strong>Seats:</strong></p>
              <ul style="margin:0;padding-left:20px;color:#333">${seatsList}</ul>
            </div>
            <div style="background:#f8f8f8;padding:24px;border-radius:16px;margin:24px 0;border:1px solid #eee;text-align:center">
              <p style="font-size:12px;color:#888;font-weight:bold;margin:0 0 12px;letter-spacing:1px;">YOUR TICKET QR CODE</p>
              <img src="cid:ticket-qr" alt="Ticket QR Code" style="width:200px;height:200px;display:block;margin:0 auto;" />
              <p style="font-size:12px;color:#888;margin:12px 0 0">Show this QR at the entrance</p>
            </div>
            <p style="color:#888;font-size:13px">Booking ID: <code>${ticket._id}</code></p>
          </div>
          <div style="padding:16px 32px;background:#eee;font-size:12px;color:#999;text-align:center">
            &copy; 2026 ticketsmaster. All rights reserved.
          </div>
        </div>
      `,
      attachments: [{
        content: base64Data,
        filename: 'qrcode.png',
        type: 'image/png',
        disposition: 'inline',
        content_id: 'ticket-qr'
      }]
    });
  } catch (err) {
    console.error('SendGrid booking email error:', err.response?.body || err.message);
  }
}

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access denied' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// --- ROUTES ---

// 1. Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    user = new User({ email, password });
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send welcome email
    sendWelcomeEmail(email);

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Get User Profile
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Book Tickets
app.post('/api/tickets/book', authMiddleware, async (req, res) => {
  try {
    const { eventId, eventTitle, seats, totalPrice, currency } = req.body;
    const newTicket = new Ticket({
      user: req.user.id,
      eventId,
      eventTitle,
      seats,
      totalPrice,
      currency: currency || '$',
      status: 'Active'
    });

    await newTicket.save();

    // Mark seats as booked on the event document for real-time availability
    if (eventId && eventId !== 'trending') {
      try {
        await Event.findByIdAndUpdate(eventId, {
          $push: { bookedSeats: { $each: seats } }
        });
      } catch (e) { console.error('Seat tracking error:', e.message); }
    }

    // Send booking confirmation email with QR code
    const user = await User.findById(req.user.id).select('email');
    if (user) sendBookingConfirmationEmail(user.email, newTicket);

    res.json(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Get User Tickets
app.get('/api/tickets/my-tickets', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id }).sort({ purchaseDate: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5b. Transfer Own Ticket (Client)
app.put('/api/tickets/:id/transfer-to', authMiddleware, async (req, res) => {
  try {
    const { newEmail, name, phone, quantity, note, selectedSeat } = req.body;
    const ticket = await Ticket.findById(req.params.id).populate('user', 'email');
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Only the ticket owner can transfer
    if (ticket.user && ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this ticket' });
    }

    const senderEmail = ticket.user ? ticket.user.email : 'A user';
    let newUser = await User.findOne({ email: newEmail });

    let numToTransfer = parseInt(quantity) || 1;
    if (numToTransfer > ticket.seats.length) numToTransfer = ticket.seats.length;

    let transferredSeats = [];
    if (numToTransfer === ticket.seats.length) {
      // Transfer the entire ticket
      transferredSeats = [...ticket.seats];
      if (newUser) {
        ticket.user = newUser._id;
        ticket.guestEmail = undefined;
        ticket.guestName = undefined;
      } else {
        ticket.user = null; // Remove ownership from original user
        ticket.guestEmail = newEmail;
        ticket.guestName = name;
      }
      ticket.status = 'Transferred';
      await ticket.save();
    } else {
      // Partial transfer: split the ticket
      let seatsCopy = [...ticket.seats];
      let selIdx = seatsCopy.indexOf(selectedSeat);
      if (selIdx !== -1) {
        transferredSeats.push(seatsCopy.splice(selIdx, 1)[0]);
      }
      while (transferredSeats.length < numToTransfer && seatsCopy.length > 0) {
        transferredSeats.push(seatsCopy.shift());
      }
      
      const unitPrice = ticket.totalPrice / ticket.seats.length;
      const transferredPrice = unitPrice * transferredSeats.length;
      
      // Update original ticket
      ticket.seats = seatsCopy;
      ticket.totalPrice = ticket.totalPrice - transferredPrice;
      await ticket.save();
      
      // Create new ticket for recipient
      const newTicket = new Ticket({
        user: newUser ? newUser._id : null,
        guestEmail: newUser ? undefined : newEmail,
        guestName: newUser ? undefined : name,
        eventId: ticket.eventId,
        eventTitle: ticket.eventTitle,
        seats: transferredSeats,
        totalPrice: transferredPrice,
        currency: ticket.currency,
        status: 'Transferred'
      });
      await newTicket.save();
    }

    // Send email notification to recipient with QR code
    try {
      const seatString = transferredSeats.length > 0 ? transferredSeats.join(', ') : 'General Admission';
      const qrData = `TICKET:${ticket._id}`;
      const qrImageBase64 = await QRCode.toDataURL(qrData);
      const base64Data = qrImageBase64.split(',')[1];

      const noteHtml = note ? `<div style="background:#fff3cd;padding:16px;border-radius:8px;margin:16px 0;border:1px solid #ffeeba"><p style="margin:0;color:#856404;font-size:14px"><strong>Note from sender:</strong><br/>${note}</p></div>` : '';

      let emailHtml = `<div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;border:1px solid #eaeaea;border-radius:12px;overflow:hidden;">
        <div style="background:#026cdf;padding:24px;text-align:center"><h1 style="color:white;font-style:italic;margin:0">ticketsmaster</h1></div>
        <div style="padding:32px 24px;background:white;text-align:center;">
          <h2 style="margin-top:0;">Hi ${name || 'there'}, you've received ${transferredSeats.length} ticket(s)! 🎟️</h2>
          <p style="color:#555;font-size:16px;"><strong>${senderEmail}</strong> has transferred their ticket(s) for <strong>${ticket.eventTitle}</strong> to you.</p>
          ${noteHtml}
          
          <div style="background:#f8f8f8;padding:24px;border-radius:16px;margin:32px 0;border:1px solid #eee;display:inline-block;">
            <p style="font-size:12px;color:#888;font-weight:bold;margin:0 0 12px;letter-spacing:1px;">YOUR OFFICIAL TICKET</p>
            <img src="cid:ticket-qr" alt="Ticket QR Code" style="width:200px;height:200px;display:block;margin:0 auto;" />
            <p style="font-size:13px;color:#333;margin:16px 0 0;font-weight:600;">Seats: ${seatString}</p>
          </div>

          <p style="color:#666;font-size:14px;line-height:1.5;">Show this QR code at the entrance to verify your ticket.<br/>You don't need to create an account to use this ticket!</p>
        </div>
      </div>`;

      await sgMail.send({
        to: newEmail,
        from: FROM_EMAIL,
        subject: `🎟️ You received ${transferredSeats.length} ticket(s) for ${ticket.eventTitle}!`,
        html: emailHtml,
        attachments: [{
          content: base64Data,
          filename: 'qrcode.png',
          type: 'image/png',
          disposition: 'inline',
          content_id: 'ticket-qr'
        }]
      });
    } catch(e) {
      console.error('Email error during transfer:', e.message);
    }

    if (newUser) {
      io.to(newUser._id.toString()).emit('ticket_received', { message: `You received ${transferredSeats.length} ticket(s) for ${ticket.eventTitle} from ${senderEmail}!` });
    }

    res.json({ success: true, transferredTo: newEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5c. Sell Ticket (Client)
app.put('/api/tickets/:id/sell', authMiddleware, async (req, res) => {
  try {
    const { quantity, resalePrice, selectedSeat } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (ticket.user && ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this ticket' });
    }

    let numToSell = parseInt(quantity) || 1;
    if (numToSell > ticket.seats.length) numToSell = ticket.seats.length;

    let soldSeats = [];
    if (numToSell === ticket.seats.length) {
      // Sell the entire ticket
      ticket.status = 'For Sale';
      ticket.resalePrice = resalePrice;
      await ticket.save();
    } else {
      // Partial sell: split the ticket
      let seatsCopy = [...ticket.seats];
      let selIdx = seatsCopy.indexOf(selectedSeat);
      if (selIdx !== -1) {
        soldSeats.push(seatsCopy.splice(selIdx, 1)[0]);
      }
      while (soldSeats.length < numToSell && seatsCopy.length > 0) {
        soldSeats.push(seatsCopy.shift());
      }
      
      const unitPrice = ticket.totalPrice / ticket.seats.length;
      const soldPrice = unitPrice * soldSeats.length;
      
      // Update original ticket
      ticket.seats = seatsCopy;
      ticket.totalPrice = ticket.totalPrice - soldPrice;
      await ticket.save();
      
      // Create new ticket for sale
      const newTicket = new Ticket({
        user: ticket.user,
        eventId: ticket.eventId,
        eventTitle: ticket.eventTitle,
        seats: soldSeats,
        totalPrice: soldPrice,
        currency: ticket.currency,
        status: 'For Sale',
        resalePrice: resalePrice
      });
      await newTicket.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5d. Buy Resale Ticket (Client)
app.post('/api/tickets/:id/buy-resale', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('user', 'email');
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.status !== 'For Sale') return res.status(400).json({ error: 'Ticket is not for sale' });
    
    const sellerId = ticket.user ? ticket.user._id.toString() : null;
    
    ticket.user = req.user.id;
    ticket.status = 'Active';
    ticket.totalPrice = ticket.resalePrice * ticket.seats.length;
    ticket.resalePrice = undefined;
    await ticket.save();

    // Notify seller
    if (sellerId) {
      io.to(sellerId).emit('ticket_sold', { message: `Your resale ticket for ${ticket.eventTitle} has been sold!` });
    }
    // Notify buyer
    io.to(req.user.id).emit('ticket_bought', { message: `You successfully bought a resale ticket for ${ticket.eventTitle}!` });

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- ADMIN & EVENT ROUTES ---

// Upload image to Cloudinary
app.post('/api/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    // Stream buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'ticketsmaster/events', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// 6. Get All Events (Public) - excludes expired events
app.get('/api/events', async (req, res) => {
  try {
    const now = new Date();
    // Fetch all events, filter out those with a real eventDate in the past
    const events = await Event.find().sort({ createdAt: -1 });
    const active = events.filter(ev => {
      if (ev.eventDate && ev.eventDate < now) return false;
      return true;
    });
    res.json(active);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 6b. Get booked seats for an event
app.get('/api/events/:id/booked-seats', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('bookedSeats');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event.bookedSeats || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 6c. Get resale tickets for an event
app.get('/api/events/:id/resale-tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find({ eventId: req.params.id, status: 'For Sale' }).populate('user', 'email');
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 7. Create Event (Admin)
app.post('/api/events', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.json(newEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 8. Delete Event (Admin)
app.delete('/api/events/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 9. Get All Users (Admin)
app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 10. Get All Tickets (Admin)
app.get('/api/tickets', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('user', 'email').sort({ purchaseDate: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 11. Approve Ticket (Admin)
app.put('/api/tickets/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    ticket.status = 'Approved';
    await ticket.save();
    const updatedTicket = await Ticket.findById(ticket._id).populate('user', 'email');

    // Notify user by email
    if (updatedTicket.user?.email) {
      try {
        await sgMail.send({
          to: updatedTicket.user.email,
          from: FROM_EMAIL,
          subject: `Your ticket for "${ticket.eventTitle}" has been approved ✅`,
          html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:auto">
            <div style="background:#026cdf;padding:24px;text-align:center"><h1 style="color:white;font-style:italic;margin:0">ticketsmaster</h1></div>
            <div style="padding:24px">
              <h2>Your booking is approved! 🎉</h2>
              <p>Your ticket(s) for <strong>${ticket.eventTitle}</strong> have been approved by the admin.</p>
              <p>You can view your tickets in the app under <strong>My Tickets</strong>.</p>
            </div>
          </div>`
        });
      } catch(e) { console.error('Email error:', e.message); }
    }

    if (updatedTicket.user) {
      io.to(updatedTicket.user._id.toString()).emit('ticket_approved', { message: `Your ticket for ${ticket.eventTitle} has been approved!` });
    }

    res.json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 11b. Reject Ticket (Admin)
app.put('/api/tickets/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    ticket.status = 'Rejected';
    await ticket.save();
    const updatedTicket = await Ticket.findById(ticket._id).populate('user', 'email');

    // Notify user by email
    if (updatedTicket.user?.email) {
      try {
        await sgMail.send({
          to: updatedTicket.user.email,
          from: FROM_EMAIL,
          subject: `Your ticket for "${ticket.eventTitle}" was not approved ❌`,
          html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:auto">
            <div style="background:#026cdf;padding:24px;text-align:center"><h1 style="color:white;font-style:italic;margin:0">ticketsmaster</h1></div>
            <div style="padding:24px">
              <h2>Booking Update</h2>
              <p>Unfortunately, your booking for <strong>${ticket.eventTitle}</strong> could not be approved at this time.</p>
              <p>Please contact support or try booking again.</p>
            </div>
          </div>`
        });
      } catch(e) { console.error('Email error:', e.message); }
    }

    if (updatedTicket.user) {
      io.to(updatedTicket.user._id.toString()).emit('ticket_rejected', { message: `Your ticket for ${ticket.eventTitle} has been rejected.` });
    }

    res.json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 12. Transfer Ticket (Admin)
app.put('/api/tickets/:id/transfer', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { newEmail } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const newUser = await User.findOne({ email: newEmail });
    if (!newUser) return res.status(404).json({ error: 'User with that email does not exist' });

    ticket.user = newUser._id;
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id).populate('user', 'email');
    res.json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

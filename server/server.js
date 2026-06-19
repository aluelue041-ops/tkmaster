require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Event = require('./models/Event');

// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ticketsmaster.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ticketsmaster.app';

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
          <div style="padding:32px">
            <h2 style="color:#1a1a1a">Booking Confirmed! ✅</h2>
            <p style="color:#555">Here are your booking details:</p>
            <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e5e5e5">
              <p style="margin:0 0 8px"><strong>Event:</strong> ${ticket.eventTitle}</p>
              <p style="margin:0 0 8px"><strong>Seats:</strong></p>
              <ul style="margin:0;padding-left:20px;color:#333">${seatsList}</ul>
              <p style="margin:12px 0 0"><strong>Total Paid:</strong> <span style="color:#026cdf;font-size:18px">$${ticket.totalPrice}</span></p>
            </div>
            <p style="color:#888;font-size:13px">Your booking ID: <code>${ticket._id}</code></p>
          </div>
          <div style="padding:16px 32px;background:#eee;font-size:12px;color:#999;text-align:center">
            &copy; 2026 ticketsmaster. All rights reserved.
          </div>
        </div>
      `
    });
  } catch (err) {
    console.error('SendGrid booking email error:', err.response?.body || err.message);
  }
}

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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
    const { eventId, eventTitle, seats, totalPrice } = req.body;
    const newTicket = new Ticket({
      user: req.user.id,
      eventId,
      eventTitle,
      seats,
      totalPrice
    });

    await newTicket.save();

    // Send booking confirmation email
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

// --- ADMIN & EVENT ROUTES ---

// 6. Get All Events (Public)
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
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
    
    // Optionally re-populate user email to send back
    const updatedTicket = await Ticket.findById(ticket._id).populate('user', 'email');
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

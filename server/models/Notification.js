const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: { type: String, enum: ['new_event', 'ticket_approved', 'ticket_rejected', 'general'], default: 'general' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  eventId: { type: String, default: null },
  eventImage: { type: String, default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);

const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  guestEmail: { type: String },
  guestName: { type: String },
  eventId: { type: String, required: true },
  eventTitle: { type: String, required: true },
  seats: [String],
  totalPrice: { type: Number, required: true },
  currency: { type: String, default: '$' },
  purchaseDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Active', 'Transferred', 'Expired', 'Pending', 'Approved', 'Rejected', 'For Sale'],
    default: 'Active'
  },
  resalePrice: { type: Number },
  ticketType: { type: String }
});

module.exports = mongoose.model('Ticket', TicketSchema);

const mongoose = require('mongoose');

const FailedEmailSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['welcome', 'booking', 'reset', 'transfer', 'approved', 'rejected'],
    required: true
  },
  to: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} }, // data needed to rebuild the email
  retries: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'sent', 'dead'],
    default: 'pending'
  },
  lastError: { type: String },
  nextRetryAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FailedEmail', FailedEmailSchema);

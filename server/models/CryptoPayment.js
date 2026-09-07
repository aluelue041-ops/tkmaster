const mongoose = require('mongoose');

const CryptoPaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  plan: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    enum: ['USDT', 'BTC'],
    default: 'USDT'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CryptoPayment', CryptoPaymentSchema);

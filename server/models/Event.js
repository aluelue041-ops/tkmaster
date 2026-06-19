const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  currency: { type: String, default: '$' },
  basePrice: { type: Number, default: 80 },
  mapLink: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);

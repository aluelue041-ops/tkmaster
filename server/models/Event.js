const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },         // display string e.g. "Fri, Sep 19 • 7:00 PM"
  eventDate: { type: Date },                       // real date for expiry filtering
  location: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  currency: { type: String, default: '$' },
  basePrice: { type: Number, default: 80 },
  mapLink: { type: String },
  bookedSeats: [{ type: String }],                 // stores "sectionId:row-seat" for real-time availability
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);

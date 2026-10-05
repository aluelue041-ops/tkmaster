const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'event_manager', 'superadmin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  subscription: {
    type: String,
    enum: ['None', 'Free', 'Basic', 'Premium', 'VIP'],
    default: 'Free'
  },
  subscriptionExpiresAt: {
    type: Date,
    default: null
  },
  banned: {
    type: Boolean,
    default: false
  },
  bannedReason: {
    type: String,
    default: ''
  },
  devices: [
    {
      deviceId: { type: String },        // hash of user-agent + ip
      label: { type: String },           // human-readable "Chrome on Windows"
      ip: { type: String },
      lastSeen: { type: Date, default: Date.now }
    }
  ]
});

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);

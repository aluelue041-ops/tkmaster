/**
 * One-time script to promote a user to superadmin.
 * Usage: node server/scripts/setSuperAdmin.js your@email.com
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node server/scripts/setSuperAdmin.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'superadmin' },
      { new: true }
    ).select('-password');

    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
    } else {
      console.log(`✅ ${user.email} is now a superadmin!`);
    }

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('DB connection error:', err.message);
    process.exit(1);
  });

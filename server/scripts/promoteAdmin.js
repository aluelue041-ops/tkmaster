const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://ronohb70_db_user:Sniperfx738@ticketsz.9uqegl5.mongodb.net/?appName=ticketsz';
const EMAIL = process.argv[2];

if (!EMAIL) {
  console.error('Usage: node server/scripts/promoteAdmin.js <email>');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  subscription: String,
  subscriptionExpiresAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date
});
const User = mongoose.model('User', UserSchema);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB...');
    const user = await User.findOneAndUpdate(
      { email: EMAIL },
      { role: 'superadmin' },
      { new: true }
    ).select('email role');

    if (!user) {
      console.log(`❌ No user found with email: ${EMAIL}`);
    } else {
      console.log(`✅ SUCCESS: ${user.email} is now a ${user.role}!`);
    }
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ DB error:', err.message);
    process.exit(1);
  });

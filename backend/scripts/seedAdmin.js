/**
 * Admin Seeder — Create the first admin user
 *
 * Idempotent: running it twice will NOT create duplicate admins.
 *
 * Usage:
 *   npm run seed:admin
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/mongoose/User');

const ADMIN_CONFIG = {
  phone: process.env.ADMIN_PHONE || '+919876543210',
  email: process.env.ADMIN_EMAIL || 'admin@bricks.com',
  name:  'Super Admin',
  role:  'admin',
  isVerified: true,
  isActive:   true,
};

const seed = async () => {
  console.log('\n🌱 Bricks Admin Seeder\n');
  console.log('Admin to create:', {
    phone: ADMIN_CONFIG.phone,
    email: ADMIN_CONFIG.email,
    name:  ADMIN_CONFIG.name,
  });
  console.log('\nConnecting to MongoDB...');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  try {
    const existing = await User.findOne({ phone: ADMIN_CONFIG.phone });

    if (existing) {
      console.log('⚠️  Admin already exists:');
      console.log('   ID   :', existing._id.toString());
      console.log('   Phone:', existing.phone);
      console.log('   Email:', existing.email);
      console.log('   Role :', existing.role);
      console.log('\nNo changes made. Exiting.\n');
      return;
    }

    const admin = await User.create(ADMIN_CONFIG);
    console.log('✅ Admin created successfully!');
    console.log('   ID   :', admin._id.toString());
    console.log('   Phone:', admin.phone);
    console.log('   Email:', admin.email);
    console.log('   Role :', admin.role);
    console.log('\nLogin using the phone number above to get your JWT access token.\n');
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.\n');
  }
};

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  console.error(err);
  process.exit(1);
});

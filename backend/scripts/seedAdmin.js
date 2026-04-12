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
const bcrypt = require('bcryptjs');
const User = require('../models/mongoose/User');

const ADMIN_CONFIG = {
  phone: process.env.ADMIN_PHONE || '+919876543210',
  email: process.env.ADMIN_EMAIL || 'admin@bricks.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  name:  'Super Admin',
  role:  'admin',
  isVerified: true,
  isEmailVerified: true,
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
    const existing = await User.findOne({ phone: ADMIN_CONFIG.phone }).select('+passwordHash');

    if (existing) {
      let changed = false;

      if (!existing.passwordHash) {
        existing.passwordHash = await bcrypt.hash(ADMIN_CONFIG.password, 12);
        changed = true;
      }

      if (!existing.isEmailVerified) {
        existing.isEmailVerified = true;
        existing.emailVerifiedAt = existing.emailVerifiedAt || new Date();
        changed = true;
      }

      if (!existing.isVerified) {
        existing.isVerified = true;
        changed = true;
      }

      if (existing.role !== 'admin') {
        existing.role = 'admin';
        changed = true;
      }

      if (!existing.isActive) {
        existing.isActive = true;
        changed = true;
      }

      if (changed) {
        await existing.save();
      }

      console.log('⚠️  Admin already exists:');
      console.log('   ID   :', existing._id.toString());
      console.log('   Phone:', existing.phone);
      console.log('   Email:', existing.email);
      console.log('   Role :', existing.role);
      console.log('   Password provisioned:', existing.passwordHash ? 'yes' : 'no');
      console.log('\nAdmin validated for credential login. Exiting.\n');
      return;
    }

    const admin = await User.create({
      ...ADMIN_CONFIG,
      passwordHash: await bcrypt.hash(ADMIN_CONFIG.password, 12),
      emailVerifiedAt: new Date(),
    });
    console.log('✅ Admin created successfully!');
    console.log('   ID   :', admin._id.toString());
    console.log('   Phone:', admin.phone);
    console.log('   Email:', admin.email);
    console.log('   Role :', admin.role);
    console.log('   Password:', ADMIN_CONFIG.password);
    console.log('\nLogin using email or phone + password to get your JWT access token.\n');
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

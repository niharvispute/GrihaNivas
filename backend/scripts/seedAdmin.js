/**
 * Admin Seeder — Create the first admin user
 *
 * Run this ONCE after the database is connected and models are ready.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *
 * Or add to package.json scripts:
 *   "seed:admin": "node scripts/seedAdmin.js"
 *
 * ── How to activate ──────────────────────────────────────────────────────────
 *
 * 1. Confirm your DB choice (MongoDB or PostgreSQL)
 * 2. Uncomment the relevant section below (MongoDB OR PostgreSQL — not both)
 * 3. Make sure your .env has the correct DB connection string
 * 4. Run: node scripts/seedAdmin.js
 *
 * ── Security Notes ───────────────────────────────────────────────────────────
 * - This script is idempotent: running it twice will NOT create duplicate admins.
 *   It checks if an admin with the given phone already exists before creating.
 * - Do NOT expose this script via an API route.
 * - After running, delete or restrict access to this file in production.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// ── Configure the admin to create ────────────────────────────────────────────

const ADMIN_CONFIG = {
  phone: process.env.ADMIN_PHONE || '+919876543210', // Change this!
  email: process.env.ADMIN_EMAIL || 'admin@bricks.com',
  name:  'Super Admin',
  role:  'admin',
  isVerified: true,
  isActive:   true,
};

// ── Main seeder function ──────────────────────────────────────────────────────

const seed = async () => {
  console.log('\n🌱 Bricks Admin Seeder\n');
  console.log('Admin to create:', {
    phone: ADMIN_CONFIG.phone,
    email: ADMIN_CONFIG.email,
    name:  ADMIN_CONFIG.name,
    role:  ADMIN_CONFIG.role,
  });
  console.log('\nConnecting to database...');

  // ══════════════════════════════════════════════════════════════════════════
  // OPTION A — MongoDB (Mongoose)
  // Uncomment this section if using MongoDB
  // ══════════════════════════════════════════════════════════════════════════

  /*
  const mongoose = require('mongoose');
  const User = require('../models/mongoose/User');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  try {
    const existing = await User.findOne({ phone: ADMIN_CONFIG.phone });

    if (existing) {
      console.log('⚠️  Admin already exists:');
      console.log('   Phone:', existing.phone);
      console.log('   Email:', existing.email);
      console.log('   Role :', existing.role);
      console.log('\nNo changes made. Exiting.\n');
      await mongoose.disconnect();
      process.exit(0);
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
  */

  // ══════════════════════════════════════════════════════════════════════════
  // OPTION B — PostgreSQL (Prisma)
  // Uncomment this section if using PostgreSQL
  // ══════════════════════════════════════════════════════════════════════════

  /*
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  await prisma.$connect();
  console.log('✅ Connected to PostgreSQL\n');

  try {
    const existing = await prisma.user.findUnique({
      where: { phone: ADMIN_CONFIG.phone },
    });

    if (existing) {
      console.log('⚠️  Admin already exists:');
      console.log('   Phone:', existing.phone);
      console.log('   Email:', existing.email);
      console.log('   Role :', existing.role);
      console.log('\nNo changes made. Exiting.\n');
      await prisma.$disconnect();
      process.exit(0);
    }

    const admin = await prisma.user.create({ data: ADMIN_CONFIG });
    console.log('✅ Admin created successfully!');
    console.log('   ID   :', admin.id);
    console.log('   Phone:', admin.phone);
    console.log('   Email:', admin.email);
    console.log('   Role :', admin.role);
    console.log('\nLogin using the phone number above to get your JWT access token.\n');
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from PostgreSQL.\n');
  }
  */

  // ── Placeholder (remove this block when you uncomment one of the above) ──
  console.log('\n⚠️  No database section is active in this script.');
  console.log('   1. Open scripts/seedAdmin.js');
  console.log('   2. Uncomment OPTION A (MongoDB) or OPTION B (PostgreSQL)');
  console.log('   3. Run the script again\n');
  process.exit(0);
};

// ── Run ───────────────────────────────────────────────────────────────────────

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  console.error(err);
  process.exit(1);
});

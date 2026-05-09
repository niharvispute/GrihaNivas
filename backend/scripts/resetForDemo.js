/**
 * Demo Reset Script
 *
 * Wipes ALL data except admin users so the database is clean for a client demo.
 * Collections cleared: Users (non-admin), Properties, Builders, Leads, PropertySubmissions,
 *                      Blogs, Banners, Testimonials, Contacts, NewsletterSubscribers,
 *                      AuthOtpFlow
 * Collections kept:    StampDutyConfig, SystemConfig (platform config — not data)
 *
 * Usage:
 *   npm run reset:demo -- --confirm
 *
 * The --confirm flag is required to prevent accidental runs.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');

const {
  User,
  Builder,
  Property,
  Lead,
  PropertySubmission,
  Blog,
  Testimonial,
  Banner,
  Contact,
  AuthOtpFlow,
} = require('../models/mongoose');

const NewsletterSubscriber = require('../models/mongoose/NewsletterSubscriber');

const confirmed = process.argv.includes('--confirm');

if (!confirmed) {
  console.error('\n⛔  Safety check failed.\n');
  console.error('   This script will permanently delete ALL non-admin data.');
  console.error('   Re-run with the --confirm flag to proceed:\n');
  console.error('   npm run reset:demo -- --confirm\n');
  process.exit(1);
}

const reset = async () => {
  console.log('\n🗑️  Ghar Demo Reset\n');
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected\n');

  // -- Users: keep admins, delete everyone else --------------------------------
  const adminCount = await User.countDocuments({ role: 'admin' });
  const userDeleteResult = await User.deleteMany({ role: { $ne: 'admin' } });
  console.log(`👤  Users    — deleted ${userDeleteResult.deletedCount} (${adminCount} admin(s) preserved)`);

  // -- Properties --------------------------------------------------------------
  const propResult = await Property.deleteMany({});
  console.log(`🏠  Properties          — deleted ${propResult.deletedCount}`);

  // -- Builders ----------------------------------------------------------------
  const builderResult = await Builder.deleteMany({});
  console.log(`🏗️   Builders            — deleted ${builderResult.deletedCount}`);

  // -- Leads -------------------------------------------------------------------
  const leadResult = await Lead.deleteMany({});
  console.log(`📋  Leads               — deleted ${leadResult.deletedCount}`);

  // -- Property Submissions ----------------------------------------------------
  const subResult = await PropertySubmission.deleteMany({});
  console.log(`📝  PropertySubmissions  — deleted ${subResult.deletedCount}`);

  // -- Blogs -------------------------------------------------------------------
  const blogResult = await Blog.deleteMany({});
  console.log(`📰  Blogs               — deleted ${blogResult.deletedCount}`);

  // -- Banners -----------------------------------------------------------------
  const bannerResult = await Banner.deleteMany({});
  console.log(`🖼️   Banners             — deleted ${bannerResult.deletedCount}`);

  // -- Testimonials ------------------------------------------------------------
  const testimonialResult = await Testimonial.deleteMany({});
  console.log(`💬  Testimonials        — deleted ${testimonialResult.deletedCount}`);

  // -- Contact form submissions ------------------------------------------------
  const contactResult = await Contact.deleteMany({});
  console.log(`📩  Contact submissions — deleted ${contactResult.deletedCount}`);

  // -- Auth OTP sessions -------------------------------------------------------
  const otpResult = await AuthOtpFlow.deleteMany({});
  console.log(`🔑  AuthOtpFlow         — deleted ${otpResult.deletedCount}`);

  // -- Newsletter subscribers --------------------------------------------------
  const nlResult = await NewsletterSubscriber.deleteMany({});
  console.log(`📧  NewsletterSubs      — deleted ${nlResult.deletedCount}`);

  console.log('\n✅  Reset complete. Database is clean for demo.\n');
  console.log('   StampDutyConfig and SystemConfig were NOT touched.\n');
  console.log('   Admin credentials:\n');

  const admins = await User.find({ role: 'admin' }).select('email phone name');
  admins.forEach((a) => {
    console.log(`   Name : ${a.name || '(no name)'}`);
    console.log(`   Email: ${a.email || '(none)'}`);
    console.log(`   Phone: ${a.phone || '(none)'}`);
    console.log('   Pass : check your .env ADMIN_PASSWORD (default: Admin@1234)\n');
  });

  await mongoose.disconnect();
  console.log('Disconnected.\n');
};

reset().catch((err) => {
  console.error('\n❌ Reset failed:', err.message);
  console.error(err);
  process.exit(1);
});

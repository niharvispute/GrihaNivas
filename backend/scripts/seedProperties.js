'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../config/db');
const { disconnectDB } = require('../config/db');
const Property = require('../models/mongoose/Property');
const User = require('../models/mongoose/User');

/**
 * Seed realistic Mumbai property listings.
 *
 * Flags:
 *   --reset    Delete all existing properties first (use with caution in prod)
 *   --dry-run  Print what would be created without touching the DB
 *
 * Run:
 *   npm run seed:properties
 *   npm run seed:properties -- --reset
 */

const slug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const img = (url) => ({ url, publicId: `seed/${slug(url.split('/').pop().split('?')[0])}` });

const PROPERTIES = [
  // ── BUY ─────────────────────────────────────────────────────────────────
  {
    title: '3 BHK Apartment in Bandra West — Sea-Facing Tower',
    description:
      'Elegant 3 BHK in the heart of Bandra West with panoramic views of the Arabian Sea. The apartment features imported marble flooring, a modern modular kitchen, three en-suite bedrooms, and a covered car park. Part of a RERA-registered project with 24×7 concierge, gym, and rooftop infinity pool.',
    category: 'buy',
    price: 42500000,
    priceUnit: 'total',
    location: { area: 'Bandra West', city: 'Mumbai' },
    bhk: 3,
    bathrooms: 3,
    areaSqft: 1420,
    carpetArea: 1050,
    totalArea: 1420,
    floor: 14,
    totalFloors: 22,
    parking: 1,
    furnishing: 'semi_furnished',
    possession: 'Ready to Move',
    age: '2 years',
    reraNumber: 'P51800001001',
    amenities: ['Swimming Pool', 'Gym', 'Rooftop Garden', '24x7 Security', 'Power Backup', 'Concierge'],
    feature: ['Sea-facing', 'Prime Bandra location', 'RERA verified'],
    highlights: [
      { icon: 'water', label: 'View', value: 'Sea-Facing' },
      { icon: 'elevator', label: 'Floor', value: '14th of 22' },
      { icon: 'local_parking', label: 'Parking', value: '1 Covered' },
    ],
    heroImage: img('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: true,
  },
  {
    title: '2 BHK Apartment in Andheri West — Move-in Ready',
    description:
      'Well-appointed 2 BHK in a sought-after residential society in Andheri West. Walking distance to D.N. Nagar Metro station. Fresh interior with Italian tiles, premium fittings, and a modular kitchen. Society has CCTV surveillance, clubhouse, and children\'s play area.',
    category: 'buy',
    price: 18900000,
    priceUnit: 'total',
    location: { area: 'Andheri West', city: 'Mumbai' },
    bhk: 2,
    bathrooms: 2,
    areaSqft: 950,
    carpetArea: 710,
    totalArea: 950,
    floor: 7,
    totalFloors: 15,
    parking: 1,
    furnishing: 'unfurnished',
    possession: 'Ready to Move',
    age: '5 years',
    reraNumber: 'P51800001002',
    amenities: ['Gymnasium', 'CCTV', 'Clubhouse', "Children's Play Area", 'Power Backup'],
    feature: ['Metro connectivity', 'Quiet residential society'],
    highlights: [
      { icon: 'subway', label: 'Metro', value: '5 min walk' },
      { icon: 'elevator', label: 'Floor', value: '7th of 15' },
    ],
    heroImage: img('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: true,
  },
  {
    title: '4 BHK Duplex in Worli — Premium Sea View',
    description:
      'Expansive 4 BHK duplex in one of Worli\'s premium residential towers overlooking the sea link and horizon. Features private terrace, double-height living room, imported fixtures, and dedicated staff quarters. Building includes concierge, spa, indoor sports, and valet parking.',
    category: 'buy',
    price: 95000000,
    priceUnit: 'total',
    location: { area: 'Worli', city: 'Mumbai' },
    bhk: 4,
    bathrooms: 4,
    areaSqft: 2800,
    carpetArea: 2100,
    totalArea: 2800,
    floor: 28,
    totalFloors: 35,
    parking: 2,
    furnishing: 'furnished',
    possession: 'Ready to Move',
    age: '1 year',
    reraNumber: 'P51800001003',
    amenities: ['Spa', 'Concierge', 'Valet Parking', 'Indoor Sports', 'Private Terrace', 'Swimming Pool'],
    feature: ['Sea Link view', 'Private terrace', 'Ultra-premium'],
    highlights: [
      { icon: 'water', label: 'View', value: 'Bandra-Worli Sea Link' },
      { icon: 'deck', label: 'Terrace', value: 'Private 600 sq.ft' },
      { icon: 'local_parking', label: 'Parking', value: '2 Covered + Valet' },
    ],
    heroImage: img('https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: true,
  },
  {
    title: '2 BHK Apartment in Powai — Lake View',
    description:
      'Spacious 2 BHK apartment in Powai\'s premier residential hub with partial lake views. The flat features vitrified tiles, a modular kitchen with chimney, and two well-designed bedrooms. Society amenities include a rooftop garden, gym, and 24×7 security. Close to IIT-Bombay and IT hubs.',
    category: 'buy',
    price: 22000000,
    priceUnit: 'total',
    location: { area: 'Powai', city: 'Mumbai' },
    bhk: 2,
    bathrooms: 2,
    areaSqft: 1050,
    carpetArea: 780,
    totalArea: 1050,
    floor: 10,
    totalFloors: 18,
    parking: 1,
    furnishing: 'semi_furnished',
    possession: 'Ready to Move',
    age: '3 years',
    reraNumber: 'P51800001004',
    amenities: ['Rooftop Garden', 'Gymnasium', '24x7 Security', 'Visitor Parking', 'Power Backup'],
    feature: ['Lake view', 'IT hub proximity', 'Good connectivity'],
    heroImage: img('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: true,
  },
  {
    title: '1 BHK Studio in Malad West — First-Time Buyer',
    description:
      'Compact and well-planned 1 BHK studio ideal for first-time homebuyers or investors. Located in a well-maintained society in Malad West with easy access to Malad station and western highway. Society features power backup, covered parking, and lift.',
    category: 'buy',
    price: 8500000,
    priceUnit: 'total',
    location: { area: 'Malad West', city: 'Mumbai' },
    bhk: 1,
    bathrooms: 1,
    areaSqft: 545,
    carpetArea: 390,
    totalArea: 545,
    floor: 5,
    totalFloors: 12,
    parking: 1,
    furnishing: 'unfurnished',
    possession: 'Ready to Move',
    age: '7 years',
    reraNumber: 'P51800001005',
    amenities: ['Power Backup', 'Covered Parking', 'Lift', 'Watchman'],
    feature: ['Affordable', 'Station connectivity', 'Good for investment'],
    heroImage: img('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: false,
  },
  {
    title: '3 BHK Apartment in Lower Parel — Corporate Hub',
    description:
      'Premium 3 BHK in Lower Parel\'s iconic residential belt, steps from Phoenix Mills and BKC connectivity. Modern finishes, open-plan living space, large balcony, and an en-suite master bedroom with walk-in wardrobe. Tower includes infinity pool, co-working lounge, and concierge.',
    category: 'buy',
    price: 38000000,
    priceUnit: 'total',
    location: { area: 'Lower Parel', city: 'Mumbai' },
    bhk: 3,
    bathrooms: 3,
    areaSqft: 1380,
    carpetArea: 990,
    totalArea: 1380,
    floor: 18,
    totalFloors: 28,
    parking: 1,
    furnishing: 'semi_furnished',
    possession: 'Ready to Move',
    age: '2 years',
    reraNumber: 'P51800001006',
    amenities: ['Infinity Pool', 'Co-working Lounge', 'Concierge', 'Gym', 'CCTV'],
    feature: ['Corporate location', 'Phoenix Mills proximity'],
    heroImage: img('https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: true,
  },

  // ── RENT ─────────────────────────────────────────────────────────────────
  {
    title: '2 BHK Furnished Apartment in Bandra West — Available Now',
    description:
      'Tastefully furnished 2 BHK available for immediate move-in in Bandra West. Features a fully equipped kitchen, brand-new AC in all rooms, a cozy living area, and two spacious bedrooms. Society has 24×7 security, power backup, and covered parking. Minutes from Linking Road and Carter Road.',
    category: 'rent',
    price: 75000,
    priceUnit: 'per_month',
    rentPerMonth: 75000,
    deposit: 225000,
    location: { area: 'Bandra West', city: 'Mumbai' },
    bhk: 2,
    bathrooms: 2,
    areaSqft: 980,
    carpetArea: 720,
    totalArea: 980,
    floor: 6,
    totalFloors: 14,
    parking: 1,
    furnishing: 'furnished',
    possession: 'Available Now',
    availableFrom: new Date('2026-06-20'),
    amenities: ['Covered Parking', 'Power Backup', '24x7 Security', 'Lift'],
    appliances: ['AC', 'Refrigerator', 'Washing Machine', 'Microwave'],
    feature: ['Fully furnished', 'Prime Bandra', 'Immediately available'],
    heroImage: img('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: true,
  },
  {
    title: '1 BHK Apartment in Andheri East — Near Metro',
    description:
      'Clean and bright 1 BHK apartment near Andheri East metro station, ideal for working professionals. Fresh interior, a compact modular kitchen, tiled flooring, and a well-ventilated bedroom. Society is gated with CCTV and covered parking available.',
    category: 'rent',
    price: 28000,
    priceUnit: 'per_month',
    rentPerMonth: 28000,
    deposit: 84000,
    location: { area: 'Andheri East', city: 'Mumbai' },
    bhk: 1,
    bathrooms: 1,
    areaSqft: 560,
    carpetArea: 410,
    totalArea: 560,
    floor: 3,
    totalFloors: 10,
    parking: 0,
    furnishing: 'semi_furnished',
    possession: 'Available Now',
    amenities: ['CCTV', 'Lift', 'Gated Society'],
    appliances: ['Refrigerator', 'Washing Machine'],
    feature: ['Metro connectivity', 'Affordable rent', 'Quiet locality'],
    heroImage: img('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: false,
  },
  {
    title: '3 BHK Semi-Furnished in Powai — Corporate Lease',
    description:
      'Spacious 3 BHK semi-furnished apartment in Powai suitable for corporate lease. All rooms are airy with large windows, modular kitchen, and two full bathrooms. Society amenities include clubhouse, gym, children\'s play area, and visitor parking. Close to SEEPZ, IIT-Bombay, and Hiranandani Business Park.',
    category: 'rent',
    price: 62000,
    priceUnit: 'per_month',
    rentPerMonth: 62000,
    deposit: 186000,
    location: { area: 'Powai', city: 'Mumbai' },
    bhk: 3,
    bathrooms: 2,
    areaSqft: 1250,
    carpetArea: 920,
    totalArea: 1250,
    floor: 9,
    totalFloors: 16,
    parking: 1,
    furnishing: 'semi_furnished',
    possession: 'Available Now',
    amenities: ['Clubhouse', 'Gym', "Children's Play Area", 'Visitor Parking', 'Power Backup'],
    appliances: ['AC', 'Geyser'],
    feature: ['Corporate lease', 'IT hub', 'Hiranandani'],
    heroImage: img('https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: true,
  },
  {
    title: '2 BHK Unfurnished Apartment in Goregaon West',
    description:
      'Well-maintained 2 BHK unfurnished apartment in a peaceful society in Goregaon West. Features vitrified tiles, a spacious kitchen area, individual metering, and a balcony. Society has power backup, watchman, and parking. Near Goregaon station and Film City Road.',
    category: 'rent',
    price: 38000,
    priceUnit: 'per_month',
    rentPerMonth: 38000,
    deposit: 114000,
    location: { area: 'Goregaon West', city: 'Mumbai' },
    bhk: 2,
    bathrooms: 2,
    areaSqft: 870,
    carpetArea: 650,
    totalArea: 870,
    floor: 4,
    totalFloors: 8,
    parking: 0,
    furnishing: 'unfurnished',
    possession: 'Available Now',
    amenities: ['Power Backup', 'Watchman', 'Lift'],
    feature: ['Budget rent', 'Goregaon station nearby'],
    heroImage: img('https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: false,
  },
  {
    title: '4 BHK Luxury Apartment in South Mumbai — Furnished',
    description:
      'Exquisitely furnished 4 BHK in a heritage residential building in South Mumbai offering a rare blend of old-world charm and modern conveniences. Features high ceilings, antique wooden floors, a grand living area, and a fully equipped modern kitchen. Within walking distance of Breach Candy and Marine Drive.',
    category: 'rent',
    price: 200000,
    priceUnit: 'per_month',
    rentPerMonth: 200000,
    deposit: 600000,
    location: { area: 'South Mumbai', city: 'Mumbai' },
    bhk: 4,
    bathrooms: 4,
    areaSqft: 2600,
    carpetArea: 1900,
    totalArea: 2600,
    floor: 3,
    totalFloors: 7,
    parking: 2,
    furnishing: 'furnished',
    possession: 'Available Now',
    amenities: ['Covered Parking', '24x7 Security', 'Lift', 'Generator'],
    appliances: ['AC', 'Refrigerator', 'Washing Machine', 'TV', 'Microwave'],
    feature: ['South Mumbai heritage', 'Marine Drive proximity', 'Ultra-luxury'],
    heroImage: img('https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: true,
  },

  // ── NEW LAUNCH ───────────────────────────────────────────────────────────
  {
    title: '2 & 3 BHK — Emerald Heights, Andheri West (New Launch)',
    description:
      'Emerald Heights is a new-launch residential project by a leading Mumbai developer in Andheri West. Offering 2 BHK starting at ₹1.65 Cr and 3 BHK starting at ₹2.40 Cr. The project features a sky lounge, co-working spaces, indoor sports arena, and a rooftop infinity pool. RERA registered. Possession by December 2027.',
    category: 'new_launch',
    price: 16500000,
    priceUnit: 'total',
    location: { area: 'Andheri West', city: 'Mumbai' },
    bhk: 2,
    bathrooms: 2,
    areaSqft: 820,
    carpetArea: 600,
    totalArea: 820,
    floor: 1,
    totalFloors: 32,
    parking: 1,
    furnishing: 'unfurnished',
    possession: 'Dec 2027',
    reraNumber: 'P51800002001',
    amenities: ['Sky Lounge', 'Co-working Space', 'Indoor Sports Arena', 'Rooftop Infinity Pool', 'EV Charging'],
    feature: ['Early bird pricing', 'RERA registered', 'Possession Dec 2027'],
    highlights: [
      { icon: 'star', label: 'Early Bird', value: '15% off floor rise' },
      { icon: 'home_work', label: 'Possession', value: 'Dec 2027' },
      { icon: 'verified', label: 'RERA', value: 'P51800002001' },
    ],
    heroImage: img('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: true,
  },
  {
    title: '1, 2 & 3 BHK — Marina Bay Residences, Worli (Pre-Launch)',
    description:
      'Marina Bay Residences is an ultra-luxury pre-launch project in Worli offering breathtaking views of the Arabian Sea and Bandra-Worli Sea Link. 1 BHK from ₹3.2 Cr, 2 BHK from ₹5.8 Cr, and 3 BHK from ₹9.5 Cr. Features club deck at 40th floor, private cinema, and heated pool. RERA applied. Possession by 2029.',
    category: 'new_launch',
    price: 32000000,
    priceUnit: 'total',
    location: { area: 'Worli', city: 'Mumbai' },
    bhk: 2,
    bathrooms: 2,
    areaSqft: 1100,
    carpetArea: 820,
    totalArea: 1100,
    floor: 1,
    totalFloors: 48,
    parking: 1,
    furnishing: 'unfurnished',
    possession: 'Mar 2029',
    reraNumber: 'P51800002002',
    amenities: ['Club Deck', 'Private Cinema', 'Heated Pool', 'Concierge', 'Valet Parking'],
    feature: ['Sea-facing', 'Ultra-premium', 'Worli landmark project'],
    highlights: [
      { icon: 'water', label: 'View', value: 'Sea Link & Arabian Sea' },
      { icon: 'home_work', label: 'Possession', value: 'Mar 2029' },
      { icon: 'verified', label: 'RERA', value: 'Applied' },
    ],
    heroImage: img('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: true,
  },
  {
    title: '2 BHK — Greenwood Central, Thane West (New Launch)',
    description:
      'Greenwood Central is a thoughtfully designed residential project in Thane West with easy access to the Eastern Express Highway. 2 BHK apartments starting from ₹92 Lakhs with premium specs. Project includes landscaped gardens, children\'s pool, jogging track, and a fully equipped clubhouse. RERA registered. Possession by June 2027.',
    category: 'new_launch',
    price: 9200000,
    priceUnit: 'total',
    location: { area: 'Thane West', city: 'Mumbai' },
    bhk: 2,
    bathrooms: 2,
    areaSqft: 760,
    carpetArea: 550,
    totalArea: 760,
    floor: 1,
    totalFloors: 20,
    parking: 1,
    furnishing: 'unfurnished',
    possession: 'Jun 2027',
    reraNumber: 'P51900002003',
    amenities: ['Landscaped Garden', "Children's Pool", 'Jogging Track', 'Clubhouse', 'Solar Panels'],
    feature: ['Affordable premium', 'Thane connectivity', 'RERA registered'],
    heroImage: img('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'),
    status: 'approved',
    isActive: true,
    isFeatured: false,
  },
];

const args = new Set(process.argv.slice(2));
const shouldReset = args.has('--reset');
const isDryRun = args.has('--dry-run');

const findAdmin = async () => User.findOne({ role: 'admin' }).select('_id');

const run = async () => {
  try {
    await connectDB();

    if (shouldReset) {
      if (isDryRun) {
        console.info('[dry-run] Would delete all existing properties.');
      } else {
        const result = await Property.deleteMany({});
        console.info(`Reset deleted: ${result.deletedCount} properties.`);
      }
    }

    const admin = await findAdmin();
    if (!admin) {
      console.error('No admin user found. Run seed:admin first.');
      process.exitCode = 1;
      return;
    }

    let created = 0;
    let updated = 0;

    for (const prop of PROPERTIES) {
      const propSlug = slug(prop.title);
      const payload = {
        ...prop,
        slug: propSlug,
        createdBy: admin._id,
        postedBy: admin._id,
        approvedAt: new Date(),
      };

      if (isDryRun) {
        console.info(`[dry-run] Would upsert: ${payload.title} (${propSlug})`);
        continue;
      }

      const existing = await Property.findOne({ slug: propSlug }).select('_id');
      if (existing) {
        await Property.updateOne({ _id: existing._id }, { $set: payload });
        updated += 1;
      } else {
        await Property.create(payload);
        created += 1;
      }
    }

    if (!isDryRun) {
      console.info('Property seed complete.');
      console.info(`Created: ${created}`);
      console.info(`Updated: ${updated}`);
      console.info(`Total seeded: ${PROPERTIES.length}`);
    }
  } catch (err) {
    console.error('Property seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../config/db');
const { disconnectDB } = require('../config/db');
const Builder = require('../models/mongoose/Builder');
const { generateSlug } = require('../utils/slugify');

const DEFAULT_BUILDERS = [
  {
    name: 'Lodha Group',
    shortDescription: 'Premium residential and mixed-use developer in Mumbai.',
    description:
      'Lodha develops premium and luxury projects across key Mumbai micro-markets with strong focus on quality and scale.',
    aboutHeadline: "Crafting Mumbai's next-generation skylines",
    qualityStandards: 'ISO aligned quality execution and delivery governance',
    innovation: 'Data-driven design and sustainable construction',
    featuredImages: [
      'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80',
    ],
    faqs: [
      {
        question: 'Are all projects RERA registered?',
        answer: 'Yes, all active launches are RERA registered and shared transparently in project documentation.',
      },
    ],
    testimonials: [
      {
        author: 'A. Mehta',
        role: 'Homeowner',
        content: 'Strong execution quality and timely communication throughout the buying cycle.',
        rating: 5,
      },
    ],
    establishedYear: 1980,
    totalProjects: 100,
    ongoingProjects: 14,
    completedDeliveries: 86,
    headquarters: 'Mumbai',
    isFeatured: true,
    isActive: true,
    seo: {
      metaTitle: 'Lodha Group Properties in Mumbai',
      metaDescription: 'Explore Lodha Group projects and properties in Mumbai.',
      keywords: ['lodha', 'mumbai real estate'],
    },
  },
  {
    name: 'Godrej Properties',
    shortDescription: 'National developer with premium residential projects in Mumbai.',
    description:
      'Godrej Properties has launched multiple modern communities in Mumbai with emphasis on design and sustainability.',
    establishedYear: 1990,
    totalProjects: 80,
    headquarters: 'Mumbai',
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Oberoi Realty',
    shortDescription: 'Luxury-focused builder with strong presence in Mumbai suburbs.',
    description:
      'Oberoi Realty is known for high-end residential and commercial developments in strategic Mumbai locations.',
    establishedYear: 1998,
    totalProjects: 45,
    headquarters: 'Mumbai',
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Rustomjee',
    shortDescription: 'Trusted Mumbai builder across residential segments.',
    description:
      'Rustomjee has delivered family-focused communities and premium residences in multiple Mumbai corridors.',
    establishedYear: 1996,
    totalProjects: 65,
    headquarters: 'Mumbai',
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Kalpataru',
    shortDescription: 'Established real estate brand with projects across Mumbai.',
    description:
      'Kalpataru develops residential and commercial assets with long-standing execution history in Mumbai.',
    establishedYear: 1969,
    totalProjects: 90,
    headquarters: 'Mumbai',
    isFeatured: false,
    isActive: true,
  },
];

const args = new Set(process.argv.slice(2));
const shouldReset = args.has('--reset');
const isDryRun = args.has('--dry-run');

const run = async () => {
  try {
    await connectDB();

    if (shouldReset) {
      if (isDryRun) {
        console.info('[dry-run] Would delete all existing builders.');
      } else {
        const deleteResult = await Builder.deleteMany({});
        console.info(`Deleted existing builders: ${deleteResult.deletedCount}`);
      }
    }

    let created = 0;
    let updated = 0;

    for (const builder of DEFAULT_BUILDERS) {
      const slug = generateSlug(builder.name);
      const payload = {
        ...builder,
        slug,
      };

      if (isDryRun) {
        console.info(`[dry-run] Would upsert builder: ${payload.name} (${payload.slug})`);
        continue;
      }

      const existing = await Builder.findOne({ slug }).select('_id');
      if (existing) {
        await Builder.updateOne({ _id: existing._id }, { $set: payload });
        updated += 1;
      } else {
        await Builder.create(payload);
        created += 1;
      }
    }

    if (!isDryRun) {
      console.info('Builder seed complete.');
      console.info(`Created: ${created}`);
      console.info(`Updated: ${updated}`);
      console.info(`Total defaults processed: ${DEFAULT_BUILDERS.length}`);
    }
  } catch (error) {
    console.error('Builder seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();

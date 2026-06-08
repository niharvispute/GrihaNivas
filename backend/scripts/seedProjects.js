'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../config/db');
const { disconnectDB } = require('../config/db');
const Builder = require('../models/mongoose/Builder');
const Project = require('../models/mongoose/Project');
const ProjectConfiguration = require('../models/mongoose/ProjectConfiguration');
const ProjectUnit = require('../models/mongoose/ProjectUnit');
const User = require('../models/mongoose/User');
const { generateSlug } = require('../utils/slugify');

/**
 * Sample seed data.
 * Add real builder IDs and project entries here before running:
 *   npm run seed:projects
 *
 * Flags:
 *   --reset   Delete all existing projects + configurations + units first
 *   --dry-run Print what would be created without touching the DB
 */

const SAMPLE_PROJECTS = [
  {
    name: 'Skyline Heights',
    projectType: 'residential',
    projectStatus: 'under_construction',
    location: { area: 'Andheri West', city: 'Mumbai' },
    shortDescription: 'Premium 2 & 3 BHK residences in the heart of Andheri West.',
    totalTowers: 2,
    totalFloors: 22,
    totalUnits: 180,
    reraNumber: 'P51800030001',
    configurations: [
      {
        bhkType: '2BHK',
        title: 'Type A',
        priceMin: 18500000,
        priceMax: 21000000,
        carpetAreaMin: 720,
        carpetAreaMax: 780,
        bathrooms: 2,
        balconies: 1,
        parking: 1,
        totalUnits: 80,
      },
      {
        bhkType: '3BHK',
        title: 'Type B',
        priceMin: 26500000,
        priceMax: 31000000,
        carpetAreaMin: 1050,
        carpetAreaMax: 1180,
        bathrooms: 3,
        balconies: 2,
        parking: 1,
        totalUnits: 100,
      },
    ],
  },
  {
    name: 'Emerald Bay Residences',
    projectType: 'residential',
    projectStatus: 'new_launch',
    location: { area: 'Powai', city: 'Mumbai' },
    shortDescription: 'Lake-facing 1, 2 & 3 BHK homes with world-class amenities.',
    totalTowers: 3,
    totalFloors: 28,
    totalUnits: 240,
    reraNumber: 'P51800030002',
    configurations: [
      { bhkType: '1BHK', priceMin: 9500000,  priceMax: 10800000, carpetAreaMin: 480, carpetAreaMax: 540, bathrooms: 1, parking: 1, totalUnits: 60 },
      { bhkType: '2BHK', priceMin: 14500000, priceMax: 17500000, carpetAreaMin: 760, carpetAreaMax: 880, bathrooms: 2, parking: 1, totalUnits: 120 },
      { bhkType: '3BHK', priceMin: 22500000, priceMax: 27500000, carpetAreaMin: 1080, carpetAreaMax: 1280, bathrooms: 3, parking: 1, totalUnits: 60 },
    ],
  },
  {
    name: 'Crescent Square',
    projectType: 'commercial',
    projectStatus: 'ready_to_move',
    location: { area: 'Bandra Kurla Complex', city: 'Mumbai' },
    shortDescription: 'Grade-A commercial offices and retail spaces in BKC.',
    totalTowers: 1,
    totalFloors: 18,
    totalUnits: 90,
    reraNumber: 'P51800030003',
    configurations: [
      { bhkType: 'commercial', propertyType: 'commercial', priceMin: 18000000, priceMax: 85000000, carpetAreaMin: 350, carpetAreaMax: 2400, parking: 1, totalUnits: 90 },
    ],
  },
];

const args = new Set(process.argv.slice(2));
const shouldReset = args.has('--reset');
const isDryRun = args.has('--dry-run');

const pickBuilder = async () => {
  const featured = await Builder.findOne({ isFeatured: true, isActive: true }).select('_id name');
  if (featured) return featured;
  return Builder.findOne({ isActive: true }).select('_id name');
};

const findAdmin = async () => {
  return User.findOne({ role: 'admin' }).select('_id');
};

const buildUnitSeed = (configId, count) => {
  const units = [];
  const statuses = ['available', 'available', 'available', 'available', 'booked', 'sold', 'hold'];
  for (let i = 1; i <= count; i += 1) {
    const floor = Math.ceil(i / 4);
    const unitNumber = `${(floor * 100) + ((i - 1) % 4) + 1}`;
    units.push({
      configurationId: configId,
      tower: 'Tower A',
      floor,
      unitNumber,
      carpetArea: 700 + ((i * 7) % 200),
      builtupArea: 900 + ((i * 9) % 250),
      facing: ['East', 'West', 'North', 'South'][i % 4],
      status: statuses[i % statuses.length],
    });
  }
  return units;
};

const recomputeProjectAggregates = async (projectId) => {
  const configs = await ProjectConfiguration.find({ projectId, isActive: true }).select('bhkType priceMin priceMax');
  if (!configs.length) {
    await Project.findByIdAndUpdate(projectId, { bhkSummary: [], priceMin: null, priceMax: null });
    return;
  }
  const bhkSummary = Array.from(new Set(configs.map((c) => c.bhkType))).sort();
  const priceMin = Math.min(...configs.map((c) => c.priceMin || Number.POSITIVE_INFINITY));
  const priceMax = Math.max(...configs.map((c) => c.priceMax || 0));
  await Project.findByIdAndUpdate(projectId, {
    bhkSummary,
    priceMin: Number.isFinite(priceMin) ? priceMin : null,
    priceMax: priceMax > 0 ? priceMax : null,
  });
};

const recomputeAvailability = async (configId) => {
  const available = await ProjectUnit.countDocuments({ configurationId: configId, status: 'available' });
  await ProjectConfiguration.findByIdAndUpdate(configId, { availableUnits: available });
};

const run = async () => {
  try {
    await connectDB();

    if (shouldReset) {
      if (isDryRun) {
        console.info('[dry-run] Would delete all existing projects, configurations, and units.');
      } else {
        const [u, c, p] = await Promise.all([
          ProjectUnit.deleteMany({}),
          ProjectConfiguration.deleteMany({}),
          Project.deleteMany({}),
        ]);
        console.info(
          `Reset deleted: ${p.deletedCount} projects, ${c.deletedCount} configurations, ${u.deletedCount} units.`
        );
      }
    }

    const builder = await pickBuilder();
    if (!builder) {
      console.warn('No active builder found. Please seed at least one builder before running this script.');
      process.exitCode = 1;
      return;
    }

    const admin = await findAdmin();
    if (!admin) {
      console.warn('No admin user found. Project.createdBy will not be set — the script expects a User.');
      process.exitCode = 1;
      return;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const project of SAMPLE_PROJECTS) {
      const { configurations = [], ...projectData } = project;
      const slug = generateSlug(projectData.name);
      const payload = {
        ...projectData,
        slug,
        builderId: builder._id,
        listingStatus: 'active',
        createdBy: admin._id,
      };

      if (isDryRun) {
        console.info(`[dry-run] Would upsert project: ${payload.name} (${payload.slug})`);
        continue;
      }

      let projectDoc = await Project.findOne({ slug });
      if (projectDoc) {
        await Project.updateOne({ _id: projectDoc._id }, { $set: payload });
        projectDoc = await Project.findById(projectDoc._id);
        updated += 1;
      } else {
        projectDoc = await Project.create(payload);
        created += 1;
      }

      // Wipe + recreate configurations for idempotent reseeding
      await ProjectConfiguration.deleteMany({ projectId: projectDoc._id });
      for (const [idx, config] of configurations.entries()) {
        const configDoc = await ProjectConfiguration.create({
          ...config,
          projectId: projectDoc._id,
          sortOrder: idx,
        });

        const totalUnits = config.totalUnits || 12;
        const unitDocs = buildUnitSeed(configDoc._id, Math.min(totalUnits, 20));
        if (unitDocs.length) {
          await ProjectUnit.insertMany(unitDocs);
        }
        await recomputeAvailability(configDoc._id);
      }
      await recomputeProjectAggregates(projectDoc._id);
    }

    if (!isDryRun) {
      console.info('Project seed complete.');
      console.info(`Created: ${created}`);
      console.info(`Updated: ${updated}`);
      console.info(`Skipped: ${skipped}`);
    }
  } catch (error) {
    console.error('Project seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();

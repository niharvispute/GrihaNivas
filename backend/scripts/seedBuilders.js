'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../config/db');
const { disconnectDB } = require('../config/db');
const Builder = require('../models/mongoose/Builder');
const { generateSlug } = require('../utils/slugify');

// Add real builder entries here before running: npm run seed:builders
const DEFAULT_BUILDERS = [];

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

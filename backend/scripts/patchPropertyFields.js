'use strict';

/**
 * Patches appliances and availableFrom on a specific Property document
 * and its linked PropertySubmission.
 *
 * Usage:
 *   node scripts/patchPropertyFields.js --slug=editorial-title-1780061421840 \
 *     --appliances="TV,Refrigerator,AC" \
 *     --availableFrom=2025-08-01
 *
 * All flags are optional — omit one to leave that field unchanged.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../config/db');
const { disconnectDB } = require('../config/db');
const Property = require('../models/mongoose/Property');
const PropertySubmission = require('../models/mongoose/PropertySubmission');

const getArg = (name) => {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=').slice(1).join('=').trim() : null;
};

const run = async () => {
  const slug = getArg('slug');
  const appliancesRaw = getArg('appliances');
  const availableFromRaw = getArg('availableFrom');
  const dryRun = process.argv.includes('--dry-run');

  if (!slug) {
    console.error('ERROR: --slug=<property-slug> is required');
    process.exitCode = 1;
    return;
  }

  const appliances = appliancesRaw
    ? appliancesRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : null;

  const availableFrom = availableFromRaw ? new Date(availableFromRaw) : null;
  if (availableFromRaw && isNaN(availableFrom?.getTime())) {
    console.error('ERROR: --availableFrom must be a valid date (e.g. 2025-08-01)');
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();

    const property = await Property.findOne({ slug });
    if (!property) {
      console.error(`ERROR: No property found with slug "${slug}"`);
      process.exitCode = 1;
      return;
    }

    console.info(`Found property: ${property.title} (${property._id})`);
    console.info(`  Current appliances : ${JSON.stringify(property.appliances)}`);
    console.info(`  Current availableFrom: ${property.availableFrom}`);

    const propertyUpdates = {};
    if (appliances) propertyUpdates.appliances = appliances;
    if (availableFrom) propertyUpdates.availableFrom = availableFrom;

    if (Object.keys(propertyUpdates).length === 0) {
      console.info('Nothing to update — pass --appliances and/or --availableFrom');
      return;
    }

    console.info(`\nWill apply to Property:`, propertyUpdates);

    // Also patch the linked submission so future re-publishes carry the data
    let submission = null;
    if (property.sourceSubmission) {
      submission = await PropertySubmission.findById(property.sourceSubmission);
      if (submission) {
        console.info(`Found linked submission: ${submission._id}`);
      }
    }

    if (!dryRun) {
      await Property.findByIdAndUpdate(property._id, { $set: propertyUpdates });
      console.info('✓ Property patched');

      if (submission) {
        await PropertySubmission.findByIdAndUpdate(submission._id, { $set: propertyUpdates });
        console.info('✓ Submission patched');
      }
    } else {
      console.info('Dry run — no writes performed. Re-run without --dry-run to apply.');
    }

    console.info('\nDone.');
  } catch (err) {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();

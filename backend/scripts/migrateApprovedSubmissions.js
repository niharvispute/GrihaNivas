'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../config/db');
const { disconnectDB } = require('../config/db');
const Property = require('../models/mongoose/Property');
const PropertySubmission = require('../models/mongoose/PropertySubmission');
const {
  ensureSubmissionPublished,
  findPublishedProperty,
} = require('../services/propertySubmissionPublishingService');

const needsMediaSync = (submission, property) => {
  const submissionImages = Array.isArray(submission?.images) ? submission.images.length : 0;
  if (submissionImages === 0) return false;

  const hasHero = Boolean(property?.heroImage?.url);
  const hasGallery = Array.isArray(property?.gallery) && property.gallery.length > 0;
  return !hasHero && !hasGallery;
};

const needsDataSync = (submission, property) => {
  const needsPrice =
    (!Number.isFinite(property?.price) || property.price <= 0) &&
    Number.isFinite(submission?.price) &&
    submission.price > 0;
  const needsBhk = !property?.bhk && /\bbhk\b/i.test(String(submission?.title || ''));

  return needsPrice || needsBhk;
};

const parseLimit = () => {
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  if (!limitArg) return null;

  const parsed = Number(limitArg.split('=')[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Invalid --limit value. Use a positive number.');
  }

  return Math.floor(parsed);
};

const run = async () => {
  const dryRun = process.argv.includes('--dry-run');
  const limit = parseLimit();

  const summary = {
    scanned: 0,
    alreadyLinked: 0,
    normalizedExisting: 0,
    createdNew: 0,
    errors: 0,
  };

  try {
    await connectDB();

    console.info('Starting approved submission backfill...');
    console.info(`- mode: ${dryRun ? 'dry-run' : 'write'}`);
    if (limit) {
      console.info(`- limit: ${limit}`);
    }

    const query = PropertySubmission.find({ status: 'approved' }).sort({ createdAt: 1 });
    if (limit) query.limit(limit);

    const submissions = await query;

    for (const submission of submissions) {
      summary.scanned += 1;

      try {
        const publishedProperty = await findPublishedProperty(submission);

        if (!publishedProperty) {
          if (dryRun) {
            summary.createdNew += 1;
            continue;
          }

          await ensureSubmissionPublished(submission, { approvedAt: submission.updatedAt || new Date() });
          await submission.save();
          summary.createdNew += 1;
          continue;
        }

        const needsSubmissionLink =
          !submission.publishedProperty ||
          String(submission.publishedProperty) !== String(publishedProperty._id);
        const needsSourceLink =
          !publishedProperty.sourceSubmission ||
          String(publishedProperty.sourceSubmission) !== String(submission._id);
        const needsStatusSync = publishedProperty.status !== 'approved' || publishedProperty.isActive !== true;
        const needsPayloadSync =
          needsMediaSync(submission, publishedProperty) || needsDataSync(submission, publishedProperty);

        if (!needsSubmissionLink && !needsSourceLink && !needsStatusSync && !needsPayloadSync) {
          summary.alreadyLinked += 1;
          continue;
        }

        if (dryRun) {
          summary.normalizedExisting += 1;
          continue;
        }

        await ensureSubmissionPublished(submission, { approvedAt: submission.updatedAt || new Date() });
        await submission.save();

        summary.normalizedExisting += 1;
      } catch (error) {
        summary.errors += 1;
        console.error(`Failed for submission ${submission._id}: ${error.message}`);
      }
    }

    const linkedApprovedSubmissions = await PropertySubmission.countDocuments({
      status: 'approved',
      publishedProperty: { $ne: null },
    });

    const publishedFromSubmissions = await Property.countDocuments({
      sourceSubmission: { $ne: null },
      status: 'approved',
      isActive: true,
    });

    console.info('Approved submission backfill completed.');
    console.info(`- scanned: ${summary.scanned}`);
    console.info(`- already linked: ${summary.alreadyLinked}`);
    console.info(`- normalized existing links: ${summary.normalizedExisting}`);
    console.info(`- created new properties: ${summary.createdNew}`);
    console.info(`- errors: ${summary.errors}`);
    console.info(`- approved submissions linked to property: ${linkedApprovedSubmissions}`);
    console.info(`- active approved properties from submissions: ${publishedFromSubmissions}`);

    if (dryRun) {
      console.info('Dry run completed. Re-run without --dry-run to apply changes.');
    }
  } catch (error) {
    console.error('Approved submission backfill failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();

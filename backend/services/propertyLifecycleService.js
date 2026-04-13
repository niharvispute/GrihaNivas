const cron = require('node-cron');
const Property = require('../models/mongoose/Property');
const { deleteFile, deleteFiles } = require('./cloudinaryService');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const getCutoffDate = () => new Date(Date.now() - THIRTY_DAYS_MS);

const cleanupRejectedProperties = async ({ cutoffDate = getCutoffDate() } = {}) => {
  const rejectedProperties = await Property.find({
    status: 'rejected',
    rejectedAt: { $lt: cutoffDate },
  }).select('heroImage gallery floorPlans brochure');

  let deletedCount = 0;

  for (const property of rejectedProperties) {
    const imagePublicIds = [
      property.heroImage?.publicId,
      ...(property.gallery || []).map((item) => item.publicId),
      ...(property.floorPlans || []).map((item) => item.publicId),
    ].filter(Boolean);

    if (imagePublicIds.length) {
      await deleteFiles(imagePublicIds, 'image');
    }

    if (property.brochure?.publicId) {
      await deleteFile(property.brochure.publicId, 'raw');
    }

    await property.deleteOne();
    deletedCount += 1;
  }

  return {
    scannedCount: rejectedProperties.length,
    deletedCount,
    cutoffDate,
  };
};

const startRejectedPropertyCleanupJob = () => {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const enabled = process.env.REJECTED_PROPERTY_CLEANUP_ENABLED !== 'false';
  if (!enabled) {
    console.info('Rejected property cleanup job is disabled by environment flag.');
    return null;
  }

  const cronExpression = process.env.REJECTED_PROPERTY_CLEANUP_CRON || '0 0 * * *';

  const task = cron.schedule(cronExpression, async () => {
    try {
      const result = await cleanupRejectedProperties();
      console.info(
        `[PropertyCleanup] deleted=${result.deletedCount}, scanned=${result.scannedCount}, cutoff=${result.cutoffDate.toISOString()}`
      );
    } catch (error) {
      console.error('[PropertyCleanup] failed:', error.message);
    }
  });

  console.info(`[PropertyCleanup] scheduled with cron "${cronExpression}"`);
  return task;
};

module.exports = {
  cleanupRejectedProperties,
  startRejectedPropertyCleanupJob,
};

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../config/db');
const { disconnectDB } = require('../config/db');
const Property = require('../models/mongoose/Property');

const run = async () => {
  try {
    await connectDB();

    console.info('Starting property lifecycle migration...');

    const copyCreatedByResult = await Property.updateMany(
      {
        $or: [{ createdBy: { $exists: false } }, { createdBy: null }],
        postedBy: { $exists: true, $ne: null },
      },
      [{ $set: { createdBy: '$postedBy' } }]
    );

    const approvedResult = await Property.updateMany(
      {
        $or: [{ status: { $exists: false } }, { status: null }],
        isActive: true,
      },
      {
        $set: {
          status: 'approved',
          approvedAt: new Date(),
          rejectedAt: null,
        },
      }
    );

    const pendingResult = await Property.updateMany(
      {
        $or: [{ status: { $exists: false } }, { status: null }],
        isActive: { $ne: true },
      },
      {
        $set: {
          status: 'pending',
          approvedAt: null,
          rejectedAt: null,
        },
      }
    );

    const normalizeApproved = await Property.updateMany(
      { status: 'approved', isActive: { $ne: true } },
      { $set: { isActive: true } }
    );

    const normalizeRejected = await Property.updateMany(
      { status: 'rejected', isActive: { $ne: false } },
      { $set: { isActive: false } }
    );

    const normalizePending = await Property.updateMany(
      { status: 'pending', isActive: { $ne: false } },
      { $set: { isActive: false } }
    );

    const missingCreatedBy = await Property.countDocuments({
      $or: [{ createdBy: { $exists: false } }, { createdBy: null }],
    });

    console.info('Property lifecycle migration complete.');
    console.info('Summary:');
    console.info(`- createdBy copied from postedBy: ${copyCreatedByResult.modifiedCount}`);
    console.info(`- approved statuses backfilled: ${approvedResult.modifiedCount}`);
    console.info(`- pending statuses backfilled: ${pendingResult.modifiedCount}`);
    console.info(`- approved isActive normalized: ${normalizeApproved.modifiedCount}`);
    console.info(`- rejected isActive normalized: ${normalizeRejected.modifiedCount}`);
    console.info(`- pending isActive normalized: ${normalizePending.modifiedCount}`);
    console.info(`- remaining records without createdBy: ${missingCreatedBy}`);

    if (missingCreatedBy > 0) {
      console.warn('Some properties still do not have createdBy. Please review legacy records manually.');
    }
  } catch (error) {
    console.error('Property lifecycle migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();

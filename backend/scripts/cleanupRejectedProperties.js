'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../config/db');
const { disconnectDB } = require('../config/db');
const { cleanupRejectedProperties } = require('../services/propertyLifecycleService');

const run = async () => {
  try {
    await connectDB();

    const result = await cleanupRejectedProperties();
    console.info('Rejected property cleanup completed.');
    console.info(`- scanned: ${result.scannedCount}`);
    console.info(`- deleted: ${result.deletedCount}`);
    console.info(`- cutoff:  ${result.cutoffDate.toISOString()}`);
  } catch (error) {
    console.error('Rejected property cleanup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();

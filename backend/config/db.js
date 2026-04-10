/**
 * DATABASE CONNECTION — STUB
 *
 * This file will be implemented once the client confirms the database.
 *
 * Option A — MongoDB + Mongoose:
 *   const mongoose = require('mongoose');
 *   await mongoose.connect(process.env.MONGODB_URI);
 *
 * Option B — PostgreSQL + Prisma:
 *   const { PrismaClient } = require('@prisma/client');
 *   const prisma = new PrismaClient();
 *   await prisma.$connect();
 *
 * Option C — PostgreSQL + Sequelize:
 *   const { Sequelize } = require('sequelize');
 *   const sequelize = new Sequelize(process.env.DATABASE_URL);
 *   await sequelize.authenticate();
 */

const connectDB = async () => {
  // TODO: Implement once DB is confirmed by client.
  // See comments above for both MongoDB and PostgreSQL options.
  console.info('⚠️  Database connection pending client confirmation (MongoDB vs PostgreSQL)');
};

module.exports = connectDB;

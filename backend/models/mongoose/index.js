/**
 * Mongoose Models — Barrel export
 *
 * Import all models from this single entry point:
 *   const { User, Property, Lead } = require('../models/mongoose');
 *
 * This also ensures all schemas are registered with Mongoose before any
 * query runs — important for `.populate()` calls that reference other models.
 */

const User           = require('./User');
const Builder        = require('./Builder');
const Property       = require('./Property');
const Lead           = require('./Lead');
const PropertySubmission = require('./PropertySubmission');
const Blog           = require('./Blog');
const Testimonial    = require('./Testimonial');
const Banner         = require('./Banner');
const StampDutyConfig = require('./StampDutyConfig');
const Contact        = require('./Contact');
const AuthOtpFlow    = require('./AuthOtpFlow');
const SystemConfig   = require('./SystemConfig');

module.exports = {
  User,
  Builder,
  Property,
  Lead,
  PropertySubmission,
  Blog,
  Testimonial,
  Banner,
  StampDutyConfig,
  Contact,
  AuthOtpFlow,
  SystemConfig,
};

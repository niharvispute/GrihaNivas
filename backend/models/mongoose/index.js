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
const Property       = require('./Property');
const Lead           = require('./Lead');
const Blog           = require('./Blog');
const Testimonial    = require('./Testimonial');
const Banner         = require('./Banner');
const StampDutyConfig = require('./StampDutyConfig');
const Contact        = require('./Contact');

module.exports = {
  User,
  Property,
  Lead,
  Blog,
  Testimonial,
  Banner,
  StampDutyConfig,
  Contact,
};

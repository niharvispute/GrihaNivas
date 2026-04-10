const mongoose = require('mongoose');

/**
 * StampDutyConfig Model
 *
 * Singleton collection — only ONE record ever exists.
 * Admin can update the rates; the calculator controller fetches the latest one.
 *
 * The `findOneAndUpdate` with `upsert: true` pattern is used in the controller
 * so there's no risk of creating duplicate records.
 *
 * Default values (Maharashtra 2024):
 *   Male   : 6%
 *   Female : 5% (government rebate for female buyers)
 *   Joint  : 5% (when a female is a co-owner)
 *   Registration charge: ₹30,000 flat
 */

const stampDutyConfigSchema = new mongoose.Schema(
  {
    maleRate: {
      type: Number,
      required: [true, 'Male stamp duty rate is required'],
      min: [0, 'Rate cannot be negative'],
      max: [20, 'Rate seems unrealistically high'],
      default: 6,
    },
    femaleRate: {
      type: Number,
      required: [true, 'Female stamp duty rate is required'],
      min: [0, 'Rate cannot be negative'],
      max: [20, 'Rate seems unrealistically high'],
      default: 5,
    },
    jointRate: {
      type: Number,
      required: [true, 'Joint stamp duty rate is required'],
      min: [0, 'Rate cannot be negative'],
      max: [20, 'Rate seems unrealistically high'],
      default: 5,
    },
    registrationCharge: {
      type: Number,
      required: [true, 'Registration charge is required'],
      min: [0, 'Registration charge cannot be negative'],
      default: 30000,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('StampDutyConfig', stampDutyConfigSchema);

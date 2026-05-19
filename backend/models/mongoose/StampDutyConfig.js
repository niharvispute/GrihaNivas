const mongoose = require('mongoose');

const rateSetSchema = new mongoose.Schema(
  {
    maleRate: { type: Number, required: true, min: 0, max: 20, default: 6 },
    femaleRate: { type: Number, required: true, min: 0, max: 20, default: 5 },
    jointRate: { type: Number, required: true, min: 0, max: 20, default: 5 },
    registrationCharge: { type: Number, required: true, min: 0, default: 30000 },
  },
  { _id: false }
);

const stampDutyConfigSchema = new mongoose.Schema(
  {
    buy: { type: rateSetSchema, default: () => ({}) },
    rent: {
      type: rateSetSchema,
      default: () => ({ maleRate: 2, femaleRate: 2, jointRate: 2, registrationCharge: 1000 }),
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('StampDutyConfig', stampDutyConfigSchema);

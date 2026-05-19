const mongoose = require('mongoose');

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) return value;

  const seen = new Set();
  const normalized = [];
  value.forEach((item) => {
    const text = String(item || '').trim();
    if (!text) return;
    const dedupeKey = text.toLowerCase();
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    normalized.push(text);
  });

  return normalized;
};

const systemConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
      immutable: true,
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      default: 'Mumbai',
      trim: true,
    },
    locale: {
      type: String,
      default: 'en-IN',
      trim: true,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    defaultCountryCode: {
      type: String,
      default: '+91',
      trim: true,
    },
    areas: {
      type: [String],
      default: [],
      set: normalizeStringArray,
    },
    bhkValues: {
      type: [String],
      default: ['1', '2', '3', '4', '5'],
      set: normalizeStringArray,
    },
    amenityList: {
      type: [String],
      default: [],
      set: normalizeStringArray,
    },
    propertyTypes: {
      type: [String],
      default: ['buy', 'rent', 'commercial', 'new_launch'],
      set: normalizeStringArray,
    },
    statusOptions: {
      type: [String],
      default: ['pending', 'approved', 'rejected'],
      set: normalizeStringArray,
    },
    furnishingOptions: {
      type: [String],
      default: ['unfurnished', 'semi_furnished', 'furnished'],
      set: normalizeStringArray,
    },
    allowDynamicAreas: {
      type: Boolean,
      default: true,
    },
    allowDynamicAmenities: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

systemConfigSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
const mongoose = require('mongoose');

/**
 * ProjectConfiguration Model
 *
 * Represents one BHK/unit-type variant within a project
 * (e.g., "2BHK - 850 sqft" within "Lodha Park - Worli").
 *
 * Each configuration has its own pricing, area, specs, and media
 * (floor plans, layout photos).
 *
 * A project may have multiple configurations; a project unit belongs to
 * exactly one configuration.
 */

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const configurationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },

    // ── Identity ────────────────────────────────────────────────────────
    bhkType: {
      type: String,
      required: [true, 'BHK type is required'],
      enum: {
        values: ['studio', '1BHK', '2BHK', '3BHK', '4BHK', '4+BHK', 'penthouse', 'commercial'],
        message: 'Invalid BHK type',
      },
    },
    propertyType: {
      type: String,
      enum: {
        values: ['apartment', 'villa', 'plot', 'commercial', 'studio'],
        message: 'Invalid property type',
      },
      default: 'apartment',
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title max 200 chars'],
      default: null, // e.g., "2BHK Premium - Type A"
    },
    description: { type: String, trim: true, default: null },

    // ── Pricing ─────────────────────────────────────────────────────────
    priceMin: { type: Number, min: 0, required: [true, 'Minimum price is required'] },
    priceMax: { type: Number, min: 0, required: [true, 'Maximum price is required'] },

    // ── Area ────────────────────────────────────────────────────────────
    carpetAreaMin:  { type: Number, min: 0, default: null },
    carpetAreaMax:  { type: Number, min: 0, default: null },
    builtupAreaMin: { type: Number, min: 0, default: null },
    builtupAreaMax: { type: Number, min: 0, default: null },

    // ── Specs ───────────────────────────────────────────────────────────
    bathrooms:  { type: Number, min: 0, default: null },
    balconies:  { type: Number, min: 0, default: null },
    parking:    { type: Number, min: 0, default: 0 },

    // ── Media (configuration-specific) ──────────────────────────────────
    floorPlans: { type: [mediaSchema], default: [] },
    gallery: {
      type: [mediaSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'Max 10 config images',
      },
    },

    // ── Availability ────────────────────────────────────────────────────
    totalUnits:     { type: Number, min: 0, default: null },
    availableUnits: { type: Number, min: 0, default: null },

    // ── Sort ────────────────────────────────────────────────────────────
    sortOrder: { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// ── Indexes ──────────────────────────────────────────────────────────────
configurationSchema.index({ projectId: 1 });
configurationSchema.index({ projectId: 1, bhkType: 1 });
configurationSchema.index({ projectId: 1, sortOrder: 1 });

module.exports = mongoose.model('ProjectConfiguration', configurationSchema);

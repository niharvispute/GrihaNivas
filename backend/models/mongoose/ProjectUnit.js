const mongoose = require('mongoose');

/**
 * ProjectUnit Model
 *
 * Represents one physical unit within a project
 * (e.g., Tower A, Floor 3, Unit 301 within "Lodha Park - Worli").
 *
 * Units are inventory records. A unit always belongs to exactly one
 * configuration (1BHK / 2BHK / etc.) inside one project.
 *
 * Status flow:
 *   available → booked → sold
 *                    ↘ hold
 */

const unitSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    configurationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectConfiguration',
      required: [true, 'Configuration reference is required'],
    },

    // ── Location within project ──────────────────────────────────────────
    tower:      { type: String, trim: true, default: null }, // e.g., "Tower A"
    block:      { type: String, trim: true, default: null }, // e.g., "Block 1"
    floor:      { type: Number, default: null },
    unitNumber: { type: String, trim: true, default: null }, // e.g., "301", "A-301"

    // ── Area ────────────────────────────────────────────────────────────
    carpetArea:  { type: Number, min: 0, default: null },
    builtupArea: { type: Number, min: 0, default: null },

    // ── Details ─────────────────────────────────────────────────────────
    facing:   { type: String, trim: true, default: null }, // e.g., "East", "North-East"
    viewType: { type: String, trim: true, default: null }, // e.g., "Garden view", "City view"
    price:    { type: Number, min: 0, default: null },     // Exact price if known

    // ── Inventory Status ─────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ['available', 'sold', 'booked', 'hold'],
        message: 'Invalid unit status',
      },
      default: 'available',
    },

    notes: { type: String, trim: true, default: null }, // internal admin note
  },
  { timestamps: true, versionKey: false }
);

// ── Indexes ──────────────────────────────────────────────────────────────
unitSchema.index({ projectId: 1 });
unitSchema.index({ configurationId: 1 });
unitSchema.index({ projectId: 1, status: 1 });
unitSchema.index({ projectId: 1, configurationId: 1, status: 1 });
// Unique constraint: a unit number is unique within a project (when all parts provided)
unitSchema.index(
  { projectId: 1, tower: 1, floor: 1, unitNumber: 1 },
  { unique: true, sparse: true, partialFilterExpression: { unitNumber: { $type: 'string' } } }
);

module.exports = mongoose.model('ProjectUnit', unitSchema);

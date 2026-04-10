const mongoose = require('mongoose');

/**
 * Lead Model
 *
 * Single collection for ALL lead types — eliminates the need for multiple
 * CRM tables and simplifies admin reporting.
 *
 * Lead types:
 *   buy          — looking to purchase a property
 *   rent         — looking to rent a property
 *   loan         — home loan enquiry
 *   agreement    — rent/sale agreement service
 *   list_property — seller wants to list their property
 *
 * Status flow (enforced in controller — no backward transitions allowed):
 *   new → contacted → qualified → closed
 *
 * Notes array acts as a lightweight CRM activity log.
 */

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    // ── Contact Info ──────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },

    // ── Lead Classification ───────────────────────────────────────────────
    leadType: {
      type: String,
      required: [true, 'Lead type is required'],
      enum: {
        values: ['buy', 'rent', 'loan', 'agreement', 'list_property'],
        message: 'Lead type must be one of: buy, rent, loan, agreement, list_property',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'qualified', 'closed'],
        message: 'Status must be one of: new, contacted, qualified, closed',
      },
      default: 'new',
    },

    // ── Lead Details ──────────────────────────────────────────────────────
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: null,
    },

    // Optional: associated property (e.g., a lead from a property detail page)
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },

    // Budget range (relevant for buy/rent leads)
    budgetMin: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
      default: null,
    },
    budgetMax: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
      default: null,
    },

    // Preferred areas (relevant for buy/rent leads)
    preferredLocations: {
      type: [String],
      default: [],
    },

    // BHK preferences (relevant for buy/rent leads)
    bhkPreferences: {
      type: [Number],
      default: [],
    },

    // ── CRM Fields ────────────────────────────────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: [noteSchema],
      default: [],
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },

    // Where the lead originated (e.g., 'home_page', 'property_detail', 'contact_form')
    source: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

leadSchema.index({ status: 1 });
leadSchema.index({ leadType: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ createdAt: -1 });

// Admin dashboard: count leads created today
leadSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Lead', leadSchema);

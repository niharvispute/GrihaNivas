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
 *   project      — project-level enquiry (brochure, site visit, price request, callback)
 *   list_property      — owner wants to list a single property
 *   project_application — owner/builder applying to bulk-list an entire project;
 *                          admin reviews and personally follows up before
 *                          building the full listing via the admin project wizard
 *
 * Status flow (enforced in controller — one-step moves only):
 *   new ↔ contacted ↔ qualified ↔ closed
 *
 * Notes array acts as a lightweight CRM activity log.
 *
 * Project leads carry optional references to the originating Project,
 * ProjectConfiguration, and ProjectUnit. enquiryType narrows down the
 * kind of project enquiry submitted (brochure, site visit, etc.).
 *
 * projectApplication carries the basic project info submitted with a
 * project_application lead — populated only for that lead type.
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead owner is required'],
    },
    leadType: {
      type: String,
      required: [true, 'Lead type is required'],
      enum: {
        values: ['buy', 'rent', 'loan', 'agreement', 'project', 'list_property', 'project_application'],
        message: 'Lead type must be one of: buy, rent, loan, agreement, project, list_property, project_application',
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

    // ── Project Enquiry Context (optional — null for non-project leads) ──
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    configurationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectConfiguration',
      default: null,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectUnit',
      default: null,
    },
    enquiryType: {
      type: String,
      enum: {
        values: ['general', 'price_request', 'brochure', 'site_visit', 'callback'],
        message: 'Invalid enquiry type',
      },
      default: null,
    },

    // ── Project Application (only for leadType: project_application) ──────
    projectApplication: {
      type: {
        projectName: { type: String, trim: true, default: null },
        builderName: { type: String, trim: true, default: null },
        city: { type: String, trim: true, default: null },
        locality: { type: String, trim: true, default: null },
        approxUnits: { type: Number, min: 0, default: null },
        projectType: {
          type: String,
          enum: {
            values: ['residential', 'commercial', 'mixed', 'plotting'],
            message: 'Invalid project type',
          },
          default: null,
        },
        reraNumber: { type: String, trim: true, default: null },
      },
      default: null,
      _id: false,
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

    // Monthly income (relevant for loan leads)
    monthlyIncome: {
      type: Number,
      min: [0, 'Monthly income cannot be negative'],
      default: null,
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
leadSchema.index({ userId: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ projectId: 1 });

// Admin dashboard: count leads created today
leadSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Lead', leadSchema);

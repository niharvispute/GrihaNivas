const mongoose = require('mongoose');

/**
 * Property Model
 *
 * Covers all four listing types:
 *   buy        — residential sale (apartments, villas, plots)
 *   rent       — residential rental (flats, PGs, studios)
 *   commercial — shops, offices, warehouses
 *   new_launch — off-plan / pre-launch projects
 *
 * Media (images, floor plans, brochure) are stored as Cloudinary URL + publicId pairs.
 * PublicId is required to delete from Cloudinary when a property is removed or updated.
 *
 * Slug is auto-generated from title — set by the controller before create/update.
 */

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    // ── Core ──────────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Property category is required'],
      enum: {
        values: ['buy', 'rent', 'commercial', 'new_launch'],
        message: 'Category must be buy, rent, commercial, or new_launch',
      },
    },

    // ── Pricing ───────────────────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    priceUnit: {
      type: String,
      enum: ['total', 'per_sqft', 'per_month'],
      default: 'total',
    },
    isNegotiable: {
      type: Boolean,
      default: false,
    },

    // ── Location ──────────────────────────────────────────────────────────
    location: {
      area: {
        type: String,
        required: [true, 'Area is required'],
        trim: true,
      },
      address: {
        type: String,
        trim: true,
        default: null,
      },
      city: {
        type: String,
        default: 'Mumbai',
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
        default: null,
      },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },

    // ── Specs ─────────────────────────────────────────────────────────────
    bhk: {
      type: Number,
      min: [1, 'BHK must be at least 1'],
      max: [10, 'BHK cannot exceed 10'],
      default: null,  // Null for commercial/plots
    },
    bathrooms: {
      type: Number,
      min: [1, 'Bathrooms must be at least 1'],
      default: null,
    },
    areaSqft: {
      type: Number,
      min: [1, 'Area must be at least 1 sq ft'],
      default: null,
    },
    floor: {
      type: Number,
      default: null,
    },
    totalFloors: {
      type: Number,
      default: null,
    },
    parking: {
      type: Number,
      default: 0,
    },

    // ── Details ───────────────────────────────────────────────────────────
    furnishing: {
      type: String,
      enum: {
        values: ['unfurnished', 'semi_furnished', 'furnished'],
        message: 'Furnishing must be unfurnished, semi_furnished, or furnished',
      },
      default: null,
    },
    facing: {
      type: String,
      trim: true,
      default: null,
    },
    possession: {
      type: String,
      trim: true,
      default: null,  // e.g., "Ready to Move", "Dec 2025"
    },
    age: {
      type: String,
      trim: true,
      default: null,  // e.g., "5 years", "New Construction"
    },
    reraNumber: {
      type: String,
      trim: true,
      default: null,
    },
    amenities: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },

    // ── Media ─────────────────────────────────────────────────────────────
    heroImage: {
      type: mediaSchema,
      default: null,
    },
    gallery: {
      type: [mediaSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Gallery cannot have more than 20 images',
      },
    },
    floorPlans: {
      type: [mediaSchema],
      default: [],
    },
    brochure: {
      type: mediaSchema,
      default: null,
    },

    // ── Status ────────────────────────────────────────────────────────────
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Meta ──────────────────────────────────────────────────────────────
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [70, 'SEO title cannot exceed 70 characters'],
      default: null,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'SEO description cannot exceed 160 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

propertySchema.index({ slug: 1 });
propertySchema.index({ category: 1 });
propertySchema.index({ 'location.area': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ bhk: 1 });
propertySchema.index({ isFeatured: 1 });
propertySchema.index({ isActive: 1 });
propertySchema.index({ createdAt: -1 });

// Compound indexes for common filter combinations
propertySchema.index({ category: 1, isActive: 1, price: 1 });
propertySchema.index({ category: 1, 'location.area': 1, isActive: 1 });

// 2dsphere index for geo queries (if lat/lng becomes available)
// propertySchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);

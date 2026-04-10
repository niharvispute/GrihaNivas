const mongoose = require('mongoose');

/**
 * Testimonial Model
 *
 * Client testimonials displayed on the home page and landing pages.
 * `order` field controls display sequence — lower number = shown first.
 * `isActive: false` hides testimonials without deleting them.
 */

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Testimonial author name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
      default: null,
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      default: null,
    },
    testimonial: {
      type: String,
      required: [true, 'Testimonial text is required'],
      trim: true,
      maxlength: [800, 'Testimonial cannot exceed 800 characters'],
    },
    photo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

testimonialSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);

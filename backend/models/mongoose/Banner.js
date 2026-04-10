const mongoose = require('mongoose');

/**
 * Banner Model
 *
 * Promotional banners displayed across the site.
 * Position controls WHERE the banner appears (page + slot).
 * `order` controls display priority within the same position.
 *
 * Cloudinary publicId is stored alongside the URL so the old image can be
 * deleted from Cloudinary when a banner is updated or removed.
 */

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: null,
    },
    image: {
      url: {
        type: String,
        required: [true, 'Banner image URL is required'],
      },
      publicId: {
        type: String,
        required: [true, 'Cloudinary public ID is required'],
      },
    },
    link: {
      type: String,
      trim: true,
      default: null,  // Optional — banners can be non-clickable
    },
    position: {
      type: String,
      required: [true, 'Banner position is required'],
      enum: {
        values: ['home_hero', 'home_secondary', 'listing_sidebar', 'blog_sidebar'],
        message: 'Position must be one of: home_hero, home_secondary, listing_sidebar, blog_sidebar',
      },
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

bannerSchema.index({ position: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);

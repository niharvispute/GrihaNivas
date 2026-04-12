const mongoose = require('mongoose');

/**
 * Blog Model
 *
 * Blog posts for the Mumbai Editorial content section.
 *
 * Slug is auto-generated from the title by the controller.
 * Comments are embedded (not referenced) — they're tied to the post lifecycle
 * and there's no need for a separate Comment model.
 *
 * Unapproved comments (isApproved: false) are not returned in public listing —
 * the controller applies this filter.
 */

const commentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Commenter name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isApproved: {
      type: Boolean,
      default: false,  // Requires admin approval before showing publicly
    },
  },
  {
    timestamps: true,
    _id: true,  // Keep _id on comments so admin can approve/delete individual ones
  }
);

const blogSchema = new mongoose.Schema(
  {
    // ── Core Content ──────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Blog title is required'],
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
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
      default: null,
    },

    // ── Classification ────────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Blog category is required'],
      enum: {
        values: ['market_trends', 'buying_guide', 'legal', 'investment', 'lifestyle'],
        message: 'Category must be one of: market_trends, buying_guide, legal, investment, lifestyle',
      },
    },
    tags: {
      type: [String],
      default: [],
    },

    // ── Media ─────────────────────────────────────────────────────────────
    featuredImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    // ── Meta ──────────────────────────────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

    // ── Publishing ────────────────────────────────────────────────────────
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },

    // ── Comments ──────────────────────────────────────────────────────────
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// slug already has unique: true in field definition — no duplicate needed

blogSchema.index({ category: 1 });
blogSchema.index({ isPublished: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ tags: 1 });

// Text index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

// ── Pre-save hook: set publishedAt when first published ──────────────────────

blogSchema.pre('save', function () {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model('Blog', blogSchema);

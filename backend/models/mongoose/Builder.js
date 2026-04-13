const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const builderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Builder name is required'],
      trim: true,
      maxlength: [150, 'Builder name cannot exceed 150 characters'],
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
      trim: true,
      default: null,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: null,
    },
    logo: {
      type: mediaSchema,
      default: null,
    },
    coverImage: {
      type: mediaSchema,
      default: null,
    },
    establishedYear: {
      type: Number,
      min: [1800, 'Established year is invalid'],
      max: [new Date().getFullYear(), 'Established year cannot be in the future'],
      default: null,
    },
    totalProjects: {
      type: Number,
      min: [0, 'Total projects cannot be negative'],
      default: 0,
    },
    headquarters: {
      type: String,
      trim: true,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: [70, 'Meta title cannot exceed 70 characters'],
        default: null,
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'Meta description cannot exceed 160 characters'],
        default: null,
      },
      keywords: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

builderSchema.index({ name: 1 });
builderSchema.index({ isActive: 1, isFeatured: 1 });
builderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Builder', builderSchema);

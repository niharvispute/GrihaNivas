const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const builderFaqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: [300, 'FAQ question cannot exceed 300 characters'],
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'FAQ answer cannot exceed 2000 characters'],
    },
  },
  { _id: false }
);

const builderTestimonialSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, 'Testimonial author cannot exceed 120 characters'],
    },
    role: {
      type: String,
      trim: true,
      maxlength: [150, 'Testimonial role cannot exceed 150 characters'],
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1500, 'Testimonial content cannot exceed 1500 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'Testimonial rating must be at least 1'],
      max: [5, 'Testimonial rating cannot exceed 5'],
      default: 5,
    },
    avatar: {
      type: String,
      trim: true,
      default: null,
    },
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
    aboutHeadline: {
      type: String,
      trim: true,
      maxlength: [200, 'About headline cannot exceed 200 characters'],
      default: null,
    },
    qualityStandards: {
      type: String,
      trim: true,
      maxlength: [250, 'Quality standards text cannot exceed 250 characters'],
      default: null,
    },
    innovation: {
      type: String,
      trim: true,
      maxlength: [250, 'Innovation text cannot exceed 250 characters'],
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
    featuredImages: {
      type: [String],
      default: [],
    },
    faqs: {
      type: [builderFaqSchema],
      default: [],
    },
    testimonials: {
      type: [builderTestimonialSchema],
      default: [],
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
    ongoingProjects: {
      type: Number,
      min: [0, 'Ongoing projects cannot be negative'],
      default: null,
    },
    completedDeliveries: {
      type: Number,
      min: [0, 'Completed deliveries cannot be negative'],
      default: null,
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

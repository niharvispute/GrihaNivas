const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Note cannot exceed 2000 characters'],
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

const videoMetaSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: null },
    size: { type: Number, min: 0, default: null },
    type: { type: String, trim: true, default: null },
    url: { type: String, trim: true, default: null },
    publicId: { type: String, trim: true, default: null },
  },
  { _id: false }
);

const propertySubmissionSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
      maxlength: [120, 'Owner name cannot exceed 120 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    listingType: {
      type: String,
      enum: ['Sale', 'Rent'],
      required: true,
    },
    buildingType: {
      type: String,
      enum: ['Residential', 'Commercial'],
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Property type cannot exceed 100 characters'],
    },
    city: {
      type: String,
      required: true,
      trim: true,
      default: 'Mumbai',
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true,
      maxlength: [200, 'Locality cannot exceed 200 characters'],
    },
    possession: {
      type: String,
      enum: ['Ready to Move', 'Under Construction', 'Available Now', 'Available Soon'],
      required: true,
      trim: true,
    },
    age: {
      type: String,
      trim: true,
      default: null,
    },
    bhk: {
      type: Number,
      min: [1, 'BHK must be at least 1'],
      max: [10, 'BHK cannot exceed 10'],
      default: null,
    },
    rentPerMonth: {
      type: Number,
      min: [0, 'Rent cannot be negative'],
      default: null,
    },
    deposit: {
      type: Number,
      min: [0, 'Deposit cannot be negative'],
      default: null,
    },
    maintenanceCharges: {
      type: Number,
      min: [0, 'Maintenance charges cannot be negative'],
      default: null,
    },
    bathrooms: {
      type: String,
      trim: true,
      required: true,
    },
    balconies: {
      type: String,
      trim: true,
      default: null,
    },
    coveredParking: {
      type: String,
      trim: true,
      default: null,
    },
    openParking: {
      type: String,
      trim: true,
      default: null,
    },
    carpetArea: {
      type: Number,
      min: [1, 'Carpet area must be at least 1 sq ft'],
      default: null,
    },
    totalArea: {
      type: Number,
      min: [1, 'Total area must be at least 1 sq ft'],
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    videoMeta: {
      type: videoMetaSchema,
      default: null,
    },
    floorPlans: {
      type: [String],
      default: [],
    },
    brochure: {
      type: String,
      trim: true,
      default: null,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: null,
    },
    amenities: {
      type: [String],
      default: [],
    },
    feature: {
      type: [String],
      default: [],
    },
    reraUrl: {
      type: String,
      trim: true,
      default: null,
    },
    reraNumber: {
      type: String,
      trim: true,
      default: null,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: null,
    },
    readyToProceed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'approved', 'rejected', 'closed'],
      default: 'new',
    },
    source: {
      type: String,
      trim: true,
      default: 'list_property_form',
    },
    publishedProperty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: [noteSchema],
      default: [],
    },
    closedByOwner: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

propertySubmissionSchema.index({ status: 1, createdAt: -1 });
propertySubmissionSchema.index({ createdBy: 1, createdAt: -1 });
propertySubmissionSchema.index({ phone: 1 });
propertySubmissionSchema.index({ listingType: 1, buildingType: 1 });
propertySubmissionSchema.index({ publishedProperty: 1 });

module.exports = mongoose.model('PropertySubmission', propertySubmissionSchema);

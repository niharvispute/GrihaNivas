const mongoose = require('mongoose');

/**
 * User Model
 *
 * Handles both regular users (role: 'user') and admin accounts (role: 'admin').
 * Authentication: email/phone + password or OTP-based verification.
 *
 * savedProperties and comparedProperties store references to the Property model.
 * Maximum 3 compared properties — enforced in the controller, not the schema.
 */

const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────
    phone: {
      type: String,
      unique: true,
      sparse: true,  // Allows multiple docs with null phone (Google-only accounts)
      trim: true,
      match: [/^\+91[6-9]\d{9}$/, 'Phone must be a valid Indian number in E.164 format (+91XXXXXXXXXX)'],
      // Keep undefined so sparse unique index skips docs without phone.
      default: undefined,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,  // Allows multiple docs with null email
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      // Keep undefined so sparse unique index skips docs without email.
      default: undefined,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      default: null,
    },

    // ── Auth ──────────────────────────────────────────────────────────────
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: { values: ['user', 'admin'], message: 'Role must be user or admin' },
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    firebaseUid: {
      type: String,
      sparse: true,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Profile ───────────────────────────────────────────────────────────
    profilePicture: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    // ── Property Lists ────────────────────────────────────────────────────
    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
    comparedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    // Remove __v from responses by default
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Note: phone and email already have unique indexes from the schema field definitions.
// Only add extra indexes not already implied by field-level constraints.

userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ── Instance Methods ──────────────────────────────────────────────────────────

/**
 * Returns a safe representation of the user (no internal fields).
 * Use this when sending user data in API responses.
 */
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    phone: this.phone,
    email: this.email,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    isVerified: this.isVerified,
    profilePicture: this.profilePicture?.url || null,
    savedProperties: this.savedProperties,
    comparedProperties: this.comparedProperties,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const authOtpFlowSchema = new mongoose.Schema(
  {
    flowType: {
      type: String,
      enum: ['signup_verify', 'forgot_password'],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attemptsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },
    resendAfter: {
      type: Date,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'verified', 'consumed', 'expired'],
      default: 'active',
      index: true,
    },
    resetTokenHash: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto-remove stale flows after expiry.
authOtpFlowSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AuthOtpFlow', authOtpFlowSchema);

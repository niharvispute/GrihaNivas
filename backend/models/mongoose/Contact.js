const mongoose = require('mongoose');

/**
 * Contact Model
 *
 * General enquiries submitted via the contact form.
 * Unlike Leads (which have a sales funnel and CRM lifecycle),
 * Contact messages are simple — just read/unread.
 *
 * Stored in DB for admin to review in the dashboard.
 * Email notification is sent to admin on every new submission (via emailService).
 */

const contactSchema = new mongoose.Schema(
  {
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
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

contactSchema.index({ isRead: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);

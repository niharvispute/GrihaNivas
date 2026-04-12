const { sendContactNotification } = require('../services/emailService');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Contact = require('../models/mongoose/Contact');

// ── POST /api/contact ─────────────────────────────────────────────────────────

const submit = async (req, res, next) => {
  try {
    await Contact.create(req.body);

    sendContactNotification(req.body).catch((err) =>
      console.error('Contact email failed (non-fatal):', err.message)
    );

    return sendCreated(res, 'Message sent. We will get back to you shortly.');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/contact  [admin] ─────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Contact enquiries fetched', contacts);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/contact/:id/read  [admin] ────────────────────────────────────────

const markRead = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { returnDocument: 'after' }
    );
    if (!contact) throw new AppError('Contact not found', 404);

    return sendSuccess(res, 200, 'Marked as read', contact);
  } catch (err) {
    next(err);
  }
};

module.exports = { submit, list, markRead };

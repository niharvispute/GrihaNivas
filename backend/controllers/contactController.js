const { sendContactNotification } = require('../services/emailService');
const { sendCreated } = require('../utils/apiResponse');

// ── POST /api/contact ─────────────────────────────────────────────────────────

const submit = async (req, res, next) => {
  try {
    const contactData = req.body;

    // TODO — MongoDB:
    //   await Enquiry.create(contactData);
    //
    // TODO — PostgreSQL:
    //   await prisma.enquiry.create({ data: contactData });

    // Fire-and-forget — email failure must not break the response
    sendContactNotification(contactData).catch((err) =>
      console.error('Contact email failed (non-fatal):', err.message)
    );

    return sendCreated(res, 'Message sent. We will get back to you shortly.');
  } catch (err) {
    next(err);
  }
};

module.exports = { submit };

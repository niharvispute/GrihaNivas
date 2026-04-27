const { sendSuccess } = require('../utils/apiResponse');
const Offer = require('../models/mongoose/Offer');

// ── GET /api/offers ── public ─────────────────────────────────────────────────
const getOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findOne();
    return sendSuccess(res, 200, 'Offer fetched', offer || null);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/offers ── admin upsert ───────────────────────────────────────────
const upsertOffer = async (req, res, next) => {
  try {
    const { headline, cards, showOnFrontend } = req.body;
    const offer = await Offer.findOneAndUpdate(
      {},
      { headline, cards, showOnFrontend },
      { upsert: true, returnDocument: 'after', runValidators: true, new: true }
    );
    return sendSuccess(res, 200, 'Offer saved', offer);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/offers ── admin ───────────────────────────────────────────────
const deleteOffer = async (req, res, next) => {
  try {
    await Offer.deleteMany({});
    return sendSuccess(res, 200, 'Offer deleted', null);
  } catch (err) {
    next(err);
  }
};

module.exports = { getOffer, upsertOffer, deleteOffer };

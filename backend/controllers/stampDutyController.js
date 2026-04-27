const { sendSuccess } = require('../utils/apiResponse');
const StampDutyConfig = require('../models/mongoose/StampDutyConfig');

const DEFAULT_RATES = {
  buy: { maleRate: 6, femaleRate: 5, jointRate: 5, registrationCharge: 30000 },
  rent: { maleRate: 2, femaleRate: 2, jointRate: 2, registrationCharge: 1000 },
};

// ── GET /api/stamp-duty ───────────────────────────────────────────────────────

const getConfig = async (req, res, next) => {
  try {
    const config = await StampDutyConfig.findOne().sort({ updatedAt: -1 });
    if (!config) return sendSuccess(res, 200, 'Stamp duty config fetched', DEFAULT_RATES);

    return sendSuccess(res, 200, 'Stamp duty config fetched', {
      buy: config.buy,
      rent: config.rent,
      updatedAt: config.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/stamp-duty  [admin] ──────────────────────────────────────────────

const updateConfig = async (req, res, next) => {
  try {
    const { buy, rent } = req.body;

    const config = await StampDutyConfig.findOneAndUpdate(
      {},
      { buy, rent, updatedBy: req.user?._id },
      { upsert: true, returnDocument: 'after', runValidators: true, new: true }
    );

    return sendSuccess(res, 200, 'Stamp duty config updated', {
      buy: config.buy,
      rent: config.rent,
      updatedAt: config.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getConfig, updateConfig };

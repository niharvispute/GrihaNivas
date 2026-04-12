const { sendSuccess } = require('../utils/apiResponse');
const StampDutyConfig = require('../models/mongoose/StampDutyConfig');

const DEFAULT_RATES = {
  maleRate: 6,
  femaleRate: 5,
  jointRate: 5,
  registrationCharge: 30000,
};

// ── GET /api/stamp-duty ───────────────────────────────────────────────────────

const getConfig = async (req, res, next) => {
  try {
    const config = await StampDutyConfig.findOne().sort({ updatedAt: -1 });
    return sendSuccess(res, 200, 'Stamp duty config fetched', config || DEFAULT_RATES);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/stamp-duty  [admin] ──────────────────────────────────────────────

const updateConfig = async (req, res, next) => {
  try {
    const { maleRate, femaleRate, jointRate, registrationCharge } = req.body;

    // Upsert — only one config document ever exists
    const config = await StampDutyConfig.findOneAndUpdate(
      {},
      { maleRate, femaleRate, jointRate, registrationCharge, updatedAt: new Date() },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    return sendSuccess(res, 200, 'Stamp duty config updated', config);
  } catch (err) {
    next(err);
  }
};

module.exports = { getConfig, updateConfig };

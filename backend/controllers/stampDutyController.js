const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

// Fallback rates — used until DB config is seeded
const DEFAULT_RATES = {
  maleRate: 6,
  femaleRate: 5,
  jointRate: 5,
  registrationCharge: 30000,
};

// ── GET /api/stamp-duty ───────────────────────────────────────────────────────

const getConfig = async (req, res, next) => {
  try {
    // TODO — MongoDB:
    //   const config = await StampDutyConfig.findOne().sort({ updatedAt: -1 });
    //   return sendSuccess(res, 200, 'Stamp duty config fetched', config || DEFAULT_RATES);

    // TODO — PostgreSQL:
    //   const config = await prisma.stampDutyConfig.findFirst({ orderBy: { updatedAt: 'desc' } });
    //   return sendSuccess(res, 200, 'Stamp duty config fetched', config || DEFAULT_RATES);

    return sendSuccess(res, 200, 'Stamp duty config fetched', DEFAULT_RATES);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/stamp-duty  [admin] ──────────────────────────────────────────────

const updateConfig = async (req, res, next) => {
  try {
    const { maleRate, femaleRate, jointRate, registrationCharge } = req.body;

    const configData = {
      maleRate,
      femaleRate,
      jointRate,
      registrationCharge,
      updatedAt: new Date(),
    };

    // TODO — MongoDB (upsert — only one config record ever exists):
    //   const config = await StampDutyConfig.findOneAndUpdate(
    //     {},
    //     configData,
    //     { upsert: true, new: true, runValidators: true }
    //   );
    //   return sendSuccess(res, 200, 'Stamp duty config updated', config);

    // TODO — PostgreSQL:
    //   const config = await prisma.stampDutyConfig.upsert({
    //     where: { id: 1 },  // singleton record
    //     update: configData,
    //     create: { id: 1, ...configData },
    //   });
    //   return sendSuccess(res, 200, 'Stamp duty config updated', config);

    return sendSuccess(res, 200, 'Stamp duty config updated', configData);
  } catch (err) {
    next(err);
  }
};

module.exports = { getConfig, updateConfig };

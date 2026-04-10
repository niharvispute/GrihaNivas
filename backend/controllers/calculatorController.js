const { sendSuccess } = require('../utils/apiResponse');
const { calculateEMI, calculateStampDuty } = require('../services/calculatorService');

/**
 * Calculator Controller — 100% functional, zero DB dependency.
 * Stamp duty rates fetched from DB when available, fallback hardcoded.
 */

const DEFAULT_STAMP_RATES = {
  maleRate: 6,
  femaleRate: 5,
  jointRate: 5,
  registrationCharge: 30000,
};

// ── POST /api/calculators/emi ─────────────────────────────────────────────────

const emi = async (req, res, next) => {
  try {
    const { principal, annualInterestRate, tenureMonths } = req.body;
    const result = calculateEMI(principal, annualInterestRate, tenureMonths);
    return sendSuccess(res, 200, 'EMI calculated', result);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/calculators/stamp-duty ─────────────────────────────────────────

const stampDuty = async (req, res, next) => {
  try {
    const { propertyValue, ownershipType } = req.body;

    // TODO — Fetch live rates from DB
    //
    // MongoDB:
    //   const config = await StampDutyConfig.findOne().sort({ updatedAt: -1 });
    //   const rates = config || DEFAULT_STAMP_RATES;
    //
    // PostgreSQL:
    //   const config = await prisma.stampDutyConfig.findFirst({ orderBy: { updatedAt: 'desc' } });
    //   const rates = config || DEFAULT_STAMP_RATES;

    const rates = DEFAULT_STAMP_RATES;

    const result = calculateStampDuty(propertyValue, ownershipType, rates);
    return sendSuccess(res, 200, 'Stamp duty calculated', result);
  } catch (err) {
    next(err);
  }
};

module.exports = { emi, stampDuty };

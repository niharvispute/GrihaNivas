const { sendSuccess } = require('../utils/apiResponse');
const { calculateEMI, calculateStampDuty } = require('../services/calculatorService');
const StampDutyConfig = require('../models/mongoose/StampDutyConfig');

/**
 * Calculator Controller
 * Stamp duty rates fetched from DB; falls back to hardcoded defaults if not seeded.
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

    const config = await StampDutyConfig.findOne().sort({ updatedAt: -1 }).lean();
    const rates = config || DEFAULT_STAMP_RATES;

    const result = calculateStampDuty(propertyValue, ownershipType, rates);
    return sendSuccess(res, 200, 'Stamp duty calculated', result);
  } catch (err) {
    next(err);
  }
};

module.exports = { emi, stampDuty };

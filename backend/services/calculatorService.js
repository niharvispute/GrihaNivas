/**
 * Calculator Service — Pure functions, zero side effects, no DB.
 * Fully functional and testable right now.
 */

/**
 * Calculate monthly EMI using the standard amortization formula.
 *
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 * Where:
 *   P = principal
 *   r = monthly interest rate (annual / 12 / 100)
 *   n = tenure in months
 *
 * @param {number} principal          - Loan amount in INR
 * @param {number} annualInterestRate - Annual interest rate (e.g., 8.5 for 8.5%)
 * @param {number} tenureMonths       - Loan tenure in months
 * @returns {{ emi, totalPayable, totalInterest, principal, breakdown }}
 */
const calculateEMI = (principal, annualInterestRate, tenureMonths) => {
  const monthlyRate = annualInterestRate / 12 / 100;

  let emi;

  // Edge case: 0% interest rate
  if (monthlyRate === 0) {
    emi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    emi = (principal * monthlyRate * factor) / (factor - 1);
  }

  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;

  return {
    principal: Math.round(principal),
    emi: Math.round(emi),
    totalPayable: Math.round(totalPayable),
    totalInterest: Math.round(totalInterest),
    tenureMonths,
    annualInterestRate,
    // Amortization summary (first/last month preview)
    breakdown: {
      firstMonthInterest: Math.round(principal * monthlyRate),
      firstMonthPrincipal: Math.round(emi - principal * monthlyRate),
    },
  };
};

/**
 * Calculate stamp duty and registration charges for Mumbai properties.
 *
 * Rates are passed in from the controller (fetched from DB or fallback config).
 * This function never reads rates directly — keeps it pure and testable.
 *
 * @param {number} propertyValue  - Property value in INR
 * @param {'male'|'female'|'joint'} ownershipType
 * @param {{ maleRate, femaleRate, jointRate, registrationCharge }} rates
 * @returns {{ propertyValue, ownershipType, stampDutyRate, stampDuty, registrationCharge, totalCharges }}
 */
const calculateStampDuty = (propertyValue, ownershipType, rates) => {
  const rateMap = {
    male:   rates.maleRate,
    female: rates.femaleRate,
    joint:  rates.jointRate,
  };

  const stampDutyRate = rateMap[ownershipType];
  const stampDuty = Math.round((propertyValue * stampDutyRate) / 100);
  const totalCharges = stampDuty + rates.registrationCharge;

  return {
    propertyValue,
    ownershipType,
    stampDutyRate: `${stampDutyRate}%`,
    stampDuty,
    registrationCharge: rates.registrationCharge,
    totalCharges,
  };
};

/**
 * Calculate stamp duty for a Leave & License (rental) agreement.
 *
 * Formula (Maharashtra):
 *   totalRent        = fixedRent × months  OR  Σ(slabRent × slabMonths)
 *   notionalInterest = refundableDeposit × 10% × (months / 12)
 *   stampableAmount  = totalRent + nonRefundableDeposit + notionalInterest
 *   stampDuty        = Math.ceil(stampableAmount × 0.25%)
 *   registrationFee  = 1000 (urban) | 500 (rural)
 *   totalPayable     = stampDuty + registrationFee + dhc
 *
 * @param {object} params
 * @param {number} params.licensePeriodMonths
 * @param {'fixed'|'varying'} params.rentType
 * @param {number} [params.fixedMonthlyRent]
 * @param {Array<{fromMonth:number, toMonth:number, monthlyRent:number}>} [params.varyingRentRows]
 * @param {number} [params.refundableDeposit=0]
 * @param {number} [params.nonRefundableDeposit=0]
 * @param {'urban'|'rural'} params.propertyArea
 * @param {number} [dhc=300] - Document Handling Charges (configurable)
 * @returns {object}
 */
const calculateRentStampDuty = (params, dhc = 300) => {
  const {
    licensePeriodMonths,
    rentType,
    fixedMonthlyRent,
    varyingRentRows,
    refundableDeposit = 0,
    nonRefundableDeposit = 0,
    propertyArea,
  } = params;

  // 1. Total rent
  let totalRent;
  if (rentType === 'fixed') {
    totalRent = fixedMonthlyRent * licensePeriodMonths;
  } else {
    totalRent = varyingRentRows.reduce((sum, row) => {
      const months = row.toMonth - row.fromMonth + 1;
      return sum + row.monthlyRent * months;
    }, 0);
  }

  // 2. Period in years
  const periodYears = licensePeriodMonths / 12;

  // 3. Notional interest on refundable deposit @ 10% p.a.
  const notionalInterest = refundableDeposit * 0.1 * periodYears;

  // 4. Stampable amount
  const stampableAmount = totalRent + nonRefundableDeposit + notionalInterest;

  // 5. Stamp duty @ 0.25%, rounded up to nearest rupee
  const stampDuty = Math.ceil(stampableAmount * 0.0025);

  // 6. Registration fee (flat)
  const registrationFee = propertyArea === 'urban' ? 1000 : 500;

  // 7. Total payable
  const totalPayable = stampDuty + registrationFee + dhc;

  return {
    licensePeriodMonths,
    rentType,
    periodYears,
    totalRent: Math.round(totalRent),
    refundableDeposit,
    nonRefundableDeposit,
    notionalInterest: Math.round(notionalInterest),
    stampableAmount: Math.round(stampableAmount),
    stampDutyRate: '0.25%',
    stampDuty,
    propertyArea,
    registrationFee,
    dhc,
    totalPayable,
  };
};

module.exports = { calculateEMI, calculateStampDuty, calculateRentStampDuty };

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

module.exports = { calculateEMI, calculateStampDuty };

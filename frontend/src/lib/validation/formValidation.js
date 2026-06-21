// Shared validation helpers — returns null on pass, error string on fail

const NAME_REGEX = /^[a-zA-Z\s.']+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_REGEX = /^[6-9]\d{9}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export function validateName(value) {
  const v = String(value || '').trim();
  if (!v) return 'Please enter your full name.';
  if (v.length < 2) return 'Name must be at least 2 characters long.';
  if (v.length > 50) return 'Name must not exceed 50 characters.';
  if (!NAME_REGEX.test(v)) return 'Name can contain only letters and spaces.';
  return null;
}

export function validateOwnerName(value) {
  const v = String(value || '').trim();
  if (!v) return 'Please enter owner name.';
  if (v.length > 100) return 'Owner name must not exceed 100 characters.';
  return null;
}

export function validateEmail(value, { required = false } = {}) {
  const v = String(value || '').trim();
  if (!v) return required ? 'Please enter your email address.' : null;
  if (v.length > 100) return 'Email address must not exceed 100 characters.';
  if (!EMAIL_REGEX.test(v)) return 'Please enter a valid email address.';
  return null;
}

export function validatePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'Please enter your mobile number.';
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 10) return 'Mobile number must be exactly 10 digits.';
  if (!PHONE_DIGITS_REGEX.test(digits)) return 'Please enter a valid Indian mobile number.';
  return null;
}

export function validatePassword(value) {
  const v = String(value || '');
  if (!v) return 'Please enter your password.';
  if (v.length < 8) return 'Password must be at least 8 characters long.';
  if (!STRONG_PASSWORD_REGEX.test(v))
    return 'Password must include uppercase, lowercase, number, and special character.';
  return null;
}

export function validateConfirmPassword(password, confirmValue) {
  if (!confirmValue) return 'Please confirm your password.';
  if (password !== confirmValue) return 'Password and confirm password do not match.';
  return null;
}

export function validateMessage(value, { required = false, max = 500 } = {}) {
  const v = String(value || '').trim();
  if (!v) return required ? 'Please enter your message.' : null;
  if (v.length > max) return `Message must not exceed ${max} characters.`;
  return null;
}

export function validateLocality(value) {
  if (!String(value || '').trim()) return 'Please enter the property location.';
  return null;
}

export function validateCarpetArea(value) {
  const v = String(value || '').trim();
  if (!v) return 'Please enter carpet area.';
  if (!/^\d+(\.\d+)?$/.test(v)) return 'Carpet area can contain only numbers.';
  if (Number(v) <= 0) return 'Carpet area must be greater than 0.';
  return null;
}

export function validateTotalArea(carpetArea, totalArea) {
  const v = String(totalArea || '').trim();
  if (!v) return null;
  if (!/^\d+(\.\d+)?$/.test(v)) return 'Built-up area can contain only numbers.';
  const carpet = Number(String(carpetArea || ''));
  const total = Number(v);
  if (carpet > 0 && total > 0 && total < carpet)
    return 'Total area cannot be less than carpet area.';
  return null;
}

// Sanity bounds — the price field is the full amount in rupees, not lakhs/crores.
// These catch unit-entry mistakes (e.g. typing "4.52" meaning ₹4.52 Lac) and
// implausible values, while staying loose enough to avoid false positives.
const MIN_SALE_PRICE = 100000; // ₹1 Lakh — below this is almost always a unit error
const MAX_SALE_PRICE = 100000000000; // ₹1,000 Cr — generous upper guard
const MIN_PRICE_PER_SQFT = 1000; // far below any real MMR rate; flags gross errors only
const MIN_RENT = 1000; // ₹1,000/month
const MAX_RENT = 50000000; // ₹5 Cr/month — generous upper guard

export function validatePrice(value, { carpetArea } = {}) {
  const v = String(value || '').replace(/,/g, '').trim();
  if (!v) return 'Please enter property price.';
  if (!/^\d+(\.\d+)?$/.test(v)) return 'Property price can contain only numbers.';
  const amount = Number(v);
  if (amount <= 0) return 'Property price must be greater than 0.';
  if (amount < MIN_SALE_PRICE)
    return 'Price looks too low — enter the full amount in rupees (e.g. 9000000 for ₹90 Lac), not in lakhs.';
  if (amount > MAX_SALE_PRICE) return 'Price seems too high. Please verify the amount.';

  const area = Number(String(carpetArea || '').replace(/,/g, ''));
  if (area > 0 && amount / area < MIN_PRICE_PER_SQFT) {
    return `Price looks too low for the carpet area (₹${Math.round(
      amount / area
    )}/sq.ft). Please verify the amount and unit.`;
  }
  return null;
}

export function validateRent(value) {
  const v = String(value || '').replace(/,/g, '').trim();
  if (!v) return 'Please enter rent amount.';
  if (!/^\d+(\.\d+)?$/.test(v)) return 'Rent amount can contain only numbers.';
  const amount = Number(v);
  if (amount <= 0) return 'Rent amount must be greater than 0.';
  if (amount < MIN_RENT)
    return 'Rent looks too low — enter the monthly rent in rupees (e.g. 25000).';
  if (amount > MAX_RENT) return 'Rent seems too high. Please verify the amount.';
  return null;
}

export function validateNumericOptional(value, label) {
  const v = String(value || '').replace(/,/g, '').trim();
  if (!v) return null;
  if (!/^\d+(\.\d+)?$/.test(v)) return `${label} can contain only numbers.`;
  return null;
}

export function validatePropertyTitle(value) {
  const v = String(value || '').trim();
  if (!v) return 'Please enter the property title.';
  if (v.length < 5) return 'Property title must be at least 5 characters long.';
  if (v.length > 100) return 'Property title must not exceed 100 characters.';
  return null;
}

export function validatePropertyDescription(value) {
  const v = String(value || '').trim();
  if (!v) return 'Please enter property description.';
  if (v.length < 50) return 'Description must be at least 50 characters long.';
  if (v.length > 2000) return 'Description must not exceed 2000 characters.';
  return null;
}

export function collectErrors(validations) {
  const errors = {};
  let hasError = false;
  for (const [field, error] of Object.entries(validations)) {
    if (error) {
      errors[field] = error;
      hasError = true;
    }
  }
  return { errors, hasError };
}

const INDIA_PHONE_DIGITS_REGEX = /^[6-9]\d{9}$/;
const INDIA_E164_PHONE_REGEX = /^\+91[6-9]\d{9}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const getPhoneDigits = (value) => String(value || '').replace(/\D/g, '');

export const normalizeIndianPhoneInput = (value) => {
  const digits = getPhoneDigits(value);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
};

export const toIndianPhoneE164 = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  if (INDIA_E164_PHONE_REGEX.test(raw)) {
    return raw;
  }

  const normalizedDigits = normalizeIndianPhoneInput(raw);
  if (!INDIA_PHONE_DIGITS_REGEX.test(normalizedDigits)) {
    return null;
  }

  return `+91${normalizedDigits}`;
};

export const normalizeAuthIdentifier = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (EMAIL_REGEX.test(raw)) {
    return raw.toLowerCase();
  }

  const normalizedPhone = toIndianPhoneE164(raw);
  if (normalizedPhone) {
    return normalizedPhone;
  }

  const digits = getPhoneDigits(raw);
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  return raw;
};

export const isValidAuthIdentifier = (value) => {
  const normalized = normalizeAuthIdentifier(value);
  return EMAIL_REGEX.test(normalized) || INDIA_E164_PHONE_REGEX.test(normalized);
};

// Password must be at least 8 chars and contain uppercase, lowercase, and digit
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const isValidPassword = (value) => PASSWORD_REGEX.test(String(value || ''));

export { EMAIL_REGEX, INDIA_PHONE_DIGITS_REGEX, INDIA_E164_PHONE_REGEX };

const slugifyLib = require('slugify');

/**
 * Generate a URL-safe slug from a string.
 *
 * @param {string} text - Input string (e.g. property title, blog title)
 * @returns {string} slug
 *
 * Examples:
 *   "3BHK Apartment in Worli" → "3bhk-apartment-in-worli"
 *   "Marine Drive Luxe — Sea View" → "marine-drive-luxe-sea-view"
 */
const generateSlug = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('slugify: input must be a non-empty string');
  }

  return slugifyLib(text, {
    lower: true,
    strict: true,      // strip special characters
    trim: true,
  });
};

/**
 * Generate a unique slug by appending a timestamp suffix.
 * Use this when you need guaranteed uniqueness without a DB round-trip.
 *
 * @param {string} text
 * @returns {string} slug with timestamp suffix
 *
 * Example: "sea-view-apartment-1712750000000"
 */
const generateUniqueSlug = (text) => {
  const base = generateSlug(text);
  const suffix = Date.now();
  return `${base}-${suffix}`;
};

module.exports = { generateSlug, generateUniqueSlug };

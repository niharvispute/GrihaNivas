/**
 * Location search helpers.
 *
 * The listing API matches `location.area` with a case-insensitive regex, so a
 * free-text location only needs to be recognised as *plausible* before we
 * navigate. Anything that matches no known area is a genuine typo and must be
 * reported to the user instead of silently loading every location.
 */

export const normalizeAreaKey = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

/**
 * Resolve free-text location input against the known area list.
 *
 * - Exact (case-insensitive) hit  → the canonical area label.
 * - Partial hit (e.g. "bandra")   → the typed text, so the API regex can match
 *                                   every area containing it (Bandra West/East).
 * - No hit                        → null, meaning "invalid location".
 */
export const resolveAreaInput = (input, knownAreas = []) => {
  const key = normalizeAreaKey(input);
  if (!key) return null;

  const areas = Array.isArray(knownAreas) ? knownAreas.filter(Boolean) : [];

  const exact = areas.find((area) => normalizeAreaKey(area) === key);
  if (exact) return exact;

  const partial = areas.some((area) => normalizeAreaKey(area).includes(key));
  if (partial) return String(input).trim();

  return null;
};

/**
 * Escapes regex metacharacters so user-supplied search text is matched
 * literally. Without this, input like "(" throws a SyntaxError and input like
 * ".*" silently matches everything.
 */
const escapeRegex = (value) => String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { escapeRegex };

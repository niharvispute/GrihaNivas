/**
 * Pagination utility.
 *
 * Parses query params and returns a pagination object
 * that works identically for both MongoDB and PostgreSQL.
 *
 * Usage in controller:
 *   const { page, limit, skip, buildMeta } = parsePagination(req.query);
 *   const data = await Model.find().skip(skip).limit(limit);
 *   const total = await Model.countDocuments();
 *   res.json({ data, meta: buildMeta(total) });
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parse and validate pagination query parameters.
 *
 * @param {object} query - req.query
 * @returns {{ page, limit, skip, buildMeta }}
 */
const parsePagination = (query = {}) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  // Fallback to defaults if values are invalid
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE;
  }
  if (isNaN(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const skip = (page - 1) * limit;

  /**
   * Build pagination metadata for the response envelope.
   *
   * @param {number} total - Total record count from DB
   * @returns {object} meta
   */
  const buildMeta = (total) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  });

  return { page, limit, skip, buildMeta };
};

module.exports = { parsePagination };

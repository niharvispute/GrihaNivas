const { uploadPropertyMedia, deleteFiles } = require('../services/cloudinaryService');
const { generateUniqueSlug } = require('../utils/slugify');
const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Property = require('../models/mongoose/Property');

/**
 * Property Controller
 *
 * Field mapping (Mongoose model names used throughout):
 *   gallery     — array of { url, publicId } (was `images` in old stub)
 *   brochure    — { url, publicId } object   (was `brochureUrl`)
 *   views       — Number                     (was `viewsCount`)
 *   floor       — Number                     (was `floorNumber`)
 *   highlights  — [String]                   (was `keyHighlights`)
 *   furnishing  — 'unfurnished' | 'semi_furnished' | 'furnished'
 *   bhk         — Number (1-10)
 *   areaSqft    — Number
 *   postedBy    — set from req.user.id on create
 */

// ── Filter Builder ────────────────────────────────────────────────────────────

const buildMongoFilter = (query) => {
  const { category, bhk, area, minPrice, maxPrice, furnishing, isFeatured } = query;

  const filter = { isActive: true };

  if (category)    filter.category = category;
  if (bhk)         filter.bhk = Number(bhk);
  if (area)        filter['location.area'] = new RegExp(area, 'i');
  if (furnishing)  filter.furnishing = furnishing;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true' || isFeatured === true;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  return filter;
};

const buildMongoSort = (sortBy) => {
  const map = {
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    newest:     { createdAt: -1 },
  };
  return map[sortBy] || map.newest;
};

// ── GET /api/properties ───────────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const filter = buildMongoFilter(req.query);
    const sort   = buildMongoSort(req.query.sortBy);

    const [properties, total] = await Promise.all([
      Property.find(filter).sort(sort).skip(skip).limit(limit).select('-__v'),
      Property.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Properties fetched', properties, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

// ── GET /api/properties/:id ───────────────────────────────────────────────────

const getOne = async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, isActive: true });
    if (!property) throw new AppError('Property not found', 404);

    // fire-and-forget view increment
    Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {});

    return sendSuccess(res, 200, 'Property fetched', property);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/properties/slug/:slug ────────────────────────────────────────────

const getBySlug = async (req, res, next) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug, isActive: true });
    if (!property) throw new AppError('Property not found', 404);

    Property.findByIdAndUpdate(property._id, { $inc: { views: 1 } }).catch(() => {});

    return sendSuccess(res, 200, 'Property fetched', property);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/properties  [admin] ─────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const data = req.body;
    const slug = generateUniqueSlug(data.title);

    let media = { heroImage: null, gallery: [], floorPlans: [], brochure: null };
    if (req.files && Object.keys(req.files).length > 0) {
      media = await uploadPropertyMedia(req.files);
    }

    const property = await Property.create({
      ...data,
      slug,
      heroImage:  media.heroImage,
      gallery:    media.gallery,
      floorPlans: media.floorPlans,
      brochure:   media.brochure,
      postedBy:   req.user.id,
      isActive:   true,
    });

    return sendCreated(res, 'Property created', property);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/properties/:id  [admin] ──────────────────────────────────────────

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.title) {
      updates.slug = generateUniqueSlug(updates.title);
    }

    if (req.files && Object.keys(req.files).length > 0) {
      const media = await uploadPropertyMedia(req.files);
      if (media.heroImage)       updates.heroImage  = media.heroImage;
      if (media.gallery.length)  updates.gallery    = media.gallery;
      if (media.floorPlans.length) updates.floorPlans = media.floorPlans;
      if (media.brochure)        updates.brochure   = media.brochure;
    }

    const property = await Property.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!property) throw new AppError('Property not found', 404);

    return sendSuccess(res, 200, 'Property updated', property);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/properties/:id  [admin] ───────────────────────────────────────

const remove = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) throw new AppError('Property not found', 404);

    // Gather all Cloudinary publicIds for cleanup
    const mediaItems = [
      property.heroImage,
      ...(property.gallery    || []),
      ...(property.floorPlans || []),
      property.brochure,
    ].filter(Boolean);

    const publicIds = mediaItems.map((m) => m.publicId).filter(Boolean);
    if (publicIds.length) {
      await deleteFiles(publicIds, 'image').catch((err) =>
        console.error('Cloudinary cleanup failed (non-fatal):', err.message)
      );
    }

    await property.deleteOne();
    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getOne, getBySlug, create, update, remove };

const { uploadPropertyMedia, deleteFiles, extractPublicId } = require('../services/cloudinaryService');
const { generateSlug, generateUniqueSlug } = require('../utils/slugify');
const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

/**
 * Property Controller
 *
 * Business logic is fully implemented.
 * DB calls are marked TODO with exact code for both MongoDB and PostgreSQL.
 *
 * Filter builder produces a DB-neutral object — see buildPropertyFilter() below.
 */

// ── Filter & Sort Builder ─────────────────────────────────────────────────────

/**
 * Builds a DB-neutral filter + sort description from validated query params.
 * The controller passes this to the DB layer (TODO).
 *
 * @param {object} query - validated req.query (already coerced by Zod)
 * @returns {{ filter, sort }}
 */
const buildPropertyFilter = (query) => {
  const {
    category, bhk, area, minPrice, maxPrice,
    furnishingType, possessionStatus, isFeatured, sortBy,
  } = query;

  // ── MongoDB filter ───────────────────────────────────────────────────────
  // const mongoFilter = { isActive: true };
  // if (category)         mongoFilter.category = category;
  // if (bhk)              mongoFilter.bhk = bhk;
  // if (area)             mongoFilter['location.area'] = new RegExp(area, 'i');
  // if (minPrice || maxPrice) {
  //   mongoFilter.price = {};
  //   if (minPrice) mongoFilter.price.$gte = minPrice;
  //   if (maxPrice) mongoFilter.price.$lte = maxPrice;
  // }
  // if (furnishingType)   mongoFilter.furnishingType = furnishingType;
  // if (possessionStatus) mongoFilter.possessionStatus = possessionStatus;
  // if (isFeatured !== undefined) mongoFilter.isFeatured = isFeatured;

  // ── PostgreSQL / Prisma where clause ─────────────────────────────────────
  // const prismaWhere = { isActive: true };
  // if (category)         prismaWhere.category = category;
  // if (bhk)              prismaWhere.bhk = bhk;
  // if (area)             prismaWhere.area = { contains: area, mode: 'insensitive' };
  // if (minPrice || maxPrice) {
  //   prismaWhere.price = {};
  //   if (minPrice) prismaWhere.price.gte = minPrice;
  //   if (maxPrice) prismaWhere.price.lte = maxPrice;
  // }
  // if (furnishingType)   prismaWhere.furnishingType = furnishingType;
  // if (possessionStatus) prismaWhere.possessionStatus = possessionStatus;
  // if (isFeatured !== undefined) prismaWhere.isFeatured = isFeatured;

  // ── Sort mapping ─────────────────────────────────────────────────────────
  const sortMap = {
    price_asc:  { field: 'price',     direction: 'asc'  },
    price_desc: { field: 'price',     direction: 'desc' },
    newest:     { field: 'createdAt', direction: 'desc' },
  };

  return {
    filter: { isActive: true, category, bhk, area, minPrice, maxPrice, furnishingType, possessionStatus, isFeatured },
    sort: sortMap[sortBy] || sortMap.newest,
  };
};

// ── GET /api/properties ───────────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const { page, limit, skip, buildMeta } = parsePagination(req.query);
    const { filter, sort } = buildPropertyFilter(req.query);

    // TODO — MongoDB (Mongoose):
    //   const [properties, total] = await Promise.all([
    //     Property.find(mongoFilter)
    //       .sort({ [sort.field]: sort.direction === 'asc' ? 1 : -1 })
    //       .skip(skip)
    //       .limit(limit)
    //       .select('-__v'),
    //     Property.countDocuments(mongoFilter),
    //   ]);

    // TODO — PostgreSQL (Prisma):
    //   const [properties, total] = await Promise.all([
    //     prisma.property.findMany({
    //       where: prismaWhere,
    //       orderBy: { [sort.field]: sort.direction },
    //       skip,
    //       take: limit,
    //     }),
    //     prisma.property.count({ where: prismaWhere }),
    //   ]);

    return sendSuccess(res, 200, 'Properties fetched', [], buildMeta(0));
  } catch (err) {
    next(err);
  }
};

// ── GET /api/properties/:id ───────────────────────────────────────────────────

const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO — MongoDB:
    //   const property = await Property.findOne({ _id: id, isActive: true });
    //   if (!property) throw new AppError('Property not found', 404);
    //   await Property.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });

    // TODO — PostgreSQL:
    //   const property = await prisma.property.findFirst({ where: { id, isActive: true } });
    //   if (!property) throw new AppError('Property not found', 404);
    //   await prisma.property.update({ where: { id }, data: { viewsCount: { increment: 1 } } });

    throw new AppError('Property not found', 404);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/properties  [admin] ─────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const data = req.body;

    // 1. Generate slug from title
    const slug = generateUniqueSlug(data.title);

    // 2. Upload all media files to Cloudinary
    let media = { heroImage: null, images: [], floorPlans: [], brochureUrl: null };
    if (req.files && Object.keys(req.files).length > 0) {
      media = await uploadPropertyMedia(req.files);
    }

    // 3. Build the complete property document
    const propertyData = {
      ...data,
      slug,
      heroImage:   media.heroImage,
      images:      media.images,
      floorPlans:  media.floorPlans,
      brochureUrl: media.brochureUrl,
      isActive: true,
      viewsCount: 0,
      savedCount: 0,
      inquiriesCount: 0,
    };

    // TODO — MongoDB:
    //   const property = await Property.create(propertyData);
    //   return sendCreated(res, 'Property created', property);

    // TODO — PostgreSQL:
    //   const property = await prisma.property.create({ data: propertyData });
    //   return sendCreated(res, 'Property created', property);

    return sendCreated(res, 'Property created', { slug, ...media });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/properties/:id  [admin] ──────────────────────────────────────────

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If title is changing, regenerate slug
    if (updates.title) {
      updates.slug = generateUniqueSlug(updates.title);
    }

    // Upload new media if provided
    if (req.files && Object.keys(req.files).length > 0) {
      const media = await uploadPropertyMedia(req.files);
      if (media.heroImage)   updates.heroImage   = media.heroImage;
      if (media.images.length)      updates.images      = media.images;
      if (media.floorPlans.length)  updates.floorPlans  = media.floorPlans;
      if (media.brochureUrl) updates.brochureUrl = media.brochureUrl;
    }

    updates.updatedAt = new Date();

    // TODO — MongoDB:
    //   const property = await Property.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    //   if (!property) throw new AppError('Property not found', 404);
    //   return sendSuccess(res, 200, 'Property updated', property);

    // TODO — PostgreSQL:
    //   const property = await prisma.property.update({ where: { id }, data: updates });
    //   return sendSuccess(res, 200, 'Property updated', property);

    return sendSuccess(res, 200, 'Property updated', { id, ...updates });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/properties/:id  [admin] ───────────────────────────────────────

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO — Fetch property first to get Cloudinary public IDs for cleanup
    //
    // MongoDB:
    //   const property = await Property.findById(id);
    //   if (!property) throw new AppError('Property not found', 404);
    //
    // PostgreSQL:
    //   const property = await prisma.property.findUnique({ where: { id } });
    //   if (!property) throw new AppError('Property not found', 404);

    // Delete all associated Cloudinary files
    // const allUrls = [property.heroImage, ...property.images, ...property.floorPlans].filter(Boolean);
    // const publicIds = allUrls.map(extractPublicId).filter(Boolean);
    // await deleteFiles(publicIds, 'image');
    // if (property.brochureUrl) {
    //   await deleteFiles([extractPublicId(property.brochureUrl)], 'raw');
    // }

    // TODO — MongoDB:   await Property.findByIdAndDelete(id);
    // TODO — PostgreSQL: await prisma.property.delete({ where: { id } });

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getOne, create, update, remove };

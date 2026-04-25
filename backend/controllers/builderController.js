const mongoose = require('mongoose');
const { uploadImage, deleteFile, deleteFiles } = require('../services/cloudinaryService');
const { generateSlug } = require('../utils/slugify');
const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const { sendExcel, formatDate, joinList } = require('../utils/excelExport');
const AppError = require('../utils/AppError');
const Builder = require('../models/mongoose/Builder');
const Property = require('../models/mongoose/Property');
const cache = require('../services/cacheService');

const BUILDER_CACHE_PREFIX = 'builders:';

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Builder.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).select('_id');

    if (!existing) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const parseJsonField = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;

  if (
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (trimmed.startsWith('{') && trimmed.endsWith('}'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
};

const normalizeBuilderPayload = (payload) => {
  const normalized = { ...payload };

  ['featuredImages', 'faqs', 'testimonials', 'seo'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(normalized, field)) {
      normalized[field] = parseJsonField(normalized[field]);
    }
  });

  return normalized;
};

const builderQueryKey = (q) => {
  const { search, isFeatured, city, page, limit } = q;
  return JSON.stringify({ search: search || '', isFeatured: isFeatured || '', city: city || '', page: page || '1', limit: limit || '10' });
};

const listPublic = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const { search, isFeatured, city } = req.query;

    const cacheKey = `${BUILDER_CACHE_PREFIX}list:${builderQueryKey(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return sendSuccess(res, 200, 'Builders fetched', cached.builders, cached.meta);

    const filter = { isActive: true };
    const featured = parseBoolean(isFeatured);
    if (typeof featured === 'boolean') {
      filter.isFeatured = featured;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { headquarters: regex }];
    }

    if (city) {
      const builderIdsWithPropertiesInCity = await Property.distinct('builder', {
        'location.city': { $regex: new RegExp(`^${city}$`, 'i') },
        isActive: true,
        status: 'approved',
      });
      filter._id = { $in: builderIdsWithPropertiesInCity };
    }

    const [builders, total] = await Promise.all([
      Builder.find(filter)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'name slug shortDescription description logo coverImage establishedYear totalProjects ongoingProjects completedDeliveries headquarters isFeatured isActive aboutHeadline qualityStandards innovation'
        )
        .lean(),
      Builder.countDocuments(filter),
    ]);

    const meta = buildMeta(total);
    await cache.set(cacheKey, { builders, meta }, cache.TTL.LIST);

    return sendSuccess(res, 200, 'Builders fetched', builders, meta);
  } catch (err) {
    next(err);
  }
};

const getPublicBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { limit, skip, buildMeta } = parsePagination(req.query);

    const builder = await Builder.findOne({ slug, isActive: true }).select('-__v');
    if (!builder) throw new AppError('Builder not found', 404);

    const propertyFilter = {
      builder: builder._id,
      isActive: true,
      status: 'approved',
    };

    const [properties, total] = await Promise.all([
      Property.find(propertyFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug heroImage price priceUnit location.area category bhk builder')
        .populate('builder', 'name slug logo'),
      Property.countDocuments(propertyFilter),
    ]);

    return sendSuccess(
      res,
      200,
      'Builder fetched',
      {
        builder,
        properties,
      },
      {
        properties: buildMeta(total),
      }
    );
  } catch (err) {
    next(err);
  }
};

const listAdmin = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const { search, isActive, isFeatured } = req.query;

    const filter = {};

    const activeFlag = parseBoolean(isActive);
    if (typeof activeFlag === 'boolean') {
      filter.isActive = activeFlag;
    }

    const featuredFlag = parseBoolean(isFeatured);
    if (typeof featuredFlag === 'boolean') {
      filter.isFeatured = featuredFlag;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { headquarters: regex }, { slug: regex }];
    }

    const [builders, total] = await Promise.all([
      Builder.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Builder.countDocuments(filter),
    ]);

    const builderIds = builders.map((builder) => builder._id);
    let propertyCountMap = new Map();

    if (builderIds.length > 0) {
      const propertyCounts = await Property.aggregate([
        {
          $match: {
            builder: { $in: builderIds },
          },
        },
        {
          $group: {
            _id: '$builder',
            total: { $sum: 1 },
          },
        },
      ]);

      propertyCountMap = new Map(
        propertyCounts.map((entry) => [String(entry._id), entry.total])
      );
    }

    const buildersWithStats = builders.map((builder) => {
      const plain = builder.toObject();
      plain.propertyCount = propertyCountMap.get(String(builder._id)) || 0;
      return plain;
    });

    return sendSuccess(res, 200, 'Admin builders fetched', buildersWithStats, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/builders/export  [admin] ────────────────────────────────

const exportBuilders = async (req, res, next) => {
  try {
    const { search, isActive, isFeatured } = req.query;

    const filter = {};
    const activeFlag = parseBoolean(isActive);
    if (typeof activeFlag === 'boolean') filter.isActive = activeFlag;
    const featuredFlag = parseBoolean(isFeatured);
    if (typeof featuredFlag === 'boolean') filter.isFeatured = featuredFlag;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { headquarters: regex }, { slug: regex }];
    }

    const builders = await Builder.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v -logo.publicId -coverImage.publicId')
      .lean();

    const builderIds = builders.map((b) => b._id);
    let propertyCountMap = new Map();

    if (builderIds.length > 0) {
      const propertyCounts = await Property.aggregate([
        { $match: { builder: { $in: builderIds } } },
        { $group: { _id: '$builder', total: { $sum: 1 } } },
      ]);
      propertyCountMap = new Map(
        propertyCounts.map((entry) => [String(entry._id), entry.total])
      );
    }

    const columns = [
      { header: 'Name', key: 'name', width: 26 },
      { header: 'Slug', key: 'slug', width: 26 },
      { header: 'Headquarters', key: 'headquarters', width: 22 },
      { header: 'Established Year', key: 'establishedYear', width: 16 },
      { header: 'Total Projects', key: 'totalProjects', width: 14 },
      { header: 'Ongoing Projects', key: 'ongoingProjects', width: 16 },
      { header: 'Completed Deliveries', key: 'completedDeliveries', width: 18 },
      { header: 'Property Count', key: 'propertyCount', width: 14 },
      { header: 'Featured', key: 'isFeatured', width: 10 },
      { header: 'Active', key: 'isActive', width: 8 },
      { header: 'Short Description', key: 'shortDescription', width: 40 },
      { header: 'About Headline', key: 'aboutHeadline', width: 30 },
      { header: 'Quality Standards', key: 'qualityStandards', width: 30 },
      { header: 'Innovation', key: 'innovation', width: 30 },
      { header: 'FAQ Count', key: 'faqCount', width: 10 },
      { header: 'Testimonial Count', key: 'testimonialCount', width: 16 },
      { header: 'SEO Keywords', key: 'seoKeywords', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 22 },
      { header: 'Updated At', key: 'updatedAt', width: 22 },
    ];

    const rows = builders.map((b) => ({
      name: b.name || '',
      slug: b.slug || '',
      headquarters: b.headquarters || '',
      establishedYear: b.establishedYear || '',
      totalProjects: b.totalProjects ?? 0,
      ongoingProjects: b.ongoingProjects ?? '',
      completedDeliveries: b.completedDeliveries ?? '',
      propertyCount: propertyCountMap.get(String(b._id)) || 0,
      isFeatured: b.isFeatured ? 'Yes' : 'No',
      isActive: b.isActive ? 'Yes' : 'No',
      shortDescription: b.shortDescription || '',
      aboutHeadline: b.aboutHeadline || '',
      qualityStandards: b.qualityStandards || '',
      innovation: b.innovation || '',
      faqCount: Array.isArray(b.faqs) ? b.faqs.length : 0,
      testimonialCount: Array.isArray(b.testimonials) ? b.testimonials.length : 0,
      seoKeywords: joinList(b.seo?.keywords),
      createdAt: formatDate(b.createdAt),
      updatedAt: formatDate(b.updatedAt),
    }));

    return sendExcel(res, {
      filename: 'bricks_builders',
      sheetName: 'Builders',
      columns,
      rows,
    });
  } catch (err) {
    next(err);
  }
};

const getAdminOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [builder, propertyCount] = await Promise.all([
      Builder.findById(id).select('-__v'),
      Property.countDocuments({ builder: id }),
    ]);

    if (!builder) throw new AppError('Builder not found', 404);

    const payload = builder.toObject();
    payload.propertyCount = propertyCount;

    return sendSuccess(res, 200, 'Admin builder fetched', payload);
  } catch (err) {
    next(err);
  }
};

const toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const builder = await Builder.findByIdAndUpdate(
      id,
      { isFeatured },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!builder) throw new AppError('Builder not found', 404);

    await cache.delByPrefix(BUILDER_CACHE_PREFIX);

    return sendSuccess(
      res,
      200,
      isFeatured ? 'Builder marked as featured' : 'Builder removed from featured list',
      builder
    );
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = normalizeBuilderPayload(req.body || {});
    const baseSlug = payload.slug ? generateSlug(payload.slug) : generateSlug(payload.name);
    payload.slug = await ensureUniqueSlug(baseSlug);

    if (req.files?.logo?.[0]) {
      const uploadedLogo = await uploadImage(req.files.logo[0].buffer, 'bricks/builders', 'builderLogo');
      payload.logo = { url: uploadedLogo.url, publicId: uploadedLogo.publicId };
    }

    if (req.files?.coverImage?.[0]) {
      const uploadedCover = await uploadImage(req.files.coverImage[0].buffer, 'bricks/builders', 'builderCover');
      payload.coverImage = { url: uploadedCover.url, publicId: uploadedCover.publicId };
    }

    const builder = await Builder.create(payload);
    await cache.delByPrefix(BUILDER_CACHE_PREFIX);
    return sendCreated(res, 'Builder created', builder);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = normalizeBuilderPayload(req.body || {});

    const existing = await Builder.findById(id);
    if (!existing) throw new AppError('Builder not found', 404);

    if (updates.slug || updates.name) {
      const baseSlug = generateSlug(updates.slug || updates.name);
      updates.slug = await ensureUniqueSlug(baseSlug, id);
    }

    if (req.files?.logo?.[0]) {
      if (existing.logo?.publicId) {
        deleteFile(existing.logo.publicId, 'image').catch(() => {});
      }
      const uploadedLogo = await uploadImage(req.files.logo[0].buffer, 'bricks/builders', 'builderLogo');
      updates.logo = { url: uploadedLogo.url, publicId: uploadedLogo.publicId };
    }

    if (req.files?.coverImage?.[0]) {
      if (existing.coverImage?.publicId) {
        deleteFile(existing.coverImage.publicId, 'image').catch(() => {});
      }
      const uploadedCover = await uploadImage(req.files.coverImage[0].buffer, 'bricks/builders', 'builderCover');
      updates.coverImage = { url: uploadedCover.url, publicId: uploadedCover.publicId };
    }

    const builder = await Builder.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    await cache.delByPrefix(BUILDER_CACHE_PREFIX);

    return sendSuccess(res, 200, 'Builder updated', builder);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  let session = null;

  try {
    const { id } = req.params;

    let propertyMediaPublicIds = [];
    let builderMediaPublicIds = [];
    let deletedProperties = 0;

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const builder = await Builder.findById(id).session(session);
      if (!builder) throw new AppError('Builder not found', 404);

      const linkedProperties = await Property.find({ builder: id })
        .select('heroImage gallery floorPlans brochure')
        .session(session);

      propertyMediaPublicIds = linkedProperties
        .flatMap((property) => [
          property.heroImage,
          ...(property.gallery || []),
          ...(property.floorPlans || []),
          property.brochure,
        ])
        .filter(Boolean)
        .map((media) => media.publicId)
        .filter(Boolean);

      builderMediaPublicIds = [builder.logo?.publicId, builder.coverImage?.publicId].filter(Boolean);

      const propertyDeleteResult = await Property.deleteMany({ builder: id }, { session });
      deletedProperties = propertyDeleteResult.deletedCount || 0;

      await builder.deleteOne({ session });
    });

    if (propertyMediaPublicIds.length > 0) {
      await deleteFiles(propertyMediaPublicIds, 'image').catch(() => {});
    }

    builderMediaPublicIds.forEach((publicId) => {
      deleteFile(publicId, 'image').catch(() => {});
    });

    await cache.delByPrefix(BUILDER_CACHE_PREFIX);

    return sendSuccess(res, 200, 'Builder and linked properties deleted', {
      builderId: id,
      deletedProperties,
    });
  } catch (err) {
    next(err);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const getPublicCities = async (req, res, next) => {
  try {
    const cities = await Property.distinct('location.city', {
      isActive: true,
      status: 'approved',
      builder: { $ne: null },
    });

    return sendSuccess(res, 200, 'Available cities fetched', cities.filter(Boolean).sort());
  } catch (err) {
    next(err);
  }
};

const linkProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { propertyId, action } = req.body;

    const builder = await Builder.findById(id).select('_id name isActive');
    if (!builder) throw new AppError('Builder not found', 404);

    const property = await Property.findById(propertyId).select('_id title builder status');
    if (!property) throw new AppError('Property not found', 404);
    if (property.status !== 'approved') throw new AppError('Only approved properties can be linked to builders', 400);

    if (action === 'link') {
      if (property.builder && property.builder.toString() !== id) {
        throw new AppError('This property is already linked to another builder', 400);
      }
      property.builder = builder._id;
      await property.save();
      await cache.delByPrefix('properties:');
      return sendSuccess(res, 200, `Property linked to ${builder.name}`, {
        _id: property._id,
        title: property.title,
        builder: property.builder,
      });
    }

    if (action === 'unlink') {
      if (!property.builder || property.builder.toString() !== id) {
        throw new AppError('This property is not linked to this builder', 400);
      }
      property.builder = null;
      await property.save();
      await cache.delByPrefix('properties:');
      return sendSuccess(res, 200, 'Property unlinked from builder', {
        _id: property._id,
        title: property.title,
        builder: null,
      });
    }

    throw new AppError('Invalid action', 400);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPublic,
  getPublicBySlug,
  getPublicCities,
  listAdmin,
  exportBuilders,
  getAdminOne,
  toggleFeatured,
  create,
  update,
  remove,
  linkProperty,
};

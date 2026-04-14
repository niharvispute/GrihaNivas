const mongoose = require('mongoose');
const { uploadImage, deleteFile, deleteFiles } = require('../services/cloudinaryService');
const { generateSlug } = require('../utils/slugify');
const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Builder = require('../models/mongoose/Builder');
const Property = require('../models/mongoose/Property');

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

const listPublic = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const { search, isFeatured } = req.query;

    const filter = { isActive: true };
    const featured = parseBoolean(isFeatured);
    if (typeof featured === 'boolean') {
      filter.isFeatured = featured;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { headquarters: regex }];
    }

    const [builders, total] = await Promise.all([
      Builder.find(filter)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'name slug shortDescription description logo coverImage establishedYear totalProjects ongoingProjects completedDeliveries headquarters isFeatured isActive aboutHeadline qualityStandards innovation'
        ),
      Builder.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Builders fetched', builders, buildMeta(total));
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

module.exports = {
  listPublic,
  getPublicBySlug,
  listAdmin,
  getAdminOne,
  toggleFeatured,
  create,
  update,
  remove,
};

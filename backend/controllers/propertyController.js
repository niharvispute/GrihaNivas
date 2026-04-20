const { uploadPropertyMedia, deleteFiles } = require('../services/cloudinaryService');
const { generateUniqueSlug } = require('../utils/slugify');
const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const { sendExcel, formatDate, joinList } = require('../utils/excelExport');
const AppError = require('../utils/AppError');
const Property = require('../models/mongoose/Property');
const Builder = require('../models/mongoose/Builder');
const User = require('../models/mongoose/User');

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

const buildMongoFilter = async (query) => {
  const {
    category,
    bhk,
    area,
    minPrice,
    maxPrice,
    furnishing,
    isFeatured,
    hasMedia,
    builder,
    builderSlug,
    launchWindow,
  } = query;

  const filter = {
    isActive: true,
    status: 'approved',
  };

  if (category)    filter.category = category;
  if (builder)     filter.builder = builder;
  if (bhk)         filter.bhk = Number(bhk);
  if (area)        filter['location.area'] = new RegExp(area, 'i');
  if (furnishing)  filter.furnishing = furnishing;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true' || isFeatured === true;

  const andConditions = [];

  if (hasMedia === 'true' || hasMedia === true) {
    andConditions.push({
      $or: [
        { 'heroImage.url': { $exists: true, $nin: [null, ''] } },
        { 'gallery.0': { $exists: true } },
      ],
    });
  }

  if (launchWindow === 'true' || launchWindow === true) {
    // New-launch window: under construction OR property age < 2 years.
    andConditions.push({
      $or: [
        { possession: /under\s*construction|under[-\s]*development|ongoing/i },
        { feature: /under\s*construction|under[-\s]*development|ongoing/i },
        { highlights: /under\s*construction|under[-\s]*development|ongoing/i },
        {
          age: /^\s*(?:0(?:\.\d+)?|1(?:\.\d+)?)(?:\s*(?:year|years|yr|yrs))?\s*$/i,
        },
        {
          age: /^\s*<\s*2(?:\s*(?:year|years|yr|yrs))?\s*$/i,
        },
        {
          age: /^\s*(?:less\s*than|under)\s*2(?:\s*(?:year|years|yr|yrs))?\s*$/i,
        },
        {
          age: /^\s*new(?:\s*construction)?\s*$/i,
        },
      ],
    });
  }

  if (!builder && builderSlug) {
    const matchedBuilder = await Builder.findOne({ slug: builderSlug, isActive: true }).select('_id');
    if (!matchedBuilder) {
      filter._id = null;
    } else {
      filter.builder = matchedBuilder._id;
    }
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (andConditions.length) {
    filter.$and = andConditions;
  }

  return filter;
};

const resolveBuilderReference = async (builderId) => {
  if (!builderId) return null;

  const builder = await Builder.findById(builderId).select('_id isActive');
  if (!builder) {
    throw new AppError('Invalid builder selected', 400);
  }

  return builder._id;
};

const buildMongoSort = (sortBy) => {
  const map = {
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    newest:     { createdAt: -1 },
  };
  return map[sortBy] || map.newest;
};

const buildAdminFilter = (query) => {
  const { status, search } = query;
  const filter = {
    status: status || 'pending',
  };

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { title: regex },
      { 'location.area': regex },
      { 'location.city': regex },
      { reraNumber: regex },
    ];
  }

  return filter;
};

const enrichPropertiesWithUserStatus = async (userId, properties) => {
  if (!userId) return properties;

  const user = await User.findById(userId).select('savedProperties comparedProperties');
  if (!user) return properties;

  const savedIds = new Set(user.savedProperties.map((id) => id.toString()));
  const comparedIds = new Set(user.comparedProperties.map((id) => id.toString()));

  const isArray = Array.isArray(properties);
  const items = isArray ? properties : [properties];

  const enriched = items.map((p) => {
    const propertyObj = p.toObject ? p.toObject() : p;
    return {
      ...propertyObj,
      isSaved: savedIds.has(propertyObj._id?.toString()),
      isCompared: comparedIds.has(propertyObj._id?.toString()),
    };
  });

  return isArray ? enriched : enriched[0];
};

// ── GET /api/properties ───────────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const filter = await buildMongoFilter(req.query);
    const sort   = buildMongoSort(req.query.sortBy);

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .populate('builder', 'name slug logo'),
      Property.countDocuments(filter),
    ]);

    const enrichedProperties = await enrichPropertiesWithUserStatus(req.user?.id, properties);

    return sendSuccess(res, 200, 'Properties fetched', enrichedProperties, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

// ── GET /api/properties/:id ───────────────────────────────────────────────────

const getOne = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      isActive: true,
      status: 'approved',
    }).populate('builder', 'name slug logo');
    if (!property) throw new AppError('Property not found', 404);

    // fire-and-forget view increment
    Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {});

    const enrichedProperty = await enrichPropertiesWithUserStatus(req.user?.id, property);

    return sendSuccess(res, 200, 'Property fetched', enrichedProperty);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/properties/slug/:slug ────────────────────────────────────────────

const getBySlug = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      slug: req.params.slug,
      isActive: true,
      status: 'approved',
    }).populate('builder', 'name slug logo');
    if (!property) throw new AppError('Property not found', 404);

    Property.findByIdAndUpdate(property._id, { $inc: { views: 1 } }).catch(() => {});

    const enrichedProperty = await enrichPropertiesWithUserStatus(req.user?.id, property);

    return sendSuccess(res, 200, 'Property fetched', enrichedProperty);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/properties  [admin] ─────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const data = req.body;
    const slug = generateUniqueSlug(data.title);
    const builderRef = await resolveBuilderReference(data.builder);

    let media = { heroImage: null, gallery: [], floorPlans: [], brochure: null };
    if (req.files && Object.keys(req.files).length > 0) {
      media = await uploadPropertyMedia(req.files);
    }

    const property = await Property.create({
      ...data,
      slug,
      builder:    builderRef,
      heroImage:  media.heroImage,
      gallery:    media.gallery,
      floorPlans: media.floorPlans,
      brochure:   media.brochure,
      createdBy:  req.user.id,
      postedBy:   req.user.id,
      status:     'approved',
      approvedAt: new Date(),
      isActive:   true,
      rejectedAt: null,
    });

    return sendCreated(res, 'Property created', property);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/properties/submit  [user] ─────────────────────────────────────

const submit = async (req, res, next) => {
  try {
    const data = req.body;
    const slug = generateUniqueSlug(data.title);
    const builderRef = await resolveBuilderReference(data.builder);

    let media = { heroImage: null, gallery: [], floorPlans: [], brochure: null };
    if (req.files && Object.keys(req.files).length > 0) {
      media = await uploadPropertyMedia(req.files);
    }

    const property = await Property.create({
      ...data,
      slug,
      builder:    builderRef,
      heroImage:  media.heroImage,
      gallery:    media.gallery,
      floorPlans: media.floorPlans,
      brochure:   media.brochure,
      createdBy:  req.user.id,
      postedBy:   req.user.id,
      status:     'pending',
      isActive:   false,
      approvedAt: null,
      rejectedAt: null,
      isFeatured: false,
    });

    return sendCreated(res, 'Property submitted for admin review', {
      id: property._id,
      status: property.status,
      isActive: property.isActive,
      createdAt: property.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/properties/admin  [admin] ──────────────────────────────────────

const adminList = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const filter = buildAdminFilter(req.query);

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email phone role')
        .populate('builder', 'name slug logo')
        .select('-__v'),
      Property.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Admin properties fetched', properties, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

// ── GET /api/properties/export  [admin] ────────────────────────────────────
// Exports all properties (across all statuses) as .xlsx.

const exportProperties = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { title: regex },
        { 'location.area': regex },
        { 'location.city': regex },
        { reraNumber: regex },
      ];
    }

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email phone')
      .populate('builder', 'name slug')
      .select('-__v -heroImage.publicId -gallery.publicId -floorPlans.publicId -brochure.publicId')
      .lean();

    const columns = [
      { header: 'Title', key: 'title', width: 32 },
      { header: 'Slug', key: 'slug', width: 28 },
      { header: 'Category', key: 'category', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Active', key: 'isActive', width: 8 },
      { header: 'Featured', key: 'isFeatured', width: 10 },
      { header: 'Price', key: 'price', width: 14 },
      { header: 'Price Unit', key: 'priceUnit', width: 12 },
      { header: 'Negotiable', key: 'isNegotiable', width: 10 },
      { header: 'BHK', key: 'bhk', width: 6 },
      { header: 'Bathrooms', key: 'bathrooms', width: 10 },
      { header: 'Area (Sqft)', key: 'areaSqft', width: 12 },
      { header: 'Floor', key: 'floor', width: 8 },
      { header: 'Total Floors', key: 'totalFloors', width: 12 },
      { header: 'Parking', key: 'parking', width: 8 },
      { header: 'Furnishing', key: 'furnishing', width: 14 },
      { header: 'Facing', key: 'facing', width: 12 },
      { header: 'Possession', key: 'possession', width: 18 },
      { header: 'Age', key: 'age', width: 14 },
      { header: 'Area', key: 'area', width: 20 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'City', key: 'city', width: 14 },
      { header: 'Pincode', key: 'pincode', width: 10 },
      { header: 'RERA Number', key: 'reraNumber', width: 20 },
      { header: 'Builder', key: 'builder', width: 20 },
      { header: 'Amenities', key: 'amenities', width: 40 },
      { header: 'Highlights', key: 'highlights', width: 40 },
      { header: 'Views', key: 'views', width: 8 },
      { header: 'Saved Count', key: 'savedCount', width: 12 },
      { header: 'Posted By', key: 'postedBy', width: 24 },
      { header: 'Approved At', key: 'approvedAt', width: 22 },
      { header: 'Rejected At', key: 'rejectedAt', width: 22 },
      { header: 'Created At', key: 'createdAt', width: 22 },
      { header: 'Updated At', key: 'updatedAt', width: 22 },
    ];

    const rows = properties.map((p) => ({
      title: p.title || '',
      slug: p.slug || '',
      category: p.category || '',
      status: p.status || '',
      isActive: p.isActive ? 'Yes' : 'No',
      isFeatured: p.isFeatured ? 'Yes' : 'No',
      price: p.price ?? '',
      priceUnit: p.priceUnit || '',
      isNegotiable: p.isNegotiable ? 'Yes' : 'No',
      bhk: p.bhk ?? '',
      bathrooms: p.bathrooms ?? '',
      areaSqft: p.areaSqft ?? '',
      floor: p.floor ?? '',
      totalFloors: p.totalFloors ?? '',
      parking: p.parking ?? 0,
      furnishing: p.furnishing || '',
      facing: p.facing || '',
      possession: p.possession || '',
      age: p.age || '',
      area: p.location?.area || '',
      address: p.location?.address || '',
      city: p.location?.city || '',
      pincode: p.location?.pincode || '',
      reraNumber: p.reraNumber || '',
      builder: p.builder?.name || '',
      amenities: joinList(p.amenities),
      highlights: joinList(p.highlights),
      views: p.views ?? 0,
      savedCount: p.savedCount ?? 0,
      postedBy: p.createdBy ? `${p.createdBy.name || ''} (${p.createdBy.email || p.createdBy.phone || ''})` : '',
      approvedAt: formatDate(p.approvedAt),
      rejectedAt: formatDate(p.rejectedAt),
      createdAt: formatDate(p.createdAt),
      updatedAt: formatDate(p.updatedAt),
    }));

    return sendExcel(res, {
      filename: 'bricks_properties',
      sheetName: 'Properties',
      columns,
      rows,
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/properties/:id/approve  [admin] ─────────────────────────────

const approve = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) throw new AppError('Property not found', 404);

    property.status = 'approved';
    property.isActive = true;
    property.approvedAt = new Date();
    property.rejectedAt = null;
    await property.save();

    return sendSuccess(res, 200, 'Property approved', property);
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/properties/:id/reject  [admin] ──────────────────────────────

const reject = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) throw new AppError('Property not found', 404);

    property.status = 'rejected';
    property.isActive = false;
    property.rejectedAt = new Date();
    await property.save();

    return sendSuccess(res, 200, 'Property rejected', property);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/properties/:id  [admin] ──────────────────────────────────────────

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updates, 'builder')) {
      if (!updates.builder) {
        updates.builder = null;
      } else {
        updates.builder = await resolveBuilderReference(updates.builder);
      }
    }

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

module.exports = {
  list,
  getOne,
  getBySlug,
  create,
  submit,
  adminList,
  exportProperties,
  approve,
  reject,
  update,
  remove,
};

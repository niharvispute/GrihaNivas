const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const { parsePagination } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const cache = require('../services/cacheService');
const Project = require('../models/mongoose/Project');
const ProjectConfiguration = require('../models/mongoose/ProjectConfiguration');
const ProjectUnit = require('../models/mongoose/ProjectUnit');
const Lead = require('../models/mongoose/Lead');
const Builder = require('../models/mongoose/Builder');

/**
 * Project Controller — public endpoints
 *
 * Public behaviour:
 *   - Only `listingStatus: 'active'` projects are exposed
 *   - Unit lists default to `status: 'available'` for the public
 *   - Enquiry creation requires an authenticated user; falls back to a
 *     fire-and-forget lead capture when req.user is missing
 */

const PROJECT_CACHE_PREFIX = 'projects:';

// ── Helpers ──────────────────────────────────────────────────────────────────

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
};

const buildMongoFilter = async (query) => {
  const {
    area,
    projectStatus,
    projectType,
    builderId,
    builderSlug,
    bhkType,
    minPrice,
    maxPrice,
    isFeatured,
    search,
  } = query;

  const filter = { listingStatus: 'active' };

  if (projectStatus) filter.projectStatus = projectStatus;
  if (projectType)   filter.projectType   = projectType;
  if (area)          filter['location.area'] = new RegExp(area, 'i');

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { shortDescription: regex }, { description: regex }];
  }

  if (!builderId && builderSlug) {
    const matched = await Builder.findOne({ slug: builderSlug, isActive: true }).select('_id');
    if (!matched) {
      filter._id = null;
    } else {
      filter.builderId = matched._id;
    }
  } else if (builderId) {
    filter.builderId = builderId;
  }

  if (bhkType) filter.bhkSummary = bhkType;

  if (isFeatured !== undefined) {
    filter.isFeatured = parseBoolean(isFeatured) === true;
  }

  if (minPrice || maxPrice) {
    filter.priceMin = filter.priceMin || {};
    if (maxPrice) {
      filter.priceMax = { ...(filter.priceMax || {}), $lte: Number(maxPrice) };
    }
    if (minPrice) {
      filter.priceMin = { $gte: Number(minPrice) };
    }
  }

  return filter;
};

const buildMongoSort = (sortBy) => {
  const map = {
    newest:     { createdAt: -1 },
    price_asc:  { priceMin: 1 },
    price_desc: { priceMax: -1 },
    name_asc:   { name: 1 },
  };
  return map[sortBy] || map.newest;
};

const projectQueryKey = (q) => {
  const { page, limit, ...rest } = q;
  return JSON.stringify({ ...rest, page: String(page || '1'), limit: String(limit || '10') });
};

// ── GET /api/projects ────────────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const cacheKey = `${PROJECT_CACHE_PREFIX}list:${projectQueryKey(req.query)}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return sendSuccess(res, 200, 'Projects fetched', cached.projects, cached.meta);
    }

    const filter = await buildMongoFilter(req.query);
    const sort   = buildMongoSort(req.query.sortBy);

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('builderId', 'name slug logo isFeatured')
        .select('-__v'),
      Project.countDocuments(filter),
    ]);

    const meta = buildMeta(total);
    await cache.set(cacheKey, { projects, meta }, cache.TTL.LIST);

    return sendSuccess(res, 200, 'Projects fetched', projects, meta);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/projects/slug/:slug ─────────────────────────────────────────────

const getBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cacheKey = `${PROJECT_CACHE_PREFIX}slug:${slug}`;

    let project = await cache.get(cacheKey);
    if (!project) {
      project = await Project.findOne({ slug, listingStatus: 'active' })
        .populate('builderId', 'name slug logo isFeatured headquarters website reraNumber reraUrl');
      if (!project) throw new AppError('Project not found', 404);
      project = project.toObject();
      await cache.set(cacheKey, project, cache.TTL.DETAIL);
    }

    // Fire-and-forget view increment
    Project.findByIdAndUpdate(project._id, { $inc: { views: 1 } }).catch(() => {});

    const [configurations] = await Promise.all([
      ProjectConfiguration.find({ projectId: project._id, isActive: true })
        .sort({ sortOrder: 1, priceMin: 1 })
        .lean(),
    ]);

    return sendSuccess(res, 200, 'Project fetched', {
      ...project,
      configurations,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/projects/:id/configurations ──────────────────────────────────────

const getConfigurations = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({ _id: id, listingStatus: 'active' }).select('_id name slug');
    if (!project) throw new AppError('Project not found', 404);

    const configurations = await ProjectConfiguration.find({ projectId: id, isActive: true })
      .sort({ sortOrder: 1, priceMin: 1 })
      .lean();

    return sendSuccess(res, 200, 'Configurations fetched', configurations);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/projects/:id/units ──────────────────────────────────────────────

const getUnits = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit, skip, buildMeta } = parsePagination(req.query);

    const project = await Project.findOne({ _id: id, listingStatus: 'active' }).select('_id name slug');
    if (!project) throw new AppError('Project not found', 404);

    // Public users see only available units by default
    const filter = { projectId: id };
    if (req.query.configurationId) filter.configurationId = req.query.configurationId;
    if (req.query.tower) filter.tower = req.query.tower;
    if (req.query.floor) filter.floor = Number(req.query.floor);
    if (!req.user || req.user.role !== 'admin') {
      filter.status = req.query.status || 'available';
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    const [units, total] = await Promise.all([
      ProjectUnit.find(filter)
        .sort({ tower: 1, floor: 1, unitNumber: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProjectUnit.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Units fetched', units, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

// ── POST /api/projects/:id/enquiry ───────────────────────────────────────────

const submitEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, email, message, configurationId, unitId, enquiryType } = req.body;

    const project = await Project.findOne({ _id: id, listingStatus: 'active' }).select('_id name slug builderId');
    if (!project) throw new AppError('Project not found', 404);

    // Resolve unit to its configuration if configurationId is missing
    let resolvedConfigId = configurationId || null;
    if (unitId && !resolvedConfigId) {
      const unit = await ProjectUnit.findOne({ _id: unitId, projectId: id }).select('configurationId');
      if (unit) resolvedConfigId = unit.configurationId;
    }

    // User is required for lead creation (existing pattern)
    if (!req.user) {
      throw new AppError('Authentication is required to submit a project enquiry', 401);
    }

    const lead = await Lead.create({
      name,
      phone,
      email: email || null,
      message: message || null,
      leadType: 'project',
      status: 'new',
      userId: req.user.id,
      projectId: id,
      configurationId: resolvedConfigId,
      unitId: unitId || null,
      enquiryType: enquiryType || 'general',
      source: 'project_detail',
    });

    // Fire-and-forget counters
    Promise.all([
      Project.findByIdAndUpdate(id, { $inc: { enquiryCount: 1 } }).catch(() => {}),
    ]).catch(() => {});

    return sendCreated(res, 'Enquiry submitted successfully. Our team will contact you shortly.', {
      leadId: lead._id,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getBySlug,
  getConfigurations,
  getUnits,
  submitEnquiry,
};

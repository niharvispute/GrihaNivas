const mongoose = require('mongoose');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const { sendExcel, formatDate, joinList } = require('../utils/excelExport');
const { parsePagination } = require('../utils/pagination');
const { generateSlug } = require('../utils/slugify');
const {
  uploadProjectMedia,
  uploadConfigurationMedia,
  deleteFile,
  deleteFiles,
  deleteProjectMediaDeep,
} = require('../services/cloudinaryService');
const cache = require('../services/cacheService');
const AppError = require('../utils/AppError');
const Project = require('../models/mongoose/Project');
const ProjectConfiguration = require('../models/mongoose/ProjectConfiguration');
const ProjectUnit = require('../models/mongoose/ProjectUnit');
const Builder = require('../models/mongoose/Builder');

/**
 * Admin Project Controller
 *
 * All endpoints here are gated by protect + adminOnly in routes/projects.js.
 * Auto-derivation:
 *   - On configuration create/update/delete:
 *       Project.bhkSummary  is recomputed from active configurations
 *       Project.priceMin / Project.priceMax are recomputed from active configs
 *   - On unit create/update/delete:
 *       ProjectConfiguration.availableUnits is recomputed
 *
 * Slug uniqueness is enforced by a `ensureUniqueSlug` loop on the projects
 * collection only (not properties).
 */

const PROJECT_CACHE_PREFIX = 'projects:';
const MAX_BULK_IMPORT = 500;

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Project.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).select('_id');

    if (!existing) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

const resolveBuilderReference = async (builderId) => {
  if (!builderId) return null;
  const builder = await Builder.findById(builderId).select('_id isActive');
  if (!builder) {
    throw new AppError('Invalid builder selected', 400);
  }
  return builder._id;
};

const recomputeProjectAggregates = async (projectId) => {
  if (!projectId) return;

  const configs = await ProjectConfiguration.find({
    projectId,
    isActive: true,
  }).select('bhkType priceMin priceMax');

  if (!configs.length) {
    await Project.findByIdAndUpdate(projectId, {
      bhkSummary: [],
      priceMin: null,
      priceMax: null,
    });
    return;
  }

  const bhkSummary = Array.from(new Set(configs.map((c) => c.bhkType))).sort();
  const priceMin = Math.min(...configs.map((c) => c.priceMin || Number.POSITIVE_INFINITY));
  const priceMax = Math.max(...configs.map((c) => c.priceMax || 0));

  await Project.findByIdAndUpdate(projectId, {
    bhkSummary,
    priceMin: Number.isFinite(priceMin) ? priceMin : null,
    priceMax: priceMax > 0 ? priceMax : null,
  });
};

const recomputeConfigAvailability = async (configId) => {
  if (!configId) return;
  const available = await ProjectUnit.countDocuments({
    configurationId: configId,
    status: 'available',
  });
  await ProjectConfiguration.findByIdAndUpdate(configId, { availableUnits: available });
};

const invalidateProjectCaches = async (slug) => {
  await Promise.all([
    cache.delByPrefix(PROJECT_CACHE_PREFIX),
    slug ? cache.delByPrefix(`${PROJECT_CACHE_PREFIX}slug:${slug}`) : Promise.resolve(),
  ]);
};

// ── GET /api/projects/admin ──────────────────────────────────────────────────

const adminList = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const { listingStatus, builderId, projectStatus, search } = req.query;

    const filter = {};
    if (listingStatus) filter.listingStatus = listingStatus;
    if (builderId)    filter.builderId    = builderId;
    if (projectStatus) filter.projectStatus = projectStatus;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { 'location.area': regex },
        { reraNumber: regex },
      ];
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('builderId', 'name slug logo isActive')
        .select('-__v'),
      Project.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Admin projects fetched', projects, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

// ── GET /api/projects/:id  [admin detail] ────────────────────────────────────

const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate(
      'builderId',
      'name slug logo isActive headquarters website reraNumber reraUrl'
    );
    if (!project) throw new AppError('Project not found', 404);

    const configurations = await ProjectConfiguration.find({ projectId: id })
      .sort({ sortOrder: 1, priceMin: 1 })
      .lean();

    return sendSuccess(res, 200, 'Project fetched', {
      ...project.toObject(),
      configurations,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/projects  [admin] ──────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.builderId = await resolveBuilderReference(data.builderId);

    const baseSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    data.slug = await ensureUniqueSlug(baseSlug);

    let media = { heroImage: null, gallery: [], masterPlan: null, brochure: null };

    // First create the project shell, then upload media with the real ID in the folder path
    const shell = await Project.create({
      ...data,
      heroImage: null,
      gallery: [],
      masterPlan: null,
      brochure: null,
    });

    if (req.files && Object.keys(req.files).length > 0) {
      try {
        media = await uploadProjectMedia(req.files, shell._id.toString());
      } catch (uploadErr) {
        // Roll back the shell so we never leave orphan docs
        await Project.findByIdAndDelete(shell._id).catch(() => {});
        throw uploadErr;
      }
    }

    const project = await Project.findByIdAndUpdate(
      shell._id,
      {
        heroImage: media.heroImage,
        gallery: media.gallery,
        masterPlan: media.masterPlan,
        brochure: media.brochure,
      },
      { returnDocument: 'after' }
    );

    await invalidateProjectCaches(project.slug);
    return sendCreated(res, 'Project created', project);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/projects/:id  [admin] ───────────────────────────────────────────

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const existing = await Project.findById(id);
    if (!existing) throw new AppError('Project not found', 404);

    if (updates.builderId) {
      updates.builderId = await resolveBuilderReference(updates.builderId);
    }

    if (updates.name) {
      const baseSlug = generateSlug(updates.name);
      updates.slug = await ensureUniqueSlug(baseSlug, id);
    } else if (updates.slug) {
      updates.slug = await ensureUniqueSlug(generateSlug(updates.slug), id);
    }

    if (req.files && Object.keys(req.files).length > 0) {
      const media = await uploadProjectMedia(req.files, existing._id.toString());

      // Track old publicIds for cleanup of replaced assets
      const oldPublicIds = [];
      if (media.heroImage && existing.heroImage?.publicId) oldPublicIds.push(existing.heroImage.publicId);
      if (media.masterPlan && existing.masterPlan?.publicId) oldPublicIds.push(existing.masterPlan.publicId);
      if (media.brochure && existing.brochure?.publicId) oldPublicIds.push(existing.brochure.publicId);

      if (media.heroImage)  updates.heroImage  = media.heroImage;
      if (media.masterPlan) updates.masterPlan = media.masterPlan;
      if (media.brochure)   updates.brochure   = media.brochure;
      if (media.gallery.length) updates.gallery = media.gallery;

      if (oldPublicIds.length) {
        // Brochure is uploaded as resource_type 'raw' — split if needed
        const imageIds = oldPublicIds.filter((_, idx) => idx < 2);
        if (imageIds.length) deleteFiles(imageIds, 'image').catch(() => {});
      }
    }

    const project = await Project.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    await invalidateProjectCaches(existing.slug);
    return sendSuccess(res, 200, 'Project updated', project);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/projects/:id  [admin] ────────────────────────────────────────

const remove = async (req, res, next) => {
  let session = null;
  try {
    const { id } = req.params;

    session = await mongoose.startSession();
    let project = null;
    let deletedConfigs = 0;
    let deletedUnits = 0;

    await session.withTransaction(async () => {
      project = await Project.findById(id)
        .populate('builderId', 'name slug')
        .session(session);
      if (!project) throw new AppError('Project not found', 404);

      const configs = await ProjectConfiguration.find({ projectId: id }).session(session);
      project = { ...project.toObject(), configurations: configs };

      const configIds = configs.map((c) => c._id);
      const unitDeleteResult = await ProjectUnit.deleteMany({ projectId: id }, { session });
      deletedUnits = unitDeleteResult.deletedCount || 0;

      const configDeleteResult = await ProjectConfiguration.deleteMany({ projectId: id }, { session });
      deletedConfigs = configDeleteResult.deletedCount || 0;

      await Project.deleteOne({ _id: id }, { session });
    });

    // Cloudinary cleanup runs after the DB transaction commits
    await deleteProjectMediaDeep(project);

    await invalidateProjectCaches(project.slug);

    return sendSuccess(res, 200, 'Project and all related data deleted', {
      projectId: id,
      deletedConfigurations: deletedConfigs,
      deletedUnits,
    });
  } catch (err) {
    next(err);
  } finally {
    if (session) await session.endSession();
  }
};

// ── PATCH /api/projects/:id/status  [admin] ───────────────────────────────────

const setListingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { listingStatus } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      { listingStatus },
      { returnDocument: 'after', runValidators: true }
    );
    if (!project) throw new AppError('Project not found', 404);

    await invalidateProjectCaches(project.slug);
    return sendSuccess(res, 200, 'Project listing status updated', project);
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/projects/:id/featured  [admin] ────────────────────────────────

const toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      { isFeatured: Boolean(isFeatured) },
      { returnDocument: 'after', runValidators: true }
    );
    if (!project) throw new AppError('Project not found', 404);

    await invalidateProjectCaches(project.slug);
    return sendSuccess(
      res,
      200,
      isFeatured ? 'Project marked as featured' : 'Project removed from featured list',
      project
    );
  } catch (err) {
    next(err);
  }
};

// ── Configurations ──────────────────────────────────────────────────────────

const createConfiguration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body, projectId: id };

    const project = await Project.findById(id).select('_id slug name');
    if (!project) throw new AppError('Project not found', 404);

    const config = await ProjectConfiguration.create(data);

    if (req.files && Object.keys(req.files).length > 0) {
      const media = await uploadConfigurationMedia(
        req.files,
        id,
        config._id.toString()
      );

      if (media.floorPlans.length) config.floorPlans = media.floorPlans;
      if (media.gallery.length)    config.gallery    = media.gallery;
      await config.save();
    }

    await recomputeProjectAggregates(id);
    await invalidateProjectCaches(project.slug);

    return sendCreated(res, 'Configuration created', config);
  } catch (err) {
    next(err);
  }
};

const updateConfiguration = async (req, res, next) => {
  try {
    const { configId } = req.params;
    const updates = { ...req.body };

    const config = await ProjectConfiguration.findById(configId);
    if (!config) throw new AppError('Configuration not found', 404);

    if (req.files && Object.keys(req.files).length > 0) {
      const media = await uploadConfigurationMedia(
        req.files,
        config.projectId.toString(),
        config._id.toString()
      );
      if (media.floorPlans.length) updates.floorPlans = media.floorPlans;
      if (media.gallery.length)    updates.gallery    = media.gallery;
    }

    const updated = await ProjectConfiguration.findByIdAndUpdate(
      configId,
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    await recomputeProjectAggregates(config.projectId);
    const project = await Project.findById(config.projectId).select('slug');
    if (project) await invalidateProjectCaches(project.slug);

    return sendSuccess(res, 200, 'Configuration updated', updated);
  } catch (err) {
    next(err);
  }
};

const deleteConfiguration = async (req, res, next) => {
  let session = null;
  try {
    const { configId } = req.params;

    session = await mongoose.startSession();
    let projectId = null;
    let projectSlug = null;
    let deletedUnits = 0;
    let publicIds = [];

    await session.withTransaction(async () => {
      const config = await ProjectConfiguration.findById(configId).session(session);
      if (!config) throw new AppError('Configuration not found', 404);

      projectId = config.projectId;
      const project = await Project.findById(projectId).select('slug').session(session);
      projectSlug = project?.slug;

      publicIds = [
        ...(config.floorPlans || []).map((m) => m.publicId),
        ...(config.gallery || []).map((m) => m.publicId),
      ].filter(Boolean);

      const unitDeleteResult = await ProjectUnit.deleteMany({ configurationId: configId }, { session });
      deletedUnits = unitDeleteResult.deletedCount || 0;

      await ProjectConfiguration.deleteOne({ _id: configId }, { session });
    });

    if (publicIds.length) {
      deleteFiles(publicIds, 'image').catch(() => {});
    }

    if (projectId) {
      await recomputeProjectAggregates(projectId);
      await invalidateProjectCaches(projectSlug);
    }

    return sendSuccess(res, 200, 'Configuration and its units deleted', {
      configurationId: configId,
      deletedUnits,
    });
  } catch (err) {
    next(err);
  } finally {
    if (session) await session.endSession();
  }
};

// ── Units ───────────────────────────────────────────────────────────────────

const createUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body, projectId: id };

    const project = await Project.findById(id).select('_id slug name');
    if (!project) throw new AppError('Project not found', 404);

    const config = await ProjectConfiguration.findOne({
      _id: data.configurationId,
      projectId: id,
    }).select('_id');
    if (!config) throw new AppError('Configuration does not belong to this project', 400);

    const unit = await ProjectUnit.create(data);
    await recomputeConfigAvailability(data.configurationId);
    await invalidateProjectCaches(project.slug);

    return sendCreated(res, 'Unit created', unit);
  } catch (err) {
    // Unique-index conflict (same tower+floor+unitNumber) → 409
    if (err.code === 11000) {
      return next(new AppError('A unit with this tower, floor, and number already exists in this project', 409));
    }
    next(err);
  }
};

const updateUnit = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const updates = { ...req.body };

    const existing = await ProjectUnit.findById(unitId);
    if (!existing) throw new AppError('Unit not found', 404);

    if (updates.configurationId) {
      const config = await ProjectConfiguration.findOne({
        _id: updates.configurationId,
        projectId: existing.projectId,
      }).select('_id');
      if (!config) throw new AppError('Configuration does not belong to this project', 400);
    }

    const previousConfigId = existing.configurationId;
    const unit = await ProjectUnit.findByIdAndUpdate(
      unitId,
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    if (updates.configurationId && updates.configurationId !== previousConfigId.toString()) {
      await recomputeConfigAvailability(previousConfigId);
    }
    await recomputeConfigAvailability(unit.configurationId);

    const project = await Project.findById(existing.projectId).select('slug');
    if (project) await invalidateProjectCaches(project.slug);

    return sendSuccess(res, 200, 'Unit updated', unit);
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('A unit with this tower, floor, and number already exists in this project', 409));
    }
    next(err);
  }
};

const deleteUnit = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const unit = await ProjectUnit.findById(unitId);
    if (!unit) throw new AppError('Unit not found', 404);

    await unit.deleteOne();
    await recomputeConfigAvailability(unit.configurationId);

    const project = await Project.findById(unit.projectId).select('slug');
    if (project) await invalidateProjectCaches(project.slug);

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

// ── Bulk import ─────────────────────────────────────────────────────────────

const bulkImportUnits = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { units } = req.body;

    if (!Array.isArray(units) || units.length === 0) {
      throw new AppError('units must be a non-empty array', 400);
    }
    if (units.length > MAX_BULK_IMPORT) {
      throw new AppError(`Bulk import is limited to ${MAX_BULK_IMPORT} units per request`, 400);
    }

    const project = await Project.findById(id).select('_id slug name');
    if (!project) throw new AppError('Project not found', 404);

    // Verify every configuration belongs to this project
    const configIds = Array.from(new Set(units.map((u) => u.configurationId)));
    const validConfigs = await ProjectConfiguration.find({
      _id: { $in: configIds },
      projectId: id,
    }).select('_id');
    const validConfigSet = new Set(validConfigs.map((c) => c._id.toString()));
    const invalid = configIds.filter((cid) => !validConfigSet.has(String(cid)));
    if (invalid.length) {
      throw new AppError(
        `One or more configurationIds do not belong to this project: ${invalid.join(', ')}`,
        400
      );
    }

    // Tag with projectId; ordered: false so a single dup-key error doesn't abort the rest
    const docs = units.map((u) => ({ ...u, projectId: id }));

    let inserted = 0;
    let failed = 0;
    const errors = [];

    try {
      const result = await ProjectUnit.insertMany(docs, { ordered: false });
      inserted = Array.isArray(result) ? result.length : 0;
    } catch (insertErr) {
      // BulkWriteError carries the partial successes
      if (insertErr.insertedDocs && Array.isArray(insertErr.insertedDocs)) {
        inserted = insertErr.insertedDocs.length;
      } else if (insertErr.result?.insertedCount != null) {
        inserted = insertErr.result.insertedCount;
      } else {
        inserted = 0;
      }
      failed = units.length - inserted;

      const writeErrors =
        insertErr.writeErrors ||
        insertErr.result?.writeErrors ||
        insertErr.err?.writeErrors ||
        [];
      for (const we of writeErrors) {
        errors.push({
          index: we.index,
          code: we.code,
          message: we.errmsg || we.message || 'Insert error',
        });
      }
    }

    // Recompute availability for every touched configuration
    await Promise.all(
      configIds.map((cid) => recomputeConfigAvailability(cid))
    );
    await invalidateProjectCaches(project.slug);

    return sendSuccess(res, 200, 'Bulk import processed', {
      total: units.length,
      inserted,
      failed,
      errors,
    });
  } catch (err) {
    next(err);
  }
};

// ── Export units to Excel ────────────────────────────────────────────────────

const exportUnits = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).select('name slug');
    if (!project) throw new AppError('Project not found', 404);

    const filter = { projectId: id };
    if (req.query.configurationId) filter.configurationId = req.query.configurationId;
    if (req.query.status)         filter.status         = req.query.status;
    if (req.query.tower)          filter.tower          = req.query.tower;
    if (req.query.floor)          filter.floor          = Number(req.query.floor);

    const [units, configurations] = await Promise.all([
      ProjectUnit.find(filter).sort({ tower: 1, floor: 1, unitNumber: 1 }).lean(),
      ProjectConfiguration.find({ projectId: id }).select('_id bhkType title').lean(),
    ]);

    const configMap = new Map(
      configurations.map((c) => [c._id.toString(), `${c.bhkType}${c.title ? ` — ${c.title}` : ''}`])
    );

    const columns = [
      { header: 'Configuration', key: 'config', width: 28 },
      { header: 'Tower', key: 'tower', width: 14 },
      { header: 'Block', key: 'block', width: 14 },
      { header: 'Floor', key: 'floor', width: 8 },
      { header: 'Unit Number', key: 'unitNumber', width: 14 },
      { header: 'Carpet Area', key: 'carpetArea', width: 12 },
      { header: 'Built-up Area', key: 'builtupArea', width: 14 },
      { header: 'Facing', key: 'facing', width: 12 },
      { header: 'View', key: 'viewType', width: 16 },
      { header: 'Price', key: 'price', width: 14 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Created', key: 'createdAt', width: 22 },
      { header: 'Updated', key: 'updatedAt', width: 22 },
    ];

    const rows = units.map((u) => ({
      config: configMap.get(u.configurationId?.toString()) || '',
      tower: u.tower || '',
      block: u.block || '',
      floor: u.floor ?? '',
      unitNumber: u.unitNumber || '',
      carpetArea: u.carpetArea ?? '',
      builtupArea: u.builtupArea ?? '',
      facing: u.facing || '',
      viewType: u.viewType || '',
      price: u.price ?? '',
      status: u.status || '',
      notes: u.notes || '',
      createdAt: formatDate(u.createdAt),
      updatedAt: formatDate(u.updatedAt),
    }));

    const safeSlug = (project.slug || 'project').replace(/[^a-z0-9_-]/gi, '_');
    return sendExcel(res, {
      filename: `bricks_units_${safeSlug}`,
      sheetName: 'Units',
      columns,
      rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  adminList,
  getOne,
  create,
  update,
  remove,
  setListingStatus,
  toggleFeatured,
  createConfiguration,
  updateConfiguration,
  deleteConfiguration,
  createUnit,
  updateUnit,
  deleteUnit,
  bulkImportUnits,
  exportUnits,
};

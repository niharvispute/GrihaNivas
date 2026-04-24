const { uploadImage, deleteFile } = require('../services/cloudinaryService');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Banner = require('../models/mongoose/Banner');
const cache = require('../services/cacheService');

const BANNER_CACHE_PREFIX = 'banners:';

// ── GET /api/banners ──────────────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const { position } = req.query;
    const cacheKey = `${BANNER_CACHE_PREFIX}list:${position || 'all'}`;

    const cached = await cache.get(cacheKey);
    if (cached) return sendSuccess(res, 200, 'Banners fetched', cached);

    const filter = { isActive: true };
    if (position) filter.position = position;

    const banners = await Banner.find(filter)
      .sort({ order: 1 })
      .select('-__v')
      .lean();

    await cache.set(cacheKey, banners, cache.TTL.LIST);

    return sendSuccess(res, 200, 'Banners fetched', banners);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/banners  [admin] ────────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Banner image is required', 400);

    const uploaded = await uploadImage(req.file.buffer, 'bricks/banners', 'bannerImage');

    const banner = await Banner.create({
      ...req.body,
      image: { url: uploaded.url, publicId: uploaded.publicId },
      isActive: true,
    });

    await cache.delByPrefix(BANNER_CACHE_PREFIX);

    return sendCreated(res, 'Banner created', banner);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/banners/:id  [admin] ─────────────────────────────────────────────

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...(req.body || {}) };

    const existing = await Banner.findById(id).select('image');
    if (!existing) throw new AppError('Banner not found', 404);

    if (req.file) {
      if (existing?.image?.publicId) {
        deleteFile(existing.image.publicId, 'image').catch(() => {});
      }
      const uploaded = await uploadImage(req.file.buffer, 'bricks/banners', 'bannerImage');
      updates.image = { url: uploaded.url, publicId: uploaded.publicId };
    }

    if (Object.keys(updates).length === 0) {
      return sendSuccess(res, 200, 'Banner updated', existing);
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    await cache.delByPrefix(BANNER_CACHE_PREFIX);

    return sendSuccess(res, 200, 'Banner updated', banner);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/banners/:id  [admin] ──────────────────────────────────────────

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) throw new AppError('Banner not found', 404);

    if (banner.image?.publicId) {
      deleteFile(banner.image.publicId, 'image').catch(() => {});
    }

    await banner.deleteOne();

    await cache.delByPrefix(BANNER_CACHE_PREFIX);

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };

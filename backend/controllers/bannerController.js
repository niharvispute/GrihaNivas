const { uploadImage, deleteFile } = require('../services/cloudinaryService');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Banner = require('../models/mongoose/Banner');

// ── GET /api/banners ──────────────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const { position } = req.query;

    const filter = { isActive: true };
    if (position) filter.position = position;

    const banners = await Banner.find(filter)
      .sort({ order: 1 })
      .select('-__v');

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

    return sendCreated(res, 'Banner created', banner);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/banners/:id  [admin] ─────────────────────────────────────────────

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      const existing = await Banner.findById(id).select('image');
      if (existing?.image?.publicId) {
        deleteFile(existing.image.publicId, 'image').catch(() => {});
      }
      const uploaded = await uploadImage(req.file.buffer, 'bricks/banners', 'bannerImage');
      updates.image = { url: uploaded.url, publicId: uploaded.publicId };
    }

    const banner = await Banner.findByIdAndUpdate(id, updates, { returnDocument: 'after' });
    if (!banner) throw new AppError('Banner not found', 404);

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

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };

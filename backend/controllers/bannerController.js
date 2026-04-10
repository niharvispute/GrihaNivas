const { uploadImage, deleteFile, extractPublicId } = require('../services/cloudinaryService');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

// ── GET /api/banners ──────────────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    // TODO — MongoDB:
    //   const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    //   return sendSuccess(res, 200, 'Banners fetched', banners);

    // TODO — PostgreSQL:
    //   const banners = await prisma.banner.findMany({
    //     where: { isActive: true }, orderBy: { order: 'asc' },
    //   });
    //   return sendSuccess(res, 200, 'Banners fetched', banners);

    return sendSuccess(res, 200, 'Banners fetched', []);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/banners  [admin] ────────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const data = req.body;

    if (!req.file) {
      throw new AppError('Banner image is required', 400);
    }

    const uploaded = await uploadImage(req.file.buffer, 'bricks/banners', 'bannerImage');
    const bannerData = { ...data, image: uploaded.url, isActive: true };

    // TODO — MongoDB:
    //   const banner = await Banner.create(bannerData);
    //   return sendCreated(res, 'Banner created', banner);

    // TODO — PostgreSQL:
    //   const banner = await prisma.banner.create({ data: bannerData });
    //   return sendCreated(res, 'Banner created', banner);

    return sendCreated(res, 'Banner created', bannerData);
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
      // TODO: Delete old image first
      // const existing = await Banner.findById(id);
      // if (existing?.image) await deleteFile(extractPublicId(existing.image));

      const uploaded = await uploadImage(req.file.buffer, 'bricks/banners', 'bannerImage');
      updates.image = uploaded.url;
    }

    // TODO — MongoDB:
    //   const banner = await Banner.findByIdAndUpdate(id, updates, { new: true });
    //   if (!banner) throw new AppError('Banner not found', 404);
    //   return sendSuccess(res, 200, 'Banner updated', banner);

    // TODO — PostgreSQL:
    //   const banner = await prisma.banner.update({ where: { id }, data: updates });
    //   return sendSuccess(res, 200, 'Banner updated', banner);

    return sendSuccess(res, 200, 'Banner updated', { id, ...updates });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/banners/:id  [admin] ──────────────────────────────────────────

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO — Delete Cloudinary image first
    // const banner = await Banner.findById(id);
    // if (!banner) throw new AppError('Banner not found', 404);
    // if (banner.image) await deleteFile(extractPublicId(banner.image));
    // await banner.deleteOne();

    // TODO — PostgreSQL:
    //   const banner = await prisma.banner.findUnique({ where: { id } });
    //   if (!banner) throw new AppError('Banner not found', 404);
    //   if (banner.image) await deleteFile(extractPublicId(banner.image));
    //   await prisma.banner.delete({ where: { id } });

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };

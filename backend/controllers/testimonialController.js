const { uploadImage, deleteFile, extractPublicId } = require('../services/cloudinaryService');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

// ── GET /api/testimonials ─────────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    // TODO — MongoDB:
    //   const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    //   return sendSuccess(res, 200, 'Testimonials fetched', testimonials);

    // TODO — PostgreSQL:
    //   const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    //   return sendSuccess(res, 200, 'Testimonials fetched', testimonials);

    return sendSuccess(res, 200, 'Testimonials fetched', []);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/testimonials  [admin] ───────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const data = req.body;

    let image = null;
    if (req.file) {
      const uploaded = await uploadImage(req.file.buffer, 'bricks/testimonials', 'testimonialPhoto');
      image = uploaded.url;
    }

    const testimonialData = { ...data, image };

    // TODO — MongoDB:
    //   const testimonial = await Testimonial.create(testimonialData);
    //   return sendCreated(res, 'Testimonial created', testimonial);

    // TODO — PostgreSQL:
    //   const testimonial = await prisma.testimonial.create({ data: testimonialData });
    //   return sendCreated(res, 'Testimonial created', testimonial);

    return sendCreated(res, 'Testimonial created', testimonialData);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/testimonials/:id  [admin] ─────────────────────────────────────

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO — Delete Cloudinary image first
    // MongoDB:
    //   const testimonial = await Testimonial.findById(id);
    //   if (!testimonial) throw new AppError('Testimonial not found', 404);
    //   if (testimonial.image) await deleteFile(extractPublicId(testimonial.image));
    //   await testimonial.deleteOne();

    // PostgreSQL:
    //   const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    //   if (!testimonial) throw new AppError('Testimonial not found', 404);
    //   if (testimonial.image) await deleteFile(extractPublicId(testimonial.image));
    //   await prisma.testimonial.delete({ where: { id } });

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, remove };

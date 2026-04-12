const { uploadImage, deleteFile } = require('../services/cloudinaryService');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Testimonial = require('../models/mongoose/Testimonial');

// ── GET /api/testimonials ─────────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');

    return sendSuccess(res, 200, 'Testimonials fetched', testimonials);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/testimonials  [admin] ───────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const data = req.body;

    let photo = null;
    if (req.file) {
      const uploaded = await uploadImage(req.file.buffer, 'bricks/testimonials', 'testimonialPhoto');
      photo = { url: uploaded.url, publicId: uploaded.publicId };
    }

    const testimonial = await Testimonial.create({ ...data, photo });

    return sendCreated(res, 'Testimonial created', testimonial);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/testimonials/:id  [admin] ────────────────────────────────────────

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      const existing = await Testimonial.findById(id).select('photo');
      if (existing?.photo?.publicId) {
        deleteFile(existing.photo.publicId, 'image').catch(() => {});
      }
      const uploaded = await uploadImage(req.file.buffer, 'bricks/testimonials', 'testimonialPhoto');
      updates.photo = { url: uploaded.url, publicId: uploaded.publicId };
    }

    const testimonial = await Testimonial.findByIdAndUpdate(id, updates, { returnDocument: 'after' });
    if (!testimonial) throw new AppError('Testimonial not found', 404);

    return sendSuccess(res, 200, 'Testimonial updated', testimonial);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/testimonials/:id  [admin] ─────────────────────────────────────

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) throw new AppError('Testimonial not found', 404);

    if (testimonial.photo?.publicId) {
      deleteFile(testimonial.photo.publicId, 'image').catch(() => {});
    }

    await testimonial.deleteOne();

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };

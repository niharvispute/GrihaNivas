const { uploadImage, deleteFile } = require('../services/cloudinaryService');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const { sendExcel, formatDate } = require('../utils/excelExport');
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

// ── GET /api/testimonials/export  [admin] ─────────────────────────────────────

const exportTestimonials = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const filter = {};
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;

    const testimonials = await Testimonial.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .select('-__v -photo.publicId')
      .lean();

    const columns = [
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Designation', key: 'designation', width: 22 },
      { header: 'Company', key: 'company', width: 22 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Testimonial', key: 'testimonial', width: 60 },
      { header: 'Photo URL', key: 'photoUrl', width: 40 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Display Order', key: 'order', width: 14 },
      { header: 'Created At', key: 'createdAt', width: 22 },
      { header: 'Updated At', key: 'updatedAt', width: 22 },
    ];

    const rows = testimonials.map((t) => ({
      name: t.name || '',
      designation: t.designation || '',
      company: t.company || '',
      rating: t.rating ?? '',
      testimonial: t.testimonial || '',
      photoUrl: t.photo?.url || '',
      status: t.isActive ? 'Active' : 'Inactive',
      order: t.order ?? 0,
      createdAt: formatDate(t.createdAt),
      updatedAt: formatDate(t.updatedAt),
    }));

    return sendExcel(res, {
      filename: 'bricks_testimonials',
      sheetName: 'Testimonials',
      columns,
      rows,
    });
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

module.exports = { list, exportTestimonials, create, update, remove };

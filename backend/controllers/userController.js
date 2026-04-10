const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const { uploadImage } = require('../services/cloudinaryService');
const AppError = require('../utils/AppError');

/**
 * User Controller
 *
 * Business rules enforced:
 *  - Max 3 properties in the compare list (hard limit from spec)
 *  - Cannot save a property that's already saved (idempotent — no duplicate)
 *  - Cannot add to compare a property already in the compare list
 */

const MAX_COMPARE = 3;

// ── GET /api/users/me ─────────────────────────────────────────────────────────

const getProfile = async (req, res, next) => {
  try {
    // TODO — MongoDB:
    //   const user = await User.findById(req.user.id)
    //     .select('-__v')
    //     .populate('savedProperties', 'title heroImage price location.area category')
    //     .populate('comparedProperties', 'title heroImage price location.area category');
    //   if (!user) throw new AppError('User not found', 404);

    // TODO — PostgreSQL:
    //   const user = await prisma.user.findUnique({
    //     where: { id: req.user.id },
    //     include: {
    //       savedProperties: { select: { id: true, title: true, heroImage: true, price: true } },
    //       comparedProperties: { select: { id: true, title: true, heroImage: true, price: true } },
    //     },
    //   });
    //   if (!user) throw new AppError('User not found', 404);

    return sendSuccess(res, 200, 'Profile fetched', req.user);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/me ─────────────────────────────────────────────────────────

const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;

    // Upload profile picture if provided
    if (req.file) {
      const uploaded = await uploadImage(req.file.buffer, 'bricks/users', 'profilePicture');
      updates.profilePicture = uploaded.url;
    }

    // TODO — MongoDB:
    //   const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    //   return sendSuccess(res, 200, 'Profile updated', user);

    // TODO — PostgreSQL:
    //   const user = await prisma.user.update({ where: { id: req.user.id }, data: updates });
    //   return sendSuccess(res, 200, 'Profile updated', user);

    return sendSuccess(res, 200, 'Profile updated', { id: req.user.id, ...updates });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/users/saved ─────────────────────────────────────────────────────

const saveProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    // TODO — Verify property exists before saving
    //
    // MongoDB:
    //   const property = await Property.findOne({ _id: propertyId, isActive: true });
    //   if (!property) throw new AppError('Property not found', 404);
    //
    //   const user = await User.findById(req.user.id);
    //   if (user.savedProperties.includes(propertyId)) {
    //     return sendSuccess(res, 200, 'Property already saved', { propertyId });
    //   }
    //   await User.findByIdAndUpdate(req.user.id, { $addToSet: { savedProperties: propertyId } });
    //   await Property.findByIdAndUpdate(propertyId, { $inc: { savedCount: 1 } });
    //
    // PostgreSQL:
    //   const property = await prisma.property.findFirst({ where: { id: propertyId, isActive: true } });
    //   if (!property) throw new AppError('Property not found', 404);
    //   await prisma.user.update({
    //     where: { id: req.user.id },
    //     data: { savedProperties: { connect: { id: propertyId } } },
    //   });

    return sendCreated(res, 'Property saved', { propertyId });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/users/saved/:propertyId ───────────────────────────────────────

const unsaveProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    // TODO — MongoDB:
    //   await User.findByIdAndUpdate(req.user.id, { $pull: { savedProperties: propertyId } });
    //   await Property.findByIdAndUpdate(propertyId, { $inc: { savedCount: -1 } });

    // TODO — PostgreSQL:
    //   await prisma.user.update({
    //     where: { id: req.user.id },
    //     data: { savedProperties: { disconnect: { id: propertyId } } },
    //   });

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/saved ──────────────────────────────────────────────────────

const getSaved = async (req, res, next) => {
  try {
    // TODO — MongoDB:
    //   const user = await User.findById(req.user.id)
    //     .populate('savedProperties', 'title heroImage price location bhk category slug');
    //   return sendSuccess(res, 200, 'Saved properties fetched', user.savedProperties);

    // TODO — PostgreSQL:
    //   const user = await prisma.user.findUnique({
    //     where: { id: req.user.id },
    //     include: { savedProperties: true },
    //   });
    //   return sendSuccess(res, 200, 'Saved properties fetched', user.savedProperties);

    return sendSuccess(res, 200, 'Saved properties fetched', []);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/users/compare ───────────────────────────────────────────────────

const addToCompare = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    // TODO — Enforce max 3 limit
    //
    // MongoDB:
    //   const user = await User.findById(req.user.id);
    //   if (!user) throw new AppError('User not found', 404);
    //
    //   if (user.comparedProperties.some(id => id.toString() === propertyId)) {
    //     return sendSuccess(res, 200, 'Property already in compare list', { propertyId });
    //   }
    //   if (user.comparedProperties.length >= MAX_COMPARE) {
    //     throw new AppError(
    //       `Compare list is full (max ${MAX_COMPARE}). Remove a property before adding another.`,
    //       400
    //     );
    //   }
    //   await User.findByIdAndUpdate(req.user.id, { $push: { comparedProperties: propertyId } });
    //
    // PostgreSQL:
    //   const user = await prisma.user.findUnique({
    //     where: { id: req.user.id },
    //     include: { _count: { select: { comparedProperties: true } } },
    //   });
    //   if (user._count.comparedProperties >= MAX_COMPARE) {
    //     throw new AppError(`Compare list is full (max ${MAX_COMPARE}).`, 400);
    //   }
    //   await prisma.user.update({
    //     where: { id: req.user.id },
    //     data: { comparedProperties: { connect: { id: propertyId } } },
    //   });

    return sendCreated(res, 'Property added to compare list', { propertyId });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/users/compare/:propertyId ─────────────────────────────────────

const removeFromCompare = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    // TODO — MongoDB:
    //   await User.findByIdAndUpdate(req.user.id, { $pull: { comparedProperties: propertyId } });

    // TODO — PostgreSQL:
    //   await prisma.user.update({
    //     where: { id: req.user.id },
    //     data: { comparedProperties: { disconnect: { id: propertyId } } },
    //   });

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/compare ────────────────────────────────────────────────────

const getCompare = async (req, res, next) => {
  try {
    // TODO — MongoDB:
    //   const user = await User.findById(req.user.id)
    //     .populate('comparedProperties'); // full property data for comparison table
    //   return sendSuccess(res, 200, 'Compare list fetched', user.comparedProperties);

    // TODO — PostgreSQL:
    //   const user = await prisma.user.findUnique({
    //     where: { id: req.user.id },
    //     include: { comparedProperties: true },
    //   });
    //   return sendSuccess(res, 200, 'Compare list fetched', user.comparedProperties);

    return sendSuccess(res, 200, 'Compare list fetched', []);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  saveProperty,
  unsaveProperty,
  getSaved,
  addToCompare,
  removeFromCompare,
  getCompare,
};

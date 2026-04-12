const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const { uploadImage } = require('../services/cloudinaryService');
const { parsePagination } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const User = require('../models/mongoose/User');
const Property = require('../models/mongoose/Property');

/**
 * User Controller
 *
 * Business rules:
 *  - Max 3 properties in compare list (hard limit from spec)
 *  - $addToSet prevents duplicate saves (idempotent)
 *  - Compare list full → 400 with clear message
 */

const MAX_COMPARE = 3;

// ── GET /api/users  [admin] ──────────────────────────────────────────────────

const listUsers = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const { search, role, isActive } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name phone email role isVerified isActive lastLogin createdAt'),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Users fetched', users, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/:id  [admin] ──────────────────────────────────────────────

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-__v')
      .populate('savedProperties', 'title heroImage price location.area category slug')
      .populate('comparedProperties', 'title heroImage price location.area category slug');

    if (!user) throw new AppError('User not found', 404);

    return sendSuccess(res, 200, 'User fetched', user);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/:id/deactivate  [admin] ───────────────────────────────────

const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      throw new AppError('Admins cannot deactivate their own account', 400);
    }

    const user = await User.findById(id);
    if (!user) throw new AppError('User not found', 404);

    if (!user.isActive) {
      return sendSuccess(res, 200, 'User is already deactivated', {
        id: user._id,
        isActive: user.isActive,
      });
    }

    user.isActive = false;
    await user.save();

    return sendSuccess(res, 200, 'User deactivated', {
      id: user._id,
      isActive: user.isActive,
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/:id/activate  [admin] ─────────────────────────────────────

const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) throw new AppError('User not found', 404);

    if (user.isActive) {
      return sendSuccess(res, 200, 'User is already active', {
        id: user._id,
        isActive: user.isActive,
      });
    }

    user.isActive = true;
    await user.save();

    return sendSuccess(res, 200, 'User activated', {
      id: user._id,
      isActive: user.isActive,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/me ─────────────────────────────────────────────────────────

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-__v')
      .populate('savedProperties', 'title heroImage price location.area category slug')
      .populate('comparedProperties', 'title heroImage price location.area category slug');

    if (!user) throw new AppError('User not found', 404);

    return sendSuccess(res, 200, 'Profile fetched', user.toSafeObject());
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/me ─────────────────────────────────────────────────────────

const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;

    if (req.file) {
      const uploaded = await uploadImage(req.file.buffer, 'bricks/users', 'profilePicture');
      updates.profilePicture = { url: uploaded.url, publicId: uploaded.publicId };
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    return sendSuccess(res, 200, 'Profile updated', user.toSafeObject());
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/saved ──────────────────────────────────────────────────────

const getSaved = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('savedProperties', 'title heroImage price location bhk category slug');

    return sendSuccess(res, 200, 'Saved properties fetched', user.savedProperties);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/users/saved ─────────────────────────────────────────────────────

const saveProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findOne({ _id: propertyId, isActive: true });
    if (!property) throw new AppError('Property not found', 404);

    // $addToSet is idempotent — no-op if already saved
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { savedProperties: propertyId } });
    await Property.findByIdAndUpdate(propertyId, { $inc: { savedCount: 1 } });

    return sendCreated(res, 'Property saved', { propertyId });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/users/saved/:propertyId ───────────────────────────────────────

const unsaveProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    await User.findByIdAndUpdate(req.user.id, { $pull: { savedProperties: propertyId } });
    await Property.findByIdAndUpdate(propertyId, { $inc: { savedCount: -1 } });

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/compare ────────────────────────────────────────────────────

const getCompare = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('comparedProperties');

    return sendSuccess(res, 200, 'Compare list fetched', user.comparedProperties);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/users/compare ───────────────────────────────────────────────────

const addToCompare = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    // Already in list — idempotent
    if (user.comparedProperties.some(id => id.toString() === propertyId)) {
      return sendSuccess(res, 200, 'Property already in compare list', { propertyId });
    }

    if (user.comparedProperties.length >= MAX_COMPARE) {
      throw new AppError(
        `Compare list is full (max ${MAX_COMPARE}). Remove a property before adding another.`,
        400
      );
    }

    await User.findByIdAndUpdate(req.user.id, { $push: { comparedProperties: propertyId } });

    return sendCreated(res, 'Property added to compare list', { propertyId });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/users/compare/:propertyId ─────────────────────────────────────

const removeFromCompare = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    await User.findByIdAndUpdate(req.user.id, { $pull: { comparedProperties: propertyId } });

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  getUserById,
  deactivateUser,
  activateUser,
  getProfile,
  updateProfile,
  getSaved,
  saveProperty,
  unsaveProperty,
  getCompare,
  addToCompare,
  removeFromCompare,
};

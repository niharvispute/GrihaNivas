const { sendSuccess } = require('../utils/apiResponse');
const Property = require('../models/mongoose/Property');
const Lead = require('../models/mongoose/Lead');
const User = require('../models/mongoose/User');
const Blog = require('../models/mongoose/Blog');

/**
 * Dashboard Controller  [admin only]
 *
 * All DB queries run in parallel via Promise.all — never sequential.
 */

// ── GET /api/dashboard ────────────────────────────────────────────────────────

const getStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalProperties,
      activeProperties,
      featuredProperties,
      propertiesByCategory,
      totalLeads,
      leadsByStatus,
      todayLeads,
      totalUsers,
      totalBlogs,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ isActive: true }),
      Property.countDocuments({ isFeatured: true }),
      Property.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Lead.countDocuments(),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ role: 'user' }),
      Blog.countDocuments({ isPublished: true }),
    ]);

    const byStatus = Object.fromEntries(leadsByStatus.map(s => [s._id, s.count]));

    const stats = {
      properties: {
        total: totalProperties,
        active: activeProperties,
        featured: featuredProperties,
        byCategory: Object.fromEntries(propertiesByCategory.map(c => [c._id, c.count])),
      },
      leads: {
        total: totalLeads,
        today: todayLeads,
        new: byStatus.new ?? 0,
        contacted: byStatus.contacted ?? 0,
        qualified: byStatus.qualified ?? 0,
        closed: byStatus.closed ?? 0,
        byStatus,
      },
      users: { total: totalUsers },
      blogs: { total: totalBlogs },
    };

    return sendSuccess(res, 200, 'Dashboard stats fetched', stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };

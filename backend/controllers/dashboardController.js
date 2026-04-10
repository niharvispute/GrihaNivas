const { sendSuccess } = require('../utils/apiResponse');

/**
 * Dashboard Controller  [admin only]
 *
 * All DB queries run in parallel via Promise.all — never sequential.
 * A slow single query should never block the entire dashboard.
 *
 * Stats returned:
 *  - Properties: total, active, featured, by category
 *  - Leads: total, by status, today's new leads
 *  - Users: total registered
 *  - Blogs: total published
 */

// ── GET /api/dashboard ────────────────────────────────────────────────────────

const getStats = async (req, res, next) => {
  try {
    // ── MongoDB — All queries in parallel ─────────────────────────────────
    //
    // const todayStart = new Date();
    // todayStart.setHours(0, 0, 0, 0);
    //
    // const [
    //   totalProperties,
    //   activeProperties,
    //   featuredProperties,
    //   propertiesByCategory,
    //   totalLeads,
    //   leadsByStatus,
    //   todayLeads,
    //   totalUsers,
    //   totalBlogs,
    // ] = await Promise.all([
    //   Property.countDocuments(),
    //   Property.countDocuments({ isActive: true }),
    //   Property.countDocuments({ isFeatured: true }),
    //   Property.aggregate([
    //     { $group: { _id: '$category', count: { $sum: 1 } } }
    //   ]),
    //   Lead.countDocuments(),
    //   Lead.aggregate([
    //     { $group: { _id: '$status', count: { $sum: 1 } } }
    //   ]),
    //   Lead.countDocuments({ createdAt: { $gte: todayStart } }),
    //   User.countDocuments({ role: 'user' }),
    //   Blog.countDocuments(),
    // ]);
    //
    // const stats = {
    //   properties: {
    //     total: totalProperties,
    //     active: activeProperties,
    //     featured: featuredProperties,
    //     byCategory: Object.fromEntries(propertiesByCategory.map(c => [c._id, c.count])),
    //   },
    //   leads: {
    //     total: totalLeads,
    //     today: todayLeads,
    //     byStatus: Object.fromEntries(leadsByStatus.map(s => [s._id, s.count])),
    //   },
    //   users: { total: totalUsers },
    //   blogs: { total: totalBlogs },
    // };

    // ── PostgreSQL / Prisma — All queries in parallel ──────────────────────
    //
    // const todayStart = new Date();
    // todayStart.setHours(0, 0, 0, 0);
    //
    // const [
    //   totalProperties,
    //   activeProperties,
    //   featuredProperties,
    //   propertiesByCategory,
    //   totalLeads,
    //   leadsByStatus,
    //   todayLeads,
    //   totalUsers,
    //   totalBlogs,
    // ] = await Promise.all([
    //   prisma.property.count(),
    //   prisma.property.count({ where: { isActive: true } }),
    //   prisma.property.count({ where: { isFeatured: true } }),
    //   prisma.property.groupBy({ by: ['category'], _count: { id: true } }),
    //   prisma.lead.count(),
    //   prisma.lead.groupBy({ by: ['status'], _count: { id: true } }),
    //   prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
    //   prisma.user.count({ where: { role: 'user' } }),
    //   prisma.blog.count(),
    // ]);

    // Stub response — shape matches what DB queries will return
    const stats = {
      properties: {
        total: 0,
        active: 0,
        featured: 0,
        byCategory: { buy: 0, rent: 0, commercial: 0, new_launch: 0 },
      },
      leads: {
        total: 0,
        today: 0,
        byStatus: { new: 0, contacted: 0, qualified: 0, closed: 0 },
      },
      users: { total: 0 },
      blogs: { total: 0 },
    };

    return sendSuccess(res, 200, 'Dashboard stats fetched', stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };

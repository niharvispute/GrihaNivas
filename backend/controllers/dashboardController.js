const { sendSuccess } = require('../utils/apiResponse');
const Property = require('../models/mongoose/Property');
const Lead = require('../models/mongoose/Lead');
const User = require('../models/mongoose/User');
const Blog = require('../models/mongoose/Blog');
const Project = require('../models/mongoose/Project');
const ProjectUnit = require('../models/mongoose/ProjectUnit');

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
      totalProjects,
      projectsByListingStatus,
      projectsByProjectStatus,
      projectEnquiries,
      availableProjectUnits,
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
      Project.countDocuments(),
      Project.aggregate([{ $group: { _id: '$listingStatus', count: { $sum: 1 } } }]),
      Project.aggregate([{ $group: { _id: '$projectStatus', count: { $sum: 1 } } }]),
      Lead.countDocuments({ leadType: 'project' }),
      ProjectUnit.countDocuments({ status: 'available' }),
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
      projects: {
        total: totalProjects,
        active: projectsByListingStatus.find(s => s._id === 'active')?.count ?? 0,
        inactive: projectsByListingStatus.find(s => s._id === 'inactive')?.count ?? 0,
        draft: projectsByListingStatus.find(s => s._id === 'draft')?.count ?? 0,
        newLaunch: projectsByProjectStatus.find(s => s._id === 'new_launch')?.count ?? 0,
        underConstruction: projectsByProjectStatus.find(s => s._id === 'under_construction')?.count ?? 0,
        readyToMove: projectsByProjectStatus.find(s => s._id === 'ready_to_move')?.count ?? 0,
        projectEnquiries,
        availableUnits: availableProjectUnits,
        byListingStatus: Object.fromEntries(projectsByListingStatus.map(s => [s._id, s.count])),
        byProjectStatus: Object.fromEntries(projectsByProjectStatus.map(s => [s._id, s.count])),
      },
    };

    return sendSuccess(res, 200, 'Dashboard stats fetched', stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };

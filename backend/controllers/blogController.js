const { uploadImage, extractPublicId, deleteFile } = require('../services/cloudinaryService');
const { generateUniqueSlug } = require('../utils/slugify');
const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Blog = require('../models/mongoose/Blog');
const cache = require('../services/cacheService');

const BLOG_CACHE_PREFIX = 'blogs:';

const BLOG_CATEGORY_ALIASES = {
  market_trends: 'market_trends',
  'market-insights': 'market_trends',
  buying_guide: 'buying_guide',
  'buying-guide': 'buying_guide',
  legal: 'legal',
  investment: 'investment',
  lifestyle: 'lifestyle',
};

const normalizeBlogCategory = (category) => {
  if (!category) return category;
  return BLOG_CATEGORY_ALIASES[category] || category;
};

const normalizeBlogPayload = (payload = {}) => {
  const normalized = { ...payload };

  if (normalized.category) {
    normalized.category = normalizeBlogCategory(normalized.category);
  }

  // Backward compatibility: accept meta* and map to seo*
  if (normalized.metaTitle && !normalized.seoTitle) {
    normalized.seoTitle = normalized.metaTitle;
  }
  if (normalized.metaDescription && !normalized.seoDescription) {
    normalized.seoDescription = normalized.metaDescription;
  }

  delete normalized.metaTitle;
  delete normalized.metaDescription;
  delete normalized.keywords;

  return normalized;
};

/**
 * Blog Controller
 *
 * - Slug auto-generated from title on create; regenerated on title change
 * - Featured image uploaded to Cloudinary; old image deleted on replace
 * - Comments are public (no auth required)
 * - Blog listing excludes content field (bandwidth optimisation)
 */

// ── GET /api/blogs ────────────────────────────────────────────────────────────

const blogQueryKey = (q) => {
  const { category, tag, search, page, limit } = q;
  return JSON.stringify({ category: category || '', tag: tag || '', search: search || '', page: page || '1', limit: limit || '10' });
};

const list = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const { category, tag, search } = req.query;
    const normalizedCategory = normalizeBlogCategory(category);

    const isAdmin = req.user?.role === 'admin';

    // ── Cache Layer ─────────────────────────────────────────────────────────
    // Skip cache for admins so they always see the latest drafts/changes
    const cacheKey = `${BLOG_CACHE_PREFIX}list:${blogQueryKey(req.query)}`;
    if (!isAdmin) {
      const cached = await cache.get(cacheKey);
      if (cached) return sendSuccess(res, 200, 'Blogs fetched', cached.blogs, cached.meta);
    }

    // ── Database Query ──────────────────────────────────────────────────────
    const filter = isAdmin ? {} : { isPublished: true };
    if (normalizedCategory) filter.category = normalizedCategory;
    if (tag)      filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { tags:  new RegExp(search, 'i') },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content -comments -__v')
        .lean(),
      Blog.countDocuments(filter),
    ]);

    const meta = buildMeta(total);
    await cache.set(cacheKey, { blogs, meta }, cache.TTL.LIST);

    return sendSuccess(res, 200, 'Blogs fetched', blogs, meta);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/blogs/:slug ──────────────────────────────────────────────────────

const getBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, isPublished: true }).lean();
    if (!blog) throw new AppError('Blog post not found', 404);

    // Strip unapproved comments from public response
    blog.comments = (blog.comments || []).filter((c) => c.isApproved);

    return sendSuccess(res, 200, 'Blog fetched', blog);
  } catch (err) {
    next(err);
  }
};

const adminGet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).lean();
    if (!blog) throw new AppError('Blog not found', 404);

    return sendSuccess(res, 200, 'Blog fetched', blog);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/blogs  [admin] ──────────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const data = normalizeBlogPayload(req.body);
    const slug = generateUniqueSlug(data.title);

    let featuredImage = null;
    if (req.file) {
      const uploaded = await uploadImage(req.file.buffer, 'bricks/blogs', 'blogFeatured');
      featuredImage = { url: uploaded.url, publicId: uploaded.publicId };
    }

    const blog = await Blog.create({
      ...data,
      slug,
      featuredImage,
      author: req.user.id,
    });

    await cache.delByPrefix(BLOG_CACHE_PREFIX);

    return sendCreated(res, 'Blog created', blog);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/blogs/:id  [admin] ───────────────────────────────────────────────

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = normalizeBlogPayload(req.body);

    const existing = await Blog.findById(id).select('featuredImage isPublished publishedAt');
    if (!existing) throw new AppError('Blog not found', 404);

    if (updates.title) {
      updates.slug = generateUniqueSlug(updates.title);
    }

    if (req.file) {
      // Delete old image from Cloudinary before replacing
      if (existing?.featuredImage?.publicId) {
        deleteFile(existing.featuredImage.publicId, 'image').catch(() => {});
      } else {
        const oldId = extractPublicId(existing?.featuredImage?.url);
        if (oldId) {
          deleteFile(oldId, 'image').catch(() => {});
        }
      }

      const uploaded = await uploadImage(req.file.buffer, 'bricks/blogs', 'blogFeatured');
      updates.featuredImage = { url: uploaded.url, publicId: uploaded.publicId };
    }

    if (updates.isPublished === true && !existing.isPublished && !existing.publishedAt) {
      updates.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    await cache.delByPrefix(BLOG_CACHE_PREFIX);

    return sendSuccess(res, 200, 'Blog updated', blog);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/blogs/:id  [admin] ────────────────────────────────────────────

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) throw new AppError('Blog not found', 404);

    if (blog.featuredImage?.publicId) {
      deleteFile(blog.featuredImage.publicId, 'image').catch(() => {});
    } else if (blog.featuredImage) {
      const pubId = extractPublicId(blog.featuredImage.url);
      if (pubId) {
        deleteFile(pubId, 'image').catch(() => {});
      }
    }

    await blog.deleteOne();

    await cache.delByPrefix(BLOG_CACHE_PREFIX);

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/blogs/:id/comments ─────────────────────────────────────────────

const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, comment } = req.body;

    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            name: name.trim(),
            content: comment.trim(),
          },
        },
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!blog) throw new AppError('Blog post not found', 404);

    const addedComment = blog.comments[blog.comments.length - 1];
    return sendCreated(res, 'Comment added', {
      id: addedComment._id,
      name: addedComment.name,
      comment: addedComment.content,
      isApproved: addedComment.isApproved,
      createdAt: addedComment.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/blogs/admin/comments  [admin] ──────────────────────────────────

const adminListComments = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const status = req.query.status || 'pending';
    const onlyApproved = status === 'approved';

    const [rows, totalRows] = await Promise.all([
      Blog.aggregate([
        { $match: {} },
        { $unwind: '$comments' },
        { $match: { 'comments.isApproved': onlyApproved } },
        { $sort: { 'comments.createdAt': -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            blogId: '$_id',
            blogTitle: '$title',
            blogSlug: '$slug',
            commentId: '$comments._id',
            name: '$comments.name',
            email: '$comments.email',
            content: '$comments.content',
            isApproved: '$comments.isApproved',
            createdAt: '$comments.createdAt',
          },
        },
      ]),
      Blog.aggregate([
        { $match: {} },
        { $unwind: '$comments' },
        { $match: { 'comments.isApproved': onlyApproved } },
        { $count: 'count' },
      ]),
    ]);

    const total = totalRows?.[0]?.count || 0;
    return sendSuccess(res, 200, 'Blog comments fetched', rows, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/blogs/:id/comments/:commentId/approve  [admin] ───────────────

const approveComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    const blog = await Blog.findOneAndUpdate(
      { _id: id, 'comments._id': commentId },
      { $set: { 'comments.$.isApproved': true } },
      { returnDocument: 'after' }
    );

    if (!blog) throw new AppError('Comment not found', 404);

    const comment = blog.comments.find((item) => item._id.toString() === commentId);
    return sendSuccess(res, 200, 'Comment approved', {
      blogId: blog._id,
      commentId,
      isApproved: Boolean(comment?.isApproved),
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/blogs/:id/comments/:commentId  [admin] ─────────────────────

const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $pull: { comments: { _id: commentId } } },
      { returnDocument: 'after' }
    );

    if (!blog) throw new AppError('Blog post not found', 404);

    return sendSuccess(res, 200, 'Comment deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getBySlug,
  adminGet,
  create,
  update,
  remove,
  addComment,
  adminListComments,
  approveComment,
  deleteComment,
};

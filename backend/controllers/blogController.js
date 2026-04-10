const { uploadImage, extractPublicId, deleteFile } = require('../services/cloudinaryService');
const { generateSlug, generateUniqueSlug } = require('../utils/slugify');
const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

/**
 * Blog Controller
 *
 * Business logic:
 *  - Slug auto-generated from title on create
 *  - Slug regenerated if title changes on update
 *  - Featured image uploaded to Cloudinary before DB write
 *  - Old Cloudinary image deleted when replaced on update
 *  - Comments are public (no auth required) — basic anti-spam via rate limiter
 *  - Blog listing excludes the `content` field (bandwidth optimization)
 */

// ── GET /api/blogs ────────────────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const { page, limit, skip, buildMeta } = parsePagination(req.query);
    const { category, tag, search } = req.query;

    // ── MongoDB filter ─────────────────────────────────────────────────────
    // const mongoFilter = {};
    // if (category) mongoFilter.category = category;
    // if (tag)      mongoFilter.tags = tag;           // array field match
    // if (search) {
    //   mongoFilter.$or = [
    //     { title:   new RegExp(search, 'i') },
    //     { tags:    new RegExp(search, 'i') },
    //   ];
    // }
    //
    // const [blogs, total] = await Promise.all([
    //   Blog.find(mongoFilter)
    //     .sort({ createdAt: -1 })
    //     .skip(skip).limit(limit)
    //     .select('-content -__v'),    // exclude heavy content field in listing
    //   Blog.countDocuments(mongoFilter),
    // ]);

    // ── PostgreSQL / Prisma ────────────────────────────────────────────────
    // const prismaWhere = {};
    // if (category) prismaWhere.category = category;
    // if (tag)      prismaWhere.tags = { has: tag };
    // if (search) {
    //   prismaWhere.OR = [
    //     { title: { contains: search, mode: 'insensitive' } },
    //   ];
    // }
    //
    // const [blogs, total] = await Promise.all([
    //   prisma.blog.findMany({
    //     where: prismaWhere, orderBy: { createdAt: 'desc' }, skip, take: limit,
    //     select: { id: true, title: true, slug: true, featuredImage: true, category: true,
    //               tags: true, metaDescription: true, createdAt: true },
    //   }),
    //   prisma.blog.count({ where: prismaWhere }),
    // ]);

    return sendSuccess(res, 200, 'Blogs fetched', [], buildMeta(0));
  } catch (err) {
    next(err);
  }
};

// ── GET /api/blogs/:slug ──────────────────────────────────────────────────────

const getBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // TODO — MongoDB:
    //   const blog = await Blog.findOne({ slug });
    //   if (!blog) throw new AppError('Blog post not found', 404);

    // TODO — PostgreSQL:
    //   const blog = await prisma.blog.findUnique({ where: { slug } });
    //   if (!blog) throw new AppError('Blog post not found', 404);

    throw new AppError('Blog post not found', 404);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/blogs  [admin] ──────────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const data = req.body;
    const slug = generateUniqueSlug(data.title);

    let featuredImage = null;
    if (req.file) {
      const uploaded = await uploadImage(req.file.buffer, 'bricks/blogs', 'blogFeatured');
      featuredImage = uploaded.url;
    }

    const blogData = { ...data, slug, featuredImage };

    // TODO — MongoDB:
    //   const blog = await Blog.create(blogData);
    //   return sendCreated(res, 'Blog created', blog);

    // TODO — PostgreSQL:
    //   const blog = await prisma.blog.create({ data: blogData });
    //   return sendCreated(res, 'Blog created', blog);

    return sendCreated(res, 'Blog created', { slug, featuredImage });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/blogs/:id  [admin] ───────────────────────────────────────────────

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.title) {
      updates.slug = generateUniqueSlug(updates.title);
    }

    if (req.file) {
      // TODO: Delete old image from Cloudinary before replacing
      // const existing = await Blog.findById(id);
      // if (existing?.featuredImage) {
      //   await deleteFile(extractPublicId(existing.featuredImage), 'image');
      // }
      const uploaded = await uploadImage(req.file.buffer, 'bricks/blogs', 'blogFeatured');
      updates.featuredImage = uploaded.url;
    }

    // TODO — MongoDB:
    //   const blog = await Blog.findByIdAndUpdate(id, updates, { new: true });
    //   if (!blog) throw new AppError('Blog not found', 404);
    //   return sendSuccess(res, 200, 'Blog updated', blog);

    // TODO — PostgreSQL:
    //   const blog = await prisma.blog.update({ where: { id }, data: updates });
    //   return sendSuccess(res, 200, 'Blog updated', blog);

    return sendSuccess(res, 200, 'Blog updated', { id, ...updates });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/blogs/:id  [admin] ────────────────────────────────────────────

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO — Delete from Cloudinary first
    // const blog = await Blog.findById(id);
    // if (!blog) throw new AppError('Blog not found', 404);
    // if (blog.featuredImage) {
    //   await deleteFile(extractPublicId(blog.featuredImage), 'image');
    // }

    // TODO — MongoDB:   await Blog.findByIdAndDelete(id);
    // TODO — PostgreSQL: await prisma.blog.delete({ where: { id } });

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

    const newComment = {
      name: name.trim(),
      comment: comment.trim(),
      createdAt: new Date(),
    };

    // TODO — MongoDB:
    //   const blog = await Blog.findByIdAndUpdate(
    //     id,
    //     { $push: { comments: newComment } },
    //     { new: true }
    //   );
    //   if (!blog) throw new AppError('Blog post not found', 404);
    //   return sendCreated(res, 'Comment added', newComment);

    // TODO — PostgreSQL:
    //   const blog = await prisma.blog.findUnique({ where: { id } });
    //   if (!blog) throw new AppError('Blog post not found', 404);
    //   const updated = await prisma.blog.update({
    //     where: { id },
    //     data: { comments: { push: newComment } },
    //   });
    //   return sendCreated(res, 'Comment added', newComment);

    return sendCreated(res, 'Comment added', newComment);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getBySlug, create, update, remove, addComment };

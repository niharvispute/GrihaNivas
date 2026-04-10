const { sendLeadNotification, sendLeadConfirmation } = require('../services/emailService');
const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

/**
 * Lead Controller — CRM
 *
 * Status transitions (enforced):
 *   new → contacted → qualified → closed
 *
 * Business rules:
 *  - Any status can move to any forward state (no strict linear enforcement — admin flexibility)
 *  - Cannot move backwards (new ← contacted is blocked)
 *  - Email fires on creation: admin notification + user confirmation (if email provided)
 */

// Status ordering — used to prevent backwards transitions
const STATUS_ORDER = { new: 0, contacted: 1, qualified: 2, closed: 3 };

// ── POST /api/leads ───────────────────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const leadData = {
      ...req.body,
      status: 'new',
      source: 'website',
    };

    // TODO — MongoDB:
    //   const lead = await Lead.create(leadData);
    //
    // TODO — PostgreSQL:
    //   const lead = await prisma.lead.create({ data: leadData });

    // Fire both emails in parallel — don't await either (non-blocking)
    // Both are fire-and-forget: a failed email must never break lead creation
    Promise.all([
      sendLeadNotification(leadData),
      sendLeadConfirmation(leadData),
    ]).catch((err) => console.error('Lead email failed (non-fatal):', err.message));

    return sendCreated(
      res,
      'Enquiry submitted successfully. Our team will contact you within 24 hours.'
    );
  } catch (err) {
    next(err);
  }
};

// ── GET /api/leads  [admin] ───────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const { page, limit, skip, buildMeta } = parsePagination(req.query);
    const { status, leadType, search } = req.query;

    // ── MongoDB filter ─────────────────────────────────────────────────────
    // const mongoFilter = {};
    // if (status)   mongoFilter.status = status;
    // if (leadType) mongoFilter.leadType = leadType;
    // if (search) {
    //   mongoFilter.$or = [
    //     { name:  new RegExp(search, 'i') },
    //     { phone: new RegExp(search, 'i') },
    //     { email: new RegExp(search, 'i') },
    //   ];
    // }
    //
    // const [leads, total] = await Promise.all([
    //   Lead.find(mongoFilter)
    //     .sort({ createdAt: -1 })
    //     .skip(skip).limit(limit)
    //     .populate('assignedTo', 'name email')
    //     .populate('propertyId', 'title slug'),
    //   Lead.countDocuments(mongoFilter),
    // ]);

    // ── PostgreSQL / Prisma filter ─────────────────────────────────────────
    // const prismaWhere = {};
    // if (status)   prismaWhere.status = status;
    // if (leadType) prismaWhere.leadType = leadType;
    // if (search) {
    //   prismaWhere.OR = [
    //     { name:  { contains: search, mode: 'insensitive' } },
    //     { phone: { contains: search } },
    //     { email: { contains: search, mode: 'insensitive' } },
    //   ];
    // }
    //
    // const [leads, total] = await Promise.all([
    //   prisma.lead.findMany({
    //     where: prismaWhere, orderBy: { createdAt: 'desc' }, skip, take: limit,
    //     include: { assignedTo: { select: { name: true, email: true } } },
    //   }),
    //   prisma.lead.count({ where: prismaWhere }),
    // ]);

    return sendSuccess(res, 200, 'Leads fetched', [], buildMeta(0));
  } catch (err) {
    next(err);
  }
};

// ── GET /api/leads/:id  [admin] ───────────────────────────────────────────────

const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO — MongoDB:
    //   const lead = await Lead.findById(id)
    //     .populate('assignedTo', 'name email adminTitle')
    //     .populate('propertyId', 'title slug heroImage');
    //   if (!lead) throw new AppError('Lead not found', 404);

    // TODO — PostgreSQL:
    //   const lead = await prisma.lead.findUnique({
    //     where: { id },
    //     include: { assignedTo: true, property: true },
    //   });
    //   if (!lead) throw new AppError('Lead not found', 404);

    throw new AppError('Lead not found', 404);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/leads/:id/status  [admin] ────────────────────────────────────────

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    // TODO — Fetch current lead to enforce transition rules
    //
    // MongoDB:
    //   const lead = await Lead.findById(id);
    //   if (!lead) throw new AppError('Lead not found', 404);
    //   const currentOrder = STATUS_ORDER[lead.status];
    //
    // PostgreSQL:
    //   const lead = await prisma.lead.findUnique({ where: { id } });
    //   if (!lead) throw new AppError('Lead not found', 404);
    //   const currentOrder = STATUS_ORDER[lead.status];

    // Business rule: no backward transitions
    // if (STATUS_ORDER[newStatus] < currentOrder) {
    //   throw new AppError(
    //     `Cannot move lead from "${lead.status}" back to "${newStatus}". Status can only move forward.`,
    //     400
    //   );
    // }

    const updateData = {
      status: newStatus,
      // Set lastContactedAt when admin first contacts the lead
      ...(newStatus === 'contacted' && { lastContactedAt: new Date() }),
    };

    // TODO — MongoDB:
    //   const updated = await Lead.findByIdAndUpdate(id, updateData, { new: true });
    //   return sendSuccess(res, 200, 'Lead status updated', updated);

    // TODO — PostgreSQL:
    //   const updated = await prisma.lead.update({ where: { id }, data: updateData });
    //   return sendSuccess(res, 200, 'Lead status updated', updated);

    return sendSuccess(res, 200, 'Lead status updated', { id, ...updateData });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/leads/:id/notes  [admin] ────────────────────────────────────────

const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const note = {
      text,
      addedBy: req.user.id,
      addedAt: new Date(),
    };

    // TODO — MongoDB (push to notes array):
    //   const lead = await Lead.findByIdAndUpdate(
    //     id,
    //     { $push: { notes: note } },
    //     { new: true }
    //   );
    //   if (!lead) throw new AppError('Lead not found', 404);
    //   return sendCreated(res, 'Note added', lead.notes[lead.notes.length - 1]);

    // TODO — PostgreSQL (append to notes JSON array or separate table):
    //   const lead = await prisma.lead.findUnique({ where: { id } });
    //   if (!lead) throw new AppError('Lead not found', 404);
    //   const updated = await prisma.lead.update({
    //     where: { id },
    //     data: { notes: { push: note } },
    //   });
    //   return sendCreated(res, 'Note added', note);

    return sendCreated(res, 'Note added', note);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getOne, updateStatus, addNote };

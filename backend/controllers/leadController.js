const { sendLeadNotification, sendLeadConfirmation } = require('../services/emailService');
const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Lead = require('../models/mongoose/Lead');

/**
 * Lead Controller — CRM
 *
 * Status transitions (enforced — no backwards movement):
 *   new → contacted → qualified → closed
 */

const STATUS_ORDER = { new: 0, contacted: 1, qualified: 2, closed: 3 };

// ── POST /api/leads ───────────────────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      status: 'new',
      source: 'website',
    });

    // Fire both emails in parallel — non-blocking
    Promise.all([
      sendLeadNotification(lead),
      sendLeadConfirmation(lead),
    ]).catch((err) => console.error('Lead email failed (non-fatal):', err.message));

    return sendCreated(res, 'Enquiry submitted successfully. Our team will contact you within 24 hours.', lead);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/leads  [admin] ───────────────────────────────────────────────────

const list = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const { status, leadType, search } = req.query;

    const filter = {};
    if (status)   filter.status = status;
    if (leadType) filter.leadType = leadType;
    if (search) {
      filter.$or = [
        { name:  new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'name email')
        .populate('propertyId', 'title slug'),
      Lead.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Leads fetched', leads, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

// ── GET /api/leads/:id  [admin] ───────────────────────────────────────────────

const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('assignedTo', 'name email')
      .populate('propertyId', 'title slug heroImage');

    if (!lead) throw new AppError('Lead not found', 404);

    return sendSuccess(res, 200, 'Lead fetched', lead);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/leads/:id/status  [admin] ────────────────────────────────────────

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) throw new AppError('Lead not found', 404);

    // Enforce no backward transitions
    if (STATUS_ORDER[newStatus] < STATUS_ORDER[lead.status]) {
      throw new AppError(
        `Cannot move lead from "${lead.status}" back to "${newStatus}". Status can only move forward.`,
        400
      );
    }

    lead.status = newStatus;
    if (newStatus === 'contacted') lead.lastContactedAt = new Date();
    await lead.save();

    return sendSuccess(res, 200, 'Lead status updated', lead);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/leads/:id/assign  [admin] ────────────────────────────────────────

const assign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      id,
      { assignedTo: adminId },
      { returnDocument: 'after' }
    ).populate('assignedTo', 'name email');

    if (!lead) throw new AppError('Lead not found', 404);

    return sendSuccess(res, 200, 'Lead assigned', lead);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/leads/:id/notes  [admin] ────────────────────────────────────────

const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      id,
      { $push: { notes: { text, addedBy: req.user.id, addedAt: new Date() } } },
      { returnDocument: 'after' }
    );

    if (!lead) throw new AppError('Lead not found', 404);

    const addedNote = lead.notes[lead.notes.length - 1];
    return sendCreated(res, 'Note added', addedNote);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getOne, updateStatus, assign, addNote };

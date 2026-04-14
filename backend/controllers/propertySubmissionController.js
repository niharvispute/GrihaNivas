const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const PropertySubmission = require('../models/mongoose/PropertySubmission');
const { uploadPropertySubmissionMedia } = require('../services/cloudinaryService');

const STATUS_ORDER = {
  new: 0,
  reviewing: 1,
  approved: 2,
  rejected: 3,
  closed: 4,
};

const listSearchFilter = (search) => {
  if (!search) return null;
  const regex = new RegExp(search, 'i');
  return {
    $or: [
      { ownerName: regex },
      { phone: regex },
      { email: regex },
      { locality: regex },
      { title: regex },
    ],
  };
};

const create = async (req, res, next) => {
  try {
    let media = { images: [], video: null };
    if (req.files && Object.keys(req.files).length > 0) {
      media = await uploadPropertySubmissionMedia(req.files);
    }

    const mergedImages = [
      ...(Array.isArray(req.body.images) ? req.body.images : []),
      ...media.images.map((item) => item.url),
    ];

    const existingVideoMeta = req.body.videoMeta || {};
    const mergedVideoMeta = media.video
      ? {
          ...existingVideoMeta,
          url: media.video.url,
          publicId: media.video.publicId,
        }
      : existingVideoMeta;

    const submission = await PropertySubmission.create({
      ...req.body,
      images: mergedImages,
      videoMeta: Object.keys(mergedVideoMeta).length > 0 ? mergedVideoMeta : null,
      createdBy: req.user.id,
      status: 'new',
      source: 'list_property_form',
    });

    return sendCreated(res, 'Property submission created', submission);
  } catch (err) {
    next(err);
  }
};

const mySubmissions = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const filter = { createdBy: req.user.id };

    const [submissions, total] = await Promise.all([
      PropertySubmission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'name email')
        .select('-notes'),
      PropertySubmission.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Your property submissions fetched', submissions, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

const listAdmin = async (req, res, next) => {
  try {
    const { limit, skip, buildMeta } = parsePagination(req.query);
    const { status, listingType, buildingType, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (listingType) filter.listingType = listingType;
    if (buildingType) filter.buildingType = buildingType;

    const searchFilter = listSearchFilter(search);
    if (searchFilter) {
      Object.assign(filter, searchFilter);
    }

    const [submissions, total] = await Promise.all([
      PropertySubmission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name phone email')
        .populate('assignedTo', 'name email'),
      PropertySubmission.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Property submissions fetched', submissions, buildMeta(total));
  } catch (err) {
    next(err);
  }
};

const getOneAdmin = async (req, res, next) => {
  try {
    const submission = await PropertySubmission.findById(req.params.id)
      .populate('createdBy', 'name phone email')
      .populate('assignedTo', 'name email')
      .populate('notes.addedBy', 'name email');

    if (!submission) throw new AppError('Property submission not found', 404);

    return sendSuccess(res, 200, 'Property submission fetched', submission);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const submission = await PropertySubmission.findById(id);
    if (!submission) throw new AppError('Property submission not found', 404);

    if (STATUS_ORDER[status] < STATUS_ORDER[submission.status]) {
      throw new AppError(
        `Cannot move submission from "${submission.status}" back to "${status}". Status can only move forward.`,
        400
      );
    }

    submission.status = status;
    await submission.save();

    return sendSuccess(res, 200, 'Submission status updated', submission);
  } catch (err) {
    next(err);
  }
};

const assign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const submission = await PropertySubmission.findByIdAndUpdate(
      id,
      { assignedTo: adminId },
      { returnDocument: 'after' }
    ).populate('assignedTo', 'name email');

    if (!submission) throw new AppError('Property submission not found', 404);

    return sendSuccess(res, 200, 'Submission assigned', submission);
  } catch (err) {
    next(err);
  }
};

const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const submission = await PropertySubmission.findByIdAndUpdate(
      id,
      {
        $push: {
          notes: {
            text,
            addedBy: req.user.id,
            addedAt: new Date(),
          },
        },
      },
      { returnDocument: 'after' }
    );

    if (!submission) throw new AppError('Property submission not found', 404);

    const addedNote = submission.notes[submission.notes.length - 1];
    return sendCreated(res, 'Note added', addedNote);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const submission = await PropertySubmission.findByIdAndDelete(req.params.id);
    if (!submission) throw new AppError('Property submission not found', 404);

    return sendSuccess(res, 200, 'Property submission deleted', { id: submission._id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  mySubmissions,
  listAdmin,
  getOneAdmin,
  updateStatus,
  assign,
  addNote,
  remove,
};

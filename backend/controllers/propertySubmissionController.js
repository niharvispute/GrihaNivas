const { parsePagination } = require('../utils/pagination');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const PropertySubmission = require('../models/mongoose/PropertySubmission');
const { uploadPropertySubmissionMedia } = require('../services/cloudinaryService');
const {
  ensureSubmissionPublished,
  syncPublishedPropertyVisibility,
} = require('../services/propertySubmissionPublishingService');
const { sendPropertySubmissionNotification } = require('../services/emailService');

const ALLOWED_STATUS_TRANSITIONS = {
  new: ['reviewing'],
  reviewing: ['new', 'approved', 'rejected'],
  approved: ['reviewing', 'closed'],
  rejected: ['reviewing', 'closed'],
  closed: ['approved', 'rejected'],
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
    const normalizedImages = mergedImages
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);

    if (normalizedImages.length < 5) {
      throw new AppError('Please upload at least 5 property images before submitting.', 400);
    }

    if (normalizedImages.length > 20) {
      throw new AppError('You can upload up to 20 property images per submission.', 400);
    }

    const mergedFloorPlans = [
      ...(Array.isArray(req.body.floorPlans) ? req.body.floorPlans : []),
      ...media.floorPlans.map((item) => item.url),
    ];
    const normalizedFloorPlans = mergedFloorPlans
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);

    const brochureUrl = media.brochure?.url || req.body.brochure || null;

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
      images: normalizedImages,
      floorPlans: normalizedFloorPlans,
      brochure: brochureUrl,
      videoMeta: Object.keys(mergedVideoMeta).length > 0 ? mergedVideoMeta : null,
      createdBy: req.user.id,
      status: 'new',
      source: 'list_property_form',
    });

    sendPropertySubmissionNotification(submission).catch((err) =>
      console.error('Property submission email failed (non-fatal):', err.message)
    );

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

    if (status !== submission.status && !ALLOWED_STATUS_TRANSITIONS[submission.status]?.includes(status)) {
      throw new AppError(
        `Invalid transition from "${submission.status}" to "${status}".`,
        400
      );
    }

    submission.status = status;

    if (status === 'approved') {
      await ensureSubmissionPublished(submission);
    } else {
      await syncPublishedPropertyVisibility(submission, status);
    }

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

const deactivateOwn = async (req, res, next) => {
  try {
    const { id } = req.params;

    const submission = await PropertySubmission.findOne({ _id: id, createdBy: req.user.id });
    if (!submission) throw new AppError('Property submission not found', 404);

    if (submission.status !== 'approved') {
      throw new AppError('Only active (approved) listings can be deactivated.', 400);
    }

    submission.status = 'closed';
    submission.closedByOwner = true;
    await syncPublishedPropertyVisibility(submission, 'closed');
    await submission.save();

    return sendSuccess(res, 200, 'Listing deactivated successfully', submission);
  } catch (err) {
    next(err);
  }
};

const reactivateOwn = async (req, res, next) => {
  try {
    const { id } = req.params;

    const submission = await PropertySubmission.findOne({ _id: id, createdBy: req.user.id });
    if (!submission) throw new AppError('Property submission not found', 404);

    if (submission.status !== 'closed' || !submission.closedByOwner) {
      throw new AppError('Only listings you deactivated can be reactivated.', 400);
    }

    submission.status = 'approved';
    submission.closedByOwner = false;
    await ensureSubmissionPublished(submission);
    await submission.save();

    return sendSuccess(res, 200, 'Listing reactivated successfully', submission);
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
  deactivateOwn,
  reactivateOwn,
  assign,
  addNote,
  remove,
};

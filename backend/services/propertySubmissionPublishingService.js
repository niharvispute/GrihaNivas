'use strict';

const { URL } = require('node:url');
const Property = require('../models/mongoose/Property');
const { generateUniqueSlug } = require('../utils/slugify');

const deriveCategory = (submission = {}) => {
  const buildingType = String(submission.buildingType || '').toLowerCase();
  const listingType = String(submission.listingType || '').toLowerCase();

  if (buildingType === 'commercial') return 'commercial';
  if (listingType === 'rent') return 'rent';
  return 'buy';
};

const parseCount = (value) => {
  if (value === null || value === undefined) return null;

  const match = String(value).match(/\d+/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean);
};

const extractCloudinaryPublicId = (url) => {
  try {
    const parsed = new URL(String(url));
    const parts = parsed.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.findIndex((item) => item === 'upload');
    if (uploadIndex < 0) return null;

    let publicIdParts = parts.slice(uploadIndex + 1);
    if (publicIdParts.length === 0) return null;

    if (publicIdParts[0].startsWith('v')) {
      publicIdParts = publicIdParts.slice(1);
    }

    if (publicIdParts.length === 0) return null;

    const last = publicIdParts[publicIdParts.length - 1];
    publicIdParts[publicIdParts.length - 1] = last.replace(/\.[^.]+$/, '');

    return publicIdParts.join('/');
  } catch {
    return null;
  }
};

const toSubmissionMediaItems = (submission) =>
  toStringArray(submission?.images)
    .slice(0, 20)
    .map((url, index) => ({
      url,
      publicId: extractCloudinaryPublicId(url) || `submission-image-${submission?._id}-${index + 1}`,
    }));

const parseBhkFromText = (value) => {
  const match = String(value || '').match(/(\d+)\s*\+?\s*bhk/i);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const getApprovalTimestamp = (submission, approvedAtOverride) =>
  approvedAtOverride || submission?.updatedAt || new Date();

const buildPropertyPayloadFromSubmission = (submission, options = {}) => {
  const city = submission.city || 'Mumbai';
  const locality = submission.locality || 'Mumbai';
  const title =
    (submission.title && String(submission.title).trim()) ||
    `${submission.propertyType || 'Property'} in ${locality}`;
  const description =
    (submission.description && String(submission.description).trim()) ||
    `Owner-submitted ${String(submission.propertyType || 'property').toLowerCase()} available for ${String(
      submission.listingType || 'sale'
    ).toLowerCase()} in ${locality}, ${city}.`;

  const coveredParking = parseCount(submission.coveredParking);
  const openParking = parseCount(submission.openParking);
  const totalParking = [coveredParking, openParking].reduce(
    (total, count) => total + (Number.isFinite(count) ? count : 0),
    0
  );
  const mediaItems = toSubmissionMediaItems(submission);
  const bhk =
    parseCount(submission?.bhk) ||
    parseCount(submission?.propertyType) ||
    parseBhkFromText(submission?.title);

  const category = deriveCategory(submission);
  const isRent = category === 'rent';

  // For rent listings, the primary price is the monthly rent
  const priceValue = isRent 
    ? (Number.isFinite(submission.rentPerMonth) ? submission.rentPerMonth : 0)
    : (Number.isFinite(submission.price) ? submission.price : 0);

  // highlights is intentionally kept empty here — the frontend mapper derives
  // possession, deposit, maintenance, appliances etc. from the actual typed fields.
  // Storing them as raw strings here causes duplicate chips in the UI.
  const highlights = [];

  return {
    title,
    slug: generateUniqueSlug(title),
    description,
    category,
    price: priceValue,
    priceUnit: isRent ? 'per_month' : 'total',
    rentPerMonth: isRent ? priceValue : null,
    deposit: submission.deposit || null,
    maintenanceCharges: submission.maintenanceCharges || null,
    location: {
      area: locality,
      city,
      address: null,
      pincode: null,
      coordinates: {
        lat: null,
        lng: null,
      },
    },
    bhk,
    bathrooms: parseCount(submission.bathrooms),
    carpetArea: submission.carpetArea || null,
    totalArea: submission.totalArea || null,
    areaSqft: submission.totalArea || submission.carpetArea || null,
    parking: totalParking,
    possession: submission.possession || null,
    availableFrom: submission.availableFrom || null,
    age: submission.age || null,
    furnishing: submission.furnishing || null,
    reraUrl: submission.reraUrl || null,
    amenities: toStringArray(submission.amenities),
    appliances: toStringArray(submission.appliances),
    feature: toStringArray(submission.feature),
    highlights,
    heroImage: mediaItems[0] || null,
    gallery: mediaItems.slice(1),
    createdBy: submission.createdBy,
    postedBy: submission.createdBy,
    status: 'approved',
    isActive: true,
    approvedAt: getApprovalTimestamp(submission, options.approvedAt),
    rejectedAt: null,
    isFeatured: false,
    sourceSubmission: submission._id,
  };
};

const findPublishedProperty = async (submission) => {
  if (!submission) return null;

  if (submission.publishedProperty) {
    const linked = await Property.findById(submission.publishedProperty);
    if (linked) return linked;
  }

  return Property.findOne({ sourceSubmission: submission._id });
};

const ensureSubmissionPublished = async (submission, options = {}) => {
  let property = await findPublishedProperty(submission);
  const payload = buildPropertyPayloadFromSubmission(submission, options);

  if (!property) {
    property = await Property.create(payload);
  } else {
    property.status = 'approved';
    property.isActive = true;
    property.approvedAt = getApprovalTimestamp(submission, options.approvedAt);
    property.rejectedAt = null;
    property.sourceSubmission = property.sourceSubmission || submission._id;

    if (!property.title && payload.title) property.title = payload.title;
    if (!property.description && payload.description) property.description = payload.description;
    if ((!Number.isFinite(property.price) || property.price <= 0) && payload.price > 0) {
      property.price = payload.price;
    }
    if (!property.bhk && payload.bhk) property.bhk = payload.bhk;
    if (!property.bathrooms && payload.bathrooms) property.bathrooms = payload.bathrooms;
    if ((!property.location?.area || !property.location?.city) && payload.location) {
      property.location = {
        ...property.location,
        ...payload.location,
      };
    }
    if (!property.reraUrl && payload.reraUrl) property.reraUrl = payload.reraUrl;

    // 🆕 Update new fields
    property.carpetArea = payload.carpetArea;
    property.totalArea = payload.totalArea;
    property.rentPerMonth = payload.rentPerMonth;
    property.deposit = payload.deposit;
    property.maintenanceCharges = payload.maintenanceCharges;
    property.priceUnit = payload.priceUnit;
    property.furnishing = payload.furnishing;
    if (payload.areaSqft) property.areaSqft = payload.areaSqft;

    if ((!property.heroImage || !property.heroImage.url) && payload.heroImage) {
      property.heroImage = payload.heroImage;
    }

    const hasGallery = Array.isArray(property.gallery) && property.gallery.length > 0;
    if (!hasGallery && Array.isArray(payload.gallery) && payload.gallery.length > 0) {
      property.gallery = payload.gallery;
    }

    const hasAmenities = Array.isArray(property.amenities) && property.amenities.length > 0;
    if (!hasAmenities && Array.isArray(payload.amenities) && payload.amenities.length > 0) {
      property.amenities = payload.amenities;
    }

    property.appliances = payload.appliances;
    if (payload.availableFrom) property.availableFrom = payload.availableFrom;

    const hasFeatures = Array.isArray(property.feature) && property.feature.length > 0;
    if (!hasFeatures && Array.isArray(payload.feature) && payload.feature.length > 0) {
      property.feature = payload.feature;
    }

    const hasHighlights = Array.isArray(property.highlights) && property.highlights.length > 0;
    if (!hasHighlights && Array.isArray(payload.highlights) && payload.highlights.length > 0) {
      property.highlights = payload.highlights;
    }

    await property.save();
  }

  submission.publishedProperty = property._id;
  return property;
};

const syncPublishedPropertyVisibility = async (submission, submissionStatus, options = {}) => {
  const property = await findPublishedProperty(submission);
  if (!property) return null;

  if (submissionStatus === 'rejected') {
    property.status = 'rejected';
    property.isActive = false;
    property.rejectedAt = options.rejectedAt || new Date();
    await property.save();
    return property;
  }

  if (submissionStatus === 'new' || submissionStatus === 'reviewing') {
    property.status = 'pending';
    property.isActive = false;
    await property.save();
    return property;
  }

  if (submissionStatus === 'closed') {
    property.isActive = false;
    await property.save();
    return property;
  }

  return property;
};

module.exports = {
  buildPropertyPayloadFromSubmission,
  deriveCategory,
  ensureSubmissionPublished,
  findPublishedProperty,
  syncPublishedPropertyVisibility,
};

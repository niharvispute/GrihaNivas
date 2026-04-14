const { cloudinary } = require('../config/cloudinary');
const AppError = require('../utils/AppError');

/**
 * Cloudinary Service
 *
 * All uploads go through this service — controllers never call Cloudinary directly.
 * Files arrive as Buffer objects from Multer's memoryStorage.
 *
 * Folder structure on Cloudinary:
 *   bricks/properties/images/   → property photos
 *   bricks/properties/plans/    → floor plans
 *   bricks/properties/brochures/→ PDF brochures
 *   bricks/blogs/               → blog featured images
 *   bricks/testimonials/        → testimonial photos
 *   bricks/banners/             → banner images
 *   bricks/users/               → profile pictures
 *
 * Available methods:
 *  - uploadImage(buffer, folder, options?)      → single image → { url, publicId }
 *  - uploadImages(files, folder)                → multiple images → [{ url, publicId }]
 *  - uploadPDF(buffer, folder)                  → PDF → { url, publicId }
 *  - uploadPropertyMedia(files)                 → all property files at once
 *  - deleteFile(publicId)                       → delete by public_id
 *  - deleteFiles(publicIds)                     → bulk delete
 *  - extractPublicId(url)                       → get public_id from Cloudinary URL
 */

// ── Core Upload ──────────────────────────────────────────────────────────────

/**
 * Upload a Buffer to Cloudinary using upload_stream.
 * This is the only function that actually calls Cloudinary.
 * All other methods call this internally.
 *
 * @param {Buffer} buffer
 * @param {object} uploadOptions - Cloudinary upload options
 * @returns {Promise<{url: string, publicId: string, width?: number, height?: number}>}
 */
const uploadBuffer = (buffer, uploadOptions) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(
          new AppError(`Cloudinary upload failed: ${error.message}`, 500)
        );
      }
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      });
    });

    stream.end(buffer);
  });
};

// ── Image Transformation Presets ─────────────────────────────────────────────

const TRANSFORMS = {
  propertyHero: { width: 1200, height: 800, crop: 'fill', gravity: 'auto', quality: 'auto:good', fetch_format: 'auto' },
  propertyGallery: { width: 800, height: 600, crop: 'fill', gravity: 'auto', quality: 'auto:good', fetch_format: 'auto' },
  floorPlan: { width: 1000, quality: 'auto', fetch_format: 'auto' },
  blogFeatured: { width: 1200, height: 630, crop: 'fill', gravity: 'auto', quality: 'auto:good', fetch_format: 'auto' },
  testimonialPhoto: { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' },
  bannerImage: { width: 1400, height: 500, crop: 'fill', gravity: 'auto', quality: 'auto:good', fetch_format: 'auto' },
  builderLogo: { width: 300, height: 300, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' },
  builderCover: { width: 1400, height: 500, crop: 'fill', gravity: 'auto', quality: 'auto:good', fetch_format: 'auto' },
  profilePicture: { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' },
};

// ── Public Methods ────────────────────────────────────────────────────────────

/**
 * Upload a single image.
 *
 * @param {Buffer} buffer
 * @param {string} folder - e.g. 'bricks/properties/images'
 * @param {string} [preset] - key from TRANSFORMS (applies auto resize/crop)
 * @returns {Promise<{url, publicId}>}
 */
const uploadImage = async (buffer, folder, preset = null) => {
  if (!buffer || !buffer.length) {
    throw new AppError('Image buffer is empty', 400);
  }

  const options = {
    folder,
    resource_type: 'image',
    ...(preset && TRANSFORMS[preset] ? { transformation: [TRANSFORMS[preset]] } : {}),
  };

  return uploadBuffer(buffer, options);
};

/**
 * Upload multiple images in parallel.
 *
 * @param {Buffer[]} buffers
 * @param {string} folder
 * @param {string} [preset]
 * @returns {Promise<Array<{url, publicId}>>}
 */
const uploadImages = async (buffers, folder, preset = null) => {
  if (!Array.isArray(buffers) || buffers.length === 0) {
    return [];
  }

  return Promise.all(buffers.map((buffer) => uploadImage(buffer, folder, preset)));
};

/**
 * Upload a PDF document.
 *
 * @param {Buffer} buffer
 * @param {string} folder
 * @returns {Promise<{url, publicId}>}
 */
const uploadPDF = async (buffer, folder) => {
  if (!buffer || !buffer.length) {
    throw new AppError('PDF buffer is empty', 400);
  }

  return uploadBuffer(buffer, {
    folder,
    resource_type: 'raw', // Cloudinary type for non-image/video files
    format: 'pdf',
  });
};

/**
 * Upload a single video.
 *
 * @param {Buffer} buffer
 * @param {string} folder
 * @returns {Promise<{url, publicId}>}
 */
const uploadVideo = async (buffer, folder) => {
  if (!buffer || !buffer.length) {
    throw new AppError('Video buffer is empty', 400);
  }

  return uploadBuffer(buffer, {
    folder,
    resource_type: 'video',
    quality: 'auto:good',
  });
};

/**
 * Upload all property media files in one call.
 * Handles heroImage, gallery images, floor plans, and brochure in parallel.
 *
 * @param {object} files - req.files from propertyUploadFields middleware
 * @returns {Promise<{heroImage?, images, floorPlans, brochureUrl?}>}
 */
const uploadPropertyMedia = async (files = {}) => {
  const results = await Promise.all([
    // Hero image
    files.heroImage?.[0]
      ? uploadImage(files.heroImage[0].buffer, 'bricks/properties/images', 'propertyHero')
      : Promise.resolve(null),

    // Gallery images
    files.images?.length
      ? uploadImages(
          files.images.map((f) => f.buffer),
          'bricks/properties/images',
          'propertyGallery'
        )
      : Promise.resolve([]),

    // Floor plans
    files.floorPlans?.length
      ? uploadImages(
          files.floorPlans.map((f) => f.buffer),
          'bricks/properties/plans',
          'floorPlan'
        )
      : Promise.resolve([]),

    // Brochure PDF
    files.brochure?.[0]
      ? uploadPDF(files.brochure[0].buffer, 'bricks/properties/brochures')
      : Promise.resolve(null),
  ]);

  const [heroImage, images, floorPlans, brochure] = results;

  // Return { url, publicId } pairs — matches the Mongoose mediaSchema shape
  return {
    heroImage:  heroImage  ? { url: heroImage.url,  publicId: heroImage.publicId }  : null,
    gallery:    images.map((r) => ({ url: r.url, publicId: r.publicId })),
    floorPlans: floorPlans.map((r) => ({ url: r.url, publicId: r.publicId })),
    brochure:   brochure   ? { url: brochure.url,   publicId: brochure.publicId }   : null,
  };
};

/**
 * Upload media for property submissions.
 * Handles listing images and optional walkthrough video.
 *
 * @param {object} files - req.files from propertySubmissionUploadFields
 * @returns {Promise<{images: Array<{url, publicId}>, video: {url, publicId} | null}>}
 */
const uploadPropertySubmissionMedia = async (files = {}) => {
  const [images, video] = await Promise.all([
    files.images?.length
      ? uploadImages(
          files.images.map((f) => f.buffer),
          'bricks/property-submissions/images',
          'propertyGallery'
        )
      : Promise.resolve([]),
    files.video?.[0]
      ? uploadVideo(files.video[0].buffer, 'bricks/property-submissions/videos')
      : Promise.resolve(null),
  ]);

  return {
    images: images.map((item) => ({ url: item.url, publicId: item.publicId })),
    video: video ? { url: video.url, publicId: video.publicId } : null,
  };
};

/**
 * Delete a single file from Cloudinary by its public_id.
 *
 * @param {string} publicId
 * @param {'image'|'raw'|'video'} [resourceType='image']
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  if (!publicId) {
    return; // nothing to delete
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    // Log but don't throw — a failed delete shouldn't block other operations
    console.error(`Cloudinary delete failed for ${publicId}:`, err.message);
  }
};

/**
 * Bulk delete files from Cloudinary.
 *
 * @param {string[]} publicIds
 * @param {'image'|'raw'|'video'} [resourceType='image']
 */
const deleteFiles = async (publicIds, resourceType = 'image') => {
  if (!publicIds || publicIds.length === 0) {
    return;
  }

  const validIds = publicIds.filter(Boolean);
  if (validIds.length === 0) {
    return;
  }

  try {
    // Cloudinary supports bulk delete of up to 100 IDs at a time
    await cloudinary.api.delete_resources(validIds, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary bulk delete failed:', err.message);
  }
};

/**
 * Extract the public_id from a Cloudinary secure URL.
 *
 * Example:
 *   Input:  "https://res.cloudinary.com/mycloud/image/upload/v123/bricks/properties/images/abc.jpg"
 *   Output: "bricks/properties/images/abc"
 *
 * @param {string} url - Cloudinary secure_url
 * @returns {string|null} publicId
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Pattern: .../upload/v<version>/<publicId>.<ext>
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  uploadPDF,
  uploadVideo,
  uploadPropertyMedia,
  uploadPropertySubmissionMedia,
  deleteFile,
  deleteFiles,
  extractPublicId,
  TRANSFORMS,
};

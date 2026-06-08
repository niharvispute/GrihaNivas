const multer = require('multer');
const AppError = require('../utils/AppError');

/**
 * File Upload Middleware (Multer).
 *
 * Uses memoryStorage — files are held in RAM as Buffer objects.
 * The actual Cloudinary upload is handled separately in cloudinaryService.js.
 * This keeps the middleware clean and gives the service full control over
 * folder structure, transformations, and error handling.
 *
 * Configured variants:
 *  - uploadImage                : Single image (property hero, profile pic, testimonial)
 *  - uploadImages               : Multiple images (property gallery — max 10)
 *  - uploadPDF                  : Single PDF (brochure)
 *  - uploadMixed                : Images + PDF together (property creation)
 *  - uploadProject              : Images + PDF (project hero, gallery, master plan, brochure)
 *  - uploadConfiguration        : Images for configuration floor plans + gallery
 */

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;  // 2 MB
const MAX_PDF_SIZE   = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_GALLERY    = 10;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_PDF_TYPES   = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

// ── Storage ─────────────────────────────────────────────────────────────────

const memoryStorage = multer.memoryStorage();

// ── File Filters ─────────────────────────────────────────────────────────────

const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(
      `Invalid image type: "${file.mimetype}". Allowed: JPEG, PNG, WEBP.`
    );
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (ALLOWED_PDF_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(`Invalid file type: "${file.mimetype}". Only PDF files are allowed.`);
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

const mixedFilter = (req, file, cb) => {
  const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPES];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(
      `Invalid file type: "${file.mimetype}". Allowed: JPEG, PNG, WEBP, PDF.`
    );
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

const propertySubmissionFilter = (req, file, cb) => {
  const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_PDF_TYPES];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type: "${file.mimetype}". Allowed: JPEG, PNG, WEBP, MP4, MOV, WEBM, PDF, DOC.`,
        400
      ),
      false
    );
  }
};

// ── Multer Instances ──────────────────────────────────────────────────────────

/**
 * Single image upload.
 * Usage: uploadImage.single('image')
 */
const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
});

/**
 * Multiple images upload (gallery).
 * Usage: uploadImages.array('images', 10)
 */
const uploadImages = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE, files: MAX_GALLERY },
});

/**
 * Single PDF upload (brochure).
 * Usage: uploadPDF.single('brochure')
 */
const uploadPDF = multer({
  storage: memoryStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: MAX_PDF_SIZE },
});

/**
 * Mixed upload — images + optional PDF (property creation form).
 * Fields:
 *   - heroImage  : 1 image
 *   - images     : up to 10 images
 *   - floorPlans : up to 5 images
 *   - brochure   : 1 PDF
 *
 * Usage: uploadMixed.fields([...])
 */
const uploadMixed = multer({
  storage: memoryStorage,
  fileFilter: mixedFilter,
  limits: { fileSize: MAX_PDF_SIZE, files: 17 }, // 1 + 10 + 5 + 1
});

const uploadPropertySubmission = multer({
  storage: memoryStorage,
  fileFilter: propertySubmissionFilter,
  limits: { fileSize: MAX_VIDEO_SIZE, files: 11 },
});

/**
 * Project upload — hero, gallery (10), master plan, brochure (PDF).
 * Fields:
 *   - heroImage  : 1 image
 *   - images     : up to 10 images
 *   - masterPlan : 1 image
 *   - brochure   : 1 PDF
 *
 * Usage: projectUploadFields
 */
const projectUploadFields = multer({
  storage: memoryStorage,
  fileFilter: mixedFilter,
  limits: { fileSize: MAX_PDF_SIZE, files: 13 }, // 1 + 10 + 1 + 1
}).fields([
  { name: 'heroImage',  maxCount: 1  },
  { name: 'images',     maxCount: 10 },
  { name: 'masterPlan', maxCount: 1  },
  { name: 'brochure',   maxCount: 1  },
]);

/**
 * Configuration upload — floor plans + gallery (each up to 5).
 * Fields:
 *   - floorPlans : up to 5 images
 *   - images     : up to 5 images
 *
 * Usage: configUploadFields
 */
const configUploadFields = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 10 },
}).fields([
  { name: 'floorPlans', maxCount: 5 },
  { name: 'images',     maxCount: 5 },
]);

const propertyUploadFields = uploadMixed.fields([
  { name: 'heroImage',   maxCount: 1  },
  { name: 'images',      maxCount: 10 },
  { name: 'floorPlans',  maxCount: 5  },
  { name: 'brochure',    maxCount: 1  },
]);

const builderUploadFields = uploadImages.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

const propertySubmissionUploadFields = uploadPropertySubmission.fields([
  { name: 'images', maxCount: 10 },
  { name: 'floorPlans', maxCount: 5 },
  { name: 'brochure', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

module.exports = {
  uploadImage,
  uploadImages,
  uploadPDF,
  uploadMixed,
  propertyUploadFields,
  builderUploadFields,
  propertySubmissionUploadFields,
  projectUploadFields,
  configUploadFields,
};

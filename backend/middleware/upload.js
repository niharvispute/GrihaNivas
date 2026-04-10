const multer = require('multer');

/**
 * File Upload Middleware (Multer).
 *
 * Uses memoryStorage — files are held in RAM as Buffer objects.
 * The actual Cloudinary upload is handled separately in cloudinaryService.js.
 * This keeps the middleware clean and gives the service full control over
 * folder structure, transformations, and error handling.
 *
 * Configured variants:
 *  - uploadImage   : Single image (property hero, profile pic, testimonial)
 *  - uploadImages  : Multiple images (property gallery — max 10)
 *  - uploadPDF     : Single PDF (brochure)
 *  - uploadMixed   : Images + PDF together (property creation)
 */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_PDF_SIZE   = 10 * 1024 * 1024; // 10 MB
const MAX_GALLERY    = 10;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_PDF_TYPES   = ['application/pdf'];

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

const propertyUploadFields = uploadMixed.fields([
  { name: 'heroImage',   maxCount: 1  },
  { name: 'images',      maxCount: 10 },
  { name: 'floorPlans',  maxCount: 5  },
  { name: 'brochure',    maxCount: 1  },
]);

module.exports = {
  uploadImage,
  uploadImages,
  uploadPDF,
  uploadMixed,
  propertyUploadFields,
};

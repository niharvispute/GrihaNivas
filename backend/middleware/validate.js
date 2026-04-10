const { z } = require('zod');
const { sendBadRequest } = require('../utils/apiResponse');

/**
 * Validation Middleware Factory.
 *
 * Accepts a Zod schema and returns an Express middleware that validates
 * the request body/query/params. On failure, returns a structured 400
 * with all field errors flattened.
 *
 * Usage:
 *   const { validate, schemas } = require('../middleware/validate');
 *   router.post('/leads', validate(schemas.lead.create), leadController.create);
 *
 * @param {z.ZodSchema} schema
 * @param {'body'|'query'|'params'} target
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return sendBadRequest(res, 'Validation failed', errors);
    }

    // Replace req[target] with the parsed (coerced + stripped) value
    req[target] = result.data;
    next();
  };
};

// ─────────────────────────────────────────────
// SHARED FIELD VALIDATORS
// ─────────────────────────────────────────────

const phoneSchema = z
  .string()
  .regex(/^\+91[6-9]\d{9}$/, 'Phone must be in format +91XXXXXXXXXX (Indian mobile number)');

const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();

const objectIdSchema = z
  .string()
  .length(24, 'Invalid ID format')
  .regex(/^[a-f0-9]{24}$/, 'Invalid ID format');

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const schemas = {
  // ── AUTH ──────────────────────────────────
  auth: {
    sendOtp: z.object({
      phone: phoneSchema,
    }),

    // Handles two verification paths:
    //  Path A (custom OTP)  : { phone, otp }
    //  Path B (Firebase)    : { phone, idToken }
    // At least one of otp/idToken must be present.
    verifyOtp: z
      .object({
        phone: phoneSchema,
        otp: z
          .string()
          .length(6, 'OTP must be exactly 6 digits')
          .regex(/^\d{6}$/, 'OTP must contain only digits')
          .optional(),
        idToken: z.string().min(1, 'Firebase ID token cannot be empty').optional(),
        name: z.string().trim().min(2).max(100).optional(),
        email: emailSchema.optional(),
      })
      .superRefine((data, ctx) => {
        if (!data.otp && !data.idToken) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Either otp or idToken is required',
            path: ['otp'],
          });
        }
        if (data.otp && data.idToken) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Provide either otp or idToken, not both',
            path: ['otp'],
          });
        }
      }),

    refresh: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    }),

    logout: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
  },

  // ── LEADS ─────────────────────────────────
  lead: {
    create: z.object({
      name: z.string().trim().min(2, 'Name too short').max(100),
      phone: phoneSchema,
      email: emailSchema.optional(),
      leadType: z.enum(['buy', 'rent', 'loan', 'agreement', 'list_property']),
      propertyId: objectIdSchema.optional(),
      message: z.string().trim().max(1000).optional(),
      budgetMin: z.number().min(0).optional(),
      budgetMax: z.number().min(0).optional(),
      monthlyIncome: z.number().min(0).optional(),
      preferredLocations: z.array(z.string()).max(5).optional(),
    }),

    updateStatus: z.object({
      status: z.enum(['new', 'contacted', 'qualified', 'closed']),
    }),

    addNote: z.object({
      text: z.string().trim().min(1).max(2000),
    }),

    list: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      status: z.enum(['new', 'contacted', 'qualified', 'closed']).optional(),
      leadType: z.enum(['buy', 'rent', 'loan', 'agreement', 'list_property']).optional(),
      search: z.string().trim().max(100).optional(),
    }),
  },

  // ── PROPERTIES ────────────────────────────
  property: {
    create: z.object({
      title: z.string().trim().min(5).max(200),
      description: z.string().trim().min(20).max(5000),
      category: z.enum(['buy', 'rent', 'commercial', 'new_launch']),
      propertyType: z.enum(['Apartment', 'Penthouse', 'Villa', 'Commercial', 'Land']).optional(),
      location: z.object({
        city: z.string().default('Mumbai'),
        area: z.string().trim().min(1),
        address: z.string().trim().optional(),
        coordinates: z
          .object({
            lat: z.number().min(-90).max(90),
            lng: z.number().min(-180).max(180),
          })
          .optional(),
      }),
      price: z.number().min(0),
      pricePerSqft: z.number().min(0).optional(),
      priceOnRequest: z.boolean().default(false),
      bhk: z.enum(['1BHK', '2BHK', '3BHK', '4BHK', '5+BHK']).optional(),
      superArea: z.number().min(0).optional(),
      carpetArea: z.number().min(0).optional(),
      builtArea: z.number().min(0).optional(),
      floorNumber: z.number().int().min(0).optional(),
      totalFloors: z.number().int().min(1).optional(),
      possessionStatus: z
        .enum(['Ready to Move', 'Within 1 Year', 'Under Construction'])
        .optional(),
      possessionDate: z.coerce.date().optional(),
      furnishingType: z.enum(['Fully-furnished', 'Semi-furnished', 'Unfurnished']).optional(),
      reraNumber: z.string().trim().optional(),
      reraRegistered: z.boolean().default(false),
      builderName: z.string().trim().max(200).optional(),
      keyHighlights: z.array(z.string()).max(20).optional(),
      amenities: z.array(z.string()).max(50).optional(),
      isFeatured: z.boolean().default(false),
    }),

    list: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
      category: z.enum(['buy', 'rent', 'commercial', 'new_launch']).optional(),
      bhk: z.enum(['1BHK', '2BHK', '3BHK', '4BHK', '5+BHK']).optional(),
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      area: z.string().trim().optional(),
      furnishingType: z.enum(['Fully-furnished', 'Semi-furnished', 'Unfurnished']).optional(),
      possessionStatus: z
        .enum(['Ready to Move', 'Within 1 Year', 'Under Construction'])
        .optional(),
      isFeatured: z.coerce.boolean().optional(),
      sortBy: z.enum(['price_asc', 'price_desc', 'newest']).default('newest'),
    }),
  },

  // ── BLOGS ─────────────────────────────────
  blog: {
    create: z.object({
      title: z.string().trim().min(5).max(200),
      content: z.string().trim().min(100),
      category: z.string().trim().min(1),
      tags: z.array(z.string().trim()).max(10).optional(),
      metaTitle: z.string().trim().max(70).optional(),
      metaDescription: z.string().trim().max(160).optional(),
      keywords: z.array(z.string().trim()).max(20).optional(),
    }),

    addComment: z.object({
      name: z.string().trim().min(2).max(100),
      comment: z.string().trim().min(2).max(1000),
    }),

    list: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(20).default(10),
      category: z.string().trim().optional(),
      tag: z.string().trim().optional(),
      search: z.string().trim().max(100).optional(),
    }),
  },

  // ── CONTACT ───────────────────────────────
  contact: {
    submit: z.object({
      name: z.string().trim().min(2).max(100),
      phone: phoneSchema,
      email: emailSchema.optional(),
      message: z.string().trim().min(10).max(2000),
    }),
  },

  // ── TESTIMONIALS ──────────────────────────
  testimonial: {
    create: z.object({
      name: z.string().trim().min(2).max(100),
      rating: z.number().int().min(1).max(5),
      message: z.string().trim().min(10).max(1000),
      videoUrl: z.string().url().optional(),
    }),
  },

  // ── STAMP DUTY ────────────────────────────
  stampDuty: {
    update: z.object({
      maleRate: z.number().min(0).max(100),
      femaleRate: z.number().min(0).max(100),
      jointRate: z.number().min(0).max(100),
      registrationCharge: z.number().min(0),
    }),
  },

  // ── CALCULATORS ───────────────────────────
  calculator: {
    emi: z.object({
      principal: z.number().min(100000).max(1_000_000_000),
      annualInterestRate: z.number().min(0.1).max(50),
      tenureMonths: z.number().int().min(1).max(360),
    }),

    stampDuty: z.object({
      propertyValue: z.number().min(0),
      ownershipType: z.enum(['male', 'female', 'joint']),
    }),
  },

  // ── USER ──────────────────────────────────
  user: {
    saveProperty: z.object({
      propertyId: objectIdSchema,
    }),

    compareProperty: z.object({
      propertyId: objectIdSchema,
    }),

    updateProfile: z.object({
      name: z.string().trim().min(2).max(100).optional(),
      email: emailSchema.optional(),
      preferredLocations: z.array(z.string()).max(10).optional(),
      notificationPrefs: z
        .object({
          email: z.boolean().optional(),
          sms: z.boolean().optional(),
        })
        .optional(),
    }),
  },
};

module.exports = { validate, schemas };

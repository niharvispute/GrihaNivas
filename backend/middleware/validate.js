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
      if (process.env.NODE_ENV !== 'production') {
        console.error('[VALIDATE] failed on', req.method, req.path, JSON.stringify(errors));
      }
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

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number');

const otpCodeSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Identifier is required')
  .refine(
    (value) => /^\+91[6-9]\d{9}$/.test(value) || /^\S+@\S+\.\S+$/.test(value),
    'Identifier must be a valid email or phone (+91XXXXXXXXXX)'
  );

const objectIdSchema = z
  .string()
  .length(24, 'Invalid ID format')
  .regex(/^[a-f0-9]{24}$/, 'Invalid ID format');

const builderFaqSchema = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(3).max(2000),
});

const builderTestimonialSchema = z.object({
  author: z.string().trim().min(2).max(120),
  role: z.string().trim().max(150).optional(),
  content: z.string().trim().min(5).max(1500),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  avatar: z.string().trim().url().optional(),
});

// Correctly coerces FormData string booleans: 'true'→true, 'false'→false, actual booleans pass through.
const parseStringBoolean = (val) => {
  if (val === 'true' || val === true || val === 1) return true;
  if (val === 'false' || val === false || val === 0 || val === '' || val == null) return false;
  return val;
};

const stringBooleanSchema = z.preprocess(parseStringBoolean, z.boolean());

const parseJsonIfString = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;

  if (
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (trimmed.startsWith('{') && trimmed.endsWith('}'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
};

const builderFeaturedImagesSchema = z.preprocess(
  parseJsonIfString,
  z.array(z.string().trim().url()).max(12)
);

const builderFaqListSchema = z.preprocess(
  parseJsonIfString,
  z.array(builderFaqSchema).max(20)
);

const builderTestimonialsListSchema = z.preprocess(
  parseJsonIfString,
  z.array(builderTestimonialSchema).max(30)
);

const builderSeoSchema = z.preprocess(
  parseJsonIfString,
  z.object({
    metaTitle: z.string().trim().max(70).optional(),
    metaDescription: z.string().trim().max(160).optional(),
    keywords: z.array(z.string().trim()).max(20).optional(),
  })
);

const propertySubmissionStringArraySchema = z.preprocess(
  parseJsonIfString,
  z.array(z.string().trim().min(1).max(300)).max(12)
);

const propertySubmissionImagesSchema = z.preprocess(
  parseJsonIfString,
  z.array(z.string().trim().min(1).max(300)).max(20)
);

const propertySubmissionAmenitiesSchema = z.preprocess(
  parseJsonIfString,
  z.array(z.string().trim().min(1).max(120)).max(30)
);

const propertySubmissionVideoMetaSchema = z.preprocess(
  parseJsonIfString,
  z.object({
    name: z.string().trim().max(255).optional(),
    size: z.coerce.number().min(0).optional(),
    type: z.string().trim().max(120).optional(),
    url: z.string().trim().url().optional(),
    publicId: z.string().trim().max(400).optional(),
  })
);

const BLOG_CATEGORY_MAP = {
  market_trends: 'market_trends',
  'market-insights': 'market_trends',
  buying_guide: 'buying_guide',
  'buying-guide': 'buying_guide',
  legal: 'legal',
  investment: 'investment',
  lifestyle: 'lifestyle',
};

const blogCategorySchema = z
  .enum(Object.keys(BLOG_CATEGORY_MAP))
  .transform((value) => BLOG_CATEGORY_MAP[value]);

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const schemas = {
  // ── AUTH ──────────────────────────────────
  auth: {
    signupRequest: z.object({
      name: z.string().trim().min(2).max(100),
      email: emailSchema,
      phone: phoneSchema,
      password: passwordSchema,
    }),

    signupVerifyEmail: z.object({
      otp: otpCodeSchema,
    }),

    signupResendOtp: z.object({}),

    login: z.object({
      identifier: identifierSchema,
      password: z.string().min(1, 'Password is required'),
    }),

    forgotPasswordRequest: z.object({
      identifier: identifierSchema,
    }),

    forgotPasswordVerify: z.object({
      otp: otpCodeSchema,
    }),

    forgotPasswordReset: z.object({
      newPassword: passwordSchema,
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
    idParams: z.object({
      id: objectIdSchema,
    }),

    create: z.object({
      name: z.string().trim().min(2, 'Name too short').max(100),
      phone: phoneSchema,
      email: emailSchema.optional(),
      leadType: z.enum(['buy', 'rent', 'loan', 'agreement']),
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
      leadType: z.enum(['buy', 'rent', 'loan', 'agreement']).optional(),
      search: z.string().trim().max(100).optional(),
    }),
  },

  // ── PROPERTY SUBMISSIONS ──────────────────
  propertySubmission: {
    idParams: z.object({
      id: objectIdSchema,
    }),

    create: z.object({
      ownerName: z.string().trim().min(2).max(120),
      phone: phoneSchema,
      email: emailSchema.optional(),
      listingType: z.enum(['Sale', 'Rent']),
      buildingType: z.enum(['Residential', 'Commercial']),
      propertyType: z.string().trim().min(2).max(100),
      city: z.string().trim().min(2).max(100).default('Mumbai'),
      locality: z.string().trim().min(2).max(200),
      possession: z.enum(['Ready to Move', 'Under Construction', 'Available Now', 'Available Soon']),
      age: z.string().trim().min(1).max(20),
      bathrooms: z.string().trim().min(1).max(20),
      balconies: z.string().trim().max(30).optional(),
      coveredParking: z.string().trim().max(30).optional(),
      openParking: z.string().trim().max(30).optional(),
      furnishing: z.string().trim().max(100).optional(),
      images: propertySubmissionImagesSchema.optional(),
      floorPlans: propertySubmissionImagesSchema.optional(),
      brochure: z.string().trim().url().optional(),
      videoMeta: propertySubmissionVideoMetaSchema.optional(),
      price: z.coerce.number().min(0).optional(),
      rentPerMonth: z.coerce.number().min(0).optional(),
      deposit: z.coerce.number().min(0).optional(),
      maintenanceCharges: z.coerce.number().min(0).optional(),
      carpetArea: z.coerce.number().min(0).optional(),
      totalArea: z.coerce.number().min(0).optional(),
      amenities: propertySubmissionAmenitiesSchema.optional(),
      appliances: z.preprocess(parseJsonIfString, z.array(z.string().trim().min(1).max(120)).max(30)).optional(),
      availableFrom: z.coerce.date().optional(),
      feature: propertySubmissionStringArraySchema.optional(),
      reraUrl: z.string().trim().url().max(500).optional(),
      reraNumber: z.string().trim().max(100).optional(),
      title: z.string().trim().max(200).optional(),
      description: z.string().trim().max(5000).optional(),
      readyToProceed: z.coerce.boolean().optional(),
    }),

    list: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      status: z.enum(['new', 'reviewing', 'approved', 'rejected', 'closed']).optional(),
      excludeStatus: z.enum(['new', 'reviewing', 'approved', 'rejected', 'closed']).optional(),
      listingType: z.enum(['Sale', 'Rent']).optional(),
      buildingType: z.enum(['Residential', 'Commercial']).optional(),
      search: z.string().trim().max(100).optional(),
    }),

    updateStatus: z.object({
      status: z.enum(['new', 'reviewing', 'approved', 'rejected', 'closed']),
    }),

    assign: z.object({
      adminId: objectIdSchema,
    }),

    addNote: z.object({
      text: z.string().trim().min(1).max(2000),
    }),
  },

  // ── PROPERTIES ────────────────────────────
  // All field names match the Mongoose Property model exactly.
  property: {
    create: z.object({
      title:       z.string().trim().min(5).max(200),
      description: z.string().trim().min(20).max(5000),
      category:    z.enum(['buy', 'rent', 'commercial', 'new_launch']),
      location: z.object({
        city:    z.string().trim().default('Mumbai'),
        area:    z.string().trim().min(1),
        address: z.string().trim().optional(),
        pincode: z.string().trim().optional(),
        coordinates: z.object({
          lat: z.number().min(-90).max(90),
          lng: z.number().min(-180).max(180),
        }).optional(),
      }),
      price:        z.number().min(0),
      priceUnit:    z.enum(['total', 'per_sqft', 'per_month']).default('total'),
      isNegotiable: z.boolean().default(false),
      bhk:          z.coerce.number().int().min(1).max(10).optional(),
      bathrooms:    z.coerce.number().int().min(1).max(20).optional(),
      areaSqft:     z.number().min(1).optional(),
      carpetArea:   z.number().min(1).optional(),
      totalArea:    z.number().min(1).optional(),
      rentPerMonth: z.number().min(0).optional(),
      deposit:      z.number().min(0).optional(),
      maintenanceCharges: z.number().min(0).optional(),
      floor:        z.number().int().min(0).optional(),
      totalFloors:  z.number().int().min(1).optional(),
      parking:      z.number().int().min(0).default(0),
      furnishing:   z.enum(['unfurnished', 'semi_furnished', 'furnished']).optional(),
      builder:      objectIdSchema.optional(),
      facing:       z.string().trim().optional(),
      possession:   z.string().trim().optional(),
      age:          z.string().trim().optional(),
      reraNumber:   z.string().trim().optional(),
      reraUrl:      z.string().trim().url().max(500).optional(),
      amenities:    z.array(z.string().trim()).max(50).optional(),
      feature:      z.array(z.string().trim()).max(12).optional(),
      highlights:   z.array(z.string().trim()).max(20).optional(),
      isFeatured:   z.boolean().default(false),
      seoTitle:       z.string().trim().max(70).optional(),
      seoDescription: z.string().trim().max(160).optional(),
    }),

    submit: z.object({
      title:       z.string().trim().min(5).max(200),
      description: z.string().trim().min(20).max(5000),
      category:    z.enum(['buy', 'rent', 'commercial', 'new_launch']),
      location: z.object({
        city:    z.string().trim().default('Mumbai'),
        area:    z.string().trim().min(1),
        address: z.string().trim().optional(),
        pincode: z.string().trim().optional(),
        coordinates: z.object({
          lat: z.number().min(-90).max(90),
          lng: z.number().min(-180).max(180),
        }).optional(),
      }),
      price:        z.number().min(0),
      priceUnit:    z.enum(['total', 'per_sqft', 'per_month']).default('total'),
      isNegotiable: z.boolean().default(false),
      bhk:          z.coerce.number().int().min(1).max(10).optional(),
      bathrooms:    z.coerce.number().int().min(1).max(20).optional(),
      areaSqft:     z.number().min(1).optional(),
      carpetArea:   z.number().min(1).optional(),
      totalArea:    z.number().min(1).optional(),
      rentPerMonth: z.number().min(0).optional(),
      deposit:      z.number().min(0).optional(),
      maintenanceCharges: z.number().min(0).optional(),
      floor:        z.number().int().min(0).optional(),
      totalFloors:  z.number().int().min(1).optional(),
      parking:      z.number().int().min(0).default(0),
      furnishing:   z.enum(['unfurnished', 'semi_furnished', 'furnished']).optional(),
      builder:      objectIdSchema.optional(),
      facing:       z.string().trim().optional(),
      possession:   z.string().trim().optional(),
      age:          z.string().trim().optional(),
      reraNumber:   z.string().trim().optional(),
      reraUrl:      z.string().trim().url().max(500).optional(),
      amenities:    z.array(z.string().trim()).max(50).optional(),
      feature:      z.array(z.string().trim()).max(12).optional(),
      highlights:   z.array(z.string().trim()).max(20).optional(),
      seoTitle:       z.string().trim().max(70).optional(),
      seoDescription: z.string().trim().max(160).optional(),
    }),

    adminList: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
      search: z.string().trim().max(100).optional(),
      builder: objectIdSchema.optional(),
      noBuilder: z.preprocess((v) => v === 'true' || v === true, z.boolean()).optional(),
      isActive: z.preprocess((v) => {
        if (v === 'true' || v === true) return true;
        if (v === 'false' || v === false) return false;
        return undefined;
      }, z.boolean()).optional(),
    }),

    heroImage: z.object({
      url: z.string().url('Invalid image URL'),
      publicId: z.string().min(1, 'publicId is required'),
    }),

    moderationParams: z.object({
      id: objectIdSchema,
    }),

    list: z.object({
      page:      z.coerce.number().int().min(1).default(1),
      limit:     z.coerce.number().int().min(1).max(50).default(10),
      category:  z.enum(['buy', 'rent', 'commercial', 'new_launch']).optional(),
      launchWindow: z.coerce.boolean().optional(),
      builder:   objectIdSchema.optional(),
      builderSlug: z.string().trim().max(200).optional(),
      bhk:       z.coerce.number().int().min(1).max(10).optional(),
      minPrice:  z.coerce.number().min(0).optional(),
      maxPrice:  z.coerce.number().min(0).optional(),
      area:      z.string().trim().optional(),
      furnishing: z.enum(['unfurnished', 'semi_furnished', 'furnished']).optional(),
      isFeatured: z.coerce.boolean().optional(),
      hasMedia: z.coerce.boolean().optional(),
      sortBy:    z.enum(['price_asc', 'price_desc', 'newest']).default('newest'),
    }),
  },

  // ── BUILDERS ──────────────────────────────
  builder: {
    publicList: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
      search: z.string().trim().max(100).optional(),
      city: z.string().trim().max(100).optional(),
      isFeatured: z.coerce.boolean().optional(),
    }),

    slugParams: z.object({
      slug: z.string().trim().min(1),
    }),

    adminList: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      search: z.string().trim().max(100).optional(),
      isActive: z.coerce.boolean().optional(),
      isFeatured: z.coerce.boolean().optional(),
    }),

    idParams: z.object({
      id: objectIdSchema,
    }),

    create: z.object({
      name: z.string().trim().min(2).max(150),
      slug: z.string().trim().min(2).max(200).optional(),
      description: z.string().trim().max(4000).optional(),
      shortDescription: z.string().trim().max(300).optional(),
      aboutHeadline: z.string().trim().max(200).optional(),
      qualityStandards: z.string().trim().max(250).optional(),
      innovation: z.string().trim().max(250).optional(),
      featuredImages: builderFeaturedImagesSchema.optional(),
      faqs: builderFaqListSchema.optional(),
      testimonials: builderTestimonialsListSchema.optional(),
      establishedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
      totalProjects: z.coerce.number().int().min(0).optional(),
      ongoingProjects: z.coerce.number().int().min(0).optional(),
      completedDeliveries: z.coerce.number().int().min(0).optional(),
      headquarters: z.string().trim().max(200).optional(),
      reraNumber: z.string().trim().max(100).optional(),
      reraUrl: z.string().trim().url().max(500).optional().or(z.literal('')),
      isFeatured: stringBooleanSchema.optional(),
      isActive: stringBooleanSchema.optional(),
      seo: builderSeoSchema.optional(),
    }),

    featureToggle: z.object({
      isFeatured: stringBooleanSchema,
    }),

    linkProperty: z.object({
      propertyId: objectIdSchema,
      action: z.enum(['link', 'unlink']),
    }),

    update: z
      .object({
        name: z.string().trim().min(2).max(150).optional(),
        slug: z.string().trim().min(2).max(200).optional(),
        description: z.string().trim().max(4000).optional(),
        shortDescription: z.string().trim().max(300).optional(),
        aboutHeadline: z.string().trim().max(200).optional(),
        qualityStandards: z.string().trim().max(250).optional(),
        innovation: z.string().trim().max(250).optional(),
        featuredImages: builderFeaturedImagesSchema.optional(),
        faqs: builderFaqListSchema.optional(),
        testimonials: builderTestimonialsListSchema.optional(),
        establishedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
        totalProjects: z.coerce.number().int().min(0).optional(),
        ongoingProjects: z.coerce.number().int().min(0).optional(),
        completedDeliveries: z.coerce.number().int().min(0).optional(),
        headquarters: z.string().trim().max(200).optional(),
        reraNumber: z.string().trim().max(100).optional(),
        reraUrl: z.string().trim().url().max(500).optional().or(z.literal('')),
        isFeatured: stringBooleanSchema.optional(),
        isActive: stringBooleanSchema.optional(),
        seo: builderSeoSchema.optional(),
      })
      .refine((value) => Object.keys(value).length > 0, {
        message: 'At least one field must be provided',
      }),
  },

  // ── BLOGS ─────────────────────────────────
  blog: {
    create: z
      .object({
        title: z.string().trim().min(1).max(200),
        content: z.string().trim().min(1),
        category: blogCategorySchema,
        tags: z.array(z.string().trim()).max(10).optional(),
        seoTitle: z.string().trim().max(70).optional(),
        seoDescription: z.string().trim().max(160).optional(),
        // Backward-compatibility aliases accepted for existing clients
        metaTitle: z.string().trim().max(70).optional(),
        metaDescription: z.string().trim().max(160).optional(),
        keywords: z.array(z.string().trim()).max(20).optional(),
        isPublished: z.coerce.boolean().optional(),
      })
      .superRefine((data, ctx) => {
        if (!data.isPublished) return;

        if ((data.title || '').trim().length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['title'],
            message: 'Published post title must be at least 5 characters',
          });
        }

        if ((data.content || '').trim().length < 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['content'],
            message: 'Published post content must be at least 100 characters',
          });
        }
      }),

    addComment: z.object({
      name: z.string().trim().min(2).max(100),
      comment: z.string().trim().min(2).max(1000),
    }),

    commentParams: z.object({
      id: objectIdSchema,
      commentId: objectIdSchema,
    }),

    adminCommentsList: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      status: z.enum(['pending', 'approved']).default('pending'),
    }),

    list: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      category: blogCategorySchema.optional(),
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
    newsletter: z.object({
      email: emailSchema,
      source: z.string().trim().min(2).max(80).optional(),
    }),
  },

  // ── TESTIMONIALS ──────────────────────────
  testimonial: {
    create: z
      .object({
        name: z.string().trim().min(2).max(100),
        rating: z.coerce.number().int().min(1).max(5).default(5),
        testimonial: z.string().trim().min(10).max(800).optional(),
        message: z.string().trim().min(10).max(800).optional(), // backward compatibility
        designation: z.string().trim().max(100).optional(),
        company: z.string().trim().max(100).optional(),
        isActive: z.coerce.boolean().optional(),
        order: z.coerce.number().int().min(0).optional(),
      })
      .refine((data) => Boolean(data.testimonial || data.message), {
        message: 'Testimonial text is required',
        path: ['testimonial'],
      })
      .transform((data) => {
        const { message, ...rest } = data;
        return {
          ...rest,
          testimonial: (data.testimonial || message || '').trim(),
        };
      }),
  },

  // ── STAMP DUTY ────────────────────────────
  stampDuty: {
    update: z.object({
      buy: z.object({
        maleRate: z.number().min(0).max(100),
        femaleRate: z.number().min(0).max(100),
        jointRate: z.number().min(0).max(100),
        registrationCharge: z.number().min(0),
      }),
      rent: z.object({
        maleRate: z.number().min(0).max(100),
        femaleRate: z.number().min(0).max(100),
        jointRate: z.number().min(0).max(100),
        registrationCharge: z.number().min(0),
      }),
      dhc: z.number().min(0).optional(),
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

    rentStampDuty: z
      .object({
        licensePeriodMonths: z.number().int().min(1).max(120),
        rentType: z.enum(['fixed', 'varying']),
        fixedMonthlyRent: z.number().min(0).optional(),
        varyingRentRows: z
          .array(
            z.object({
              fromMonth: z.number().int().min(1),
              toMonth: z.number().int().min(1),
              monthlyRent: z.number().min(0),
            })
          )
          .max(60)
          .optional(),
        refundableDeposit: z.number().min(0).default(0),
        nonRefundableDeposit: z.number().min(0).default(0),
        propertyArea: z.enum(['urban', 'rural']),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      })
      .refine(
        (data) => {
          if (data.rentType === 'fixed') return data.fixedMonthlyRent != null && data.fixedMonthlyRent >= 0;
          return Array.isArray(data.varyingRentRows) && data.varyingRentRows.length > 0;
        },
        (data) => ({
          message:
            data.rentType === 'fixed'
              ? 'fixedMonthlyRent is required for fixed rent type'
              : 'varyingRentRows (non-empty) is required for varying rent type',
          path: data.rentType === 'fixed' ? ['fixedMonthlyRent'] : ['varyingRentRows'],
        })
      ),
  },

  // ── USER ──────────────────────────────────
  user: {
    adminList: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      search: z.string().trim().max(100).optional(),
      role: z.enum(['user', 'admin']).optional(),
      isActive: z.coerce.boolean().optional(),
    }),

    myPropertiesList: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
    }),

    userIdParam: z.object({
      id: objectIdSchema,
    }),

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

    // ── SYSTEM ────────────────────────────────
    system: {
      areasQuery: z.object({
        city: z.string().trim().max(100).optional(),
      }),

      updateConfig: z
        .object({
          city: z.string().trim().min(2).max(100).optional(),
          locale: z.string().trim().min(2).max(20).optional(),
          currency: z.string().trim().min(3).max(10).optional(),
          defaultCountryCode: z
            .string()
            .trim()
            .regex(/^\+\d{1,4}$/, 'defaultCountryCode must be in +NN format')
            .optional(),
          areas: z.array(z.string().trim().min(1).max(120)).max(300).optional(),
          bhkValues: z.array(z.string().trim().min(1).max(20)).max(20).optional(),
          amenityList: z.array(z.string().trim().min(1).max(120)).max(300).optional(),
          propertyTypes: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
          statusOptions: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
          furnishingOptions: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
          allowDynamicAreas: z.coerce.boolean().optional(),
          allowDynamicAmenities: z.coerce.boolean().optional(),
        })
        .refine((value) => Object.keys(value).length > 0, {
          message: 'At least one field must be provided',
        }),
    },
};

module.exports = { validate, schemas };

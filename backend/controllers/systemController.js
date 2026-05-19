const Property = require('../models/mongoose/Property');
const SystemConfig = require('../models/mongoose/SystemConfig');
const { sendSuccess } = require('../utils/apiResponse');

const DEFAULT_CITY = String(process.env.SYSTEM_DEFAULT_CITY || 'Mumbai').trim() || 'Mumbai';
const DEFAULT_LOCALE = String(process.env.SYSTEM_DEFAULT_LOCALE || 'en-IN').trim() || 'en-IN';
const DEFAULT_CURRENCY = String(process.env.SYSTEM_DEFAULT_CURRENCY || 'INR').trim() || 'INR';
const DEFAULT_COUNTRY_CODE =
  String(process.env.SYSTEM_DEFAULT_COUNTRY_CODE || '+91').trim() || '+91';

const DEFAULT_BHK_VALUES = ['1', '2', '3', '4', '5'];
const DEFAULT_AREA_SUGGESTIONS = [
  'South Mumbai',
  'Bandra West',
  'Juhu',
  'Worli',
  'Andheri West',
  'Powai',
];

const PROPERTY_TYPE_OPTIONS = ['buy', 'rent', 'commercial', 'new_launch'];
const STATUS_OPTIONS = ['pending', 'approved', 'rejected'];
const FURNISHING_OPTIONS = ['unfurnished', 'semi_furnished', 'furnished'];

const BASE_CONFIG = {
  city: DEFAULT_CITY,
  locale: DEFAULT_LOCALE,
  currency: DEFAULT_CURRENCY,
  defaultCountryCode: DEFAULT_COUNTRY_CODE,
  areas: DEFAULT_AREA_SUGGESTIONS,
  bhkValues: DEFAULT_BHK_VALUES,
  amenityList: [],
  propertyTypes: PROPERTY_TYPE_OPTIONS,
  statusOptions: STATUS_OPTIONS,
  furnishingOptions: FURNISHING_OPTIONS,
  allowDynamicAreas: true,
  allowDynamicAmenities: true,
};

const normalizeStringList = (list = []) =>
  Array.from(
    new Set(
      list
        .map((item) => String(item || '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

const getSystemConfigRecord = async () => {
  let config = await SystemConfig.findOne({ key: 'global' }).lean();

  if (!config) {
    config = await SystemConfig.findOneAndUpdate(
      { key: 'global' },
      {
        $setOnInsert: {
          key: 'global',
          ...BASE_CONFIG,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    ).lean();
  }

  return {
    ...BASE_CONFIG,
    ...(config || {}),
    areas: normalizeStringList(config?.areas || BASE_CONFIG.areas),
    bhkValues: normalizeStringList(config?.bhkValues || BASE_CONFIG.bhkValues),
    amenityList: normalizeStringList(config?.amenityList || BASE_CONFIG.amenityList),
    propertyTypes: normalizeStringList(config?.propertyTypes || BASE_CONFIG.propertyTypes),
    statusOptions: normalizeStringList(config?.statusOptions || BASE_CONFIG.statusOptions),
    furnishingOptions: normalizeStringList(config?.furnishingOptions || BASE_CONFIG.furnishingOptions),
  };
};

const getConfig = async (req, res, next) => {
  try {
    const config = await getSystemConfigRecord();

    return sendSuccess(res, 200, 'System config fetched', {
      city: config.city,
      locale: config.locale,
      currency: config.currency,
      defaultCountryCode: config.defaultCountryCode,
    });
  } catch (err) {
    next(err);
  }
};

const getAreas = async (req, res, next) => {
  try {
    const config = await getSystemConfigRecord();
    const city = String(req.query.city || '').trim();
    const filter = {
      isActive: true,
      status: 'approved',
    };

    if (city) {
      filter['location.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const distinctAreas = await Property.distinct('location.area', filter);
    const dynamicAreas = normalizeStringList(distinctAreas);
    const configuredAreas = normalizeStringList(config.areas);

    const areas = config.allowDynamicAreas
      ? normalizeStringList([...configuredAreas, ...dynamicAreas])
      : configuredAreas;

    return sendSuccess(
      res,
      200,
      'System areas fetched',
      areas.length > 0 ? areas : DEFAULT_AREA_SUGGESTIONS
    );
  } catch (err) {
    next(err);
  }
};

const getOptions = async (req, res, next) => {
  try {
    const config = await getSystemConfigRecord();
    const baseFilter = {
      isActive: true,
      status: 'approved',
    };

    const [distinctBhk, distinctAmenities] = await Promise.all([
      Property.distinct('bhk', {
        ...baseFilter,
        bhk: { $ne: null },
      }),
      Property.distinct('amenities', baseFilter),
    ]);

    const bhkValues = distinctBhk
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a - b)
      .map((value) => String(value));

    const amenityList = normalizeStringList(distinctAmenities);

    const resolvedAmenities = config.allowDynamicAmenities
      ? normalizeStringList([...(config.amenityList || []), ...amenityList])
      : normalizeStringList(config.amenityList || []);

    const resolvedBhkValues = normalizeStringList(config.bhkValues || []);
    const resolvedPropertyTypes = normalizeStringList(config.propertyTypes || []);
    const resolvedStatusOptions = normalizeStringList(config.statusOptions || []);
    const resolvedFurnishingOptions = normalizeStringList(config.furnishingOptions || []);

    return sendSuccess(res, 200, 'System options fetched', {
      bhkValues:
        resolvedBhkValues.length > 0
          ? resolvedBhkValues
          : bhkValues.length > 0
            ? bhkValues
            : DEFAULT_BHK_VALUES,
      amenityList: resolvedAmenities,
      propertyTypes:
        resolvedPropertyTypes.length > 0 ? resolvedPropertyTypes : PROPERTY_TYPE_OPTIONS,
      statusOptions:
        resolvedStatusOptions.length > 0 ? resolvedStatusOptions : STATUS_OPTIONS,
      furnishingOptions:
        resolvedFurnishingOptions.length > 0
          ? resolvedFurnishingOptions
          : FURNISHING_OPTIONS,
    });
  } catch (err) {
    next(err);
  }
};

const getAdminConfig = async (req, res, next) => {
  try {
    const config = await getSystemConfigRecord();
    return sendSuccess(res, 200, 'System admin config fetched', config);
  } catch (err) {
    next(err);
  }
};

const upsertConfig = async (req, res, next) => {
  try {
    const updates = {
      ...BASE_CONFIG,
      ...req.body,
    };

    const config = await SystemConfig.findOneAndUpdate(
      { key: 'global' },
      {
        $set: updates,
        $setOnInsert: {
          key: 'global',
        },
      },
      {
        upsert: true,
        runValidators: true,
        returnDocument: 'after',
      }
    ).lean();

    return sendSuccess(res, 200, 'System config updated', {
      ...BASE_CONFIG,
      ...(config || {}),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getConfig,
  getAreas,
  getOptions,
  getAdminConfig,
  upsertConfig,
};
import { formatPriceShort } from '@/lib/mappers/formatters';

const compactMultiplier = {
  cr: 10000000,
  crore: 10000000,
  crores: 10000000,
  lac: 100000,
  lakh: 100000,
  lakhs: 100000,
};

const asNonEmptyString = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed || '';
};

const getMediaUrl = (value) => {
  if (typeof value === 'string') return asNonEmptyString(value);
  if (value && typeof value === 'object') {
    if (typeof value.url === 'string') return asNonEmptyString(value.url);
    if (typeof value.secure_url === 'string') return asNonEmptyString(value.secure_url);
  }
  return '';
};

const parseNumberLoose = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const input = asNonEmptyString(value);
  if (!input) return null;

  const compactMatch = input.toLowerCase().match(/([\d,.]+)\s*(cr|crore|crores|lac|lakh|lakhs)\b/);
  if (compactMatch) {
    const amount = Number(compactMatch[1].replace(/,/g, ''));
    const multiplier = compactMultiplier[compactMatch[2]];
    if (Number.isFinite(amount) && Number.isFinite(multiplier)) {
      return Math.round(amount * multiplier);
    }
  }

  const numeric = Number(input.replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
};

const getPriceValue = (property = {}) => {
  const isRent = property?.category === 'rent' || property?.raw?.category === 'rent';

  if (isRent) {
    const rentCandidates = [
      property?.rentPerMonth,
      property?.raw?.rentPerMonth,
      property?.rent,
      property?.raw?.rent,
      property?.priceUnit === 'per_month' ? property?.price : null,
      property?.raw?.priceUnit === 'per_month' ? property?.raw?.price : null,
    ];

    for (const candidate of rentCandidates) {
      const parsed = parseNumberLoose(candidate);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }

  const candidates = [
    property?.price,
    property?.priceValue,
    property?.amount,
    property?.raw?.price,
  ];

  for (const candidate of candidates) {
    const parsed = parseNumberLoose(candidate);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return 0;
};

const getAreaValue = (property = {}) => {
  const candidates = [
    property?.totalArea,
    property?.raw?.totalArea,
    property?.areaSqft,
    property?.raw?.areaSqft,
    property?.superArea,
    property?.builtArea,
    property?.carpetArea,
    property?.area,
  ];

  for (const candidate of candidates) {
    const parsed = parseNumberLoose(candidate);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return null;
};

const formatAreaValue = (property = {}) => {
  const areaValue = getAreaValue(property);
  return areaValue ? Number(areaValue).toLocaleString('en-IN') : 'N/A';
};

const collectMediaUrls = (...collections) => {
  const urls = [];
  const seen = new Set();

  collections.forEach((collection) => {
    if (!collection) return;

    const values = Array.isArray(collection) ? collection : [collection];
    values.forEach((item) => {
      const url = getMediaUrl(item);
      if (!url || seen.has(url)) return;
      seen.add(url);
      urls.push(url);
    });
  });

  return urls;
};

const getPropertyImage = (property) => {
  const [primary] = collectMediaUrls(
    property?.heroImage,
    property?.gallery,
    property?.images,
    property?.image,
    property?.featuredImage,
    property?.coverImage
  );
  return primary || null;
};

const getPriceSuffix = (priceUnit) => {
  if (priceUnit === 'per_sqft') return '/sq.ft';
  if (priceUnit === 'per_month') return '/month';
  return '';
};

const getFormattedPriceValue = (value) => formatPriceShort(value);

const deriveBhkDisplay = (property) => {
  const bhkCandidates = [
    property?.bhk,
    property?.configuration,
    property?.propertyType,
  ];

  for (const candidate of bhkCandidates) {
    const parsed = parseNumberLoose(candidate);
    if (Number.isFinite(parsed) && parsed > 0) {
      return String(Math.floor(parsed));
    }
  }

  const titleMatch = String(property?.title || '').match(/(\d+)\s*\+?\s*bhk/i);
  if (titleMatch?.[1]) return titleMatch[1];

  return '-';
};

const formatAvailableFrom = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
};

const getPossessionLabel = (property = {}) => {
  const isRent = property?.category === 'rent';
  const possession = property?.possession || property?.possessionStatus || '';
  const availableFrom = property?.availableFrom;

  if (isRent) {
    if (possession === 'Available Now' || possession === 'Ready to Move') return 'Available Now';
    if (possession === 'Available Soon' || possession === 'Under Construction') {
      const formattedDate = formatAvailableFrom(availableFrom);
      return formattedDate ? `Available from ${formattedDate}` : 'Available Soon';
    }
    return possession || 'Contact Owner';
  }

  return possession || 'Ready to Move';
};

const getFurnishingLabel = (furnishing) => {
  if (!furnishing) return 'N/A';

  const map = {
    unfurnished: 'Unfurnished',
    semi_furnished: 'Semi Furnished',
    furnished: 'Furnished',
  };

  return map[furnishing] || String(furnishing);
};

const normalizeFeatureBullets = (property) => {
  if (Array.isArray(property?.feature) && property.feature.length > 0) {
    return property.feature.filter(Boolean).map((item) => String(item));
  }

  if (typeof property?.feature === 'string' && property.feature.trim()) {
    return [property.feature.trim()];
  }

  if (Array.isArray(property?.highlights) && property.highlights.length > 0) {
    return property.highlights
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          return item.value || item.label || '';
        }
        return '';
      })
      .filter(Boolean)
      .slice(0, 7);
  }

  return [];
};

const mapBuilderToVM = (builder) => {
  if (!builder) return null;

  const currentYear = new Date().getFullYear();
  const establishedYear = Number(builder?.establishedYear);
  const totalProjects = Number(builder?.totalProjects);

  const experience =
    Number.isFinite(establishedYear) && establishedYear > 1900 && establishedYear <= currentYear
      ? `${currentYear - establishedYear}+ yrs`
      : 'Established Brand';

  return {
    id: builder?._id || builder?.id || null,
    slug: builder?.slug || '',
    name: builder?.name || 'Builder',
    logo: builder?.logo?.url || builder?.logo || null,
    description:
      builder?.shortDescription ||
      builder?.description ||
      'Project delivered by a trusted Mumbai developer.',
    projects: Number.isFinite(totalProjects) && totalProjects > 0 ? totalProjects : 'Multiple',
    experience,
  };
};

const normalizeHighlightsVM = (property = {}) =>
  (property?.highlights || []).map((item) => {
    if (typeof item === 'object' && item) return item;
    return {
      icon: 'check_circle',
      label: 'Highlight',
      value: String(item),
    };
  });

const normalizeAmenitiesVM = (property = {}) =>
  (property?.amenities || []).map((item) => {
    if (typeof item === 'object' && item) return item;
    return {
      icon: 'done',
      label: String(item),
    };
  });

const ensureCompareHighlights = (property = {}, highlights = []) => {
  const next = [...highlights];

  const isRentCategory = property?.category === 'rent';
  const possessionLabel = isRentCategory ? 'Availability' : 'Possession';
  const hasPossession = next.some((item) => item?.label === 'Possession' || item?.label === 'Availability');
  if (!hasPossession) {
    const possessionValue = getPossessionLabel(property) || 'Not Provided';
    next.push({
      icon: 'calendar_month',
      label: possessionLabel,
      value: String(possessionValue),
    });
  }

  const hasFurnishing = next.some((item) => item?.label === 'Furnishing');
  if (!hasFurnishing) {
    next.push({
      icon: 'chair',
      label: 'Furnishing',
      value: getFurnishingLabel(property?.furnishing),
    });
  }

  return next;
};

const buildLocation = (locationObj) => {
  const area = (locationObj?.area || '').trim();
  const city = (locationObj?.city || '').trim();
  if (!area) return city;
  if (!city) return area;
  if (area.toLowerCase().includes(city.toLowerCase())) return area;
  return `${area}, ${city}`;
};

export const mapPropertyToCardVM = (property) => {
  const priceValue = getPriceValue(property);

  return {
    id: property?._id,
    slug: property?.slug,
    title: property?.title || '',
    location: buildLocation(property?.location),
    priceValue,
    price: priceValue > 0
      ? formatPriceShort(priceValue)
      : asNonEmptyString(property?.priceDisplay || property?.priceLabel),
    priceSuffix: getPriceSuffix(property?.priceUnit),
    bhk: deriveBhkDisplay(property),
    area: formatAreaValue(property),
    image: getPropertyImage(property),
    status: property?.status || '',
    isFeatured: Boolean(property?.isFeatured),
    feature: Array.isArray(property?.feature)
      ? property.feature[0] || ''
      : property?.feature || '',
    isNew: property?.category === 'new_launch',
    isVerified: Boolean(property?.reraNumber),
    savedCount: Number(property?.savedCount || 0),
    raw: property,
  };
};

export const mapPropertyToDetailVM = (property) => {
  const priceValue = getPriceValue(property);
  const location = buildLocation(property?.location);
  const category = property?.category || property?.raw?.category;
  const isRent = category === 'rent';

  const baseHighlights = normalizeHighlightsVM(property);
  const enrichedHighlights = [...baseHighlights];

  // Inject critical metrics if missing from highlights
  const hasLabel = (lbl) => enrichedHighlights.some(h => h.label?.toLowerCase() === lbl.toLowerCase());

  if (isRent) {
    if (!hasLabel('Maintenance') && (property?.maintenanceCharges || property?.raw?.maintenanceCharges)) {
      enrichedHighlights.unshift({ icon: 'handyman', label: 'Maintenance', value: `₹${Number(property?.maintenanceCharges || property?.raw?.maintenanceCharges).toLocaleString('en-IN')}/mo` });
    }
    if (!hasLabel('Security Deposit') && (property?.deposit || property?.raw?.deposit)) {
      enrichedHighlights.unshift({ icon: 'account_balance_wallet', label: 'Security Deposit', value: `₹${Number(property?.deposit || property?.raw?.deposit).toLocaleString('en-IN')}` });
    }
    if (!hasLabel('Monthly Rent') && (property?.rentPerMonth || property?.raw?.rentPerMonth || (isRent && priceValue > 0))) {
      const val = property?.rentPerMonth || property?.raw?.rentPerMonth || priceValue;
      enrichedHighlights.unshift({ icon: 'payments', label: 'Monthly Rent', value: `₹${Number(val).toLocaleString('en-IN')}` });
    }
  } else {
    if (!hasLabel('Price') && priceValue > 0) {
      enrichedHighlights.unshift({ icon: 'sell', label: 'Price', value: `₹${formatPriceShort(priceValue)}` });
    }
  }

  // 📅 Possession / Availability
  if (!hasLabel('Possession') && !hasLabel('Availability')) {
    const possessionLabel = getPossessionLabel(property);
    if (possessionLabel) {
      enrichedHighlights.push({ icon: 'calendar_month', label: isRent ? 'Availability' : 'Possession', value: possessionLabel });
    }
  }

  // 📐 Area Metrics (Prioritized)
  if (!hasLabel('Total Area') && (property?.totalArea || property?.raw?.totalArea || property?.areaSqft || property?.raw?.areaSqft || getAreaValue(property))) {
    const val = property?.totalArea || property?.raw?.totalArea || property?.areaSqft || property?.raw?.areaSqft || getAreaValue(property);
    enrichedHighlights.unshift({ icon: 'square_foot', label: 'Total Area', value: `${Number(val).toLocaleString('en-IN')} sq.ft` });
  }
  if (!hasLabel('Carpet Area') && (property?.carpetArea || property?.raw?.carpetArea)) {
    const val = property?.carpetArea || property?.raw?.carpetArea;
    enrichedHighlights.unshift({ icon: 'architecture', label: 'Carpet Area', value: `${Number(val).toLocaleString('en-IN')} sq.ft` });
  }

  return {
    id: property?._id,
    slug: property?.slug,
    title: property?.title || '',
    description: property?.description || '',
    longDescription: property?.description || '',
    location,
    priceValue,
    price: priceValue > 0
      ? formatPriceShort(priceValue)
      : asNonEmptyString(property?.priceDisplay || property?.priceLabel),
    priceSuffix: getPriceSuffix(property?.priceUnit) || (isRent ? '/month' : 'Price'),
    bhk: deriveBhkDisplay(property),
    area: formatAreaValue(property),
    image: getPropertyImage(property),
    gallery: collectMediaUrls(property?.heroImage, property?.gallery, property?.images),
    feature: normalizeFeatureBullets(property),
    reraNumber: property?.reraNumber || property?.rera?.number || '',
    reraUrl: property?.reraUrl || property?.rera?.url || '',
    floorPlans: collectMediaUrls(property?.floorPlans),
    brochureUrl: getMediaUrl(property?.brochure) || asNonEmptyString(property?.brochureUrl),
    highlights: enrichedHighlights,
    amenities: normalizeAmenitiesVM(property),
    neighborhood: {
      location,
      highlights: [],
    },
    builder: mapBuilderToVM(property?.builder),
    rentPerMonth: property?.rentPerMonth || property?.raw?.rentPerMonth,
    deposit: property?.deposit || property?.raw?.deposit,
    maintenanceCharges: property?.maintenanceCharges || property?.raw?.maintenanceCharges,
    possession: getPossessionLabel(property),
    availableFrom: property?.availableFrom || null,
    category,
    raw: property,
  };
};

export const mapPropertyToCompareVM = (property) => {
  const card = mapPropertyToCardVM(property);
  const highlights = ensureCompareHighlights(property, normalizeHighlightsVM(property));
  const amenities = normalizeAmenitiesVM(property);

  return {
    ...card,
    highlights,
    amenities,
    builder: mapBuilderToVM(property?.builder) || {
      id: null,
      slug: '',
      name: 'Builder',
      logo: null,
      description: 'Builder information will be shared on request.',
      projects: 'Multiple',
      experience: 'Established Brand',
    },
    raw: property,
  };
};

export const mapPropertyListToCardVM = (properties = []) =>
  properties.map(mapPropertyToCardVM);

export const mapPropertyListToCompareVM = (properties = []) =>
  properties.map(mapPropertyToCompareVM);

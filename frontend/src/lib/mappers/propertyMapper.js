import { formatCurrencyINR } from '@/lib/mappers/formatters';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?auto=format&fit=crop&w=1200&q=80';

const getPropertyImage = (property) => {
  if (property?.heroImage?.url) return property.heroImage.url;
  if (Array.isArray(property?.gallery) && property.gallery[0]?.url) return property.gallery[0].url;
  return FALLBACK_IMAGE;
};

const getPriceSuffix = (priceUnit) => {
  if (priceUnit === 'per_sqft') return '/sq.ft';
  if (priceUnit === 'per_month') return '/month';
  return '';
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

export const mapPropertyToCardVM = (property) => ({
  id: property?._id,
  slug: property?.slug,
  title: property?.title || '',
  location: [property?.location?.area, property?.location?.city].filter(Boolean).join(', '),
  priceValue: Number(property?.price || 0),
  price: formatCurrencyINR(property?.price || 0).replace('INR', '').trim(),
  priceSuffix: getPriceSuffix(property?.priceUnit),
  bhk: property?.bhk || '-',
  area: property?.areaSqft ? Number(property.areaSqft).toLocaleString('en-IN') : 'N/A',
  image: getPropertyImage(property),
  isFeatured: Boolean(property?.isFeatured),
  feature: Array.isArray(property?.feature)
    ? property.feature[0] || ''
    : property?.feature || '',
  isNew: property?.category === 'new_launch',
  isVerified: Boolean(property?.reraNumber),
  savedCount: Number(property?.savedCount || 0),
  raw: property,
});

export const mapPropertyToDetailVM = (property) => ({
  id: property?._id,
  slug: property?.slug,
  title: property?.title || '',
  description: property?.description || '',
  longDescription: property?.description || '',
  location: [property?.location?.area, property?.location?.city].filter(Boolean).join(', '),
  price: formatCurrencyINR(property?.price || 0).replace('INR', '').trim(),
  priceSuffix: getPriceSuffix(property?.priceUnit) || 'Price',
  bhk: property?.bhk || '-',
  area: property?.areaSqft ? Number(property.areaSqft).toLocaleString('en-IN') : 'N/A',
  image: getPropertyImage(property),
  gallery: [property?.heroImage, ...(property?.gallery || [])]
    .map((media) => media?.url)
    .filter(Boolean),
  feature: normalizeFeatureBullets(property),
  reraUrl: property?.reraUrl || '',
  highlights: (property?.highlights || []).map((item) => {
    if (typeof item === 'object' && item) return item;
    return {
      icon: 'check_circle',
      label: 'Highlight',
      value: String(item),
    };
  }),
  amenities: (property?.amenities || []).map((item) => {
    if (typeof item === 'object' && item) return item;
    return {
      icon: 'done',
      label: String(item),
    };
  }),
  neighborhood: {
    location: [property?.location?.area, property?.location?.city].filter(Boolean).join(', '),
    highlights: [],
  },
  builder: mapBuilderToVM(property?.builder),
  raw: property,
});

export const mapPropertyListToCardVM = (properties = []) =>
  properties.map(mapPropertyToCardVM);

import { formatCurrencyINR } from '@/lib/mappers/formatters';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80';
const FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80';

const normalizeDescription = (value, fallback = []) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return fallback;
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const formatProjects = (count) => {
  const value = Number(count);
  if (Number.isFinite(value) && value >= 0) return value;
  return 0;
};

const getLeadTagline = (builder) =>
  builder?.shortDescription ||
  builder?.description ||
  'Trusted real estate developer with an active portfolio in Mumbai.';

const mapMediaUrl = (media, fallback) => {
  if (typeof media === 'string' && media.trim()) return media;
  if (media?.url && typeof media.url === 'string') return media.url;
  return fallback;
};

const mapFaqs = (faqs) =>
  normalizeArray(faqs)
    .map((faq, index) => ({
      id: `${index}`,
      question: String(faq?.question || '').trim(),
      answer: String(faq?.answer || '').trim(),
    }))
    .filter((faq) => faq.question && faq.answer);

const mapTestimonials = (testimonials) =>
  normalizeArray(testimonials)
    .map((item, index) => ({
      id: item?._id || `${index}`,
      author: String(item?.author || '').trim(),
      role: String(item?.role || 'Resident').trim(),
      content: String(item?.content || '').trim(),
      rating: Number(item?.rating || 5),
      avatar: item?.avatar || FALLBACK_THUMBNAIL,
    }))
    .filter((item) => item.author && item.content);

const mapFeaturedImages = (builder) => {
  const images = normalizeArray(builder?.featuredImages)
    .map((image) => mapMediaUrl(image, ''))
    .filter(Boolean);

  if (images.length > 0) return images.slice(0, 4);

  const fallback = mapMediaUrl(builder?.coverImage, FALLBACK_THUMBNAIL);
  return [fallback];
};

const mapBuilderBase = (builder = {}) => {
  const totalProjects = formatProjects(builder.totalProjects);

  return {
    id: builder?._id || builder?.id || null,
    slug: builder?.slug || '',
    name: builder?.name || 'Builder',
    logo: mapMediaUrl(builder?.logo, ''),
    heroImage: mapMediaUrl(builder?.coverImage, FALLBACK_COVER),
    thumbnail: mapMediaUrl(builder?.coverImage, FALLBACK_THUMBNAIL),
    establishedYear: builder?.establishedYear || 'N/A',
    totalProjects,
    projectCount: totalProjects,
    hqLocation: builder?.headquarters || 'Mumbai',
    tagline: getLeadTagline(builder),
    tier: builder?.isFeatured ? 'Featured Builder' : '',
    isFeatured: Boolean(builder?.isFeatured),
    description: normalizeDescription(builder?.description, [getLeadTagline(builder)]),
    aboutHeadline: builder?.aboutHeadline || `About ${builder?.name || 'This Builder'}`,
    qualityStandards: builder?.qualityStandards || 'RERA-aligned project governance',
    innovation: builder?.innovation || 'Urban planning and execution expertise',
    featuredImages: mapFeaturedImages(builder),
    testimonials: mapTestimonials(builder?.testimonials),
    faqs: mapFaqs(builder?.faqs),
    ongoingProjects: Number.isFinite(Number(builder?.ongoingProjects))
      ? Number(builder.ongoingProjects)
      : null,
    completedDeliveries: Number.isFinite(Number(builder?.completedDeliveries))
      ? Number(builder.completedDeliveries)
      : null,
    raw: builder,
  };
};

export const mapBuilderToCardVM = (builder = {}) => mapBuilderBase(builder);

export const mapBuilderListToCardVM = (builders = []) =>
  (builders || []).map(mapBuilderToCardVM);

export const mapBuilderPropertyToPortfolioVM = (property = {}) => {
  const priceValue = Number(property?.price || 0);
  const price = priceValue > 0 ? formatCurrencyINR(priceValue).replace('INR', '').trim() : 'Price on request';
  const bhk = property?.bhk ? `${property.bhk} BHK` : 'Configuration on request';

  return {
    id: property?._id || property?.id || null,
    slug: property?.slug || '',
    title: property?.title || 'Untitled Property',
    image: mapMediaUrl(property?.heroImage, FALLBACK_THUMBNAIL),
    status: property?.category ? String(property.category).replace('_', ' ') : 'Available',
    price,
    location: property?.location?.area || 'Mumbai',
    type: bhk,
    availability: property?.priceUnit === 'per_month' ? 'Rental' : 'For Sale',
    raw: property,
  };
};

export const mapBuilderToDetailVM = (builder = {}, properties = []) => {
  const base = mapBuilderBase(builder);
  const detailDescription = normalizeDescription(builder?.description, base.description);

  return {
    ...base,
    description: detailDescription,
    portfolio: (properties || []).map(mapBuilderPropertyToPortfolioVM),
  };
};

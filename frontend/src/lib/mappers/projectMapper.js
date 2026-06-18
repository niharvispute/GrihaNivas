import { formatPriceShort } from '@/lib/mappers/formatters';

const asNonEmptyString = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed || '';
};

const getMediaUrl = (value) => {
  if (typeof value === 'string') return asNonEmptyString(value);
  if (value && typeof value === 'object') {
    if (typeof value.url === 'string') return asNonEmptyString(value.url);
  }
  return '';
};

const getMediaUrls = (collection) => {
  if (!Array.isArray(collection)) return [];
  return collection.map(getMediaUrl).filter(Boolean);
};

const buildLocation = (locationObj) => {
  const area = (locationObj?.area || '').trim();
  const city = (locationObj?.city || '').trim();
  if (!area) return city;
  if (!city) return area;
  if (area.toLowerCase().includes(city.toLowerCase())) return area;
  return `${area}, ${city}`;
};

const PROJECT_STATUS_LABEL = {
  new_launch: 'New Launch',
  under_construction: 'Under Construction',
  ready_to_move: 'Ready To Move',
};

export const projectStatusLabel = (status) => PROJECT_STATUS_LABEL[status] || status || '';

const formatDateLabel = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

const mapBuilderForProject = (builder) => {
  if (!builder || typeof builder !== 'object') return null;

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
    logo: getMediaUrl(builder?.logo) || null,
    description: builder?.shortDescription || builder?.description || 'Project delivered by a trusted Mumbai developer.',
    projects: Number.isFinite(totalProjects) && totalProjects > 0 ? totalProjects : 'Multiple',
    experience,
    reraNumber: builder?.reraNumber || '',
    reraUrl: builder?.reraUrl || '',
    headquarters: builder?.headquarters || '',
    website: builder?.website || '',
  };
};

export const mapProjectToCardVM = (project = {}) => {
  const priceMin = Number(project?.priceMin) || 0;
  const priceMax = Number(project?.priceMax) || 0;
  const builder = typeof project?.builderId === 'object' ? project.builderId : null;

  return {
    type: 'project',
    id: project?._id,
    slug: project?.slug || '',
    name: project?.name || '',
    title: project?.name || '',
    builderName: builder?.name || project?.builderName || '',
    location: buildLocation(project?.location),
    priceMin,
    priceMax,
    startingPrice: priceMin > 0 ? formatPriceShort(priceMin) : '',
    bhkSummary: Array.isArray(project?.bhkSummary) ? project.bhkSummary : [],
    projectStatus: project?.projectStatus || '',
    projectStatusLabel: projectStatusLabel(project?.projectStatus),
    image: getMediaUrl(project?.heroImage),
    isFeatured: Boolean(project?.isFeatured),
    reraNumber: project?.reraNumber || '',
    raw: project,
  };
};

export const mapProjectListToCardVM = (projects = []) => (projects || []).map(mapProjectToCardVM);

const mapConfigurationVM = (config = {}) => ({
  id: config?._id,
  bhkType: config?.bhkType || '',
  title: config?.title || config?.bhkType || '',
  description: config?.description || '',
  priceMin: Number(config?.priceMin) || 0,
  priceMax: Number(config?.priceMax) || 0,
  carpetAreaMin: config?.carpetAreaMin ?? null,
  carpetAreaMax: config?.carpetAreaMax ?? null,
  builtupAreaMin: config?.builtupAreaMin ?? null,
  builtupAreaMax: config?.builtupAreaMax ?? null,
  bathrooms: config?.bathrooms ?? null,
  balconies: config?.balconies ?? null,
  parking: config?.parking ?? 0,
  floorPlans: getMediaUrls(config?.floorPlans),
  gallery: getMediaUrls(config?.gallery),
  totalUnits: config?.totalUnits ?? null,
  availableUnits: config?.availableUnits ?? null,
});

export const mapProjectToDetailVM = (project = {}) => {
  const builder = typeof project?.builderId === 'object' ? project.builderId : null;
  const configurations = Array.isArray(project?.configurations)
    ? project.configurations.map(mapConfigurationVM)
    : [];

  const floorPlans = configurations.flatMap((c) => c.floorPlans);

  return {
    id: project?._id,
    slug: project?.slug || '',
    name: project?.name || '',
    title: project?.name || '',
    description: project?.description || '',
    shortDescription: project?.shortDescription || '',
    location: buildLocation(project?.location),
    locationDetail: project?.location || {},
    projectType: project?.projectType || '',
    projectStatus: project?.projectStatus || '',
    projectStatusLabel: projectStatusLabel(project?.projectStatus),
    reraNumber: project?.reraNumber || '',
    reraUrl: project?.reraUrl || '',
    possessionLabel: formatDateLabel(project?.possessionDate),
    launchLabel: formatDateLabel(project?.launchDate),
    totalTowers: project?.totalTowers ?? null,
    totalFloors: project?.totalFloors ?? null,
    totalUnits: project?.totalUnits ?? null,
    landArea: project?.landArea ?? null,
    priceMin: Number(project?.priceMin) || 0,
    priceMax: Number(project?.priceMax) || 0,
    areaMin: project?.areaMin ?? null,
    areaMax: project?.areaMax ?? null,
    bhkSummary: Array.isArray(project?.bhkSummary) ? project.bhkSummary : [],
    image: getMediaUrl(project?.heroImage),
    gallery: getMediaUrls(project?.gallery),
    masterPlanUrl: getMediaUrl(project?.masterPlan),
    brochureUrl: getMediaUrl(project?.brochure),
    videoUrl: project?.videoUrl || '',
    amenities: Array.isArray(project?.amenities) ? project.amenities : [],
    configurations,
    floorPlans,
    builder: mapBuilderForProject(builder),
    contactPerson: project?.contactPerson || '',
    contactPhone: project?.contactPhone || '',
    enablePriceRequest: project?.enablePriceRequest !== false,
    enableCallback: project?.enableCallback !== false,
    enableBrochureDownload: project?.enableBrochureDownload !== false,
    enableSiteVisit: project?.enableSiteVisit !== false,
    seoTitle: project?.seoTitle || '',
    seoDescription: project?.seoDescription || '',
    raw: project,
  };
};

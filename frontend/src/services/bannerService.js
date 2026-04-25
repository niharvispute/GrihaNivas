import { apiFetch } from '@/lib/api';
import { authedApiFetch } from '@/lib/api/authedRequest';

const POSITION_LABELS = {
  home_hero: 'Hero Banner',
  home_secondary: 'Home Banner 2',
  listing_sidebar: 'Listing Sidebar Banner',
  blog_sidebar: 'Blog Sidebar Banner',
};

const toLastUpdatedText = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const mapBannerToAdminVM = (banner) => ({
  id: banner?._id,
  position: banner?.position || '',
  title: banner?.title || POSITION_LABELS[banner?.position] || 'Banner',
  description: banner?.position ? `Placement: ${banner.position}` : 'Promotional banner slot',
  status: banner?.isActive ? 'Live' : 'Inactive',
  image: banner?.image?.url || '',
  lastUpdated: toLastUpdatedText(banner?.updatedAt),
  recommendedSize: '1920x600px',
  raw: banner,
});

/**
 * Fetch all banner slots and their current configurations.
 */
export const listBanners = async () => {
  try {
    const res = await apiFetch('/api/banners');
    return Array.isArray(res.data) ? res.data.map(mapBannerToAdminVM) : [];
  } catch {
    return [];
  }
};

/**
 * Update a specific banner slot configuration.
 */
export const updateBanner = async (id, data) => {
  const res = await authedApiFetch(`/api/banners/${id}`, {
    method: 'PUT',
    body: data,
  });
  return res.data;
};

/**
 * Upload a banner image asset.
 */
export const uploadBannerImage = async (formData) => {
  const res = await authedApiFetch('/api/banners', {
    method: 'POST',
    body: formData,
  });
  return res.data;
};
